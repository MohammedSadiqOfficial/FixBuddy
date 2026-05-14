import React, { useContext, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, Home, LogOut, Menu, MessageSquare, Search, User, HelpCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { ModeToggle } from "../components/mode-toggle";
import { BrandWordmark } from "../components/BrandWordmark";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Find Pros", href: "/find", icon: Search },
    { name: "Requests", href: "/requests", icon: ClipboardList },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Support", href: "/support", icon: HelpCircle },
];

export function MainLayoutModern() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useContext(AuthContext);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto flex min-h-screen max-w-[1600px]">
                <aside className="hidden w-[280px] shrink-0 border-r border-border/60 bg-card/70 px-6 py-6 backdrop-blur-xl lg:flex lg:flex-col">
                    <BrandWordmark subtitle="User workspace" />
                    <div className="mt-10 space-y-2">
                        {navItems.map((item) => (
                            <NavItem key={item.href} item={item} active={location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)} />
                        ))}
                    </div>
                    <div className="mt-auto rounded-[28px] border border-border/70 bg-secondary/70 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Account</p>
                        <p className="mt-3 text-lg font-extrabold tracking-tight">{user?.name || "FixBuddy User"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{user?.phoneNumber || "Manage your profile and bookings"}</p>
                        <Button variant="outline" className="mt-5 h-11 w-full rounded-full font-semibold" onClick={() => navigate("/profile")}>
                            Profile settings
                        </Button>
                    </div>
                </aside>

                <main className="min-w-0 flex-1">
                    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
                        <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                                    <SheetTrigger asChild className="lg:hidden">
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] border-r border-border/60 bg-card p-0">
                                        <div className="flex h-full flex-col px-6 py-6">
                                            <BrandWordmark subtitle="User workspace" />
                                            <div className="mt-10 space-y-2">
                                                {navItems.map((item) => (
                                                    <div key={item.href} onClick={() => setMobileOpen(false)}>
                                                        <NavItem item={item} active={location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                                <div className="lg:hidden">
                                    <BrandWordmark compact />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <ModeToggle />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-12 rounded-full px-2 hover:bg-secondary">
                                            <Avatar className="h-9 w-9 border border-border">
                                                <AvatarImage src={user?.profileImage} />
                                                <AvatarFallback className="bg-secondary font-bold text-foreground">
                                                    {user?.name ? user.name[0].toUpperCase() : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 rounded-2xl border-border/80 p-2">
                                        <DropdownMenuLabel className="px-3 py-2">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold">{user?.name}</span>
                                                <span className="text-xs text-muted-foreground">{user?.phoneNumber}</span>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="rounded-xl px-3 py-2 font-medium" onClick={() => navigate("/profile")}>
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl px-3 py-2 font-medium text-destructive focus:text-destructive" onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    <div className="px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavItem({ item, active }) {
    return (
        <Link to={item.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground shadow-[0_14px_30px_rgba(15,23,42,0.14)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
            <item.icon className="h-4 w-4" />
            {item.name}
        </Link>
    );
}
