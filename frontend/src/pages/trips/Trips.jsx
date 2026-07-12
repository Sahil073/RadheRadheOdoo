import { useMemo, useState } from "react";
import { Plus, Route as RouteIcon, Check, X, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/toast";
import { TRIP_STATUS } from "@/utils/constants";
import { formatDate, cn } from "@/lib/utils";
import { isDispatchable } from "@/services/vehicleService";
import { isAssignable } from "@/services/driverService";

const STEPS = ["Route & Cargo", "Vehicle", "Driver", "Review"];

function CreateTripWizard({ open, onOpenChange }) {
  const { vehicles, drivers, createTrip } = useData();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ source: "", destination: "", cargoKg: "", plannedKm: "", vehicleId: "", driverId: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const availableVehicles = useMemo(() => vehicles.filter(isDispatchable), [vehicles]);
  const availableDrivers = useMemo(() => drivers.filter(isAssignable), [drivers]);
  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
  const selectedDriver = drivers.find((d) => d.id === form.driverId);

  const reset = () => {
    setStep(0);
    setForm({ source: "", destination: "", cargoKg: "", plannedKm: "", vehicleId: "", driverId: "" });
    setError(null);
  };

  const canProceed = () => {
    if (step === 0) return form.source && form.destination && form.cargoKg && form.plannedKm;
    if (step === 1) return !!form.vehicleId;
    if (step === 2) return !!form.driverId;
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 0 && selectedVehicle && Number(form.cargoKg) > 9999999) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createTrip({
        source: form.source,
        destination: form.destination,
        cargoKg: Number(form.cargoKg),
        plannedKm: Number(form.plannedKm),
        vehicleId: form.vehicleId,
        driverId: form.driverId,
      });
      toast({ title: "Trip created", description: "Trip saved as Draft. Dispatch it from the Trips list." });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const overCapacity = selectedVehicle && Number(form.cargoKg) > Number(selectedVehicle.maxLoadKg);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create trip</DialogTitle>
          <DialogDescription>Only available, compliant vehicles and drivers can be selected.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                i < step ? "bg-success text-white" : i === step ? "bg-info text-white" : "bg-muted text-muted-foreground"
              )}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-[11px]", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="source">Source</Label>
                <Input id="source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Andheri Depot" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Pune Hub" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cargoKg">Cargo weight (kg)</Label>
                <Input id="cargoKg" type="number" min="0" value={form.cargoKg} onChange={(e) => setForm({ ...form, cargoKg: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plannedKm">Planned distance (km)</Label>
                <Input id="plannedKm" type="number" min="0" value={form.plannedKm} onChange={(e) => setForm({ ...form, plannedKm: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {availableVehicles.length === 0 && <p className="text-xs text-muted-foreground">No vehicles are currently available for dispatch.</p>}
            {availableVehicles.map((v) => (
              <button
                type="button"
                key={v.id}
                onClick={() => setForm({ ...form, vehicleId: v.id })}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  form.vehicleId === v.id ? "border-primary bg-muted" : "border-border hover:bg-muted/50"
                )}
              >
                <div>
                  <p className="font-medium">{v.name} · {v.regNumber}</p>
                  <p className="text-[11px] text-muted-foreground">{v.type} · capacity {v.maxLoadKg}kg</p>
                </div>
                <StatusBadge status={v.status} />
              </button>
            ))}
            {overCapacity && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                Cargo ({form.cargoKg}kg) exceeds capacity ({selectedVehicle?.maxLoadKg}kg). Choose a different vehicle.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {availableDrivers.length === 0 && <p className="text-xs text-muted-foreground">No drivers are currently eligible for dispatch.</p>}
            {availableDrivers.map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => setForm({ ...form, driverId: d.id })}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  form.driverId === d.id ? "border-primary bg-muted" : "border-border hover:bg-muted/50"
                )}
              >
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.licenseCategory} · expires {formatDate(d.licenseExpiry)} · score {d.safetyScore}</p>
                </div>
                <StatusBadge status={d.status} />
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2 rounded-md border border-border p-3 text-sm">
            <p><span className="text-muted-foreground">Route:</span> {form.source} → {form.destination}</p>
            <p><span className="text-muted-foreground">Cargo / distance:</span> {form.cargoKg}kg over {form.plannedKm}km</p>
            <p><span className="text-muted-foreground">Vehicle:</span> {selectedVehicle?.name} ({selectedVehicle?.regNumber})</p>
            <p><span className="text-muted-foreground">Driver:</span> {selectedDriver?.name}</p>
          </div>
        )}

        {error && <p className="text-xs font-medium text-destructive">{error}</p>}

        <DialogFooter>
          {step > 0 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < STEPS.length - 1 ? (
            <Button variant="accent" onClick={handleNext} disabled={!canProceed() || overCapacity}>Next</Button>
          ) : (
            <Button variant="accent" onClick={handleCreate} disabled={submitting}>{submitting ? "Creating…" : "Create trip"}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TripsPage() {
  const { trips, vehicles, drivers, dispatchTrip, completeTrip, cancelTrip, loading } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(
    () => trips.filter((t) => statusFilter === "all" || t.status === statusFilter),
    [trips, statusFilter]
  );

  const vehicleName = (id) => vehicles.find((v) => v.id === id)?.name || "—";
  const driverName = (id) => drivers.find((d) => d.id === id)?.name || "—";

  const handleDispatch = async (trip) => {
    setBusyId(trip.id);
    try {
      await dispatchTrip(trip);
      toast({ title: "Trip dispatched", description: "Vehicle and driver are now On Trip." });
    } catch (err) {
      toast({ title: "Cannot dispatch", description: err.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const handleComplete = async (trip) => {
    setBusyId(trip.id);
    try {
      const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
      await completeTrip(trip, { finalOdometer: (vehicle?.odometer || 0) + trip.plannedKm, fuelConsumedL: Math.round(trip.plannedKm / 6) });
      toast({ title: "Trip completed", description: "Vehicle and driver are Available again." });
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (trip) => {
    setBusyId(trip.id);
    try {
      await cancelTrip(trip);
      toast({ title: "Trip cancelled" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Trips"
        description="Dispatch, track, and close out trips across the fleet."
        actions={<Button variant="accent" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create Trip</Button>}
      />

      <CreateTripWizard open={open} onOpenChange={setOpen} />

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(TRIP_STATUS).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {!loading && filtered.length === 0 ? (
            <div className="p-6"><EmptyState icon={RouteIcon} title="No trips found" description="Create a trip to get started." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.source} → {trip.destination}</TableCell>
                    <TableCell>{vehicleName(trip.vehicleId)}</TableCell>
                    <TableCell>{driverName(trip.driverId)}</TableCell>
                    <TableCell>{trip.cargoKg}kg</TableCell>
                    <TableCell>{trip.plannedKm}km</TableCell>
                    <TableCell>{formatDate(trip.createdAt)}</TableCell>
                    <TableCell><StatusBadge status={trip.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {trip.status === TRIP_STATUS.DRAFT && (
                          <Button size="sm" variant="outline" disabled={busyId === trip.id} onClick={() => handleDispatch(trip)}>
                            <PlayCircle className="h-3.5 w-3.5" /> Dispatch
                          </Button>
                        )}
                        {trip.status === TRIP_STATUS.DISPATCHED && (
                          <Button size="sm" variant="outline" disabled={busyId === trip.id} onClick={() => handleComplete(trip)}>
                            <Check className="h-3.5 w-3.5" /> Complete
                          </Button>
                        )}
                        {(trip.status === TRIP_STATUS.DRAFT || trip.status === TRIP_STATUS.DISPATCHED) && (
                          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" disabled={busyId === trip.id} onClick={() => handleCancel(trip)}>
                            <X className="h-3.5 w-3.5" /> Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
