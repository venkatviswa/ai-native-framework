# spec.md: [feature]

Status: DRAFT | APPROVED vX (who, date)
Derived from: intent.md vX

## Definitions
<!-- Terms whose meaning changes behaviour: time and time zones, identity, units. -->
- [Term]: [exact meaning, e.g. "Due: the task's due_at in the owner's IANA time zone."]

## Requirements
<!-- One behaviour per line, numbered at the start of the line, in an EARS pattern. drift-check parses these lines. -->
R1 When [event], the system shall [response].
R2 While [state], the system shall [behaviour].
R3 If [unwanted condition], then the system shall [response].

## Acceptance criteria
<!-- At least one per requirement, including failure cases. Format: ACn (Rn) Given / When / Then. Suffixes such as AC3b are fine. -->
AC1 (R1) Given [context] When [action] Then [observable result]
AC2 (R2) Given [state] When [action] Then [observable result]
AC3 (R3) Given [failure: timeout, duplicate, restart] When [action] Then [observable result]

## Decisions recorded at the gate
- [decision] ([who], [date])

## Open questions
<!-- BLOCKING if it affects scope, safety, architecture or acceptance; otherwise give an owner and a date. -->
