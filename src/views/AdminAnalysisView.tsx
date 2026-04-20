import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Download, RefreshCw, Layers, TrendingUp, Users, PieChart as PieChartIcon } from 'lucide-react';
import { useAnalyticsOverview, useAnalyticsTrend, useAnalyticsByIndustry, useAnalyticsByRegion } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

const INDUSTRY_COLORS: Record<string, string> = {
  mfg: '#0047cf', it: '#165dff', agri: '#007f1a', service: '#f59e0b', other: '#94a3b8',
};

const REGION_COLORS = [
  '#0047cf', '#165dff', '#007f1a', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#64748b',
];

export default function AdminAnalysisView() {
  const { user } = useAuth();
  const role = user?.profile?.role;
  const isProvincial = role === 'admin';

  const { data: overview, refetch: refetchOverview } = useAnalyticsOverview();
  const { data: trend, refetch: refetchTrend } = useAnalyticsTrend();
  const { data: industryDist } = useAnalyticsByIndustry();
  const { data: regions, refetch: refetchRegions } = useAnalyticsByRegion();

  const handleRefresh = () => {
    refetchOverview();
    refetchTrend();
    refetchRegions();
  };

  const trendData = (trend || []).map(t => ({ name: t.period, value: t.total }));
  const cityData =
    regions && regions.length > 0
      ? regions.map((r, i) => ({
          name: r.name,
          value: r.totalEmployees,
          color: REGION_COLORS[i % REGION_COLORS.length],
        }))
      : [{ name: '暂无聚合数据', value: 0, color: '#94a3b8' }];

  const pieData = (industryDist || []).map(d => ({
    name: d.label, value: d.count,
    color: INDUSTRY_COLORS[d.industry] || '#94a3b8',
  }));

  const regionalHeadcountSum =
    role === 'city' ? (regions?.reduce((s, r) => s + r.totalEmployees, 0) ?? 0) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tighter">
            {isProvincial ? '全省数据分析中心' : '全市数据分析中心'}
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            {isProvincial
              ? '基于已审备案与已审季度填报的省级监测与分市州对比'
              : '基于已审数据的本市州就业规模与结构（省级指标仍为全省汇总）'}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-white border border-outline-variant/30 text-on-surface font-bold text-sm rounded-xl shadow-sm hover:bg-surface-container-low transition-all flex items-center gap-2">
            <Download className="size-4" /> 导出研报
          </button>
          <button onClick={handleRefresh}
            className="px-8 py-2.5 bg-primary text-white font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <RefreshCw className="size-4" /> 刷新全局数据
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Layers, label: '全省备案企业总数',
            value: (overview?.totalEnterprises ?? 0).toLocaleString(),
            trend: '+2.4% 环比增长', trendPos: true,
          },
          {
            icon: Users,
            label: isProvincial ? '全省监测就业人数' : '本市州在岗（最近已审季度）',
            value: (isProvincial
              ? (overview?.totalEmployees ?? 0)
              : regionalHeadcountSum ?? 0
            ).toLocaleString(),
            trend: isProvincial ? '已审填报汇总' : '与柱状图一致', trendPos: true,
          },
          {
            icon: TrendingUp, label: '数据申报总量',
            value: (overview?.totalSubmissions ?? 0).toLocaleString(),
            trend: `待审核 ${overview?.pendingSubmissions ?? 0} 项`, trendPos: false,
          },
          {
            icon: PieChartIcon, label: '待审备案任务',
            value: (overview?.pendingAudit ?? 0).toLocaleString(),
            trend: '需处理', trendPos: false,
          },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-cloud border border-outline-variant/10 relative overflow-hidden group">
            <card.icon className="absolute -top-4 -right-4 size-32 text-primary opacity-5 group-hover:opacity-10 transition-all pointer-events-none" />
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">{card.label}</h3>
            <div className="text-4xl font-headline font-black text-on-surface tracking-tighter tabular-nums">{card.value}</div>
            <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-full ${
              card.trendPos ? 'text-tertiary-container bg-tertiary-container/10' : 'text-secondary-container bg-secondary-container/10'
            }`}>
              <TrendingUp className="size-3" /> {card.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline font-black text-xl text-on-surface">就业人数趋势</h2>
            <p className="text-xs text-on-surface-variant font-medium mt-1">全省已审核季度数据汇总</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trendData.length > 0 ? trendData : [{ name: 'Q1 2026', value: 0 }]}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0047cf" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0047cf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontWeight: 700 }} />
            <Area type="monotone" dataKey="value" stroke="#0047cf" strokeWidth={3} fill="url(#colorValue)" dot={{ fill: '#0047cf', r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 p-8">
          <h2 className="font-headline font-black text-xl text-on-surface mb-6">
            {isProvincial ? '分市州就业规模（最近已审季度）' : '本市州就业规模（最近已审季度）'}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cityData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontWeight: 700 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {cityData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-cloud border border-outline-variant/10 p-8">
          <h2 className="font-headline font-black text-xl text-on-surface mb-6">行业分布占比</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs font-bold text-on-surface">{entry.name}</span>
                    </div>
                    <span className="text-xs font-black text-on-surface tabular-nums">{entry.value} 家</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-on-surface-variant text-sm">
              暂无行业分布数据
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
