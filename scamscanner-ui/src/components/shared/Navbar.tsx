import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

export function Navbar() {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-white text-xl font-bold">
                    ScamScanner
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/scanner" className="text-gray-300 hover:text-white px-3">
                        Scanner
                    </Link>
                    <Link href="/history" className="text-gray-300 hover:text-white px-3">
                        History
                    </Link>
                    <Link
                        href="/settings"
                        className="text-gray-300 hover:text-white px-3"
                    >
                        Settings
                    </Link>
                    <ModeToggle /> {/* Add the toggle here */}
                </div>
            </div>
        </nav>
    );
}