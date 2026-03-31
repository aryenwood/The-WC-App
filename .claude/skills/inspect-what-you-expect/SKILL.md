---
name: inspect-what-you-expect
description: Post-build validation pattern for the WC App. After every function build, define expected outputs explicitly and verify each one before closing the task. Use this skill after completing any feature, fix, or refactor to catch bugs before they ship.
---

# Inspect What You Expect

Post-build validation discipline for the WC App. Every task must define its expected outputs and verify each one before marking complete.

## When to Use

After completing ANY of:
- New feature or function
- Bug fix
- Refactor that touches data flow
- Firestore read/write changes
- Role-gated UI changes
- Email or notification triggers

## The Pattern

### Step 1: Define Expected Outputs

Before closing a task, write down every observable effect:

```
EXPECTED:
1. [Data] What should be written to Firestore/localStorage
2. [UI] What should appear/disappear on screen
3. [Side Effect] What notification/email/push should fire
4. [Guard] What should NOT happen for excluded roles/states
```

### Step 2: Verify Each Output

For each expected output, run one of the verification patterns below. Do not skip any.

### Step 3: Report Pass/Fail

```
VERIFICATION:
1. [PASS] Firestore doc written to organizations/{orgId}/appointments/{id}
2. [PASS] Control Center card shows with count
3. [FAIL] Email not written to mail collection — toEmail resolved empty
4. [PASS] Canvasser role does not see manager card
```

If any fail, fix before closing.

## WC App Verification Patterns

### Firestore Writes

**Verify a document was written:**
```
grep fbDb.collection('TARGET_COLLECTION')...set\|add\|update
```
Check:
- Is the write inside a reachable code path? (not behind an early return)
- Is `orgId` resolved from `localStorage.getItem('wc_org_id')`? (not `user.uid`)
- Does the write have `.catch()` error handling?
- Is the write inside a hostname guard that blocks your test domain?

**Common bugs:**
- Writing to `organizations/{userId}` instead of `organizations/{orgId}`
- `orgId` fallback `|| user.uid` creating ghost documents
- Hostname guard blocking production domains (only localhost/firebase should be blocked)

### localStorage State

**Verify a key is set correctly:**
```
grep localStorage.setItem('KEY_NAME')
grep localStorage.getItem('KEY_NAME')
```
Check:
- Is the write guarded for super_admin? (SA role must never be overwritten)
- Is there a fallback on read? (`|| 'default'` or `|| []`)
- Is `JSON.parse()` wrapped in try/catch?
- After writing, does the consuming function re-read, or does it use stale state?

**Common bugs:**
- `JSON.parse(localStorage.getItem('x'))` where x is null → returns null, not undefined
- Writing role during onboarding/invite that overwrites SA stamp
- Reading `wc_admin` before `applyOrgSettings()` has populated it

### Email Triggers (Firebase Trigger Email)

**Verify an email fires:**
```
grep fbDb.collection('mail').add
```
Check:
- Is `toEmail` resolved and non-empty? (trace `_resolveNotifyEmail()` or `_resolveNotifyEmailAsync()`)
- Is the hostname guard allowing your domain? (should block only localhost, 127.0.0.1, firebase dev domains)
- Is the function actually called? (trace from trigger → function call)
- Is the `to` field a valid email, not empty string `''`?
- Does the mail doc have both `to` and `message: { subject, html }`?

**Common bugs:**
- `_resolveNotifyEmail()` returns `''` because `dispoEmailTo` not in localStorage yet
- Empty string added to Set → iterates and writes `{ to: '' }` → Trigger Email silently drops
- Function exists but is never called from the trigger point
- Two booking forms (main + OTD) but only one wired to the email path

### Role Checks

**Verify role-gated UI:**
```
grep getActiveRole\|wc_user_role
```
Check:
- Does the guard include ALL admin roles? (`super_admin`, `master_admin`, `manager`)
- Does it check both `getActiveRole()` AND `localStorage.getItem('wc_user_role')` for timing safety?
- Is the guard on the render path, not just the data path?
- Does closing a modal (e.g., Master Admin sheet) restore role correctly?

**Common bugs:**
- `getActiveRole()` returns stale value before Firebase resolves
- Guard checks `manager` and `master_admin` but forgets `super_admin`
- `closeMasterAdmin()` falls back to `'canvasser'` instead of preserving SA role

### Push Notifications

**Verify push sends:**
```
grep sendNotification\|_notifyManagers
```
Check:
- Is `fcmToken` present on target user docs in Firestore?
- Is the Firestore query scoped to correct `orgId`?
- Does the query filter include correct roles? (`['manager', 'master_admin']`)
- Is `self-notify` excluded? (`if (uid === fbAuth.currentUser.uid) return`)

### DOM Element References

**Verify getElementById targets exist:**
```
grep getElementById('TARGET_ID')
```
Check:
- Does the HTML element with that ID exist in the DOM?
- If the element was removed, is the JS reference also removed?
- Does the JS have a null check before `.addEventListener()` or `.style`?

**Common bugs:**
- HTML element removed but JS still calls `getElementById` → returns null → silent failure
- Event listener attached at top-level scope before DOM is ready

## Checklist Template

Copy this for every task:

```
## Post-Build Verification: [TASK NAME]

### Expected Outputs
- [ ] Data: ___
- [ ] UI: ___
- [ ] Side Effect: ___
- [ ] Guard: ___

### Verification Results
- [ ] Data: [PASS/FAIL] ___
- [ ] UI: [PASS/FAIL] ___
- [ ] Side Effect: [PASS/FAIL] ___
- [ ] Guard: [PASS/FAIL] ___

### Dual-Form Check
- [ ] If this feature exists in both the main form AND the OTD form, both are wired identically

### Dead Code Check
- [ ] If HTML elements were removed, JS/CSS references were also removed
```
