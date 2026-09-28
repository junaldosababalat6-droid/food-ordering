import React, { createContext, useContext, useState, useEffect } from "react";
import { initialMenuItems, initialCategories, initialOrders } from "../data/initialData";
import { translations } from "../translations/translations";

const restoreMenuTranslations = (item) => {
  const initialItem = initialMenuItems.find((menuItem) => menuItem.id === item.id);
  return {
    ...initialItem,
    ...item,
    nameEn: item.nameEn || initialItem?.nameEn || item.name,
    nameId: item.nameId || initialItem?.nameId || item.name,
    descriptionEn: item.descriptionEn || initialItem?.descriptionEn || item.description,
    descriptionId: item.descriptionId || initialItem?.descriptionId || item.description,
  };
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Language State
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("bite_dash_lang") || "en";
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("bite_dash_lang", lang);
  };

  // Theme State
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("bite_dash_theme") || "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    localStorage.setItem("bite_dash_theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Table Number State
  const [tableNumber, setTableNumberState] = useState(() => {
    return localStorage.getItem("bite_dash_table") || "1";
  });

  const setTableNumber = (num) => {
    setTableNumberState(num);
    localStorage.setItem("bite_dash_table", num);
  };

  // Order Type State (dine-in / takeaway)
  const [orderType, setOrderType] = useState(() => {
    return localStorage.getItem("bite_dash_order_type") || "dine-in";
  });

  // Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("bite_dash_cart");
    return saved ? JSON.parse(saved).map(restoreMenuTranslations) : [];
  });

  useEffect(() => {
    localStorage.setItem("bite_dash_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1, notes = "") => {
    setCart((prevCart) => {
      // Check if exact same item + notes exists
      const existingIndex = prevCart.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.notes === notes
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { ...item, quantity, notes }];
      }
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const updateCartNotes = (index, notes) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated[index].notes = notes;
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Menu Items State
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem("bite_dash_menu");
    return saved ? JSON.parse(saved).map(restoreMenuTranslations) : initialMenuItems;
  });

  useEffect(() => {
    localStorage.setItem("bite_dash_menu", JSON.stringify(menuItems));
  }, [menuItems]);

  // Categories State
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("bite_dash_categories");
    return saved ? JSON.parse(saved) : initialCategories;
  });

  useEffect(() => {
    localStorage.setItem("bite_dash_categories", JSON.stringify(categories));
  }, [categories]);

  // Orders State
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("bite_dash_orders");
    const savedOrders = saved ? JSON.parse(saved) : initialOrders;
    return savedOrders.map((order) => ({
      ...order,
      items: order.items.map(restoreMenuTranslations),
    }));
  });

  useEffect(() => {
    localStorage.setItem("bite_dash_orders", JSON.stringify(orders));
  }, [orders]);

  // Admin User State
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("bite_dash_admin");
    return saved ? JSON.parse(saved) : null;
  });

  // Current Customer Name State
  const [customerName, setCustomerNameState] = useState(() => {
    return localStorage.getItem("bite_dash_customer_name") || "";
  });

  const setCustomerName = (name) => {
    setCustomerNameState(name);
    localStorage.setItem("bite_dash_customer_name", name);
  };

  const loginAdmin = (username, password) => {
    if (username === "group13" && password === "group13") {
      const user = { username };
      setAdminUser(user);
      localStorage.setItem("bite_dash_admin", JSON.stringify(user));
      return { success: true };
    }
    return { success: false, message: translations[language].loginError };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem("bite_dash_admin");
  };

  // Delete Order
  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Export to Excel (CSV)
  const exportToExcel = (data, filename = "orders_export") => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Place Order
  const [lastOrder, setLastOrder] = useState(() => {
    const savedOrderId = localStorage.getItem("bite_dash_last_order");
    return orders.find((order) => order.id === savedOrderId) || null;
  });

const placeOrder = (orderDetails) => {
     const newOrder = {
       id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
       tableNumber: orderDetails.tableNumber || tableNumber,
       customerName: orderDetails.customerName || "Guest",
       orderType: orderType,
       items: [...cart],
       subtotal: orderDetails.subtotal,
       tax: orderDetails.tax,
       serviceFee: orderDetails.serviceFee,
       grandTotal: orderDetails.grandTotal,
       paymentMethod: orderDetails.paymentMethod,
       status: "pending",
       timestamp: new Date().toISOString()
     };

    setOrders((prev) => [newOrder, ...prev]);
    setLastOrder(newOrder);
    localStorage.setItem("bite_dash_last_order", newOrder.id);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  // Menu CRUD
  const addMenuItem = (itemData) => {
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      name: itemData.nameEn || itemData.nameId || itemData.name || "",
      description: itemData.descriptionEn || itemData.descriptionId || itemData.description || "",
      price: Number(itemData.price),
      available: true
    };
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const updateMenuItem = (id, itemData) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? {
        ...item,
        ...itemData,
        name: itemData.nameEn || itemData.nameId || itemData.name || "",
        description: itemData.descriptionEn || itemData.descriptionId || itemData.description || "",
        price: Number(itemData.price),
      } : item))
    );
  };

  const deleteMenuItem = (id) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleMenuAvailability = (id) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item))
    );
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        setOrderType,
        orderType,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartNotes,
        clearCart,
        menuItems,
        categories,
        orders,
        adminUser,
        loginAdmin,
        logoutAdmin,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        exportToExcel,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuAvailability,
        lastOrder,
        setLastOrder,
        t
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
