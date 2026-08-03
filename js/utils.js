// Shared utility helpers
function fmtDuration(totalSeconds){
  if(totalSeconds==null||isNaN(totalSeconds))return "--:--";
  totalSeconds=Math.round(totalSeconds);
  const h=Math.floor(totalSeconds/3600),m=Math.floor((totalSeconds%3600)/60),s=totalSeconds%60;
  const p=n=>String(n).padStart(2,"0");
  return h>0?`${h}:${p(m)}:${p(s)}`:`${p(m)}:${p(s)}`;
}
function parseDurationInput(str){
  if(!str)return null; str=str.trim();
  if(/^\d+$/.test(str))return parseInt(str,10);
  const parts=str.split(":").map(x=>parseInt(x,10));
  if(parts.some(isNaN))return null;
  if(parts.length===2)return parts[0]*60+parts[1];
  if(parts.length===3)return parts[0]*3600+parts[1]*60+parts[2];
  return null;
}
function fmtDateTime(iso){ if(!iso)return ""; return new Date(iso).toLocaleString("en-AU",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); }
function fmtDate(iso){ if(!iso)return ""; return new Date(iso).toLocaleDateString("en-AU"); }
function getParam(name){ return new URLSearchParams(window.location.search).get(name); }
function escapeHtml(str){ if(str==null)return ""; return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function toCSV(rows,columns){
  const esc=v=>{ if(v==null)return ""; const s=String(v); return (s.includes(",")||s.includes('"')||s.includes("\n"))?'"'+s.replace(/"/g,'""')+'"':s; };
  const header=columns.map(c=>c.label).join(",");
  const lines=rows.map(row=>columns.map(c=>esc(typeof c.value==="function"?c.value(row):row[c.value])).join(","));
  return [header,...lines].join("\n");
}
function downloadFile(filename,content,mime="text/csv"){
  const blob=new Blob([content],{type:mime+";charset=utf-8;"}); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
function toast(msg,type="info"){
  let el=document.getElementById("__toast");
  if(!el){el=document.createElement("div");el.id="__toast";el.style.cssText="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:999;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:600;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.2);transition:opacity .3s ease;max-width:90vw;text-align:center;";document.body.appendChild(el);}
  el.style.background=type==="error"?"#d02f2f":type==="warn"?"#d97706":"#0093D1";
  el.textContent=msg; el.style.opacity="1"; clearTimeout(el._t); el._t=setTimeout(()=>el.style.opacity="0",2500);
}
