import React, { useContext, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BrandWordmark } from "../components/BrandWordmark";
import { Home, ListOrdered, Star, User, LogOut, Menu, Activity, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ModeToggle } from "../components/mode-toggle";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Requests", href: "/requests", icon: ListOrdered },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Support", href: "/support", icon: HelpCircle },
];

export const MainLayout = () => {
  const location = useLocation();
  const { logout, captain } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`h-11 w-full justify-start rounded-2xl px-4 ${isActive ? "bg-accent text-accent-foreground font-bold shadow-sm" : "font-medium"}`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </div>
      <div className="absolute bottom-6 left-0 mt-auto w-full px-4">
        <Button
          variant="ghost"
          className="h-11 w-full justify-start rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground dot-pattern">
      <aside className="hidden w-72 flex-col border-r border-border/70 surface-glass md:flex">
        <div className="border-b border-border/70 px-6 py-6">
          <BrandWordmark to="/dashboard" subtitle="Captain Console" />
        </div>
        <nav className="relative flex-1 p-4">
          <div className="mb-6 rounded-3xl bg-secondary/85 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-border/80">
                <AvatarImage src={captain?.profileImage} alt={captain?.name} className="object-cover" />
                <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                  {captain?.name ? captain.name[0].toUpperCase() : "C"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{captain?.name || "Captain"}</p>
                <p className="truncate text-xs text-muted-foreground">{captain?.phoneNumber || "Manage your service business"}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-background/85 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Activity className={`h-4 w-4 ${captain?.isActive ? "text-[#22c55e]" : "text-muted-foreground"}`} />
              {captain?.isActive ? "You are live for new jobs" : "You are currently offline"}
            </div>
          </div>
          <div className="mb-4 px-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Workspace</p>
          </div>
          <NavLinks />
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border/70 surface-glass px-4 md:px-8">
          <div className="flex items-center md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="border-b border-border/70 px-6 py-6">
                  <BrandWordmark to="/dashboard" subtitle="Captain Console" />
                </div>
                <nav className="relative h-[calc(100vh-5.5rem)] p-4">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
            <BrandWordmark to="/dashboard" compact className="ml-3" />
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 overflow-hidden outline-none">
                  <Avatar className="h-11 w-11 border border-border/80 transition-all hover:scale-105">
                    <AvatarImage src={captain?.profileImage} alt={captain?.name} className="object-cover" />
                    <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                      {captain?.name ? captain.name[0].toUpperCase() : "C"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{captain?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {captain?.email || captain?.phoneNumber}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex cursor-pointer items-center text-destructive focus:text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
