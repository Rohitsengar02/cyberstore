
"use client"
import React, { useState } from 'react';
import AdminSidebar from "@/components/admin/sidebar";
import AdminMobileTopBar from '@/components/admin/mobile-top-bar';
import AdminMobileBottomBar from '@/components/admin/mobile-bottom-bar';
import { cn } from '@/lib/utils';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="flex min-h-screen">
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r p-6 flex-shrink-0 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                 <AdminSidebar />
            </div>
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className="flex-1 flex flex-col">
                <AdminMobileTopBar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 bg-secondary/10 pb-24 md:pb-8">
                    {children}
                </main>
                <AdminMobileBottomBar />
            </div>
        </div>
    );
}
