import { Navigate } from "react-router-dom";

// Fuel and Expenses are managed together — see pages/fuel/FuelExpenses.jsx.
export default function ExpensesRedirect() {
  return <Navigate to="/fuel-expenses" replace />;
}
