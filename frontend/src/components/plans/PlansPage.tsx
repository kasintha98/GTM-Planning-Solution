import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  Button,
  Spinner,
  Badge,
  Form,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../store/slices/plansSlice";
import type { GtmPlan, GtmPlanRequest } from "../../types";
import { formatCurrency, formatDate, planStatusVariant } from "../../utils";
import PlanForm from "./PlanForm";

// PlansList shows a pageable table of GTM plans. It dispatches actions.
//Actions call the plans slice thunks to persist changes.
function PlansList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: plans, loading, error } = useAppSelector((s) => s.plans);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GtmPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const filtered = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.region.toLowerCase().includes(search.toLowerCase()) ||
      p.product.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async (data: GtmPlanRequest) => {
    setSaving(true);
    await dispatch(createPlan(data));
    setSaving(false);
    setShowForm(false);
  };

  const handleUpdate = async (data: GtmPlanRequest) => {
    if (!editing) return;
    setSaving(true);
    await dispatch(updatePlan({ id: editing.id, data }));
    setSaving(false);
    setEditing(null);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this plan and all associated KPIs?")) return;
    dispatch(deletePlan(id));
  };

  return (
    <>
      <div className="page-header">
        <Row className="align-items-center">
          <Col>
            <h1>GTM Plans</h1>
            <p>Manage your go-to-market plans across regions and products</p>
          </Col>
          <Col xs="auto">
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              + New Plan
            </Button>
          </Col>
        </Row>
      </div>

      <div className="sap-card">
        <div className="mb-3">
          <InputGroup style={{ maxWidth: 320 }}>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>

        {loading ? (
          <div className="loading-screen">
            <Spinner animation="border" variant="primary" size="sm" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted">
            No plans found.{" "}
            {search ? "Try a different search." : "Create your first GTM plan."}
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table sap-table mb-0">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Region</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Timeline</th>
                  <th>KPIs</th>
                  <th>Owner</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <Link
                        to={`/plans/${plan.id}`}
                        style={{
                          color: "var(--sap-brand)",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        {plan.name}
                      </Link>
                      {plan.description && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--sap-text-muted)",
                          }}
                        >
                          {plan.description.slice(0, 60)}...
                        </div>
                      )}
                    </td>
                    <td>{plan.region}</td>
                    <td style={{ fontSize: "0.8rem" }}>{plan.product}</td>
                    <td>
                      <Badge bg={planStatusVariant(plan.status)}>
                        {plan.status}
                      </Badge>
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {formatCurrency(plan.budget)}
                    </td>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem" }}>
                        {plan.kpiCount}
                      </span>
                      {plan.kpiCount > 0 && (
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--sap-text-muted)",
                          }}
                        >
                          {plan.kpiAchievementRate.toFixed(0)}% OK
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{plan.owner}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => navigate(`/plans/${plan.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setEditing(plan);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <FontAwesomeIcon icon={faXmark} />
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

      <PlanForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
        loading={saving}
        error={error}
      />
    </>
  );
}

function PlanDetail() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: plans } = useAppSelector((s) => s.plans);
  const { items: kpis } = useAppSelector((s) => s.kpis);

  //Get plan ID from URL
  const pathParts = window.location.pathname.split("/");
  const planId = parseInt(pathParts[pathParts.length - 1]);
  const plan = plans.find((p) => p.id === planId);
  const planKpis = kpis.filter((k) => k.planId === planId);

  useEffect(() => {
    if (plans.length === 0) dispatch(fetchPlans());
  }, [dispatch, plans.length]);

  if (!plan)
    return (
      <div className="sap-card">
        <p>
          Plan not found. <Link to="/plans">Back to plans</Link>
        </p>
      </div>
    );

  return (
    <>
      <div className="sap-breadcrumb mb-2">
        <Link to="/plans">GTM Plans</Link> / {plan.name}
      </div>
      <div className="page-header">
        <Row className="align-items-start">
          <Col>
            <h1>{plan.name}</h1>
            {plan.description && <p>{plan.description}</p>}
          </Col>
          <Col xs="auto">
            <Badge
              bg={planStatusVariant(plan.status)}
              style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
            >
              {plan.status}
            </Badge>
          </Col>
        </Row>
      </div>

      <Row className="g-3 mb-3">
        {[
          { label: "Region", value: plan.region },
          { label: "Product", value: plan.product },
          { label: "Budget", value: formatCurrency(plan.budget) },
          { label: "Owner", value: plan.owner },
          { label: "Start", value: formatDate(plan.startDate) },
          { label: "End", value: formatDate(plan.endDate) },
        ].map((f) => (
          <Col key={f.label} xs={6} md={4} lg={2}>
            <div className="kpi-tile">
              <div className="kpi-tile-label">{f.label}</div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {f.value}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div className="sap-card">
        <div className="sap-card-header">
          <h5 className="sap-card-title">KPI Metrics ({planKpis.length})</h5>
          <Link to="/kpis" className="btn btn-sm btn-outline-primary">
            Manage KPIs
          </Link>
        </div>
        {planKpis.length === 0 ? (
          <p className="text-muted mb-0">No KPIs added to this plan yet.</p>
        ) : (
          <table className="table sap-table mb-0">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Category</th>
                <th>Period</th>
                <th>Target</th>
                <th>Actual</th>
                <th>Achievement</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {planKpis.map((kpi) => (
                <tr key={kpi.id}>
                  <td style={{ fontWeight: 500 }}>{kpi.metricName}</td>
                  <td>{kpi.category}</td>
                  <td>{kpi.period}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>
                    {kpi.targetValue.toLocaleString()} {kpi.unit}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>
                    {kpi.actualValue?.toLocaleString() ?? "-"}{" "}
                    {kpi.actualValue ? kpi.unit : ""}
                  </td>
                  <td>
                    {kpi.achievementRate != null ? (
                      <div>
                        <div
                          className="progress"
                          style={{ height: 6, marginBottom: 4 }}
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
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <Badge
                      bg={
                        kpi.status === "ACHIEVED"
                          ? "primary"
                          : kpi.status === "ON_TRACK"
                            ? "success"
                            : kpi.status === "AT_RISK"
                              ? "warning"
                              : "danger"
                      }
                    >
                      {kpi.status.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Button variant="outline-secondary" onClick={() => navigate("/plans")}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Plans
      </Button>
    </>
  );
}

export default function PlansPage() {
  return (
    <Routes>
      <Route path="/" element={<PlansList />} />
      <Route path="/:id" element={<PlanDetail />} />
    </Routes>
  );
}
