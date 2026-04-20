/**
 * Auth Context - 管理登录状态、用户信息
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/client';

export type UserRole = 'enterprise' | 'city' | 'admin';

/** 登录页选中的入口（决定应匹配的 user_profiles.role） */
export type LoginPortal = 'enterprise' | 'city' | 'province';

const PORTAL_EXPECTED_ROLE: Record<LoginPortal, UserRole> = {
  enterprise: 'enterprise',
  city: 'city',
  province: 'admin',
};

interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  role: UserRole;
  organization_name?: string;
}

interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string, portal: LoginPortal) => Promise<UserRole>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：检查本地存储的 token
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi.me()
      .then(({ user: userData }) => setUser(userData))
      .catch(() => {
        localStorage.removeItem('auth_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string, portal: LoginPortal): Promise<UserRole> => {
    const { session, user: userData } = await authApi.login(username, password);
    const role = userData.profile?.role as UserRole | undefined;
    if (!role) {
      throw new Error('登录成功但未返回角色信息，请检查 user_profiles 是否已配置。');
    }
    const expected = PORTAL_EXPECTED_ROLE[portal];
    if (role !== expected) {
      const portalLabel =
        portal === 'enterprise' ? '企业登录' : portal === 'city' ? '市级管理' : '省级管理';
      const roleLabel =
        role === 'enterprise' ? '企业' : role === 'city' ? '市级' : '省级';
      const hint =
        role === 'enterprise'
          ? '请切换到「企业登录」入口，或使用市级/省级演示账号（运行 npm run db:seed）。'
          : role === 'city'
            ? '请切换到「市级管理」入口登录。'
            : '请切换到「省级管理」入口登录。';
      throw new Error(`入口与账号角色不一致：当前为「${portalLabel}」，但账号为${roleLabel}权限。${hint}`);
    }
    localStorage.setItem('auth_token', session.access_token);
    setUser(userData as AuthUser);
    return role;
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
