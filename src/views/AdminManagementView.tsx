import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Users, Shield, Activity, Plus, Edit2, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useSurveyCycles, useMutation } from '../hooks/useApi';
import { cyclesApi } from '../api/client';

export default function AdminManagementView() {
  const [activeTab, setActiveTab] = useState('cycles');
  const { data: cycles, isLoading, refetch } = useSurveyCycles();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCycle, setNewCycle] = useState({ name: '', period_label: '', period_year: 2026, period_quarter: 3, open_date: '', deadline: '' });

  const { mutate: createCycle, isLoading: isCreating } = useMutation(
    () => cyclesApi.create(newCycle)
  );

  const { mutate: updateStatus } = useMutation(
    ({ id, status }: { id: string; status: string }) => cyclesApi.update(id, { status })
  );

  const statusConfig = {
    active: { label: '活跃中', cls: 'bg-tertiary-container text-on-tertiary-container', dot: 'bg-on-tertiary-container' },
    closed: { label: '已结束', cls: 'bg-secondary-container text-on-secondary-container', dot: 'bg-on-secondary-container' },
    pending: { label: '待启动', cls: 'bg-surface-container-high text-on-surface-variant', dot: 'bg-on-surface-variant' },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-black text-on-surface mb-2 tracking-tighter">系统管理中心</h1>
        <p className="text-on-surface-variant text-sm font-medium">管理省级就业数据采集参数、网格化用户权限及系统全局性配置。</p>
      </div>

      <div className="flex gap-6 border-b border-outline-variant/20 mb-8 px-2 overflow-x-auto whitespace-nowrap">
        {[
          { key: 'cycles', icon: Calendar, label: '调查周期与上报时限' },
          { key: 'users', icon: Users, label: '用户与角色权限管理' },
          { key: 'security', icon: Shield, label: '统一认证 & 安全审计' },
          { key: 'monitor', icon: Activity, label: '系统运行监控' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn(
              "pb-4 border-b-4 font-headline font-bold text-sm transition-all flex items-center gap-2",
              activeTab === tab.key ? "border-primary text-primary font-black" : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}>
            <tab.icon className="size-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'cycles' && (
        <div className="bg-white rounded-2xl p-8 shadow-cloud border border-outline-variant/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="font-headline text-xl font-black text-on-surface tracking-tight">调查期配置</h2>
              <span className="bg-primary/5 text-primary text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-primary/10">
                {cycles?.filter((c: any) => c.status === 'active').length ?? 0} Active Cycles
              </span>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:shadow-lg shadow-primary/10 transition-all active:scale-95">
              <Plus className="size-4" /> 新增调查期
            </button>
          </div>

          {showAddForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10 space-y-4">
              <h3 className="font-headline font-black text-sm text-on-surface">新增调查周期</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">周期名称</label>
                  <input type="text" value={newCycle.name}
                    onChange={e => setNewCycle(p => ({ ...p, name: e.target.value }))}
                    placeholder="如：2026年第三季度就业调查"
                    className="w-full bg-white border-b-2 border-transparent focus:border-primary rounded-t-lg px-3 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">周期标识</label>
                  <input type="text" value={newCycle.period_label}
                    onChange={e => setNewCycle(p => ({ ...p, period_label: e.target.value }))}
                    placeholder="如：Q3 2026"
                    className="w-full bg-white border-b-2 border-transparent focus:border-primary rounded-t-lg px-3 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">年份</label>
                  <input type="number" value={newCycle.period_year}
                    onChange={e => setNewCycle(p => ({ ...p, period_year: Number(e.target.value) }))}
                    className="w-full bg-white border-b-2 border-transparent focus:border-primary rounded-t-lg px-3 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">季度</label>
                  <select value={newCycle.period_quarter}
                    onChange={e => setNewCycle(p => ({ ...p, period_quarter: Number(e.target.value) }))}
                    className="w-full bg-white border-b-2 border-transparent focus:border-primary rounded-t-lg px-3 py-2.5 text-sm outline-none">
                    <option value={1}>第一季度</option>
                    <option value={2}>第二季度</option>
                    <option value={3}>第三季度</option>
                    <option value={4}>第四季度</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">开放日期</label>
                  <input type="date" value={newCycle.open_date}
                    onChange={e => setNewCycle(p => ({ ...p, open_date: e.target.value }))}
                    className="w-full bg-white border-b-2 border-transparent focus:border-primary rounded-t-lg px-3 py-2.5 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">截止日期</label>
                  <input type="date" value={newCycle.deadline}
                    onChange={e => setNewCycle(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full bg-white border-b-2 border-transparent focus:border-primary rounded-t-lg px-3 py-2.5 text-sm outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-surface-container-high text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-highest transition-all">
                  取消
                </button>
                <button disabled={isCreating} onClick={async () => {
                  await createCycle(undefined);
                  refetch();
                  setShowAddForm(false);
                }}
                  className="px-6 py-2 bg-primary text-white font-black text-sm rounded-xl flex items-center gap-2 disabled:opacity-60">
                  {isCreating ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  确认创建
                </button>
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="size-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 text-on-surface-variant text-[10px] font-black uppercase tracking-widest">
                    <th className="py-4 px-6 rounded-tl-xl">调查期名称</th>
                    <th className="py-4 px-6">开放日期</th>
                    <th className="py-4 px-6">上报截止日期</th>
                    <th className="py-4 px-6">当前运行状态</th>
                    <th className="py-4 px-6 text-right rounded-tr-xl">管理操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-on-surface divide-y divide-outline-variant/10">
                  {(cycles || []).map((cycle: any) => {
                    const cfg = statusConfig[cycle.status as keyof typeof statusConfig] || statusConfig.pending;
                    return (
                      <tr key={cycle.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="py-5 px-6 font-bold">{cycle.name}</td>
                        <td className="py-5 px-6 text-on-surface-variant tabular-nums font-mono text-xs">
                          {cycle.open_date?.slice(0, 10)} 00:00:00
                        </td>
                        <td className="py-5 px-6 text-on-surface-variant tabular-nums font-mono text-xs">
                          {cycle.deadline?.slice(0, 10)} 23:59:59
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", cfg.cls)}>
                            <div className={cn("size-1.5 rounded-full", cfg.dot)} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {cycle.status !== 'active' && (
                              <button onClick={() => updateStatus({ id: cycle.id, status: 'active' }).then(() => refetch())}
                                className="text-xs px-3 py-1.5 bg-tertiary-container/20 text-on-tertiary-container rounded-lg font-bold hover:bg-tertiary-container/40 transition-all">
                                激活
                              </button>
                            )}
                            {cycle.status === 'active' && (
                              <button onClick={() => updateStatus({ id: cycle.id, status: 'closed' }).then(() => refetch())}
                                className="text-xs px-3 py-1.5 bg-secondary-container/20 text-on-secondary-container rounded-lg font-bold hover:bg-secondary-container/40 transition-all">
                                关闭
                              </button>
                            )}
                            <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all">
                              <Edit2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-outline-variant/10 flex items-center justify-between">
            <p className="text-xs font-bold text-on-surface-variant">显示 {cycles?.length ?? 0} 项调查周期记录</p>
            <div className="flex gap-2">
              <button className="size-8 rounded-lg border border-outline-variant/30 flex items-center justify-center text-outline hover:bg-surface-container-low transition-all">
                <Settings className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'cycles' && (
        <div className="bg-white rounded-2xl p-12 shadow-cloud border border-outline-variant/10 flex flex-col items-center justify-center text-center">
          <Settings className="size-16 text-primary/20 mb-4" />
          <h3 className="font-headline font-black text-xl text-on-surface mb-2">功能开发中</h3>
          <p className="text-on-surface-variant text-sm font-medium max-w-xs">该模块正在开发中，将在下一个版本中上线。</p>
        </div>
      )}
    </motion.div>
  );
}
