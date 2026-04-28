#!/usr/bin/env python3
"""
海克斯盲盒抽卡 CLI 工具 v2.0
用法:
  python cli.py           # 直接抽卡
  python cli.py --backend # 调用 API 抽卡
"""

import argparse
import sys
from pathlib import Path

# 添加 backend 目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from main import (
    do_draw,
    RATING_COLORS,
    DRAW_PROBABILITIES
)

# 位置显示映射
POSITION_DISPLAY = {
    "上单": "TOP",
    "打野": "JUG",
    "中单": "MID",
    "下路": "ADC",
    "辅助": "SUP"
}

# ANSI 颜色码
ANSI_COLORS = {
    "SSS": "\033[38;2;255;215;0m",    # 金色 RGB
    "SS": "\033[38;2;255;105;180m",   # 粉色 RGB
    "S": "\033[38;2;255;140;0m",       # 橙色 RGB
    "A": "\033[38;2;147;112;219m",    # 紫色 RGB
    "B": "\033[38;2;65;105;225m",     # 蓝色 RGB
}
RESET = "\033[0m"


def colorize(text: str, rating: str) -> str:
    """为文本添加颜色"""
    color = ANSI_COLORS.get(rating, "")
    return f"{color}{text}{RESET}"


def format_rating_badge(rating: str) -> str:
    """格式化评级徽章"""
    return colorize(f"[{rating}]", rating)


def format_line(char: str, length: int = 55) -> str:
    """格式化分隔线"""
    return colorize(char * length, "B")


def display_lineup(lineup: dict, synergies: list, score: dict):
    """格式化展示阵容"""
    
    # 头部
    print()
    print(format_line("="))
    print(colorize("  🎰  海克斯盲盒 - 传奇阵容  🎰", "SSS"))
    print(format_line("="))
    
    # 概率提示
    print("\n  抽卡概率: ", end="")
    probs_str = " | ".join([f"{r}:{int(DRAW_PROBABILITIES[r]*100)}%" 
                            for r in ["SSS", "SS", "S", "A", "B"]])
    print(colorize(probs_str, "A"))
    
    # 主力阵容
    print("\n  📋 【主力阵容】")
    print(colorize("  " + "-" * 55, "B"))
    header = f"  {'位置':6} {'选手':14} {'战队':10} {'版本':10} {'评级':8}"
    print(colorize(header, "A"))
    sep = f"  {'-'*6} {'-'*14} {'-'*10} {'-'*10} {'-'*8}"
    print(colorize(sep, "B"))
    
    for player in lineup["starters"]:
        pos = POSITION_DISPLAY.get(player["position"], player["position"])
        r = player["rating"]
        line = f"  {colorize(pos, r):6} {player['name']:14} {player['team']:10} {player['era']:10} {format_rating_badge(r):10}"
        print(line)
    
    # 标签展示
    print(colorize("  " + "-" * 55, "B"))
    tags_line = "  标签: " + ", ".join([
        colorize(t, lineup["starters"][0]["rating"]) 
        for t in lineup["starters"][0]["tags"][:3]
    ])
    print(tags_line)
    
    # 替补
    print()
    print(f"  🪑 【替补】")
    print(colorize("  " + "-" * 55, "B"))
    
    for player in lineup["substitutes"]:
        pos = POSITION_DISPLAY.get(player["position"], player["position"])
        r = player["rating"]
        tags = ", ".join(player["tags"][:2]) if player["tags"] else ""
        line = f"  {colorize(pos, r):6} {player['name']:14} {player['team']:10} {player['era']:10} {format_rating_badge(r):10}"
        print(line)
        if tags:
            print(f"       {colorize(tags, 'B')}")
    
    # 羁绊效果
    print()
    if synergies:
        print(f"  ⚡ 【羁绊效果】")
        print(colorize("  " + "-" * 55, "B"))
        for syn in synergies:
            desc = f"({syn['count']}人)"
            print(f"  {colorize('✦', 'S')} {colorize(syn['tag'], 'S')} {colorize(desc, 'A')}")
    else:
        print(f"  ⚡ 【羁绊效果】")
        print(colorize("  " + "-" * 55, "B"))
        print(f"  {colorize('暂无触发羁绊', 'B')}")
    
    # 评分
    print(f"\n  🏆 【阵容评级】")
    print(colorize("  " + "-" * 55, "B"))
    grade = score["grade"]
    stars = "★" * min(3, ["B", "A", "S", "SS", "SSS"].index(grade) + 1)
    print(f"  综合评级: {format_rating_badge(grade)} {colorize(stars, grade)}")
    print(f"  总得分: {colorize(str(score['total_score']), grade)}/{score['max_score']}")
    print(f"  主力贡献: {score['starter_score']}")
    print(f"  替补贡献: {score['substitute_score']}")
    
    print(format_line("="))
    print()


def cli_draw():
    """本地直接抽卡"""
    try:
        result = do_draw()
        display_lineup(result["lineup"], result["synergies"], result["score"])
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
        print("   请确保后端服务已启动 (uvicorn main:app --port 8000)", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="海克斯盲盒抽卡 CLI 工具 v2.0",
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
