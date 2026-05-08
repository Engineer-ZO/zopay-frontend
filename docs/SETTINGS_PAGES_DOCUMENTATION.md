# Settings Section Pages Documentation

**Date:** January 13, 2026  
**Version:** 1.0.0

---

## 📋 Overview

This document covers all Settings section pages in the ZitoPay merchant dashboard:

1. ~~**Business / Environment Settings**~~ — **Removed** (KYB submitted manually; old URL redirects to Help & Support)
2. ✅ **Team Members** - User management & roles
3. ✅ **Network access** - Domains & IP whitelist (tabs)
4. ✅ **Notifications** - Email preferences

---

## 🏢 BUSINESS / ENVIRONMENT SETTINGS (REMOVED)

**Status:** The in-dashboard Environment Settings / KYB page was removed. KYB is handled manually (e.g. via support).

**Legacy route:** `/dashboard/settings/business` → server **redirect** to `/dashboard/support`.

---

## 👥 TEAM MEMBERS PAGE

**File:** `app/dashboard/settings/team/page.tsx`  
**Route:** `/dashboard/settings/team`  
**Purpose:** Manage team members and permissions

### **Features Implemented:**

#### **1. Team Overview Cards (3)**
- **Total Members** - Blue
- **Owners** - Yellow
- **Admins** - Purple

#### **2. Members Table**

**Columns:**
1. Name/Email
2. Role (with emoji icons)
3. Joined Date
4. Actions

**Member Types:**
- **Active Members:**
  - Name and email displayed
  - Role badge (👑 Owner, 🔧 Admin, 👁️ Viewer)
  - Edit button (except for Owner)

- **Pending Invitations:**
  - Email only
  - "(Invitation sent)" label
  - "📧 Pending [Role]" badge
  - Resend button

**Role Icons:**
- 👑 **Owner** - Yellow crown
- 🔧 **Admin** - Blue shield
- 👁️ **Viewer** - Gray eye

#### **3. Role Permissions Matrix**

**Table showing permissions for each role:**

| Permission | Owner | Admin | Viewer |
|------------|-------|-------|--------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Transactions | ✅ | ✅ | ✅ |
| Create Payouts | ✅ | ✅ | ❌ |
| Process Refunds | ✅ | ✅ | ❌ |
| Manage API Keys | ✅ | ✅ | ❌ |
| Manage Webhooks | ✅ | ✅ | ❌ |
| Manage Team | ✅ | ✅ | ❌ |
| Edit Business Settings | ✅ | ✅ | ❌ |
| Delete Account | ✅ | ❌ | ❌ |

#### **4. Invite Member Modal**

**Fields:**
- Email Address *
- Role selection (Admin/Viewer radio buttons)

**Permission Preview:**
- Shows permissions for selected role
- Green checkmarks for granted
- Red X for denied

**Actions:**
- Cancel
- Send Invitation

### **User Roles:**

**Owner:**
- Full access to everything
- Cannot be removed
- Can delete account

**Admin:**
- Full access except deleting account
- Can manage team
- Can edit settings

**Viewer:**
- Read-only access
- Can view dashboard and transactions
- Cannot make changes

---

## 🌍 NETWORK ACCESS (DOMAINS & IP WHITELIST)

**Files:** `app/dashboard/settings/network-access/page.tsx`, `components/dashboard/settings/NetworkAccessDomainsTab.tsx`, `components/dashboard/settings/NetworkAccessIpsTab.tsx`  
**Route:** `/dashboard/settings/network-access` (`?tab=domains` | `?tab=ips`; legacy `/dashboard/settings/domains` and `/dashboard/settings/ips` redirect with the correct tab)  
**Purpose:** Manage allowed domains and IP addresses for production API access (tabbed UI)

### **Features Implemented:**

#### **1. Domains Table**

**Columns:**
1. Domain (with globe icon)
2. Status (with badges)
3. Added Date
4. Actions

**Domain Statuses:**
- **✅ Verified** - Green badge
- **⏳ Pending** - Orange badge with Verify button
- **❌ Failed** - Red badge with Retry button

#### **2. Add Domain Modal**

**Fields:**
- Domain Name * (text input)
- Helper text: "Do not include http:// or https://"

**Actions:**
- Cancel
- Add Domain

#### **3. Verify Domain Modal**

**DNS Record Information:**
- **Type:** TXT
- **Name:** _zitopay-verify
- **Value:** zitopay-verify-abc123def456

**Features:**
- Verification code display
- Copy button with feedback
- Step-by-step instructions:
  1. Go to your DNS provider
  2. Add the TXT record above
  3. Wait for DNS propagation (up to 24 hours)
  4. Click "Verify Domain" below

**Actions:**
- Cancel
- Verify Domain

### **Domain Verification Flow:**
```
Add Domain → Generate TXT Record → Add to DNS → Wait for Propagation → Verify → Verified
                                                                      ↓
                                                                    Failed → Retry
```

---

## 🔔 NOTIFICATIONS PAGE

**File:** `app/dashboard/settings/notifications/page.tsx`  
**Route:** `/dashboard/settings/notifications`  
**Purpose:** Manage email notifications and preferences

### **Features Implemented:**

#### **1. Email Notifications Section**

**Transaction Notifications:**
- ☑ Successful payments
- ☑ Failed payments
- ☑ Large transactions (> 100,000 FCFA)
- ☐ All transactions

**Payout Notifications:**
- ☑ Payout completed
- ☑ Payout failed
- ☐ All payouts

**Account Notifications:**
- ☑ Low balance alerts (< 50,000 FCFA)
- ☑ KYB status updates
- ☑ Production access updates
- ☑ Security alerts

**Settlement Notifications:**
- ☑ Settlement completed
- ☑ Settlement failed
- ☑ Weekly settlement summary

**Features:**
- Checkbox toggles for each notification type
- Grouped by category
- Hover effect on labels
- Save Preferences button with success feedback

#### **2. Notification Recipients Section**

**Fields:**
- **Primary Email** (read-only display)
- **Additional Recipients** (comma-separated input)

**Features:**
- Text input for multiple emails
- Helper text for format
- Save Recipients button with success feedback

### **Notification Types:**

**Critical (Always Recommended):**
- Failed payments
- Security alerts
- KYB status updates
- Settlement failed

**Important:**
- Successful payments
- Payout completed/failed
- Low balance alerts

**Optional:**
- All transactions (can be noisy)
- All payouts
- Weekly summaries

---

## 📊 Data Flow

### **Team Members:**
```
Invite → Send Email → User Accepts → Account Created → Active Member
Owner → Manage Roles → Update Permissions → Apply Changes
```

### **Domains:**
```
Add Domain → Generate TXT → User Adds to DNS → Verify → Verified
Failed Verification → Retry → Check DNS → Verify Again
```

### **Notifications:**
```
Toggle Preferences → Save → Update Backend → Send Notifications Based on Settings
Add Recipients → Save → Update Email List → Include in Notifications
```

---

## 🚨 Missing Backend Features

### **Team Members:**
- [ ] User invitation system
- [ ] Email delivery for invites
- [ ] Role-based access control (RBAC)
- [ ] Permission enforcement
- [ ] Team member removal

### **Domains:**
- [ ] DNS TXT record verification
- [ ] Domain ownership validation
- [ ] DNS propagation checking
- [ ] Domain removal
- [ ] Multiple domain support

### **Notifications:**
- [ ] Notification preference storage
- [ ] Email delivery system
- [ ] Notification triggers
- [ ] Email template management
- [ ] Recipient management

---

## ✅ Implementation Checklist

### **Completed:**
- [x] Legacy business settings URL redirects to Help & Support (in-app KYB / environment page removed)
- [x] Team Members page layout
- [x] Team overview stats
- [x] Members table
- [x] Role permissions matrix
- [x] Invite member modal
- [x] Domains page layout
- [x] Domains table
- [x] Add domain modal
- [x] Verify domain modal with DNS instructions
- [x] Notifications page layout
- [x] Email preference toggles
- [x] Notification recipients

### **Pending:**
- [ ] Backend API integration
- [ ] KYB document upload
- [ ] User invitation emails
- [ ] DNS verification
- [ ] Notification delivery
- [ ] Real-time updates

---

## 🎨 Design Consistency

**All Settings pages follow:**

**Layout:**
- Header with title and description
- Sections in rounded cards
- Consistent spacing (p-6, space-y-6)

**Colors:**
- Green for success/verified
- Orange for pending/warnings
- Red for errors/danger
- Blue for information

**Components:**
- Modals with rounded-2xl
- Tables with hover effects
- Buttons with transitions
- Status badges with icons

**Typography:**
- Page title: `text-xl font-bold`
- Section title: `text-sm font-semibold`
- Labels: `text-xs font-medium`
- Body: `text-xs` or `text-sm`

---

## 🔐 Security Considerations

### **Team Members:**
- Validate email addresses
- Prevent owner from being removed
- Require confirmation for role changes
- Log all team changes

### **Domains:**
- Validate domain ownership via DNS
- Prevent duplicate domains
- Require HTTPS for verified domains

### **Notifications:**
- Validate email addresses
- Prevent notification spam
- Allow unsubscribe options
- Respect user preferences

---

## 📝 Notes

### **Best Practices:**
- Always show confirmation for destructive actions
- Provide clear feedback for user actions
- Use loading states during async operations
- Show helpful error messages

### **User Experience:**
- Group related settings together
- Use progressive disclosure (modals)
- Provide inline help text
- Show success/error feedback

### **Performance:**
- Lazy load modals
- Debounce input changes
- Cache settings locally
- Optimize re-renders

---

**End of Documentation**

All Settings pages are complete and ready for backend integration! 🎉
