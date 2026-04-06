"""
fetcher.py — Fetch issue data from Redmine REST API.
"""

import sys
import requests


def fetch_issue(issue_id: int, cfg: dict) -> dict:
    """
    Fetch a single issue (with journals and attachments) from Redmine.

    Returns the issue dict as returned by the Redmine API.
    Exits with an error message on HTTP or connection errors.
    """
    url = f"{cfg['url']}/issues/{issue_id}.json"
    params = {"include": "journals,attachments"}
    auth = (cfg["username"], cfg["password"])

    try:
        resp = requests.get(url, params=params, auth=auth, timeout=cfg["timeout"])
        resp.raise_for_status()
    except requests.exceptions.ConnectionError:
        print(f"Error: cannot connect to {cfg['url']}", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.Timeout:
        print(f"Error: request timed out after {cfg['timeout']}s", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        if status == 401:
            print("Error: authentication failed. Check REDMINE_USER and REDMINE_PASS.", file=sys.stderr)
        elif status == 403:
            print(f"Error: access denied for issue #{issue_id}.", file=sys.stderr)
        elif status == 404:
            print(f"Error: issue #{issue_id} not found.", file=sys.stderr)
        else:
            print(f"Error: HTTP {status} — {e}", file=sys.stderr)
        sys.exit(1)

    data = resp.json()
    if "issue" not in data:
        print("Error: unexpected response format from Redmine.", file=sys.stderr)
        sys.exit(1)

    return data["issue"]
