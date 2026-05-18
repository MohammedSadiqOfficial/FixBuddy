import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { ClipboardList, Clock, Plus, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import api from "../services/api";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";


const statusConfig = {
    PENDING: { label: "Pending", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    ACCEPTED: { label: "Accepted", color: "text-blue-600 bg-blue-50 border-blue-200" },
    ONGOING: { label: "In Progress", color: "text-orange-600 bg-orange-50 border-orange-200" },
    COMPLETED: { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
    CANCELLED: { label: "Cancelled", color: "text-destructive bg-destructive/5 border-destructive/20" },
    pending: { label: "Pending", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    accepted: { label: "Accepted", color: "text-blue-600 bg-blue-50 border-blue-200" },
    in_progress: { label: "In Progress", color: "text-orange-600 bg-orange-50 border-orange-200" },
    completed: { label: "Completed", color: "text-green-600 bg-green-50 border-green-200" },
    cancelled: { label: "Cancelled", color: "text-destructive bg-destructive/5 border-destructive/20" },
};

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // Fetch from real endpoint
                const res = await api.get("/user/service-requests");
                setRequests(res.data.data || []);
            } catch {
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this specific request?")) return;
        try {
            await api.delete(`/user/service-request/${id}`);
            setRequests(requests.filter(req => req.id !== id));
            toast.success("Request deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete request");
        }
    };

    const handleEditClick = (req) => {
        setEditingRequest({ ...req });
        setIsEditOpen(true);
    };

    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setEditingRequest(prev => ({ ...prev, [name]: value }));
    };

    const submitUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await api.put(`/user/service-request/${editingRequest.id}`, {
                title: editingRequest.title,
                serviceType: editingRequest.serviceType,
                description: editingRequest.description,
                location: editingRequest.location
            });
            setRequests(requests.map(req => req.id === editingRequest.id ? res.data.data : req));
            setIsEditOpen(false);
            toast.success("Request updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update request");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">My Requests</h1>
                    <p className="text-muted-foreground mt-1">Track and manage your service requests.</p>
                </div>
                <Button asChild className="rounded-full">
                    <Link to="/requests/new"><Plus /> New Request</Link>
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20">
                    <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold">No requests yet</h3>
                    <p className="text-muted-foreground mt-1">Post your first service request to get started.</p>
                    <Button asChild className="mt-6 rounded-full">
                        <Link to="/requests/new">Post a Request</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => {
                        const s = statusConfig[req.status] || statusConfig.pending;
                        return (
                            <Card key={req.id} className="shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <Avatar className="h-11 w-11 rounded-xl border-2 border-primary/10 shadow-sm shrink-0">
                                        <AvatarImage src={req.captain?.profileImage} alt={req.captain?.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-xl">
                                            {req.captain?.name ? req.captain.name[0].toUpperCase() : (req.serviceType?.[0]?.toUpperCase() || "R")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                                            <h3 className="font-bold truncate text-base">{req.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}>
                                                {s.label}
                                            </span>
                                            {req.status === 'COMPLETED' && (
                                                <span className="text-sm font-bold text-primary ml-auto sm:ml-0">
                                                    Cost: ${req.amount?.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5">{req.serviceType}</p>
                                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{req.description}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                            <Clock className="h-3 w-3" />
                                            {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {(req.status === 'PENDING' || req.status === 'pending') && (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(req)} className="rounded-full text-muted-foreground hover:text-primary">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(req.id)} className="rounded-full text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        <Button variant="outline" size="sm" asChild className="rounded-full shrink-0 ml-2">
                                            <Link to={`/requests/${req.id}`}>View Details</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Request</SheetTitle>
                        <SheetDescription>Update the details of your service request.</SheetDescription>
                    </SheetHeader>
                    {editingRequest && (
                        <form onSubmit={submitUpdate} className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" value={editingRequest.title || ''} onChange={handleUpdateChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serviceType">Service Type</Label>
                                <Input id="serviceType" name="serviceType" value={editingRequest.serviceType || ''} onChange={handleUpdateChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" name="location" value={editingRequest.location || ''} onChange={handleUpdateChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" value={editingRequest.description || ''} onChange={handleUpdateChange} required rows={4} />
                            </div>
                            <Button type="submit" className="w-full" disabled={updating}>
                                {updating ? "Updating..." : "Save Changes"}
                            </Button>
                        </form>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
