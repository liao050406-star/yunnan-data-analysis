import { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Clock, User, Database, Search, RefreshCw, Loader2 } from 'lucide-react';
import { useAuditLogs } from '../hooks/useApi';

const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  login: { label: '用户登录', icon: User, color: 'text-primary bg-primary/10' },
  logout: { label: '用户登出', icon: User, color: 'text-on-surface-variant bg-surface-container-high' },
  create_filing: { label: '创建备案', icon: Database, color: 'text-tertiary-container bg-tertiary-container/10' },
  update_filing: { label: '更新备案', icon: Database, color: 'text-secondary-container bg-secondary-container/10' },
  filing_approved: { label: '备案审核通过', icon: Shield, color: 'text-green-600 bg-green-50' },
  filing_rejected: { label: '备案退回', icon: Shield, color: 'text-error bg-error-container/20' },
  submit_data: { label: '提交月度数据', icon: Activity, color: 'text-primary bg-primary/10' },
  save_draft_submission: { label: '保存草稿', icon: Clock, color: 'text-on-surface-variant bg-surface-container-high' },
  create_cycle: { label: '创建调查周期', icon: Database, color: 'text-tertiary-container bg-tertiary-container/10' },
};

export default function AdminSystemAuditView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useAuditLogs(page);
  const logs = data?.logs || [];
  const total = data?.total || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tighter">系统运行审计</h1>
          <p className="text-on-surface-variant font-medium mt-1">全系统操作行为追踪与安全事件日志。</p>
        </div>
        <button onClick={refetch}
          className="px-6 py-2.5 bg-primary text-white font-black text-sm rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:-translate-y-0.5 transition-all">
          <RefreshCw className="size-4" /> 刷新日志
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: '日志总条数', value: total.toLocaleString(), icon: Database, color: 'text-primary' },
          { label: '登录事件', value: logs.filter((l: any) => l.action === 'login').length, icon: User, color: 'text-tertiary-container' },
          { label: '审核操作', value: logs.filter((l: any) => l.action?.includes('approved') || l.action?.includes('rejected')).length, icon: Shield, color: 'text-error' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-cloud border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{s.label}</span>
              <s.icon className={`size-5 ${s.color}`} />
            </div>
            <div className="text-3xl font-headline font-black text-on-surface tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 overflow-hidden">
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-headline font-black text-lg text-on-surface">操作日志明细</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
            <input type="text" placeholder="搜索用户或操作..."
              className="pl-10 pr-4 py-2 bg-surface-container-low rounded-xl text-sm outline-none w-56 focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
            <Activity className="size-10 opacity-30 mb-3" />
            <p className="font-medium text-sm">暂无审计日志</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {logs.map((log: any) => {
              const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: Activity, color: 'text-on-surface-variant bg-surface-container-high' };
              return (
                <div key={log.id} className="px-8 py-5 flex items-center gap-6 hover:bg-surface-container-low/30 transition-all">
                  <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <cfg.icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-on-surface">{cfg.label}</span>
                      {log.resource_type && (
                        <span className="text-[10px] font-black bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {log.resource_type}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5 truncate">
                      {log.user_profiles?.username || log.user_id?.slice(0, 8) + '...'}
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant tabular-nums shrink-0">
                    {new Date(log.created_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="px-8 py-5 border-t border-outline-variant/10 flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface-variant">第 {page} 页 / 共 {Math.ceil(total / 50)} 页</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-xs font-bold border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-all disabled:opacity-30">
              上一页
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}
              className="px-4 py-2 text-xs font-bold border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-all disabled:opacity-30">
              下一页
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
