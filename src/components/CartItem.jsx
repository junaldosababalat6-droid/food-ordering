import React from "react";
import { useApp } from "../context/AppContext";
import { Trash2 } from "lucide-react";
import { formatIDR } from "../utils/formatPrice";
import { getLocalizedMenuField } from "../utils/menuLocalization";

export const CartItem = ({ item, index }) => {
  const { updateCartQuantity, updateCartNotes, removeFromCart, language, t } = useApp();
  const itemName = getLocalizedMenuField(item, "name", language);

  return (
    <div className="cart-item-card">
      <div className="cart-item-info">
        <h4 className="cart-item-title">{itemName}</h4>
        <label className="form-label" htmlFor={`cart-note-${item.id}-${index}`}>
          {t.specialNotes}
        </label>
        <input
          id={`cart-note-${item.id}-${index}`}
          type="text"
          className="form-input"
          placeholder={t.notesPlaceholder}
          value={item.notes || ""}
          onChange={(e) => updateCartNotes(index, e.target.value)}
          style={{ marginTop: "4px" }}
        />
        <div className="cart-item-price">{formatIDR(item.price * item.quantity)}</div>
      </div>
      <div className="cart-item-controls">
        <div className="quantity-selector" style={{ marginBottom: 0 }}>
          <button
            className="qty-btn"
            style={{ width: "28px", height: "28px", fontSize: "1rem" }}
            onClick={() => updateCartQuantity(index, item.quantity - 1)}
          >
            -
          </button>
          <span className="qty-value" style={{ fontSize: "0.95rem" }}>{item.quantity}</span>
          <button
            className="qty-btn"
            style={{ width: "28px", height: "28px", fontSize: "1rem" }}
            onClick={() => updateCartQuantity(index, item.quantity + 1)}
          >
            +
          </button>
        </div>
        <button
          className="icon-btn"
          title={t.delete}
          style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
          onClick={() => removeFromCart(index)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
