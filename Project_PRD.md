# 📘 Family & Clan Digital Platform

## Feature & Technical Design Document (PRD + HLD v1.

## — Full Scope)

## Theme

Color: can refer to headspace app, bespoke + modern style, prefer light, red, orange yellow
combined


## 0. Scope Statement (Single Release)

This document defines the **complete scope delivered in one go** , including:


```
● Big family tree + claim + governance
```
```
● Desktop + mobile
```
```
● Feed + events + cross-family connections
```
```
● Migration map + family history + media repository (pictures, files, docs, 5GB per family?)
```
```
● K-Mall centralized commerce (public browse, members-only checkout)
```
```
● KCC Coin (earn/spend/ledger + API integration)
```
```
● PDF descendant reports
```
```
● Security + credential management + non-functional requirements
```
```
While it’s “one go”, engineering can still implement in internal milestones; the
product scope remains all-in.
```
## 1. Product Vision

A private, identity-driven infrastructure for **large Asian extended families** , enabling:

```
● One unified big family tree (single clan genealogy graph)
```
```
● Clear kinship relationship identification
```
```
● Cultural preservation (migration map, history, media)
```
```
● Practical collaboration (events, connections)
```
```
● Commerce + support (K-Mall) + KCC Coin incentives
```
## 2. Platforms & Language

#### 2.1 Platforms


```
● Flutter App : iOS / Android + Flutter Web (basic desktop)
```
```
● Desktop Web (required) : admin console + advanced features
```
```
● WebView inside Flutter : big tree visualization + migration map (optional but
recommended)
```
#### 2.2 Requirement

```
● Primary : Chinese (Simplified)
```
```
● Secondary : English, Spanish, Malay, Japanese
```
```
● Runtime switch per user
```
```
● UI fully localized
```
```
● User-generated content is not auto-translated (manual bilingual fields for History)
```
## 3. Technology Stack (Confirmed)

### Frontend

```
● Mobile App: Flutter (single codebase for iOS & Android)
● Web App (Full Website + Admin Console + Visualization Pages): React / Next.js
(recommended)
● Tree & Map Visualization (Web): D3.js / React Flow / Cytoscape.js
```
### Backend

```
● Backend APIs: Node.js + Express (REST APIs)
● Database: PostgreSQL (via Supabase)
● Authentication & Authorization: Supabase Auth (RBAC, guardians, minors, approvals)
● Object / Media Storage: S3-compatible storage (Supabase Storage or equivalent)
```
## 4. Core Design Principles


1. **One Big Tree** : single genealogy graph per ClanTree
2. **Person ≠ User** : claim-based binding
3. **Governance & audit** : approvals + logs
4. **Privacy by default** : scopes everywhere
5. **Centralized commerce & ledger truth** : K-Mall + KCC Coin handled centrally

## 5. High-Level Data Model (Entities)

User

Person

PersonRelation (parent-child, spouse)

ClanTree

Branch

Household (optional)

FamilySpace

Membership (role per familyspace)

ClaimRequest

Post, Comment, Reaction

Event, EventInvite, RSVP

Media, MediaAttachment

HistoryChapter, HistoryRevision

MigrationNode, MigrationEdge

FamilyConnection, MemberConnection

Product, Listing, ListingApproval

Order, OrderItem, Payment, Fulfillment, Refund

SellerProfile (Family/Branch)

KccWallet, KccLedgerEntry, KccEarnRule, KccSpend, KccTransfer

AdSlot, PromoCampaign (advertising surfaces)


Notification, PushToken

AuditLog

## 6. Governance: Roles & Permissions (Per FamilySpace)

Roles:

```
● Family Owner
```
```
● Family Admin
```
```
● Co-Admin
```
```
● Editor (content/events)
```
```
● Branch Admin
```
```
● Member
```
```
● Guest/Public (read-only where enabled)
```
Permissions must support:

```
● Family-level admin actions across branches
```
```
● Branch-level scope restrictions
```
```
● Field-level visibility for profile/person data
```
```
● Audit logs on all sensitive actions
```
## 7. Unified Big Family Tree

#### 7.1 Model

```
● Each Person belongs to a ClanTree
```

```
● Relationships stored as edges:
```
```
○ parent → child
```
```
○ spouse ↔ spouse
```
**Branch** and **Household** are labels + governance boundaries, not separate trees.

#### 7.2 Rendering (Required)

```
● Focus Tree View (default): progressive expand ancestors/descendants
```
```
● Branch Subtree View : load entire branch subtree with pagination/virtualization
```
```
● Global Overview : skeleton + counts + branch navigation
```
```
● Search + jump, pan/zoom, expand/collapse
```
#### 7.3 Relationship Calculator (Optional extension)

```
● Provide relationship “path” highlighting in tree (nice-to-have if time permits)
```
## 8. Identity Claim System

#### Flow

```
● People can be created without accounts
```
```
● A user can claim a Person via:
```
```
○ claim code/link/QR OR
```
```
○ verification + admin approval
```
```
● Claims create a hard binding: user.person_id = person.id (one-to-one)
```
```
● Minors: guardian-managed with later transfer
```

All claim and resolution actions logged in **AuditLog**.

## 9. Profiles & Timeline

```
● Bio fields + avatar
```
```
● Timeline entries (date range, type, description, attachments)
```
```
● Field-level visibility
```
```
● Relationship edits (parents/spouse/children) are request-based :
```
```
○ Member submits change request
```
```
○ Branch Admin / Family Admin approves
```
```
○ Audit log stored
```
## 10. Tools & Engagement Features

#### 10.1 Family Calculator (Kinship Calculator)

**Purpose**
Provide an easy and deterministic way for users to identify kinship terms based on relationship
paths, especially for large Asian extended families.

**Input**

```
● Relationship path buttons:
```
```
○ Father
```
```
○ Mother
```
```
○ Sibling
```
```
○ Child
```

```
● Example input path:
Me → Father → Mother
```
**Output**

```
● Chinese kinship term with explanation
```
```
● English equivalent term
```
**Implementation Notes**

```
● Implemented using a deterministic rule table + normalization , not graph traversal
```
```
● Does not require traversal of the full family tree
```
```
● Supports bilingual output by design
```
#### 10.2 Festival Gift Exchange (Gift Swap / Secret Santa)

**Positioning (Important)**
Although presented as an engagement “tool”, this feature must be implemented as **a
specialized Event type** within the Events system
(e.g. event_type = gift_swap).

It must **reuse** existing infrastructure for:

```
● Invitations
```
```
● Cross-family rules
```
```
● Notifications
```
```
● Permissions
```
```
● Audit logging
```
This avoids creating a disconnected subsystem.


**10.2.1 Feature Goal**

Enable families to organize **festival-based gift exchange activities** (e.g. Lunar New Year,
Christmas, Mid-Autumn Festival, anniversaries), where participants join via **handle / invite link /
QR** , and the system randomly assigns
**“who I give a gift to”** , with support for:

```
● Budget limits
```
```
● Anonymity
```
```
● Privacy protection
```
```
● Rule-based exclusions
```
**10.2.2 User Stories**

```
● As a Family Admin / Editor , I can create a gift exchange event with configurable dates,
budget, rules, anonymity, and participation scope (family / branch / cross-family).
```
```
● As a member , I can join the event via handle invitation or invite link and be automatically
included in the draw.
```
```
● As a participant , I can only see my assigned recipient , not the global pairing, and
remain anonymous until the event ends.
```
```
● As an event creator , I can perform limited management actions after the draw (e.g.
redraw, replace withdrawn participants, manage blocklists), with full audit logging.
```
```
● As a participant , I can update gift status (purchased / shipped / delivered) and optionally
upload proof (private by default).
```
```
● As the platform , I must prevent harassment by providing platform-relayed messaging ,
without exposing personal contact details.
```
**10.2.3 Core Configuration (PRD-Level)**

**Event Setup Parameters**


```
● Event title, festival tag, description
```
```
● Participation scope:
```
```
○ Family only
```
```
○ Branch only
```
```
○ Cross-family
```
```
■ Only allowed if FamilyConnection = connected,
or admin explicitly enables invite-by-code
```
```
● Signup deadline
```
```
● Draw time
```
```
● Gift deadline
```
```
● Budget range (e.g. USD 20–50) + currency
```
```
● Gift delivery mode:
```
```
○ In-person
```
```
○ Shipping
```
```
○ Digital gift / e-gift card
```
```
● Anonymity mode:
```
```
○ Anonymous by default (revealed after event)
```
```
○ Non-anonymous (optional)
```
**Exclusion Rules**

```
● Cannot assign to self (mandatory)
```
```
● Optional: exclude same Household
```

```
● Optional: exclude direct relatives
(enabled only if relationship data is available)
```
**10.2.4 Participant Data (Privacy-Minimized)**

Participants may optionally provide:

```
● Gift preferences (interests, dislikes, size, notes)
```
```
● Delivery preference (in-person / shipping)
```
```
○ Shipping address is never globally visible
```
```
● Contact method:
```
```
○ Default: platform-relayed messaging only
```
```
○ No direct contact exposure by default
```
**10.2.5 Flow**

1. Admin / Editor creates the event
2. Invitations sent via:

```
○ Handle search
```
```
○ Invite link
```
```
○ QR code
```
3. Members join before signup deadline
4. At draw time:

```
○ System performs random assignment
```
```
○ Results are locked (configurable redraw permission)
```

5. Participants can view:

```
○ Only their assigned Recipient
```
6. Participants communicate via **platform-relayed messages**
7. Gift progress updates:

```
○ Not started → Purchased → Shipped → Delivered
```
8. Event ends:

```
○ Automatic reveal (if anonymous)
```
```
○ Optional auto-generated summary post in Feed
```
**10.2.6 Permissions & Audit (Required)**

**Permissions**

```
● Create / edit / cancel event: Family Admin, Editor
```
```
● Execute draw: system job or admin-triggered
```
```
● Redraw (if enabled): Family Admin only
```
```
● Visibility:
```
```
○ Participants: only see their own assignment
```
```
○ Event creator: global visibility is configurable
```
**Audit Logging**

All critical actions must be recorded in AuditLog, including:

```
● Event creation and rule changes
```
```
● Draw and redraw actions
```
```
● Participant withdrawal or replacement
```

```
● Assignment changes
```
**10.2.7 KCC Coin Integration (Optional but Recommended)**

To support ecosystem growth and monetization:

```
● Reward KCC Coin for:
```
```
○ Joining and completing gift exchange
```
```
● Reputation signals:
```
```
○ Completion rate and punctuality affect future eligibility
```
```
● Event page may surface K-Mall gift recommendations
```
```
● Budget may optionally be:
```
```
○ Displayed in KCC
```
```
○ Paid partially or fully using KCC (policy-configurable)
```
**10.2.8 Data Model Guidance**

**Preferred approach (recommended)**

```
● Reuse Event table with:
```
```
○ event_type = gift_swap
```
```
○ metadata_json storing gift-exchange-specific rules
```
**Alternative (if isolation is preferred)**

```
● Dedicated tables:
```
```
○ gift_exchange_event
```

```
○ gift_exchange_participant
```
```
○ gift_exchange_assignment
```
```
○ gift_exchange_progress
```
```
○ gift_exchange_message
```
Either approach must still integrate with:

```
● Events permissions
```
```
● Notifications
```
```
● Connections
```
```
● AuditLog
```
#### 10.3 Member Achievement & Level System

**Purpose**
Introduce a structured **member achievement and level system (Level 1–10)** to encourage
long-term participation, contribution, and positive behavior within family spaces and across the
platform.

This system represents **identity and reputation** , not currency, and complements (but does not
replace) KCC Coin.

**10.3.1 Core Concepts**

```
● Each member has:
```
```
○ A Level (1–10)
```
```
○ An Experience Point (XP) score
```
```
● Levels represent:
```

```
○ Engagement
```
```
○ Contribution
```
```
○ Trustworthiness
```
```
○ Community standing
```
```
● Levels are non-transferable and non-spendable
```
**10.3.2 Level Progression Model**

```
● XP is accumulated through verified actions
```
```
● When XP crosses thresholds, level increases automatically
```
```
● Level decreases are not allowed by default
```
```
○ Exception: admin-enforced penalties (optional, logged)
```
**Example Levels**

Level English Title 中文称号 含义说明

1 Initiate 初入宗亲 新加入成员，刚开始认识家族

2 Participant 参与宗亲 开始参与活动与互动

3 Contributor 贡献宗亲 有实际贡献（历史、活动、内容）

4 Historian 家族史官 对家族历史、资料有持续贡献

5 Connector 家族联络人 积极促成成员、支系、家族之间的连接

6 Steward 家族管事 主动维护秩序、协助管理与组织

7 Custodian 家族守护者 长期稳定贡献，维护家族价值与资料

8 Elder Contributor 宗亲长者 具有威望与经验的核心成员（非年龄）

9 Lineage Guardian 族脉守护者 对族谱与家族体系有深远贡献


10 Legacy Pillar 家族基石 家族精神与传承的象征人物

(Level names are configurable per family or organization)

**10.3.3 XP Earning Sources (Examples)**

XP can be earned through **approved or verified actions** , such as:

```
● Claiming a Person profile (verified)
```
```
● Completing personal profile
```
```
● Contributing approved family history edits
```
```
● Uploading media approved by admins
```
```
● Participating in events
```
```
● Completing gift exchange events
```
```
● Hosting or organizing events
```
```
● Helping other members (admin-awarded)
```
```
● Consistent positive participation (anti-spam protected)
```
XP rules must be **configurable** , versioned, and auditable.

**10.3.4 Relationship with KCC Coin**

```
● XP and Level are separate from KCC Coin
```
```
● Some actions may grant both XP and KCC Coin
```
```
● Level may unlock:
```
```
○ Eligibility for certain events
```
```
○ Ability to create events (optional)
```

```
○ Increased visibility or trust badges
```
```
○ Access to special features (policy-defined)
```
No direct conversion:

```
● XP → KCC Coin ❌
```
```
● KCC Coin → XP ❌
```
**10.3.5 Visibility & UI**

```
● Level is visible:
```
```
○ On member profile
```
```
○ In feeds (optional badge)
```
```
○ In event participant lists
```
```
● XP value may be:
```
```
○ Visible to the member
```
```
○ Hidden from other users (configurable)
```
```
● Level badges should be visually subtle and respectful (non-gamified tone)
```
**10.3.6 Governance & Anti-Abuse**

```
● XP is only granted by:
```
```
○ System-verified actions
```
```
○ Admin-approved actions
```
```
● Anti-abuse protections:
```

```
○ Rate limits
```
```
○ Duplicate action detection
```
```
○ Admin override with audit log
```
```
● All XP adjustments must be recorded in AuditLog
```
**10.3.7 Data Model (High-Level)**

**member_achievement**

```
● id
```
```
● user_id
```
```
● familyspace_id
```
```
● level
```
```
● xp
```
```
● last_updated_at
```
**achievement_event**

```
● id
```
```
● user_id
```
```
● action_type
```
```
● xp_delta
```
```
● reference_type
```
```
● reference_id
```
```
● created_at
```

**10.3.8 Extensions**

```
● Achievement badges (visual only)
```
```
● Family-specific level naming
```
```
● Organization-wide ranking (opt-in)
```
```
● Level-based moderation privileges
```
## 11. Family History + Migration Map

#### 11.1 Family History

```
● Chapter-based pages (ZH/EN versions)
```
```
● Suggest edits → Admin approval
```
```
● Versioning: HistoryRevision with rollback
```
#### 11.2 Migration Map (Required)

```
● Migration nodes (location, time range, description)
```
```
● Edges represent movement (origin → destination)
```
```
● Link nodes to:
```
```
○ branches
```
```
○ persons
```
```
○ history chapters
```
```
● Display:
```
```
○ timeline slider
```

```
○ map pins + routes
```
## 12. Media Repository

```
● Upload photo/video
```
```
● Compression + thumbnail generation
```
```
● Attach to person/event/history/branch
```
```
● Visibility scopes
```
```
● Moderation tools: archive, remove, report
```
```
● Storage lifecycle policies (optional)
```
## 13. Feed System

Post types:

```
● text, media, event, milestone, product/promo
```
Visibility:

```
● family, branch, selected families, public (read-only)
```
Moderation:

```
● pin/hide/delete/lock comments
```
```
● report/block
```
No algorithmic feed ranking (chronological).


# 13A. Story System (Ephemeral Content

# Layer)

## 13A.1 Purpose

Introduce short-lived, lightweight content sharing similar to Instagram Stories to:

```
● Increase daily engagement
```
```
● Encourage casual sharing within Family Spaces
```
```
● Support event highlights
```
```
● Provide time-sensitive announcements
```
```
● Enable lightweight cross-family visibility
```
Stories are temporary and expire automatically.

## 13A.2 Core Characteristics

Default lifespan: **24 hours**
Optional extended lifespan (Family Admin configurable): 48h / 72h

Story types:

```
● Image
```
```
● Short video (max duration configurable, e.g., 30–60 seconds)
```
```
● Text-based story (with background theme)
```
```
● Event-linked story
```
```
● Product-linked story (optional)
```
Stories are:


```
● Chronological (no algorithmic ranking)
```
```
● Not permanently indexed
```
```
● Not included in genealogy records
```
## 13A.3 Visibility & Privacy Model

Stories must follow the same visibility scopes as Posts:

Visibility options:

```
● Family only
```
```
● Branch only
```
```
● Selected connected families
```
```
● Public (if family space allows)
```
Additional rules:

```
● Minors cannot publish public stories
```
```
● Public stories cannot expose private person data
```
```
● Stories respect field-level visibility
```
Story viewers:

```
● Viewer list visible to story owner (configurable)
```
```
● Anonymous viewing not allowed within family spaces
```
## 13A.4 Story Lifecycle


States:

```
● Active
```
```
● Expired (soft-deleted)
```
```
● Archived (optional, user-controlled)
```
```
● Deleted (hard removal)
```
Expired stories:

```
● Removed from feed automatically
```
```
● Media auto-flagged for lifecycle policy
```
```
● Optionally restorable by user within X days
```
Background job required for expiration cleanup.

## 13A.5 Engagement Actions

Users can:

```
● React (limited emoji set)
```
```
● Reply (private message style)
```
```
● Share to feed (if allowed)
```
```
● Report
```
Story replies:

```
● Delivered via in-app inbox
```
```
● Not public comments
```
No public comment threads on stories.


## 13A.6 Storage & Media Policy

Story media:

```
● Stored in S3-compatible storage
```
```
● Auto-compressed
```
```
● Thumbnail generated
```
Storage considerations:

```
● Story media may not count toward long-term family storage quota
```
```
● Optional separate ephemeral storage bucket
```
Lifecycle policies:

```
● Auto-delete after X days
```
```
● Configurable retention
```
## 13A.7 Monetization & Ads Integration (Optional but

## Recommended)

Free-tier families:

```
● Ads may appear between stories (Google Ad integration)
```
Subscribed families:

```
● No ads inside family space stories
```
Story AdSlot integration:


```
● Promoted family product stories
```
```
● Sponsored event highlight
```
```
● KCC Coin-based promotion boost
```
Ads must:

```
● Not interrupt viewing experience aggressively
```
```
● Follow platform compliance rules
```
## 13A.8 KCC Coin & XP Integration

Optional integrations:

```
● Earn small XP for verified engagement
```
```
● Earn KCC Coin for featured story of the week (admin-awarded)
```
```
● Spend KCC Coin to promote story visibility (AdSlot)
```
No direct XP purchase allowed.

## 13A.9 Data Model (High-Level)

story

```
● id
```
```
● user_id
```
```
● familyspace_id
```
```
● media_type
```

```
● media_url
```
```
● text_content
```
```
● visibility_scope
```
```
● expires_at
```
```
● created_at
```
story_view

```
● story_id
```
```
● viewer_user_id
```
```
● viewed_at
```
story_reaction

```
● story_id
```
```
● user_id
```
```
● reaction_type
```
story_reply

```
● story_id
```
```
● sender_id
```
```
● message
```
```
● created_at
```
story_report

```
● story_id
```
```
● reporter_id
```

```
● reason
```
```
● created_at
```
All actions must be logged in AuditLog if moderation-related.

## 13A.10 Moderation & Safety

Moderation must support:

```
● Report
```
```
● Remove
```
```
● Archive
```
```
● Temporary suspension of story publishing
```
High-risk content:

```
● Flag to Moderation Admin (Platform Portal)
```
```
● Respect escalation workflow (L1/L2/L3)
```
Expired stories must remain available for moderator review for X days before permanent purge.

## 13A.11 UI Requirements

Mobile:

```
● Horizontal story bar at top of Family Feed
```
```
● Tap to enter immersive viewer mode
```
```
● Swipe left/right to navigate
```
Desktop:


```
● Story strip at top of feed
```
```
● Modal viewer
```
Dark/Light mode compatible.

## 14. Events & Cross-Family Invitations

```
● Create by Admin/Editor
```
```
● Invite:
```
```
○ users, branches, connected families
```
```
● Cross-family rule:
```
```
○ default requires FamilyConnection = connected
```
```
○ optional allow “invite by code” if enabled by admin
```
```
● RSVP: going/maybe/no
```
```
● Reminders & notifications
```
## 15. Discovery, Connections, and Friend Lists

#### 15.1 Family Search

```
● by family code / handle / QR
```
#### 15.2 Connections

```
● Family ↔ Family (primary)
```

```
● Member ↔ Member (only if families connected or from allowed contexts: events/posts)
```
#### 15.3 Friend List UI

```
● “Connections” module with tabs:
```
```
○ Families
```
```
○ People
```
```
● Shows counts, statuses, permissions
```
Anti-spam: rate limits, blocklist, admin controls.

## 16. K-Mall Commerce (Full Scope)

#### 16.1 Access

```
● Public can browse
```
```
● Members only can checkout
```
#### 16.2 Seller Identity Label (Required)

Every listing shows:

```
● “Sold by: [Family / Branch]”
```
```
● optional verified badge
```
```
● seller profile page (public-safe)
```
#### 16.3 Centralized Operations (K-Mall core)

```
● Catalog + inventory
```
```
● Orders + payments
```

```
● Fulfillment + tracking
```
```
● Refunds/disputes
```
```
● Payouts to families/branches (if applicable)
```
#### 16.4 “Advertising / Display Surfaces” (Required)

The system must provide controlled places to **showcase products/events** :

**Ad surfaces (examples):**

```
● Home: featured items carousel (by family / global)
```
```
● Family space: “Support this family” featured items
```
```
● Event page: related products (e.g., souvenirs)
```
```
● Public marketplace: promoted listings
```
**AdSlot model** controls which items show where + schedule + targeting:

```
● target family / branch / region / language
```
```
● start/end date
```
```
● budget in KCC coin or admin credits
```
## 17. KCC Coin Integration (Full Scope)

#### 17.1 Core idea

KCC Coin is a **platform utility token/points** used for:

```
● rewarding contributions
```
```
● purchasing/supporting families
```
```
● promoting listings/ads
```

```
● optional event donations
```
#### 17.2 Wallet & Ledger (Required)

```
● Each user has a wallet (KccWallet)
```
```
● Ledger entries are immutable (KccLedgerEntry)
```
```
● Balance is derived from ledger (or cached with reconciliation)
```
**Ledger entry fields:**

```
● id, wallet_id
```
```
● type: earn / spend / transfer / adjustment
```
```
● amount
```
```
● reference_type + reference_id (order, post, event, moderation, etc.)
```
```
● status: pending/confirmed/reversed
```
```
● created_at
```
#### 17.3 Earn rules (examples)

```
● claim verified
```
```
● profile completion
```
```
● contributing approved history edits
```
```
● uploading tagged media approved
```
```
● attending events (check-in)
```
```
● helping others (admin award)
```
#### 17.4 Spend rules (examples)


```
● checkout: pay with KCC coin (full or partial, policy-defined)
```
```
● donate/support a family
```
```
● promote a product/event in AdSlot
```
```
● unlock premium exports (optional — but since you want all-in, keep it available)
```
#### 17.5 Integration Approach (API)

Two valid patterns; pick one:

**Option A — Internal Ledger (recommended for)**

```
● Ledger lives in this system
```
```
● External KCC coin system provides:
```
```
○ exchange rate
```
```
○ top-up / withdrawal hooks (optional)
```
```
● Lower risk, easier reconciliation
```
**Option B — External Ledger as Source of Truth**

```
● Every spend/earn calls KCC API
```
```
● Requires high availability, retries, idempotency keys
```
**Required technical requirements for KCC API integration:**

```
● OAuth/API key management
```
```
● Idempotency keys for credit/debit
```
```
● Webhooks for confirmation
```
```
● Retry strategy + dead-letter queue
```
```
● Reconciliation job
```

## 18. Descendant Report (PDF Required)

#### 18.1 Report types

```
● Descendants list report (generation-based)
```
```
● Optional: tree snapshot pages
```
#### 18.2 PDF generation

```
● Backend job queue generates PDFs
```
```
● Stored in object storage
```
```
● Download links with authorization checks
```
```
● Respects privacy rules:
```
```
○ hide minors
```
```
○ honor field visibility
```
## 19. Credential Management & Non-Functional

## Requirements (Required)

#### 19.1 Credential management

```
● Email + OTP login (optionally password)
```
```
● Google, FB connection
```
```
● Session tokens with expiry
```
```
● Device list + force logout
```

```
● Password reset (if password enabled)
```
#### 19.2 Security

```
● RBAC per familyspace
```
```
● branch-scoped permissions
```
```
● field-level visibility enforcement
```
```
● audit logs for:
```
```
○ relation changes
```
```
○ claims
```
```
○ admin moderation
```
```
○ coin adjustments
```
```
○ payouts/refunds
```
#### 19.3 Performance

```
● tree progressive loading + virtualization
```
```
● pagination on posts, comments, members
```
```
● image compression + lazy loading
```
```
● caching: server-side + CDN for media
```
#### 19.4 Reliability

```
● automated daily backups
```
```
● restore plan
```
```
● background job monitoring
```

```
● webhook retry & reconciliation for payments/coin
```
#### 19.5 Privacy & Compliance

```
● consent + privacy policy acceptance
```
```
● export data (user and admin)
```
```
● account deletion/anonymization
```
```
● minors protection (guardian controls)
```
#### 19.6 Welcome Page

```
● First Time User
```
```
● Onboarding process (select language, register)
```
#### 19.7 Publication to store/github

```
● Upload to IOS, Playstore, be able to resolve any rejection issues
```
#### 19.8 Ads Monetization

```
● You are required to connect the apps to ads to allow monetization from google for free
members.
```
#### 19.9 Dark Light Mode

## 20. High-Level API Modules Suggested API namespaces:

```
● /auth/* login, otp, sessions, devices
```
```
● /familyspaces/* family switcher, membership, roles
```

```
● /clantree/* person CRUD, relations, search, claim
```
```
● /posts/* feed, comments, reactions, moderation
```
```
● /events/* create, invite, rsvp, check-in
```
```
● /media/* upload, attach, permissions
```
```
● /history/* chapters, revisions, approvals
```
```
● /migration/* nodes, edges, timeline
```
```
● /connections/* family/member connections, blocks
```
```
● /mall/* products, listings, orders, fulfillment, payouts
```
```
● /kcc/* wallet, ledger, earn, spend, promote
```
```
● /reports/* descendant pdf generation and download
```
```
● /notifications/* in-app, push tokens
```
## 21. Deliverables

```
● Flutter app (mobile + basic web)
```
```
● Desktop web admin + visualization pages
```
```
● APIs + Postgres schema
```
```
● Storage + job queue
```
```
● K-Mall + KCC coin integration
```
```
● PDF report generation
```
```
● Full i18n (ZH primary, EN secondary)
```

## 22. Public Directory & People Search (Opt-in)

#### 22.1 Purpose

The system shall support an **opt-in public people search** feature to allow individuals to be
discovered by the public **without exposing private family data**.

Primary use cases:

```
● Orphans or adoptees searching for relatives using surname
```
```
● Individuals seeking extended family connections
```
```
● Cultural or lineage discovery without joining a family space
```
This feature **must not expose the full family tree** and **must not compromise privacy**.

## 22.2 Key Design Principles

1. **Private by default**
2. **Explicit opt-in for public discoverability**
3. **Field-level visibility control**
4. **No direct exposure of contact details**
5. **Strong anti-abuse protections**

## 22.3 Privacy Modes (Per Person)

Each claimed Person record must support one of the following modes:

```
Privacy Mode Description
```

```
private (default) Not^ searchable,^ not^ publicly^ visible^
```
```
public_searchab
le
```
```
Searchable by limited fields, shows summary card
only
```
```
public_profile Searchable^ and^ has^ a^ public^ profile^ page^
```
Rules:

```
● Unclaimed persons default to private
```
```
● Minors cannot be public searchable
```
```
● Deceased persons may be searchable (admin-configurable)
```
## 22.4 Publicly Searchable Fields (Whitelist)

Only fields explicitly marked public are indexed and displayed.

#### Allowed (Recommended)

```
● Surname (last name)
```
```
● Public display name (optional)
```
```
● Approximate birth year or age range (optional)
```
```
● Country / region (optional)
```
```
● Public tags (optional):
```
```
○ “Seeking relatives”
```
```
○ “Adoptee / orphan”
```

```
○ “Descendant of [ancestor name]”
```
#### Not Allowed

```
● Exact birth date
```
```
● Home address
```
```
● Phone number / email (unless explicitly enabled)
```
```
● Full parent/child/spouse graph
```
```
● Any data related to minors
```
## 22.5 Public Search Behavior

#### Public (No Login Required)

```
● Search by:
```
```
○ Surname (required)
```
```
○ Optional filters: region, birth year range, tags
```
```
● Results return limited profile cards only
```
Each result card shows:

```
● Display name
```
```
● Surname
```
```
● Region (if public)
```
```
● Short public note (optional)
```
```
● “Contact” button (request-based)
```

## 22.6 Public Contact Flow (Safe Messaging)

Direct contact details are **never exposed by default**.

#### Contact Request Flow

1. Public user clicks **Contact**
2. Submits:

```
○ Name (required)
```
```
○ Message (required)
```
```
○ Optional contact info (optional)
```
3. System delivers message to target user:

```
○ In-app inbox
```
```
○ Email notification (if enabled)
```
4. Target user may:

```
○ Accept
```
```
○ Decline
```
```
○ Block
```
Only upon acceptance may further communication occur.

## 22.7 Anti-Abuse & Security Requirements (Mandatory)

```
● Rate limiting on public search (e.g., per IP / per day)
```
```
● CAPTCHA on contact requests
```

```
● No bulk export or scraping APIs
```
```
● Fuzzy search limits (surname-based only)
```
```
● Blocklist per user
```
```
● Report abuse function
```
```
● Audit logs for:
```
```
○ Privacy setting changes
```
```
○ Public contact requests
```
```
○ Blocks and reports
```
## 22.8 Data Model Additions

#### Person (Public Fields)

person.privacy_mode

person.is_minor

person.public_display_name

person.public_bio

person.public_birth_year

person.public_region

person.public_tags

#### Public Search Index (Derived Table)

public_person_index

- person_id


- surname_normalized
- display_name_normalized
- region
- birth_year
- tags
- is_active
- updated_at

#### Public Contact Requests

public_contact_request

- id
- target_person_id
- sender_name
- sender_contact_optional
- message
- status (pending/accepted/declined/blocked)
- created_at

## 22.9 API Endpoints

#### Public APIs

```
● GET /public/people/search
```

```
● GET /public/people/{public_id}
```
#### Authenticated APIs

```
● POST /public/people/{id}/contact-request
```
```
● PATCH /me/person/public-settings
```
```
● GET /me/public-contact-requests
```
All public APIs must enforce:

```
● Rate limits
```
```
● CAPTCHA validation
```
```
● Field-level filtering
```
## 22.10 Product Policy (Required Statement)

```
Public discoverability is opt-in only.
By default, all persons are private.
Minors are never searchable.
Public contact is request-based and mediated by the platform.
```

# Appendix A — Pricing & Monetization

# Strategy

## A1. Pricing Philosophy

The platform adopts a **hybrid monetization model** designed to balance:

```
● Low-friction adoption for individual family members
```
```
● Sustainable recurring revenue from family administrators and organizations
```
```
● Usage-based revenue from commerce, promotion, and ecosystem activity
```
#### Core Principle

```
Individuals should never feel “taxed to belong to a family”.
The cost of the platform should be borne by those who manage, operate, or
commercially benefit from it.
```
This principle ensures:

```
● Strong grassroots adoption
```
```
● Clear willingness-to-pay alignment
```
```
● Long-term scalability
```
## A2. Pricing Units (Revenue Layers)

The system monetizes across **four distinct layers** :

1. **Individual User**
2. **Family Space**


3. **Organization / Clan / Association**
4. **Transactions & Promotion** (K-Mall & KCC Coin)

Each layer is independent and cumulative.

## A3. Individual Users

#### (Free by default + Optional One-off Purchases)

#### A3.1 Free Tier (Default)

All users can, **without payment** :

```
● Join one or more Family Spaces (with link or qr code)
```
```
● View the unified big family tree (read-only)
```
```
● Claim a Person profile
```
```
● Edit personal bio and timeline
```
```
● Participate in family feeds and events
```
```
● Use the basic Family Calculator
```
```
● Browse K-Mall listings
```
```
● Be discoverable publicly only if they opt in
```
```
The free tier is mandatory to ensure adoption and network growth.
```
#### A3.2 One-off Purchases

One-time payments, tied to the user account (non-recurring).

```
Feature Payment Type
```

```
Descendant Report (PDF export) One-off
```
```
Advanced Family Calculator One-off
```
```
High-resolution media export One-off
```
```
Advanced genealogy views (future) One-off
```
**Supported Payment Methods**

```
● Fiat (e.g. Stripe)
```
```
● KCC Coin (preferred within the ecosystem)
```
## A4. Family Space Subscription (Core Recurring Revenue)

#### A4.1 Charging Unit

👉 **Per Family Space** , not per individual user

#### A4.2 Who Pays

```
● Family Owner / Family Admin
```
```
● Never individual family members
```
#### A4.3 Included Capabilities

A subscribed Family Space unlocks:

```
● Family Admin / Co-Admin / Editor roles
```
```
● Branch creation and management
```
```
● Increased media storage quota
```
```
● Full Migration Map (timeline + routes)
```

```
● Cross-family event invitations
```
```
● Basic family analytics (growth, engagement)
```
```
● Ability to publish products and services in K-Mall
```
```
● Eligibility to receive KCC Coin support/donations
```
#### A4.4 Indicative Pricing (Illustrative)

```
Billing Cycle Price (Example)
```
```
Monthly USD 9–19 / family
```
```
Annual USD 99–199 / family
```
```
Final pricing can be adjusted, but this subscription structure must exist in so
engineering can implement gating and enforcement correctly.
```
## A5. Organization / Clan / Association (B2B SaaS)

#### A5.1 Target Customers

```
● Clan organizations
```
```
● Surname associations
```
```
● Regional or national family councils
```
#### A5.2 Capabilities

Organization-level subscriptions unlock:

```
● Management of multiple Family Spaces
```
```
● Organization-wide admin console
```

```
● Branding and public-facing pages
```
```
● Organization-level events and announcements
```
```
● Cross-family analytics and reports
```
```
● Data export (CSV / PDF)
```
```
● Preferred KCC Coin settlement and billing
```
#### A5.3 Pricing Model

```
● Annual subscription
```
```
● Tiered by:
```
```
○ Number of families
```
```
○ Total members
```
```
○ Storage / analytics needs
```
## A6. K-Mall Monetization (Transaction-Based Revenue)

#### A6.1 Platform Commission

The platform charges a **percentage-based commission** on completed transactions.

Applies to:

```
● Physical products
```
```
● Digital products
```
```
● Services
```
```
● Donations / family support
```

#### A6.2 Seller Identity & Trust

Every listing must clearly show:

```
“Sold by: [Family / Branch Name]”
```
The platform acts as:

```
● Marketplace operator
```
```
● Order coordinator
```
```
● Settlement and ledger authority
```
## A7. Advertising & Promotion

#### (KCC Coin–Driven)

#### A7.1 Promotional Surfaces

The platform provides **controlled, non-intrusive promotion slots** , including:

```
● Home page featured items
```
```
● Family Space “Support This Family” sections
```
```
● Marketplace promoted listings
```
```
● Event-related product highlights
```
#### A7.2 Payment & Budgeting

```
● Primary currency: KCC Coin
```
```
● Alternative: Admin credits (converted to KCC internally)
```

#### A7.3 Campaign Controls

```
● Time-based scheduling
```
```
● Audience targeting (family / branch / region / language)
```
```
● Admin approval required
```
```
● Transparent spend tracking
```
## A8. Role of KCC Coin in Pricing & Revenue

KCC Coin functions as a **utility and incentive layer** , not a mandatory currency.

It is used to:

```
● Earn rewards for meaningful contributions
```
```
● Spend on promotions, ads, and support
```
```
● Support families and events
```
```
● Optionally pay for goods/services (partial or full)
```
```
Users can fully use the platform without KCC Coin,
but KCC Coin significantly increases engagement and monetization depth.
```
## A9. Pricing Enforcement (Technical Requirements)

All pricing and monetization rules must be enforced via backend logic:

```
● Authorization checks per subscription tier
```
```
● Feature flags tied to Family Space / Organization plans
```

```
● Ledger validation for all KCC Coin earn/spend actions
```
```
● Immutable audit logs for:
```
```
○ Payments
```
```
○ Coin adjustments
```
```
○ Promotions
```
```
○ Refunds and reversals
```
## A10. Why Pricing Is Defined at PRD Level

Defining pricing at the PRD stage ensures:

```
● Clear feature gating from day one
```
```
● No accidental “free forever” features
```
```
● Correct backend permission and billing design
```
```
● Alignment between product, engineering, and business
```
```
● Easier future pricing iteration without re-architecture
```

# Appendix B — Platform Admin Portal

# (Business Owner Console)

**Version B2.0 — Governance & Control Enhanced**

# B1. Purpose & Scope

The Platform Admin Portal is a business-owner–only control system used by the platform
operator to run, monitor, and govern the platform at a global level.

This portal is NOT accessible to:

```
● Family members
```
```
● Family Admins (Tribe Sovereign, Council Elder, etc.)
```
```
● Branch Admins
```
```
● Editors or general users
```
It exists solely for:

```
● Platform operations
```
```
● Monetization and billing
```
```
● Risk, compliance, and trust & safety
```
```
● System configuration and reliability
```
#### Important Distinction

All Family-level governance described in the main PRD (roles, branches, claims, approvals)
belongs to the **Family Admin Panel** , not this portal.


# B2. Internal Access Control (RBAC Model)

## B2.1 Internal Role Hierarchy

The following internal roles may access this portal:

1. Platform Owner
2. Super Admin
3. Operations Admin
4. Finance Admin
5. Moderation Admin (Trust & Safety)
6. DevOps Admin
7. Read-only Auditor

## B2.2 Role Separation Principles

```
● No role may control billing + wallets + infra simultaneously except Super Admin.
```
```
● All privileged actions must:
```
```
○ Require authentication
```
```
○ Require reason input
```
```
○ Be fully audited
```
```
● Super Admin must use 2FA.
```
```
● Sensitive actions may require dual confirmation (e.g., wallet freeze).
```

## B2.3 Permission Matrix (High-Level)

```
Capability Super Ops Finance Moderatio
n
```
```
DevOps Auditor
```
```
Suspend Family Space ✔ ✔ ✖ ✔
(risk-base
d)
```
##### ✖ ✖

```
Modify System Config ✔ ✖ ✖ ✖ ✔ (infra
only)
```
##### ✖

```
Refund Invoice ✔ ✖ ✔ ✖ ✖ ✖
```
```
View Billing ✔ ✔ ✔ ✖ ✖ ✔
```
Freeze Wallet (via BigK API) ✔ ✖ ✖ Flag only ✖ ✖

```
Access Audit Logs ✔ Scoped Scoped Scoped Scoped ✔
(read-only)
```
```
Export Full Logs ✔ ✖ ✖ ✖ ✖ ✖
```
```
Background Job Control ✔ ✖ ✖ ✖ ✔ ✖
```
```
Abuse Workflow ✔ ✔ ✖ ✔ ✖ ✔ (view
only)
```
# B3. Core Functional Modules

# B3.1 Platform Overview Dashboard

# (Risk-First Model)

## 🔴 Critical Alerts Panel (Top Section)

```
Must include:
```

```
● Active system incidents
```
```
● Pending L2/L3 abuse escalations
```
```
● Wallet anomaly alerts
```
```
● Chargeback spikes
```
```
● High-risk Family Spaces
```
```
● Pending seller/KYC verification
```
```
● SLA breaches
```
This panel cannot be hidden.

## 🟠 Platform Health Summary

```
● API latency
```
```
● Background job failures
```
```
● Webhook failures
```
```
● Queue backlog
```
```
● Uptime %
```
## 🟡 Risk Metrics Snapshot

```
● High-risk Family Spaces
```
```
● Refund rate %
```
```
● Chargeback rate %
```

```
● Wallet freeze count
```
```
● Abuse trend (7 days)
```
## 🟢 Revenue Overview (Secondary Priority)

```
● Subscriptions
```
```
● One-off purchases
```
```
● Marketplace commissions
```
```
● Advertising revenue
```
Revenue must not visually dominate risk signals.

# B3.2 Family Space (Organization)

# Management

_“Organization” is renamed to “Family Space” to align with product identity._

Capabilities:

```
● Search any Family Space
```
```
● View:
```
```
○ Plan tier
```
```
○ Owner
```
```
○ Member count
```
```
○ Storage usage
```

```
○ Risk score
```
```
○ Status (active/suspended)
```
Platform Actions:

```
● Suspend / Reinstate
```
```
● Grant credits
```
```
● Extend trial
```
```
● Force plan change (audited)
```
```
● Compliance export/delete request handling
```
# B3.2A Family Space Risk Scoring Module

Each Family Space receives:

Risk Level:

```
● Low
```
```
● Medium
```
```
● High
```
#### Risk Score Formula (Weighted Model)

Risk Score =
(Abuse Reports × weight)

```
● (Refund Rate × weight)
```
```
● (Chargebacks × weight)
```
```
● (Wallet Flags × weight)
```

```
● (Seller Disputes × weight)
```
Score recalculated daily.

High-risk triggers:

```
● Dashboard alert
```
```
● Auto moderation review
```
```
● Optional freeze recommendation
```
# B3.3 Billing & Monetization Control

```
● Subscription plan creation/editing
```
```
● Price configuration
```
```
● Feature gating via backend flags
```
```
● Invoice and payment history
```
```
● Refund management (reason required)
```
```
● Commission configuration
```
```
● Revenue reporting
```
Finance Admin role-scoped.

# B3.4 Mall Platform Operations

(Formerly “K-Mall” — renamed to “Mall”)


```
● Global listing moderation queue
```
```
● Seller verification status
```
```
● Platform-level delisting
```
```
● Dispute resolution workflow
```
```
● Payout overview
```
```
● Fraud indicators (refund patterns, chargebacks)
```
# B3.5 KCC Coin Governance

# (Monitoring-Only Model)

To avoid dual control planes:

#### Kincore Admin Portal may:

```
● Monitor organization-level KCC activity
```
```
● Flag suspicious wallet activity
```
```
● Trigger wallet freeze via BigK API
```
```
● View reconciliation status
```
#### Kincore Admin Portal may NOT:

```
● Mint/burn tokens
```
```
● Modify tokenomics
```
```
● Control treasury
```
```
● Override ledger entries
```

All treasury authority remains in BigK Admin.

# B3.6 Advertising & Promotion

```
● AdSlot inventory
```
```
● Campaign approval
```
```
● Budget tracking
```
```
● Region/language targeting
```
```
● Policy enforcement
```
# B3.7 Trust, Safety & Abuse Workflow

# Engine

Upgrade from list view to structured workflow.

Each case must contain:

```
● Assigned moderator
```
```
● Escalation level (L1, L2, L3)
```
```
● Internal notes
```
```
● Timeline of actions
```
```
● SLA countdown timer
```
```
● Automated flagging logic
```
```
● Resolution type
```

Escalation Model:

L1 → Moderator
L2 → Senior Moderator
L3 → Super Admin approval required

Platform-level moderation overrides family-level decisions when policy violations occur.

# B3.8 Structured System Configuration

Replace flat configuration with structured grouping:

1 ⃣ Governance & Feature Flags
2 ⃣ Authentication & Identity
3 ⃣ Infrastructure & Storage
4 ⃣ Payment & Wallet Integrations
5 ⃣ Security Policies

All changes must:

```
● Require reason
```
```
● Be audited
```
```
● Be immutable
```
# B3.9 Observability, Reliability &

# Operations

Must include:

```
● Alert threshold configuration
```
```
● Alert channels (Email / Slack / Webhook)
```

```
● Incident history log
```
```
● Background job monitoring
```
```
● Webhook retry & dead-letter queue
```
```
● Backup status
```
```
● Prod / Staging separation
```
```
● Public status page preview
```
Only DevOps + Super Admin may configure thresholds.

# B4. Audit & Compliance

All actions must:

```
● Be recorded in AuditLog
```
```
● Include actor, action, target, timestamp, reason
```
```
● Be immutable
```
```
● Be exportable (role-restricted)
```
Audit filters must include:

```
● Family Space
```
```
● User
```
```
● Admin role
```
```
● Date range
```
```
● Action type
```

```
● Severity (Low / Medium / High / Critical)
```
Full export → Super Admin only.

# B5. Explicit Non-Scope

The Platform Admin Portal must NOT:

```
● Edit family trees directly
```
```
● Create posts as users
```
```
● Bypass family governance silently
```
```
● Replace the Family Admin Panel
```
# B6. Naming Convention (Enforced)

Platform Admin Portal
→ Business Owner / Platform Operator Console

Family Admin Panel
→ Tribe Sovereign / Council Elder governance UI

All documentation must specify which admin context applies.

# B7. Separation of Powers Principle

The system must enforce:

No single non-super role may simultaneously control:


```
● Billing
```
```
● Wallet controls
```
```
● System configuration
```
```
● Moderation authority
```
This prevents systemic abuse and ensures enterprise-grade governance.


