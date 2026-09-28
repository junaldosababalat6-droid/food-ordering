export const getLocalizedMenuField = (item, field, language) => {
  const localizedField = `${field}${language === "id" ? "Id" : "En"}`;
  return item?.[localizedField] || item?.[field] || "";
};

export const getPaymentMethodLabel = (paymentMethod, t) => {
  if (paymentMethod === "cash") return t.cash;
  if (paymentMethod === "transfer") return t.bankTransfer;
  return "QRIS";
};