# Context Directory

This directory is reserved for user-provided context documents that Prisma PM commands can reference.

## Usage

Place documents here that provide additional context for your product work:

- Market research reports
- Competitive analysis
- User interview transcripts
- Analytics exports
- Stakeholder requirements

## How Commands Use Context

When running `/pm:discover`, `/pm:define`, or other commands, you can reference files in this directory using Claude Code's `@` syntax:

```
/pm:discover "checkout abandonment" @context/user-interviews.md
```

The command will incorporate the referenced document into its analysis.

## Not Tracked by Git

Consider adding this directory to `.gitignore` if your context documents contain sensitive information.
