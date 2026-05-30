import { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Badge,
  Modal,
  Form,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchKpis,
  createKpi,
  updateKpi,
  deleteKpi,
} from "../../store/slices/kpisSlice";
import { fetchPlans } from "../../store/slices/plansSlice";
import type { KpiMetric, KpiMetricRequest, MetricStatus } from "../../types";
import { metricStatusVariant, KPI_CATEGORIES } from "../../utils";

const STATUS_OPTIONS: MetricStatus[] = [
  "ON_TRACK",
  "AT_RISK",
  "BEHIND",
  "ACHIEVED",
];
const empty: KpiMetricRequest = {
  planId: 0,
  metricName: "",
  category: "",
  targetValue: 0,
  unit: "",
  period: "",
  status: "ON_TRACK",
};

function KpiFormModal({
  show,
  onHide,
  onSubmit,
  initial,
  loading,
  error,
  plans,
}: {
  show: boolean;
  onHide: () => void;
  onSubmit: (d: KpiMetricRequest) => void;
  initial?: KpiMetric | null;
  loading?: boolean;
  error?: string | null;
  plans: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<KpiMetricRequest>(empty);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        planId: initial.planId,
        metricName: initial.metricName,
        category: initial.category,
        targetValue: initial.targetValue,
        actualValue: initial.actualValue,
        unit: initial.unit,
        period: initial.period,
        status: initial.status,
      });
    } else setForm(empty);
    setValidated(false);
  }, [initial, show]);

  const set = (field: keyof KpiMetricRequest, v: string | number) =>
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
    <Modal show={show} onHide={onHide} size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1rem", fontWeight: 600 }}>
            {initial ? "Edit KPI" : "New KPI Metric"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="sap-form-label">GTM Plan *</Form.Label>
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
                <Form.Control.Feedback type="invalid">
                  Plan required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">
                  Metric Name *
                </Form.Label>
                <Form.Control
                  required
                  value={form.metricName}
                  onChange={(e) => set("metricName", e.target.value)}
                  placeholder="Example: Revenue Growth"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">Category *</Form.Label>
                <Form.Select
                  required
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Select...</option>
                  {KPI_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
              <Form.Group>
                <Form.Label className="sap-form-label">Target *</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min={0}
                  value={form.targetValue}
                  onChange={(e) =>
                    set("targetValue", parseFloat(e.target.value))
                  }
                />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
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
            <Col xs={6} sm={3}>
              <Form.Group>
                <Form.Label className="sap-form-label">Unit *</Form.Label>
                <Form.Control
                  required
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  placeholder="EUR, %, leads..."
                />
              </Form.Group>
            </Col>
            <Col xs={6} sm={3}>
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
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="sap-form-label">Status</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={(e) =>
                    set("status", e.target.value as MetricStatus)
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : initial ? "Update" : "Create KPI"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

//KpisPage manages KPI metrics CRUD. It fetches KPIs and plans.
export default function KpisPage() {
  const dispatch = useAppDispatch();
  const { items: kpis, loading, error } = useAppSelector((s) => s.kpis);
  const { items: plans } = useAppSelector((s) => s.plans);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KpiMetric | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterPlan, setFilterPlan] = useState<number | "">("");

  useEffect(() => {
    dispatch(fetchKpis());
    dispatch(fetchPlans());
  }, [dispatch]);

  const filtered = filterPlan
    ? kpis.filter((k) => k.planId === filterPlan)
    : kpis;

  const handleSubmit = async (data: KpiMetricRequest) => {
    setSaving(true);
    if (editing) await dispatch(updateKpi({ id: editing.id, data }));
    else await dispatch(createKpi(data));
    setSaving(false);
    setShowForm(false);
    setEditing(null);
  };

  return (
    <>
      <div className="page-header">
        <Row className="align-items-center">
          <Col>
            <h1>KPI Tracker</h1>
            <p>Track key performance indicators across your GTM plans</p>
          </Col>
          <Col xs="auto">
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              + Add KPI
            </Button>
          </Col>
        </Row>
      </div>

      {/* Summary tiles */}
      <Row className="g-3 mb-3">
        {[
          { label: "Total KPIs", value: kpis.length },
          {
            label: "Achieved",
            value: kpis.filter((k) => k.status === "ACHIEVED").length,
            color: "var(--sap-success)",
          },
          {
            label: "On Track",
            value: kpis.filter((k) => k.status === "ON_TRACK").length,
            color: "var(--sap-brand)",
          },
          {
            label: "At Risk / Behind",
            value: kpis.filter(
              (k) => k.status === "AT_RISK" || k.status === "BEHIND",
            ).length,
            color: "var(--sap-danger)",
          },
        ].map((t) => (
          <Col key={t.label} xs={6} md={3}>
            <div className="kpi-tile">
              <div className="kpi-tile-label">{t.label}</div>
              <div className="kpi-tile-value" style={{ color: t.color }}>
                {t.value}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div className="sap-card">
        <div className="mb-3 d-flex gap-2 align-items-center">
          <Form.Label className="sap-form-label mb-0">
            Filter by plan:
          </Form.Label>
          <Form.Select
            style={{ width: 260 }}
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
          <span className="text-muted" style={{ fontSize: "0.8rem" }}>
            {filtered.length} KPI(s)
          </span>
        </div>

        {loading ? (
          <div className="loading-screen">
            <Spinner animation="border" variant="primary" size="sm" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted">No KPIs found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table sap-table mb-0">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Plan</th>
                  <th>Category</th>
                  <th>Period</th>
                  <th>Target</th>
                  <th>Actual</th>
                  <th>Achievement</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((kpi) => (
                  <tr key={kpi.id}>
                    <td style={{ fontWeight: 500 }}>{kpi.metricName}</td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--sap-text-muted)",
                      }}
                    >
                      {kpi.planName}
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#f0f5ff",
                          color: "var(--sap-brand)",
                          borderRadius: 3,
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {kpi.category}
                      </span>
                    </td>
                    <td>{kpi.period}</td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {kpi.targetValue.toLocaleString()} {kpi.unit}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {kpi.actualValue?.toLocaleString() ?? "-"}
                      {kpi.actualValue ? ` ${kpi.unit}` : ""}
                    </td>
                    <td style={{ minWidth: 120 }}>
                      {kpi.achievementRate != null ? (
                        <>
                          <div
                            className="progress"
                            style={{ height: 5, marginBottom: 3 }}
                          >
                            <div
                              className="progress-bar progress-bar-sap"
                              style={{
                                width: `${Math.min(kpi.achievementRate, 100)}%`,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "0.75rem" }}>
                            {kpi.achievementRate.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <Badge bg={metricStatusVariant(kpi.status)}>
                        {kpi.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setEditing(kpi);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            if (window.confirm("Delete this KPI?"))
                              dispatch(deleteKpi(kpi.id));
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <KpiFormModal
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={saving}
        error={error}
        plans={plans.map((p) => ({ id: p.id, name: p.name }))}
      />
    </>
  );
}

