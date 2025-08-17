"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";

export function Navbar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home" },
        { href: "/scanner", label: "Scanner" },
        { href: "/secrets", label: "Secrets" },
        { href: "/auditor", label: "Auditor" },
        { href: "/history", label: "History" },
        { href: "/mission", label: "Mission" },
        { href: "/settings", label: "Settings" },
        { href: "/support", label: "Support" },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    return (
        <nav className="bg-gray-800/90 backdrop-blur supports-[backdrop-filter]:bg-gray-800/60 sticky top-0 z-50">
            <div className="container mx-auto max-w-screen-xl px-4 py-3 flex justify-between items-center">
                <Link href="/" className="text-white text-xl font-bold tracking-tight">
                    ScamScanner
                </Link>
                <div className="flex items-center gap-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                isActive(link.href)
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-300 hover:text-white hover:bg-gray-700/70"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="ml-2">
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
