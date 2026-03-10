import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import {
    Trash2, Users, Briefcase, Activity, RefreshCw, LogOut,
    ShieldCheck, ShieldOff, Eye, Phone, Mail, MapPin,
    DollarSign, Calendar, Clock, Search, LayoutDashboard,
    ChevronRight, TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModeToggle } from "./mode-toggle";

// ─── Status Badge ──────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
        ACCEPTED: 'bg-blue-100  text-blue-800  border-blue-200',
        ONGOING: 'bg-purple-100 text-purple-800 border-purple-200',
        COMPLETED: 'bg-green-100 text-green-800 border-green-200',
        CANCELLED: 'bg-red-100   text-red-800   border-red-200',
    };
    return (
        <span className={`inline-flex items-center text-[9px] font-black uppercase px-2.5 py-1 border rounded-none tracking-widest ${map[status] || 'bg-zinc-100 text-zinc-600'}`}>
            {status}
        </span>
    );
};

// ─── Stat Card ──────────────────────────────────────────────────────

const StatCard = ({ title, value, sub, icon: Icon, accent, trend }) => (
    <Card className="border border-zinc-200 shadow-none rounded-none overflow-hidden bg-white group hover:border-zinc-400 transition-colors">
        <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 flex items-center justify-center rounded-none ${accent}`}>
                    <Icon size={18} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-green-600">
                        <TrendingUp size={11} />{trend}
                    </div>
                )}
            </div>
            <div className="text-4xl font-black tabular-nums tracking-tight mb-1">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</div>
            {sub && <p className="text-[10px] text-zinc-400 font-medium mt-1">{sub}</p>}
        </CardContent>
    </Card>
);

// ─── Sidebar Nav ────────────────────────────────────────────────────

const NAV = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'captains', label: 'Captains', icon: Briefcase },
    { id: 'requests', label: 'Requests', icon: Activity },
];

const Sidebar = ({ active, onChange, counts, onLogout, onRefresh }) => (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 bg-zinc-950 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-zinc-800">
            <div className="h-8 w-8 bg-white text-zinc-950 flex items-center justify-center font-black text-lg leading-none select-none">F</div>
            <div>
                <div className="text-white font-black text-sm uppercase tracking-tight leading-none">Fixxr</div>
                <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Admin Panel</div>
            </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 space-y-0.5 px-3">
            {NAV.map(({ id, label, icon: Icon }) => {
                const isActive = active === id;
                return (
                    <button
                        key={id}
                        onClick={() => onChange(id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-left transition-all group relative ${isActive
                                ? 'bg-white text-zinc-950'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        <Icon size={15} className={isActive ? 'text-zinc-950' : ''} />
                        <span className="text-[11px] font-black uppercase tracking-widest flex-1">{label}</span>
                        {counts[id] !== undefined && (
                            <span className={`text-[10px] font-black tabular-nums ${isActive ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                {counts[id]}
                            </span>
                        )}
                        {isActive && <ChevronRight size={12} className="text-zinc-400" />}
                    </button>
                );
            })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-zinc-800 p-3 space-y-1">
            <button
                onClick={onRefresh}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all rounded-none"
            >
                <RefreshCw size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">Sync Data</span>
            </button>
            <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-all rounded-none"
            >
                <LogOut size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
            </button>
        </div>

        {/* Admin badge */}
        <div className="px-3 pb-4">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900 border border-zinc-800">
                <div className="h-8 w-8 bg-zinc-700 flex items-center justify-center font-black text-white text-sm rounded-none">AD</div>
                <div>
                    <div className="text-white text-[11px] font-black uppercase tracking-tight">Administrator</div>
                    <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Full Access</div>
                </div>
            </div>
        </div>
    </aside>
);

// ─── USER DETAIL DIALOG ─────────────────────────────────────────────

const UserDetail = ({ user, open, onClose, onDelete }) => {
    if (!user) return null;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-none border-2">
                <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tight text-lg">User Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-none">
                            <AvatarFallback className="rounded-none bg-zinc-100 text-zinc-900 font-black text-2xl">
                                {user.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-black text-xl tracking-tight">{user.name}</div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">User Account</div>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center gap-3"><Phone size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">{user.phoneNumber}</span></div>
                        {user.email && <div className="flex items-center gap-3"><Mail size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">{user.email}</span></div>}
                        {user.location && <div className="flex items-center gap-3"><MapPin size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">{user.location}</span></div>}
                        <div className="flex items-center gap-3"><Calendar size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                        <div className="flex items-center gap-3"><Activity size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">{user._count?.serviceRequests ?? 0} total service requests</span></div>
                    </div>
                </div>
                <DialogFooter className="flex gap-2 border-t pt-4">
                    <Button variant="outline" className="rounded-none border-2 font-bold flex-1" onClick={onClose}>Close</Button>
                    <Button variant="destructive" className="rounded-none font-bold flex-1" onClick={() => { onDelete(user.id); onClose(); }}>
                        <Trash2 size={14} className="mr-2" /> Delete User
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ─── CAPTAIN DETAIL DIALOG ─────────────────────────────────────────

const CaptainDetail = ({ captain, open, onClose, onVerify }) => {
    if (!captain) return null;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg rounded-none border-2">
                <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tight text-lg">Captain Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 rounded-none">
                            <AvatarImage src={captain.profileImage} className="object-cover" />
                            <AvatarFallback className="rounded-none bg-zinc-900 text-white font-black text-3xl">
                                {captain.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="font-black text-xl tracking-tight">{captain.name}</div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Service Professional</div>
                            <Badge className={`rounded-none font-black text-[9px] uppercase tracking-widest ${captain.isVerified ? 'bg-green-600' : 'bg-amber-500'}`}>
                                {captain.isVerified ? 'VERIFIED' : 'PENDING VERIFICATION'}
                            </Badge>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-3 col-span-2"><Phone size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">{captain.phoneNumber}</span></div>
                        {captain.email && <div className="flex items-center gap-3 col-span-2"><Mail size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">{captain.email}</span></div>}
                        {captain.hourlyRate && <div className="flex items-center gap-3"><DollarSign size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">${captain.hourlyRate}/hr</span></div>}
                        <div className="flex items-center gap-3"><Activity size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">{captain._count?.reviews ?? 0} reviews</span></div>
                        <div className="flex items-center gap-3 col-span-2"><Calendar size={14} className="text-muted-foreground shrink-0" /><span className="font-medium">Joined {new Date(captain.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                        <div className="flex items-center gap-3"><Briefcase size={14} className="text-muted-foreground shrink-0" /><span>{captain._count?.serviceRequests ?? 0} jobs handled</span></div>
                    </div>
                    {captain.description && (
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Bio</div>
                            <p className="text-sm leading-relaxed text-zinc-600">{captain.description}</p>
                        </div>
                    )}
                    {captain.skills?.length > 0 && (
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Skills</div>
                            <div className="flex flex-wrap gap-1.5">
                                {captain.skills.map((s, i) => (
                                    <span key={i} className="text-[10px] font-black uppercase px-2.5 py-1 border-2 border-zinc-200 bg-zinc-50">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {captain.workImages?.length > 0 && (
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Portfolio</div>
                            <div className="grid grid-cols-3 gap-2">
                                {captain.workImages.slice(0, 6).map((img, i) => (
                                    <img key={i} src={img} alt="" className="aspect-square object-cover" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="border-t pt-4 flex gap-2">
                    <Button variant="outline" className="rounded-none border-2 font-bold flex-1" onClick={onClose}>Close</Button>
                    <Button
                        className={`rounded-none font-bold flex-1 ${captain.isVerified ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        onClick={() => { onVerify(captain.id, captain.isVerified); onClose(); }}
                    >
                        {captain.isVerified
                            ? <><ShieldOff size={14} className="mr-2" />Revoke</>
                            : <><ShieldCheck size={14} className="mr-2" />Verify Captain</>
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ─── PAGE HEADER ───────────────────────────────────────────────────

const PageHeader = ({ title, subtitle, children }) => (
    <div className="flex items-start justify-between mb-6">
        <div>
            <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{title}</h2>
            {subtitle && <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
);

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────

const AdminDashboard = ({ onLogout }) => {
    const [users, setUsers] = useState([]);
    const [captains, setCaptains] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCaptain, setSelectedCaptain] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [captainSearch, setCaptainSearch] = useState('');
    const [requestFilter, setRequestFilter] = useState('ALL');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [uRes, cRes, rRes] = await Promise.all([
                api.getUsers(),
                api.getCaptains(),
                api.getServiceRequests()
            ]);
            setUsers(uRes.data.data || []);
            setCaptains(cRes.data.data || []);
            setRequests(rRes.data.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to load platform data. Check that the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user? This cannot be undone.')) return;
        try {
            await api.deleteUser(id);
            setUsers(u => u.filter(x => x.id !== id));
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleVerifyCaptain = async (id, currentStatus) => {
        try {
            const next = !currentStatus;
            await api.verifyCaptain(id, next);
            setCaptains(c => c.map(x => x.id === id ? { ...x, isVerified: next } : x));
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phoneNumber.includes(userSearch) ||
        (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredCaptains = captains.filter(c =>
        c.name.toLowerCase().includes(captainSearch.toLowerCase()) ||
        c.phoneNumber.includes(captainSearch) ||
        (c.email || '').toLowerCase().includes(captainSearch.toLowerCase())
    );

    const filteredRequests = requestFilter === 'ALL'
        ? requests
        : requests.filter(r => r.status === requestFilter);

    const verifiedCount = captains.filter(c => c.isVerified).length;
    const completedJobs = requests.filter(r => r.status === 'COMPLETED').length;
    const pendingJobs = requests.filter(r => r.status === 'PENDING').length;

    const navCounts = {
        users: users.length,
        captains: captains.length,
        requests: requests.length,
    };

    // ── Loading ──
    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-zinc-950">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-[0.25em] font-black text-zinc-500">Loading Platform Data</p>
            </div>
        </div>
    );

    // ── Error ──
    if (error) return (
        <div className="flex h-screen items-center justify-center bg-zinc-50 p-6">
            <Card className="max-w-md border-2 border-red-200 rounded-none w-full shadow-none">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500" />
                        <CardTitle className="text-red-600 font-black uppercase text-sm tracking-wide">Connection Error</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-zinc-600 font-medium text-sm">{error}</p>
                    <Button onClick={fetchData} className="w-full rounded-none font-bold bg-zinc-950 hover:bg-zinc-800">
                        Retry Connection
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden">

            {/* ── Sidebar ── */}
            <Sidebar
                active={activeTab}
                onChange={setActiveTab}
                counts={navCounts}
                onLogout={onLogout}
                onRefresh={fetchData}
            />

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col min-w-0 ml-60">

                {/* Top bar */}
                <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        <span>Admin</span>
                        <ChevronRight size={12} />
                        <span className="text-zinc-900">{NAV.find(n => n.id === activeTab)?.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ModeToggle />
                        <div className="h-8 w-px bg-zinc-200" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {/* Scrollable content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-8 py-8">

                        {/* ── OVERVIEW ── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <PageHeader title="Overview" subtitle="Platform health at a glance" />

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard title="Total Users" value={users.length} sub={`Registered accounts`} icon={Users} accent="bg-blue-50 text-blue-600" />
                                    <StatCard title="Captains" value={captains.length} sub={`${verifiedCount} verified`} icon={Briefcase} accent="bg-zinc-950 text-white" />
                                    <StatCard title="Completed Jobs" value={completedJobs} sub="Successfully delivered" icon={CheckCircle2} accent="bg-green-50 text-green-600" />
                                    <StatCard title="Pending Jobs" value={pendingJobs} sub="Awaiting assignment" icon={Clock} accent="bg-amber-50 text-amber-600" />
                                </div>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Recent Users */}
                                    <Card className="border border-zinc-200 shadow-none rounded-none bg-white">
                                        <CardHeader className="pb-0 pt-5 px-5 flex flex-row items-center justify-between">
                                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recent Users</CardTitle>
                                            <button onClick={() => setActiveTab('users')} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                                                View All →
                                            </button>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5 pt-3">
                                            <div className="divide-y divide-zinc-100">
                                                {users.slice(0, 5).map(u => (
                                                    <div
                                                        key={u.id}
                                                        className="flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 -mx-2 px-2 transition-colors"
                                                        onClick={() => setSelectedUser(u)}
                                                    >
                                                        <Avatar className="h-8 w-8 rounded-none shrink-0">
                                                            <AvatarFallback className="rounded-none bg-zinc-100 text-zinc-700 font-black text-xs">
                                                                {u.name?.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm truncate">{u.name}</div>
                                                            <div className="text-xs text-zinc-400 truncate">{u.phoneNumber}</div>
                                                        </div>
                                                        <div className="text-[10px] font-black text-zinc-300 shrink-0">{u._count?.serviceRequests || 0} req</div>
                                                    </div>
                                                ))}
                                                {users.length === 0 && <p className="text-sm text-zinc-400 py-6 text-center font-bold">No users yet</p>}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Recent Captains */}
                                    <Card className="border border-zinc-200 shadow-none rounded-none bg-white">
                                        <CardHeader className="pb-0 pt-5 px-5 flex flex-row items-center justify-between">
                                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recent Captains</CardTitle>
                                            <button onClick={() => setActiveTab('captains')} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                                                View All →
                                            </button>
                                        </CardHeader>
                                        <CardContent className="px-5 pb-5 pt-3">
                                            <div className="divide-y divide-zinc-100">
                                                {captains.slice(0, 5).map(c => (
                                                    <div
                                                        key={c.id}
                                                        className="flex items-center gap-3 py-3 cursor-pointer hover:bg-zinc-50 -mx-2 px-2 transition-colors"
                                                        onClick={() => setSelectedCaptain(c)}
                                                    >
                                                        <Avatar className="h-8 w-8 rounded-none shrink-0">
                                                            <AvatarFallback className="rounded-none bg-zinc-900 text-white font-black text-xs">
                                                                {c.name?.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm truncate">{c.name}</div>
                                                            <div className="text-xs text-zinc-400 truncate">{(c.skills || []).slice(0, 2).join(', ')}</div>
                                                        </div>
                                                        <Badge className={`rounded-none font-black text-[8px] uppercase tracking-wide shrink-0 ${c.isVerified ? 'bg-green-600' : 'bg-amber-500'}`}>
                                                            {c.isVerified ? 'VER' : 'PND'}
                                                        </Badge>
                                                    </div>
                                                ))}
                                                {captains.length === 0 && <p className="text-sm text-zinc-400 py-6 text-center font-bold">No captains yet</p>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Status breakdown */}
                                <Card className="border border-zinc-200 shadow-none rounded-none bg-white">
                                    <CardHeader className="pb-0 pt-5 px-5 flex flex-row items-center justify-between">
                                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Request Status Breakdown</CardTitle>
                                        <button onClick={() => setActiveTab('requests')} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
                                            View All →
                                        </button>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-5 pt-4">
                                        <div className="grid grid-cols-5 gap-4">
                                            {['PENDING', 'ACCEPTED', 'ONGOING', 'COMPLETED', 'CANCELLED'].map(s => {
                                                const count = requests.filter(r => r.status === s).length;
                                                const pct = requests.length ? Math.round(count / requests.length * 100) : 0;
                                                return (
                                                    <div key={s} className="text-center space-y-2.5">
                                                        <div className="text-3xl font-black tabular-nums">{count}</div>
                                                        <StatusBadge status={s} />
                                                        <div className="text-[10px] text-zinc-400 font-black">{pct}%</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* ── USERS ── */}
                        {activeTab === 'users' && (
                            <div className="space-y-5">
                                <PageHeader title="Users" subtitle={`${users.length} registered accounts`}>
                                    <div className="relative">
                                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            placeholder="Search users..."
                                            value={userSearch}
                                            onChange={e => setUserSearch(e.target.value)}
                                            className="pl-9 rounded-none border-2 h-9 font-medium w-64 text-sm"
                                        />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                                        {filteredUsers.length} shown
                                    </div>
                                </PageHeader>

                                <div className="bg-white border border-zinc-200 rounded-none overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-zinc-50 border-b border-zinc-200 hover:bg-zinc-50">
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest py-4 pl-6 w-[260px]">User</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Contact</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Location</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Requests</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Joined</TableHead>
                                                <TableHead className="text-right font-black text-zinc-900 uppercase text-[10px] tracking-widest pr-6">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-16 text-zinc-400 text-xs uppercase font-bold">
                                                        No users found
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredUsers.map(user => (
                                                <TableRow key={user.id} className="hover:bg-zinc-50 transition-colors border-b border-zinc-100">
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9 rounded-none shrink-0">
                                                                <AvatarFallback className="rounded-none bg-zinc-100 text-zinc-700 font-black text-sm">
                                                                    {user.name?.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <div className="font-black uppercase tracking-tight text-sm truncate">{user.name}</div>
                                                                <div className="text-[10px] text-zinc-400 font-bold">ID: {user.id.slice(0, 8)}…</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-sm">{user.phoneNumber}</div>
                                                        {user.email && <div className="text-[10px] text-zinc-400 font-medium">{user.email}</div>}
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium text-zinc-600">
                                                        {user.location || <span className="text-zinc-300">—</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-black text-sm">{user._count?.serviceRequests || 0}</span>
                                                        <span className="text-[10px] text-zinc-400 font-bold ml-1">REQ</span>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-zinc-400">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-zinc-100" onClick={() => setSelectedUser(user)}>
                                                                <Eye size={14} />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-zinc-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteUser(user.id)}>
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* ── CAPTAINS ── */}
                        {activeTab === 'captains' && (
                            <div className="space-y-5">
                                <PageHeader title="Captains" subtitle={`${captains.length} service professionals`}>
                                    <div className="relative">
                                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            placeholder="Search captains..."
                                            value={captainSearch}
                                            onChange={e => setCaptainSearch(e.target.value)}
                                            className="pl-9 rounded-none border-2 h-9 font-medium w-64 text-sm"
                                        />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                                        {filteredCaptains.length} shown
                                    </div>
                                </PageHeader>

                                <div className="bg-white border border-zinc-200 rounded-none overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-zinc-50 border-b border-zinc-200 hover:bg-zinc-50">
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest py-4 pl-6 w-[240px]">Captain</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Skills</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Rate</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Stats</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                                                <TableHead className="text-right font-black text-zinc-900 uppercase text-[10px] tracking-widest pr-6">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCaptains.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-16 text-zinc-400 text-xs uppercase font-bold">
                                                        No captains found
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredCaptains.map(captain => (
                                                <TableRow key={captain.id} className="hover:bg-zinc-50 transition-colors border-b border-zinc-100">
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 rounded-none shrink-0">
                                                                <AvatarImage src={captain.profileImage} className="object-cover" />
                                                                <AvatarFallback className="rounded-none bg-zinc-900 text-white font-black text-sm">
                                                                    {captain.name?.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <div className="font-black uppercase tracking-tight text-sm truncate">{captain.name}</div>
                                                                <div className="text-[10px] text-zinc-400 font-bold">{captain.phoneNumber}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                            {(captain.skills || []).slice(0, 3).map((s, i) => (
                                                                <span key={i} className="text-[9px] font-black uppercase px-1.5 py-0.5 border border-zinc-200 bg-zinc-50">{s}</span>
                                                            ))}
                                                            {(captain.skills || []).length > 3 && (
                                                                <span className="text-[9px] font-black text-zinc-400">+{captain.skills.length - 3}</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-black text-sm">
                                                        {captain.hourlyRate
                                                            ? `$${captain.hourlyRate}/hr`
                                                            : <span className="text-zinc-300 font-normal text-xs">—</span>
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-0.5 text-[11px] font-bold text-zinc-500">
                                                            <div><span className="text-zinc-900 font-black">{captain._count?.serviceRequests || 0}</span> jobs</div>
                                                            <div><span className="text-zinc-900 font-black">{captain._count?.reviews || 0}</span> reviews</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={`rounded-none font-black text-[9px] uppercase tracking-widest ${captain.isVerified ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                                                            {captain.isVerified ? '✓ VERIFIED' : 'PENDING'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-zinc-100" onClick={() => setSelectedCaptain(captain)}>
                                                                <Eye size={14} />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className={`font-black uppercase text-[9px] tracking-widest h-8 px-3 rounded-none border-2 ${captain.isVerified
                                                                        ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                                                                        : 'border-green-400 text-green-700 hover:bg-green-50'
                                                                    }`}
                                                                onClick={() => handleVerifyCaptain(captain.id, captain.isVerified)}
                                                            >
                                                                {captain.isVerified
                                                                    ? <><ShieldOff size={11} className="mr-1" />Revoke</>
                                                                    : <><ShieldCheck size={11} className="mr-1" />Verify</>
                                                                }
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* ── SERVICE REQUESTS ── */}
                        {activeTab === 'requests' && (
                            <div className="space-y-5">
                                <PageHeader title="Service Requests" subtitle={`${requests.length} total requests`}>
                                    <Select value={requestFilter} onValueChange={setRequestFilter}>
                                        <SelectTrigger className="w-40 rounded-none border-2 h-9 font-bold text-[11px] uppercase tracking-widest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-2">
                                            {['ALL', 'PENDING', 'ACCEPTED', 'ONGOING', 'COMPLETED', 'CANCELLED'].map(s => (
                                                <SelectItem key={s} value={s} className="font-bold uppercase text-[10px] tracking-widest rounded-none">{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                                        {filteredRequests.length} shown
                                    </div>
                                </PageHeader>

                                <div className="bg-white border border-zinc-200 rounded-none overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-zinc-50 border-b border-zinc-200 hover:bg-zinc-50">
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest py-4 pl-6">Request</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Client</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Captain</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest">Location</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                                                <TableHead className="font-black text-zinc-900 uppercase text-[10px] tracking-widest text-right pr-6">Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredRequests.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-16 text-zinc-400 text-xs uppercase font-bold">
                                                        No requests found
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredRequests.map(req => (
                                                <TableRow key={req.id} className="hover:bg-zinc-50 transition-colors border-b border-zinc-100">
                                                    <TableCell className="pl-6 py-4 max-w-[260px]">
                                                        <div className="font-bold text-sm truncate">{req.description}</div>
                                                        <div className="text-[10px] text-zinc-400 font-bold mt-0.5">ID: {req.id.slice(0, 8)}…</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold text-sm">{req.user?.name || '—'}</div>
                                                        <div className="text-[10px] text-zinc-400 font-medium">{req.user?.phoneNumber || ''}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {req.captain ? (
                                                            <>
                                                                <div className="font-bold text-sm">{req.captain.name}</div>
                                                                <div className="text-[10px] text-zinc-400 font-medium">{req.captain.phoneNumber}</div>
                                                            </>
                                                        ) : <span className="text-zinc-300 italic text-xs">Unassigned</span>}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-zinc-600 font-medium">
                                                        {req.location || <span className="text-zinc-300">—</span>}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <StatusBadge status={req.status} />
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="text-xs font-bold text-zinc-500">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-[10px] text-zinc-400">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {/* ── Dialogs ── */}
            <UserDetail
                user={selectedUser}
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                onDelete={handleDeleteUser}
            />
            <CaptainDetail
                captain={selectedCaptain}
                open={!!selectedCaptain}
                onClose={() => setSelectedCaptain(null)}
                onVerify={handleVerifyCaptain}
            />
        </div>
    );
};

export default AdminDashboard;