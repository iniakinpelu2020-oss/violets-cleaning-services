/* Violets Cleaning Services — engine */
const CFG = {
  name: "Violets Cleaning Services",
  town: "Tallahassee, FL",
  phone: "+18507164246",
  mode: "us"
};

const SERVICES = [
  { name:"Standard Recurring Home Cleaning", cat:"Recurring", price:119, time:"≈ 2–3 hrs on site",
    desc:"The weekly or bi-weekly reset: dusting, surfaces, floors, kitchen wipe-down, bathrooms, beds made and bins out. Same crew pattern each visit so nothing gets skipped.",
    img:"1581578731548-c64695cc6952" },
  { name:"Top-to-Bottom Deep Cleaning", cat:"Deep", price:209, time:"≈ 4–5 hrs on site",
    desc:"Every edge, vent, baseboard and behind-the-furniture spot. Skirting boards, door frames, inside the microwave, shower screens descaled — the clean a normal visit can't reach.",
    img:"1560448204-e02f11c3d0e2" },
  { name:"Move-In / Move-Out & Lease Turnover", cat:"Turnover", price:239, time:"≈ 5 hrs on site",
    desc:"Built for handover day: inside every cupboard and drawer, appliance interiors, closets, garage sweep and a final walkthrough so the deposit conversation is a short one.",
    img:"1527515637462-cff94eecc1ac" },
  { name:"Kitchen, Oven & Fridge Inside Detailing", cat:"Extras", price:65, time:"≈ 90 min on site",
    desc:"Oven racks, trays, hob and hood degreased, fridge shelves and drawers washed out, seals wiped. Add it to any clean when the kitchen is doing the most.",
    img:"1556911220-bff31c812dba" },
  { name:"Post-Event & Airbnb Turnover Refresh", cat:"Turnover", price:109, time:"≈ 2 hrs on site",
    desc:"Same-day turnaround for hosts and party aftermaths: linens changed, glassware and surfaces reset, bathrooms sanitised, staging details put back exactly where guests expect them.",
    img:"1560185007-cde436f6a4d0" },
  { name:"Tallahassee Office & Suite Care", cat:"Recurring", price:155, time:"≈ 2–3 hrs on site",
    desc:"Desks, shared surfaces, kitchenette, glass doors and floors for small offices and suites. Weekly or fortnightly, scheduled outside your busiest hours.",
    img:"1497366754035-f200968a6e72" }
];

const SIZE = [
  { label:"1–2 bedroom", note:"up to ~1,000 sqft", add:0 },
  { label:"3 bedroom", note:"~1,500 sqft", add:35 },
  { label:"4+ bedroom", note:"2,000 sqft and up", add:65 }
];
const COND = [
  { label:"Maintained", note:"regular clean", add:0 },
  { label:"Needs detail", note:"+" + "$40", add:40 },
  { label:"Heavy build-up", note:"+" + "$75", add:75 }
];
const SCHED = [
  { label:"Standard week", note:"this week", add:0 },
  { label:"Next-day", note:"priority", add:25 },
  { label:"Saturday", note:"weekend slot", add:35 }
];

const $ = (s) => document.querySelector(s);
const money = (n) => "$" + n;

/* ticker */
(function ticker(){
  const bits = ["Flat-rate pricing","6+ years in Tallahassee","39 five-star reviews","No hidden fees","Leon County homes & offices"];
  const one = bits.map(b => "<span>" + b + " <b>✿</b></span>").join("");
  $("#ticker").innerHTML = one + one;
})();

/* price sheet */
(function sheet(){
  $("#pricelist").innerHTML = SERVICES.map(s =>
    '<li><div><span class="nm">' + s.name + '</span><span class="sub-l">' + s.cat + ' · ' + s.time + '</span></div>' +
    '<span class="grow"></span><span class="pr">From $' + s.price + '</span></li>'
  ).join("");
})();

/* hours + year */
(function hours(){
  const today = new Date().toLocaleDateString("en-US",{weekday:"short",timeZone:"America/New_York"});
  document.querySelectorAll("#hoursList li").forEach(li => { if(li.dataset.day === today) li.classList.add("today"); });
  $("#yr").textContent = new Date().getFullYear();
})();

/* 3D orbit ring */
const stage = $("#stage"), ring = $("#ring"), dotsEl = $("#dots"), catsEl = $("#cats");
const cats = ["All", ...Array.from(new Set(SERVICES.map(s => s.cat)))];
let filter = "All";
let list = SERVICES.slice();
let idx = 0;
let cards = [];
let rot = 0;
let dragging = false, downX = 0, baseRot = 0, moved = 0;

function radius(){
  const w = stage.clientWidth;
  if (w < 480) return 215;
  if (w < 760) return 250;
  return 330;
}

function buildCats(){
  catsEl.innerHTML = cats.map(c => '<button class="pill" type="button" data-cat="' + c + '">' + c + '</button>').join("");
  catsEl.querySelectorAll(".pill").forEach(p => {
    p.setAttribute("aria-pressed", String(p.dataset.cat === filter));
    p.addEventListener("click", () => {
      filter = p.dataset.cat;
      list = filter === "All" ? SERVICES.slice() : SERVICES.filter(s => s.cat === filter);
      idx = 0; rot = 0;
      buildCards(); buildCats(); paint(); buildDots();
    });
  });
}

function buildCards(){
  ring.innerHTML = "";
  cards = list.map((s, i) => {
    const el = document.createElement("article");
    el.className = "ocard";
    el.setAttribute("role","button");
    el.setAttribute("tabindex","0");
    el.innerHTML = '<img src="https://images.unsplash.com/photo-' + s.img + '?auto=format&fit=crop&w=560&q=72" alt="" loading="lazy" onerror="this.style.opacity=.25">' +
      '<div class="cap"><span class="no">' + String(i+1).padStart(2,"0") + " · " + s.cat + '</span>' +
      '<h3>' + s.name + '</h3><span class="pr">From $' + s.price + '</span></div>';
    el.addEventListener("keydown", e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openService(i); } });
    ring.appendChild(el);
    return el;
  });
}

function paint(){
  const step = 360 / Math.max(cards.length, 1);
  cards.forEach((el, i) => {
    const a = i * step;
    el.style.transform = "rotateY(" + a + "deg) translateZ(" + radius() + "px)";
    el.classList.toggle("on", i === idx);
  });
  rot = -idx * step;
  ring.style.transform = "rotateX(-4deg) rotateY(" + rot + "deg)";
  syncDots();
}

function buildDots(){
  dotsEl.innerHTML = list.map((_, i) => '<button class="dot" type="button" aria-label="Service ' + (i+1) + '"></button>').join("");
  dotsEl.querySelectorAll(".dot").forEach((d, i) => d.addEventListener("click", () => go(i - idx)));
}

function syncDots(){
  dotsEl.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("on", i === idx));
}

function go(n){
  const count = list.length;
  idx = (idx + n + count) % count;
  const step = 360 / count;
  rot = -idx * step;
  ring.style.transform = "rotateX(-4deg) rotateY(" + rot + "deg)";
  cards.forEach((el, i) => el.classList.toggle("on", i === idx));
  syncDots();
}

$("#prev").addEventListener("click", () => go(-1));
$("#next").addEventListener("click", () => go(1));

stage.addEventListener("pointerdown", e => {
  dragging = true; downX = e.clientX; baseRot = rot; moved = 0;
  stage.classList.add("dragging");
});
window.addEventListener("pointermove", e => {
  if(!dragging) return;
  const dx = e.clientX - downX;
  moved = Math.abs(dx);
  ring.style.transform = "rotateX(-4deg) rotateY(" + (baseRot + dx * 0.32) + "deg)";
});
window.addEventListener("pointerup", e => {
  if(!dragging) return;
  dragging = false;
  stage.classList.remove("dragging");
  const dx = e.clientX - downX;
  if(moved > 14){
    const steps = Math.round(-dx / (stage.clientWidth / Math.max(list.length,1)) * 1.4);
    if(steps) go(steps); else paint();
  } else {
    paint();
    const hit = e.target.closest(".ocard");
    if(hit){
      const i = cards.indexOf(hit);
      if(i === idx && i > -1) openService(i);
      else if(i > -1) go(i - idx);
    }
  }
  moved = 0;
});
stage.addEventListener("pointercancel", () => { dragging = false; stage.classList.remove("dragging"); paint(); });
window.addEventListener("resize", paint);

/* hero stack parallax */
(function tilt(){
  const wrap = $("#stackWrap"), stack = $("#stack");
  if(!wrap) return;
  wrap.addEventListener("pointermove", e => {
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    stack.style.transform = "rotateY(" + (-16 + x * 16) + "deg) rotateX(" + (6 - y * 12) + "deg) rotateZ(-2deg)";
  });
  wrap.addEventListener("pointerleave", () => { stack.style.transform = "rotateY(-16deg) rotateX(6deg) rotateZ(-2deg)"; });
})();

/* configurator */
let current = 0;
let opts = { size:0, cond:0, sched:0 };

function optRow(el, data, key){
  el.innerHTML = data.map((o,i) => '<button class="opt" type="button" data-i="' + i + '">' + o.label + '<small>' + o.note + '</small></button>').join("");
  el.querySelectorAll(".opt").forEach(b => {
    b.classList.toggle("on", Number(b.dataset.i) === opts[key]);
    b.addEventListener("click", () => {
      opts[key] = Number(b.dataset.i);
      el.querySelectorAll(".opt").forEach(x => x.classList.toggle("on", x === b));
      price();
    });
  });
}

function price(){
  const base = list[current].price;
  const total = base + SIZE[opts.size].add + COND[opts.cond].add + SCHED[opts.sched].add;
  $("#livePrice").textContent = money(total);
  return total;
}

function openService(i){
  if(i < 0 || !list[i]) return;
  current = i;
  const s = list[i];
  opts = { size:0, cond:0, sched:0 };
  $("#cfgImg").src = "https://images.unsplash.com/photo-" + s.img + "?auto=format&fit=crop&w=900&q=75";
  $("#cfgImg").alt = s.name;
  $("#cfgCat").textContent = s.cat;
  $("#cfgIndex").textContent = "02 — " + s.cat;
  $("#cfgName").textContent = s.name;
  $("#cfgDesc").textContent = s.desc;
  $("#cfgTime").textContent = s.time;
  $("#cfgTown").textContent = CFG.town;
  optRow($("#optSize"), SIZE, "size");
  optRow($("#optCond"), COND, "cond");
  optRow($("#optSched"), SCHED, "sched");
  price();
  document.body.classList.add("detail-view");
  $("#detail").classList.add("on");
  buildMore(i);
  window.scrollTo({ top:0, behavior:"auto" });
}

function buildMore(i){
  const others = list.filter((_, n) => n !== i).slice(0,3);
  $("#moreGrid").innerHTML = "";
  others.forEach(s => {
    const b = document.createElement("button");
    b.className = "mcard"; b.type = "button";
    b.innerHTML = '<img src="https://images.unsplash.com/photo-' + s.img + '?auto=format&fit=crop&w=240&q=65" alt="">' +
      "<div><b>" + s.name + "</b><i>From $" + s.price + "</i></div>";
    b.addEventListener("click", () => openService(list.findIndex(x => x.name === s.name)));
    $("#moreGrid").appendChild(b);
  });
}

$("#backBtn").addEventListener("click", () => {
  document.body.classList.remove("detail-view");
  $("#detail").classList.remove("on");
  window.scrollTo({ top:0, behavior:"auto" });
});

/* drawer */
let cart = [];

function openDrawer(){ $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden","false"); $("#scrim").classList.add("on"); }
function closeDrawer(){ $("#drawer").classList.remove("on"); $("#drawer").setAttribute("aria-hidden","true"); $("#scrim").classList.remove("on"); }

function paintCart(){
  const body = $("#drawerBody");
  if(!cart.length){
    body.innerHTML = '<p class="empty">Nothing added yet. Spin the ring, open a service and build your estimate.</p>';
  } else {
    body.innerHTML = cart.map((c,i) =>
      '<div class="line"><div><b>' + c.name + '</b><span>' + c.detail + '</span>' +
      '<button class="rm" type="button" data-i="' + i + '">remove</button></div>' +
      '<div class="amt">' + money(c.price) + '</div></div>'
    ).join("");
    body.querySelectorAll(".rm").forEach(b => b.addEventListener("click", () => { cart.splice(Number(b.dataset.i),1); paintCart(); count(); }));
  }
  const total = cart.reduce((a,c) => a + c.price, 0);
  $("#total").textContent = money(total);
  const msg = "Hi " + CFG.name + ", I'd like to book: " +
    (cart.length ? cart.map(c => c.name + " (" + c.detail + ")").join("; ") + ". Estimate " + money(total) + "." : "a clean.");
  $("#textBtn").href = CFG.mode === "ng"
    ? "https://wa.me/" + CFG.phone.replace("+","") + "?text=" + encodeURIComponent(msg)
    : "sms:" + CFG.phone + "?&body=" + encodeURIComponent(msg);
}

function count(){
  const n = cart.length;
  [$("#cartCount"), $("#cartCount2")].forEach(el => { if(!el) return; el.textContent = n; el.classList.toggle("on", n > 0); });
}

$("#addBtn").addEventListener("click", () => {
  const s = list[current];
  const total = price();
  cart.push({ name:s.name, price:total, detail:SIZE[opts.size].label + " · " + COND[opts.cond].label + " · " + SCHED[opts.sched].label });
  paintCart(); count();
  const t = $("#toast"); t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 1900);
  openDrawer();
});

["#openEstimate","#openEstimate2","#openEstimate3"].forEach(sel => {
  const el = $(sel); if(el) el.addEventListener("click", openDrawer);
});
$("#closeDrawer").addEventListener("click", closeDrawer);
$("#scrim").addEventListener("click", closeDrawer);
document.addEventListener("keydown", e => { if(e.key === "Escape") closeDrawer(); });

/* bloom cleanup (CSS already hides it) */
setTimeout(() => { const b = document.getElementById("bloom"); if(b) b.remove(); }, 2700);

/* boot */
buildCats(); buildCards(); paint(); buildDots(); paintCart(); count();
