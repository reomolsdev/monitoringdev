(() => {
  'use strict';
  const table=document.getElementById('tabel-aktivitas');
  if(!table || !document.getElementById('aktivitas-page-1'))return;
  const $=id=>document.getElementById(id), screen=$('layar-aktivitas');
  const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const rows=[...table.tBodies[0].rows];
  const records=rows.map(row=>({row,flagship:row.cells[1].textContent.trim(),divisi:row.cells[6].textContent.trim(),pilar:row.querySelector('.pilar-nama').textContent.trim(),status:row.cells[8].textContent.replace('▾','').trim(),text:normalize([...row.cells].map(cell=>cell.textContent.trim()).join(' '))}));
  const radios=[...screen.querySelectorAll('input[name="aktivitas-page"]')];
  let page=1, matches=records;
  screen.classList.add('aktivitas-interaktif');
  const style=document.createElement('style');style.textContent='#layar-aktivitas.aktivitas-interaktif #tabel-isi > tr { display: table-row; } #layar-aktivitas.aktivitas-interaktif #tabel-isi > tr[hidden] { display: none !important; } #layar-aktivitas .aktivitas-page-label[hidden] { display: none; }';document.head.append(style);
  const empty=$('hasil-kosong');empty.textContent='Tidak ada aktivitas yang cocok. Ubah pencarian atau reset filter.';empty.style.cssText='padding:24px;border:1px solid var(--garis);border-radius:var(--r-besar);background:var(--putih);color:var(--teks-redup)';
  function render(){
    const words=normalize($('f-cari').value).trim().split(/\s+/).filter(Boolean);
    matches=records.filter(r=>(!$('f-flagship').value||r.flagship=== $('f-flagship').selectedOptions[0].textContent.split(' — ')[0].trim()||r.flagship===$('f-flagship').value) && ['divisi','pilar','status'].every(k=>!$('f-'+k).value||r[k]===$('f-'+k).value) && words.every(w=>r.text.includes(w)));
    const pages=Math.max(1,Math.ceil(matches.length/10));page=Math.min(page,pages);
    records.forEach(r=>r.row.hidden=true);matches.slice((page-1)*10,page*10).forEach(r=>r.row.hidden=false);
    radios.forEach((radio,i)=>{radio.checked=i+1===page;const label=screen.querySelector(`label[for="${radio.id}"]`);label.hidden=i>=pages;radio.disabled=i>=pages;radio.setAttribute('aria-label',`Halaman ${i+1}, aktivitas ${(i*10)+1} sampai ${Math.min((i+1)*10,matches.length)}`);});
    $('filter-hitung').textContent=`Menampilkan ${matches.length} dari ${records.length} aktivitas`;
    screen.querySelector('.aktivitas-pagination p').textContent=matches.length?`${(page-1)*10+1}–${Math.min(page*10,matches.length)} dari ${matches.length} aktivitas`:'0 aktivitas';
    $('tabel-bungkus').hidden=!matches.length;empty.hidden=!!matches.length;
  }
  ['flagship','divisi','pilar','status'].forEach(k=>$('f-'+k).addEventListener('change',()=>{page=1;render();}));
  $('f-cari').addEventListener('input',()=>{page=1;render();});
  $('f-cari').addEventListener('search',()=>{page=1;render();});
  radios.forEach((radio,i)=>radio.addEventListener('change',()=>{page=i+1;render();}));
  $('tombol-reset').addEventListener('click',()=>{['flagship','divisi','pilar','status','cari'].forEach(k=>$('f-'+k).value='');page=1;render();});
  $('tombol-ekspor-aktivitas').addEventListener('click',()=>{
    const cell=s=>'"'+(/^[\s]*[=+@-]/.test(s)?"'":'')+s.replace(/"/g,'""')+'"';
    const csv=[...table.tHead.rows[0].cells].map(th=>cell(th.textContent.trim())).join(',')+'\r\n'+matches.map(r=>[...r.row.cells].map(td=>cell(td.textContent.replace('▾','').trim())).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='aktivitas-filter.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  render();
})();
