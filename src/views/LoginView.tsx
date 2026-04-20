import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, BookOpen, Info, Headset, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { UserRole, LoginPortal } from '../contexts/AuthContext';

interface LoginViewProps {
  onLogin: (username: string, password: string, portal: LoginPortal) => Promise<UserRole>;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'city' | 'province'>('enterprise');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await onLogin(username, password, activeTab);
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center p-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-surface/80 to-surface-container/90" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0047cf 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <img
          referrerPolicy="no-referrer"
          src="https://picsum.photos/seed/yunnan/1920/1080?blur=10"
          alt="bg"
          className="size-full object-cover opacity-20 filter grayscale"
        />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg mb-12"
      >
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl mb-6 shadow-cloud border border-outline-variant/20">
            <ShieldCheck className="text-primary size-8" />
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-on-surface mb-3">
            云南省企业数据采集系统
          </h1>
          <p className="text-on-surface-variant font-medium">官方政务数据门户 • 云南省人力资源和社会保障厅</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,71,207,0.12)] overflow-hidden border border-outline-variant/20">
          <div className="flex border-b border-outline-variant/30 bg-surface-container-low/30 p-1">
            {(['enterprise', 'city', 'province'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-3.5 text-center font-headline text-sm font-bold rounded-xl transition-all duration-300",
                  activeTab === tab
                    ? "bg-white text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-white/50"
                )}
              >
                {tab === 'enterprise' ? '企业登录' : tab === 'city' ? '市级管理' : '省级管理'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3 bg-error-container/30 text-on-error-container p-4 rounded-xl border border-error/20"
              >
                <AlertCircle className="size-4 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block font-headline text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">
                  统一社会信用代码 / 用户名 <span className="text-error font-medium">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入18位信用代码或用户名"
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:bg-white focus:ring-0 text-on-surface font-sans text-sm rounded-t-lg transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-headline text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">
                  密码 <span className="text-error font-medium">*</span>
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入登录密码"
                    className="w-full pl-10 pr-12 py-3 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:bg-white focus:ring-0 text-on-surface font-sans text-sm rounded-t-lg transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="size-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer" />
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">记住账号</span>
                </label>
                <button type="button" className="text-sm font-bold text-primary hover:text-primary-container transition-colors">
                  忘记密码?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-headline font-bold shadow-[0_8px_20px_rgba(0,71,207,0.2)] hover:shadow-[0_12px_24px_rgba(0,71,207,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    验证身份中...
                  </>
                ) : (
                  <>
                    登录系统 <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center pt-8 border-t border-outline-variant/20">
              <p className="text-sm text-on-surface-variant">
                首次使用系统？
                <button className="ml-2 font-bold text-primary hover:text-primary-container transition-colors inline-flex items-center gap-1 group">
                  新企业备案/注册
                  <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.main>

      <footer className="relative z-10 w-full max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-4 py-8 border-t border-outline-variant/10">
        <div className="flex gap-6">
          <a href="#" className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            <BookOpen className="size-4" /> 操作手册
          </a>
          <a href="#" className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            <Info className="size-4" /> 系统说明
          </a>
          <a href="#" className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            <Headset className="size-4" /> 技术支持
          </a>
        </div>
        <div className="text-right text-on-surface-variant">
          <p className="text-sm font-bold">© 2026 云南省人力资源和社会保障厅</p>
          <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">建议使用 modern 浏览器以获得最佳体验</p>
        </div>
      </footer>
    </div>
  );
}
