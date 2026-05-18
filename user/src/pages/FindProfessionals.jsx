import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { SearchInput } from "../components/ui/search-input";
import { Star, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";

const skillFilters = ["All", "Plumber", "Electrical", "Carpentry", "Painting", "Cleaning", "AC Repair"];

export default function FindProfessionals() {
    const [captains, setCaptains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {
        const fetchCaptains = async () => {
            try {
                const res = await api.get("/user/captains");
                setCaptains(res.data.data || []);
            } catch (err) {
                // If backend fails, show empty state
                setCaptains([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCaptains();
    }, []);

    const filtered = captains.filter((c) => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
        const matchFilter = activeFilter === "All" || c.skills?.includes(activeFilter);
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Find a Professional</h1>
                <p className="text-muted-foreground mt-1">Browse verified experts near you.</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                    placeholder="Search by name or skill..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Skill Filter Pills */}
            <div className="flex gap-2 flex-wrap">
                {skillFilters.map((skill) => (
                    <button
                        key={skill}
                        onClick={() => setActiveFilter(skill)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeFilter === skill
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card hover:bg-secondary border-border"
                            }`}
                    >
                        {skill}
                    </button>
                ))}
            </div>

            {/* Results */}
            {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No professionals found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {filtered.map((captain) => (
                        <Card key={captain.id} className="shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <Link to={`/professionals/${captain.id}`} className="relative block">
                                        <Avatar className="h-14 w-14 border-2 border-primary/10 shadow-sm transition-transform hover:scale-110">
                                            <AvatarImage src={captain.profileImage} alt={captain.name} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                                                {captain.name?.[0]?.toUpperCase() || "C"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background z-10 ${captain.isActive !== false ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-muted-foreground"}`} />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-base">{captain.name}</h3>
                                            {captain.isVerified && (
                                                <Badge variant="outline" className="text-green-600 border-green-300 text-xs">Verified</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-500 text-xs mt-0.5">
                                            <Star className="h-3 w-3 fill-current" />
                                            <span className="font-bold ml-1">{captain.avgRating?.toFixed(1) || "5.0"}</span>
                                            <span className="text-muted-foreground ml-1">({captain.reviewCount || 0} reviews)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {captain.skills?.map((skill) => (
                                                skill && <span key={skill} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">{skill}</span>
                                            ))}
                                        </div>
                                        {captain.description && (
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{captain.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <div>
                                        <span className="font-bold text-lg">${captain.hourlyRate}/hr</span>
                                        {captain.location && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                <MapPin className="h-3 w-3" /> {captain.location}
                                            </div>
                                        )}
                                    </div>
                                    <Button asChild size="sm" className="rounded-full font-bold">
                                        <Link to={`/professionals/${captain.id}`}>View Profile</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
