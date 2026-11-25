// Fetches today's intraday data for 7 Asian indices from Yahoo Finance.
// Runs on Netlify's servers because browsers can't call Yahoo directly (CORS).
const SYMBOLS = ["^STI", "^HSI", "^SET.BK", "^JKSE", "^N225", "^KS11", "^KLSE"];

async function get(host, sym) {
  const url = `https://${host}/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=5m`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (index-board)" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).chart.result[0];
}

async function one(sym) {
  // Try Yahoo's second host if the first refuses or rate-limits.
  const res = await get("query1.finance.yahoo.com", sym).catch(() => get("query2.finance.yahoo.com", sym));
  const m = res.meta, ts = res.timestamp || [], cl = (res.indicators.quote[0] || {}).close || [];
  const points = [];
  ts.forEach((t, i) => { if (cl[i] != null) points.push([t, Math.round(cl[i] * 100) / 100]); });
  const p = m.currentTradingPeriod || {};
  return {
    sym, price: m.regularMarketPrice, prev: m.chartPreviousClose ?? m.previousClose,
    high: m.regularMarketDayHigh, low: m.regularMarketDayLow, time: m.regularMarketTime,
    tz: m.exchangeTimezoneName, open: p.regular?.start, close: p.regular?.end, points,
  };
}

export default async () => {
  const out = await Promise.all(SYMBOLS.map(s => one(s).catch(e => ({ sym: s, error: String(e.message || e) }))));
  return new Response(JSON.stringify({ fetched: Math.floor(Date.now() / 1000), indices: out }), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
  });
};

export const config = { path: "/api/indices" };
