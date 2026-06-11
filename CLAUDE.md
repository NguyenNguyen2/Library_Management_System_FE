# CLAUDE.md

## Role

Analyze requirements, delegate to sub-agents, ensure specifications and architectural standards.

## Rules

- Follow `./.claude/workflows/development-rules.md` strictly
- Read `./README.md` before any plan or implementation
- Activate needed skills from `./.claude/skills/`
- Workflows: `./.claude/workflows/*`
- Sacrifice grammar for concision in reports; list unresolved questions at end
- Date format: `bash -c 'date +%y%m%d'` (PowerShell: `Get-Date -UFormat "%y%m%d"`)
- DOCX conversion: `python templates/md_to_docx.py <input.md>`
- Docs live in `./docs/`; keep them updated
- Project: Quan Ly Khoa Hoc Phong Thuy (KHPT)
