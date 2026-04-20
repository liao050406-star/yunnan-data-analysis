/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 云南省企业数据采集系统 - 主 App（已集成后端 API）
 */

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, UploadCloud, ShieldCheck, Library, HelpCircle,
  ClipboardCheck, Inbox, History, Settings, PieChart, Grid
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import EnterpriseFilingView from './views/EnterpriseFilingView';
import EnterpriseSubmissionView from './views/EnterpriseSubmissionView';
import ComplianceSelfCheckView from './views/ComplianceSelfCheckView';
import PolicyLibraryView from './views/PolicyLibraryView';
import HelpFeedbackView from './views/HelpFeedbackView';
import AdminAuditQueueView from './views/AdminAuditQueueView';
import AdminAnalysisView from './views/AdminAnalysisView';
import AdminReportSummaryView from './views/AdminReportSummaryView';
import AdminSystemAuditView from './views/AdminSystemAuditView';
import AdminGridManagementView from './views/AdminGridManagementView';
import AdminManagementView from './views/AdminManagementView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { UserRole, LoginPortal } from './contexts/AuthContext';

// ─── Inner App (uses auth context) ───────────────────────────────────────────
function AppContent() {
  const { user, isLoggedIn, isLoading, login, logout } = useAuth();
  const [activeView, setActiveView] = useState('数据上报与备案');

  const userRole: UserRole = user?.profile?.role || 'enterprise';

  // 登录后设置默认视图
  useEffect(() => {
    if (isLoggedIn) {
      setActiveView(userRole === 'enterprise' ? '数据上报与备案' : '审核任务中心');
    }
  }, [isLoggedIn, userRole]);

  const handleLogin = async (username: string, password: string, portal: LoginPortal): Promise<UserRole> => {
    return await login(username, password, portal);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant font-medium text-sm">正在验证身份...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  const enterpriseItems = [
    { icon: LayoutDashboard, label: '企业/主体看板' },
    { icon: UploadCloud, label: '数据上报与备案' },
    { icon: ShieldCheck, label: '合规状态自检', badge: 'NEW' },
    { icon: Library, label: '政策法规汇编' },
    { icon: HelpCircle, label: '系统帮助与反馈' },
  ];

  const adminItems = [
    { icon: Inbox, label: '审核任务中心', badge: '' }, // badge from API
    { icon: PieChart, label: '全省数据监测' },
    { icon: ClipboardCheck, label: '报表汇总上报' },
    { icon: History, label: '系统运行审计' },
    { icon: Grid, label: '区域网格管理' },
    { icon: Settings, label: '系统全局配置' },
  ];

  const cityItems = [
    { icon: Inbox, label: '审核任务中心', badge: '' },
    { icon: PieChart, label: '全市数据监测' },
    { icon: ClipboardCheck, label: '市级报表汇总' },
    { icon: HelpCircle, label: '网格化技术支持' },
  ];

  const sidebarItems =
    userRole === 'enterprise' ? enterpriseItems :
    userRole === 'city' ? cityItems : adminItems;

  const renderContent = () => {
    if (userRole === 'enterprise') {
      switch (activeView) {
        case '数据上报与备案': return <EnterpriseFilingView />;
        case '企业/主体看板': return <EnterpriseSubmissionView />;
        case '合规状态自检': return <ComplianceSelfCheckView />;
        case '政策法规汇编': return <PolicyLibraryView />;
        case '系统帮助与反馈': return <HelpFeedbackView />;
        default: return <div className="text-on-surface-variant font-medium">此模块内容尚在同步中...</div>;
      }
    } else {
      switch (activeView) {
        case '审核任务中心': return <AdminAuditQueueView />;
        case '全省数据监测':
        case '全市数据监测': return <AdminAnalysisView />;
        case '报表汇总上报':
        case '市级报表汇总': return <AdminReportSummaryView />;
        case '系统运行审计': return <AdminSystemAuditView />;
        case '区域网格管理': return <AdminGridManagementView />;
        case '系统全局配置': return <AdminManagementView />;
        case '网格化技术支持': return <HelpFeedbackView />;
        default: return <div className="text-on-surface-variant font-medium">加载中...</div>;
      }
    }
  };

  const getUserInfo = () => {
    if (user?.profile) {
      return {
        name: user.profile.organization_name || user.profile.full_name || user.profile.username,
        role: user.profile.role === 'enterprise' ? '企业数据报送员'
          : user.profile.role === 'city' ? '市级监测专员'
          : '省级政务负责人'
      };
    }
    switch (userRole) {
      case 'enterprise': return { name: '云南某重点制造企业', role: '企业数据报送员' };
      case 'city': return { name: '昆明市数据分中心', role: '市级监测专员' };
      case 'admin': return { name: '省级系统管理员', role: '省级政务负责人' };
    }
  };

  const userInfo = getUserInfo();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        items={sidebarItems}
        userName={userInfo.name}
        userRole={userInfo.role}
        activeLabel={activeView}
        onItemClick={setActiveView}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar title={activeView} onLogout={logout} />

        <main className="flex-1 overflow-y-auto p-8 lg:p-10 scroll-smooth">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// ─── Root App with Provider ───────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
