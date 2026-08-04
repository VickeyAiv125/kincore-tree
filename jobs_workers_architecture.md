# Background Jobs & Workers Architecture (Execution Plan)

## 1. System Worker Pool & Job Control
The Background Job Control page is the **DevOps/Admin operational control center** for all background jobs running inside Kincore. 

**Strict Access Control:**
- This module belongs *strictly* to the Platform Admin Portal / DevOps Panel.
- It must **not** be exposed to the Family Admin Panel.
- Allowed roles: Super Admin, DevOps Admin.
- Prohibited roles: Family Admin, Branch Admin, Editor, Member, Guest.

## 2. Terminology Constraints
- **Never use "Pod"** or Kubernetes terminology.
- Use neutral terminology: `Main Worker`, `Backup Worker`, `PDF Worker`, `Storage Worker`, `Audit Worker`, `Notification Worker`.

## 3. Supported Jobs (12 Jobs)
*Note: KCC, Mall Sync, XP Achievement, and Search Index jobs have been permanently removed as they are out of scope.*

### A. The 9 Core Executable Jobs
1. **`JOB-BACKUP`**: Automated daily database backups.
2. **`JOB-THUMBNAIL`**: Media thumbnail compression via `sharp`.
3. **`JOB-STORAGE`**: Storage usage recalculation against quotas.
4. **`JOB-SUBSCRIPTION`**: Subscription status sync and feature gating.
5. **`JOB-ABUSE`**: Abuse report aggregation and escalation.
6. **`JOB-PDF`**: PDF report generation and temporary file cleanup.
7. **`JOB-AUDIT`**: Audit log archival to disk/storage.
8. **`JOB-STORY-EXPIRY`**: Expiring 24-hour stories.
9. **`JOB-NOTIFICATION`**: Dispatching push/email notifications.

### B. The 2 Internal System Jobs
10. **`JOB-WEBHOOK-RETRY`**: Retrying failed internal/external webhooks idempotently.
11. **`JOB-DEADLETTER-RECOVERY`**: Reprocessing jobs that failed their retry counts.

---

## 4. Implementation Plan: UI & "Schedule Job" Button
Currently, the UI is hardcoded or missing proper dynamic scheduling.
1. **API Endpoint (`POST /api/admin/devops/jobs/schedule`)**: Create a backend endpoint that accepts `jobId`, `cronExpression`, `priority`, `timeout_limit`, and `worker_group`. It will update the `background_jobs` table.
2. **UI Component (`JobControl.jsx`)**: Add a "Schedule Job" modal containing:
    - Cron string input (e.g., `0 0 * * *`)
    - Priority selector (High, Medium, Low)
    - Worker Group Dropdown
    - Concurrency Limit
3. **Audit Log**: The API must log the scheduling action to `audit_logs` with a mandatory "Reason".

---

## 5. Implementation Plan: Backend Job Logic
For each of the 12 jobs, we must replace the mocked `setTimeout` logic with real Supabase / Node.js API calls:

- **`JOB-PDF`**: Use `pdfkit` to generate the PDF, upload it to a Supabase Storage bucket (`kincore-reports`), and delete the local `/tmp` file. Query DB to hide minors.
- **`JOB-BACKUP`**: Query all tables, generate a JSON blob, upload it to a Supabase Storage bucket (`kincore-backups`).
- **`JOB-STORAGE`**: Query `SUM(size)` from the `media` table grouped by `family_space_id`. Update `storage_used` in `family_spaces`.
- **`JOB-THUMBNAIL`**: Fetch `image_raw` from Supabase Storage, process with `sharp` to 300x300 WebP, re-upload to Storage, update DB `type = 'image_compressed'`.
- **`JOB-AUDIT`**: Fetch logs > 30 days, upload JSON array to Supabase Storage (`kincore-archives`), then `DELETE` from DB.
- **`JOB-NOTIFICATION`**: Query `notifications` where `status = pending`. Dispatch simulated SendGrid email, update status to `sent`.

---

## 6. Testing Protocol (Agentic Verification)
Every code change to a job MUST be verified via a real API call script using an automated agent or the existing `verify_jobs.mjs` script. 

### Testing Requirements:
1. **Idempotency Test:** Trigger the job twice in a row. It must not duplicate records, double-charge, or crash.
2. **Real Data Test:** The script must query the database before and after the job runs to verify rows were actually altered (e.g., `storage_used` actually changed, `audit_logs` were actually deleted).
3. **Audit Verification:** The script must verify that the manual trigger inserted a record into `audit_logs` with a valid `reason`.
4. **Dead-Letter Test:** Simulate a failure and verify the job's `retry_count` increments, and that it enters `dead-letter` status after 3 failures.

### Execution Steps for DevOps Agents:
```bash
# 1. Start the backend with the new engine
npm run dev

# 2. Trigger the Schedule Endpoint via CURL
curl -X POST http://localhost:5000/api/admin/devops/jobs/JOB-PDF/schedule \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"cronExpression": "0 0 * * *", "priority": "high", "reason": "Daily reporting"}'

# 3. Run verification script
node scripts/verify_jobs.mjs --job=JOB-PDF
```
