import { useMemo, useState } from "react";
import { Plus, Fuel as FuelIcon, Receipt } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/toast";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

const emptyFuelForm = { vehicleId: "", date: "", liters: "", cost: "", odometer: "" };
const emptyExpenseForm = { vehicleId: "", category: EXPENSE_CATEGORIES[0], amount: "", date: "", notes: "" };

export default function FuelExpensesPage() {
  const { vehicles, fuelLogs, expenses, addFuelLog, addExpense, loading } = useData();
  const { toast } = useToast();
  const [fuelOpen, setFuelOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState(emptyFuelForm);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [submitting, setSubmitting] = useState(false);

  const vehicleLabel = (id) => {
    const v = vehicles.find((veh) => veh.id === id);
    return v ? `${v.name} (${v.regNumber})` : "—";
  };

  const totalOpCost = useMemo(() => {
    const fuel = fuelLogs.reduce((s, f) => s + Number(f.cost || 0), 0);
    const other = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    return fuel + other;
  }, [fuelLogs, expenses]);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addFuelLog({ ...fuelForm, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost), odometer: Number(fuelForm.odometer) || 0 });
      toast({ title: "Fuel log added" });
      setFuelForm(emptyFuelForm);
      setFuelOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addExpense({ ...expenseForm, amount: Number(expenseForm.amount) });
      toast({ title: "Expense recorded" });
      setExpenseForm(emptyExpenseForm);
      setExpenseOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fuel & Expenses"
        description="Track fuel consumption and other operational costs per vehicle."
        actions={
          <div className="flex gap-2">
            <Dialog open={fuelOpen} onOpenChange={setFuelOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="h-4 w-4" /> Log Fuel</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log fuel purchase</DialogTitle>
                  <DialogDescription>Recorded against the selected vehicle's operational cost.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFuelSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Vehicle</Label>
                    <Select value={fuelForm.vehicleId} onValueChange={(v) => setFuelForm({ ...fuelForm, vehicleId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} ({v.regNumber})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" required value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="odometer">Odometer (km)</Label>
                      <Input id="odometer" type="number" value={fuelForm.odometer} onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="liters">Liters</Label>
                      <Input id="liters" type="number" min="0" required value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cost">Cost</Label>
                      <Input id="cost" type="number" min="0" required value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" variant="accent" disabled={submitting || !fuelForm.vehicleId}>{submitting ? "Saving…" : "Save fuel log"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
              <DialogTrigger asChild>
                <Button variant="accent"><Plus className="h-4 w-4" /> Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record an expense</DialogTitle>
                  <DialogDescription>Tolls, fines, permits, and other non-fuel operational costs.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleExpenseSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Vehicle</Label>
                    <Select value={expenseForm.vehicleId} onValueChange={(v) => setExpenseForm({ ...expenseForm, vehicleId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} ({v.regNumber})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" type="number" min="0" required value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="expDate">Date</Label>
                    <Input id="expDate" type="date" required value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="expNotes">Notes</Label>
                    <Input id="expNotes" value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" variant="accent" disabled={submitting || !expenseForm.vehicleId}>{submitting ? "Saving…" : "Save expense"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Total operational cost (Fuel + Maintenance + Other)</p>
            <p className="text-lg font-semibold">{formatCurrency(totalOpCost)}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="fuel">
        <TabsList>
          <TabsTrigger value="fuel">Fuel logs</TabsTrigger>
          <TabsTrigger value="expenses">Other expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="fuel">
          <Card>
            <CardContent className="p-0">
              {!loading && fuelLogs.length === 0 ? (
                <div className="p-6"><EmptyState icon={FuelIcon} title="No fuel logs yet" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Liters</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Odometer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fuelLogs.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{vehicleLabel(f.vehicleId)}</TableCell>
                        <TableCell>{formatDate(f.date)}</TableCell>
                        <TableCell>{f.liters} L</TableCell>
                        <TableCell>{formatCurrency(f.cost)}</TableCell>
                        <TableCell>{f.odometer?.toLocaleString() || "—"} km</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="p-0">
              {!loading && expenses.length === 0 ? (
                <div className="p-6"><EmptyState icon={Receipt} title="No expenses recorded yet" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{vehicleLabel(e.vehicleId)}</TableCell>
                        <TableCell>{e.category}</TableCell>
                        <TableCell>{formatDate(e.date)}</TableCell>
                        <TableCell>{formatCurrency(e.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{e.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
