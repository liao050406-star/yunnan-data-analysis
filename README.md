# 云南省企业就业失业数据采集系统

这是一个面向企业、市级管理端和省级管理端的就业失业数据采集与分析系统。项目采用 React + Express + Supabase 的全栈结构，后端负责统一登录、角色鉴权、企业备案、季度数据填报、审核、统计分析、政策库、网格管理和审计日志等接口。

## 技术栈

- 前端：React 19、TypeScript、Vite、Tailwind CSS、Recharts
- 后端：Node.js、Express、TypeScript、tsx
- 数据与认证：Supabase Auth、PostgreSQL、Row Level Security
- 开发工具：concurrently、dotenv、TypeScript

## 项目结构

```text
yunnan-fullstack/
├─ server/
│  └─ index.ts                 # Express 后端 API 服务
├─ src/
│  ├─ api/client.ts            # 前端 API 请求封装
│  ├─ contexts/AuthContext.tsx # 登录状态与角色校验
│  ├─ views/                  # 企业端、市级端、省级端页面
│  └─ App.tsx
├─ scripts/
│  └─ seed-demo.ts             # 创建演示账号和演示数据
├─ supabase/
│  ├─ schema.sql               # 数据库表结构、RLS、基础种子数据
│  └─ seed_test_data.sql       # 补充测试数据
├─ .env.example                # 环境变量模板
├─ package.json
└─ tsconfig.server.json
```

## 环境要求

- Node.js 18 或更高版本
- npm
- Supabase 项目

## 快速启动

1. 安装依赖：

```bash
npm install
```

2. 创建 `.env`：

```bash
cp .env.example .env
```

3. 配置 `.env`：

```env
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
SUPABASE_ANON_KEY=你的_anon_key

PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001/api
```

说明：

- `SUPABASE_SERVICE_ROLE_KEY` 只允许后端使用，不能提交到 GitHub。
- 当前后端兼容 `SUPABASE_URL` 和 `VITE_SUPABASE_URL`，但推荐使用 `SUPABASE_URL`。
- 前端默认会请求当前页面同主机的 `3001/api`，也可以通过 `VITE_API_URL` 显式指定后端地址。

4. 初始化数据库：

在 Supabase 控制台进入 SQL Editor，依次执行：

```text
supabase/schema.sql
supabase/seed_test_data.sql
```

5. 创建演示账号和演示业务数据：

```bash
npm run db:seed
```

6. 启动开发服务：

```bash
npm run dev
```

默认访问地址：

- 前端：http://localhost:3000
- 后端：http://localhost:3001
- 健康检查：http://localhost:3001/api/health

## 测试账号

默认演示密码为 `Demo123456`。如需修改，可在 `.env` 中设置 `SEED_DEMO_PASSWORD` 后重新执行 `npm run db:seed`。

| 端口 | 登录入口 | 用户名 | 密码 | 角色 |
|---|---|---|---|---|
| 企业端 | 企业登录 | `demo_ent_1` | `Demo123456` | enterprise |
| 市级端 | 市级管理 | `demo_city` | `Demo123456` | city |
| 省级端 | 省级管理 | `demo_admin` | `Demo123456` | admin |

登录时必须选择正确入口。企业账号选择“企业登录”，市级账号选择“市级管理”，省级账号选择“省级管理”。

## 常用脚本

```bash
npm run dev           # 同时启动前端和后端
npm run dev:client    # 仅启动 Vite 前端，默认 3000
npm run dev:server    # 仅启动 Express 后端，默认 3001
npm run build         # 构建前端
npm run build:server  # 编译后端
npm run lint          # TypeScript 类型检查
npm run db:seed       # 写入演示账号和演示数据
```

## 后端接口概览

认证：

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录并返回 Supabase session |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/auth/me` | 获取当前用户和角色档案 |

企业备案：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/filings/my` | 获取当前企业备案 |
| POST | `/api/filings` | 新建备案 |
| PUT | `/api/filings/:id` | 更新备案 |
| POST | `/api/filings/:id/save-draft` | 保存备案草稿 |

数据填报：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/submissions/my` | 获取当前企业填报记录 |
| GET | `/api/submissions/current` | 获取当前调查周期填报 |
| POST | `/api/submissions` | 提交或保存季度数据 |

审核管理：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/admin/filings` | 市级/省级查看备案审核列表 |
| PUT | `/api/admin/filings/:id/audit` | 审核企业备案 |
| PUT | `/api/admin/submissions/:id/audit` | 审核填报数据 |

统计分析：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/analytics/overview` | 汇总指标 |
| GET | `/api/analytics/trend` | 就业趋势 |
| GET | `/api/analytics/by-industry` | 行业分布 |
| GET | `/api/analytics/by-region` | 地区分布 |

其他：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/cycles` | 调查周期列表 |
| POST | `/api/cycles` | 新建调查周期 |
| PUT | `/api/cycles/:id` | 更新调查周期 |
| GET | `/api/policies` | 政策法规列表 |
| GET | `/api/compliance/check` | 企业合规自检 |
| GET | `/api/grids` | 区域网格列表 |
| POST | `/api/grids` | 新增区域网格 |
| GET | `/api/audit-logs` | 系统审计日志 |
| POST | `/api/feedback` | 提交反馈工单 |
| GET | `/api/feedback/my` | 当前用户反馈记录 |
| GET | `/api/health` | 后端健康检查 |

## 登录问题排查

如果登录页提示 `Failed to fetch`，通常不是账号密码错误，而是浏览器没有连到后端。按下面顺序检查：

1. 确认后端可访问：

```bash
curl http://localhost:3001/api/health
```

正常应返回：

```json
{
  "status": "ok"
}
```

2. 确认前端打开地址和后端地址匹配：

- 前端建议使用 `http://localhost:3000`
- 后端建议使用 `http://localhost:3001`
- 如果使用 `127.0.0.1` 打开前端，后端也必须允许对应来源

3. 确认端口没有被旧进程占用：

```powershell
Get-NetTCPConnection -LocalPort 3000,3001 -State Listen
```

正常情况下：

- `3000` 应该是 Vite 前端
- `3001` 应该是 Express 后端

4. 修改 `.env` 后必须重启：

```bash
npm run dev
```

5. 浏览器强制刷新：

```text
Ctrl + F5
```

## 部署说明

后端生产环境至少需要配置：

```env
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=你的 service_role key
SUPABASE_ANON_KEY=你的 anon key
PORT=3001
NODE_ENV=production
APP_URL=你的前端域名
```

前端生产环境至少需要配置：

```env
VITE_API_URL=你的后端地址/api
```

生产构建：

```bash
npm run build
npm run build:server
npm run start
```

## 安全注意事项

- 不要提交 `.env`。
- 不要暴露 `SUPABASE_SERVICE_ROLE_KEY`。
- 生产环境应设置明确的 `APP_URL`，不要放开任意 CORS 来源。
- 演示账号仅用于课程实验和功能演示，正式环境应删除或更换密码。

## 当前状态

- 已修复后端 Supabase 环境变量兼容问题。
- 已修复前端 API 默认地址，避免 `localhost` 和 `127.0.0.1` 混用导致登录失败。
- 已修复开发环境 CORS 和后端端口绑定问题。
- 已通过 TypeScript 检查和前后端构建。
