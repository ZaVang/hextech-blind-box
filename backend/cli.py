#!/usr/bin/env python3
"""
海克斯盲盒抽卡 CLI 工具 v3.0
用法:
  python cli.py              # 单抽
  python cli.py --multi 10   # 十连抽
  python cli.py --backend    # 调用 API 抽卡
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from main import do_draw, do_draw10, RATING_COLORS, DRAW_PROBABILITIES

POSITION_DISPLAY = {
    "上单": "TOP", "打野": "JUG", "中单": "MID", "下路": "ADC", "辅助": "SUP"
}

ANSI_COLORS = {
    "SSS": "\033[38;2;255;215;0m",
    "SS": "\033[38;2;255;105;180m",
    "S": "\033[38;2;255;140;0m",
    "A": "\033[38;2;147;112;219m",
    "B": "\033[38;2;65;105;225m",
}
RESET = "\033[0m"


def colorize(text: str, rating: str = "B") -> str:
    color = ANSI_COLORS.get(rating, "")
    return f"{color}{text}{RESET}"


def format_rating_badge(rating: str) -> str:
    return colorize(f"[{rating}]", rating)


def display_single_lineup(lineup: dict, synergies: list, score: dict, idx: int = None):
    """展示单次阵容"""
    title = f"第{idx}抽" if idx else "抽卡结果"
    print(colorize("─" * 55, "B"))
    print(colorize(f"  🎴 {title}", "A"))
    print(colorize("─" * 55, "B"))
    
    # 主力
    for player in lineup["starters"]:
        pos = POSITION_DISPLAY.get(player["position"], player["position"])
        r = player["rating"]
        print(f"  {colorize(pos, r):5} {player['name']:12} {player['team']:10} {player['era']:8} {format_rating_badge(r)}")
    
    # 替补
    print(colorize("  ────", "B"))
    for player in lineup["substitutes"]:
        pos = POSITION_DISPLAY.get(player["position"], player["position"])
        r = player["rating"]
        print(f"  {colorize('→' + pos, r):6} {player['name']:12} {player['team']:10} {player['era']:8} {format_rating_badge(r)}")
    
    # 羁绊
    if synergies:
        tags = " ".join([f"{colorize(syn['tag'], 'S')}({syn['count']})" for syn in synergies[:3]])
        print(f"  {colorize('⚡', 'S')} {tags}")


def display_lineup_summary(score: dict, idx: int, is_best: bool = False):
    """展示阵容摘要"""
    grade = score["grade"]
    star = "★★★" if score["total_score"] >= 24 else ("★★" if score["total_score"] >= 18 else "★")
    
    if is_best:
        prefix = colorize("👑", "SSS")
        grade_str = colorize(f"[{grade}]", grade)
        score_str = colorize(f"{score['total_score']}/30", grade)
        print(f"{prefix} 第{idx}抽 {grade_str} {star} {score_str} ← 最高分!")
    else:
        prefix = f"  第{idx}抽"
        grade_str = format_rating_badge(grade)
        print(f"{prefix} {grade_str} {star} {score['total_score']}/30")


def display_multi_draw(results: list):
    """展示十连抽结果"""
    print()
    print(colorize("═" * 55, "SSS"))
    print(colorize("  🎰  海克斯盲盒 - 十连抽  🎰", "SSS"))
    print(colorize("═" * 55, "SSS"))
    
    # 概率
    probs = " | ".join([f"{r}:{int(DRAW_PROBABILITIES[r]*100)}%" for r in ["SSS", "SS", "S", "A", "B"]])
    print(f"\n  抽卡概率: {colorize(probs, 'A')}")
    
    # 找到最高分
    best_idx = max(range(len(results)), key=lambda i: results[i]["score"]["total_score"])
    
    # 摘要列表
    print()
    print(colorize("  📊 抽卡结果", "A"))
    print(colorize("  " + "─" * 45, "B"))
    for i, result in enumerate(results):
        is_best = (i == best_idx)
        display_lineup_summary(result["score"], result["index"], is_best)
    
    print()
    print(colorize("  📋 详细阵容 (按评分排序)", "A"))
    print(colorize("  " + "─" * 45, "B"))
    
    for i, result in enumerate(results):
        is_best = (i == best_idx)
        print()
        lineup = result["lineup"]
        synergies = result["synergies"]
        score = result["score"]
        
        # 获取选手名列表
        starter_names = [p["name"] for p in lineup["starters"]]
        sub_names = [p["name"] for p in lineup["substitutes"]]
        lineup_str = " | ".join(starter_names[:3]) + f"\n  {('... ' + ' | '.join(starter_names[3:])) if len(starter_names) > 3 else ''}"
        
        grade = score["grade"]
        star = "★★★" if score["total_score"] >= 24 else ("★★" if score["total_score"] >= 18 else "★")
        
        if is_best:
            print(colorize(f"  👑 第{result['index']}抽 {colorize('[', grade)}{colorize(grade, grade)}{colorize(']', grade)} {star} {colorize(str(score['total_score']), grade)}/30 ← 最高分", "SSS"))
        else:
            print(f"  第{result['index']}抽 {format_rating_badge(grade)} {star} {score['total_score']}/30")
        
        print(f"       主力: {' '.join(starter_names)}")
        print(f"       替补: {sub_names[0]}")
        
        if synergies:
            tags_str = " ".join([f"{syn['tag']}({syn['count']})" for syn in synergies[:2]])
            print(f"       羁绊: {colorize(tags_str, 'S')}")
    
    # 统计
    grades = [r["score"]["grade"] for r in results]
    sss_count = grades.count("SSS")
    ss_count = grades.count("SS")
    s_count = grades.count("S")
    
    print()
    print(colorize("  📈 统计", "A"))
    print(colorize("  " + "─" * 45, "B"))
    print(f"  SSS: {colorize(str(sss_count), 'SSS')} | SS: {colorize(str(ss_count), 'SS')} | S: {colorize(str(s_count), 'S')}")
    print(f"  最高分: {colorize(str(results[0]['score']['total_score']), results[0]['score']['grade'])}/30")
    print()
    print(colorize("═" * 55, "SSS"))


def cli_draw():
    """本地单抽"""
    try:
        result = do_draw()
        print()
        print(colorize("═" * 55, "SSS"))
        print(colorize("  🎰  海克斯盲盒 - 传奇阵容  🎰", "SSS"))
        display_single_lineup(result["lineup"], result["synergies"], result["score"])
        print()
        print(colorize("─" * 55, "B"))
        grade = result["score"]["grade"]
        print(f"  🏆 综合评级: {format_rating_badge(grade)} {colorize('★'*3, grade)}")
        print(f"  总得分: {colorize(str(result['score']['total_score']), grade)}/30")
        print(colorize("═" * 55, "SSS"))
        print()
        return result
    except Exception as e:
        print(f"❌ 抽卡失败: {e}", file=sys.stderr)
        sys.exit(1)


def cli_draw10():
    """本地十连抽"""
    try:
        results = do_draw10()
        display_multi_draw(results)
        return results
    except Exception as e:
        print(f"❌ 抽卡失败: {e}", file=sys.stderr)
        sys.exit(1)


def api_draw(count: int = 1):
    """通过 API 抽卡"""
    try:
        import requests
        if count == 1:
            response = requests.get("http://localhost:8000/api/draw", timeout=10)
        else:
            response = requests.get(f"http://localhost:8000/api/draw?count={count}", timeout=30)
        
        response.raise_for_status()
        result = response.json()
        
        if result.get("success"):
            if count == 1:
                data = result["data"]
                display_single_lineup(data["lineup"], data["synergies"], data["score"])
            else:
                draws = result["data"]["draws"]
                display_multi_draw(draws)
        else:
            print(f"❌ API 返回错误: {result}", file=sys.stderr)
            sys.exit(1)
    except ImportError:
        print("❌ 需要安装 requests 库", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ API 调用失败: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="海克斯盲盒抽卡 CLI 工具 v3.0")
    parser.add_argument("-m", "--multi", type=int, default=1, help="连抽次数 (1-10)")
    parser.add_argument("-b", "--backend", action="store_true", help="通过 API 抽卡")
    
    args = parser.parse_args()
    count = min(max(args.multi, 1), 10)
    
    if args.backend:
        api_draw(count)
    else:
        if count == 1:
            cli_draw()
        else:
            cli_draw10()


if __name__ == "__main__":
    main()
