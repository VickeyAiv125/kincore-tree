# 🎯 ANTIGRAVITY ACTION PLAN
## Clear Instructions: What's Missing, What's Needed, How to Build It

---

## 📊 CURRENT STATUS

```
What Antigravity Built:
✅ POST /family-spaces (create family)
✅ GET /family-spaces (list families)
✅ POST /clantree/person (add person)
✅ POST /clantree/person-relations (add relations)
✅ GET /admin/risk/scores (risk scores)
✅ POST /admin/claims/resolve (resolve claims)
✅ GET /admin/orders (view orders)
✅ GET /users/me (user profile)
✅ POST /claims (claim person)
✅ GET /posts (get feed)
✅ POST /posts/:id/reactions (like post)
✅ GET /kcc/ledger (KCC history)
✅ POST /events/gift-swap/rsvp (RSVP event)

TOTAL: 15 endpoints ❌ NOT ENOUGH
```

---

## ❌ WHAT'S MISSING (115+ endpoints)

### **TIER 1: AUTHENTICATION (Missing 8 endpoints)**

```
MISSING:
├─ POST /auth/signup ❌
├─ POST /auth/login ❌
├─ POST /auth/logout ❌
├─ POST /auth/refresh-token ❌
├─ POST /auth/request-otp ❌
├─ POST /auth/verify-otp ❌
├─ PATCH /users/me (update profile) ❌
└─ POST /auth/change-password ❌

WHY CRITICAL:
- No login system = app can't work
- This is foundation of everything
- MUST BUILD FIRST

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 1)
```

---

### **TIER 2: FAMILY MANAGEMENT (Missing 6 endpoints)**

```
EXISTING (partial):
✅ POST /family-spaces
✅ GET /family-spaces

MISSING:
├─ GET /family-spaces/{id} ❌
├─ PATCH /family-spaces/{id} (edit family) ❌
├─ DELETE /family-spaces/{id} ❌
├─ GET /family-spaces/{id}/members ❌
├─ POST /family-spaces/{id}/invite ❌
└─ DELETE /family-spaces/{id}/members/{userId} ❌

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 2)
```

---

### **TIER 3: GENEALOGY (Missing 8 endpoints)**

```
EXISTING (partial):
✅ POST /clantree/person
✅ POST /clantree/person-relations

MISSING:
├─ GET /clantree/persons/{id} ❌
├─ GET /clantree/persons?search=X (search) ❌
├─ PATCH /clantree/persons/{id} (edit person) ❌
├─ DELETE /clantree/persons/{id} ❌
├─ DELETE /clantree/relations/{id} ❌
├─ GET /clantree/tree (view full tree) ❌
├─ GET /clantree/claims/{id} ❌
└─ And 1 more for person relations view ❌

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 3-5)
```

---

### **TIER 4: POSTS & FEED (Missing 10 endpoints)**

```
EXISTING (partial):
✅ GET /posts
✅ POST /posts/:id/reactions

MISSING:
├─ POST /posts (create post) ❌
├─ GET /posts/{id} (single post) ❌
├─ PATCH /posts/{id} (edit post) ❌
├─ DELETE /posts/{id} (delete post) ❌
├─ DELETE /posts/{id}/reactions/{reactionId} ❌
├─ POST /posts/{id}/comments ❌
├─ GET /posts/{id}/comments ❌
├─ PATCH /comments/{id} ❌
├─ DELETE /comments/{id} ❌
└─ POST /comments/{id}/reactions ❌

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 4-5)
```

---

### **TIER 5: STORIES (Missing 5 endpoints - ALL)**

```
MISSING ALL:
├─ POST /stories (create story) ❌
├─ GET /stories (list stories) ❌
├─ POST /stories/{id}/views (mark viewed) ❌
├─ POST /stories/{id}/reactions (react) ❌
└─ DELETE /stories/{id} (delete story) ❌

NOTE: Stories expire after 24 hours

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 6)
```

---

### **TIER 6: EVENTS (Missing 7 endpoints)**

```
EXISTING (partial):
✅ POST /events/gift-swap/rsvp

MISSING:
├─ POST /events (create event) ❌
├─ GET /events (list events) ❌
├─ GET /events/{id} (single event) ❌
├─ PATCH /events/{id} (edit event) ❌
├─ DELETE /events/{id} ❌
├─ GET /events/{id}/participants ❌
└─ DELETE /events/{id}/rsvp/{rsvpId} ❌

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 7)
```

---

### **TIER 7: CONNECTIONS (Missing 3 endpoints - ALL)**

```
MISSING ALL:
├─ GET /connections/families ❌
├─ POST /connections/families ❌
└─ GET /connections/blocked ❌

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 8)
```

---

### **TIER 8: K-MALL (Missing 7 endpoints)**

```
EXISTING (partial):
✅ GET /admin/orders

MISSING:
├─ GET /mall/products ❌
├─ GET /mall/products/{id} ❌
├─ POST /mall/orders ❌
├─ GET /mall/orders ❌
├─ GET /mall/orders/{id} ❌
├─ PATCH /mall/orders/{id}/cancel ❌
└─ GET /mall/cart ❌

NOTE: These call BigK API:
- https://bigk-production.up.railway.app/api/v1/kmall/...

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 8)
- 08_CLIENT_API_INTEGRATION_GUIDE.md
```

---

### **TIER 9: KCC WALLET (Missing 4 endpoints)**

```
EXISTING (partial):
✅ GET /kcc/ledger

MISSING:
├─ GET /kcc/wallet ❌
├─ GET /kcc/balance ❌
├─ POST /kcc/spend ❌
└─ POST /kcc/transfer ❌

NOTE: These call BigK API:
- https://bigk-production.up.railway.app/api/v1/app/...

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 9)
- 08_CLIENT_API_INTEGRATION_GUIDE.md
```

---

### **TIER 10: MEDIA (Missing 4 endpoints - ALL)**

```
MISSING ALL:
├─ POST /media/upload ❌
├─ GET /media/{id} ❌
├─ DELETE /media/{id} ❌
└─ PATCH /media/{id} ❌

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 10)
```

---

### **TIER 11: NOTIFICATIONS (Missing 3 endpoints - ALL)**

```
MISSING ALL:
├─ GET /notifications ❌
├─ PATCH /notifications/{id}/read ❌
└─ DELETE /notifications/{id} ❌

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 11)
```

---

### **TIER 12: PUBLIC DIRECTORY (Missing 3 endpoints - ALL)**

```
MISSING ALL:
├─ GET /public/people/search ❌
├─ GET /public/people/{id} ❌
└─ POST /public/contact-request ❌

REFERENCE:
- APP_ONLY_API_DOCUMENTATION.md (Section 12)
```

---

### **TIER 13: ADMIN ENDPOINTS (Missing 50+ endpoints - MOST MISSING)**

```
MOSTLY MISSING:

ADMIN AUTH (0/3):
├─ POST /admin/auth/login ❌
├─ GET /admin/auth/me ❌
└─ POST /admin/auth/refresh ❌

DASHBOARD (0/3):
├─ GET /admin/dashboard ❌
├─ GET /admin/metrics ❌
└─ GET /admin/health ❌

FAMILY MANAGEMENT (0/6):
├─ GET /admin/familyspaces ❌
├─ GET /admin/familyspaces/{id} ❌
├─ PATCH /admin/familyspaces/{id}/suspend ❌
├─ PATCH /admin/familyspaces/{id}/reinstate ❌
├─ GET /admin/familyspaces/{id}/risk-score ❌
└─ POST /admin/familyspaces/{id}/credits ❌

BILLING (0/4):
├─ GET /admin/billing ❌
├─ GET /admin/billing/invoices ❌
├─ POST /admin/billing/refunds ❌
└─ POST /admin/billing/plans ❌

MODERATION (0/6):
├─ GET /admin/moderation/queue ❌
├─ PATCH /admin/moderation/reports/{id}/assign ❌
├─ PATCH /admin/moderation/reports/{id}/resolve ❌
├─ PATCH /admin/moderation/reports/{id}/escalate ❌
├─ POST /admin/users/{id}/suspend ❌
└─ DELETE /admin/posts/{id} ❌

SYSTEM CONFIG (0/4):
├─ GET /admin/config ❌
├─ PATCH /admin/config ❌
├─ GET /admin/config/feature-flags ❌
└─ PATCH /admin/config/feature-flags/{id} ❌

AUDIT & COMPLIANCE (0/3):
├─ GET /admin/audit-logs ❌
├─ GET /admin/audit-logs/export ❌
└─ GET /admin/compliance/report ❌

ANALYTICS (0/3):
├─ GET /admin/analytics/revenue ❌
├─ GET /admin/analytics/users ❌
└─ GET /admin/analytics/engagement ❌

REFERENCE:
- ADMIN_PANEL_API_DOCUMENTATION.md
```

---

## 🔴 CRITICAL ISSUE: NO ROLE-BASED ACCESS CONTROL (RBAC)

```
CURRENT PROBLEM:
❌ Checking roles from localStorage
❌ No server-side validation
❌ No audit logging
❌ COMPLETELY INSECURE

MUST FIX IMMEDIATELY:

Your system has 7 admin roles:
1. Family Admin (family@admin.com) - Manage ONE family
2. Owner (owner@admin.com) - Create/manage families
3. Council (council@admin.com) - View all, make decisions
4. Branch Admin (branch@admin.com) - Manage ONE branch
5. Business Admin (business@admin.com) - Handle billing
6. DevOps Admin (devops@admin.com) - System config
7. Read-Only Auditor (auditor@admin.com) - View only, no writes

WHAT HE MUST BUILD:
├─ Create admin_users table with role field
├─ Create audit_logs table
├─ Create requireAdminRole() middleware
├─ Verify JWT token on EVERY endpoint
├─ Check role in token (not localStorage)
├─ Log all admin actions

EXAMPLE:
router.patch(
  '/admin/familyspaces/:id/suspend',
  requireAdminRole(['owner']),  // ENFORCE ON SERVER
  suspendFamily
);

REFERENCE:
- 10_COMPLETE_API_ROADMAP_FOR_ANTIGRAVITY.md (Section: HOW TO IMPLEMENT RBAC)
```

---

## 💡 IMPORTANT: DON'T DUPLICATE APIS FOR WEB & APP

```
❌ WRONG APPROACH:
├─ Create /web/api/posts (for web admin)
├─ Create /app/api/posts (for flutter app)
└─ Duplicate code everywhere

✅ CORRECT APPROACH:
├─ Create /api/posts (single endpoint)
├─ Both Flutter app AND web admin use SAME endpoint
├─ Check permissions in middleware
├─ Different users see different data based on role

BENEFITS:
├─ No code duplication
├─ Easier to maintain
├─ Real-time sync between web & app
├─ Consistent business logic

EXAMPLE:
GET /api/posts?familySpaceId=X

Flutter app calls:
└─ GET /api/posts?familySpaceId=fs_123
   → Returns posts they can see

Web admin calls:
└─ GET /api/posts?familySpaceId=fs_123
   → Returns posts they can see (same endpoint, different permissions)

Admin calls:
└─ GET /admin/posts (different endpoint, broader access)
   → Returns ALL posts (for moderation)
```

---

## 📋 ENDPOINT COUNT SUMMARY

```
Current Status:
┌──────────────────────────────────┐
│ BUILT:           13/130 endpoints│
│ MISSING:       117/130 endpoints│
│ PERCENTAGE:      10% complete   │
│ STATUS:          ⚠️ NOT READY  │
└──────────────────────────────────┘

Breakdown:
├─ App endpoints:  13/80 (16% done)
├─ Admin endpoints: 0/50 (0% done)
└─ Auth system:     0/10 (0% done)

MISSING COMPONENTS:
├─ ❌ Complete authentication
├─ ❌ RBAC middleware
├─ ❌ Audit logging
├─ ❌ All admin endpoints
├─ ❌ Stories, Connections, Media, Notifications
├─ ❌ Complete genealogy endpoints
├─ ❌ BigK wallet integration
└─ ❌ BigK mall integration
```

---

## 🚨 CRITICAL ISSUES TO FIX NOW

### Issue #1: No Authentication System
```
IMPACT: App can't work
EFFORT: 1 week
MUST DO: Build now

ENDPOINTS NEEDED:
├─ POST /auth/signup
├─ POST /auth/login
├─ POST /auth/logout
├─ POST /auth/refresh-token
└─ + 5 more (see TIER 1)

BUILD FIRST BEFORE ANYTHING ELSE
```

### Issue #2: No RBAC
```
IMPACT: Major security risk
EFFORT: 3-4 days
MUST DO: Implement immediately

REQUIREMENTS:
├─ Create admin_users table
├─ Create audit_logs table
├─ Build middleware to check roles
├─ Validate token on every request
├─ Log all admin actions

BUILD RIGHT AFTER AUTHENTICATION
```

### Issue #3: Only 13 of 130 Endpoints Built
```
IMPACT: Platform incomplete
EFFORT: 6-7 weeks
TIMELINE: Build remaining 117 endpoints

BUILD AFTER AUTH & RBAC FOUNDATION
```

### Issue #4: No BigK Integration
```
IMPACT: Wallet & mall won't work
EFFORT: 1 week (after main APIs)
REFERENCES:
├─ 08_CLIENT_API_INTEGRATION_GUIDE.md
├─ APP_ONLY_API_DOCUMENTATION.md (Section 8-9)

BUILD LAST (after core endpoints)
```

---

## 📅 REALISTIC TIMELINE

```
PHASE 1: FOUNDATION (Week 1-2)
├─ Build auth system (signup, login, logout, etc)
├─ Create admin_users table
├─ Create audit_logs table
├─ Build RBAC middleware
├─ Test with sample endpoints
└─ EFFORT: 10-12 working days

PHASE 2: CORE APP ENDPOINTS (Week 3-6)
├─ Family management (8 endpoints)
├─ Genealogy (10 endpoints)
├─ Posts & feed (12 endpoints)
├─ Stories (5 endpoints)
├─ Events (8 endpoints)
├─ Connections (3 endpoints)
├─ Media (4 endpoints)
├─ Notifications (3 endpoints)
├─ Public directory (3 endpoints)
└─ EFFORT: 20-25 working days

PHASE 3: COMMERCE (Week 7)
├─ K-Mall integration
├─ KCC wallet integration
├─ Call BigK APIs
└─ EFFORT: 5 working days

PHASE 4: ADMIN ENDPOINTS (Week 8-9)
├─ Admin auth (3 endpoints)
├─ Dashboard (3 endpoints)
├─ Family management (6 endpoints)
├─ Billing (4 endpoints)
├─ Moderation (6 endpoints)
├─ System config (4 endpoints)
├─ Audit & compliance (3 endpoints)
├─ Analytics (3 endpoints)
└─ EFFORT: 12-15 working days

PHASE 5: TESTING & FIXES (Week 10)
├─ Test all 130 endpoints
├─ Fix bugs
├─ Test RBAC on all endpoints
├─ Load testing
└─ EFFORT: 5 working days

TOTAL: 9-10 weeks of full-time work
```

---

## ✅ BUILD ORDER (Priority)

```
1️⃣ AUTHENTICATION FIRST (Week 1)
   └─ Without this, nothing works
   └─ All endpoints depend on it

2️⃣ RBAC MIDDLEWARE (Week 1-2)
   └─ Every endpoint needs permission checks
   └─ Must be in place before building endpoints

3️⃣ CORE ENDPOINTS (Week 3-6)
   └─ Family, Posts, Events, Genealogy
   └─ These are most frequently used

4️⃣ SECONDARY ENDPOINTS (Week 6-7)
   └─ Stories, Media, Notifications, Connections
   └─ Less critical but still needed

5️⃣ COMMERCE (Week 7)
   └─ K-Mall, KCC Wallet
   └─ Requires BigK integration

6️⃣ ADMIN ENDPOINTS (Week 8-9)
   └─ All 50+ admin endpoints
   └─ Last because less critical initially

7️⃣ TESTING & FIXES (Week 10)
   └─ Test all endpoints
   └─ Fix bugs
```

---

## 📖 REFERENCE DOCUMENTS

```
FOR THIS TASK:
├─ This document (overview)
└─ 10_COMPLETE_API_ROADMAP_FOR_ANTIGRAVITY.md (detailed)

FOR ENDPOINT DETAILS:
├─ APP_ONLY_API_DOCUMENTATION.md (all app endpoints)
├─ ADMIN_PANEL_API_DOCUMENTATION.md (all admin endpoints)
└─ VISUAL_API_ARCHITECTURE_DIAGRAMS.md (data flows)

FOR IMPLEMENTATION:
├─ PRACTICAL_IMPLEMENTATION_GUIDE.md (code examples)
└─ 08_CLIENT_API_INTEGRATION_GUIDE.md (BigK integration)

FOR DATABASE:
├─ DATABASE_PLANNING_SUPABASE_WITH_CLIENT_APIS.md (schemas)
└─ POSTMAN_AND_TESTING_GUIDE.md (testing)
```

---

## 🎯 INSTRUCTIONS FOR ANTIGRAVITY

### STEP 1: READ THIS (5 minutes)
✅ You're reading it now

### STEP 2: UNDERSTAND THE GAPS (30 minutes)
- Understand you have 13/130 endpoints (10% done)
- Understand why RBAC is critical
- Understand the 7 admin roles

### STEP 3: IMPLEMENT AUTH FIRST (Week 1)
- Build signup/login endpoints
- Set up JWT tokens
- Don't move on until this works

### STEP 4: IMPLEMENT RBAC (Week 1-2)
- Create admin_users table with role field
- Create audit_logs table
- Build requireAdminRole() middleware
- Test on sample endpoints

### STEP 5: BUILD CORE ENDPOINTS (Week 3-6)
- Follow the build order above
- Reference APP_ONLY_API_DOCUMENTATION.md for specs
- Apply RBAC to each endpoint

### STEP 6: INTEGRATE BIGK (Week 7)
- Reference 08_CLIENT_API_INTEGRATION_GUIDE.md
- Call their APIs for wallet/mall
- Store references in your DB

### STEP 7: ADMIN ENDPOINTS (Week 8-9)
- Reference ADMIN_PANEL_API_DOCUMENTATION.md
- Apply RBAC middleware
- Test all 7 admin roles

### STEP 8: TEST & FIX (Week 10)
- Test all 130 endpoints
- Test with all 7 admin roles
- Fix bugs

---

## ❌ DON'T DO THIS

```
❌ Create separate /web and /app endpoints
❌ Use localStorage to check roles
❌ Skip RBAC middleware
❌ Don't log admin actions
❌ Build all endpoints without auth first
❌ Integrate BigK before core endpoints work
❌ Forget to test with all 7 admin roles
```

---

## ✅ DO THIS INSTEAD

```
✅ Use single /api endpoints for all clients
✅ Use JWT tokens for authentication
✅ Implement RBAC middleware on every endpoint
✅ Log all admin actions to audit_logs
✅ Build auth first, then RBAC, then endpoints
✅ Test BigK integration with real test data
✅ Test every endpoint with all applicable roles
```

---

## 📞 SUMMARY FOR ANTIGRAVITY

**Antigravity:**

You've done great work with the first 15 endpoints! Now here's what you need to do:

**MISSING: 115 more endpoints** (you have 13/130, need 117 more)

**CRITICAL FIRST:**
1. **Week 1:** Build complete authentication (signup, login, logout, tokens)
2. **Week 1-2:** Implement RBAC middleware - this is SECURITY CRITICAL
3. **Week 2-3:** Build core endpoints (family, posts, genealogy, events)
4. **Continue:** Build all remaining endpoints
5. **End:** Integrate BigK wallet & mall APIs

**IMPORTANT:**
- Don't create separate APIs for web & app - use same API for both
- Don't use localStorage for auth - use JWT tokens with server validation
- Don't skip RBAC - implement it on EVERY endpoint from the start
- Log all admin actions to audit_logs table

**Timeline:** 8-10 weeks of full-time work

**References:**
- Read: 10_COMPLETE_API_ROADMAP_FOR_ANTIGRAVITY.md (full details)
- Reference: APP_ONLY_API_DOCUMENTATION.md (endpoint specs)
- Reference: ADMIN_PANEL_API_DOCUMENTATION.md (admin specs)
- Code examples: PRACTICAL_IMPLEMENTATION_GUIDE.md

Start with authentication this week. Let me know when it's done!

---

**Let's build this right!** 🚀
