#!/usr/bin/env python3
"""
Redmine Issue → Claude Code Prompt Tool

Usage:
    python main.py <issue_id> [options]

    python main.py 34284
    python main.py 34284 --copy        # copy to clipboard
    python main.py 34284 --out out.md  # save to file
    python main.py 34284 --no-comments # skip journal comments
"""

import argparse
import sys
from fetcher import fetch_issue
from formatter import format_prompt
from config import load_config, validate_config


def main():
    parser = argparse.ArgumentParser(
        description="Fetch a Redmine bug and format it as a Claude Code prompt."
    )
    parser.add_argument("issue_id", type=int, help="Redmine issue ID")
    parser.add_argument("--copy", action="store_true", help="Copy output to clipboard")
    parser.add_argument("--out", metavar="FILE", help="Save output to file")
    parser.add_argument("--no-comments", action="store_true", help="Exclude journal comments")
    parser.add_argument("--no-instruction", action="store_true", help="Omit the closing instruction line")
    args = parser.parse_args()

    cfg = load_config()
    validate_config(cfg)

    print(f"Fetching issue #{args.issue_id} from {cfg['url']} ...", file=sys.stderr)

    issue = fetch_issue(args.issue_id, cfg)
    prompt = format_prompt(
        issue,
        include_comments=not args.no_comments,
        include_instruction=not args.no_instruction,
    )

    # ── Output ────────────────────────────────────────────────────────────────
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(prompt)
        print(f"Saved to {args.out}", file=sys.stderr)

    if args.copy:
        try:
            import pyperclip
            pyperclip.copy(prompt)
            print("Copied to clipboard.", file=sys.stderr)
        except ImportError:
            print("pyperclip not installed. Run: pip install pyperclip", file=sys.stderr)

    # Always print to stdout so the caller can pipe: python main.py 34284 | claude
    print(prompt)


if __name__ == "__main__":
    main()
