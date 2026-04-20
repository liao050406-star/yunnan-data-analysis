import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Download, CheckCircle, XCircle, Eye, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAdminFilings, useAnalyticsOverview, useMutation } from '../hooks/useApi';
import { adminFilingApi } from '../api/client';

export default function AdminAuditQueueView() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, refetch } = useAdminFilings({ status, keyword, page });
  const { data: overview } = useAnalyticsOverview();

  const { mutate: auditFiling } = useMutation(
    ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) =>
      adminFilingApi.audit(id, action, note)
  );

  const handleAudit = async (id: string, action: 'approve' | 'reject') => {
    const note = action === 'reject' ? prompt('请输入退回原因（可选）：') ?? undefined : undefined;
    await auditFiling({ id, action, note });
    refetch();
  };

  const filings = data?.filings || [];
  const total = data?.total || 0;

  const statusBadge = (s: string) => ({
    'pending': { label: '待审核', cls: 'bg-secondary-container text-on-secondary-container' },
    'approved': { label: '审核通过', cls: 'bg-tertiary-container text-on-tertiary-container' },
    'rejected': { label: '已退回', cls: 'bg-error-container text-on-error-container' },
    'draft': { label: '草稿', cls: 'bg-surface-container-high text-on-surface-variant' },
  }[s] || { label: s, cls: '' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="relative flex items-start justify-between bg-white p-8 rounded-2xl shadow-cloud border border-outline-variant/10 overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-headline text-3xl font-black text-on-surface tracking-tighter mb-2">数据审核队列</h1>
          <p className="text-on-surface-variant font-medium text-sm">
            监管与审核全省企业提交的申报数据。当前有{' '}
            <span className="text-primary font-bold">{overview?.pendingAudit ?? '—'}</span> 项待办任务。
          </p>
          <div className="mt-8 flex gap-10">
            <div>
              <span className="block text-3xl font-headline font-black text-primary tabular-nums">
                {overview?.totalSubmissions?.toLocaleString() ?? '—'}
              </span>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">本期申报总计</span>
            </div>
            <div className="w-px h-10 bg-outline-variant/30 self-center" />
            <div>
              <span className="block text-3xl font-headline font-black text-error tabular-nums">
                {overview?.pendingAudit ?? '—'}
              </span>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest text-error">待审核备案</span>
            </div>
          </div>
        </div>
        <AlertCircle className="absolute -top-12 -right-12 size-64 text-primary opacity-5 pointer-events-none" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-outline-variant/10 px-8 pt-6 flex gap-10">
          {[
            { key: 'pending', label: `待审核任务 (${overview?.pendingAudit ?? 0})` },
            { key: 'approved', label: '已审核通过' },
            { key: 'rejected', label: '已退回' },
            { key: '', label: '全部记录' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setStatus(tab.key); setPage(1); }}
              className={cn(
                "pb-4 border-b-4 font-headline font-bold text-sm transition-all",
                status === tab.key
                  ? "border-primary text-primary font-black"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-8 bg-surface-container-low/30 border-b border-outline-variant/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">企业检索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline" />
                <input
                  type="text" value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="名称 / 信用代码"
                  className="w-full pl-10 pr-4 py-3 bg-white border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-xl text-sm text-on-surface shadow-sm font-medium outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 md:col-span-3">
              <button
                onClick={() => { setKeyword(searchInput); setPage(1); refetch(); }}
                className="flex-1 bg-primary text-white hover:bg-primary-container px-6 py-3 rounded-xl text-sm font-black transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2"
              >
                <RefreshCw className="size-4" /> 执行查询
              </button>
              <button
                onClick={() => { setKeyword(''); setSearchInput(''); setPage(1); refetch(); }}
                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="size-8 text-primary animate-spin" />
            </div>
          ) : filings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
              <AlertCircle className="size-10 opacity-30 mb-3" />
              <p className="font-medium text-sm">暂无数据</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface text-on-surface-variant text-[10px] uppercase font-black tracking-widest">
                  <th className="py-5 px-8">企业及登记名称</th>
                  <th className="py-5 px-6">注册地址</th>
                  <th className="py-5 px-6">机构代码</th>
                  <th className="py-5 px-6">提交时间</th>
                  <th className="py-5 px-6 text-center">当前状态</th>
                  <th className="py-5 px-8 text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-on-surface divide-y divide-outline-variant/10">
                {filings.map((row: any) => {
                  const badge = statusBadge(row.status);
                  return (
                    <tr key={row.id} className="hover:bg-primary/5 transition-all group">
                      <td className="py-5 px-8">
                        <div className="font-bold">{row.enterprise_name}</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">
                          {row.industry ? { it: '信息技术', mfg: '制造业', agri: '农业', service: '服务业' }[row.industry as string] || row.industry : '—'}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-on-surface-variant text-xs max-w-[160px] truncate">{row.address || '—'}</td>
                      <td className="py-5 px-6 font-mono text-[11px] text-on-surface-variant">{row.credit_code}</td>
                      <td className="py-5 px-6 text-on-surface-variant tabular-nums text-xs">
                        {new Date(row.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", badge.cls)}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="size-8 bg-white border border-outline-variant/30 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-all shadow-sm" title="详情">
                            <Eye className="size-4" />
                          </button>
                          {row.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAudit(row.id, 'approve')}
                                className="size-8 bg-white border border-outline-variant/30 flex items-center justify-center rounded-lg text-green-600 hover:bg-green-50 transition-all shadow-sm" title="批准"
                              >
                                <CheckCircle className="size-4" />
                              </button>
                              <button
                                onClick={() => handleAudit(row.id, 'reject')}
                                className="size-8 bg-white border border-outline-variant/30 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-all shadow-sm" title="驳回"
                              >
                                <XCircle className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="p-8 border-t border-outline-variant/10 flex items-center justify-between text-xs font-bold text-on-surface-variant">
          <div className="flex items-center gap-4">
            <span>共计 <span className="text-on-surface tabular-nums">{total}</span> 条申报项</span>
            <button className="text-primary hover:underline flex items-center gap-1">
              <Download className="size-3" /> 导出当期报表
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 hover:bg-surface-container-high transition-all text-outline disabled:opacity-30">
              &lt;
            </button>
            {Array.from({ length: Math.min(3, Math.ceil(total / 20)) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                  page === p ? "bg-primary text-white shadow-md shadow-primary/20" : "border border-outline-variant/30 hover:bg-surface-container-high")}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 hover:bg-surface-container-high transition-all disabled:opacity-30">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
