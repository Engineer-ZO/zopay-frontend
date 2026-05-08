"use client";

import { ReactNode } from "react";

export default function AdminDashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    // The main admin layout now handles the sidebar, navbar, and auth checks
    return <>{children}</>;
}
