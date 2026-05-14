import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, Upload, CheckCircle, XCircle, Camera, Sparkles, LocateFixed } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const serviceTypes = ["Plumber", "Electrical", "Carpentry", "Painting", "Cleaning", "AC Repair", "Handyman", "Other"];

export default function NewRequest() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=details, 2=success
    const [loading, setLoading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        serviceType: "",
        location: "",
        urgency: "normal",
    });
    const [images, setImages] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const captainId = params.get("captainId");
        if (captainId) {
            setForm(prev => ({ ...prev, captainId }));
        }
    }, [location.search]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error("You can only upload up to 5 images.");
            e.target.value = "";
            return;
        }
        setImages((prev) => [...prev, ...files]);
        e.target.value = "";
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleGenerateDescription = async () => {
        if (images.length === 0) {
            toast.error("Upload image first to generate the description.");
            return;
        }

        setGeneratingAI(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(images[0]);
            reader.onloadend = async () => {
                try {
                    const res = await api.post("/ai/describe-image", { imageBase64: reader.result });
                    setForm(prev => ({ ...prev, description: res.data.data }));
                    toast.success("AI successfully generated a description from your photo.");
                } catch (err) {
                    toast.error(err.response?.data?.message || "Failed to generate AI description.");
                } finally {
                    setGeneratingAI(false);
                }
            };
            reader.onerror = () => {
                toast.error("Failed to process image.");
                setGeneratingAI(false);
            };
        } catch (err) {
            toast.error("Failed to read image data.");
            setGeneratingAI(false);
        }
    };

    const handleFetchLocation = () => {
        if (!("geolocation" in navigator)) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    
                    if (data && data.address) {
                        const locationParts = [];
                        if (data.address.house_number) locationParts.push(data.address.house_number);
                        if (data.address.road || data.address.street) locationParts.push(data.address.road || data.address.street);
                        
                        const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
                        if (city) locationParts.push(city);
                        
                        const finalLocation = locationParts.join(", ") || city || "Unknown Location";
                        setForm((prev) => ({ ...prev, location: finalLocation }));
                        toast.success("Location autofilled successfully.");
                    } else {
                        toast.error("Could not determine your city.");
                    }
                } catch (err) {
                    toast.error("Failed to fetch location details.");
                } finally {
                    setFetchingLocation(false);
                }
            },
            (err) => {
                toast.error("Location permission denied or unavailable.");
                setFetchingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.serviceType) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("serviceType", form.serviceType);
            formData.append("location", form.location);
            formData.append("urgency", form.urgency);
            if (form.captainId) {
                formData.append("captainId", form.captainId);
            }
            
            images.forEach((image) => {
                formData.append("images", image);
            });

            await api.post("/user/service-request", formData);
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">Request Submitted!</h2>
                <p className="text-muted-foreground mt-3 max-w-sm text-center">
                    We're matching you with the best professional for your job. You'll be notified shortly.
                </p>
                <div className="flex gap-3 mt-8">
                    <Button variant="outline" className="rounded-full" onClick={() => navigate("/requests")}>
                        View My Requests
                    </Button>
                    <Button className="rounded-full" onClick={() => navigate("/dashboard")}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Post a New Request</h1>
                    <p className="text-sm text-muted-foreground">Describe your issue and find the right pro.</p>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Job Details</CardTitle>
                    <CardDescription>The more detail you provide, the better the match.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title *</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder='e.g. "Fix leaking bathroom pipe"'
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceType">Service Type *</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {serviceTypes.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, serviceType: type }))}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${form.serviceType === type
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card hover:bg-secondary border-border"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description">Description *</Label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                    onClick={handleGenerateDescription}
                                    disabled={generatingAI}
                                >
                                    {generatingAI ? (
                                        <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 animate-pulse" /> Generating...</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Auto-describe from Image</span>
                                    )}
                                </Button>
                            </div>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe your issue in detail. What's broken? How long has it been an issue? Any attempts at DIY fixes?"
                                value={form.description}
                                onChange={handleChange}
                                required
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="e.g. 123 Main St, New York, NY"
                                    value={form.location}
                                    onChange={handleChange}
                                    className="h-11 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={handleFetchLocation}
                                    disabled={fetchingLocation}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors disabled:opacity-50"
                                    title="Fetch my location"
                                >
                                    <LocateFixed className={`h-4 w-4 ${fetchingLocation ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Urgency</Label>
                            <div className="flex gap-2">
                                {["normal", "urgent", "emergency"].map((u) => (
                                    <button
                                        key={u}
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, urgency: u }))}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border capitalize transition-all ${form.urgency === u
                                                ? u === "emergency"
                                                    ? "bg-destructive text-destructive-foreground border-destructive"
                                                    : u === "urgent"
                                                        ? "bg-orange-500 text-white border-orange-500"
                                                        : "bg-primary text-primary-foreground border-primary"
                                                : "bg-card hover:bg-secondary border-border"
                                            }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Job Images (Max 5)</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg border bg-muted overflow-hidden group">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`upload-${index}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-destructive/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <>
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all gap-1">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase">Upload</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 bg-secondary/20 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all gap-1">
                                            <Camera className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase">Capture</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">Upload existing photos or capture the job directly from your camera to help the pro understand the work better.</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-12 rounded-full"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 h-12 rounded-full font-semibold" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        Submitting...
                                    </span>
                                ) : "Submit Request"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
