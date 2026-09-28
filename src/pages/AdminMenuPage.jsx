import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, Edit2, Save, X, ToggleLeft, ToggleRight } from "lucide-react";
import { formatIDR } from "../utils/formatPrice";
import { getLocalizedMenuField } from "../utils/menuLocalization";

export const AdminMenuPage = () => {
  const {
    menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem,
    toggleMenuAvailability, language, t
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nameEn: "", nameId: "", descriptionEn: "", descriptionId: "", price: "", category: "", image: ""
  });

  const resetForm = () => {
    setFormData({ nameEn: "", nameId: "", descriptionEn: "", descriptionId: "", price: "", category: "", image: "" });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nameEn: item.nameEn || item.name,
      nameId: item.nameId || item.name,
      descriptionEn: item.descriptionEn || item.description,
      descriptionId: item.descriptionId || item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nameEn.trim() || !formData.nameId.trim() || !formData.descriptionEn.trim() || !formData.descriptionId.trim() || !formData.price || !formData.category) return;

    if (editingItem) {
      updateMenuItem(editingItem.id, formData);
    } else {
      addMenuItem(formData);
    }
    resetForm();
  };

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div>
          <div className="admin-header-title">
            {t.manageMenu}
            <span>{t.menuManagement}</span>
          </div>
        </div>
        <button
          className="btn"
          onClick={() => {
            setEditingItem(null);
            setFormData({ nameEn: "", nameId: "", descriptionEn: "", descriptionId: "", price: "", category: "", image: "" });
            setShowForm(true);
          }}
        >
          <Plus size={18} /> {t.addItem}
        </button>
      </div>

      {showForm && (
        <div className="summary-card mb-4">
          <h3 className="fw-bold mb-4">{editingItem ? t.editItem : t.addItem}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">{t.nameEnglish}</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.nameIndonesian}</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.nameId}
                  onChange={(e) => setFormData({ ...formData, nameId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.price}</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.category}</label>
                <select
                  className="form-select"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="" disabled>{t.selectCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === "id" ? cat.nameId : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t.imageUrl}</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group mt-4">
              <label className="form-label">{t.descriptionEnglish}</label>
              <textarea
                className="form-textarea"
                rows="3"
                required
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.descriptionIndonesian}</label>
              <textarea
                className="form-textarea"
                rows="3"
                required
                value={formData.descriptionId}
                onChange={(e) => setFormData({ ...formData, descriptionId: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn">
                <Save size={18} /> {t.save}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <X size={18} /> {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="summary-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.image}</th>
                <th>{t.name}</th>
                <th>{t.category}</th>
                <th>{t.price}</th>
                <th>{t.status}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-secondary">{t.emptyMenu}</td>
                </tr>
              )}
              {menuItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img src={item.image} alt={getLocalizedMenuField(item, "name", language)} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />
                  </td>
                  <td className="fw-bold">{getLocalizedMenuField(item, "name", language)}</td>
                  <td>
                    {(language === "id" ? categories.find(c => c.id === item.category)?.nameId : categories.find(c => c.id === item.category)?.nameEn) || item.category}
                  </td>
                  <td className="fw-bold">{formatIDR(item.price)}</td>
                  <td>
                    <button
                      onClick={() => toggleMenuAvailability(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      {item.available ? (
                        <span style={{ color: "var(--success)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <ToggleRight size={22} /> {t.available}
                        </span>
                      ) : (
                        <span style={{ color: "var(--danger)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <ToggleLeft size={22} /> {t.soldOut}
                        </span>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="icon-btn" onClick={() => handleEdit(item)} title={t.edit}>
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                        onClick={() => { if (window.confirm(t.deleteItemConfirm)) deleteMenuItem(item.id) }}
                        title={t.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
