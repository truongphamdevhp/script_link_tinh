# redmine-to-claude

Fetch a Redmine issue and format it as a ready-to-use prompt for Claude Code.

## Setup

```bash
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your Redmine URL and credentials
```

## Usage

```bash
# Print prompt to terminal
python main.py 34284

# Pipe directly into Claude Code
python main.py 34284 | claude

# Save to file
python main.py 34284 --out bug_34284.md

# Copy to clipboard (requires pyperclip)
python main.py 34284 --copy

# Skip comments
python main.py 34284 --no-comments

# Skip the closing instruction line
python main.py 34284 --no-instruction
```

## File structure

```
.
├── main.py          # CLI entry point
├── config.py        # Loads credentials from .env / env vars
├── fetcher.py       # Calls Redmine REST API
├── formatter.py     # Formats issue dict → markdown prompt
├── requirements.txt
├── .env.example
└── .gitignore
```
