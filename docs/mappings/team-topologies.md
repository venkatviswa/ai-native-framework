# Team Topologies

Team Topologies describes four team types (stream-aligned, platform, enabling, complicated-subsystem) and three interaction modes (collaboration, X-as-a-Service, facilitating). It is about who owns what, and how teams depend on each other, rather than a delivery cadence. The framework maps onto ownership and onto the contracts between teams.

## Team types

| Team type | How it uses the framework |
|---|---|
| Stream-aligned | Owns the full chain for its stream: intent to commit. Its features carry its prefixes, and its people are the approvers in `constitution.md`. |
| Platform | Publishes contracts other teams build against. Each platform capability is a feature with its own spec; its `R#` and `AC#` lines are the service's promise. Consumers cite them with the full ID (`PLAT-R4`) in their plan's contracts section. |
| Enabling | Spreads the practice: runs `/ainf:init` with a team, coaches the first gates, tunes `docs/_templates/` and the constitution. Owns no feature IDs. |
| Complicated-subsystem | Owns a spec for the subsystem's interface and a deeper plan. Stream teams see the interface spec, not the internals. |

## Interaction modes

| Mode | Framework practice |
|---|---|
| Collaboration | Two teams share one spec for a time. Use `/ainf:split` to name one owner per requirement and the integration tests nobody owns yet. End the collaboration by moving each requirement to its owner's feature. |
| X-as-a-Service | In a shared repository, the consuming plan cites the provider's IDs and `drift-check --impact PLAT-R4` shows every consumer a change touches. A change to the contract goes through a CR owned by the platform team. |
| Facilitating | The enabling team pairs at gates; it never approves on the team's behalf. |

## Practical notes

- **Cognitive load is the reason for the chain's size limits.** A spec that one team cannot hold in its head is a sign the stream is too wide, not that the spec needs more sections.
- **Prefixes follow ownership.** When a capability moves to another team, its feature folder moves with it and keeps its prefix, so old citations stay valid.
- **Constitution per repo, rules per team.** If several teams share a repository, keep one constitution with team-specific approvers in the Approvers table, rather than one constitution per team.
- **Contracts across repositories are not checked.** drift-check reads one repository, so ID citations resolve only within it (a monorepo works fully). In a consumer repo, a provider ID such as `PLAT-R4` would be reported stale. Reference another repository's contract by link and version in the plan's contracts section, without the ID form, and rely on the provider's own CI and change requests for its promises.
