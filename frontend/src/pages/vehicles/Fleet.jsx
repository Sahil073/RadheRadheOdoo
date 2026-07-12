import { useMemo, useState } from "react";
import { Plus, Truck } from "lucide-react";
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
import { VEHICLE_STATUS, VEHICLE_TYPES } from "@/utils/constants";
import { formatCurrency } from "@/lib/utils";

const emptyForm = { regNumber: "", name: "", type: VEHICLE_TYPES[0], maxLoadKg: "", odometer: "", acquisitionCost: "" };

export default function FleetPage() {
  const { vehicles, createVehicle, costForVehicle, loading } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch = `${v.regNumber} ${v.name}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      const matchesType = typeFilter === "all" || v.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, search, statusFilter, typeFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await createVehicle({
        regNumber: form.regNumber.trim(),
        name: form.name.trim(),
        type: form.type,
        maxLoadKg: Number(form.maxLoadKg),
        odometer: Number(form.odometer) || 0,
        acquisitionCost: Number(form.acquisitionCost) || 0,
      });
      toast({ title: "Vehicle registered", description: `${form.regNumber} added to the fleet.` });
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fleet"
        description="Master registry of every vehicle — status, capacity, and lifecycle."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="accent"><Plus className="h-4 w-4" /> Add Vehicle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register a vehicle</DialogTitle>
                <DialogDescription>Registration number must be unique across the fleet.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="regNumber">Registration number</Label>
                    <Input id="regNumber" required value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value })} placeholder="DL-9F 4109" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name / model</Label>
                    <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Van-05" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maxLoadKg">Max load (kg)</Label>
                    <Input id="maxLoadKg" type="number" min="0" required value={form.maxLoadKg} onChange={(e) => setForm({ ...form, maxLoadKg: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="odometer">Odometer (km)</Label>
                    <Input id="odometer" type="number" min="0" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acquisitionCost">Acquisition cost</Label>
                  <Input id="acquisitionCost" type="number" min="0" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
                </div>
                {formError && <p className="text-xs font-medium text-destructive">{formError}</p>}
                <DialogFooter>
                  <Button type="submit" variant="accent" disabled={submitting}>{submitting ? "Saving…" : "Register vehicle"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search registration or model…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 max-w-xs text-xs" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(VEHICLE_STATUS).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {!loading && filtered.length === 0 ? (
            <div className="p-6"><EmptyState icon={Truck} title="No vehicles found" description="Try clearing filters or register a new vehicle." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reg. number</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Max load</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead>Op. cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.regNumber}</TableCell>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell>{v.maxLoadKg} kg</TableCell>
                    <TableCell>{v.odometer.toLocaleString()} km</TableCell>
                    <TableCell>{formatCurrency(costForVehicle(v.id).total)}</TableCell>
                    <TableCell><StatusBadge status={v.status} /></TableCell>
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
