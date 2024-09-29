export function formatCurrency(pricecents) {
  return (Math.round(pricecents) / 100).toFixed(2);
}

export default formatCurrency;