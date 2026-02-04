import { supabase } from '../supabaseClient';
import { UptimeLog, UptimeSettings } from '../types';

export const uptimeService = {
    async getSettings(): Promise<UptimeSettings | null> {
        const { data, error } = await supabase
            .from('uptime_settings')
            .select('*')
            .single();
        if (error) {
            console.error('Error fetching uptime settings:', error);
            return null;
        }
        return data;
    },

    async updateSettings(settings: Partial<UptimeSettings>): Promise<void> {
        const { error } = await supabase
            .from('uptime_settings')
            .update(settings)
            .eq('id', settings.id);
        if (error) {
            console.error('Error updating uptime settings:', error);
            throw error;
        }
    },

    async getLogs(limit = 100): Promise<UptimeLog[]> {
        const { data, error } = await supabase
            .from('uptime_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);
        if (error) {
            console.error('Error fetching uptime logs:', error);
            return [];
        }
        return data || [];
    },

    async getLatestLog(): Promise<UptimeLog | null> {
        const { data, error } = await supabase
            .from('uptime_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 is no rows
            console.error('Error fetching latest uptime log:', error);
        }
        return data;
    },

    async saveLog(log: Omit<UptimeLog, 'id'>): Promise<UptimeLog | null> {
        const { data, error } = await supabase
            .from('uptime_logs')
            .insert([log])
            .select()
            .single();
        if (error) {
            console.error('Error saving uptime log:', error);
            throw error;
        }
        return data;
    },

    classifyStatus(success: boolean, httpStatus: number | null): 'UP' | 'DOWN' {
        if (success && httpStatus && httpStatus >= 200 && httpStatus < 400) {
            return 'UP';
        }
        return 'DOWN';
    },

    detectIncidentState(
        currentStatus: 'UP' | 'DOWN',
        lastLog: UptimeLog | null
    ): {
        state: 'NONE' | 'NEW INCIDENT' | 'ONGOING INCIDENT' | 'RECOVERED';
        alertRequired: boolean;
        recoveryNotice: boolean;
    } {
        const lastStatus = lastLog?.status || 'UP';

        if (currentStatus === 'DOWN' && lastStatus === 'UP') {
            return { state: 'NEW INCIDENT', alertRequired: true, recoveryNotice: false };
        }
        if (currentStatus === 'DOWN' && lastStatus === 'DOWN') {
            return { state: 'ONGOING INCIDENT', alertRequired: false, recoveryNotice: false };
        }
        if (currentStatus === 'UP' && lastStatus === 'DOWN') {
            return { state: 'RECOVERED', alertRequired: false, recoveryNotice: true };
        }
        return { state: 'NONE', alertRequired: false, recoveryNotice: false };
    },

    generateMessage(
        url: string,
        status: 'UP' | 'DOWN',
        incidentState: string,
        timestamp: string,
        downtimeDuration?: number
    ): string {
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (incidentState === 'NEW INCIDENT') {
            return `${url} is DOWN (no response). Incident started at ${time}.`;
        }
        if (incidentState === 'RECOVERED') {
            const durationText = downtimeDuration ? `${Math.round(downtimeDuration / 60)} minutes` : 'unknown duration';
            return `${url} has RECOVERED. Total downtime: ${durationText}.`;
        }
        if (status === 'UP') {
            return `${url} is UP and healthy.`;
        }
        return `${url} is currently DOWN.`;
    },

    calculateDowntime(logs: UptimeLog[]): number {
        // Logic to find the last continuous DOWN period
        let duration = 0;
        for (let i = 0; i < logs.length; i++) {
            if (logs[i].status === 'DOWN') {
                // Very simplified: approximate duration by counting logs * 30s
                // In a real app we'd compare timestamps
                duration += 30;
            } else if (i > 0) {
                break;
            }
        }
        return duration;
    }
};
