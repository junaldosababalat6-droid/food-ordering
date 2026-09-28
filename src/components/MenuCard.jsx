import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, Check, X } from "lucide-react";
import { formatIDR } from "../utils/formatPrice";
import { getLocalizedMenuField } from "../utils/menuLocalization";

export const MenuCard = ({ item }) => {
  const { addToCart, language, t } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);

  const formatPrice = (price) => formatIDR(price);
  const itemName = getLocalizedMenuField(item, "name", language);
  const itemDescription = getLocalizedMenuField(item, "description", language);

  const handleAddToCart = () => {
    if (!item.available) return;
    addToCart(item, quantity, notes);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 1000);
  };

  const closeModal = () => {
    setShowModal(false);
    setAddedFeedback(false);
    setQuantity(1);
    setNotes("");
  };

  return (
    <>
      <div
        className="menu-card"
        onClick={() => item.available && setShowModal(true)}
        style={{ cursor: item.available ? "pointer" : "not-allowed", opacity: item.available ? 1 : 0.7 }}
      >
        <div className="menu-image-container">
          <img src={item.image} alt={itemName} className="menu-image" />
          {!item.available && <span className="sold-out-badge">{t.outOfStock}</span>}
        </div>
        <div className="menu-details">
          <div>
            <div className="menu-header-info">
              <h3 className="menu-title">{itemName}</h3>
              <span className="menu-price">{formatPrice(item.price)}</span>
            </div>
            <p className="menu-desc">{itemDescription}</p>
          </div>
          <button
            className="btn"
            style={{ width: "100%", marginTop: "10px", padding: "8px" }}
            disabled={!item.available}
            onClick={(e) => {
              e.stopPropagation();
              if (item.available) setShowModal(true);
            }}
          >
            <Plus size={16} />
            <span>{t.addToCart}</span>
          </button>
        </div>
      </div>

      {/* Item Customization & Notes Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ position: "relative" }}>
            <button
              type="button"
              aria-label="Close item details"
              title="Close"
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                border: 0,
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.55)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
            <img src={item.image} alt={itemName} className="modal-image" />
            <div className="modal-body">
              <h2 className="modal-title">{itemName}</h2>
              <div className="modal-price">{formatPrice(item.price)}</div>
              <p className="modal-desc">{itemDescription}</p>

              {addedFeedback && (
                <div className="cart-success-message" role="status">
                  <Check size={16} /> {t.itemAdded}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t.specialNotes}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.quantity}</label>
                <div className="quantity-selector">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={closeModal}
                >
                  {t.cancel}
                </button>
                <button
                  className="btn"
                  style={{ flex: 2 }}
                  onClick={handleAddToCart}
                >
                  {addedFeedback ? (
                    <>
                      <Check size={18} /> {t.itemAdded}
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> {t.addToCart} ({formatPrice(item.price * quantity)})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
