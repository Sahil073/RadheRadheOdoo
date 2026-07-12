import { useMemo, useState } from "react";
import { Plus, Wrench, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/toast";
import { MAINTENANCE_STATUS } from "@/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

const emptyForm = { vehicleId: "", type: "", notes: "", cost: "" };

export default function MaintenancePage() {
  const { maintenance, vehicles, openMaintenance, closeMaintenance, loading } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const eligibleVehicles = useMemo(() => vehicles.filter((v) => v.status !== "Retired"), [vehicles]);
  const vehicleLabel = (id) => {
    const v = vehicles.find((veh) => veh.id === id);
    return v ? `${v.name} (${v.regNumber})` : "—";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await openMaintenance({ vehicleId: form.vehicleId, type: form.type, notes: form.notes, cost: Number(form.cost) || 0 });
      toast({ title: "Maintenance log opened", description: "Vehicle moved to In Shop and hidden from dispatch." });
      setForm(emptyForm);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (record) => {
    setBusyId(record.id);
    try {
      await closeMaintenance(record);
      toast({ title: "Maintenance closed", description: "Vehicle restored to Available (unless retired)." });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Maintenance"
        description="Service logs that automatically control vehicle dispatch eligibility."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="accent"><Plus className="h-4 w-4" /> Log Maintenance</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log maintenance record</DialogTitle>
                <DialogDescription>Opening a record instantly switches the vehicle to In Shop.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Vehicle</Label>
                  <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })} required>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>
                      {eligibleVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} ({v.regNumber})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Service type</Label>
                  <Input id="type" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Oil Change" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cost">Estimated cost</Label>
                  <Input id="cost" type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Details about the service…" />
                </div>
                <DialogFooter>
                  <Button type="submit" variant="accent" disabled={submitting || !form.vehicleId}>{submitting ? "Saving…" : "Open record"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          {!loading && maintenance.length === 0 ? (
            <div className="p-6"><EmptyState icon={Wrench} title="No maintenance records" description="Log a service record to take a vehicle out of dispatch." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenance.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{vehicleLabel(m.vehicleId)}</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{formatDate(m.openedAt)}</TableCell>
                    <TableCell>{m.closedAt ? formatDate(m.closedAt) : "—"}</TableCell>
                    <TableCell>{formatCurrency(m.cost)}</TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                    <TableCell className="text-right">
                      {m.status === MAINTENANCE_STATUS.OPEN && (
                        <Button size="sm" variant="outline" disabled={busyId === m.id} onClick={() => handleClose(m)}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Close & restore
                        </Button>
                      )}
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
