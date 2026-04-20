# 云南省企业数据采集系统 — 全栈版本

**技术栈**: React 19 + TypeScript + Express.js + Supabase + Tailwind CSS

---

## 项目结构

```
yunnan-municipal-data-portal/
├── server/
│   └── index.ts              # Express 后端 API 服务
├── src/
│   ├── api/
│   │   └── client.ts         # 前端 API 调用封装
│   ├── contexts/
│   │   └── AuthContext.tsx   # React 认证上下文
│   ├── hooks/
│   │   └── useApi.ts         # 自定义数据 Hooks
│   ├── views/                # 所有页面组件（已集成 API）
│   ├── components/           # 通用组件（Sidebar、Navbar）
│   └── App.tsx               # 根组件（已集成 AuthProvider）
├── supabase/
│   └── schema.sql            # 数据库建表 + RLS + 种子数据
├── .env.example              # 环境变量模板
├── package.json
├── tsconfig.server.json
└── vite.config.ts
```

---

## 快速启动

### 第一步：初始化 Supabase 数据库

1. 登录 [Supabase 控制台](https://app.supabase.com)，创建新项目
2. 进入 **SQL Editor**，将 `supabase/schema.sql` 全文粘贴并执行
3. 执行完成后会自动创建所有表、RLS 策略、索引和种子数据

### 第二步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填写：

```env
# 从 Supabase 控制台 -> Settings -> API 获取
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # 仅后端使用，勿泄露

VITE_API_URL=http://localhost:3001/api
PORT=3001
APP_URL=http://localhost:3000
```

### 第三步：安装依赖并启动

```bash
npm install
npm run dev        # 同时启动前端(3000) + 后端(3001)
```

访问 `http://localhost:3000`

---

## 在 Supabase 中创建测试用户

登录后可通过 Supabase 控制台 **Authentication -> Users -> Add user** 创建测试账号：

| 邮箱（用户名） | 密码 | 角色 |
|---|---|---|
| `enterprise001` | `Test1234!` | enterprise |
| `city-kunming` | `Test1234!` | city |
| `admin-yunnan` | `Test1234!` | admin |

> 登录邮箱规则：用户名 + `@yunnan-portal.gov.cn`
> 例如：`enterprise001@yunnan-portal.gov.cn`

创建用户后，在 **SQL Editor** 执行插入 user_profiles 记录：

```sql
INSERT INTO public.user_profiles (id, username, full_name, role, organization_name)
VALUES 
  ('<enterprise-user-uuid>', 'enterprise001', '测试企业管理员', 'enterprise', '云南某重点制造企业'),
  ('<city-user-uuid>', 'city-kunming', '昆明市专员', 'city', '昆明市数据分中心'),
  ('<admin-user-uuid>', 'admin-yunnan', '省级管理员', 'admin', '云南省人力资源和社会保障厅');
```

---

## API 接口一览

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/me` | 获取当前用户 |

### 企业备案
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/filings/my` | 查看自己的备案 |
| POST | `/api/filings` | 新建备案 |
| PUT | `/api/filings/:id` | 更新备案 |

### 管理员审核
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/filings` | 获取所有备案（可筛选） |
| PUT | `/api/admin/filings/:id/audit` | 审核备案 |
| PUT | `/api/admin/submissions/:id/audit` | 审核月度数据 |

### 月度数据
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/submissions/current` | 当前周期填报 |
| POST | `/api/submissions` | 提交/保存草稿 |

### 数据分析
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/analytics/overview` | 总览统计 |
| GET | `/api/analytics/trend` | 就业趋势 |
| GET | `/api/analytics/by-industry` | 行业分布 |

### 其他
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cycles` | 调查周期列表 |
| GET | `/api/policies` | 政策法规列表 |
| GET | `/api/compliance/check` | 合规自检 |
| GET | `/api/grids` | 区域网格 |
| GET | `/api/audit-logs` | 系统日志 |
| POST | `/api/feedback` | 提交工单 |

---

## Supabase 数据库表结构

| 表名 | 说明 |
|------|------|
| `user_profiles` | 用户档案（角色等） |
| `enterprise_filings` | 企业备案信息 |
| `data_submissions` | 月度用工数据填报 |
| `survey_cycles` | 调查周期配置 |
| `policy_documents` | 政策法规文件 |
| `compliance_checks` | 合规自检记录 |
| `regional_grids` | 区域网格管理 |
| `audit_logs` | 系统操作审计日志 |
| `feedback_tickets` | 帮助反馈工单 |

所有表均已启用 **Row Level Security (RLS)**，确保数据隔离。

---

## 生产部署

```bash
# 构建前端
npm run build

# 启动后端（生产模式）
NODE_ENV=production node dist/server/index.js
```

推荐部署方案：
- **后端**: Railway / Render / 阿里云 ECS
- **前端**: Vercel / Netlify / 阿里云 OSS + CDN
- **数据库**: Supabase（已托管，无需额外配置）
