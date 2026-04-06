"""
formatter.py — Format a Redmine issue dict into a Claude Code prompt.
"""

from textwrap import dedent


def format_prompt(
    issue: dict,
    include_comments: bool = True,
    include_instruction: bool = True,
) -> str:
    """
    Convert a Redmine issue dict into a markdown prompt for Claude Code.

    Args:
        issue: Raw issue dict from the Redmine API.
        include_comments: Whether to include journal/comment entries.
        include_instruction: Whether to append the closing instruction line.

    Returns:
        Formatted prompt string.
    """

    def named(field: str, default: str = "N/A") -> str:
        v = issue.get(field)
        if isinstance(v, dict):
            return v.get("name", default)
        return str(v) if v is not None else default

    def custom_field(name: str, default: str = "N/A") -> str:
        for f in issue.get("custom_fields", []):
            if f.get("name") == name:
                return str(f.get("value") or default)
        return default

    # ── Header fields ─────────────────────────────────────────────────────────
    lines = [
        f"## Bug Report — Issue #{issue['id']}",
        "",
        f"**Title:** {issue.get('subject', 'N/A')}",
        f"**Status:** {named('status')}",
        f"**Priority:** {named('priority')}",
        f"**Category:** {named('category')}",
        f"**Assignee:** {named('assigned_to')}",
        f"**Target version:** {named('fixed_version')}",
        f"**OS:** {custom_field('OS', 'Any')}",
        f"**Start date:** {named('start_date')}",
        f"**Created:** {issue.get('created_on', 'N/A')}",
        f"**Updated:** {issue.get('updated_on', 'N/A')}",
        "",
        "**Description:**",
        issue.get("description", "").strip(),
    ]

    # ── Journal comments ───────────────────────────────────────────────────────
    if include_comments:
        journals = issue.get("journals", [])
        comments = [j for j in journals if j.get("notes", "").strip()]
        if comments:
            lines.append("")
            lines.append("**Comments:**")
            for j in comments:
                author = j.get("user", {}).get("name", "?")
                created = j.get("created_on", "")
                note = j["notes"].strip()
                lines.append(f"- **{author}** ({created}):")
                lines.append(f"  {note}")

    # ── Attachments ───────────────────────────────────────────────────────────
    attachments = issue.get("attachments", [])
    if attachments:
        lines.append("")
        lines.append("**Attachments:**")
        for a in attachments:
            lines.append(f"- [{a['filename']}]({a.get('content_url', '')})")

    # ── Closing instruction ────────────────────────────────────────────────────
    if include_instruction:
        lines += [
            "",
            "---",
            "Please investigate the bug above. Identify the likely root cause, "
            "suggest where in the codebase to look, and propose a fix with code changes.",
        ]

    return "\n".join(lines) + "\n"
