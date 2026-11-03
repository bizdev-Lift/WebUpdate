/* GET /api/fedex-fuel
   Returns the FedEx Ground fuel surcharge for the current week, read from
   fedex.com/en-us/shipping/fuel-surcharge.html, e.g.
   {"pct":29.25,"week":"Nov. 2 – Nov. 8, 2026","from":"2026-11-02","to":"2026-11-08","source":"..."}
   Cached at the edge for 6 hours. On any failure it returns 502 and the
   calculator keeps the figure built into assets/js/shipping-calculator.js. */

const SOURCE = "https://www.fedex.com/en-us/shipping/fuel-surcharge.html";
const MONTHS = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, june:6, jul:7, july:7, aug:8, sep:9, sept:9, oct:10, nov:11, dec:12 };

function iso(mon, day, year){
  const m = MONTHS[mon.toLowerCase().replace(".", "")];
  if(!m) return null;
  return `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const abbr = mon => /^(May|June|July)$/.test(mon) ? mon : mon + ".";

function parse(html){
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
                   .replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ");
  /* Rows look like: "Nov. 2, 2026–Nov. 8, 2026 29.25% ..." (first % is the Ground column) */
  const re = /([A-Z][a-z]{2,4})\.? (\d{1,2}), (\d{4}) ?[–-] ?([A-Z][a-z]{2,4})\.? (\d{1,2}), (\d{4}) (\d{1,2}(?:\.\d{1,2})?)%/g;
  const rows = [];
  let m;
  while((m = re.exec(text))){
    const from = iso(m[1], m[2], m[3]), to = iso(m[4], m[5], m[6]);
    if(from && to) rows.push({ from, to, pct: parseFloat(m[7]),
      week: `${abbr(m[1])} ${m[2]} – ${abbr(m[4])} ${m[5]}, ${m[6]}` });
  }
  return rows;
}

export async function onRequestGet(context){
  const cache = caches.default;
  const key = new Request(new URL("/api/fedex-fuel", context.request.url).toString());
  const hit = await cache.match(key);
  if(hit) return hit;

  try{
    const res = await fetch(SOURCE, { headers: {
      "User-Agent": "Mozilla/5.0 (compatible; LiftCommerceCalculator/1.0; +https://www.liftcommerce.io/shipping-calculator)",
      "Accept": "text/html" } });
    if(!res.ok) throw new Error("upstream " + res.status);
    const rows = parse(await res.text());
    if(!rows.length) throw new Error("no rows");

    const today = new Date().toISOString().slice(0, 10);
    const current = rows.find(r => r.from <= today && today <= r.to)
                 || rows.filter(r => r.from <= today).sort((a, b) => b.from.localeCompare(a.from))[0];
    if(!current || !(current.pct > 5 && current.pct < 80)) throw new Error("no current row");

    const out = new Response(JSON.stringify({ ...current, source: SOURCE, fetched: new Date().toISOString() }), {
      headers: { "Content-Type": "application/json; charset=utf-8",
                 "Cache-Control": "public, max-age=21600" } });
    context.waitUntil(cache.put(key, out.clone()));
    return out;
  }catch(err){
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 502, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
  }
}
