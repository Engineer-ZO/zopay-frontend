"use client";

import { useState } from "react";
import {
    Users,
    Crown,
    Shield,
    Eye,
    Mail,
    Plus,
    MoreVertical,
    X,
    CheckCircle2,
    XCircle,
} from "lucide-react";

type UserRole = "owner" | "admin" | "viewer";
type MemberStatus = "active" | "pending";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: MemberStatus;
    joinedDate: string;
}

export default function TeamMembersPage() {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteRole, setInviteRole] = useState<"admin" | "viewer">("admin");

    const stats = {
        total: 5,
        owners: 1,
        admins: 2,
    };

    const members: TeamMember[] = [
        {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "owner",
            status: "active",
            joinedDate: "Jan 1",
        },
        {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "admin",
            status: "active",
            joinedDate: "Jan 5",
        },
        {
            id: "3",
            name: "Bob Wilson",
            email: "bob@example.com",
            role: "viewer",
            status: "active",
            joinedDate: "Jan 10",
        },
        {
            id: "4",
            name: "",
            email: "alice@example.com",
            role: "admin",
            status: "pending",
            joinedDate: "Jan 12",
        },
    ];

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case "owner":
                return <Crown className="w-4 h-4 text-yellow-600" />;
            case "admin":
                return <Shield className="w-4 h-4 text-blue-600" />;
            case "viewer":
                return <Eye className="w-4 h-4 text-gray-600" />;
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case "owner":
                return "👑 Owner";
            case "admin":
                return "🔧 Admin";
            case "viewer":
                return "👁️ Viewer";
        }
    };

    const permissions = [
        { name: "View Dashboard", owner: true, admin: true, viewer: true },
        { name: "View Transactions", owner: true, admin: true, viewer: true },
        { name: "Create Payouts", owner: true, admin: true, viewer: false },
        { name: "Process Refunds", owner: true, admin: true, viewer: false },
        { name: "Manage API Keys", owner: true, admin: true, viewer: false },
        { name: "Manage Webhooks", owner: true, admin: true, viewer: false },
        { name: "Manage Team", owner: true, admin: true, viewer: false },
        { name: "Edit Business Settings", owner: true, admin: true, viewer: false },
        { name: "Delete Account", owner: true, admin: false, viewer: false },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Team Members</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage users who have access to this merchant account
                    </p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            {/* TEAM OVERVIEW */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        TOTAL MEMBERS
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        OWNERS
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats.owners}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        ADMINS
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
                </div>
            </div>

            {/* MEMBERS TABLE */}
            <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">MEMBERS</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                                    Name/Email
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                                    Role
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                                    Joined
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr
                                    key={member.id}
                                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                                >
                                    <td className="py-3 px-4">
                                        {member.status === "pending" ? (
                                            <div>
                                                <div className="text-xs font-medium text-foreground">{member.email}</div>
                                                <div className="text-xs text-muted-foreground">(Invitation sent)</div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-xs font-medium text-foreground">{member.name}</div>
                                                <div className="text-xs text-muted-foreground">{member.email}</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        {member.status === "pending" ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">
                                                <Mail className="w-3 h-3" />
                                                Pending {getRoleLabel(member.role).split(" ")[1]}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-foreground">
                                                {getRoleLabel(member.role)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-xs text-foreground">{member.joinedDate}</td>
                                    <td className="py-3 px-4">
                                        {member.role === "owner" ? (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {member.status === "pending" ? (
                                                    <button className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline">
                                                        Resend
                                                    </button>
                                                ) : (
                                                    <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                        Edit
                                                    </button>
                                                )}
                                                <button className="p-1 hover:bg-muted rounded transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ROLE PERMISSIONS */}
            <div className="bg-background rounded-xl p-6 border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Role Permissions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                                    Permission
                                </th>
                                <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">
                                    Owner
                                </th>
                                <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">
                                    Admin
                                </th>
                                <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">
                                    Viewer
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((permission, index) => (
                                <tr key={index} className="border-b border-border last:border-0">
                                    <td className="py-2 px-3 text-xs text-foreground">{permission.name}</td>
                                    <td className="py-2 px-3 text-center">
                                        {permission.owner ? (
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                                        )}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        {permission.admin ? (
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                                        )}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        {permission.viewer ? (
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INVITE MEMBER MODAL */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl p-6 shadow-2xl border border-border max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Invite Team Member</h3>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    placeholder="alice@example.com"
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-foreground mb-2 block">Role *</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="inviteRole"
                                            value="admin"
                                            checked={inviteRole === "admin"}
                                            onChange={(e) => setInviteRole(e.target.value as "admin" | "viewer")}
                                        />
                                        <span className="text-xs text-foreground">Admin</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="inviteRole"
                                            value="viewer"
                                            checked={inviteRole === "viewer"}
                                            onChange={(e) => setInviteRole(e.target.value as "admin" | "viewer")}
                                        />
                                        <span className="text-xs text-foreground">Viewer</span>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-foreground mb-2">Permissions:</p>
                                <div className="space-y-1">
                                    {inviteRole === "admin" ? (
                                        <>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                ✅ View all data
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                ✅ Create payouts and refunds
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                ✅ Manage integrations
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-400">❌ Delete account</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                ✅ View all data
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-400">
                                                ❌ Create payouts and refunds
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-400">
                                                ❌ Manage integrations
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-400">❌ Delete account</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                                    Send Invitation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
