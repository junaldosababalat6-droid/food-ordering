import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ArrowLeft, CreditCard, Banknote, QrCode } from "lucide-react";
import { formatIDR } from "../utils/formatPrice";
import { getLocalizedMenuField } from "../utils/menuLocalization";

export const CheckoutPage = () => {
  const { cart, tableNumber, orderType, placeOrder, customerName, setCustomerName, language, t } = useApp();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const serviceFee = subtotal * 0.05;
  const grandTotal = subtotal + tax + serviceFee;

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
const newOrder = placeOrder({
         customerName: customerName.trim() || "Guest",
         tableNumber,
         orderType,
         subtotal,
         tax,
         serviceFee,
         grandTotal,
         paymentMethod
       });

      setIsSubmitting(false);
      navigate(`/order-confirmation/${newOrder.id}`);
    }, 1200);
  };

  return (
    <div className="checkout-container">
      <Link to="/cart" className="btn btn-secondary mb-4" style={{ display: "inline-flex" }}>
        <ArrowLeft size={18} /> {t.cart}
      </Link>

      <h1 className="page-title">{t.checkout}</h1>

      <form onSubmit={handleSubmit}>
        <div className="summary-card mb-4">
          <h3 className="fw-bold mb-4">{t.customerDetails}</h3>
          <div className="form-group">
            <label className="form-label">{t.customerName}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t.namePlaceholder}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t.tableNumber}</label>
            <input
              type="text"
              className="form-input"
              value={`${t.tableLabel} ${tableNumber}`}
              disabled
              style={{ fontWeight: 700 }}
            />
          </div>
        </div>

        <div className="summary-card mb-4">
          <h3 className="fw-bold mb-4">{t.paymentMethod}</h3>
          <div className="payment-methods">
            <div
              className={`payment-card ${paymentMethod === "qris" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("qris")}
            >
              <QrCode size={32} style={{ color: "var(--accent)", marginBottom: "8px" }} />
              <h4>QRIS</h4>
              <p>{t.qris}</p>
            </div>

            <div
              className={`payment-card ${paymentMethod === "cash" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("cash")}
            >
              <Banknote size={32} style={{ color: "var(--accent)", marginBottom: "8px" }} />
              <h4>{t.cash}</h4>
              <p>{t.cashAtCounter}</p>
            </div>

            <div
              className={`payment-card ${paymentMethod === "transfer" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("transfer")}
            >
              <CreditCard size={32} style={{ color: "var(--accent)", marginBottom: "8px" }} />
              <h4>{t.bankTransfer}</h4>
              <p>{t.virtualAccountBank}</p>
            </div>
          </div>
        </div>

        <div className="summary-card mb-4">
          <h3 className="fw-bold mb-4">{t.orderSummary} ({cart.length} {t.itemsLabel.toLowerCase()})</h3>
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between mb-4" style={{ fontSize: "0.95rem" }}>
              <div>
                <span className="fw-bold">{item.quantity}x</span> {getLocalizedMenuField(item, "name", language)}
                {item.notes && <div className="text-secondary" style={{ fontSize: "0.85rem" }}>{t.noteLabel}: {item.notes}</div>}
              </div>
              <span className="fw-bold">{formatIDR(item.price * item.quantity)}</span>
            </div>
          ))}

          <div className="summary-row" style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px" }}>
            <span>{t.subtotal}</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>{t.tax}</span>
            <span>{formatIDR(tax)}</span>
          </div>
          <div className="summary-row">
            <span>{t.serviceFee}</span>
            <span>{formatIDR(serviceFee)}</span>
          </div>
          <div className="summary-row total">
            <span>{t.grandTotal}</span>
            <span className="text-accent">{formatIDR(grandTotal)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn"
          style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? t.processingOrder : `${t.placeOrder} (${formatIDR(grandTotal)})`}
        </button>
      </form>
    </div>
  );
};
