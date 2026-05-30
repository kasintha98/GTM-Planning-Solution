import { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Button, Alert } from "react-bootstrap";
import type { GtmPlan, GtmPlanRequest, PlanStatus } from "../../types";
import { REGIONS, PRODUCTS } from "../../utils";

interface Props {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: GtmPlanRequest) => void;
  initial?: GtmPlan | null;
  loading?: boolean;
  error?: string | null;
}

const STATUS_OPTIONS: PlanStatus[] = [
  "DRAFT",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
];

const empty: GtmPlanRequest = {
  name: "",
  description: "",
  region: "",
  product: "",
  status: "DRAFT",
  budget: 0,
  startDate: "",
  endDate: "",
  owner: "",
};

//PlanForm is a controlled modal form used for creating and editing GTM plans
export default function PlanForm({
  show,
  onHide,
  onSubmit,
  initial,
  loading,
  error,
}: Props) {
  const [form, setForm] = useState<GtmPlanRequest>(empty);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description ?? "",
        region: initial.region,
        product: initial.product,
        status: initial.status,
        budget: initial.budget,
        startDate: initial.startDate,
        endDate: initial.endDate,
        owner: initial.owner,
      });
    } else {
      setForm(empty);
    }
    setValidated(false);
  }, [initial, show]);

  const set = (field: keyof GtmPlanRequest, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    if (!el.checkValidity()) {
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
            {initial ? "Edit GTM Plan" : "New GTM Plan"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="sap-form-label">Plan Name *</Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Example: Hildesheim Cloud Growth 2026"
                />
                <Form.Control.Feedback type="invalid">
                  Name is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="sap-form-label">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the plan objectives..."
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">Region *</Form.Label>
                <Form.Select
                  required
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                >
                  <option value="">Select region...</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Region is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">Product *</Form.Label>
                <Form.Select
                  required
                  value={form.product}
                  onChange={(e) => set("product", e.target.value)}
                >
                  <option value="">Select product...</option>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Product is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">Status</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as PlanStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">
                  Budget (EUR) *
                </Form.Label>
                <Form.Control
                  required
                  type="number"
                  min={1}
                  value={form.budget}
                  onChange={(e) => set("budget", parseFloat(e.target.value))}
                  placeholder="500000"
                />
                <Form.Control.Feedback type="invalid">
                  Valid budget required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">Start Date *</Form.Label>
                <Form.Control
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Start date required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="sap-form-label">End Date *</Form.Label>
                <Form.Control
                  required
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  End date required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="sap-form-label">Owner *</Form.Label>
                <Form.Control
                  required
                  value={form.owner}
                  onChange={(e) => set("owner", e.target.value)}
                  placeholder="Example: Lionel Messi"
                />
                <Form.Control.Feedback type="invalid">
                  Owner is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : initial ? "Update Plan" : "Create Plan"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

