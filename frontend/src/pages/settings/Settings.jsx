import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { ROLE_LIST, ROLE_PERMISSIONS } from "@/utils/constants";

const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "UTC", "America/New_York"];
const SECTIONS = ["dashboard", "fleet", "drivers", "trips", "maintenance", "fuel", "analytics", "settings"];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orgName, setOrgName] = useState("TransitOps Logistics Pvt. Ltd.");
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [emailReminders, setEmailReminders] = useState(true);
  const [permissions, setPermissions] = useState(ROLE_PERMISSIONS);

  const togglePermission = (role, section) => {
    setPermissions((prev) => {
      const current = new Set(prev[role]);
      current.has(section) ? current.delete(section) : current.add(section);
      return { ...prev, [role]: Array.from(current) };
    });
  };

  const handleSave = () => {
    toast({ title: "Settings saved", description: "General settings and access rules updated." });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Organization preferences and role-based access control." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic organization details used across reports and notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Organization name</Label>
              <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Email reminders</p>
                <p className="text-xs text-muted-foreground">Notify safety officers before licenses expire.</p>
              </div>
              <Switch checked={emailReminders} onCheckedChange={setEmailReminders} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>Signed in as {user?.email}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={user?.name || ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={user?.role || ""} disabled />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role-based access</CardTitle>
          <CardDescription>Control which sections each role can reach.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                {ROLE_LIST.map((role) => <TableHead key={role} className="text-center">{role}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {SECTIONS.map((section) => (
                <TableRow key={section}>
                  <TableCell className="font-medium capitalize">{section}</TableCell>
                  {ROLE_LIST.map((role) => (
                    <TableCell key={role} className="text-center">
                      <Switch
                        checked={permissions[role]?.includes(section)}
                        onCheckedChange={() => togglePermission(role, section)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="accent" onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  );
}
