import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { Camera, X, ImageIcon, UploadCloud, Briefcase, DollarSign, Zap, User } from "lucide-react";
import api from "../services/api";

export default function Profile() {
  const { captain, setCaptain } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hourlyRate: "",
    availability: true,
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [workImages, setWorkImages] = useState([]);
  const [workImageFiles, setWorkImageFiles] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/captain/profile");
        const capData = res.data.data;
        if (capData) {
          setCaptain(capData);
          setFormData({
            name: capData.name || "John Doe",
            description: capData.description || "Experienced professional.",
            hourlyRate: capData.hourlyRate || "45",
            availability: capData.isActive !== false,
          });
          if (capData.skills?.length > 0) setSkills(capData.skills);
          if (capData.workImages?.length > 0) setWorkImages(capData.workImages);
        }
      } catch {
        toast.error("Failed to load profile details.");
      }
    };
    fetchProfile();
  }, [setCaptain]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      if (newSkill.trim() && !skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
        setNewSkill("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => setSkills(skills.filter((s) => s !== skillToRemove));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const handleWorkImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setWorkImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
      setWorkImageFiles((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  };

  const handleRemoveWorkImage = (i) => {
    setWorkImages((prev) => prev.filter((_, idx) => idx !== i));
    setWorkImageFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fData = new FormData();
      fData.append("name", formData.name);
      fData.append("description", formData.description);
      fData.append("hourlyRate", formData.hourlyRate);
      fData.append("availability", formData.availability);
      skills.forEach((s) => { if (s.trim()) fData.append("skills[]", s) });
      if (avatarFile) fData.append("avatarUrl", avatarFile);
      workImageFiles.forEach((f) => fData.append("workImages", f));

      const res = await api.put("/captain/profile", fData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCaptain({ ...captain, ...res.data.data });
      setAvatarFile(null);
      setWorkImageFiles([]);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border/60 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Captain Profile</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage your professional identity & portfolio</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="hidden sm:inline-flex h-10 px-6 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[300px_1fr]">

          {/* ── LEFT COLUMN ── */}
          <aside className="space-y-5 lg:sticky lg:top-[73px] h-max">

            {/* Avatar Card */}
            <Card className="rounded-2xl border-border/60 shadow-md overflow-hidden">
              <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
              <CardContent className="pt-0 pb-6 flex flex-col items-center text-center -mt-10 space-y-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-border/30">
                    <AvatarImage src={previewImage || captain?.avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-2xl font-black bg-secondary text-secondary-foreground">
                      {formData.name.substring(0, 2).toUpperCase() || "CP"}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 border-2 border-background transition-transform hover:scale-110"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-lg tracking-tight leading-tight">{formData.name || "Your Name"}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed px-4">
                    {skills.slice(0, 3).join(" · ") || "No skills yet"}
                  </p>
                </div>

                {/* Status pill */}
                <div
                  className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 border font-semibold text-xs transition-colors ${formData.availability
                    ? "bg-green-500/10 text-green-600 border-green-500/25"
                    : "bg-destructive/10 text-destructive border-destructive/25"
                    }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${formData.availability
                      ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                      : "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                      }`}
                  />
                  {formData.availability ? "Receiving Jobs" : "Offline"}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="rounded-2xl border-border/60 shadow-md">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Stats</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/30">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Hourly Rate
                    </span>
                    <span className="font-black text-sm">${formData.hourlyRate || "—"}/hr</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/30">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Zap className="h-4 w-4 text-primary" />
                      Skills
                    </span>
                    <span className="font-black text-sm">{skills.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/30">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Portfolio
                    </span>
                    <span className="font-black text-sm">{workImages.length} photos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* ── RIGHT COLUMN ── */}
          <main className="space-y-6">

            {/* Personal Info */}
            <Card className="rounded-2xl border-border/60 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
                    <CardDescription className="text-sm">Your public-facing profile details</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="h-11 rounded-xl bg-secondary/30 border-border/60 text-sm font-medium focus-visible:ring-1"
                    />
                  </div>

                  {/* Hourly Rate */}
                  <div className="space-y-1.5">
                    <Label htmlFor="hourlyRate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hourly Rate</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-muted-foreground font-bold text-sm">$</span>
                      <Input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        className="pl-8 h-11 rounded-xl bg-secondary/30 border-border/60 text-sm font-medium focus-visible:ring-1"
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability</Label>
                    <label className="flex items-center gap-3 h-11 px-4 rounded-xl bg-secondary/30 border border-border/60 cursor-pointer hover:bg-secondary/50 transition-colors select-none">
                      <input
                        type="checkbox"
                        name="availability"
                        checked={formData.availability}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-semibold">Available for work</span>
                    </label>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bio / Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell customers about your experience, certifications, and reliability."
                    className="min-h-[120px] rounded-xl bg-secondary/30 border-border/60 text-sm resize-y leading-relaxed focus-visible:ring-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="rounded-2xl border-border/60 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Skills & Expertise</CardTitle>
                    <CardDescription className="text-sm">Press Enter or click Add to include a skill</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Add skill input */}
                <div className="flex gap-2.5">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. Electrician, Carpentry…"
                    className="flex-1 h-11 rounded-xl bg-secondary/30 border-border/60 text-sm focus-visible:ring-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSkill}
                    className="h-11 px-5 rounded-xl font-bold border-2 text-sm"
                  >
                    Add
                  </Button>
                </div>

                {/* Skill chips */}
                {skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-1">No skills added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      skill &&
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 bg-secondary/60 hover:bg-secondary"
                      >
                        {skill}
                        <X
                          className="h-3 w-3 ml-0.5 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card className="rounded-2xl border-border/60 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Portfolio</CardTitle>
                      <CardDescription className="text-sm">Showcase your previous work with uploads or live camera shots</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <label htmlFor="portfolio-upload" className="cursor-pointer w-full sm:w-auto">
                      <Button variant="outline" asChild className="w-full h-9 px-4 rounded-xl font-bold border-2 text-xs">
                        <span>
                          <UploadCloud className="h-3.5 w-3.5 mr-1.5" /> Upload
                        </span>
                      </Button>
                      <input
                        id="portfolio-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleWorkImageUpload}
                      />
                    </label>
                    <label htmlFor="portfolio-capture" className="cursor-pointer w-full sm:w-auto">
                      <Button variant="outline" asChild className="w-full h-9 px-4 rounded-xl font-bold border-2 text-xs">
                        <span>
                          <Camera className="h-3.5 w-3.5 mr-1.5" /> Capture
                        </span>
                      </Button>
                      <input
                        id="portfolio-capture"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={handleWorkImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {workImages.length === 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      htmlFor="portfolio-upload-empty"
                      className="h-44 border-2 border-dashed border-border/70 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors group"
                    >
                      <UploadCloud className="h-10 w-10 mb-2.5 opacity-25 group-hover:opacity-40 transition-opacity" />
                      <p className="font-semibold text-sm">Upload portfolio photos</p>
                      <p className="text-xs mt-1 opacity-70">Add finished jobs from your gallery</p>
                      <input
                        id="portfolio-upload-empty"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleWorkImageUpload}
                      />
                    </label>
                    <label
                      htmlFor="portfolio-capture-empty"
                      className="h-44 border-2 border-dashed border-border/70 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors group"
                    >
                      <Camera className="h-10 w-10 mb-2.5 opacity-25 group-hover:opacity-40 transition-opacity" />
                      <p className="font-semibold text-sm">Capture work now</p>
                      <p className="text-xs mt-1 opacity-70">Take a photo directly from your camera</p>
                      <input
                        id="portfolio-capture-empty"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={handleWorkImageUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {workImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-border/50 bg-secondary shadow-sm"
                      >
                        <img
                          src={img}
                          alt={`Work ${i}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveWorkImage(i)}
                            className="h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add more tile */}
                    <label
                      htmlFor="portfolio-upload-more"
                      className="aspect-square rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/20 text-muted-foreground transition-colors group"
                    >
                      <UploadCloud className="h-6 w-6 opacity-40 group-hover:opacity-70 transition-opacity mb-1" />
                      <span className="text-xs font-medium opacity-60">Upload more</span>
                      <input
                        id="portfolio-upload-more"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleWorkImageUpload}
                      />
                    </label>
                    <label
                      htmlFor="portfolio-capture-more"
                      className="aspect-square rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/20 text-muted-foreground transition-colors group"
                    >
                      <Camera className="h-6 w-6 opacity-40 group-hover:opacity-70 transition-opacity mb-1" />
                      <span className="text-xs font-medium opacity-60">Capture more</span>
                      <input
                        id="portfolio-capture-more"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={handleWorkImageUpload}
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Save Button */}
            <div className="lg:hidden">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full h-12 rounded-2xl text-sm font-black shadow-lg shadow-primary/20"
              >
                {loading ? "Saving Changes…" : "Save Profile"}
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
