export const formatCurrency = (num) => {
  return parseFloat(
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num).replace(/,/g, "")
  );
};
