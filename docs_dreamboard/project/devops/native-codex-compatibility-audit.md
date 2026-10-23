# Native Codex compatibility audit — 2026-10-23

Read-only GitHub inventory: 24 owner repositories, 797 PRs, 1,455 native issue
comments, 2,201 inline comments and 1,630 formal reviews. The excluded family
repository was not accessed. All PR states and every API page were included;
deleted objects and inaccessible historical versions cannot be collected.

Issue-comment families: 799 legacy clean replies, 214 receipts, 103 structured
summaries and 339 other native task/setup replies. Formal reviews were all
`COMMENTED`: 1,210 used the legacy review heading, 415 the receipt envelope,
two the finding envelope, and three had empty bodies. Inline severity remains
independent evidence. The corpus contains 18 nonempty clean closings plus an
empty closing, current/legacy help templates, SHA bindings and real null-state
pairs. Structured snapshots include clean, blocking, running, failed and null
finding states; trigger labels include `Manual request` and `PR opened`.

The table tests each pure receipt parser against the same 19 observed closings,
with a valid owner request and SHA. It is a component comparison, not a claim
that every full workflow passes or fails. “Contrary suffix accepted” means that
adding `Authentication leaks credentials.` to the clean sentence still passes
that parser; other independent checks may still block the PR. All tested code
ran offline with no token, child-process or network permission. Default-branch
source commits below make the result reproducible. Private source details stay
in local audit artifacts.

| Repository                                                                                               | Source commit                              | Accepted closings   | Contrary suffix accepted    |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------- | --------------------------- |
| [alex-neon](https://github.com/kiaquila/alex-neon)                                                       | `19c3b41eac29d31dcc895233647a06729b0b3788` | SHA presence only   | Verdict not checked         |
| [alphacentr](https://github.com/kiaquila/alphacentr)                                                     | `398d2672687883bfdf317803de1ebc451ec0e76b` | 19/19               | Yes                         |
| [capsule-zero](https://github.com/kiaquila/capsule-zero)                                                 | `e9ba5bf104dc63dabd11877a20f5b18f08b2a80c` | Substring verdict   | Requires follow-up          |
| [chaijana](https://github.com/kiaquila/chaijana)                                                         | `5263f5ad6172a00e5fb1296215ac59559df7b832` | 13/19               | No                          |
| [cinderella-factory](https://github.com/kiaquila/cinderella-factory)                                     | `429e6af57af9e0998edcdfddf23dbaf481407f68` | 19/19               | Yes                         |
| [comet-contribution-graph](https://github.com/kiaquila/comet-contribution-graph)                         | `d80ae6d886c2ccbe8a02286de4c84c20013b29e0` | 19/19               | Yes                         |
| [confiterias-viegener](https://github.com/kiaquila/confiterias-viegener)                                 | `602a9abb3e9857215764c4503e99672234befbc2` | No Actions workflow | —                           |
| [dreamboard](https://github.com/kiaquila/dreamboard)                                                     | `6c4d1ff40bad402c556d8fac41c1b627a2167c82` | 13/19               | No                          |
| [ember](https://github.com/kiaquila/ember)                                                               | `96f8eca8d136f7a65764aa7defa079d44f7d2b95` | 14/19               | No                          |
| [fathom](https://github.com/kiaquila/fathom)                                                             | `d3e0a424d417d0e0c994d79fcd6683467ae0566d` | 16/19               | No                          |
| [ha-bot](https://github.com/kiaquila/ha-bot)                                                             | `03d355165c183efff0584ee932a1a5e611fdfa54` | 3/19                | No                          |
| [kiaquila](https://github.com/kiaquila/kiaquila)                                                         | `58b72fb0b94bdee3d51939b277549847c9456376` | Static copy checks  | Native evidence not checked |
| [ks](https://github.com/kiaquila/ks)                                                                     | `715767a6e5ef9c331a00114f7c8bd727f967aba8` | 19/19               | Yes                         |
| [misha](https://github.com/kiaquila/misha)                                                               | `ef2013aafde01ba1f5d6f42be137e74a21c4641c` | SHA presence only   | Verdict not checked         |
| [nightwatch-html-reporter-per-browser](https://github.com/kiaquila/nightwatch-html-reporter-per-browser) | `d1dd565ab5ee87dff4cc662a74c346c9fc8b39a6` | No Actions workflow | —                           |
| [nome](https://github.com/kiaquila/nome)                                                                 | `b73b07aeee1d8a8dcfd488ea5a2c7627b692f56c` | 6/19                | No                          |
| [pallete-maker](https://github.com/kiaquila/pallete-maker)                                               | `d2063a330f6ea4dc7a6742934ec95cac358807ec` | 16/19               | No                          |
| [tone-of-voice](https://github.com/kiaquila/tone-of-voice)                                               | `1068dbc49b8991043b93220bebcf3e3a32687fb4` | 5/19                | No                          |
| [unicorn-hub](https://github.com/kiaquila/unicorn-hub)                                                   | `f672649258e7886d01acbd6cf83d5feca4ee6145` | 7/19                | No                          |
| [unicorn-hub-light](https://github.com/kiaquila/unicorn-hub-light)                                       | `46e8a76e220d1c9d5a3affc45b7f9b918776b42b` | No Actions workflow | —                           |
| [vb-influencer](https://github.com/kiaquila/vb-influencer)                                               | `c7d0dfc2fe9ea4f7ddd703840e2c409a96f2ab45` | 6/19                | No                          |

The dreamboard row records the pre-change default branch. This PR covers all
19 closings and rejects the contrary suffix. The 16-parser comparison includes
two private repositories: both accepted 19/19 and the contrary suffix. A third
private repository has no Actions workflows. The local report retains their
names and SHA evidence without publishing private repository details.

Missing-closing parsers outside dreamboard: chaijana (13/19), ember (14/19),
fathom (16/19), ha-bot (3/19), nome (6/19), pallete-maker (16/19), tone-of-voice
(5/19), unicorn-hub (7/19), vb-influencer (6/19). The same null lifecycle that
blocked dreamboard was observed in pallete-maker and unicorn-hub; each needs a
full-workflow replay as well as suffix coverage before a repair is considered
complete.

alphacentr, cinderella-factory, comet-contribution-graph, ks and the two private
parsers require stricter verdict boundaries despite accepting all closings.
alex-neon and misha accept a native reviewed-SHA annotation without proving a
clean verdict, and formal review state is not retrieved by their gate.
capsule-zero selects SHA-bound receipts then uses a broad no-issues substring;
its structured-summary family is not recognized by the selector. The profile
repository's job named AI Review checks fixed profile strings instead of
native review. Four repositories have no Actions workflows (including one
private repository); native app comments alone do not constitute a merge gate.

Only dreamboard is changed here. Other repositories were inspected read-only.
Before porting the fix, replay each repository's complete request, negative
history, security, deletion, dismissal and thread contract. Passing a suffix
matrix alone does not establish safe merge readiness.
