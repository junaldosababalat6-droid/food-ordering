import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DarkModeToggle } from "./DarkModeToggle";
import { Utensils, ShoppingBag, LogOut, Clock } from "lucide-react";

export const Navbar = () => {
  const { cart, adminUser, t, lastOrder, logoutAdmin } = useApp();
  const location = useLocation();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const statusPath = lastOrder ? `/order-confirmation/${lastOrder.id}` : "/history";

  return (
    <nav className="navbar">
      <Link to={isAdminRoute ? "/admin/dashboard" : "/menu"} className="nav-brand">
        <Utensils size={24} />
        <span>{t.appName}</span>
      </Link>

      <div className="nav-links">
        {!isAdminRoute && (
          <>
          <Link
            to="/menu"
            className={`nav-link ${location.pathname === "/menu" ? "active" : ""}`}
          >
            {t.menu}
          </Link>
          <Link
            to="/cart"
            className={`nav-link ${location.pathname === "/cart" ? "active" : ""}`}
          >
            <ShoppingBag size={18} />
            <span>{t.cart}</span>
            {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
          </Link>
          <Link
            to={statusPath}
            className={`nav-link ${location.pathname.startsWith("/order-confirmation") || location.pathname === "/history" ? "active" : ""}`}
          >
            <Clock size={18} />
            <span>{t.status}</span>
          </Link>
          </>
        )}

        {isAdminRoute && adminUser && (
          <>
            <Link
              to="/admin/dashboard"
              className={`nav-link ${location.pathname === "/admin/dashboard" ? "active" : ""}`}
            >
              {t.dashboard}
            </Link>
            <Link
              to="/admin/menu"
              className={`nav-link ${location.pathname === "/admin/menu" ? "active" : ""}`}
            >
              {t.manageMenu}
            </Link>
          </>
        )}
      </div>

      <div className="nav-controls">
        {isAdminRoute && adminUser ? (
          <>
            <LanguageSwitcher />
            <DarkModeToggle />
            <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "0.85rem" }} onClick={() => logoutAdmin()}>
              <LogOut size={16} /> {t.logout}
            </button>
          </>
        ) : (
          <>
            <LanguageSwitcher />
            <DarkModeToggle />
          </>
        )}
      </div>
    </nav>
  );
};
