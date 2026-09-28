import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatIDR } from "../utils/formatPrice";
import { ArrowLeft, Search, Package, CheckCircle, Utensils, Truck } from "lucide-react";
import { getLocalizedMenuField, getPaymentMethodLabel } from "../utils/menuLocalization";

export const HistoryPage = () => {
  const { orders, t, language, adminUser, customerName } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("riwayat");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [foundOrder, setFoundOrder] = useState(null);

  const isAdmin = adminUser ? true : false;

const getFilteredOrders = () => {
     if (isAdmin) return orders;
     return orders.filter((o) => o.customerName === customerName);
   };

  const displayedOrders = getFilteredOrders();

  const handleSearch = () => {
    if (!searchOrderId.trim()) return;
    const order = orders.find((o) => o.id === searchOrderId.trim().toUpperCase());
    setFoundOrder(order || null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed": return <span className="status-badge status-completed">{t.completed}</span>;
      case "in-progress": return <span className="status-badge status-in-progress">{t.inProgress}</span>;
      default: return <span className="status-badge status-pending">{t.pending}</span>;
    }
  };

  return (
    <div className="my-orders-container">
      <Link to="/menu" className="btn btn-secondary mb-4" style={{ display: "inline-flex" }}>
        <ArrowLeft size={18} /> {t.backToMenu}
      </Link>

      <h1 className="page-title">
        <Package size={24} /> {t.orders}
      </h1>

      <div className="my-orders-tabs">
        <button
          className={`tab-btn ${activeTab === "riwayat" ? "active" : ""}`}
          onClick={() => setActiveTab("riwayat")}
        >
          {t.history}
        </button>
        <button
          className={`tab-btn ${activeTab === "cari" ? "active" : ""}`}
          onClick={() => setActiveTab("cari")}
        >
          {t.searchOrders}
        </button>
      </div>

      {activeTab === "riwayat" && (
        <div className="summary-card">
          {displayedOrders.length === 0 ? (
            <div className="text-center text-secondary" style={{ padding: "32px" }}>
              <Package size={48} style={{ color: "var(--text-secondary)", marginBottom: "12px" }} />
              <p>
                {isAdmin
                  ? "Belum ada pesanan dari customer."
                  : "Belum ada pesanan. Mulai pesan sekarang!"}
              </p>
            </div>
          ) : (
            <div className="orders-list">
              {displayedOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-card-info">
                      <span className="order-id">{order.id}</span>
                      <span className="order-time">
                        {new Date(order.timestamp).toLocaleString(language === "id" ? "id-ID" : "en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="order-card-right">
                      <span className="order-total">{formatIDR(order.grandTotal)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                  <div className="order-card-body">
                    <div className="order-meta">
                      <span className="order-meta-item">📍 {t.tableLabel} {order.tableNumber}</span>
                      <span className="order-meta-item">👤 {order.customerName}</span>
                      <span className="order-meta-item">🛒 {order.items.length} {order.items.length === 1 ? t.itemSingular : t.itemPlural}</span>
<span className="order-meta-item">💳 {getPaymentMethodLabel(order.paymentMethod, t)}</span>
                       <span className="order-meta-item" style={{ textTransform: "capitalize", background: order.orderType === "dine-in" ? "var(--accent-light)" : "rgba(34, 197, 94, 0.2)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700 }}>
                         {order.orderType === "dine-in" ? <><Utensils size={14} /> {t.dineIn}</> : <><Truck size={14} /> {t.takeaway}</>}
                       </span>
                    </div>
                    <div className="order-items-mini">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="order-item-tag">
                          {item.quantity}x {getLocalizedMenuField(item, "name", language)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "cari" && (
        <div className="summary-card">
          <p className="text-secondary mb-4">{t.enterOrderNumberToTrack}</p>
          <div className="search-box" style={{ position: "relative", marginBottom: "20px" }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="form-input search-input"
              placeholder={t.orderNumberPlaceholder}
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value.toUpperCase())}
              style={{ paddingLeft: "48px" }}
            />
            <button className="btn" style={{ position: "absolute", right: 4, bottom: 4, padding: "10px 20px" }} onClick={handleSearch}>
              {t.search}
            </button>
          </div>

          {foundOrder && (
            <div className="track-order-result">
              <div className="track-order-header">
                <div className="flex items-center gap-2">
                  <span className="track-order-id">{foundOrder.id}</span>
                  {getStatusBadge(foundOrder.status)}
                </div>
              </div>

<div className="track-order-details">
                 <div className="track-order-row">
                   <span className="text-secondary">{t.tableLabel}</span>
                   <span className="fw-bold">{foundOrder.tableNumber}</span>
                 </div>
                 <div className="track-order-row">
                   <span className="text-secondary">{t.customerLabel}</span>
                   <span className="fw-bold">{foundOrder.customerName}</span>
                 </div>
                 <div className="track-order-row">
                   <span className="text-secondary">{t.orderType}</span>
                   <span className="fw-bold" style={{ textTransform: "capitalize" }}>
                     {foundOrder.orderType === "dine-in" ? t.dineIn : t.takeaway}
                   </span>
                 </div>
                 <div className="track-order-row">
                   <span className="text-secondary">{t.itemsLabel}</span>
                   <span className="fw-bold">{foundOrder.items.length} {foundOrder.items.length === 1 ? t.itemSingular : t.itemPlural}</span>
                 </div>
                 <div className="track-order-row">
                   <span className="text-secondary">{t.total}</span>
                   <span className="fw-bold text-accent">{formatIDR(foundOrder.grandTotal)}</span>
                 </div>
               </div>

              <div className="track-order-items">
                <h4 className="fw-bold mb-4">{t.itemsOrdered}</h4>
                {foundOrder.items.map((item, idx) => (
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
                  <div className={`progress-step ${foundOrder.status !== "pending" ? "completed" : "active"}`}>
                    <div className="step-circle">
                      {foundOrder.status !== "pending" ? <CheckCircle size={18} /> : <span>1</span>}
                    </div>
                    <span>{t.pending}</span>
                  </div>
                  <div className="progress-line" style={{ background: foundOrder.status !== "pending" ? "var(--success)" : "var(--border)" }} />
                  <div className={`progress-step ${foundOrder.status === "in-progress" || foundOrder.status === "completed" ? "completed" : "active"}`}>
                    <div className="step-circle">
                      {foundOrder.status === "completed" ? <CheckCircle size={18} /> : <span>2</span>}
                    </div>
                    <span>{t.inProgress}</span>
                  </div>
                  <div className="progress-line" style={{ background: foundOrder.status === "completed" ? "var(--success)" : "var(--border)" }} />
                  <div className={`progress-step ${foundOrder.status === "completed" ? "completed" : "active"}`}>
                    <div className="step-circle">
                      {foundOrder.status === "completed" ? <CheckCircle size={18} /> : <span>3</span>}
                    </div>
                    <span>{t.completed}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
