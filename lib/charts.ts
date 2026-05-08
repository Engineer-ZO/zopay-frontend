// Chart utilities
// This would typically use a library like 'recharts', 'chart.js', or 'visx'

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export function prepareChartData(
  data: ChartDataPoint[]
): { labels: string[]; values: number[] } {
  return {
    labels: data.map((point) => point.label),
    values: data.map((point) => point.value),
  };
}

export function formatChartValue(value: number, format: "currency" | "number" = "number"): string {
  if (format === "currency") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(value);
  }
  return value.toLocaleString();
}
