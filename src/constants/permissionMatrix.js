/**
 * Platform permission matrix shown in Business → System Config.
 * Aligned with backend/src/utils/familyRolePolicy.js hierarchy:
 *   owner → family-admin → co-admin → branch-admin → editor → member
 *
 * Business Admin is platform-wide (not a family membership role).
 * Owner may also grant limited Family Admin role-modify delegations.
 */

export const MATRIX_ROLES = [
    { key: 'business', label: 'Bus Admin' },
    { key: 'owner', label: 'Fam Owner' },
    { key: 'family-admin', label: 'Fam Admin' },
    { key: 'co-admin', label: 'Co-Admin' },
    { key: 'branch-admin', label: 'Branch Admin' },
    { key: 'editor', label: 'Editor' },
    { key: 'member', label: 'Member' }
];

/** 1 = yes, 0 = no, 0.5 = only if Owner delegated */
export const MATRIX_ACTIONS = [
    { action: 'Platform System Config', perms: [1, 0, 0, 0, 0, 0, 0] },
    { action: 'Approve Family Space Requests', perms: [1, 0, 0, 0, 0, 0, 0] },
    { action: 'Transfer Family Ownership', perms: [0, 1, 0, 0, 0, 0, 0] },
    { action: 'Assign Family Admin / Co-Admin', perms: [0, 1, 0.5, 0, 0, 0, 0] },
    { action: 'Assign Branch Admin / Editor / Member', perms: [0, 1, 1, 1, 0, 0, 0] },
    { action: 'Approve Member Claims', perms: [1, 1, 1, 1, 0, 0, 0] },
    { action: 'Edit Family Tree', perms: [1, 1, 1, 1, 1, 1, 0] },
    { action: 'Upload Media', perms: [1, 1, 1, 1, 1, 1, 1] },
    { action: 'Delete Records', perms: [1, 1, 1, 1, 0, 0, 0] },
    { action: 'Approve Merge Requests', perms: [1, 1, 1, 1, 0, 0, 0] },
    { action: 'Handle Abuse Reports (Family)', perms: [1, 1, 1, 1, 0, 0, 0] },
    { action: 'Manage Family Billing', perms: [1, 1, 0, 0, 0, 0, 0] },
    { action: 'Invite Users', perms: [1, 1, 1, 1, 1, 0, 0] },
    { action: 'Export Family Data', perms: [1, 1, 1, 0, 0, 0, 0] },
    { action: 'Change Family Governance Mode', perms: [1, 1, 0.5, 0, 0, 0, 0] }
];

export const CONFIG_DEFAULTS = {
    GOVERNANCE_MODE: 'admin_controlled',
    MANUAL_APPROVAL_MODE: true,
    max_branches_default: 50,
    notification_push_enabled: true,
    notification_email_digest: true,
    security_session_expiry: 3600,
    audit_retention_days: 90,
    rollout_genealogy_matching: 0,
    rollout_kcc_microtrans: 0,
    storage_free_plan_gb: 500,
    storage_premium_plan_gb: 2000,
    storage_overage_rule: 'warn_restrict_upgrade',
    storage_upload_max_mb: 100,
    storage_allowed_types: 'JPEG, PNG, WEBP, GIF, MP4, MOV'
};

export const OVERAGE_RULE_OPTIONS = [
    { value: 'warn_only', label: 'Warn Only' },
    { value: 'warn_restrict_upgrade', label: 'Warn / Restrict Upload / Require Upgrade' },
    { value: 'hard_block', label: 'Hard Block Uploads' }
];
