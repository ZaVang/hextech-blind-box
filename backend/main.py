"""
海克斯盲盒抽卡系统 - FastAPI 后端服务
端口: 8000
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Any, Tuple

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ============ 配置 ============

DATA_PATH = Path(__file__).parent.parent / "data" / "players.json"

# 抽卡概率分布
DRAW_PROBABILITIES = {
    "SSS": 0.10,
    "SS": 0.20,
    "S": 0.40,
    "A": 0.20,
    "B": 0.10,
}

# 评级分值
RATING_SCORES = {"SSS": 5, "SS": 4, "S": 3, "A": 2, "B": 1}

# 评级配色
RATING_COLORS = {
    "SSS": {"hex": "#FFD700", "name": "金色"},
    "SS": {"hex": "#FF69B4", "name": "粉色"},
    "S": {"hex": "#FF8C00", "name": "橙色"},
    "A": {"hex": "#9370DB", "name": "紫色"},
    "B": {"hex": "#4169E1", "name": "蓝色"},
}

RATING_ORDER = ["SSS", "SS", "S", "A", "B"]  # 从高到低
POSITIONS = ["上单", "打野", "中单", "下路", "辅助"]


# ============ 数据加载 ============

def load_players_data() -> Dict[str, Any]:
    """加载选手数据"""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ============ 核心逻辑 ============

def get_random_version(player: Dict[str, Any]) -> Dict[str, Any]:
    """从选手的多个版本中随机选择一个"""
    versions = player.get("versions", [])
    if not versions:
        raise ValueError(f"选手 {player['name']} 没有可用版本")
    return random.choice(versions)


def weighted_random_rating() -> str:
    """基于概率分布随机抽取评级"""
    ratings = list(DRAW_PROBABILITIES.keys())
    weights = list(DRAW_PROBABILITIES.values())
    return random.choices(ratings, weights=weights, k=1)[0]


def find_player_by_rating(
    players: List[Dict], 
    position: str, 
    target_rating: str
) -> Tuple[Dict, str]:
    """
    查找指定位置和目标评级的选手
    如果找不到，降级查找
    返回：(选手, 实际评级)
    """
    position_players = [p for p in players if p.get("position") == position]
    
    # 按评级顺序查找（目标评级 -> 降级）
    for rating in RATING_ORDER:
        if rating == target_rating:
            # 目标评级
            available = [p for p in position_players if 
                        any(v["rating"] == rating for v in p.get("versions", []))]
            if available:
                return random.choice(available), rating
        else:
            continue
    
    # 降级查找
    for rating in RATING_ORDER:
        if rating == target_rating:
            continue
        available = [p for p in position_players if 
                     any(v["rating"] == rating for v in p.get("versions", []))]
        if available:
            return random.choice(available), rating
    
    raise ValueError(f"位置 {position} 没有可用选手")


def draw_with_probability(players_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    基于概率分布抽取6个选手
    """
    players = players_data["players"]
    drawn = []
    
    for position in POSITIONS:
        target_rating = weighted_random_rating()
        player, actual_rating = find_player_by_rating(players, position, target_rating)
        version = get_random_version(player)
        
        drawn.append({
            "name": player["name"],
            "position": position,
            "era": version["era"],
            "team": version["team"],
            "rating": version["rating"],
            "tags": version["tags"],
            "raw_rating": RATING_SCORES.get(version["rating"], 1)
        })
    
    # 再随机抽取1个选手作为可能的替补
    extra_player = random.choice(players)
    extra_version = get_random_version(extra_player)
    drawn.append({
        "name": extra_player["name"],
        "position": extra_player.get("position", "未知"),
        "era": extra_version["era"],
        "team": extra_version["team"],
        "rating": extra_version["rating"],
        "tags": extra_version["tags"],
        "raw_rating": RATING_SCORES.get(extra_version["rating"], 1)
    })
    
    return drawn


def assign_lineup(drawn: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    阵容分配逻辑：
    1. 检查是否有重复位置
    2. 如果有，评分低的自动进入替补
    3. 如果没有重复，评分最低的进入替补
    """
    starters = []
    substitutes = []
    
    # 统计位置出现次数
    position_count: Dict[str, List[Dict]] = {}
    for player in drawn:
        pos = player["position"]
        if pos not in position_count:
            position_count[pos] = []
        position_count[pos].append(player)
    
    # 检查是否有重复位置
    has_duplicate = any(len(v) > 1 for v in position_count.values())
    
    if has_duplicate:
        # 有重复位置：评分低的进入替补
        # 首先选择位置数量>1的重复位置
        duplicate_players = []
        for pos, players in position_count.items():
            if len(players) > 1:
                duplicate_players.extend(players)
        
        # 按评分排序，最低分进替补
        duplicate_players.sort(key=lambda x: x["raw_rating"])
        substitutes.append(duplicate_players[0])
        
        # 其他人都是主力
        for player in drawn:
            if player not in substitutes:
                starters.append(player)
    else:
        # 没有重复位置：评分最低的进替补
        sorted_players = sorted(drawn, key=lambda x: x["raw_rating"])
        substitutes.append(sorted_players[0])
        starters.extend(sorted_players[1:])
    
    # 按位置顺序排列主力
    position_order = {pos: i for i, pos in enumerate(POSITIONS)}
    starters.sort(key=lambda x: position_order.get(x["position"], 99))
    
    return {
        "starters": starters,
        "substitutes": substitutes
    }


def aggregate_synergies(lineup: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    羁绊聚合
    统计所有选手标签出现次数，2个及以上触发羁绊
    """
    tag_count: Dict[str, int] = {}
    
    for player in lineup["starters"] + lineup["substitutes"]:
        for tag in player["tags"]:
            tag_count[tag] = tag_count.get(tag, 0) + 1
    
    synergies = []
    for tag, count in tag_count.items():
        if count >= 2:
            synergies.append({
                "tag": tag,
                "count": count
            })
    
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
    
    starter_score = sum(p["raw_rating"] for p in starters)
    substitute_score = sum(p["raw_rating"] for p in substitutes) * 0.5
    
    total_score = starter_score + substitute_score
    
    # 最大可能分数
    max_score = 5 * 5 + 5 * 0.5  # 5个主力(SSS) + 1个替补(SSS)*0.5
    
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


def do_draw() -> Dict[str, Any]:
    """执行抽卡"""
    players_data = load_players_data()
    drawn = draw_with_probability(players_data)
    lineup = assign_lineup(drawn)
    synergies = aggregate_synergies(lineup)
    score = calculate_lineup_score(lineup)
    
    return {
        "lineup": lineup,
        "synergies": synergies,
        "score": score
    }


# ============ FastAPI 应用 ============

app = FastAPI(
    title="海克斯盲盒抽卡系统",
    description="英雄联盟传奇选手盲盒抽卡后端服务",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok", "service": "hextech-blind-box", "version": "2.0.0"}


@app.get("/api/draw")
async def draw_api():
    """抽卡接口"""
    try:
        result = do_draw()
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ratings")
async def get_ratings():
    """获取评级配置"""
    return {
        "probabilities": DRAW_PROBABILITIES,
        "colors": RATING_COLORS,
        "scores": RATING_SCORES
    }


@app.get("/api/players/count")
async def get_players_count():
    """获取选手统计"""
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
    """获取羁绊标签列表"""
    try:
        players_data = load_players_data()
        return {"synergies": players_data["synergies"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
