// One way to show money everywhere, so amounts always read the same.
//   money(1254)      -> $1,254.00   exact amounts: invoice and quote totals, line items, a customer's balance
//   moneyWhole(1254) -> $1,254      overview numbers: stat strips, charts

export function money(n: unknown) {
  return '$' + (Number(n) || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function moneyWhole(n: unknown) {
  return '$' + Math.round(Number(n) || 0).toLocaleString('en-AU')
}
