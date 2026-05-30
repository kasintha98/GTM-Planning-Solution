import { useEffect, useState } from "react";
import { Button, Spinner, Row, Col, Form, Modal, Alert } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchForecasts,
  createForecast,
  deleteForecast,
} from "../../store/slices/forecastsSlice";
import { fetchPlans } from "../../store/slices/plansSlice";
import type { ForecastEntry, ForecastEntryRequest } from "../../types";

const empty: ForecastEntryRequest = {
  planId: 0,
  period: "",
  metricName: "",
  forecastedValue: 0,
  unit: "",
};

function ForecastModal({
  show,
  onHide,
  onSubmit,
  loading,
  error,
  plans,
}: {
  show: boolean;
  onHide: () => void;
  onSubmit: (d: ForecastEntryRequest) => void;
  loading?: boolean;
  error?: string | null;
  plans: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<ForecastEntryRequest>(empty);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(empty);
      setValidated(false);
    }
  }, [show]);

  const set = (field: keyof ForecastEntryRequest, v: string | number) =>
    setForm((f) => ({ ...f, [field]: v }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setValidated(true);
      return;
    }
    onSubmit(form);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem", fontWeight: 600 }}>
            Add Forecast Entry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="sap-form-label">Plan *</Form.Label>
                <Form.Select
                  required
                  value={form.planId || ""}
                  onChange={(e) => set("planId", parseInt(e.target.value))}
                >
                  <option value="">Select plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">Period *</Form.Label>
                <Form.Control
                  required
                  value={form.period}
                  onChange={(e) => set("period", e.target.value)}
                  placeholder="Q1 2026"
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">Metric *</Form.Label>
                <Form.Control
                  required
                  value={form.metricName}
                  onChange={(e) => set("metricName", e.target.value)}
                  placeholder="Revenue"
                />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Form.Group>
                <Form.Label className="sap-form-label">Forecast *</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min={0}
                  value={form.forecastedValue}
                  onChange={(e) =>
                    set("forecastedValue", parseFloat(e.target.value))
                  }
                />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Form.Group>
                <Form.Label className="sap-form-label">Actual</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.actualValue ?? ""}
                  onChange={(e) =>
                    set("actualValue", parseFloat(e.target.value) || 0)
                  }
                />
              </Form.Group>
            </Col>
            <Col xs={4}>
              <Form.Group>
                <Form.Label className="sap-form-label">Unit *</Form.Label>
                <Form.Control
                  required
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  placeholder="EUR"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Entry"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

//ForecastsPage displays forecast vs actual charts
export default function ForecastsPage() {
  const dispatch = useAppDispatch();
  const {
    items: forecasts,
    loading,
    error,
  } = useAppSelector((s) => s.forecasts);
  const { items: plans } = useAppSelector((s) => s.plans);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterPlan, setFilterPlan] = useState<number | "">("");

  useEffect(() => {
    dispatch(fetchForecasts());
    dispatch(fetchPlans());
  }, [dispatch]);

  const filtered: ForecastEntry[] = filterPlan
    ? forecasts.filter((f) => f.planId === filterPlan)
    : forecasts;

  // Build chart data: group by period, show forecast vs actual
  const chartData = filtered.reduce(
    (
      acc: Record<
        string,
        { period: string; forecast: number; actual: number; count: number }
      >,
      f,
    ) => {
      if (!acc[f.period])
        acc[f.period] = { period: f.period, forecast: 0, actual: 0, count: 0 };
      acc[f.period].forecast += f.forecastedValue;
      if (f.actualValue) acc[f.period].actual += f.actualValue;
      acc[f.period].count++;
      return acc;
    },
    {},
  );

  const chartEntries = Object.values(chartData).sort((a, b) =>
    a.period.localeCompare(b.period),
  );

  const handleCreate = async (data: ForecastEntryRequest) => {
    setSaving(true);
    await dispatch(createForecast(data));
    setSaving(false);
    setShowForm(false);
  };

  return (
    <>
      <div className="page-header">
        <Row className="align-items-center">
          <Col>
            <h1>Forecast Tracker</h1>
            <p>
              Compare forecasted values against actuals to validate planning
              reliability
            </p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => setShowForm(true)}>
              + Add Entry
            </Button>
          </Col>
        </Row>
      </div>

      {/* Chart */}
      <div className="sap-card mb-3">
        <div className="sap-card-header">
          <h5 className="sap-card-title">Forecast vs Actual by Period</h5>
          <Form.Select
            style={{ width: 240 }}
            value={filterPlan}
            onChange={(e) =>
              setFilterPlan(e.target.value ? parseInt(e.target.value) : "")
            }
          >
            <option value="">All plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="chart-container">
          {chartEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartEntries}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#0070f2"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Forecasted"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#188918"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  strokeDasharray="5 5"
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="loading-screen text-muted">
              No forecast data. Add entries to visualize.
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="sap-card">
        <div className="sap-card-header">
          <h5 className="sap-card-title">
            Forecast Entries ({filtered.length})
          </h5>
        </div>
        {loading ? (
          <div className="loading-screen">
            <Spinner animation="border" variant="primary" size="sm" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted">No forecast entries yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table sap-table mb-0">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Metric</th>
                  <th>Period</th>
                  <th>Forecasted</th>
                  <th>Actual</th>
                  <th>Variance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id}>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--sap-text-muted)",
                      }}
                    >
                      {f.planName}
                    </td>
                    <td style={{ fontWeight: 500 }}>{f.metricName}</td>
                    <td>{f.period}</td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {f.forecastedValue.toLocaleString()} {f.unit}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {f.actualValue?.toLocaleString() ?? "-"}
                      {f.actualValue ? ` ${f.unit}` : ""}
                    </td>
                    <td>
                      {f.variance != null ? (
                        <span
                          style={{
                            color:
                              f.variance >= 0
                                ? "var(--sap-success)"
                                : "var(--sap-danger)",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                          }}
                        >
                          {f.variance >= 0 ? "+" : ""}
                          {f.variance.toFixed(1)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          if (window.confirm("Delete?"))
                            dispatch(deleteForecast(f.id));
                        }}
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ForecastModal
        show={showForm}
        onHide={() => setShowForm(false)}
        onSubmit={handleCreate}
        loading={saving}
        error={error}
        plans={plans.map((p) => ({ id: p.id, name: p.name }))}
      />
    </>
  );
}
