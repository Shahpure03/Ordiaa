/**
 * Header Component
 * Displays current date, day of week, and a rotating daily quote
 * Creates a calm, welcoming banner at the top of the dashboard
 */

import { useMemo } from "react";
import { DAILY_QUOTES } from "@/lib/types";

import { LogOut } from "lucide-react";

interface HeaderProps {
    onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
    const today = new Date();

    // Format the current date nicely
    const formattedDate = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Pick a quote based on the day of the year (rotates daily)
    const quote = useMemo(() => {
        const dayOfYear = Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
    }, []);

    return (
        <header className="w-full mb-6 md:mb-8">
            <div className="bg-gradient-to-r from-rose-100 via-purple-100 to-teal-100 rounded-2xl p-6 md:p-8 shadow-sm">
                {/* Logo and App Name */}
                <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-2xl md:text-3xl">🌸</span>
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-700 tracking-tight">
                            Ordiaa
                        </h3>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/50 hover:bg-white text-gray-600 rounded-xl transition-all cursor-pointer text-xs md:text-sm font-medium border border-gray-200/50"
                    >
                        <LogOut size={14} className="md:w-4 md:h-4" />
                        Logout
                    </button>
                </div>

                {/* Current Date */}
                <p className="text-base md:text-lg text-gray-600 font-medium mb-2 md:mb-3">
                    {formattedDate}
                </p>

                {/* Daily Quote */}
                <blockquote className="text-xs md:text-sm text-gray-500 italic border-l-2 border-purple-300 pl-3 md:pl-4">
                    "{quote}"
                </blockquote>
            </div>
        </header>
    );
}
