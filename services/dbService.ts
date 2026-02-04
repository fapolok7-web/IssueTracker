import { supabase } from '../supabaseClient';
import { Issue, MonthlyEntry, SystemDowntime, SettingItem } from '../types';

// Default initial settings to seed if database is empty
const INITIAL_SETTINGS: Omit<SettingItem, 'id' | 'created_at'>[] = [
  { category: 'issue_type', name: 'Software' },
  { category: 'issue_type', name: 'Device' },
  { category: 'issue_type', name: 'Awareness' },
  { category: 'issue_type', name: 'Help Request' },
  { category: 'priority', name: 'Low' },
  { category: 'priority', name: 'Medium' },
  { category: 'priority', name: 'High' },
  { category: 'status', name: 'Open' },
  { category: 'status', name: 'Close' },
  { category: 'status', name: 'Pending' },
  { category: 'status', name: 'In Progress' },
  { category: 'status', name: 'Done' },
  { category: 'assigned_person', name: 'Fuad' },
  { category: 'assigned_person', name: 'Rahat' },
  { category: 'assigned_person', name: 'Foysal' },
  { category: 'assigned_person', name: 'Taqi' },
  { category: 'assigned_person', name: 'Fariha' },
  { category: 'system_name', name: 'CS' },
  { category: 'system_name', name: 'HRM' },
  { category: 'system_name', name: 'APP' },
  { category: 'system_name', name: 'BEP' },
  { category: 'system_name', name: 'ALL WITHOUT BEP' },
];

export const dbService = {
  // Settings
  async getSettings(): Promise<SettingItem[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  async getSettingsByCategory(category: SettingItem['category']): Promise<SettingItem[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('category', category);
    if (error) throw error;
    return data || [];
  },

  async saveSetting(setting: Omit<SettingItem, 'id' | 'created_at'>): Promise<SettingItem> {
    const { data, error } = await supabase
      .from('settings')
      .insert([setting])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSetting(id: string, name: string): Promise<SettingItem> {
    const { data, error } = await supabase
      .from('settings')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSetting(id: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Issues
  async getIssues(): Promise<Issue[]> {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async saveIssue(issue: Omit<Issue, 'id' | 'created_at' | 'updated_at'>): Promise<Issue> {
    const { data, error } = await supabase
      .from('issues')
      .insert([issue])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue> {
    const { data, error } = await supabase
      .from('issues')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteIssue(id: string): Promise<void> {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async bulkDeleteIssues(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('issues')
      .delete()
      .in('id', ids);
    if (error) throw error;
  },

  async bulkSaveIssues(issues: Omit<Issue, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    const { error } = await supabase
      .from('issues')
      .insert(issues);
    if (error) throw error;
  },

  // Monthly Entries
  async getMonthlyEntries(): Promise<MonthlyEntry[]> {
    const { data, error } = await supabase
      .from('monthly_entries')
      .select('*')
      .order('month', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async saveMonthlyEntry(entry: Omit<MonthlyEntry, 'id' | 'created_at'>): Promise<MonthlyEntry> {
    const { data, error } = await supabase
      .from('monthly_entries')
      .insert([entry])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMonthlyEntry(id: string, updates: Partial<MonthlyEntry>): Promise<MonthlyEntry> {
    const { data, error } = await supabase
      .from('monthly_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMonthlyEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('monthly_entries')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // System Downtime
  async getDowntime(): Promise<SystemDowntime[]> {
    const { data, error } = await supabase
      .from('system_downtime')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async saveDowntime(entry: Omit<SystemDowntime, 'id' | 'created_at'>): Promise<SystemDowntime> {
    const { data, error } = await supabase
      .from('system_downtime')
      .insert([entry])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDowntime(id: string): Promise<void> {
    const { error } = await supabase
      .from('system_downtime')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
