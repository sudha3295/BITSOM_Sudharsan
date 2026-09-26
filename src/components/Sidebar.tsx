import React from 'react';
import {
  Activity,
  CheckSquare,
  Database,
  FileText,
  FolderGit2,
  HardDrive,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sliders,
  Sparkles,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'actions'
  | 'inbox'
  | 'chat'
  | 'drive'
  | 'reconciliation'
  | 'erp'
  | 'activity'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingActionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingActionsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'actions' as NavTab,
      label: 'Action Center',
      icon: CheckSquare,
      badge: pendingActionsCount > 0 ? pendingActionsCount : null,
      highlight: true,
    },
    {
      id: 'inbox' as NavTab,
      label: 'Inbox',
      icon: Inbox,
      badge: null,
      subtext: 'Gmail API',
    },
    {
      id: 'chat' as NavTab,
      label: 'Chat',
      icon: MessageSquare,
      badge: null,
      subtext: 'Google Chat',
    },
    {
      id: 'drive' as NavTab,
      label: 'Drive',
      icon: HardDrive,
      badge: null,
      subtext: 'Google Drive',
    },
    {
      id: 'reconciliation' as NavTab,
      label: 'Reconciliation',
      icon: FolderGit2,
      badge: null,
      subtext: 'Email vs ERP',
    },
    {
      id: 'erp' as NavTab,
      label: 'Connected ERP',
      icon: Database,
      badge: null,
      subtext: 'Enterprise DB',
    },
    {
      id: 'activity' as NavTab,
      label: 'Activity & Audit',
      icon: Activity,
      badge: null,
      subtext: 'Audit Trail',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
      subtext: 'Integrations',
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/80 flex flex-col justify-between p-4 h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Workplace Operations
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== null && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom info card */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
          <span>PROJECT</span>
          <span className="text-slate-300">cohort3track1</span>
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
          <span>AI ENGINE</span>
          <span className="text-cyan-400">gemini-3.8-flash</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 leading-tight">
          Grounding: Real Gmail, Chat, Drive, and ERP records. Zero mock data.
        </div>
      </div>
    </aside>
  );
};
