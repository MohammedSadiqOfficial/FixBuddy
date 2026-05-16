import React, { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { ClipboardList, Search, Star, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { SocketContext } from "../context/SocketContext";
import { toast } from "sonner";
import { BrandWordmark } from "../components/BrandWordmark";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues with webpack/vite
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for user and captain
const UserIcon = L.divIcon({
    html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #3b82f6;"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

const CaptainIcon = L.divIcon({
    html: `<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #22c55e;"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [captains, setCaptains] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeRequest, setActiveRequest] = useState(null);
    const [captainLocation, setCaptainLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [stats, setStats] = useState({ active: 0, completed: 0 });

    // Helper component to fit map bounds to show both markers
    const MapBoundsFitter = ({ captainLoc, userLoc }) => {
        const map = useMap();
        useEffect(() => {
            if (captainLoc && userLoc) {
                const bounds = [
                    [captainLoc.latitude, captainLoc.longitude],
                    [userLoc.latitude, userLoc.longitude]
                ];
                map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1.5 });
            } else if (captainLoc) {
                map.flyTo([captainLoc.latitude, captainLoc.longitude], 14, { animate: true, duration: 1.5 });
            } else if (userLoc) {
                map.flyTo([userLoc.latitude, userLoc.longitude], 14, { animate: true, duration: 1.5 });
            }
        }, [captainLoc, userLoc, map]);
        return null;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [captainsRes, requestsRes] = await Promise.all([
                    api.get("/user/captains"),
                    api.get("/user/service-requests")
                ]);
                setCaptains((captainsRes.data.data || []).slice(0, 3));

                const requests = requestsRes.data.data || [];
                // Calculate stats
                const activeCount = requests.filter(req => ["PENDING", "ACCEPTED", "ONGOING"].includes(req.status)).length;
                const completedCount = requests.filter(req => req.status === "COMPLETED").length;
                setStats({ active: activeCount, completed: completedCount });

                // Look for an ACCEPTED or ONGOING request for live tracking
                const active = requests.find(req => req.status === "ACCEPTED" || req.status === "ONGOING");
                setActiveRequest(active || null);
                if (active && active.captain?.latitude && active.captain?.longitude) {
                    setCaptainLocation({
                        latitude: active.captain.latitude,
                        longitude: active.captain.longitude
                    });
                }
            } catch (err) {
                setCaptains([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket || !activeRequest || !["ACCEPTED", "ONGOING"].includes(activeRequest.status) || !("geolocation" in navigator)) {
            return;
        }

        socket.emit("join_request_room", activeRequest.id);

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                setUserLocation(coords);

                socket.emit("update_user_location", {
                    userId: user?.id,
                    serviceRequestId: activeRequest.id,
                    latitude: coords.latitude,
                    longitude: coords.longitude
                });
            },
            () => console.warn("Could not get user location"),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [socket, activeRequest, user?.id]);

    useEffect(() => {
        if (!socket || !activeRequest?.captain?.id) return;

        const handleCaptainLocation = (data) => {
            if (data.captainId === activeRequest.captain.id) {
                setCaptainLocation({
                    latitude: data.latitude,
                    longitude: data.longitude
                });
            }
        };

        socket.on('captain_location_update', handleCaptainLocation);

        return () => socket.off('captain_location_update', handleCaptainLocation);
    }, [socket, activeRequest]);

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-32 rounded-2xl" />
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
                <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(white_1px,transparent_0)] [background-size:20px_20px]" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <BrandWordmark subtitle="User dashboard" light className="mb-4" />
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            Welcome back, {user?.name?.split(" ")[0] || "there"}!
                        </h1>
                        <p className="mt-1 text-primary-foreground/80">What do you need help with today?</p>
                    </div>
                    <Button asChild variant="secondary" className="rounded-full font-bold shadow-md text-primary hover:scale-105 transition-transform">
                        <Link to="/requests/new">
                            Post a Request <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
                        <ClipboardList className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.active}</div>
                        <Link to="/requests" className="text-xs text-primary hover:underline mt-1 inline-block">View all →</Link>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Jobs Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Booking Time</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">15 min</div>
                        <p className="text-xs text-muted-foreground mt-1">Platform average</p>
                    </CardContent>
                </Card>
            </div>

            {/* Nearby Professionals */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Top Professionals Near You</CardTitle>
                    <Button asChild variant="ghost" size="sm" className="text-primary">
                        <Link to="/find">See all <ArrowRight className="ml-1 h-3 w-3" /></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {captains.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No professionals found locally.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {captains.map((captain) => (
                                captain.isVerified && (
                                    <Link key={captain.id} to={`/professionals/${captain.id}`} className="flex items-center justify-between border rounded-xl p-4 hover:shadow-sm transition-all hover:-translate-y-0.5 bg-card/50">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-sm">
                                                <AvatarImage src={captain.profileImage} alt={captain.name} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                                    {captain.name?.[0]?.toUpperCase() || "C"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">{captain.name}</h4>
                                                    {captain.isVerified && (
                                                        <Badge variant="outline" className="text-green-600 border-green-300 text-[10px] h-4 px-1.5">✓ Verified</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{captain.skills?.join(" ")}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${captain.hourlyRate}/hr</p>
                                            <div className="flex items-center justify-end gap-1 text-yellow-500 text-xs mt-1">
                                                <Star className="h-3 w-3 fill-current" />
                                                <span className="font-bold">{captain.avgRating?.toFixed(1) || "5.0"}</span>
                                            </div>
                                        </div>
                                    </Link>
                                )))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Live Tracking Map */}
            {activeRequest && (
                <Card className="shadow-sm border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                Live Tracking
                            </CardTitle>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                {activeRequest.status === "ONGOING" ? "En Route" : "Accepted"}
                            </Badge>
                        </div>
                        <CardDescription>
                            Your professional, <span className="font-semibold text-foreground">{activeRequest.captain?.name}</span>, is on the way.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-64 bg-muted rounded-xl relative overflow-hidden border z-0">
                            <MapContainer
                                center={
                                    captainLocation
                                        ? [captainLocation.latitude, captainLocation.longitude]
                                        : userLocation
                                            ? [userLocation.latitude, userLocation.longitude]
                                            : [40.7128, -74.0060]
                                }
                                zoom={14}
                                scrollWheelZoom={false}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                <MapBoundsFitter captainLoc={captainLocation} userLoc={userLocation} />
                                {captainLocation && (
                                    <Marker
                                        position={[captainLocation.latitude, captainLocation.longitude]}
                                        icon={CaptainIcon}
                                    >
                                        <Popup>
                                            <div className="font-bold">{activeRequest.captain?.name}</div>
                                            <div className="text-xs text-green-600">Live Location 📍</div>
                                        </Popup>
                                    </Marker>
                                )}
                                {userLocation && (
                                    <Marker
                                        position={[userLocation.latitude, userLocation.longitude]}
                                        icon={UserIcon}
                                    >
                                        <Popup>
                                            <div className="font-bold">{user?.name || "You"}</div>
                                            <div className="text-xs text-blue-600">Your Location �</div>
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                            <div className="absolute bottom-2 left-2 bg-background/90 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border backdrop-blur-sm z-[400] pointer-events-none flex items-center gap-3">
                                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span> Captain</span>
                                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span> You</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <Link to="/requests/new">
                    <Card className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-dashed border-2 hover:border-primary/40">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">Post a New Request</h3>
                                <p className="text-sm text-muted-foreground">Describe your issue and get quotes fast</p>
                            </div>
                            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/find">
                    <Card className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-dashed border-2 hover:border-primary/40">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Search className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">Browse Professionals</h3>
                                <p className="text-sm text-muted-foreground">Find verified experts in your area</p>
                            </div>
                            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
