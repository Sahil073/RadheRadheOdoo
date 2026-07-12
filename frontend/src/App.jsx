import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import LoginPage from "@/pages/auth/Login";
import DashboardPage from "@/pages/dashboard/Dashboard";
import FleetPage from "@/pages/vehicles/Fleet";
import DriversPage from "@/pages/drivers/Drivers";
import TripsPage from "@/pages/trips/Trips";
import MaintenancePage from "@/pages/maintenance/Maintenance";
import FuelExpensesPage from "@/pages/fuel/FuelExpenses";
import AnalyticsPage from "@/pages/reports/Analytics";
import SettingsPage from "@/pages/settings/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute section="dashboard">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fleet"
          element={
            <ProtectedRoute section="fleet">
              <FleetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers"
          element={
            <ProtectedRoute section="drivers">
              <DriversPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute section="trips">
              <TripsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute section="maintenance">
              <MaintenancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fuel-expenses"
          element={
            <ProtectedRoute section="fuel">
              <FuelExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute section="analytics">
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute section="settings">
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
