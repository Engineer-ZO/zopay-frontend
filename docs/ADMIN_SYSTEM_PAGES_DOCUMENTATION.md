# Admin System Pages Documentation

## 1. Overview
This document details the implementation of the "System" and "Help" modules within the ZitoPay Admin Portal. These pages provide Super Admins with the tools necessary to configure the platform, monitor security audits, manage the internal team, and access support resources.

 **Implemented Pages:**
- **Platform Settings:** `/admin/settings`
- **Audit Logs:** `/admin/audit-logs`
- **Admin Users:** `/admin/users`
- **Help & Support:** `/admin/support` (and `/admin/documentation` redirect)

---

## 2. Platform Settings (`/admin/settings`)
The "nerve center" of the platform for global configuration.

### Key Features
*   **Tabbed Interface:**
    *   **General:** Platform identity (Name, Support Email/Phone) and Maintenance Mode toggle.
    *   **Payments & Fees:** Global fee structure visualization and Currency formatting (XAF, EUR, USD).
    *   **Gateways:** Status monitoring and global kill-switches for MTN Mobile Money, Orange Money, and Bank rails.
    *   **Security:** Administrative 2FA enforcement and IP Whitelisting (CIDR notation).
*   **Interactive Elements:**
    *   "Save Changes" button with a loading state simulation.
    *   "Reset Defaults" functionality.
*   **System Status Widget:** Real-time mock display of Database Load, API Latency, and Error Rates.
*   **Maintenance Actions:** Quick actions to clear cache or purge temp files.

### Technical Note
*   Uses `framer-motion` for smooth tab transitions.
*   State is currently local; requires backend integration to persist `maintenanceMode` and other settings.

---

## 3. Audit Logs (`/admin/audit-logs`)
An immutable record of administrative actions for security and compliance.

### Key Features
*   **Search & Filtering:**
    *   Search by Actor Name, Target ID, or Action Type.
    *   Filters for Date Range and Action Category.
*   **Diff Viewer:**
    *   Expandable rows reveal a "Change Manifest".
    *   Displays **BEFORE** vs **AFTER** JSON objects to visualize exact configuration changes.
    *   Color-coded differences (Red for removal/before, Green for addition/after).
*   **Severity Indicators:** Visual badges (Low, Medium, High, Critical) to prioritize security events.

### Data Structure
The log entries follow a strict schema:
```typescript
interface AuditLog {
    id: string;
    timestamp: string;
    actor: { name: string; role: string; email: string };
    action: string;
    target: string;
    ipAddress: string;
    details: { before?: any; after?: any }; // Supports flexible diffs
    severity: "low" | "medium" | "high" | "critical";
}
```

---

## 4. Admin Users (`/admin/users`)
RBAC (Role-Based Access Control) management for the internal ZitoPay team.

### Key Features
*   **User Table:** Lists all internal admins with their current status (Active/Locked) and Last Login time.
*   **Role Badges:** distinct visual indicators for:
    *   `Super Admin` (Purple)
    *   `Finance Admin` (Green)
    *   `Compliance Admin` (Blue)
    *   `Support Admin` (Gray)
*   **Invite Modal:** A form to invite new team members, requiring Email, Full Name, and Role assignment.

### Future Integration
*   The "Invite" action should trigger a transactional email via the backend (e.g., SendGrid/AWS SES).
*   "Lock" action should immediately revoke the user's session tokens.

---

## 5. Help & Support (`/admin/support`)
A centralized hub for documentation and incident management.

### Key Features
*   **Unified View:** Combines static documentation with active support ticketing.
*   **Documentation Tab:**
    *   Categorized knowledge base (Onboarding, Finance, Technical, Admin).
    *   Search bar for finding specific SOPs or error codes.
*   **Support Tab:**
    *   **Ticket Queue:** View of active tickets from merchants (simulating a Zendesk integration).
    *   **Emergency Escalation:** Quick view of the "On-Call" engineer for critical P0 incidents.
*   **Redirect:** Visiting `/admin/documentation` automatically redirects to this page.

---

## 6. Implementation Details

### UI/UX Design
*   **Consistent Aesthetic:** Uses the standardized ZitoPay Admin styling (Clean layouts, `purple-600` primary color, `gray-50` backgrounds).
*   **Icons:** Extensive use of `lucide-react` for intuitive visual cues.
*   **Animations:** `AnimatePresence` used for modal entries and tab switching to creates a premium feel.

### Sidebar Integration
All new pages have been registered in `AdminSidebar.tsx` under the **SYSTEM** and **HELP** sections, ensuring seamless navigation.
