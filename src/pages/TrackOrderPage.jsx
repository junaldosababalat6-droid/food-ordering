import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Search, ArrowLeft, Clock, Package, CheckCircle } from "lucide-react";
import { formatIDR } from "../utils/formatPrice";
import { getLocalizedMenuField, getPaymentMethodLabel } from "../utils/menuLocalization";

export const TrackOrderPage = () => {
  const { orders, t, language } = useApp();
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState("");
  const [found, setFound] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const order = orders.find((o) => o.id === orderId.trim().toUpperCase());
    if (order) {
      setFound(order);
    } else {
      setFound(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="status-badge status-completed">{t.completed}</span>;
      case "in-progress":
        return <span className="status-badge status-in-progress">{t.inProgress}</span>;
      default:
        return <span className="status-badge status-pending">{t.pending}</span>;
    }
  };

  return (
    <div className="track-order-container">
      <Link to="/menu" className="btn btn-secondary mb-4" style={{ display: "inline-flex" }}>
        <ArrowLeft size={18} /> {t.backToMenu}
      </Link>

      <h1 className="page-title">
        <Package size={24} /> {t.trackOrder}
      </h1>

      <div className="summary-card mb-4">
        <p className="text-secondary mb-4">
          {t.enterOrderNumber}
        </p>
        <form onSubmit={handleSearch} className="search-box" style={{ position: "relative" }}>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="form-input search-input"
            placeholder={t.orderNumberPlaceholder}
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            required
            style={{ paddingLeft: "48px", fontSize: "1.1rem" }}
          />
          <button type="submit" className="btn" style={{ position: "absolute", right: 4, bottom: 4, padding: "10px 20px" }}>
            {t.searchMenu}
          </button>
        </form>
      </div>

      {found && (
        <div className="summary-card">
          <div className="track-order-header">
            <div className="flex items-center gap-2">
              <span className="track-order-id">{found.id}</span>
              {getStatusBadge(found.status)}
            </div>
            <div className="track-order-time">
              <Clock size={16} />{" "}
              {new Date(found.timestamp).toLocaleString(language === "id" ? "id-ID" : "en-US", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
          </div>

          <div className="track-order-details">
            <div className="track-order-row">
              <span className="text-secondary">{t.tableLabel}</span>
              <span className="fw-bold">{found.tableNumber}</span>
            </div>
            <div className="track-order-row">
              <span className="text-secondary">{t.customerLabel}</span>
              <span className="fw-bold">{found.customerName}</span>
            </div>
            <div className="track-order-row">
              <span className="text-secondary">{t.itemsLabel}</span>
              <span className="fw-bold">{found.items.length} {found.items.length === 1 ? t.itemSingular : t.itemPlural}</span>
            </div>
            <div className="track-order-row">
              <span className="text-secondary">{t.paymentLabel}</span>
              <span className="fw-bold">{getPaymentMethodLabel(found.paymentMethod, t)}</span>
            </div>
            <div className="track-order-row" style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "8px" }}>
              <span className="text-secondary">{t.total}</span>
              <span className="fw-bold text-accent">{formatIDR(found.grandTotal)}</span>
            </div>
          </div>

          <div className="track-order-items">
            <h4 className="fw-bold mb-4">{t.itemsOrdered}</h4>
            {found.items.map((item, idx) => (
              <div key={idx} className="flex justify-between mb-4" style={{ fontSize: "0.95rem" }}>
                <div>
                  <span className="fw-bold">{item.quantity}x</span> {getLocalizedMenuField(item, "name", language)}
                  {item.notes && <div className="text-secondary" style={{ fontSize: "0.85rem" }}>{t.noteLabel}: {item.notes}</div>}
                </div>
                <span className="fw-bold">{formatIDR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="track-order-progress">
            <h4 className="fw-bold mb-4">{t.status}</h4>
            <div className="progress-steps">
              <div className={`progress-step ${found.status !== "pending" ? "completed" : "active"}`}>
                <div className="step-circle">
                  {found.status !== "pending" ? <CheckCircle size={18} /> : <span>1</span>}
                </div>
                <span>{t.pending}</span>
              </div>
              <div className="progress-line" style={{ background: found.status !== "pending" ? "var(--success)" : "var(--border)" }} />
              <div className={`progress-step ${found.status === "in-progress" || found.status === "completed" ? "completed" : "active"}`}>
                <div className="step-circle">
                  {found.status === "completed" ? <CheckCircle size={18} /> : <span>2</span>}
                </div>
                <span>{t.inProgress}</span>
              </div>
              <div className="progress-line" style={{ background: found.status === "completed" ? "var(--success)" : "var(--border)" }} />
              <div className={`progress-step ${found.status === "completed" ? "completed" : "active"}`}>
                <div className="step-circle">
                  {found.status === "completed" ? <CheckCircle size={18} /> : <span>3</span>}
                </div>
                <span>{t.completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
