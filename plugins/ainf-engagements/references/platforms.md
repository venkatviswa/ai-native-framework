# Platform notes: Salesforce and cloud-native

The artifacts and gates do not change with the platform. What goes inside them does.

| | Salesforce (Service Cloud, Flow, Apex) | Cloud-native (Kafka, Postgres, Kubernetes) |
|---|---|---|
| POC claim | "Email-to-Case with assignment rules routes 95% of 200 sample emails to the right queue with no Apex" | "Consumer lag stays under 5 s at 2,000 orders/s on the proposed topics" |
| Estimate rests on | objects, automation (Flow vs Apex), integrations, licences, data volumes | topics, schemas, services, environments |
| Environments | sandboxes: dev → SIT (partial copy) → UAT (full copy) → production | Terraform workspaces / namespaces per environment |
| Limits as plan constraints | governor limits (SOQL rows, DML, CPU time, callouts), API limits, record locking on parent records | service quotas, SLOs, partition counts, connection pools |
| Unit tests | Apex test classes (`*Test.cls`), Flow tests; name methods after the criterion | unit tests per service |
| SIT | integrations against SIT endpoints, mock loads, permission sets per persona | contract tests between services plus one end-to-end run |
| Migration | Data Loader / Bulk API, parents before children, external IDs, reconciliation counts | versioned Postgres migrations with rollback |
| `.ainf.json` | `codeDirs: ["force-app"]`, `testPatterns` add `force-app/**/classes/*Test.cls` | defaults usually fit |
| Incident: read-only | debug logs, `sf data query` with a WHERE and LIMIT, setup audit trail, login history | `kubectl get/describe/logs`, read-only DB role with bounded queries, dashboards |
| Incident: needs a human | deactivating a flow or trigger, pausing an integration user, data fixes, deploys, quick deploys | rolling back a deployment or flag, scaling, killing sessions, offset resets |
| Typical incident shape | nightly integration fails, records lock (`UNABLE_TO_LOCK_ROW`) after a release | Friday rollout, consumers fall behind, Postgres rows lock |
