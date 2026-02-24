"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CakeSlice,
    ClipboardList,
    PackageSearch,
    Truck,
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "เมนู (Menus)", href: "/menus", icon: CakeSlice },
        { name: "ออเดอร์ (Orders)", href: "/orders", icon: ClipboardList },
        { name: "สต็อก (Stock)", href: "/stock", icon: PackageSearch },
        { name: "สรุปส่งประจำวัน", href: "/dispatch", icon: Truck },
    ];

    return (
        <div className="w-64 bg-card text-card-foreground border-r h-full flex flex-col shadow-sm">
            <div className="flex flex-col items-center justify-center gap-3 py-8 border-b font-bold text-lg text-primary tracking-tight">
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
    );
}
