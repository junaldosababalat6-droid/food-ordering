import React from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { CheckCircle, Clock, Utensils, Truck, ArrowLeft } from "lucide-react";
import { formatIDR } from "../utils/formatPrice";
import { getLocalizedMenuField, getPaymentMethodLabel } from "../utils/menuLocalization";

export const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { orders, lastOrder, language, t } = useApp();

  const currentOrder = orders.find((o) => o.id === orderId) || lastOrder;

  if (!currentOrder) {
    return (
      <div className="text-center" style={{ padding: "60px 20px" }}>
        <h2>{t.orderNotFound}</h2>
        <Link to="/menu" className="btn mt-4">
          <ArrowLeft size={18} /> {t.backToMenu}
        </Link>
      </div>
    );
  }

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
    <div className="confirmation-container">
      <div className="success-banner">
        <CheckCircle size={54} className="success-icon" />
        <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{t.orderConfirmed}</h1>
        <p style={{ opacity: 0.9 }}>{t.thankYouOrdering} {t.appName}!</p>
      </div>

      <div className="summary-card mb-4">
        <div className="flex justify-between items-center mb-4" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
          <div>
            <div className="text-secondary" style={{ fontSize: "0.85rem" }}>{t.orderNumber}</div>
            <div className="fw-bold text-accent" style={{ fontSize: "1.3rem" }}>{currentOrder.id}</div>
          </div>
          <div>
            <div className="text-secondary" style={{ fontSize: "0.85rem" }}>{t.status}</div>
            {getStatusBadge(currentOrder.status)}
          </div>
        </div>

<div className="flex items-center gap-2 mb-4" style={{ background: "var(--bg-primary)", padding: "12px", borderRadius: "8px" }}>
           <Clock size={20} className="text-accent" />
           <div>
             <div className="fw-bold" style={{ fontSize: "0.95rem" }}>{t.estimatedTime}: 15-20 mins</div>
             <div className="text-secondary" style={{ fontSize: "0.85rem" }}>{t.tableLabel} {currentOrder.tableNumber} • {t.customerLabel}: {currentOrder.customerName}</div>
             <div className="text-secondary" style={{ fontSize: "0.85rem" }}>
               {currentOrder.orderType === "dine-in" ? <><Utensils size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> {t.dineIn}</> : <><Truck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> {t.takeaway}</>}
             </div>
           </div>
         </div>

        <h4 className="fw-bold mb-4">{t.itemsOrdered}</h4>
        {currentOrder.items.map((item, idx) => (
          <div key={idx} className="flex justify-between mb-4" style={{ fontSize: "0.95rem" }}>
            <div>
              <span className="fw-bold">{item.quantity}x</span> {getLocalizedMenuField(item, "name", language)}
              {item.notes && <div className="text-secondary" style={{ fontSize: "0.85rem" }}>{t.noteLabel}: {item.notes}</div>}
            </div>
<span className="fw-bold">{formatIDR(item.price * item.quantity)}</span>
        </div>
        ))}

<div className="summary-row" style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px" }}>
           <span>{t.paymentMethod}</span>
           <span style={{ fontWeight: 700 }}>{getPaymentMethodLabel(currentOrder.paymentMethod, t)}</span>
         </div>
         <div className="summary-row">
           <span>{t.orderType || "Service Type"}</span>
           <span style={{ textTransform: "capitalize", fontWeight: 700 }}>
             {currentOrder.orderType === "dine-in" ? t.dineIn : t.takeaway}
           </span>
         </div>
         <div className="summary-row total">
           <span>{t.grandTotal}</span>
           <span className="text-accent">{formatIDR(currentOrder.grandTotal)}</span>
         </div>
      </div>

      <div className="text-center">
        <Link to="/menu" className="btn" style={{ padding: "14px 28px" }}>
          <Utensils size={18} /> {t.orderMoreItems}
        </Link>
      </div>
    </div>
  );
};
