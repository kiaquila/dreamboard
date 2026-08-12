# Spec 013: Dependabot Cooldown and Update Groups

## Problem

The GitHub Actions Dependabot configuration contains the SemVer-specific
cooldown settings. GitHub Actions supports `default-days`, but not
`semver-major-days`, `semver-minor-days`, or `semver-patch-days`.

Minor and patch version updates are also currently raised as separate pull
requests for each dependency within both configured ecosystems.

## Goal

Make the Dependabot configuration valid for GitHub Actions while reducing
routine update PR volume without bundling ecosystems together.

## Scope

- Keep `default-days: 7` and remove only the unsupported SemVer-specific
  cooldown keys from the `github-actions` entry.
- Add a `minor-and-patch` version-update group to each configured ecosystem
  (`github-actions` and `npm`).
- Keep major updates as individual pull requests.
- Keep npm's existing SemVer-specific cooldown values.
- Document this Dependabot policy in the DevOps delivery playbook.
- Pin the vulnerable transitive `brace-expansion` and `fast-uri` packages to
  their patched releases through pnpm overrides so the OSV Scan gate passes.

## Out of Scope

- Changing Dependabot schedules, labels, limits, or security-update behavior.
