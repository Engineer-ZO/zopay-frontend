export function formatCurrency(
  amount: number,
  currency: string = "XOF",
  locale: string = "fr-FR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
