import React from "react";
import { MenuList } from "../components/MenuList";
import { BannerSlider } from "../components/BannerSlider";
import { useApp } from "../context/AppContext";
import { Store, Truck, Utensils } from "lucide-react";

export const MenuPage = () => {
  const { tableNumber, orderType, setOrderType, t } = useApp();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t.menu}</h1>
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "6px 12px", borderRadius: "20px", fontWeight: 700, fontSize: "0.9rem" }}>
          {t.tableLabel} {tableNumber}
        </div>
      </div>

      <BannerSlider />

      <div className="service-type-toggle" style={{ marginBottom: "24px" }}>
        <button
          className={`service-btn ${orderType === "dine-in" ? "active" : ""}`}
          onClick={() => setOrderType("dine-in")}
        >
          <Store size={18} /> {t.dineIn}
        </button>
        <button
          className={`service-btn ${orderType === "takeaway" ? "active" : ""}`}
          onClick={() => setOrderType("takeaway")}
        >
          <Truck size={18} /> {t.takeaway}
        </button>
      </div>

      <MenuList />
    </div>
  );
};
