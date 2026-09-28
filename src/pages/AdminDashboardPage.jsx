import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatIDR } from "../utils/formatPrice";
import { ShoppingBag, TrendingUp, Clock, Download, Trash2, Utensils, Truck } from "lucide-react";
import { getLocalizedMenuField, getPaymentMethodLabel } from "../utils/menuLocalization";

export const AdminDashboardPage = () => {
  const { orders, t, language, updateOrderStatus, deleteOrder, exportToExcel } = useApp();
  const [filterStatus, setFilterStatus] = useState("all");

  const todayOrders = orders.filter((o) => {
    const today = new Date().toDateString();
    return new Date(o.timestamp).toDateString() === today;
  });

  const filteredOrders = filterStatus === "all" ? todayOrders : todayOrders.filter((o) => o.status === filterStatus);

  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  const bestSellers = (() => {
    const itemMap = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        const itemName = getLocalizedMenuField(item, "name", language);
        itemMap[itemName] = (itemMap[itemName] || 0) + item.quantity;
      });
    });
    return Object.entries(itemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  })();

  const maxQty = bestSellers.length > 0 ? bestSellers[0][1] : 1;

  const statusCounts = {
    all: todayOrders.length,
    pending: todayOrders.filter((o) => o.status === "pending").length,
    "in-progress": todayOrders.filter((o) => o.status === "in-progress").length,
    completed: todayOrders.filter((o) => o.status === "completed").length,
  };

  const handleExport = () => {
    const exportData = todayOrders.map((o) => ({
      "Order ID": o.id,
      [t.date]: new Date(o.timestamp).toLocaleString(language === "id" ? "id-ID" : "en-US", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      [t.tableLabel]: o.tableNumber,
      [t.customerLabel]: o.customerName,
      [t.orderType]: o.orderType === "dine-in" ? t.dineIn : t.takeaway,
      [t.itemCount]: o.items.length,
      [t.itemsDetail]: o.items.map((i) => `${i.quantity}x ${getLocalizedMenuField(i, "name", language)}`).join("; "),
      [t.subtotal]: o.subtotal,
      [t.tax]: o.tax,
      [t.serviceFee]: o.serviceFee,
      [t.grandTotal]: o.grandTotal,
      [t.paymentMethod]: getPaymentMethodLabel(o.paymentMethod, t),
      [t.status]: o.status === "in-progress" ? t.inProgress : t[o.status],
    }));
    exportToExcel(exportData, "dashboard_pesanan_hari_ini");
  };

  const handleDelete = (orderId) => {
    if (window.confirm(t.deleteOrderConfirm)) {
      deleteOrder(orderId);
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div>
          <div className="admin-header-title">
            {t.dashboard}
            <span>{t.manageMenu}</span>
          </div>
        </div>
      </div>

      <div className="summary-card">
        <h2 className="section-title">{t.overview}</h2>
        <div className="stats-grid">
          <div className="stat-card hover-lift">
            <div className="stat-icon" style={{ background: "rgba(249, 115, 22, 0.15)" }}>
              <ShoppingBag size={24} style={{ color: "var(--accent)" }} />
            </div>
            <div className="stat-title">{t.totalOrdersToday}</div>
            <div className="stat-value">{todayOrders.length}</div>
          </div>
          <div className="stat-card hover-lift">
            <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.15)" }}>
              <TrendingUp size={24} style={{ color: "var(--success)" }} />
            </div>
            <div className="stat-title">{t.revenueToday}</div>
            <div className="stat-value">{formatIDR(totalRevenue)}</div>
          </div>
          <div className="stat-card hover-lift">
            <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)" }}>
              <Clock size={24} style={{ color: "var(--warning)" }} />
            </div>
            <div className="stat-title">{t.pending}</div>
            <div className="stat-value">{statusCounts.pending}</div>
          </div>
        </div>
      </div>

      <div className="summary-card">
        <h3 className="section-title">{t.bestSellers}</h3>
        {bestSellers.length === 0 ? (
          <p className="text-secondary text-center" style={{ padding: "24px" }}>{t.noOrdersToday}</p>
        ) : (
          <div className="chart-container">
            <div className="bar-chart">
              {bestSellers.map(([name, qty], idx) => (
                <div key={idx} className="bar-row">
                  <div className="bar-label">
                    <span className="bar-rank">{idx + 1}</span>
                    <span className="bar-name">{name}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(qty / maxQty) * 100}%` }}
                    >
                      <span className="bar-value">{qty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="summary-card">
        <div className="flex justify-between items-center mb-4" style={{ flexWrap: "wrap", gap: "8px" }}>
          <h3 className="section-title" style={{ margin: 0 }}>{t.orders}</h3>
          <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={handleExport} style={{ padding: "8px 16px" }}>
              <Download size={16} /> {t.exportExcel}
            </button>
            <button className="btn btn-danger" onClick={() => {
              if (window.confirm(t.deleteAllOrdersConfirm)) {
                todayOrders.forEach((o) => deleteOrder(o.id));
              }
            }} style={{ padding: "8px 16px" }}>
              <Trash2 size={16} /> {t.deleteAll}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4" style={{ flexWrap: "wrap", gap: "8px" }}>
          <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
            {["all", "pending", "in-progress", "completed"].map((status) => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? "active" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status === "all" ? t.all : status === "in-progress" ? t.inProgress : t[status]}
                <span className="filter-count">({statusCounts[status]})</span>
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-secondary" style={{ padding: "24px" }}>{t.noOrdersFound}</p>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
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
                    {getStatusBadge(order.status, t)}
                  </div>
                </div>
                <div className="order-card-body">
<div className="order-meta">
                     <span className="order-meta-item">📍 {t.tableLabel} {order.tableNumber}</span>
                     <span className="order-meta-item">👤 {order.customerName}</span>
                     <span className="order-meta-item">🛒 {order.items.length} {order.items.length === 1 ? t.itemSingular : t.itemPlural}</span>
                     <span className="order-meta-item" style={{ textTransform: "capitalize" }}>
                       💳 {getPaymentMethodLabel(order.paymentMethod, t)}
                     </span>
                     <span className="order-meta-item" style={{ textTransform: "capitalize", background: order.orderType === "dine-in" ? "var(--accent-light)" : "rgba(34, 197, 94, 0.2)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700 }}>
                       {order.orderType === "dine-in" ? <><Utensils size={14} /> {t.dineIn}</> : <><Truck size={14} /> {t.takeaway}</>}
                     </span>
                   </div>
                  <div className="order-items-mini">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="order-item-tag">
                        {item.quantity}x {getLocalizedMenuField(item, "name", language)}
                        {item.notes && ` (${item.notes})`}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="order-card-footer">
                  <select
                    className="form-select"
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                  >
                    <option value="pending">{t.pending}</option>
                    <option value="in-progress">{t.inProgress}</option>
                    <option value="completed">{t.completed}</option>
                  </select>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                    onClick={() => handleDelete(order.id)}
                  >
                    <Trash2 size={14} /> {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusBadge = (status, t) => {
  switch (status) {
    case "completed": return <span className="status-badge status-completed">{t.completed}</span>;
    case "in-progress": return <span className="status-badge status-in-progress">{t.inProgress}</span>;
    default: return <span className="status-badge status-pending">{t.pending}</span>;
  }
};
