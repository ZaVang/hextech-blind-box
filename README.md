# 海克斯盲盒 · 传奇选手 🔮

英雄联盟传奇选手盲盒抽卡系统，灵感来自虎扑海克斯盲盒活动。

## 功能特色

- **单抽模式**：随机抽取 5 主力 + 1 替补阵容
- **十连抽模式**：一次抽取 10 个阵容，选择最佳保留
- **羁绊系统**：自动识别阵容羁绊效果（冠军血脉、冰岛往事、操作型等）
- **阵容评分**：基于选手评级计算综合评分（满分 30 分）
- **分版本选手**：同一选手不同时期有不同表现（如 Tian 2019 SSS vs 2021 S）

## 评级体系

| 评级 | 颜色 | 概率 | 分值 |
|-----|------|------|-----|
| SSS | 🟡 金色 | 10% | 5 |
| SS | 🩷 粉色 | 20% | 4 |
| S | 🟠 橙色 | 40% | 3 |
| A | 🟣 紫色 | 20% | 2 |
| B | 🔵 蓝色 | 10% | 1 |

## 技术栈

- **后端**: Python + FastAPI
- **前端**: React + Vite + TailwindCSS
- **设计**: LuxCart Dark Mode（高端奢侈品风格）

## 快速开始

### 后端启动

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000 开始抽卡！

### 命令行模式

```bash
cd backend
python cli.py           # 单抽
python cli.py -m 10     # 十连抽
```

## API 接口

| 接口 | 方法 | 描述 |
|-----|------|-----|
| `/api/draw?count=1` | GET | 单抽 |
| `/api/draw?count=10` | GET | 十连抽 |
| `/api/draw10` | GET | 十连抽（简写） |
| `/api/ratings` | GET | 获取评级配置 |
| `/api/players/count` | GET | 获取选手统计 |

## 数据结构

选手数据支持分版本描述：

```json
{
  "name": "Tian",
  "position": "打野",
  "versions": [
    {"era": "2019", "team": "FPX", "rating": "SSS", "tags": ["冠军血脉", "节奏大师", "FMVP"]},
    {"era": "2021", "team": "FPX", "rating": "S", "tags": ["冰岛往事", "神经刀"]},
    {"era": "2023-2024", "team": "TES", "rating": "SS", "tags": ["节奏大师", "神经刀"]}
  ]
}
```

## 羁绊标签

包含约 25 种羁绊标签：

- **成就类**：冠军血脉、FMVP、黑马
- **风格类**：操作型、节奏大师、大核、蓝领
- **故事类**：冰岛往事、此志无双、搏至无憾
- **特质类**：神经刀、天赋怪、大赛软脚虾

## 项目结构

```
hextech-blind-box/
├── backend/
│   ├── main.py          # FastAPI 服务
│   ├── cli.py           # 命令行工具
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # React 组件
│   │   └── api/         # API 调用
│   └── package.json
├── data/
│   └── players.json     # 选手数据
└── README.md
```

## License

MIT License © ZaVang
