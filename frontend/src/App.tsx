import { Routes, Route, NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faChartLine,
  faClipboardList,
  faGaugeHigh,
} from "@fortawesome/free-solid-svg-icons";
import sapLogo from "./img/SAP_2011_logo.png";
import Dashboard from "./components/dashboard/Dashboard";
import PlansPage from "./components/plans/PlansPage";
import KpisPage from "./components/kpis/KpisPage";
import ForecastsPage from "./components/forecasts/ForecastsPage";

//header + sidebar + main content area.
//NAV_ITEMS defines the top-level navigation routes shown in the sidebar.
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: faGaugeHigh, exact: true },
  { to: "/plans", label: "GTM Plans", icon: faClipboardList, exact: false },
  { to: "/kpis", label: "KPI Tracker", icon: faChartColumn, exact: false },
  { to: "/forecasts", label: "Forecasts", icon: faChartLine, exact: false },
];

export default function App() {
  return (
    <>
      {/* Header Bar */}
      <header className="sap-shell">
        <Link to="/" className="sap-shell-logo">
          <img
            src={sapLogo}
            alt="SAP"
            style={{
              height: "1.6rem",
              width: "auto",
              display: "block",
            }}
          />
          <span className="product-name">GTM Planning Solution</span>
        </Link>
        <div className="sap-shell-spacer" />
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>
          Kasintha Kalhara Hiripitiya
        </span>
      </header>

      {/* Sidebar */}
      <nav className="sap-sidebar">
        <div className="sap-sidebar-section">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `sap-sidebar-item${isActive ? " active" : ""}`
            }
          >
            <span>
              <FontAwesomeIcon icon={item.icon} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Main route outlet. Each route renders the relavant page component */}
      <main className="sap-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plans/*" element={<PlansPage />} />
          <Route path="/kpis" element={<KpisPage />} />
          <Route path="/forecasts" element={<ForecastsPage />} />
        </Routes>
      </main>
    </>
  );
}
