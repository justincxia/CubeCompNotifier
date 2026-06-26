"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/use-toast";
import { loginSchema, updateUserSchema, type LoginInput, type UpdateUserInput } from "@/lib/validations";
import { NOTIFICATION_RADII, RADIUS_LABELS, type User, type Competition } from "@/types";
import { formatDateRange } from "@/lib/wca";

type AuthStep = "phone" | "otp" | "dashboard";

export function DashboardClient() {
  const router = useRouter();
  const [authStep, setAuthStep] = useState<AuthStep>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [nearbyComps, setNearbyComps] = useState<(Competition & { distance: number })[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone_number: "" },
  });

  const settingsForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    const stored = localStorage.getItem("user_phone");
    if (stored) fetchUser(stored);
  }, []);

  async function fetchUser(phoneNumber: string) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user?phone=${encodeURIComponent(phoneNumber)}`);
      if (!res.ok) return;
      const { user: u } = await res.json();
      setUser(u);
      setPhone(phoneNumber);
      setAuthStep("dashboard");
      settingsForm.reset({
        city: u.city,
        state: u.state ?? "",
        country: u.country,
        notification_radius: u.notification_radius,
        is_paused: u.is_paused,
      });
      fetchNearby(u.latitude, u.longitude, u.notification_radius);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchNearby(lat: number, lon: number, radius: number) {
    const res = await fetch(`/api/nearby?lat=${lat}&lon=${lon}&radius=${radius}&limit=10`);
    if (res.ok) {
      const { competitions } = await res.json();
      setNearbyComps(competitions ?? []);
    }
  }

  async function onLoginSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: json.error, variant: "destructive" });
        return;
      }
      setPhone(data.phone_number);
      setAuthStep("otp");
    } finally {
      setIsLoading(false);
    }
  }

  async function onOtpSubmit() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, code: otp }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Invalid code", description: json.error, variant: "destructive" });
        return;
      }
      localStorage.setItem("user_phone", phone);
      await fetchUser(phone);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSaveSettings(data: UpdateUserInput) {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: user.phone_number, ...data }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Update failed", description: json.error, variant: "destructive" });
        return;
      }
      setUser({ ...user, ...json.user });
      toast({ title: "Settings saved", variant: "success" });
    } finally {
      setIsSaving(false);
    }
  }

  async function onTogglePause() {
    if (!user) return;
    const newPaused = !user.is_paused;
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: user.phone_number, is_paused: newPaused }),
    });
    if (res.ok) {
      setUser({ ...user, is_paused: newPaused });
      toast({ title: newPaused ? "Notifications paused" : "Notifications resumed", variant: "success" });
    }
  }

  async function onDeleteAccount() {
    if (!user) return;
    const res = await fetch(`/api/user?phone=${encodeURIComponent(user.phone_number)}`, { method: "DELETE" });
    if (res.ok) {
      localStorage.removeItem("user_phone");
      toast({ title: "Account deleted", variant: "success" });
      router.push("/");
    }
  }

  function onLogout() {
    localStorage.removeItem("user_phone");
    setUser(null);
    setAuthStep("phone");
    setPhone("");
    setOtp("");
  }

  // ─── Phone login ────────────────────────────────────────────────────────────
  if (authStep === "phone") {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-black">Access your dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your phone number to receive a login code</p>
        </div>

        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-phone">Phone number</Label>
            <Input
              id="login-phone"
              type="tel"
              placeholder="+1 555 000 1234"
              {...loginForm.register("phone_number")}
            />
            {loginForm.formState.errors.phone_number && (
              <p className="text-xs text-red-500">{loginForm.formState.errors.phone_number.message}</p>
            )}
          </div>
          <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Login Code"}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-black underline hover:text-gray-600">Sign up here</a>
        </p>
      </div>
    );
  }

  // ─── OTP step ───────────────────────────────────────────────────────────────
  if (authStep === "otp") {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 border border-gray-200">
              <Phone className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-black">Enter your code</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sent to <span className="text-black font-mono">{phone}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Verification code</Label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
          />
        </div>

        <Button variant="primary" onClick={onOtpSubmit} disabled={isLoading || otp.length < 6} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Access Dashboard"}
        </Button>

        <button
          type="button"
          className="text-xs text-gray-400 hover:text-gray-700 text-center transition-colors"
          onClick={() => setAuthStep("phone")}
        >
          Use a different number
        </button>
      </div>
    );
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black">Your settings</h2>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{user.phone_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${user.is_paused ? "text-gray-500 border-gray-300 bg-gray-50" : "text-green-700 border-green-200 bg-green-50"}`}>
            {user.is_paused ? "Paused" : "Active"}
          </span>
          <Button variant="ghost" size="icon" onClick={onLogout} title="Log out">
            <LogOut className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Settings form */}
      <form onSubmit={settingsForm.handleSubmit(onSaveSettings)} className="flex flex-col gap-5">
        {/* Location */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            Location
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="s-city">City</Label>
            <Input id="s-city" {...settingsForm.register("city")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-state">State / Province</Label>
              <Input id="s-state" {...settingsForm.register("state")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-country">Country</Label>
              <Input id="s-country" {...settingsForm.register("country")} />
            </div>
          </div>
        </div>

        {/* Radius */}
        <div className="flex flex-col gap-2">
          <Label>Notification radius</Label>
          <Select
            value={String(settingsForm.watch("notification_radius") ?? user.notification_radius)}
            onValueChange={(v) => settingsForm.setValue("notification_radius", parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_RADII.map((r) => (
                <SelectItem key={r} value={String(r)}>{RADIUS_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pause toggle */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-black">Pause notifications</p>
            <p className="text-xs text-gray-500">Temporarily stop receiving SMS alerts</p>
          </div>
          <Switch checked={user.is_paused} onCheckedChange={onTogglePause} />
        </div>

        <Button type="submit" variant="primary" disabled={isSaving} className="w-full">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Changes</>}
        </Button>
      </form>

      {/* Nearby competitions */}
      {nearbyComps.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-black flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              Upcoming competitions near you
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Within {RADIUS_LABELS[user.notification_radius]}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {nearbyComps.slice(0, 5).map((comp) => (
              <a
                key={comp.id}
                href={`https://www.worldcubeassociation.org/competitions/${comp.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{comp.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{comp.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">{formatDateRange(comp.start_date, comp.end_date)}</p>
                  <p className="text-xs text-gray-400">{Math.round(comp.distance)} mi away</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-xs font-medium text-red-600 mb-3">Danger zone</p>
        {!showDeleteConfirm ? (
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} className="w-full">
            <Trash2 className="h-4 w-4" /> Delete account
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-600">
              This will delete your account and stop all notifications. This action is permanent.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={onDeleteAccount} className="flex-1">Yes, delete</Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
