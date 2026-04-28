"""
海克斯盲盒抽卡系统 - FastAPI 后端服务
端口: 8000
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ============ 数据加载 ============

DATA_PATH = Path(__file__).parent.parent / "data" / "players.json"

def load_players_data() -> Dict[str, Any]:
    """加载选手数据"""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# ============ 抽卡核心逻辑 ============

RATING_SCORES = {"SSS": 5, "SS": 4, "S": 3, "A": 2, "B": 1}

def get_random_version(player: Dict[str, Any]) -> Dict[str, Any]:
    """从选手的多个版本中随机选择一个"""
    versions = player.get("versions", [])
    if not versions:
        raise ValueError(f"选手 {player['name']} 没有可用版本")
    return random.choice(versions)


def draw_lineup(players_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    抽卡主逻辑
    - 5个主力位置: 上单/打野/中单/下路/辅助
    - 2个替补(随机位置)
    """
    players = players_data["players"]
    positions = ["上单", "打野", "中单", "下路", "辅助"]  # 主力位置
    
    # 按位置分组选手
    position_players: Dict[str, List[Dict]] = {}
    for player in players:
        pos = player.get("position", "")
        if pos not in position_players:
            position_players[pos] = []
        position_players[pos].append(player)
    
    selected_starter: List[Dict[str, Any]] = []
    
    # 抽取5个主力
    for pos in positions:
        available = position_players.get(pos, [])
        
        if not available:
            raise ValueError(f"没有找到位置为 {pos} 的选手")
        
        player = random.choice(available)
        version = get_random_version(player)
        
        selected_starter.append({
            "name": player["name"],
            "position": pos,
            "era": version["era"],
            "team": version["team"],
            "rating": version["rating"],
            "tags": version["tags"],
            "role": "starter"
        })
    
    # 抽取2个替补(随机位置)
    selected_substitute: List[Dict[str, Any]] = []
    for _ in range(2):
        player = random.choice(players)
        version = get_random_version(player)
        selected_substitute.append({
            "name": player["name"],
            "position": player.get("position", "未知"),
            "era": version["era"],
            "team": version["team"],
            "rating": version["rating"],
            "tags": version["tags"],
            "role": "substitute"
        })
    
    return {
        "starters": selected_starter,
        "substitutes": selected_substitute
    }


def aggregate_synergies(lineup: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    羁绊聚合
    统计所有选手标签出现次数，2个及以上触发羁绊
    """
    tag_count: Dict[str, int] = {}
    
    # 收集所有标签
    for player in lineup["starters"] + lineup["substitutes"]:
        for tag in player["tags"]:
            tag_count[tag] = tag_count.get(tag, 0) + 1
    
    # 触发羁绊(≥2)
    synergies = []
    for tag, count in tag_count.items():
        if count >= 2:
            synergies.append({
                "tag": tag,
                "count": count
            })
    
    # 按触发人数降序排列
    synergies.sort(key=lambda x: x["count"], reverse=True)
    return synergies


def calculate_lineup_score(lineup: Dict[str, Any]) -> Dict[str, Any]:
    """
    计算阵容评分
    - 主力权重: 1.0
    - 替补权重: 0.5
    """
    starters = lineup["starters"]
    substitutes = lineup["substitutes"]
    
    starter_score = sum(RATING_SCORES.get(p["rating"], 1) for p in starters)
    substitute_score = sum(RATING_SCORES.get(p["rating"], 1) for p in substitutes) * 0.5
    
    total_score = starter_score + substitute_score
    
    # 计算最大可能分数
    max_score = 5 * len(starters) + 5 * 0.5 * len(substitutes)
    
    # 转换为字母评级
    ratio = total_score / max_score
    if ratio >= 0.9:
        grade = "SSS"
    elif ratio >= 0.8:
        grade = "SS"
    elif ratio >= 0.65:
        grade = "S"
    elif ratio >= 0.5:
        grade = "A"
    else:
        grade = "B"
    
    return {
        "total_score": round(total_score, 2),
        "max_score": max_score,
        "grade": grade,
        "starter_score": starter_score,
        "substitute_score": round(substitute_score, 2)
    }


# ============ FastAPI 应用 ============

app = FastAPI(
    title="海克斯盲盒抽卡系统",
    description="英雄联盟传奇选手盲盒抽卡后端服务",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """健康检查"""
    return {"status": "ok", "service": "hextech-blind-box"}


@app.get("/api/draw")
async def draw_lineup_api():
    """抽卡接口 - 返回完整阵容信息"""
    try:
        players_data = load_players_data()
        lineup = draw_lineup(players_data)
        synergies = aggregate_synergies(lineup)
        score = calculate_lineup_score(lineup)
        
        return {
            "success": True,
            "data": {
                "lineup": lineup,
                "synergies": synergies,
                "score": score
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/players/count")
async def get_players_count():
    """获取选手总数"""
    try:
        players_data = load_players_data()
        return {
            "total": len(players_data["players"]),
            "positions": players_data["positions"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/synergies/list")
async def get_synergies_list():
    """获取所有羁绊标签列表"""
    try:
        players_data = load_players_data()
        return {
            "synergies": players_data["synergies"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
