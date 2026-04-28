# 海克斯盲盒前端

基于 React + Vite 的海克斯科技风格抽卡系统前端。

## 快速开始

### 1. 启动后端服务
```bash
cd ../backend
python main.py
```
后端服务将在 http://localhost:8000 运行

### 2. 启动前端开发服务器
```bash
npm install  # 安装依赖（如已安装可跳过）
npm run dev
```
前端服务将在 http://localhost:3000 运行

### 3. 构建生产版本
```bash
npm run build
```
构建产物将在 `dist/` 目录

## 项目结构

```
frontend/
├── index.html              # 入口 HTML
├── package.json            # 依赖配置
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # TailwindCSS 配置
├── postcss.config.js       # PostCSS 配置
├── public/                 # 静态资源
│   └── vite.svg
└── src/
    ├── main.jsx            # React 入口
    ├── App.jsx             # 主应用组件
    ├── index.css           # 全局样式
    ├── api/
    │   └── draw.js         # API 调用
    └── components/
        ├── Card.jsx            # 卡牌组件
        ├── CardGrid.jsx        # 卡牌网格
        ├── DrawButtons.jsx     # 抽卡按钮
        ├── MultiDrawResult.jsx # 十连抽结果
        ├── ScoreDisplay.jsx    # 评分展示
        └── SynergyBar.jsx      # 羁绊展示
```

## 功能特性

- ✨ **单抽/十连抽** - 支持单次抽取和十连抽模式
- 🎴 **卡牌翻转动画** - 流畅的 3D 翻牌效果
- ⭐ **阵容评分** - 自动计算综合评分和评级
- ⚔️ **羁绊系统** - 展示阵容激活的羁绊效果
- 🎨 **LuxCart Dark Mode** - 高端奢侈品风格 UI

## 技术栈

- React 18
- Vite 5
- TailwindCSS 3
- Framer Motion 11
- Axios
