import { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { useData } from "@/context/DataContext";
import { VEHICLE_STATUS, TRIP_STATUS } from "@/utils/constants";
import { formatCurrency } from "@/lib/utils";

function toCsv(rows, headers) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-muted-foreground">
          {p.name}: <span className="font-medium text-foreground">{formatter ? formatter(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { vehicles, trips, fuelLogs, maintenance, expenses, costForVehicle } = useData();

  const rows = useMemo(() => {
    return vehicles.map((v) => {
      const cost = costForVehicle(v.id);
      const fuelForVehicle = fuelLogs.filter((f) => f.vehicleId === v.id);
      const litersUsed = fuelForVehicle.reduce((s, f) => s + Number(f.liters || 0), 0);
      const tripDistance = trips
        .filter((t) => t.vehicleId === v.id && t.status === TRIP_STATUS.COMPLETED)
        .reduce((s, t) => s + Number(t.plannedKm || 0), 0);
      const fuelEfficiency = litersUsed > 0 ? tripDistance / litersUsed : 0;
      // Illustrative revenue assumption: distance-based rate per km, used only to compute ROI for demo purposes.
      const revenue = tripDistance * 45;
      const roi = v.acquisitionCost > 0 ? ((revenue - (cost.maintenance + cost.fuel)) / v.acquisitionCost) * 100 : 0;
      return {
        id: v.id,
        vehicle: `${v.name} (${v.regNumber})`,
        name: v.name,
        fuelEfficiency: fuelEfficiency.toFixed(2),
        operationalCost: cost.total,
        roi: roi.toFixed(1),
        status: v.status,
      };
    });
  }, [vehicles, fuelLogs, trips, costForVehicle]);

  const kpis = useMemo(() => {
    const avgEfficiency = rows.length ? (rows.reduce((s, r) => s + Number(r.fuelEfficiency), 0) / rows.length).toFixed(1) : "0";
    const utilization = vehicles.length
      ? Math.round((vehicles.filter((v) => v.status === VEHICLE_STATUS.ON_TRIP).length / vehicles.length) * 100)
      : 0;
    const totalCost = rows.reduce((s, r) => s + r.operationalCost, 0);
    const avgRoi = rows.length ? (rows.reduce((s, r) => s + Number(r.roi), 0) / rows.length).toFixed(1) : "0";
    return { avgEfficiency, utilization, totalCost, avgRoi };
  }, [rows, vehicles]);

  const costChartData = rows.map((r) => ({ name: r.name, cost: r.operationalCost }));
  const efficiencyChartData = rows.map((r) => ({ name: r.name, efficiency: Number(r.fuelEfficiency) }));

  const handleExportCsv = () => {
    const csv = toCsv(rows, ["vehicle", "fuelEfficiency", "operationalCost", "roi", "status"]);
    downloadCsv("transitops-analytics.csv", csv);
  };

  const handleExportPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("TransitOps — Fleet Analytics Report", 14, 18);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated ${new Date().toLocaleString("en-IN")}`, 14, 24);

    doc.setDrawColor(230, 230, 230);
    doc.line(14, 28, 196, 28);

    doc.setFontSize(11);
    doc.setTextColor(23, 23, 23);
    const summary = [
      ["Avg fuel efficiency", `${kpis.avgEfficiency} km/L`],
      ["Fleet utilization", `${kpis.utilization}%`],
      ["Total operational cost", formatCurrency(kpis.totalCost)],
      ["Avg vehicle ROI", `${kpis.avgRoi}%`],
    ];
    doc.autoTable({
      startY: 34,
      body: summary,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 1.5 },
      columnStyles: { 0: { textColor: [77, 77, 77] }, 1: { fontStyle: "bold", textColor: [23, 23, 23] } },
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Vehicle", "Fuel efficiency", "Operational cost", "ROI", "Status"]],
      body: rows.map((r) => [r.vehicle, `${r.fuelEfficiency} km/L`, formatCurrency(r.operationalCost), `${r.roi}%`, r.status]),
      headStyles: { fillColor: [23, 23, 23], textColor: [255, 255, 255], fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [247, 247, 247] },
      styles: { cellPadding: 3 },
    });

    doc.save("transitops-analytics.pdf");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Fuel efficiency, utilization, cost, and ROI across the fleet."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
            <Button variant="accent" onClick={handleExportPdf}><FileText className="h-4 w-4" /> Export PDF</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg fuel efficiency</p><p className="text-lg font-semibold">{kpis.avgEfficiency} km/L</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Fleet utilization</p><p className="text-lg font-semibold">{kpis.utilization}%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total op. cost</p><p className="text-lg font-semibold">{formatCurrency(kpis.totalCost)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg vehicle ROI</p><p className="text-lg font-semibold">{kpis.avgRoi}%</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operational cost by vehicle</CardTitle>
            <CardDescription>Fuel + maintenance + other expenses, year to date.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData} barSize={28}>
                  <defs>
                    <linearGradient id="costBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<ChartTooltip formatter={formatCurrency} />} />
                  <Bar dataKey="cost" name="Operational cost" fill="url(#costBarGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuel efficiency by vehicle</CardTitle>
            <CardDescription>Kilometers driven per liter consumed, completed trips only.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiencyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v} km/L`} />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="efficiency" name="km/L" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--accent))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Vehicle performance</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Fuel efficiency</TableHead>
                <TableHead>Operational cost</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.vehicle}</TableCell>
                  <TableCell>{r.fuelEfficiency} km/L</TableCell>
                  <TableCell>{formatCurrency(r.operationalCost)}</TableCell>
                  <TableCell className={Number(r.roi) < 0 ? "text-destructive" : "text-success"}>{r.roi}%</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
