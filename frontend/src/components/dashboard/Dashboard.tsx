import { useEffect } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchPlans, fetchSummary } from "../../store/slices/plansSlice";
import { fetchKpis } from "../../store/slices/kpisSlice";
import {
  formatCurrency,
  planStatusVariant,
  metricStatusVariant,
} from "../../utils";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#adb5bd",
  ACTIVE: "#188918",
  ON_HOLD: "#e76500",
  COMPLETED: "#0070f2",
  CANCELLED: "#bb0000",
};

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

//Dashboard: loads summary data and KPIs from the store and renders visualizations
export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { items: plans, summary, loading } = useAppSelector((s) => s.plans);
  const { items: kpis } = useAppSelector((s) => s.kpis);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchSummary());
    dispatch(fetchKpis());
  }, [dispatch]);

  if (loading && !summary) {
    return (
      <div className="loading-screen">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const statusData = summary
    ? summary.statusBreakdown
        .map((entry) => ({
          name: formatStatusLabel(entry.status),
          value: Number(entry.count),
          fill: STATUS_COLORS[entry.status],
        }))
        .filter((d) => d.value > 0)
    : [];

  const regionData = (summary?.byRegion ?? []).map((r) => ({
    region: r.region,
    plans: Number(r.count),
    budget: Number(r.budget) / 1000,
  }));

  const atRiskKpis = kpis
    .filter((k) => k.status === "AT_RISK" || k.status === "BEHIND")
    .slice(0, 5);
  const recentPlans = [...plans]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <div className="page-header">
        <h1>GTM Planning Overview</h1>
        <p>
          Monitor your go-to-market plans, KPIs, and forecast accuracy across
          all regions
        </p>
      </div>

      {/* KPI Tiles */}
      <Row className="g-3 mb-4">
        {[
          {
            label: "Total Plans",
            value: summary?.totalPlans ?? 0,
            sub: `${summary?.activePlans ?? 0} active`,
          },
          {
            label: "Total Budget",
            value: formatCurrency(summary?.totalBudget ?? 0),
            sub: "across all plans",
          },
          {
            label: "KPIs Tracked",
            value: kpis.length,
            sub: `${kpis.filter((k) => k.status === "ACHIEVED").length} achieved`,
          },
          {
            label: "At Risk KPIs",
            value: atRiskKpis.length,
            sub: "needs attention",
            danger: atRiskKpis.length > 0,
          },
        ].map((tile) => (
          <Col key={tile.label} xs={12} sm={6} xl={3}>
            <div className="kpi-tile">
              <div className="kpi-tile-label">{tile.label}</div>
              <div
                className="kpi-tile-value"
                style={tile.danger ? { color: "var(--sap-danger)" } : {}}
              >
                {tile.value}
              </div>
              <div
                className="kpi-tile-trend"
                style={{ color: "var(--sap-text-muted)" }}
              >
                {tile.sub}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        {/* Region Budget Chart */}
        <Col xs={12} lg={8}>
          <div className="sap-card">
            <div className="sap-card-header">
              <h5 className="sap-card-title">Budget by Region (€k)</h5>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [`€${v}k`, "Budget"]} />
                  <Bar dataKey="budget" fill="#0070f2" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Status Pie */}
        <Col xs={12} lg={4}>
          <div className="sap-card">
            <div className="sap-card-header">
              <h5 className="sap-card-title">Plans by Status</h5>
            </div>
            <div className="chart-container">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading-screen">No data yet</div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Recent Plans */}
        <Col xs={12} lg={7}>
          <div className="sap-card">
            <div className="sap-card-header">
              <h5 className="sap-card-title">Recent Plans</h5>
              <Link to="/plans" className="btn btn-sm btn-outline-primary">
                View all
              </Link>
            </div>
            {recentPlans.length === 0 ? (
              <p className="text-muted mb-0">
                No plans yet. <Link to="/plans">Create your first plan.</Link>
              </p>
            ) : (
              <table className="table sap-table mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Region</th>
                    <th>Status</th>
                    <th>KPIs</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td>
                        <Link
                          to={`/plans/${plan.id}`}
                          style={{
                            color: "var(--sap-brand)",
                            textDecoration: "none",
                          }}
                        >
                          {plan.name}
                        </Link>
                      </td>
                      <td>{plan.region}</td>
                      <td>
                        <span
                          className={`badge bg-${planStatusVariant(plan.status)}`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td>{plan.kpiCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Col>

        {/* At Risk KPIs */}
        <Col xs={12} lg={5}>
          <div className="sap-card">
            <div className="sap-card-header">
              <h5 className="sap-card-title">
                <FontAwesomeIcon icon={faTriangleExclamation} /> KPIs Needing
                Attention
              </h5>
              <Link to="/kpis" className="btn btn-sm btn-outline-warning">
                View all
              </Link>
            </div>
            {atRiskKpis.length === 0 ? (
              <p
                className="text-muted mb-0"
                style={{ color: "var(--sap-success)" }}
              >
                <FontAwesomeIcon icon={faCircleCheck} /> All KPIs are on track
              </p>
            ) : (
              <div>
                {atRiskKpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="d-flex justify-content-between align-items-center py-2"
                    style={{ borderBottom: "1px solid var(--sap-border)" }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                        {kpi.metricName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--sap-text-muted)",
                        }}
                      >
                        {kpi.planName} · {kpi.period}
                      </div>
                    </div>
                    <span
                      className={`badge bg-${metricStatusVariant(kpi.status)}`}
                    >
                      {kpi.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}
