"use client";

import { useState } from "react";
import {
  Activity,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/use-toast";
import type { AdminStats } from "@/types";
import { formatDateRange } from "@/lib/wca";

export function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);

  async function fetchStats(adminSecret: string) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { "x-admin-secret": adminSecret },
      });
      if (res.status === 401) {
        toast({ title: "Unauthorized", description: "Invalid admin secret.", variant: "destructive" });
        return;
      }
      if (!res.ok) {
        toast({ title: "Error", description: "Failed to load stats.", variant: "destructive" });
        return;
      }
      const data = await res.json();
      setStats(data);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function triggerCron() {
    setIsTriggeringCron(true);
    try {
      const res = await fetch("/api/cron/check-competitions", {
        headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? secret}` },
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Cron failed", description: json.error, variant: "destructive" });
      } else {
        toast({
          title: "Cron triggered",
          description: `Found ${json.competitionsNew} new competitions, sent ${json.notificationsSent} SMS.`,
          variant: "success",
        });
        await fetchStats(secret);
      }
    } finally {
      setIsTriggeringCron(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 max-w-sm mx-auto animate-fade-in">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">Admin Access</h2>
          <p className="text-sm text-zinc-400 mt-1">Enter your admin secret to continue</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>Admin Secret</Label>
            <Input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && fetchStats(secret)}
            />
          </div>
          <Button variant="primary" onClick={() => fetchStats(secret)} disabled={isLoading || !secret}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Access Dashboard"}
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.total_users, sub: `${stats.verified_users} verified` },
    { icon: Activity, label: "Active Users", value: stats.active_users, sub: "verified & not paused" },
    { icon: Trophy, label: "Competitions Tracked", value: stats.total_competitions },
    { icon: Bell, label: "Notifications Sent", value: stats.total_notifications },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
          <p className="text-sm text-zinc-400 mt-0.5">CubeComp Notifier — System Overview</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(secret)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={triggerCron}
            disabled={isTriggeringCron}
          >
            {isTriggeringCron ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Run Cron Now
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <Icon className="h-4 w-4" />
                <CardDescription className="text-xs">{label}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
              {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent competitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Recently Discovered Competitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {stats.recent_competitions.length === 0 ? (
              <p className="text-sm text-zinc-500">No competitions tracked yet.</p>
            ) : (
              stats.recent_competitions.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://www.worldcubeassociation.org/competitions/${comp.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-white hover:text-indigo-300 transition-colors truncate block"
                    >
                      {comp.name}
                    </a>
                    <p className="text-xs text-zinc-500">{comp.city}, {comp.country}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-400">
                      {formatDateRange(comp.start_date, comp.end_date)}
                    </p>
                    <p className="text-xs text-zinc-600">
                      Discovered {new Date(comp.announced_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cron health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-indigo-400" />
            Cron Health — Last 20 Runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {stats.recent_cron_logs.length === 0 ? (
              <p className="text-sm text-zinc-500">No cron runs recorded yet.</p>
            ) : (
              stats.recent_cron_logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 px-3 py-2"
                >
                  {log.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300">
                      {new Date(log.run_at).toLocaleString()}
                    </p>
                    {log.error && (
                      <p className="text-xs text-red-400 truncate">{log.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="text-xs">
                      <p className="text-zinc-400">{log.competitions_found} found</p>
                      <p className="text-zinc-500">{log.competitions_new} new</p>
                    </div>
                    <div className="text-xs">
                      <Badge variant={log.notifications_sent > 0 ? "default" : "secondary"}>
                        {log.notifications_sent} SMS
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
