import React from "react";
import { useApp } from "../context/AppContext";
import { Search } from "lucide-react";

export const SearchBar = ({ searchTerm, setSearchTerm }) => {
  const { t } = useApp();

  return (
    <div className="search-box">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        className="form-input search-input"
        placeholder={t.searchMenu}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};
