import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Issue, SettingItem } from '../types';
import { PRIORITY_COLORS, STATUS_COLORS } from '../constants';
import { Search, Filter, Download, Trash2, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const IssueReports: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [options, setOptions] = useState<{
    issueTypes: SettingItem[];
    priorities: SettingItem[];
    statuses: SettingItem[];
    assignedPersons: SettingItem[];
  }>({
    issueTypes: [],
    priorities: [],
    statuses: [],
    assignedPersons: [],
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadIssues();
    loadOptions();
  }, []);

  const loadOptions = async () => {
    const [it, pr, st, ap] = await Promise.all([
      dbService.getSettingsByCategory('issue_type'),
      dbService.getSettingsByCategory('priority'),
      dbService.getSettingsByCategory('status'),
      dbService.getSettingsByCategory('assigned_person'),
    ]);
    setOptions({
      issueTypes: it,
      priorities: pr,
      statuses: st,
      assignedPersons: ap,
    });
  };

  const loadIssues = async () => {
    const data = await dbService.getIssues();
    setIssues(data);
    setSelectedIds(new Set());
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      await dbService.deleteIssue(id);
      loadIssues();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected issues?`)) {
      await dbService.bulkDeleteIssues(Array.from(selectedIds));
      loadIssues();
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIssue) {
      await dbService.updateIssue(editingIssue.id, editingIssue);
      setEditingIssue(null);
      loadIssues();
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.client_name.toLowerCase().includes(search.toLowerCase()) ||
      issue.issue_details.toLowerCase().includes(search.toLowerCase());

    const issueDate = new Date(issue.created_at).getTime();
    const matchesFromDate = fromDate ? issueDate >= new Date(fromDate).getTime() : true;
    const matchesToDate = toDate ? issueDate <= new Date(toDate).getTime() + 86400000 : true;

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const currentIssues = filteredIssues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.size === currentIssues.length && currentIssues.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentIssues.map(i => i.id)));
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Client', 'Details', 'Type', 'Priority', 'Status', 'Assigned'];
    const rows = filteredIssues.map(i => [
      i.issue_date, i.client_name, i.issue_details.replace(/,/g, ' '), i.issue_type, i.priority, i.status, i.assigned_person
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "issue_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleCSV = () => {
    const headers = ['Date', 'Client', 'Details', 'Type', 'Priority', 'Status', 'Assigned'];
    const sampleRow = [new Date().toISOString().split('T')[0], 'Sample Client', 'Sample issue details here', 'Software', 'Medium', 'Open', 'Fuad'];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, sampleRow].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_issue_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const issuesToSave: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const [date, client, details, type, priority, status, assigned] = lines[i].split(',');
        if (client && details) {
          let normalizedDate = date?.trim() || new Date().toISOString().split('T')[0];
          // Try to handle DD/MM/YYYY or DD-MM-YYYY
          if (normalizedDate.includes('/') || normalizedDate.includes('-')) {
            const parts = normalizedDate.split(/[/-]/);
            if (parts.length === 3 && parts[2].length === 4) {
              normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          issuesToSave.push({
            issue_date: normalizedDate,
            client_name: client.trim(),
            issue_details: details.trim(),
            issue_type: type?.trim() || options.issueTypes[0]?.name || 'Software',
            priority: priority?.trim() || options.priorities[0]?.name || 'Medium',
            status: status?.trim() || options.statuses[0]?.name || 'Open',
            assigned_person: assigned?.trim() || options.assignedPersons[0]?.name || 'Fuad',
          });
        }
      }

      if (issuesToSave.length > 0) {
        try {
          await dbService.bulkSaveIssues(issuesToSave);
          alert(`Successfully uploaded ${issuesToSave.length} issues!`);
          loadIssues();
        } catch (err) {
          console.error(err);
          alert('Failed to upload issues. Please check the CSV format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by client or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Rows</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-transparent text-sm font-semibold outline-none cursor-pointer text-indigo-600"
            >
              {[50, 100, 500, 1000].map(limit => <option key={limit} value={limit}>{limit}</option>)}
            </select>
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <Trash2 size={16} />
              Delete ({selectedIds.size})
            </button>
          )}

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
          />
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
            <Download size={16} /> Export
          </button>
          <button onClick={downloadSampleCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
            <Download size={16} /> Sample
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer text-center">
            <Download size={16} className="rotate-180" /> Upload
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={currentIssues.length > 0 && selectedIds.size === currentIssues.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {currentIssues.length > 0 ? currentIssues.map(issue => (
                <tr key={issue.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${selectedIds.has(issue.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(issue.id)}
                      onChange={() => toggleSelection(issue.id)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {issue.issue_date || new Date(issue.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{issue.client_name}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 truncate max-w-[200px]">{issue.issue_details}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {issue.issue_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${(PRIORITY_COLORS as any)[issue.priority] || 'bg-slate-100'}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold ${((STATUS_COLORS as any)[issue.status] || 'text-slate-600').split(' ')[1]}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{issue.assigned_person}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setEditingIssue(issue)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(issue.id)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">No issues found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredIssues.length)} of {filteredIssues.length} issues</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30 dark:text-white">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold px-2 dark:text-white">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30 dark:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-xl dark:text-white">Edit Issue</h3>
              <button onClick={() => setEditingIssue(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Client Name</label>
                  <input type="text" value={editingIssue.client_name} onChange={(e) => setEditingIssue({ ...editingIssue, client_name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Type</label>
                  <select value={editingIssue.issue_type} onChange={(e) => setEditingIssue({ ...editingIssue, issue_type: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none">
                    {options.issueTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Priority</label>
                  <select value={editingIssue.priority} onChange={(e) => setEditingIssue({ ...editingIssue, priority: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none">
                    {options.priorities.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                  <select value={editingIssue.status} onChange={(e) => setEditingIssue({ ...editingIssue, status: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none">
                    {options.statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Details</label>
                <textarea rows={4} value={editingIssue.issue_details} onChange={(e) => setEditingIssue({ ...editingIssue, issue_details: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none resize-none" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditingIssue(null)} className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 gradient-bg text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity">Update Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueReports;
