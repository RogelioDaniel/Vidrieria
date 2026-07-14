// Shared quote calculation logic — used by /api/quotes and /api/quotes/calculate

export function computeQuote(opts: {
  pricePerM2: number;
  widthCm: number;
  heightCm: number;
  finish: string;
}): { areaM2: number; base: number; finishMultiplier: number; total: number } {
  const areaM2 = (opts.widthCm * opts.heightCm) / 10000;
  const base = areaM2 * opts.pricePerM2;
  const finishMap: Record<string, number> = {
    Incoloro: 1.0,
    Bronce: 1.15,
    Esmerilado: 1.2,
    "Cobre envejecido": 1.35,
    Templado: 1.3,
  };
  const finishMultiplier = finishMap[opts.finish] ?? 1.0;
  const total = Math.round((base * finishMultiplier) / 10) * 10;
  return { areaM2, base, finishMultiplier, total };
}

export function formatMXN(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}
