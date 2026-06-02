"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Search,
    Bell,
    User,
    LogOut,
    ChevronDown,
    X,
    Settings,
    Shield,
    Sparkles,
    Clock,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Building2,
    TrendingUp,
    Menu,
} from "lucide-react";
import { clearAuthData } from "@/features/auth/utils/storage";

export function AdminNavbar() {
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearch(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const notifications = [
        {
            id: 1,
            type: "kyb",
            title: "New KYB Submission",
            message: "ABC Corp has submitted their KYB documents for review",
            time: "5 mins ago",
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-50",
            icon: Building2,
            read: false,
        },
        {
            id: 2,
            type: "production",
            title: "Production Request",
            message: "XYZ Ltd requested production environment access",
            time: "10 mins ago",
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-50",
            icon: TrendingUp,
            read: false,
        },
        {
            id: 3,
            type: "reconciliation",
            title: "Reconciliation Alert",
            message: "Settlement mismatch detected for transaction batch #3342",
            time: "15 mins ago",
            color: "from-red-500 to-rose-500",
            bgColor: "bg-red-50",
            icon: AlertCircle,
            read: true,
        },
        {
            id: 4,
            type: "transaction",
            title: "High Value Transaction",
            message: "Large transaction (₦5,000,000) requires manual review",
            time: "1 hour ago",
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50",
            icon: CreditCard,
            read: true,
        },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogoutClick = () => {
        setShowProfile(false);
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);
        
        const delay = Math.floor(Math.random() * 5000) + 5000;
        
        setTimeout(() => {
            clearAuthData();
            localStorage.removeItem("zitopay_admin_auth");
            router.push("/admin/login");
        }, delay);
    };

    const handleProfileClick = () => {
        setShowProfile(false);
        router.push("/admin/settings");
    };

    const handleNotificationClick = (id: number) => {
        // Handle notification click
        console.log("Notification clicked:", id);
        setShowNotifications(false);
    };

    return (
        <>
            <header className="h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
                {/* Left - Platform Branding */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => router.push("/admin/dashboard")}>
                        <div className="relative bg-gradient-to-br from-purple-700 to-red-700 rounded-lg p-1">
                            <Image
                                src="/zopaylogo.png"
                                alt="ZoPay"
                                width={140}
                                height={45}
                                className="object-contain brightness-0 invert"
                            />
                        </div>
                    </div>
                </div>

                {/* Center - Global Search */}
                <div className="flex-1 max-w-xl mx-8" ref={searchRef}>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search merchants, transactions, or settings..."
                            onFocus={() => setShowSearch(true)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all placeholder:text-gray-400"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 border border-gray-200 rounded hidden sm:block">
                            ⌘K
                        </kbd>

                        {/* Search Results Dropdown */}
                        {showSearch && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto animate-fadeIn">
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Searches</p>
                                        <button className="text-xs text-blue-600 hover:text-blue-700">Clear</button>
                                    </div>
                                    <div className="space-y-1 mb-4">
                                        {["ABC Corp", "Transaction #12345", "MTN Gateway"].map((item, i) => (
                                            <button key={i} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-xl text-sm transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <Search className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-gray-700">{item}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Merchants (3)</p>
                                    <div className="space-y-1">
                                        {["ABC Corp", "XYZ Ltd", "Tech Solutions Inc"].map((merchant, i) => (
                                            <button key={i} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors group">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{merchant}</p>
                                                        <p className="text-xs text-gray-400">ID: M-{1000 + i}</p>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-gray-300 rotate-[-90deg] group-hover:text-gray-500" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button className="w-full mt-4 px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all shadow-md">
                                        View All Results →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right - Notifications & Profile */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                        >
                            <Bell className="w-5 h-5 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-gray-500" />
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                                    {notifications.map((notif) => {
                                        const Icon = notif.icon;
                                        return (
                                            <button
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif.id)}
                                                className={`w-full p-4 hover:bg-gray-50 text-left transition-all duration-200 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-10 h-10 rounded-xl ${notif.bgColor} flex items-center justify-center flex-shrink-0`}>
                                                        <Icon className={`w-4 h-4 bg-gradient-to-r ${notif.color} bg-clip-text text-transparent`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                                            {!notif.read && (
                                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                                                        <div className="flex items-center gap-1 mt-1.5">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <p className="text-xs text-gray-400">{notif.time}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className="w-4 h-4 text-gray-300 rotate-[-90deg] flex-shrink-0" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="p-3 border-t border-gray-100 flex gap-2 bg-gray-50">
                                    <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-white rounded-xl transition-colors">
                                        Mark All as Read
                                    </button>
                                    <button className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-white rounded-xl transition-colors">
                                        View All →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-sm opacity-60"></div>
                                <div className="relative w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="hidden sm:block text-left">
                                <span className="text-sm font-semibold text-gray-900">Admin User</span>
                                <p className="text-[10px] text-gray-400 -mt-0.5">Super Admin</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                        </button>

                        {showProfile && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Admin User</p>
                                            <p className="text-xs text-gray-500">admin@zopay.com</p>
                                            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                                                <Sparkles className="w-3 h-3 text-purple-600" />
                                                <span className="text-[10px] font-semibold text-purple-700">Super Admin</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2">
                                    <button 
                                        onClick={handleProfileClick}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-sm text-gray-700 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                            <User className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                        </div>
                                        <span className="flex-1 text-left">My Profile</span>
                                        <ChevronDown className="w-4 h-4 text-gray-300 rotate-[-90deg]" />
                                    </button>
                                    <button 
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-sm text-gray-700 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                                            <Settings className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
                                        </div>
                                        <span className="flex-1 text-left">Preferences</span>
                                        <ChevronDown className="w-4 h-4 text-gray-300 rotate-[-90deg]" />
                                    </button>
                                </div>

                                <div className="p-2 border-t border-gray-100">
                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-sm text-red-600 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                            <LogOut className="w-4 h-4 text-red-500" />
                                        </div>
                                        <span className="flex-1 text-left">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal - Positioned at top-right corner */}
            {showLogoutModal && (
                <div 
                    className="fixed inset-0 z-50" 
                    onClick={() => !isLoggingOut && setShowLogoutModal(false)}
                >
                    {/* Backdrop overlay */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
                    
                    {/* Modal positioned at top-right */}
                    <div 
                        className="absolute top-20 right-6 w-full max-w-md transform transition-all duration-300 animate-slideInRight" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                                        <LogOut className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Confirm Logout</h2>
                                </div>
                                {!isLoggingOut && (
                                    <button
                                        onClick={() => setShowLogoutModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                )}
                            </div>
                            <div className="p-6">
                                {!isLoggingOut ? (
                                    <>
                                        <p className="text-sm text-gray-600 mb-6">
                                            Are you sure you want to logout? You will need to login again to access the admin dashboard.
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowLogoutModal(false)}
                                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleLogoutConfirm}
                                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-red-500/25"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 mt-4">Logging out...</p>
                                        <p className="text-xs text-gray-500 mt-1">Please wait while we securely log you out</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.25s ease-out;
                }
            `}</style>
        </>
    );
}