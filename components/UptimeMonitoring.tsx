import React, { useState, useEffect } from 'react';
import {
    Shield,
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Play,
    Square,
    Edit2,
    Zap,
    LayoutDashboard,
    Signal,
    Globe
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { uptimeService } from '../services/uptimeService';
import { UptimeLog, UptimeSettings } from '../types';

const UptimeMonitoring: React.FC = () => {
    const [settings, setSettings] = useState<UptimeSettings | null>(null);
    const [logs, setLogs] = useState<UptimeLog[]>([]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editUrl, setEditUrl] = useState('');
    const [editInterval, setEditInterval] = useState(30);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        let interval: any;
        if (isMonitoring && settings) {
            interval = setInterval(() => {
                performCheck();
            }, settings.check_interval_seconds * 1000);
        }
        return () => clearInterval(interval);
    }, [isMonitoring, settings]);

    const fetchInitialData = async () => {
        const [s, l] = await Promise.all([
            uptimeService.getSettings(),
            uptimeService.getLogs(50)
        ]);
        setSettings(s);
        setLogs(l);
        if (s) {
            setEditUrl(s.target_url);
            setEditInterval(s.check_interval_seconds);
        }
    };

    const performCheck = async () => {
        if (!settings) return;

        try {
            const startTime = performance.now();

            let success = true;
            let status: number | null = 200;
            let errorMsg: string | null = null;

            try {
                const response = await fetch(settings.target_url, { mode: 'no-cors' });
                status = response.status || 200;
            } catch (e: any) {
                success = false;
                status = null;
                errorMsg = e.message;
            }

            const responseTime = Math.round(performance.now() - startTime);
            const classifiedStatus = uptimeService.classifyStatus(success, status);
            const lastLog = logs[0] || null;
            const incidentInfo = uptimeService.detectIncidentState(classifiedStatus, lastLog);

            const downtimeDuration = incidentInfo.state === 'RECOVERED' ? uptimeService.calculateDowntime(logs) : undefined;

            const message = uptimeService.generateMessage(
                settings.target_url,
                classifiedStatus,
                incidentInfo.state,
                new Date().toISOString(),
                downtimeDuration
            );

            const newLog: Omit<UptimeLog, 'id'> = {
                timestamp: new Date().toISOString(),
                http_status: status,
                response_time_ms: responseTime,
                success,
                error_message: errorMsg,
                status: classifiedStatus,
                incident_state: incidentInfo.state,
                alert_required: incidentInfo.alertRequired,
                recovery_notice: incidentInfo.recoveryNotice,
                message,
                summary: `Check performed for ${settings.target_url}. Result: ${classifiedStatus}.`
            };

            const savedLog = await uptimeService.saveLog(newLog);
            if (savedLog) {
                setLogs(prev => [savedLog, ...prev]);
            }
        } catch (err) {
            console.error('Check failed:', err);
        }
    };

    const currentStatus = logs[0]?.status || 'IDLE';
    const uptimeScore = logs.length > 0
        ? ((logs.filter(l => l.status === 'UP').length / logs.length) * 100).toFixed(2)
        : "100.00";
    const avgLatency = logs.length > 0
        ? Math.round(logs.reduce((acc, curr) => acc + (curr.response_time_ms || 0), 0) / logs.length)
        : 0;
    const incidentCount = logs.filter(l => l.incident_state === 'NEW INCIDENT').length;

    const handleToggleMonitoring = () => {
        const nextState = !isMonitoring;
        setIsMonitoring(nextState);
        if (nextState) {
            // Trigger first check immediately instead of waiting 30s
            performCheck();
        }
    };

    const chartData = [...logs].reverse().map(l => ({
        time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: l.response_time_ms || 0,
        status: l.status
    }));

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 p-8 font-sans selection:bg-indigo-500/30"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #111 1px, transparent 0)', backgroundSize: '24px 24px' }}>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                            <Shield size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-black tracking-tight text-white uppercase">Tipsoi <span className="text-indigo-500">AI</span></h1>
                            </div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em] mt-1">Real-time Uptime Monitoring & Incident Intelligence</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-[#0a0a0a] p-2 rounded-2xl border border-white/5 shadow-2xl">
                        <div className="px-4 border-r border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Target</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-indigo-400 lowercase">{settings?.target_url || 'https://hrm.tipsoi.pro'}</span>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-1 hover:bg-white/5 rounded transition-colors text-slate-500"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleToggleMonitoring}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${isMonitoring
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20'
                                : 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-600'
                                }`}
                        >
                            {isMonitoring ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            {isMonitoring ? 'Stop' : 'Start'}
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Current Status"
                        value={isMonitoring ? currentStatus : 'IDLE'}
                        subValue={isMonitoring ? 'Monitoring active' : 'Ready to monitor'}
                        icon={<Signal size={20} />}
                        color={currentStatus === 'DOWN' ? 'text-rose-500' : isMonitoring ? 'text-emerald-500' : 'text-slate-500'}
                        bg="bg-white/5"
                    />
                    <StatCard
                        label="Uptime Score"
                        value={`${uptimeScore}%`}
                        subValue="Calculation based on current session"
                        icon={<Clock size={20} />}
                        color="text-indigo-400"
                        bg="bg-white/5"
                    />
                    <StatCard
                        label="Response Latency"
                        value={`${isMonitoring ? logs[0]?.response_time_ms || 0 : 0}ms`}
                        subValue={`Avg. successful pings: ${avgLatency}ms`}
                        icon={<Zap size={20} />}
                        color="text-amber-400"
                        bg="bg-white/5"
                    />
                    <StatCard
                        label="Total Incidents"
                        value={incidentCount.toString()}
                        subValue="Detected during session"
                        icon={<AlertTriangle size={20} />}
                        color="text-rose-400"
                        bg="bg-white/5"
                    />
                </div>

                {/* Editing Settings Modal-like */}
                {isEditing && (
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-white mb-4">Edit Target Configuration</h3>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Target URL</label>
                                <input
                                    type="text"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Interval (s)</label>
                                <input
                                    type="number"
                                    value={editInterval}
                                    onChange={(e) => setEditInterval(parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    if (settings) {
                                        await uptimeService.updateSettings({ id: settings.id, target_url: editUrl, check_interval_seconds: editInterval });
                                        setSettings({ ...settings, target_url: editUrl, check_interval_seconds: editInterval });
                                        setIsEditing(false);
                                    }
                                }}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Latency Chart */}
                    <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 shadow-2xl overflow-hidden relative group">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <Activity size={18} />
                                </div>
                                <h3 className="font-bold text-lg text-white">Response Latency <span className="text-slate-500 font-medium">(ms)</span></h3>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> UP</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> DOWN</div>
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
                                    <XAxis
                                        dataKey="time"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#444' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#444' }}
                                        unit="ms"
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="latency"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#latencyGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Website Preview Iframe */}
                        <div className="mt-8 border-t border-white/5 pt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Globe size={18} />
                                </div>
                                <h3 className="font-bold text-lg text-white">Live Preview</h3>
                            </div>
                            <div className="w-full h-[400px] bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden relative">
                                {isMonitoring ? (
                                    <>
                                        <iframe
                                            src={settings?.target_url}
                                            className="w-full h-full border-none bg-white"
                                            title="Website Preview"
                                        />
                                        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                                            <a
                                                href={settings?.target_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-indigo-600/90 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm transition-all flex items-center gap-2"
                                            >
                                                <Globe size={14} />
                                                Open Website
                                            </a>
                                            <p className="text-[10px] text-slate-500 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                                Note: Some sites block iframe previews for security (X-Frame-Options).
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center">
                                            <Play size={24} className="ml-1 opacity-20" />
                                        </div>
                                        <p className="text-sm font-medium">Click "Start" to see live preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Incident Feed */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] flex flex-col shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-white">Incident Feed</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time</span>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto max-h-[400px] scrollbar-hide space-y-4">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
                                    <CheckCircle2 size={64} className="mb-4 text-emerald-500/50" />
                                    <p className="text-sm font-medium">Clean session. No incidents found.</p>
                                </div>
                            ) : (
                                logs.map((log, idx) => (
                                    <div key={idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${log.incident_state === 'RECOVERED' ? 'text-emerald-500' :
                                                log.incident_state === 'NEW INCIDENT' ? 'text-rose-500' :
                                                    'text-slate-500'
                                                }`}>
                                                {log.incident_state === 'NONE' ? 'CHECK' : log.incident_state}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-600">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-snug">
                                            {log.message}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string, value: string, subValue: string, icon: React.ReactNode, color: string, bg: string }> = ({ label, value, subValue, icon, color, bg }) => (
    <div className={`${bg} border border-white/5 p-8 rounded-[2rem] shadow-xl hover:bg-white/[0.04] transition-all group`}>
        <div className={`w-12 h-12 rounded-2xl ${bg} border border-white/5 flex items-center justify-center ${color} mb-6 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="space-y-1">
            <h3 className={`text-3xl font-black ${color}`}>{value}</h3>
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">{subValue}</p>
        </div>
    </div>
);

export default UptimeMonitoring;
