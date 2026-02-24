"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    UtensilsCrossed,
    ClipboardList,
    PackageOpen,
    Truck,
    Wallet,
    Tag,
    Menu,
    X
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "เมนูขนม", href: "/menus", icon: UtensilsCrossed },
        { name: "ออเดอร์ (Orders)", href: "/orders", icon: ClipboardList },
        { name: "สต็อกสินค้า", href: "/stock", icon: PackageOpen },
        { name: "สรุปส่งประจำวัน", href: "/dispatch", icon: Truck },
        { name: "รายจ่าย", href: "/expenses", icon: Wallet },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md shadow-md"
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay background */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar Container - Responsive */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-40
                w-64 bg-card text-card-foreground border-r h-full flex flex-col shadow-sm
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="flex flex-col items-center justify-center gap-3 py-8 border-b font-bold text-lg text-primary tracking-tight relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Lucky Mooncake Logo" className="w-28 h-28 rounded-full object-cover shadow-md bg-white border-2 border-primary/20" />
                    <span>Lucky Mooncake</span>
                </div>
                <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md font-medium translate-x-1"
                                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:translate-x-1"
                                    }`}
                            >
                                <link.icon className="w-5 h-5 flex-shrink-0" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t text-xs text-muted-foreground text-center">
                    v1.0.0
                </div>
            </div>
        </>
    );
}
