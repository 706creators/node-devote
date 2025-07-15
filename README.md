# 🗳️ Node-Devote

> 基于信任图谱和权重扩散模型的智能投票系统

## 🎯 项目简介

Node-Devote 是一个去中心化的社区投票系统，采用信任图谱 + 权重扩散模型，解决传统投票中"一人一票"的局限性。每个人既是投票者，也可能是被投票者，通过算法计算出更公平、更能反映群体智慧的排名结果。

## 🧩 投票设计规则

### 📊 基本机制
- **双重身份**：每个人都可以给其他人投票，每个人也会被其他人投票
- **多票制**：每个人可以投票给多个候选人（每行一个提名）
- **覆盖更新**：重新提交投票会覆盖之前的所有投票记录

### ⚖️ 权重算法
```
投票权重 = log(1 + 获得票数)
最终得分 = Σ(投票者权重 ÷ 投票者的投票数量)
```

### 🎲 算法特点
- **信任传递**：获得更多信任的人，其投票权重更高
- **防止刷票**：权重采用对数函数，避免少数人控制结果
- **平衡分配**：投票者的权重会平均分配给其所有被投票人

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 数据库（推荐使用 Neon）

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 环境配置
复制 `.env.example` 为 `.env` 并配置数据库连接：
```bash
DATABASE_URL=your_postgres_connection_string
```

### 数据库初始化
```sql
-- 创建投票记录表
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    voter_name VARCHAR(255) NOT NULL,
    nominee_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_votes_voter_name ON votes(voter_name);
CREATE INDEX idx_votes_nominee_name ON votes(nominee_name);
CREATE UNIQUE INDEX idx_votes_unique_vote ON votes(voter_name, nominee_name);
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

## 🎮 使用说明

### 📝 投票步骤
1. **输入姓名**：填写与微信昵称一致的名字（区分大小写）
2. **投票提名**：每行一个被提名人的名字
3. **提交投票**：系统会覆盖您之前的所有投票
4. **查看排行榜**：可以实时查看投票结果

### 📈 结果查看
- **🧮 加权排行榜**：基于信任图谱算法的智能排名
- **📊 基础排行榜**：传统的票数统计排名
- **📋 详细信息**：显示投票者列表、权重计算等

## 🛠️ 技术栈

- **前端**：Next.js 15, React 18, TypeScript, Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：PostgreSQL (Neon)
- **部署**：Vercel

## 📁 项目结构

```
node-devote/
├── app/
│   ├── page.tsx              # 投票主页
│   ├── results/              # 排行榜页面
│   └── api/
│       ├── submit/           # 投票提交API
│       └── results/          # 结果查询API
├── lib/
│   └── voting-algorithm.ts   # 投票算法实现
└── public/
    └── 706acc.svg           # Logo文件
```

## 🔮 核心算法

投票系统的核心是信任图谱算法：

1. **统计阶段**：统计每个人获得的票数和投票关系
2. **权重计算**：`weight = log(1 + received_votes)`
3. **得分计算**：每个投票者的权重平均分配给其被投票人
4. **排序输出**：按最终加权得分排序

这种机制确保：
- ✅ 被更多人信任的人，投票权重更高
- ✅ 防止少数人通过大量投票操控结果
- ✅ 体现群体的集体智慧

## 🎨 特色功能

- **🎯 双模式显示**：加权算法 vs 基础统计
- **🔄 实时更新**：投票后立即查看最新排名
- **📱 响应式设计**：完美支持移动端
- **🌙 深色模式**：自动适应系统主题
- **⚡ 高性能**：优化的数据库查询和前端渲染

## 🚀 部署

推荐使用 Vercel 进行部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

详细部署文档请参考 [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！
