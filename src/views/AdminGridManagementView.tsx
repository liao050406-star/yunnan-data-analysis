import { motion } from 'motion/react';
import { Grid, MapPin, Users, Building2, Plus, ShieldCheck, Map, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useGrids } from '../hooks/useApi';

export default function AdminGridManagementView() {
  const { data: grids, isLoading } = useGrids();

  const totalGrids = (grids || []).reduce((s: number, g: any) => s + (g.grid_count || 0), 0);
  const totalUsers = (grids || []).reduce((s: number, g: any) => s + (g.assigned_user_count || 0), 0);
  const totalEnterprises = (grids || []).reduce((s: number, g: any) => s + (g.enterprise_count || 0), 0);

  const statusConfig = {
    stable: { label: '正常', cls: 'bg-tertiary-container/20 text-on-tertiary-container' },
    warning: { label: '预警', cls: 'bg-error-container/20 text-on-error-container' },
    critical: { label: '严重', cls: 'bg-error text-white' },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-10 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Map className="text-primary size-5" />
            <div className="h-px w-8 bg-primary/30" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-headline">Hierarchical Grid Control</span>
          </div>
          <h1 className="font-headline text-4xl font-black text-on-surface tracking-tighter">区域网格管理</h1>
          <p className="text-on-surface-variant font-medium mt-1">管理各级政务网格的地理划分、联络人分配及行政效能考核。</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white border border-outline-variant/30 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-surface-container-low transition-all flex items-center gap-2">
            <MapPin className="size-3" /> 地图可视化配置
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center gap-2">
            <Plus className="size-3" /> 新增区域网格
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧统计 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden relative group">
            <div className="absolute right-0 top-0 size-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150 duration-500" />
            <h3 className="font-headline font-black text-lg text-on-surface mb-6 relative z-10">网格统计全览</h3>
            <div className="space-y-4 relative z-10">
              {[
                { icon: Grid, label: '省级网格总数', value: totalGrids, unit: '个' },
                { icon: Users, label: '网格联络员总数', value: totalUsers, unit: '人' },
                { icon: Building2, label: '覆盖企业总数', value: totalEnterprises.toLocaleString(), unit: '家' },
                { icon: ShieldCheck, label: '运行正常网格', value: (grids || []).filter((g: any) => g.status === 'stable').length, unit: '个' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                  <div className="flex items-center gap-3">
                    <stat.icon className="size-5 text-primary" />
                    <span className="text-xs font-bold text-on-surface">{stat.label}</span>
                  </div>
                  <span className="font-headline font-black text-on-surface tabular-nums">
                    {stat.value} <span className="text-xs font-medium text-on-surface-variant">{stat.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-black text-lg text-on-surface mb-4">预警状态</h3>
            <div className="space-y-3">
              {(grids || []).filter((g: any) => g.status !== 'stable').map((g: any) => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-error-container/10 rounded-xl border border-error/10">
                  <span className="text-sm font-bold text-on-surface">{g.region_name}</span>
                  <span className="text-xs font-black text-error bg-error/10 px-2 py-1 rounded-full">需关注</span>
                </div>
              ))}
              {(grids || []).filter((g: any) => g.status !== 'stable').length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-tertiary-container/10 rounded-xl">
                  <ShieldCheck className="size-4 text-on-tertiary-container" />
                  <span className="text-xs font-bold text-on-tertiary-container">全部网格运行正常</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧表格 */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
              <h3 className="font-headline font-black text-lg text-on-surface">各区网格详情</h3>
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-3 py-1.5 rounded-full">
                共 {grids?.length ?? 0} 个区域
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="size-8 text-primary animate-spin" />
              </div>
            ) : (grids || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
                <AlertCircle className="size-10 opacity-30 mb-3" />
                <p className="font-medium text-sm">暂无网格数据</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {(grids || []).map((grid: any) => {
                  const cfg = statusConfig[grid.status as keyof typeof statusConfig] || statusConfig.stable;
                  return (
                    <div key={grid.id} className="px-8 py-6 hover:bg-surface-container-low/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 bg-primary/5 rounded-xl flex items-center justify-center">
                            <MapPin className="size-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-headline font-black text-on-surface">{grid.region_name}</div>
                            <div className="text-xs text-on-surface-variant font-medium">区域代码: {grid.region_code}</div>
                          </div>
                        </div>
                        <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider", cfg.cls)}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { icon: Grid, label: '网格数', value: grid.grid_count },
                          { icon: Users, label: '联络员', value: grid.assigned_user_count },
                          { icon: Building2, label: '企业数', value: (grid.enterprise_count || 0).toLocaleString() },
                        ].map((stat, i) => (
                          <div key={i} className="bg-surface-container-low rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <stat.icon className="size-3.5 text-on-surface-variant" />
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <div className="font-headline font-black text-xl text-on-surface tabular-nums">{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
