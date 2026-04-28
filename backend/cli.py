#!/usr/bin/env python3
"""
海克斯盲盒抽卡 CLI 工具
用法:
  python cli.py           # 直接抽卡
  python cli.py --backend # 调用 API 抽卡
"""

import argparse
import json
import sys
from pathlib import Path

# 添加 backend 目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from main import (
    load_players_data,
    draw_lineup,
    aggregate_synergies,
    calculate_lineup_score,
    RATING_SCORES
)

# 位置显示映射
POSITION_DISPLAY = {
    "上单": "TOP",
    "打野": "JUG",
    "中单": "MID",
    "下路": "ADC",
    "辅助": "SUP"
}

RATING_COLORS = {
    "SSS": "\033[95m",  # 紫色
    "SS": "\033[94m",   # 蓝色
    "S": "\033[92m",    # 绿色
    "A": "\033[93m",    # 黄色
    "B": "\033[90m",    # 灰色
}
RESET = "\033[0m"


def format_rating(rating: str) -> str:
    """格式化评级显示"""
    color = RATING_COLORS.get(rating, "")
    return f"{color}[{rating}]{RESET}"


def display_lineup(lineup: dict, synergies: list, score: dict):
    """格式化展示阵容"""
    print("\n" + "=" * 60)
    print("🎰 海克斯盲盒 - 传奇阵容 🎰")
    print("=" * 60)
    
    # 主力阵容
    print("\n📋 【主力阵容】")
    print("-" * 40)
    for player in lineup["starters"]:
        pos = POSITION_DISPLAY.get(player["position"], player["position"])
        print(f"  {pos:4} | {player['name']:12} | {player['team']:8} | "
              f"{player['era']:8} | {format_rating(player['rating'])}")
    
    # 替补
    print("\n🪑 【替补】")
    print("-" * 40)
    for player in lineup["substitutes"]:
        pos = POSITION_DISPLAY.get(player["position"], player["position"])
        print(f"  {pos:4} | {player['name']:12} | {player['team']:8} | "
              f"{player['era']:8} | {format_rating(player['rating'])}")
    
    # 羁绊
    if synergies:
        print("\n⚡ 【羁绊效果】")
        print("-" * 40)
        for syn in synergies:
            print(f"  ✦ {syn['tag']} (x{syn['count']})")
    else:
        print("\n⚡ 【羁绊效果】")
        print("  暂无触发羁绊")
    
    # 评分
    print("\n🏆 【阵容评级】")
    print("-" * 40)
    grade_color = RATING_COLORS.get(score["grade"], "")
    print(f"  综合评级: {grade_color}[{score['grade']}]{RESET}")
    print(f"  总得分: {score['total_score']}/{score['max_score']}")
    print(f"  主力贡献: {score['starter_score']}")
    print(f"  替补贡献: {score['substitute_score']}")
    
    print("\n" + "=" * 60 + "\n")


def cli_draw():
    """本地直接抽卡"""
    try:
        players_data = load_players_data()
        lineup = draw_lineup(players_data)
        synergies = aggregate_synergies(lineup)
        score = calculate_lineup_score(lineup)
        
        display_lineup(lineup, synergies, score)
        
        # 同时输出 JSON 格式
        result = {
            "lineup": lineup,
            "synergies": synergies,
            "score": score
        }
        return result
        
    except Exception as e:
        print(f"❌ 抽卡失败: {e}", file=sys.stderr)
        sys.exit(1)


def api_draw():
    """通过 API 抽卡"""
    try:
        import requests
        response = requests.get("http://localhost:8000/api/draw", timeout=10)
        response.raise_for_status()
        result = response.json()
        
        if result.get("success"):
            data = result["data"]
            display_lineup(data["lineup"], data["synergies"], data["score"])
        else:
            print(f"❌ API 返回错误: {result}", file=sys.stderr)
            sys.exit(1)
            
    except ImportError:
        print("❌ 需要安装 requests 库才能使用 API 模式", file=sys.stderr)
        print("   运行: pip install requests", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ API 调用失败: {e}", file=sys.stderr)
        print("   请确保后端服务已启动 (python main.py)", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="海克斯盲盒抽卡 CLI 工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python cli.py           # 直接抽卡
  python cli.py --backend # 调用本地 API 抽卡
        """
    )
    parser.add_argument(
        "--backend", "-b",
        action="store_true",
        help="通过 API 方式抽卡 (需要先启动后端服务)"
    )
    
    args = parser.parse_args()
    
    if args.backend:
        api_draw()
    else:
        cli_draw()


if __name__ == "__main__":
    main()
