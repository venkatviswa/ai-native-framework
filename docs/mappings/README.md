# Mappings: the framework inside the method you already use

The artifact chain does not replace your delivery method. It sits underneath it: the method decides *what* gets worked on and *when*; the chain makes each piece of work traceable from promise to commit, with a named person at each gate. These notes show where each artifact and gate lands in three common setups.

| Method | Where intent comes from | Where spec and plan sit | Where the gates sit | What usually needs adjusting |
|---|---|---|---|---|
| [SAFe](safe.md) | Epic hypothesis, feature benefit hypothesis | One spec per feature; plan per feature or enabler | PI planning (1–3), iteration planning (4), system demo (5) | ID prefixes per feature; `--stories` for the team backlog |
| [Shape Up](shape-up.md) | The pitch | Spec and plan written during the cycle, by the team | Betting table (1), end of week one (2–3), scope hammering (4), ship (5) | Gate 2 later than usual; tasks follow scopes |
| [Team Topologies](team-topologies.md) | Stream-aligned team's outcome | Per team; platform contracts as plan.md contracts | Owned by the team that owns the stream | Cross-team contracts and prefixes per team |

Common to all three:
- **IDs stay in the repo.** The tracker keeps keys, status and estimates; `stories.md` maps keys to IDs. Nobody copies the spec into tickets.
- **Gates name a person, not a ceremony.** A ceremony is where a gate usually happens; the approver is still named in `constitution.md`.
- **Proportionate rigour still applies.** `/ainf:triage` decides how much of the chain a change needs, whatever the method.
