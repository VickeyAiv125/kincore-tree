# 🗄️ DATABASE PLANNING GUIDE
## Supabase Architecture - Family Clan Platform (with Client Wallet & Mall APIs)

---

## QUICK ANSWER: ONE DATABASE FOR WEB & MOBILE?

```
ANSWER: ✅ YES - USE SINGLE SUPABASE DATABASE FOR BOTH

WHY?
├─ Same database = Real-time sync between web & mobile
├─ No duplicate data = Single source of truth
├─ Easy to maintain = One schema to manage
├─ Supabase = Works perfectly for both
└─ Client APIs = Handled separately (Stripe/BigK)

DON'T CREATE SEPARATE DBS:
❌ Web database separate from mobile = Bad idea
❌ Different schemas = Sync problems
❌ Data inconsistency = User confusion

BEST PRACTICE:
✅ One Supabase database
✅ Same tables for both web & mobile
✅ Different API tokens (web vs mobile auth)
✅ Same backend API serves both clients
```

---

## YOUR ARCHITECTURE

```
COMPLETE SYSTEM ARCHITECTURE
═══════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────┐
│  CLIENT FRONTEND LAYER                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────┐    ┌──────────────────────┐ │
│  │  FLUTTER APP       │    │  WEB ADMIN PANEL     │ │
│  │  (iOS/Android)     │    │  (React)             │ │
│  │                    │    │                      │ │
│  │  • User login      │    │  • Admin login       │ │
│  │  • Posts           │    │  • Dashboard         │ │
│  │  • Family tree     │    │  • Moderation        │ │
│  │  • K-Mall shop     │    │  • Analytics         │ │
│  │  • Wallet (link)   │    │  • Billing           │ │
│  └────────┬───────────┘    └──────────┬───────────┘ │
│           │                            │             │
│           └────────────┬───────────────┘             │
│                        │                             │
└────────────────────────┼─────────────────────────────┘
                         │
                         │ HTTPS Requests
                         │ (Same tokens used)
                         │
            ┌────────────▼──────────────┐
            │  YOUR NODE.JS BACKEND     │
            │  (Express + Controllers)  │
            │                           │
            │  Handles:                 │
            │  • User auth              │
            │  • Posts, events          │
            │  • Family management      │
            │  • Moderation             │
            │  • Admin operations       │
            │  • Calls external APIs    │
            └────────────┬──────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                 │
        ▼                ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ SUPABASE DB  │  │ CLIENT APIs  │  │ S3/Cloud Storage │
│ (PostgreSQL) │  │              │  │                  │
│              │  │ • Wallet API │  │ • Images         │
│ YOUR TABLES: │  │ • Mall API   │  │ • Videos         │
│              │  │ • Stripe Pay │  │ • Documents      │
│ • users      │  │              │  │                  │
│ • posts      │  │ External     │  │ External         │
│ • families   │  │ Services:    │  │ Services         │
│ • events     │  │              │  │                  │
│ • comments   │  │ Base URL:    │  │                  │
│ • orders     │  │ https://bigk │  │                  │
│ • audit_logs │  │ -production. │  │                  │
│ • + 10 more  │  │ up.railway.. │  │                  │
│              │  │              │  │                  │
└──────────────┘  └──────────────┘  └──────────────────┘
```

---

## SUPABASE DATABASE SCHEMA

### Tables You Create (in Supabase)

```sql
-- CORE TABLES (Required)
═══════════════════════════════════════════════════════════════

1. users
   ├─ id (UUID, PK)
   ├─ email (VARCHAR, UNIQUE)
   ├─ password_hash (VARCHAR)
   ├─ first_name (VARCHAR)
   ├─ last_name (VARCHAR)
   ├─ avatar_url (VARCHAR)
   ├─ wallet_id (INTEGER) ← Links to client's wallet system
   ├─ wallet_handle (VARCHAR) ← From client's API
   ├─ language (VARCHAR, default: 'en')
   ├─ theme (VARCHAR, default: 'light')
   ├─ status (VARCHAR, default: 'active')
   ├─ created_at (TIMESTAMP)
   ├─ updated_at (TIMESTAMP)
   └─ Indexes: email, wallet_id

2. family_spaces
   ├─ id (UUID, PK)
   ├─ owner_id (UUID, FK → users)
   ├─ name (VARCHAR)
   ├─ description (TEXT)
   ├─ code (VARCHAR, UNIQUE) ← Invite code
   ├─ max_members (INTEGER)
   ├─ status (VARCHAR, default: 'active')
   ├─ created_at (TIMESTAMP)
   ├─ updated_at (TIMESTAMP)
   └─ Indexes: owner_id, code

3. family_memberships
   ├─ id (UUID, PK)
   ├─ family_space_id (UUID, FK)
   ├─ user_id (UUID, FK)
   ├─ role (VARCHAR) ← owner, admin, member, branch-admin
   ├─ joined_at (TIMESTAMP)
   └─ Indexes: family_space_id, user_id

4. clan_trees (Genealogy root)
   ├─ id (UUID, PK)
   ├─ family_space_id (UUID, FK)
   ├─ name (VARCHAR)
   ├─ created_at (TIMESTAMP)
   └─ Indexes: family_space_id

5. persons (Family members in tree)
   ├─ id (UUID, PK)
   ├─ clan_tree_id (UUID, FK)
   ├─ full_name (VARCHAR)
   ├─ chinese_name (VARCHAR, nullable)
   ├─ birth_date (DATE, nullable)
   ├─ death_date (DATE, nullable)
   ├─ gender (VARCHAR)
   ├─ bio (TEXT, nullable)
   ├─ avatar_url (VARCHAR, nullable)
   ├─ privacy_mode (VARCHAR, default: 'private')
   ├─ claimed_by (UUID, FK → users, nullable)
   ├─ status (VARCHAR, default: 'active')
   ├─ created_at (TIMESTAMP)
   └─ Indexes: clan_tree_id, claimed_by

6. person_relations (Family relationships)
   ├─ id (UUID, PK)
   ├─ clan_tree_id (UUID, FK)
   ├─ person_id_1 (UUID, FK → persons)
   ├─ person_id_2 (UUID, FK → persons)
   ├─ relation_type (VARCHAR) ← parent, spouse, sibling
   ├─ created_at (TIMESTAMP)
   └─ Indexes: clan_tree_id, person_id_1, person_id_2

7. posts (Social feed)
   ├─ id (UUID, PK)
   ├─ user_id (UUID, FK)
   ├─ family_space_id (UUID, FK)
   ├─ content (TEXT)
   ├─ visibility (VARCHAR) ← family, branch, public
   ├─ created_at (TIMESTAMP)
   ├─ updated_at (TIMESTAMP)
   ├─ deleted_at (TIMESTAMP, nullable) ← Soft delete
   └─ Indexes: user_id, family_space_id

8. comments
   ├─ id (UUID, PK)
   ├─ post_id (UUID, FK)
   ├─ user_id (UUID, FK)
   ├─ content (TEXT)
   ├─ created_at (TIMESTAMP)
   ├─ deleted_at (TIMESTAMP, nullable)
   └─ Indexes: post_id, user_id

9. reactions (Likes/emoji)
   ├─ id (UUID, PK)
   ├─ post_id (UUID, FK)
   ├─ user_id (UUID, FK)
   ├─ type (VARCHAR) ← like, love, wow, haha, sad, angry
   ├─ created_at (TIMESTAMP)
   └─ Indexes: post_id, user_id

10. events
    ├─ id (UUID, PK)
    ├─ family_space_id (UUID, FK)
    ├─ creator_id (UUID, FK)
    ├─ title (VARCHAR)
    ├─ description (TEXT)
    ├─ start_date (TIMESTAMP)
    ├─ end_date (TIMESTAMP)
    ├─ location (VARCHAR)
    ├─ max_participants (INTEGER)
    ├─ status (VARCHAR, default: 'upcoming')
    ├─ created_at (TIMESTAMP)
    └─ Indexes: family_space_id, creator_id

11. event_rsvps
    ├─ id (UUID, PK)
    ├─ event_id (UUID, FK)
    ├─ user_id (UUID, FK)
    ├─ status (VARCHAR) ← going, maybe, no
    ├─ guest_count (INTEGER)
    ├─ responded_at (TIMESTAMP)
    └─ Indexes: event_id, user_id

12. stories
    ├─ id (UUID, PK)
    ├─ user_id (UUID, FK)
    ├─ family_space_id (UUID, FK)
    ├─ media_url (VARCHAR)
    ├─ media_type (VARCHAR) ← image, video
    ├─ text_content (TEXT, nullable)
    ├─ visibility (VARCHAR)
    ├─ expires_at (TIMESTAMP)
    ├─ created_at (TIMESTAMP)
    └─ Indexes: user_id, family_space_id

13. media
    ├─ id (UUID, PK)
    ├─ user_id (UUID, FK)
    ├─ family_space_id (UUID, FK)
    ├─ url (VARCHAR) ← S3 URL
    ├─ thumbnail_url (VARCHAR, nullable)
    ├─ type (VARCHAR) ← image, video, document
    ├─ size (INTEGER)
    ├─ visibility (VARCHAR)
    ├─ created_at (TIMESTAMP)
    └─ Indexes: user_id, family_space_id

14. notifications
    ├─ id (UUID, PK)
    ├─ user_id (UUID, FK)
    ├─ type (VARCHAR) ← event_invitation, post_reaction, comment
    ├─ title (VARCHAR)
    ├─ message (TEXT)
    ├─ data (JSONB) ← Extra context
    ├─ read_at (TIMESTAMP, nullable)
    ├─ created_at (TIMESTAMP)
    └─ Indexes: user_id, created_at

15. kcc_ledger (KCC transaction log)
    ├─ id (UUID, PK)
    ├─ user_id (UUID, FK)
    ├─ wallet_id (INTEGER) ← External wallet reference
    ├─ type (VARCHAR) ← spend, earn, transfer, refund
    ├─ amount (DECIMAL)
    ├─ reason (VARCHAR)
    ├─ external_transaction_id (VARCHAR, nullable) ← From client API
    ├─ external_reference (VARCHAR, nullable)
    ├─ status (VARCHAR) ← pending, confirmed, failed
    ├─ created_at (TIMESTAMP)
    └─ Indexes: user_id, wallet_id, external_transaction_id

16. orders (Local order records)
    ├─ id (UUID, PK)
    ├─ user_id (UUID, FK)
    ├─ order_number (VARCHAR, UNIQUE) ← From client API
    ├─ external_order_id (INTEGER, nullable) ← From client API
    ├─ items (JSONB) ← Product details
    ├─ subtotal (DECIMAL)
    ├─ shipping_fee (DECIMAL)
    ├─ kcc_discount (DECIMAL, nullable)
    ├─ total (DECIMAL)
    ├─ status (VARCHAR) ← pending, confirmed, shipped, delivered
    ├─ shipping_address (JSONB)
    ├─ tracking_number (VARCHAR, nullable)
    ├─ created_at (TIMESTAMP)
    └─ Indexes: user_id, order_number, external_order_id

17. audit_logs
    ├─ id (UUID, PK)
    ├─ actor_id (UUID, FK → users)
    ├─ action (VARCHAR) ← suspend, delete, mint, burn
    ├─ target_type (VARCHAR) ← family, user, post
    ├─ target_id (VARCHAR)
    ├─ details (JSONB)
    ├─ ip_address (VARCHAR)
    ├─ created_at (TIMESTAMP)
    └─ Indexes: actor_id, action, target_type

18. connections (External family connections)
    ├─ id (UUID, PK)
    ├─ initiator_family_id (UUID, FK)
    ├─ target_family_id (UUID, FK)
    ├─ status (VARCHAR) ← pending, connected, declined
    ├─ connected_at (TIMESTAMP, nullable)
    └─ Indexes: initiator_family_id, target_family_id

19. claims (Link user to person)
    ├─ id (UUID, PK)
    ├─ user_id (UUID, FK)
    ├─ person_id (UUID, FK)
    ├─ family_space_id (UUID, FK)
    ├─ status (VARCHAR) ← pending, approved, rejected
    ├─ claimed_at (TIMESTAMP, nullable)
    └─ Indexes: user_id, person_id
```

---

## WHAT YOU DON'T CREATE IN SUPABASE

```
❌ DO NOT CREATE THESE (Client handles):
═══════════════════════════════════════════════════════════════

Wallet Related:
├─ wallet table (their system has it)
├─ wallet_balance table (call their API instead)
├─ transaction table (they manage it)
└─ Why? Their system is blockchain-based, you just reference it

Mall Related:
├─ products table (their API provides it)
├─ merchants table (their API provides it)
├─ categories table (their API provides it)
├─ cart table (they manage, you just show UI)
├─ checkout sessions (their Stripe integration)
└─ Why? They own the mall infrastructure

Payment Related:
├─ stripe_transactions (they handle payment)
├─ payment_methods (Stripe handles it)
└─ Why? Payment security requires their PCI compliance

Authentication Related:
├─ oauth_tokens (they provide tokens)
├─ login_sessions (manage in Redis/JWT)
└─ Why? They handle OAuth/OpenID Connect


WHAT YOU DO CREATE IN YOUR DB:
✅ Local copies/references to external data
   ├─ kcc_ledger table ← Copy of their transactions (for YOUR records)
   ├─ orders table ← Link to their order IDs
   └─ Why? You need history in your system for auditing, display
```

---

## HOW EXTERNAL APIs CONNECT

```
USER PURCHASES ITEM (Flow):
═══════════════════════════════════════════════════════════════

1. FLUTTER APP / WEB
   └─ Shows products from client's API
   └─ User clicks "Buy"

2. YOUR BACKEND
   ├─ Call Client's API: GET products list
   │  └─ https://bigk-production.../api/v1/kmall/public/products
   │  └─ Response: {id, name, price, images, ...}
   │
   ├─ Call Client's API: Create cart item
   │  └─ POST /api/v1/app/cart/items
   │  └─ Stored in THEIR system
   │
   ├─ Call Client's API: Create checkout session
   │  └─ POST /api/v1/checkout/create-session
   │  └─ Response: {session_id, checkout_url, order_id}
   │
   ├─ Call Client's API: Verify payment
   │  └─ GET /api/v1/payments/stripe/verify/{session_id}
   │
   └─ Save to YOUR database:
      └─ INSERT INTO orders (order_number, external_order_id, ...)
      └─ Now you have local record


USER SPENDS KCC COINS (Flow):
═════════════════════════════════════════════════════════════════

1. FLUTTER APP / WEB
   └─ User clicks "Spend 50 KCC to boost post"

2. YOUR BACKEND
   ├─ Check: Is user logged in? (YOUR DB)
   │  └─ SELECT * FROM users WHERE id = user_id
   │
   ├─ Check: What's their wallet_id? (YOUR DB)
   │  └─ SELECT wallet_id FROM users WHERE id = user_id
   │
   ├─ Call Client's API: Spend coins
   │  └─ POST https://bigk-production.../api/v1/app/transfer
   │  └─ {recipient_handle, amount, note}
   │  └─ Response: {status, new_balance}
   │
   └─ Save to YOUR database:
      └─ INSERT INTO kcc_ledger (wallet_id, amount, type, status)
      └─ Now you have local record for audit/display


GET BALANCE (Flow):
═════════════════════════════════════════════════════════════════

Option 1: Call Their API Every Time (Fresh)
├─ GET /api/v1/app/me
└─ Returns: {wallet: {balance, ...}}

Option 2: Use Local Ledger (Cached)
├─ SELECT SUM(amount) FROM kcc_ledger WHERE user_id = X
└─ Faster, but not real-time

RECOMMENDATION:
├─ Call their API for balance
├─ Update your ledger in background
└─ Display their balance (source of truth)
```

---

## SUPABASE SETUP (Step by Step)

```
STEP 1: Create Supabase Project
═════════════════════════════════════════════════════════════════

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email
4. Create new project
   ├─ Project name: family-clan-db
   ├─ Database password: (strong password)
   ├─ Region: Choose closest to your users
   └─ Pricing: Free tier (for now)

5. Wait for project creation (2-3 minutes)
6. Copy credentials:
   ├─ Project URL: https://xxxxx.supabase.co
   ├─ Public API key: eyJhbGciOi...
   └─ Service Role key: eyJhbGciOi... (for backend)


STEP 2: Create Tables
═════════════════════════════════════════════════════════════════

Option A: Use SQL Editor (Recommended)
├─ Go to SQL Editor in Supabase dashboard
├─ Copy schemas from above
├─ Run each table creation script
└─ Verify tables appear

Option B: Use Supabase UI
├─ Click "New Table"
├─ Add columns manually
├─ Set up indexes
└─ More tedious but visual


STEP 3: Setup Authentitation
═════════════════════════════════════════════════════════════════

Supabase provides:
├─ Email/Password auth (built-in)
├─ Magic links (email-only login)
├─ Social login (Google, GitHub, etc)
└─ You DON'T need to create auth system


STEP 4: Configure RLS (Row Level Security)
═════════════════════════════════════════════════════════════════

Secure your data:
├─ Users can only see their own data
├─ Admins can see everything
├─ Family members see family data
└─ Example policy:
   SELECT * FROM posts WHERE family_id = current_user_family


STEP 5: Get Connection String
═════════════════════════════════════════════════════════════════

For your Node.js backend:
├─ Database → Connection pooling
├─ Copy connection string
├─ Add to .env file:
   DATABASE_URL=postgresql://user:pass@host:port/dbname
└─ Use in your code:
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });
```

---

## CODE: CONNECTING NODE.JS TO SUPABASE

```javascript
// backend/config/database.js

const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Option 1: Using Supabase Client (Recommended)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Option 2: Using PostgreSQL Pool (Direct)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Example: Get user from Supabase
async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Example: Insert post
async function createPost(userId, familyId, content) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        family_space_id: familyId,
        content: content,
        created_at: new Date()
      })
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Example: Get user's KCC balance
async function getKccBalance(userId) {
  try {
    const { data, error } = await supabase
      .from('kcc_ledger')
      .select('amount, type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate balance
    let balance = 0;
    data.forEach(tx => {
      if (tx.type === 'earn' || tx.type === 'transfer') {
        balance += tx.amount;
      } else if (tx.type === 'spend') {
        balance -= tx.amount;
      }
    });

    return balance;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = { supabase, pool, getUserById, createPost, getKccBalance };
```

---

## SUMMARY: DATABASE ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│ YOUR DATABASE SETUP                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Database System: Supabase (PostgreSQL)              │
│                                                     │
│ ✅ One database for BOTH web & mobile               │
│ ✅ 19 tables for core features                      │
│ ✅ Indexes for performance                          │
│ ✅ Row-level security for data safety               │
│                                                     │
│ EXTERNAL INTEGRATIONS:                              │
│ ├─ Client Wallet API (BigK)                        │
│ │  └─ Your DB references (wallet_id, transactions) │
│ │                                                   │
│ ├─ Client Mall API (BigK)                          │
│ │  └─ Your DB references (order_ids)               │
│ │                                                   │
│ ├─ Stripe (Payment processing)                     │
│ │  └─ Your DB records (orders)                     │
│ │                                                   │
│ └─ S3/Cloud Storage (Media files)                   │
│    └─ Your DB references (media URLs)              │
│                                                     │
│ COST:                                               │
│ ├─ Supabase free tier: $0 (up to 2 projects)       │
│ ├─ Scaling later: $25-100/month                    │
│ └─ Same DB for unlimited users                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## NEXT STEPS

```
1. CREATE SUPABASE PROJECT ✓
   └─ 5 minutes

2. RUN TABLE CREATION SCRIPTS ✓
   └─ 30 minutes

3. SETUP AUTHENTICATION ✓
   └─ 15 minutes

4. TEST CONNECTION FROM NODE.JS ✓
   └─ 15 minutes

5. START BUILDING APIs ✓
   └─ 2-3 weeks

TOTAL SETUP TIME: 1-2 hours
```

---

**KEY DECISION: ✅ USE SINGLE SUPABASE DATABASE FOR WEB & MOBILE (Best Practice)**

Everything flows through same database, external APIs are called from backend, real-time sync works perfectly! 🚀
