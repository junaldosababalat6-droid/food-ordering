import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { MenuCard } from "./MenuCard";
import { SearchBar } from "./SearchBar";
import { getLocalizedMenuField } from "../utils/menuLocalization";

export const MenuList = () => {
  const { menuItems, categories, language, t } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems = menuItems.filter((item) => {
    const itemName = getLocalizedMenuField(item, "name", language);
    const itemDescription = getLocalizedMenuField(item, "description", language);
    const matchesSearch =
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="search-filter-bar">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          {t.allCategories}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {language === "id" ? cat.nameId : cat.nameEn}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          <p>{t.noMenuItemsFound}</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
