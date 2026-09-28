import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { CartItem } from "../components/CartItem";
import { ShoppingBag, ArrowRight, ArrowLeft, Utensils, Truck } from "lucide-react";
import { formatIDR } from "../utils/formatPrice";

export const CartPage = () => {
  const { cart, orderType, setOrderType, t } = useApp();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const serviceFee = subtotal * 0.05;
  const grandTotal = subtotal + tax + serviceFee;

  if (cart.length === 0) {
    return (
      <div className="cart-container text-center" style={{ padding: "60px 20px" }}>
        <ShoppingBag size={64} style={{ color: "var(--text-secondary)", marginBottom: "16px" }} />
        <h2>{t.emptyCart}</h2>
        <p className="text-secondary" style={{ margin: "10px 0 24px" }}>
          {t.exploreMenu}
        </p>
        <Link to="/menu" className="btn">
          <ArrowLeft size={18} /> {t.backToMenu}
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="page-title">
        <ShoppingBag /> {t.cart}
      </h1>

      <div>
        {cart.map((item, index) => (
          <CartItem key={`${item.id}-${index}`} item={item} index={index} />
        ))}
      </div>

      <div className="service-type-toggle" style={{ marginBottom: "24px" }}>
        <button
          className={`service-btn ${orderType === "dine-in" ? "active" : ""}`}
          onClick={() => setOrderType("dine-in")}
        >
          <Utensils size={18} /> {t.dineIn}
        </button>
        <button
          className={`service-btn ${orderType === "takeaway" ? "active" : ""}`}
          onClick={() => setOrderType("takeaway")}
        >
          <Truck size={18} /> {t.takeaway}
        </button>
      </div>

      <div className="summary-card">
        <div className="summary-row">
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

      <div className="flex gap-2 mt-4" style={{ justifyContent: "space-between" }}>
        <Link to="/menu" className="btn btn-secondary">
          <ArrowLeft size={18} /> {t.backToMenu}
        </Link>
        <button className="btn" onClick={() => navigate("/checkout")}>
          {t.proceedCheckout} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
