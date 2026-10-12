# EARS patterns

EARS (Easy Approach to Requirements Syntax), Alistair Mavin et al., Rolls-Royce. Each pattern gives a requirement a testable shape.

| Pattern | Template | Example |
|---|---|---|
| Ubiquitous | The system shall [response]. | The system shall log every send with its reference. |
| Event-driven | When [trigger], the system shall [response]. | When an open task is due within 24 h, the system shall email each owner one reminder. |
| State-driven | While [state], the system shall [response]. | While a task is snoozed, the system shall not send reminders. |
| Unwanted behaviour | If [unwanted condition], then the system shall [response]. | If the provider rejects a send, then the system shall retry up to 3 times and alert. |
| Optional feature | Where [feature is included], the system shall [response]. | Where SMS is enabled, the system shall also text the owner. |
| Complex | While [state], when [trigger], the system shall [response]. | While a task is open, when its due time changes, the system shall cancel pending reminders. |

Rules of thumb: one "shall" per requirement; the trigger or state must be observable; failure behaviour gets its own "If ... then" requirement rather than a clause.
