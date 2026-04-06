"""
config.py — Load Redmine credentials from .env or environment variables.

Priority: environment variables > .env file > defaults
"""

import os
import sys
from pathlib import Path


def load_config() -> dict:
    """Load config, trying .env file first then environment variables."""
    _load_dotenv()
    return {
        "url":      os.getenv("REDMINE_URL", "").rstrip("/"),
        "username": os.getenv("REDMINE_USER", ""),
        "password": os.getenv("REDMINE_PASS", ""),
        "timeout":  int(os.getenv("REDMINE_TIMEOUT", "15")),
    }


def validate_config(cfg: dict) -> None:
    """Exit with a helpful message if required fields are missing."""
    missing = []
    if not cfg["url"]:
        missing.append("REDMINE_URL")
    if not cfg["username"]:
        missing.append("REDMINE_USER")
    if not cfg["password"]:
        missing.append("REDMINE_PASS")

    if missing:
        print("Error: missing required config:", ", ".join(missing), file=sys.stderr)
        print("Set them in .env or as environment variables.", file=sys.stderr)
        print("Example .env:", file=sys.stderr)
        print("  REDMINE_URL=https://redmine.yourcompany.com", file=sys.stderr)
        print("  REDMINE_USER=your_username", file=sys.stderr)
        print("  REDMINE_PASS=your_password", file=sys.stderr)
        sys.exit(1)


def _load_dotenv() -> None:
    """Minimal .env parser — no external dependency needed."""
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        return

    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            # Don't override already-set env vars
            if key and key not in os.environ:
                os.environ[key] = value
