/* Lift Commerce — FedEx Ground shipping cost calculator (/shipping-calculator)
   ---------------------------------------------------------------------------
   Every figure below is a published FedEx list figure. Update this block when
   FedEx publishes new rates (each January), and FUEL each week if the live
   lookup (/api/fedex-fuel, a Cloudflare Pages Function) is not available.

   Sources
   - Base rates: FedEx Standard List Rates 2026, FedEx Ground / Home Delivery,
     zones 2-8, 1-150 lb (effective Jan. 5, 2026).
   - Additional Handling, Oversize, Unauthorized: "2026 changes to FedEx
     surcharges & fees" (fedex.com, effective Jan. 5, 2026).
   - Demand (peak) surcharges: fedex.com/en-us/shipping/rate-changes/demand-surcharges.html
     (updated July 22, 2026).
   - Fuel: fedex.com/en-us/shipping/fuel-surcharge.html (weekly).
   --------------------------------------------------------------------------- */
(function(){
"use strict";

var FEDEX = {
  year: 2026,
  /* GROUND[weight-1][zone-2], weight 1-150 lb, zones 2..8 */
  ground: [
    [11.99,12.21,13.26,14.00,14.47,14.75,15.01],
    [12.78,14.09,15.33,15.66,16.34,17.08,17.37],
    [13.30,14.84,15.99,16.81,17.49,18.21,19.11],
    [13.69,14.93,16.65,17.73,18.22,19.56,20.48],
    [14.06,15.62,17.06,18.53,19.26,20.47,21.69],
    [14.17,15.67,17.23,18.60,19.29,20.48,21.70],
    [14.97,16.03,17.68,19.19,19.63,21.03,22.51],
    [15.40,16.61,18.29,19.74,20.42,21.88,23.50],
    [15.64,16.84,18.38,19.91,20.86,22.79,24.75],
    [15.85,17.02,18.56,20.46,21.10,23.87,26.38],
    [16.92,17.60,19.35,20.99,22.27,26.31,28.58],
    [17.20,18.35,19.54,21.29,23.05,27.37,29.92],
    [17.21,18.43,19.77,21.69,23.76,29.04,31.27],
    [17.92,18.93,19.97,22.23,25.16,31.11,34.01],
    [17.93,19.35,20.25,23.01,26.54,32.08,35.40],
    [18.39,19.91,20.62,23.41,27.39,33.78,37.16],
    [18.52,20.32,20.84,24.07,28.56,35.51,37.17],
    [18.71,20.59,21.07,25.23,30.05,36.57,40.08],
    [19.22,21.59,22.21,26.42,30.94,37.68,42.00],
    [19.36,21.77,22.32,27.47,31.99,39.07,43.52],
    [19.88,22.41,23.29,27.52,32.99,40.16,44.86],
    [19.93,22.63,23.92,28.28,34.34,41.25,46.39],
    [20.20,23.07,24.68,29.09,35.63,42.65,48.68],
    [20.75,24.00,25.71,30.64,37.33,44.08,51.47],
    [20.82,24.09,25.83,31.23,38.41,46.51,53.05],
    [21.62,24.91,26.91,32.50,39.81,48.41,55.25],
    [22.22,25.51,27.45,32.73,41.42,49.31,55.65],
    [22.74,26.12,28.72,34.65,43.44,51.51,58.32],
    [22.79,26.62,28.98,34.92,44.68,52.69,59.88],
    [23.02,27.25,30.08,36.03,45.40,52.96,61.78],
    [24.01,27.86,30.69,36.49,46.28,54.40,63.76],
    [24.02,27.87,30.70,36.50,46.29,54.41,64.46],
    [24.16,28.28,32.08,38.21,49.21,56.21,66.20],
    [24.30,28.92,33.10,39.55,49.22,57.89,69.37],
    [24.76,30.45,34.19,40.50,50.06,59.38,69.87],
    [25.12,30.46,34.46,41.50,52.16,61.40,72.61],
    [25.50,30.87,34.82,42.42,52.39,63.39,73.32],
    [25.90,31.34,35.93,43.44,53.57,63.63,74.69],
    [26.77,32.56,37.47,44.78,56.01,66.14,76.22],
    [26.79,32.69,37.48,44.80,56.08,66.15,76.24],
    [27.39,34.10,38.57,46.39,58.42,68.19,79.12],
    [27.40,34.22,40.07,46.54,58.68,69.35,79.52],
    [27.93,34.71,40.13,48.91,61.87,71.87,81.68],
    [28.30,35.23,41.17,49.79,62.22,74.10,82.53],
    [28.36,35.24,41.18,49.80,62.25,75.54,83.11],
    [29.09,35.61,42.48,50.75,63.89,76.36,85.32],
    [29.10,36.41,43.17,51.10,64.76,77.84,86.70],
    [29.12,36.42,43.67,52.95,65.72,78.56,88.07],
    [29.13,36.43,43.68,52.96,66.21,80.13,88.59],
    [29.14,36.44,43.70,53.00,66.78,80.83,89.83],
    [29.34,36.70,44.12,53.51,67.94,82.22,92.34],
    [29.35,36.71,44.14,53.54,67.95,82.24,92.35],
    [29.36,36.72,44.16,54.07,67.96,82.25,93.25],
    [29.37,36.73,44.22,54.17,67.98,82.26,93.26],
    [29.38,36.74,44.23,54.18,67.99,82.27,93.28],
    [29.40,36.76,44.24,54.19,68.01,82.29,94.44],
    [29.93,36.95,44.26,55.81,68.03,82.32,95.40],
    [29.95,36.96,44.28,55.83,68.04,82.33,96.24],
    [29.97,36.99,44.58,55.86,68.52,82.34,97.84],
    [30.79,38.43,45.35,57.83,69.79,82.63,98.44],
    [30.80,38.53,45.79,57.97,69.80,82.64,98.45],
    [32.07,41.28,46.53,59.60,70.87,83.91,99.65],
    [32.08,41.29,46.98,59.64,71.36,84.60,100.25],
    [32.93,41.31,47.75,59.65,71.87,84.61,100.87],
    [33.29,42.41,47.76,59.66,72.49,84.81,101.03],
    [33.46,42.82,47.77,59.67,72.55,85.08,101.46],
    [33.47,42.85,47.78,59.78,73.11,85.49,102.42],
    [33.86,43.63,50.68,61.14,74.19,86.79,102.43],
    [34.56,44.05,51.18,61.58,74.58,86.80,102.97],
    [34.72,44.67,52.29,64.54,76.07,86.81,103.85],
    [34.74,44.68,53.10,64.55,76.57,88.22,103.88],
    [35.73,44.69,54.22,64.58,77.84,91.98,104.04],
    [35.96,45.11,54.23,65.53,78.67,92.14,104.05],
    [36.91,45.12,54.24,65.55,79.88,92.15,104.07],
    [38.28,45.15,54.25,66.06,79.89,93.08,104.08],
    [41.23,47.68,54.60,67.07,81.66,94.59,105.05],
    [42.85,48.37,55.23,67.37,82.13,97.29,105.06],
    [42.89,50.19,56.85,68.09,82.65,98.01,105.08],
    [44.82,52.27,58.27,69.17,84.38,99.53,106.79],
    [46.04,53.28,58.52,70.81,85.78,100.90,107.62],
    [47.17,53.70,59.94,71.29,86.89,101.51,107.98],
    [48.70,55.01,62.66,73.11,87.12,104.14,107.99],
    [48.71,55.02,62.67,73.12,87.38,104.15,108.01],
    [50.65,57.21,64.49,73.83,89.53,105.39,108.83],
    [52.00,57.22,64.53,75.02,90.07,106.53,110.01],
    [53.90,60.39,67.06,76.43,92.00,109.53,113.38],
    [55.01,60.42,67.07,76.44,93.21,109.62,113.56],
    [57.29,61.77,69.18,78.91,93.55,109.74,114.81],
    [59.86,63.49,70.53,79.16,95.58,110.86,117.21],
    [63.52,66.24,73.59,81.48,96.94,113.43,119.53],
    [63.53,66.25,73.60,81.49,96.95,113.44,119.54],
    [64.95,66.88,73.99,82.28,98.13,113.46,119.89],
    [65.78,67.51,75.39,82.29,98.15,113.47,119.90],
    [66.12,69.29,75.76,83.35,100.22,113.50,122.28],
    [67.02,69.92,76.27,84.48,100.52,113.89,123.60],
    [69.17,70.37,79.05,85.41,100.53,113.90,124.82],
    [71.43,73.13,80.20,86.79,102.69,115.53,127.28],
    [72.39,73.61,80.21,87.80,103.85,115.55,127.29],
    [73.38,74.04,81.69,88.91,104.08,116.70,128.58],
    [74.61,75.29,82.48,89.39,105.22,116.79,128.66],
    [75.13,76.02,82.50,90.24,106.22,117.89,129.85],
    [75.85,76.03,83.28,90.25,106.23,117.90,129.86],
    [76.85,77.92,85.00,90.78,106.50,117.91,129.87],
    [76.86,77.93,85.21,90.88,106.51,117.92,129.88],
    [79.61,80.23,87.02,93.64,109.15,120.66,133.08],
    [80.16,80.24,87.03,93.65,109.16,120.68,133.09],
    [80.58,81.36,88.19,94.66,109.17,121.58,134.13],
    [81.73,82.25,89.04,94.67,110.14,121.59,134.15],
    [84.20,84.22,90.14,96.50,111.10,123.77,136.59],
    [85.65,86.24,92.05,98.36,114.18,126.08,139.12],
    [85.66,86.37,94.08,99.31,114.19,126.98,140.77],
    [86.67,88.15,94.09,99.32,115.09,126.99,140.78],
    [86.68,88.16,95.12,100.24,115.11,127.00,142.00],
    [87.59,90.05,97.11,102.19,118.16,130.18,144.26],
    [90.25,91.40,97.14,103.43,118.18,131.42,144.32],
    [90.26,91.41,98.33,103.45,119.91,133.07,146.56],
    [90.35,92.29,99.27,104.83,119.92,133.08,147.51],
    [91.32,93.38,99.36,105.14,120.80,133.09,150.04],
    [94.03,95.29,102.31,106.73,120.81,134.13,150.05],
    [96.59,96.66,102.46,107.46,122.92,135.89,150.06],
    [96.60,96.68,102.47,107.48,123.70,135.91,150.07],
    [96.61,98.54,103.48,108.45,124.67,138.05,152.70],
    [97.48,98.63,106.58,111.41,125.64,140.59,154.79],
    [97.49,99.61,107.70,111.42,126.47,140.60,154.80],
    [98.42,99.62,107.71,111.43,126.48,140.61,154.81],
    [100.39,100.59,108.81,111.44,127.23,140.62,160.27],
    [100.40,102.33,110.92,113.97,130.13,143.16,160.28],
    [101.34,102.34,110.93,113.99,130.14,143.17,161.14],
    [103.27,103.66,110.97,114.77,130.15,143.19,162.69],
    [103.67,103.69,111.97,114.78,131.09,145.05,166.42],
    [104.24,105.31,114.10,116.65,133.02,146.42,167.18],
    [105.34,105.35,114.11,117.43,133.03,146.43,167.19],
    [106.23,106.52,114.12,117.44,133.72,146.44,167.20],
    [108.22,108.34,116.37,119.55,136.03,148.84,167.22],
    [109.04,110.48,118.49,121.67,137.70,149.63,168.04],
    [109.84,110.49,119.29,122.73,137.72,151.95,169.19],
    [109.86,110.76,122.45,123.63,137.73,151.96,169.20],
    [111.90,113.58,123.04,124.65,140.55,153.25,173.84],
    [113.98,113.99,123.08,124.67,140.57,156.10,173.88],
    [114.93,115.82,124.29,126.62,142.07,156.11,173.89],
    [114.94,115.83,125.38,126.64,142.08,156.12,175.54],
    [116.41,116.42,126.49,128.66,144.20,156.83,175.55],
    [116.42,116.43,126.50,128.67,144.21,156.84,175.56],
    [119.71,121.32,130.20,132.70,148.05,162.41,181.69],
    [119.72,122.54,130.21,132.71,150.26,162.77,181.70],
    [119.73,122.55,130.22,132.72,150.27,162.78,181.71],
    [121.18,123.76,132.51,134.06,151.35,162.79,183.39],
    [121.19,124.49,132.67,134.07,151.36,162.80,183.40],
    [121.20,124.50,134.49,136.17,151.86,164.34,185.14],
    [121.21,124.51,134.51,138.11,151.87,164.36,185.15]
  ],
  minCharge: 11.99,                 /* Zone 2, 1 lb list rate: FedEx Ground minimum */
  /* zone buckets for surcharges: [Z2, Z3-4, Z5-6, Z7+] */
  ahDimension: [29.50, 32.75, 38.50, 40.75],
  ahWeight:    [46.00, 50.25, 56.25, 58.75],
  ahPackaging: [26.50, 30.75, 33.00, 33.75],
  oversize:    [255.00, 275.00, 320.00, 330.00],
  unauthorized: 1875.00,
  /* Demand surcharges, added on top of the standard charge. Dates inclusive. */
  peak: [
    { from: "2026-09-28", to: "2026-11-22", ah: 8.80,  os: 95.75,  unauth: 535, label: "Sept. 28 – Nov. 22, 2026" },
    { from: "2026-11-23", to: "2026-12-27", ah: 11.85, os: 117.25, unauth: 595, label: "Nov. 23 – Dec. 27, 2026" },
    { from: "2026-12-28", to: "2027-01-17", ah: 8.80,  os: 95.75,  unauth: 535, label: "Dec. 28, 2026 – Jan. 17, 2027" }
  ],
  /* Fallback fuel figure, used when the live lookup fails. */
  fuel: { pct: 29.25, week: "Nov. 2 – Nov. 8, 2026" }
};

/* FedEx criteria (U.S. package services, 2026) */
var RULE = {
  ahWeightLb: 50,         /* actual weight over */
  ahLongest: 48,          /* longest side over */
  ahSecond: 30,           /* second-longest side over */
  ahLenGirth: 105,        /* length + girth over */
  ahCubic: 10368,         /* cubic inches over */
  ahMinBillable: 40,      /* minimum billable weight with AHS-Dimension */
  osLongest: 96,
  osLenGirth: 130,
  osCubic: 17280,
  osWeightLb: 110,
  osMinBillable: 90,
  maxWeight: 150, maxLongest: 108, maxLenGirth: 165
};

var $ = function(id){ return document.getElementById(id); };
var money = function(n){ return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
var num = function(id, d){ var v = parseFloat($(id).value); return isFinite(v) ? v : d; };
var clamp = function(v, a, b){ return Math.min(b, Math.max(a, v)); };
var bucket = function(z){ return z <= 2 ? 0 : z <= 4 ? 1 : z <= 6 ? 2 : 3; };
var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };

/* List rate for a chargeable weight; above 150 lb FedEx prorates per pound. */
function listRate(lb, zone){
  var col = zone - 2;
  if(lb <= 150) return FEDEX.ground[lb - 1][col];
  return Math.round(FEDEX.ground[149][col] / 150 * lb * 100) / 100;
}

function peakFor(dateStr){
  for(var i = 0; i < FEDEX.peak.length; i++){
    var p = FEDEX.peak[i];
    if(dateStr >= p.from && dateStr <= p.to) return p;
  }
  return null;
}

function todayISO(){
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/* ---------- core calculation (pure: inputs in, breakdown out) ---------- */
function price(o){
  /* FedEx rounds each dimension to the nearest inch and actual weight up to the next pound */
  var L = Math.round(o.L), W = Math.round(o.W), H = Math.round(o.H);
  var s = [L, W, H].sort(function(a, b){ return b - a; });
  var longest = s[0], second = s[1];
  var lenGirth = s[0] + 2 * (s[1] + s[2]);
  var cube = L * W * H;
  var actual = Math.ceil(o.wt);
  var dimWt = cube > 0 ? Math.ceil(cube / o.divisor) : 0;
  var z = bucket(o.zone);

  var r = { L:L, W:W, H:H, longest:longest, second:second, lenGirth:lenGirth, cube:cube,
            actual:actual, dimWt:dimWt, dimGoverns: dimWt > actual, minApplied: 0,
            acc: null, qualifies: [], overMax:false };

  /* Over maximum limits: not accepted by FedEx Ground */
  var overMax = [];
  if(actual > RULE.maxWeight) overMax.push("over " + RULE.maxWeight + " lb");
  if(longest > RULE.maxLongest) overMax.push("longest side over " + RULE.maxLongest + " in");
  if(lenGirth > RULE.maxLenGirth) overMax.push("length + girth over " + RULE.maxLenGirth + " in");

  /* Oversize */
  var os = [];
  if(longest > RULE.osLongest) os.push("longest side over " + RULE.osLongest + " in");
  if(lenGirth > RULE.osLenGirth) os.push("length + girth over " + RULE.osLenGirth + " in");
  if(cube > RULE.osCubic) os.push("over " + RULE.osCubic.toLocaleString() + " in³");
  if(actual > RULE.osWeightLb) os.push("over " + RULE.osWeightLb + " lb");

  /* Additional handling: FedEx charges only the highest that applies */
  var dimWhy = [];
  if(longest > RULE.ahLongest) dimWhy.push("longest side over " + RULE.ahLongest + " in");
  if(second > RULE.ahSecond) dimWhy.push("second-longest side over " + RULE.ahSecond + " in");
  if(lenGirth > RULE.ahLenGirth) dimWhy.push("length + girth over " + RULE.ahLenGirth + " in");
  if(cube > RULE.ahCubic) dimWhy.push("over " + RULE.ahCubic.toLocaleString() + " in³");
  var ah = [];
  if(actual > RULE.ahWeightLb) ah.push({ type:"Weight", amt:FEDEX.ahWeight[z], why:"actual weight over " + RULE.ahWeightLb + " lb" });
  if(dimWhy.length) ah.push({ type:"Dimension", amt:FEDEX.ahDimension[z], why:dimWhy.join(", ") });
  if(o.packaging) ah.push({ type:"Packaging", amt:FEDEX.ahPackaging[z], why:"not fully encased in corrugated cardboard" });

  var minBill = 0;
  if(overMax.length){
    r.overMax = true;
    r.acc = { kind:"unauth", name:"Ground Unauthorized Package Charge", amt:FEDEX.unauthorized, why:overMax.join(", ") };
  } else if(os.length){
    r.acc = { kind:"os", name:"Oversize charge", amt:FEDEX.oversize[z], why:os.join(", ") };
    r.qualifies = ah.map(function(a){ return a.type; });
    minBill = RULE.osMinBillable;
  } else if(ah.length){
    ah.sort(function(a, b){ return b.amt - a.amt; });
    var top = ah[0];
    r.acc = { kind:"ah", name:"Additional handling: " + top.type.toLowerCase(), amt:top.amt, why:top.why };
    r.qualifies = ah.slice(1).map(function(a){ return a.type; });
    if(dimWhy.length) minBill = RULE.ahMinBillable;
  }

  var chargeable = Math.max(actual, dimWt, 1);
  if(minBill && chargeable < minBill){ r.minApplied = minBill; chargeable = minBill; }
  r.chargeable = chargeable;

  /* Base transportation */
  r.list = listRate(chargeable, o.zone);
  var disc = r.list * (1 - o.groundDisc / 100);
  r.minHit = disc < o.minCharge;
  r.base = Math.max(disc, o.minCharge);

  /* Accessorial (negotiated discount applies), then demand surcharge (no discount) */
  r.accList = r.acc ? r.acc.amt : 0;
  r.accNet = r.acc ? r.acc.amt * (1 - o.accDisc / 100) : 0;
  r.peak = 0; r.peakLabel = "";
  var p = o.peakOn ? peakFor(o.date) : null;
  if(p && r.acc){
    r.peak = r.acc.kind === "ah" ? p.ah : r.acc.kind === "os" ? p.os : p.unauth;
    r.peakLabel = p.label;
  }
  r.peakPeriod = p;

  r.subtotal = r.base + r.accNet + r.peak;
  r.fuel = Math.round(r.subtotal * o.fuelPct) / 100;
  r.total = r.subtotal + r.fuel;
  return r;
}

/* exposed for testing */
window.LiftCalc = { price: price, FEDEX: FEDEX, RULE: RULE };

if(!$("fxCalc")) return;

/* ---------- inputs ---------- */
var state = { fuelPct: FEDEX.fuel.pct, fuelWeek: FEDEX.fuel.week, fuelLive: false, touched: 0 };
$("fuel").value = FEDEX.fuel.pct;
$("min").value = FEDEX.minCharge.toFixed(2);
$("shipdate").value = todayISO();

function read(){
  return {
    zone: parseInt($("zone").value, 10),
    L: Math.max(0, num("len", 0)), W: Math.max(0, num("wid", 0)), H: Math.max(0, num("hei", 0)),
    wt: Math.max(0.1, num("wt", 1)),
    packaging: $("pkg").checked,
    divisor: clamp(Math.round(num("dim", 139)), 1, 1000),
    groundDisc: clamp(num("gdisc", 0), 0, 100),
    accDisc: clamp(num("adisc", 0), 0, 100),
    minCharge: Math.max(0, num("min", FEDEX.minCharge)),
    fuelPct: clamp(num("fuel", FEDEX.fuel.pct), 0, 100),
    peakOn: $("peak").checked,
    date: $("shipdate").value || todayISO()
  };
}

function row(lbl, note, amt, cls){
  return '<li><span class="lbl">' + lbl + (note ? '<small>' + note + '</small>' : '') +
         '</span><span class="amt ' + (cls || '') + '">' + amt + '</span></li>';
}

function render(){
  var o = read();
  $("gdiscOut").textContent = o.groundDisc + "%";
  $("adiscOut").textContent = o.accDisc + "%";
  document.querySelectorAll("[data-div]").forEach(function(b){
    b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-div"), 10) === o.divisor));
  });
  var p = peakFor(o.date);
  $("peakNote").textContent = p ? "Peak period " + p.label + "." : "No FedEx peak surcharge on this date.";

  var r = price(o);
  /* the same box at published terms: no discounts, divisor 139, FedEx minimum */
  var pub = price({ zone:o.zone, L:o.L, W:o.W, H:o.H, wt:o.wt, packaging:o.packaging, divisor:139,
                    groundDisc:0, accDisc:0, minCharge:FEDEX.minCharge, fuelPct:o.fuelPct,
                    peakOn:o.peakOn, date:o.date });

  var h = "";
  var flags = (r.dimGoverns ? '<span class="flag">DIM governs</span>' : '') +
              (r.minApplied ? '<span class="flag">' + r.minApplied + ' lb minimum</span>' : '');
  h += row("Chargeable weight",
           "Actual " + r.actual + " lb vs dimensional " + r.dimWt + " lb (" + r.L + "×" + r.W + "×" + r.H +
           " ÷ " + o.divisor + ")" + (r.minApplied ? ". " + (r.acc.kind === "os" ? "Oversize" : "Additional handling") +
           " packages bill at " + r.minApplied + " lb minimum" : ""),
           r.chargeable + " lb" + flags, r.dimGoverns || r.minApplied ? "hit" : "");

  var baseNote = "List " + money(r.list) + " (Zone " + o.zone + ", " + r.chargeable + " lb)";
  if(o.groundDisc) baseNote += ", less " + o.groundDisc + "%";
  if(r.minHit) baseNote += ". Minimum charge applies";
  h += row("Base rate: FedEx Ground", baseNote, money(r.base));

  if(r.acc){
    var n = esc(r.acc.why.charAt(0).toUpperCase() + r.acc.why.slice(1));
    if(o.accDisc) n += ". List " + money(r.accList) + ", less " + o.accDisc + "%";
    if(r.qualifies.length){
      n += r.acc.kind === "os"
        ? ". Replaces additional handling (" + r.qualifies.join(", ").toLowerCase() + ")"
        : ". Also qualifies for " + r.qualifies.join(", ").toLowerCase() + "; FedEx charges only the highest";
    }
    h += row(r.acc.name, n, money(r.accNet), "hit");
  } else {
    h += row("Additional handling / oversize", "No trigger on this box", "—", "zero");
  }

  if(o.peakOn && r.peakPeriod){
    h += r.peak
      ? row("Peak (demand) surcharge", r.peakLabel + ". Added on top; not covered by the accessorial discount", money(r.peak), "hit")
      : row("Peak (demand) surcharge", "Applies to additional handling and oversize packages only", "—", "zero");
  }

  h += row("Fuel surcharge", o.fuelPct + "% " + (o.fuelPct === state.fuelPct ? "(FedEx Ground, week of " + esc(state.fuelWeek) + ")" : "(your figure)") +
           " on all of the above", money(r.fuel));
  h += '<li class="total"><span class="lbl">Estimated total</span><span class="amt">' + money(r.total) + '</span></li>';
  $("ledger").innerHTML = h;

  /* comparison line */
  var msg;
  var saved = pub.total - r.total;
  if(r.overMax){
    msg = "This box is over FedEx Ground's maximum size or weight, so FedEx can bill the <b>" + money(FEDEX.unauthorized) +
          "</b> unauthorized package charge. It needs to ship as freight. <a href=\"/services/ltl-truckload\">See LTL options</a>.";
  } else if(saved > 0.005){
    msg = "At published rates this box costs <b>" + money(pub.total) + "</b>. With the terms above it costs <b>" +
          money(r.total) + "</b>: <b>" + money(saved) + "</b> (" + Math.round(saved / pub.total * 100) + "%) less on every one you ship.";
  } else {
    msg = "This is the published price: <b>" + money(r.total) + "</b>. Move the discount sliders or raise the DIM divisor " +
          "to see what negotiated terms are worth on this box.";
  }
  if(!r.overMax && r.dimGoverns) msg += " Dimensional weight bills " + (r.dimWt - r.actual) + " lb more than the box weighs.";
  $("saveline").innerHTML = msg;

  $("stickyTotal").textContent = money(r.total);
}

/* After a few changes, give the call to action more weight */
function touch(){
  state.touched++;
  if(state.touched === 4) $("calcCta").classList.add("is-on");
}

["zone","len","wid","hei","wt","pkg","dim","gdisc","adisc","min","fuel","peak","shipdate"].forEach(function(id){
  var el = $(id);
  el.addEventListener("input", render);
  el.addEventListener("change", function(){ render(); touch(); });
});
document.querySelectorAll("[data-div]").forEach(function(b){
  b.addEventListener("click", function(){ $("dim").value = b.getAttribute("data-div"); render(); touch(); });
});
$("calcBtn").addEventListener("click", function(){
  render(); touch();
  var out = $("calcOut");
  if(window.matchMedia("(max-width:900px)").matches) out.scrollIntoView({ behavior:"smooth", block:"start" });
  out.classList.remove("pulse"); void out.offsetWidth; out.classList.add("pulse");
});
$("fuelReset").addEventListener("click", function(){ $("fuel").value = state.fuelPct; render(); });
$("fuelWeek").textContent = state.fuelWeek;

render();

/* Live weekly fuel figure (Cloudflare Pages Function). Falls back silently. */
if(window.fetch && location.protocol.indexOf("http") === 0){
  var ctl = window.AbortController ? new AbortController() : null;
  if(ctl) setTimeout(function(){ ctl.abort(); }, 4000);
  fetch("/api/fedex-fuel", ctl ? { signal: ctl.signal } : {})
    .then(function(res){ return res.ok ? res.json() : null; })
    .then(function(d){
      if(!d || !(d.pct > 5 && d.pct < 80) || !d.week) return;
      var unchanged = parseFloat($("fuel").value) === state.fuelPct;
      state.fuelPct = d.pct; state.fuelWeek = d.week; state.fuelLive = true;
      $("fuelWeek").textContent = d.week;
      if(unchanged) $("fuel").value = d.pct;
      render();
    })
    .catch(function(){});
}

})();
