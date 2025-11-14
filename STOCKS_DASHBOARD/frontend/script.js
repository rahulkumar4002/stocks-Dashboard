/* ---------- CONFIG ---------- */
const API_BASE = "http://127.0.0.1:9000";   // change only if backend port changed

/* ---------- UI ELEMENTS ---------- */
const loadingOverlay = document.getElementById("loadingOverlay");
const selectA = document.getElementById("companySelectA") || document.getElementById("companySelect");
const selectB = document.getElementById("companySelectB");
const compareBlock = document.getElementById("compareBlock");
const modeRadios = document.getElementsByName("mode");
const rangeSelect = document.getElementById("rangeSelect");
const downloadBtn = document.getElementById("downloadBtn");
const refreshBtn = document.getElementById("refreshBtn");

const highValueEl = document.getElementById("highValue");
const lowValueEl = document.getElementById("lowValue");
const avgValueEl = document.getElementById("avgValue");
const canvas = document.getElementById("stockChart").getContext("2d");

let mainChart = null;

/* ---------- Loading helpers ---------- */
function showLoading() { loadingOverlay.style.display = "flex"; }
function hideLoading() { loadingOverlay.style.display = "none"; }

/* ---------- Cursor trail ---------- */
(function cursorTrail(){
  const trail = document.getElementById("cursor-trail");
  const dots = [];
  const DOTS = 8;
  for(let i=0;i<DOTS;i++){
    const d = document.createElement("div");
    d.className = "trail-dot";
    d.style.position = "absolute";
    d.style.width = `${8 - i}px`;
    d.style.height = `${8 - i}px`;
    d.style.borderRadius = "50%";
    d.style.background = (i%2? "rgba(138,43,226,0.9)": "rgba(0,229,255,0.9)");
    d.style.pointerEvents = "none";
    d.style.filter = "blur(6px)";
    d.style.opacity = 0.9 - i*0.1;
    trail.appendChild(d);
    dots.push(d);
  }
  let mx=0,my=0;
  window.addEventListener("mousemove", (e)=>{ mx=e.clientX; my=e.clientY; });
  function animate(){
    let x=mx, y=my;
    dots.forEach((dot,i)=>{
      dot.style.left = (x - 4) + "px";
      dot.style.top = (y - 4) + "px";
      x += (mx - x) * (0.2 + i*0.03);
      y += (my - y) * (0.2 + i*0.03);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---------- Fetch companies ---------- */
async function loadCompanies() {
  try{
    const res = await fetch(`${API_BASE}/companies`);
    const data = await res.json();
    // clear selects
    const selA = document.getElementById("companySelectA");
    const selB = document.getElementById("companySelectB");
    const mainSel = document.getElementById("companySelect");
    [selA, selB, mainSel].forEach(s=>{
      if(!s) return;
      s.innerHTML = '<option value="">Select Company</option>';
      (data.companies || []).forEach(c=>{
        const o = document.createElement("option"); o.value=c; o.textContent=c; s.appendChild(o);
      });
    });
  }catch(err){
    console.error("companies load error:", err);
  }
}

/* ---------- Utilities ---------- */
function tail(arr, n){ return arr.slice(-n); }
function safeNum(x){ return x===null||x===undefined?0:parseFloat(x); }

/* ---------- Chart draw ---------- */
function drawChartSingle(labels, values, label){
  if(mainChart) mainChart.destroy();
  mainChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        borderColor: '#b36bff',
        backgroundColor: 'rgba(179,107,255,0.10)',
        pointBackgroundColor: '#00e5ff',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 3,
        fill: true,
        shadowOffsetX: 0,
        shadowOffsetY: 8
      }]
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      plugins: {
        legend:{labels:{color:'#ddd'}},
        tooltip:{mode:'index', intersect:false}
      },
      scales: {
        x:{ticks:{color:'#bbb'}, grid:{color:'rgba(255,255,255,0.02)'}},
        y:{ticks:{color:'#bbb'}, grid:{color:'rgba(255,255,255,0.02)'}}
      }
    }
  });
}

function drawChartCompare(labels, valuesA, valuesB, labelA, labelB){
  if(mainChart) mainChart.destroy();
  mainChart = new Chart(canvas, {
    type:'line',
    data:{
      labels: labels,
      datasets:[
        {label:labelA, data:valuesA, borderColor:'#b36bff', backgroundColor:'rgba(179,107,255,0.08)', borderWidth:3, tension:0.4, pointRadius:2},
        {label:labelB, data:valuesB, borderColor:'#00e5ff', backgroundColor:'rgba(0,229,255,0.06)', borderWidth:3, tension:0.4, pointRadius:2}
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#ddd'}}},
      scales:{x:{ticks:{color:'#bbb'}}, y:{ticks:{color:'#bbb'}}}
    }
  });
}

/* ---------- Data fetch + render ---------- */
async function fetchStock(symbol, days){
  const res = await fetch(`${API_BASE}/data/${symbol}`);
  const data = await res.json();
  // ensure date & close fields in lowercase
  return data.map(r=>{
    return {
      date: r.Date || r.date,
      close: r.Close || r.close || r['adj close'] || r['adj_close'] || r['Adj Close'] || r['Close'],
      high: r.High || r.high,
      low: r.Low || r.low
    };
  });
}

async function fetchSummary(symbol){
  const res = await fetch(`${API_BASE}/summary/${symbol}`);
  const data = await res.json();
  return data;
}

/* ---------- Render logic (single & compare) ---------- */
async function render() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const days = parseInt(rangeSelect.value || "30");
  const a = document.getElementById("companySelectA").value;
  const b = document.getElementById("companySelectB")?.value;

  if(!a) return;

  showLoading();
  try{
    const dataA = await fetchStock(a, days);
    const slicedA = tail(dataA, days);
    const labels = slicedA.map(d=>d.date);
    const valuesA = slicedA.map(d=>safeNum(d.close));
    const summaryA = await fetchSummary(a);

    // update summary cards with A (if compare mode we show A's summary)
    highValueEl.textContent = summaryA["52_week_high"] ?? "-";
    lowValueEl.textContent = summaryA["52_week_low"] ?? "-";
    avgValueEl.textContent = summaryA["avg_close"] ?? "-";

    if(mode === 'single' || !b){
      drawChartSingle(labels, valuesA, a);
    } else {
      const dataB = await fetchStock(b, days);
      const slicedB = tail(dataB, days);
      const valuesB = slicedB.map(d=>safeNum(d.close));
      drawChartCompare(labels, valuesA, valuesB, a, b);
    }
  }catch(err){
    console.error("render error:", err);
  }finally{
    hideLoading();
  }
}

/* ---------- events ---------- */
document.addEventListener("DOMContentLoaded", async ()=>{
  showLoading();
  await loadCompanies();
  hideLoading();
});

document.getElementById("companySelectA").addEventListener("change", render);
if(document.getElementById("companySelectB")) document.getElementById("companySelectB").addEventListener("change", render);
rangeSelect.addEventListener("change", render);

modeRadios.forEach(r=>{
  r.addEventListener("change", ()=>{
    const v = document.querySelector('input[name="mode"]:checked').value;
    if(v === 'compare') compareBlock.classList.remove('hidden'); else compareBlock.classList.add('hidden');
    render();
  });
});

downloadBtn.addEventListener("click", ()=>{
  if(!mainChart) return;
  const link = document.createElement('a');
  link.href = document.getElementById("stockChart").toDataURL('image/png',1);
  link.download = `chart-${Date.now()}.png`;
  link.click();
});

refreshBtn.addEventListener("click", render);

/* ---------- initial render hookup ---------- */
window.addEventListener("load", ()=>{ 
  // slight delay to ensure companies loaded
  setTimeout(()=>{ 
    const sel = document.getElementById("companySelectA");
    if(sel && sel.options.length>1) sel.selectedIndex = 1;
    render();
  }, 700);
});
