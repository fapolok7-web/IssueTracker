
import { Issue, MonthlyEntry, SystemDowntime, SettingItem } from '../types';

// This service is built to be easily replaced with Supabase calls.
// For the purpose of this functional demo, it uses localStorage to ensure it works out of the box.

const getStored = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStored = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Default initial settings
const INITIAL_SETTINGS: Omit<SettingItem, 'id' | 'created_at'>[] = [
  { category: 'issue_type', name: 'Software' },
  { category: 'issue_type', name: 'Device' },
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
    let settings = getStored<SettingItem>('settings');
    if (settings.length === 0) {
      settings = INITIAL_SETTINGS.map(s => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }));
      setStored('settings', settings);
    }
    return settings;
  },
  async getSettingsByCategory(category: SettingItem['category']): Promise<SettingItem[]> {
    const settings = await this.getSettings();
    return settings.filter(s => s.category === category);
  },
  async saveSetting(setting: Omit<SettingItem, 'id' | 'created_at'>): Promise<SettingItem> {
    const settings = getStored<SettingItem>('settings');
    const newSetting: SettingItem = {
      ...setting,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    setStored('settings', [...settings, newSetting]);
    return newSetting;
  },
  async updateSetting(id: string, name: string): Promise<SettingItem> {
    const settings = getStored<SettingItem>('settings');
    const index = settings.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Setting not found');
    const updated = { ...settings[index], name };
    settings[index] = updated;
    setStored('settings', settings);
    return updated;
  },
  async deleteSetting(id: string): Promise<void> {
    const settings = getStored<SettingItem>('settings');
    setStored('settings', settings.filter(s => s.id !== id));
  },

  // Issues
  async getIssues(): Promise<Issue[]> {
    return getStored<Issue>('issues');
  },
  async saveIssue(issue: Omit<Issue, 'id' | 'created_at' | 'updated_at'>): Promise<Issue> {
    const issues = getStored<Issue>('issues');
    const newIssue: Issue = {
      ...issue,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setStored('issues', [newIssue, ...issues]);
    return newIssue;
  },
  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue> {
    const issues = getStored<Issue>('issues');
    const index = issues.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Issue not found');
    const updated = { ...issues[index], ...updates, updated_at: new Date().toISOString() };
    issues[index] = updated;
    setStored('issues', issues);
    return updated;
  },
  async deleteIssue(id: string): Promise<void> {
    const issues = getStored<Issue>('issues');
    setStored('issues', issues.filter(i => i.id !== id));
  },

  // Monthly Entries
  async getMonthlyEntries(): Promise<MonthlyEntry[]> {
    return getStored<MonthlyEntry>('monthly_entries');
  },
  async saveMonthlyEntry(entry: Omit<MonthlyEntry, 'id' | 'created_at'>): Promise<MonthlyEntry> {
    const entries = getStored<MonthlyEntry>('monthly_entries');
    const newEntry: MonthlyEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setStored('monthly_entries', [newEntry, ...entries]);
    return newEntry;
  },
  async updateMonthlyEntry(id: string, updates: Partial<MonthlyEntry>): Promise<MonthlyEntry> {
    const entries = getStored<MonthlyEntry>('monthly_entries');
    const index = entries.findIndex(e => e.id === id);
    const updated = { ...entries[index], ...updates };
    entries[index] = updated;
    setStored('monthly_entries', entries);
    return updated;
  },
  async deleteMonthlyEntry(id: string): Promise<void> {
    const entries = getStored<MonthlyEntry>('monthly_entries');
    setStored('monthly_entries', entries.filter(e => e.id !== id));
  },

  // System Downtime
  async getDowntime(): Promise<SystemDowntime[]> {
    return getStored<SystemDowntime>('system_downtime');
  },
  async saveDowntime(entry: Omit<SystemDowntime, 'id' | 'created_at'>): Promise<SystemDowntime> {
    const data = getStored<SystemDowntime>('system_downtime');
    const newEntry: SystemDowntime = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setStored('system_downtime', [newEntry, ...data]);
    return newEntry;
  },
  async deleteDowntime(id: string): Promise<void> {
    const data = getStored<SystemDowntime>('system_downtime');
    setStored('system_downtime', data.filter(d => d.id !== id));
  }
};
