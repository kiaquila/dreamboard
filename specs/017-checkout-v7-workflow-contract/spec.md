# Checkout v7 workflow contract

## Goal

Record and consistently apply the `actions/checkout` v7 pin across GitHub
workflows while preserving the trusted-checkout security boundary.

## Scope

- Upgrade every repository-owned `actions/checkout` pin to v7.0.1.
- Correct all adjacent major-version annotations and the PR Guard ordering note.
- Update the durable AI PR workflow documentation to name the v7 pin used for
  trusted gate scripts.

## Non-goals

- Change checkout topology, workflow permissions, or gate behavior.
- Update unrelated GitHub Actions dependencies.
