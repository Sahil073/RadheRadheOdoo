import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/sidebar/Topbar";

const TITLES = {
  "/dashboard": "Dashboard",
  "/fleet": "Fleet",
  "/drivers": "Drivers",
  "/trips": "Trips",
  "/maintenance": "Maintenance",
  "/fuel-expenses": "Fuel & Expenses",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function AppLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || "TransitOps";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
