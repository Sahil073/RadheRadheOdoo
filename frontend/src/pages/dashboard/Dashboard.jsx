import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS, VEHICLE_TYPES, REGIONS } from "@/utils/constants";
import { formatDate } from "@/lib/utils";
import { RouteIcon, Truck, Activity, Users, Gauge, PackageCheck, Clock3, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const TREND_DAYS = 14;

function buildTripTrend(trips) {
  const days = Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (TREND_DAYS - 1 - i));
    return d;
  });

  return days.map((d) => {
    const dayKey = d.toISOString().slice(0, 10);
    const dayTrips = trips.filter((t) => t.createdAt?.slice(0, 10) === dayKey);
    return {
      label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      trips: dayTrips.length,
      completed: dayTrips.filter((t) => t.status === TRIP_STATUS.COMPLETED).length,
    };
  });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-muted-foreground">
          {p.name}: <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone = "default" }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md " +
            (tone === "success"
              ? "bg-success/10 text-success"
              : tone === "info"
              ? "bg-info/10 text-info"
              : tone === "warning"
              ? "bg-warning/15 text-warning-foreground"
              : "bg-muted text-foreground")
          }
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-lg font-semibold leading-none">{value}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { vehicles, drivers, trips, loading } = useData();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [region, setRegion] = useState("all");

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => (type === "all" || v.type === type) && (status === "all" || v.status === status) && (region === "all" || v.region === region)
      ),
    [vehicles, type, status, region]
  );

  const kpis = useMemo(() => {
    const active = filteredVehicles.filter((v) => v.status !== VEHICLE_STATUS.RETIRED).length;
    const available = filteredVehicles.filter((v) => v.status === VEHICLE_STATUS.AVAILABLE).length;
    const inShop = filteredVehicles.filter((v) => v.status === VEHICLE_STATUS.IN_SHOP).length;
    const activeTrips = trips.filter((t) => t.status === TRIP_STATUS.DISPATCHED).length;
    const pendingTrips = trips.filter((t) => t.status === TRIP_STATUS.DRAFT).length;
    const onDuty = drivers.filter((d) => d.status !== DRIVER_STATUS.OFF_DUTY && d.status !== DRIVER_STATUS.SUSPENDED).length;
    const utilization = filteredVehicles.length
      ? Math.round((filteredVehicles.filter((v) => v.status === VEHICLE_STATUS.ON_TRIP).length / filteredVehicles.length) * 100)
      : 0;
    return { active, available, inShop, activeTrips, pendingTrips, onDuty, utilization };
  }, [filteredVehicles, trips, drivers]);

  const statusCounts = useMemo(() => {
    return Object.values(VEHICLE_STATUS).map((s) => ({
      status: s,
      count: filteredVehicles.filter((v) => v.status === s).length,
    }));
  }, [filteredVehicles]);

  const recentTrips = trips.slice(0, 5);
  const trend = useMemo(() => buildTripTrend(trips), [trips]);
  const trendPrevHalf = trend.slice(0, 7).reduce((s, d) => s + d.trips, 0);
  const trendRecentHalf = trend.slice(7).reduce((s, d) => s + d.trips, 0);
  const trendChangePct = trendPrevHalf > 0 ? Math.round(((trendRecentHalf - trendPrevHalf) / trendPrevHalf) * 100) : trendRecentHalf > 0 ? 100 : 0;
  const expiringLicenses = drivers.filter((d) => {
    if (!d.licenseExpiry) return false;
    const days = (new Date(d.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days < 45;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time snapshot of fleet health, dispatch activity, and utilization."
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.values(VEHICLE_STATUS).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Kpi icon={Truck} label="Active Vehicles" value={kpis.active} tone="info" />
        <Kpi icon={PackageCheck} label="Available Vehicles" value={kpis.available} tone="success" />
        <Kpi icon={Gauge} label="In Maintenance" value={kpis.inShop} tone="warning" />
        <Kpi icon={RouteIcon} label="Active Trips" value={kpis.activeTrips} tone="info" />
        <Kpi icon={Clock3} label="Pending Trips" value={kpis.pendingTrips} />
        <Kpi icon={Users} label="Drivers On Duty" value={kpis.onDuty} tone="success" />
        <Kpi icon={Activity} label="Fleet Utilization" value={`${kpis.utilization}%`} tone="info" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Trip activity — last {TREND_DAYS} days</CardTitle>
            <CardDescription>Trips created vs. completed, tracked daily.</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
            <TrendingUp className={"h-3.5 w-3.5 " + (trendChangePct >= 0 ? "text-success" : "text-destructive")} />
            <span className={trendChangePct >= 0 ? "text-success" : "text-destructive"}>
              {trendChangePct >= 0 ? "+" : ""}{trendChangePct}%
            </span>
            <span className="text-muted-foreground">vs. previous week</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tripsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="trips" name="Trips created" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#tripsGradient)" />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#completedGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent trips</CardTitle>
            <Link to="/trips" className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
            {!loading && recentTrips.length === 0 && (
              <EmptyState icon={RouteIcon} title="No trips yet" description="Create your first trip from the Trips page." />
            )}
            {recentTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{trip.source} → {trip.destination}</p>
                  <p className="text-[11px] text-muted-foreground">{trip.cargoKg}kg · {trip.plannedKm}km · {formatDate(trip.createdAt)}</p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle status mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusCounts.map((s) => (
              <div key={s.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{s.status}</span>
                  <span className="text-muted-foreground">{s.count}</span>
                </div>
                <Progress value={filteredVehicles.length ? (s.count / filteredVehicles.length) * 100 : 0} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {expiringLicenses.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-xs text-destructive">
            <span className="font-semibold">Compliance alert:</span> {expiringLicenses.length} driver license(s) expiring within 45 days — review under Drivers before dispatching new trips.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
