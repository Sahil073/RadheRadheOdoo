import { useMemo, useState } from "react";
import { Plus, Users, AlertTriangle } from "lucide-react";
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
import { DRIVER_STATUS, LICENSE_CATEGORIES } from "@/utils/constants";
import { formatDate, daysUntil } from "@/lib/utils";
import { isLicenseExpired } from "@/services/driverService";

const emptyForm = { name: "", licenseNumber: "", licenseCategory: LICENSE_CATEGORIES[0], licenseExpiry: "", contact: "" };

export default function DriversPage() {
  const { drivers, createDriver, loading } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const matchesSearch = `${d.name} ${d.licenseNumber}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDriver({ ...form, name: form.name.trim() });
      toast({ title: "Driver added", description: `${form.name} is now available for dispatch.` });
      setForm(emptyForm);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Drivers"
        description="Profiles, license validity, and safety scores for every driver."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="accent"><Plus className="h-4 w-4" /> Add Driver</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a driver</DialogTitle>
                <DialogDescription>New drivers start as Available with a safety score of 100.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="licenseNumber">License number</Label>
                    <Input id="licenseNumber" required value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>License category</Label>
                    <Select value={form.licenseCategory} onValueChange={(v) => setForm({ ...form, licenseCategory: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LICENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="licenseExpiry">License expiry</Label>
                    <Input id="licenseExpiry" type="date" required value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact">Contact number</Label>
                    <Input id="contact" required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+91 90000 00000" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="accent" disabled={submitting}>{submitting ? "Saving…" : "Add driver"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search name or license…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 max-w-xs text-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(DRIVER_STATUS).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {!loading && filtered.length === 0 ? (
            <div className="p-6"><EmptyState icon={Users} title="No drivers found" description="Try clearing filters or add a new driver." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Safety score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => {
                  const expired = isLicenseExpired(d);
                  const soon = !expired && daysUntil(d.licenseExpiry) < 45;
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="font-mono text-xs">{d.licenseNumber}</TableCell>
                      <TableCell>{d.licenseCategory}</TableCell>
                      <TableCell>
                        <span className={expired ? "font-medium text-destructive" : soon ? "font-medium text-warning-foreground" : ""}>
                          {formatDate(d.licenseExpiry)}
                        </span>
                        {(expired || soon) && <AlertTriangle className="ml-1 inline h-3 w-3 text-destructive" />}
                      </TableCell>
                      <TableCell>{d.contact}</TableCell>
                      <TableCell>{d.safetyScore}</TableCell>
                      <TableCell><StatusBadge status={d.status} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
