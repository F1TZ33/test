const suppliers = window.SUPPLIER_DIRECTORY_DATA || [];
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm = s => String(s ?? '').toLowerCase().replace(/\s+/g,' ').trim();
const unique = arr => [...new Set(arr.filter(Boolean).map(x => String(x).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
function splitStates(value){
  const valid = new Set(['ACT','NSW','NT','QLD','SA','TAS','VIC','WA']);
  const cleaned = String(value || '')
    .toUpperCase()
    .replace(/\bNS\b/g, 'NSW')
    .replace(/\bVIC\.?\s*WA\b/g, 'VIC WA')
    .replace(/\bSA\s+VIC\b/g, 'SA VIC')
    .replace(/[.;|]+/g, ' ')
    .replace(/\s*,\s*/g, ' ')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = cleaned.split(' ').map(x => x.trim()).filter(Boolean);
  return unique(tokens.map(x => x === 'NS' ? 'NSW' : x).filter(x => valid.has(x)));
}
const escapeRegExp = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function highlight(value, q){ const safe=esc(value); q=String(q||'').trim(); if(!q) return safe; return safe.replace(new RegExp(escapeRegExp(q),'ig'), m => `<mark>${m}</mark>`); }
function optionFill(id, values){ const el=$(id); values.forEach(v=>{ const opt=document.createElement('option'); opt.value=v; opt.textContent=v; el.appendChild(opt); }); }
const allCategories = unique(suppliers.flatMap(s => s.categories || []));
const allBrands = unique(suppliers.flatMap(s => s.brands || []));
const allStates = unique(suppliers.flatMap(s => splitStates(s.state)));
optionFill('categoryFilter', allCategories); optionFill('brandFilter', allBrands); optionFill('stateFilter', allStates);
function searchText(s){ return norm([s.supplier,s.account,s.notes,s.state,s.phone,s.email,s.category,...(s.categories||[]),s.keyProducts,...(s.brands||[])].join(' | ')); }
function matches(s){ const q=norm($('q').value); const cat=$('categoryFilter').value; const brand=$('brandFilter').value; const state=$('stateFilter').value; const pref=$('preferredOnly').checked; if(q && !searchText(s).includes(q)) return false; if(cat && !(s.categories||[]).includes(cat)) return false; if(brand && !(s.brands||[]).includes(brand)) return false; if(state && !splitStates(s.state).includes(state)) return false; if(pref && !s.preferred) return false; return true; }
function supplierCard(s){ const q=$('q').value.trim(); const cats=(s.categories||[]).slice(0,4).map(c=>`<span class="chip">${highlight(c,q)}</span>`).join(''); const brands=(s.brands||[]).slice(0,8).map(b=>`<span class="chip">${highlight(b,q)}</span>`).join(''); const email=s.email ? `<a href="mailto:${esc(s.email)}">${highlight(s.email,q)}</a>` : 'Not listed'; const phone=s.phone ? `<a href="tel:${esc(s.phone)}">${highlight(s.phone,q)}</a>` : 'Not listed'; return `<article class="supplier-card"><div class="supplier-main"><div class="supplier-name">${highlight(s.supplier,q)}</div>${s.preferred?'<span class="badge pref">Preferred</span>':'<span class="badge">Supplier</span>'}</div><div class="meta">Acct ${highlight(s.account||'not listed',q)} • ${highlight(s.state||'state not listed',q)}</div><div class="contact-grid"><div class="mini-field"><b>Phone</b>${phone}</div><div class="mini-field"><b>Email</b>${email}</div></div><div class="products">${highlight(s.keyProducts||'No key products listed',q)}</div><div class="chips">${cats}${brands}</div>${s.notes?`<div class="notes"><b>Notes:</b> ${highlight(s.notes,q)}</div>`:''}</article>`; }
function render(){ const filtered=suppliers.filter(matches); const shown=filtered.slice(0,12); $('stats').textContent = `${shown.length} card${shown.length===1?'':'s'} shown from ${filtered.length} matching supplier${filtered.length===1?'':'s'} — refine search for more`; if(!shown.length){ $('results').innerHTML='<div class="empty">No suppliers match the current search.</div>'; return; } $('results').innerHTML='<div class="supplier-results">'+shown.map(supplierCard).join('')+'</div>'; }
let debounce; ['q','categoryFilter','brandFilter','stateFilter','preferredOnly'].forEach(id=>$(id).addEventListener('input',()=>{ clearTimeout(debounce); debounce=setTimeout(render,70); }));
$('clearBtn').addEventListener('click',()=>{ $('q').value=''; $('categoryFilter').value=''; $('brandFilter').value=''; $('stateFilter').value=''; $('preferredOnly').checked=false; render(); });
render();
