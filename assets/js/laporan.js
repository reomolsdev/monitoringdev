(() => {
  'use strict';
  const screen = document.getElementById('layar-laporan');
  if (!screen) return;
  const $ = id => document.getElementById(id);
  const readLocal=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  let activityRecords=readLocal('seamolec-role-activities-v1',{});
  const savedPrograms=readLocal('seamolec-role-flagships-v1',[]);
  const catalog = [...(window.ReportActivities || []),...Object.values(activityRecords).filter(d=>d?.flag&&d?.code).map(d=>({id:d.id,flagship:d.flag,kode:d.code,divisi:d.division,judul:d.title,tahun:d.year||'2026'}))];
  const strategyMap = {...(window.ReportStrategies || {})};
  if(Array.isArray(savedPrograms))savedPrograms.forEach(p=>{if(p.strategy)strategyMap[p.name]=p.strategy;});
  const strategies = ['ST1','ST3','WT2','WT3','WO2'];
  const periods = ['Tahunan','Q1','Q2','Q3','Q4','Semester 1','Semester 2'];
  const types = ['Laporan kuartalan', 'Laporan tahunan', 'Laporan Dampak Tahunan', 'Laporan teknis', 'Laporan keuangan', 'Audit / evaluasi', 'Notulen / kebijakan', 'Bukti aktivitas'];
  const flags = [...new Set([...catalog.map(a => a.flagship),...(Array.isArray(savedPrograms)?savedPrograms.map(p=>p.name):[])])];
  const divisions = [...new Set(catalog.map(a => a.divisi))].sort();
  const key = 'seamolec-report-documents-v1';
  const normalize = text => String(text || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const safeURL = value => {
    try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; }
    catch { return ''; }
  };
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function options(select, values, placeholder, selected = '') {
    select.replaceChildren();
    if (placeholder !== null) select.add(new Option(placeholder, ''));
    values.forEach(v => select.add(new Option(v, v)));
    select.value = [...select.options].some(o => o.value === selected) ? selected : select.options[0]?.value || '';
  }
  options($('lap-flagship'), flags, 'Semua flagship');
  options($('doc-flagship'), flags, 'Lintas flagship / Umum');
  options($('lap-divisi'), divisions, 'Semua divisi');
  options($('doc-divisi'), divisions, 'Pilih divisi');
  options($('lap-jenis'), types, 'Semua jenis');
  options($('doc-jenis'), types, null, 'Laporan tahunan');
  options($('lap-strategi'), strategies, 'Semua strategi');
  options($('doc-strategi'), strategies, 'Umum / Tanpa strategi tertentu');
  function codes(flagship) { return [...new Set(catalog.filter(a => !flagship || a.flagship === flagship).map(a => a.kode))].sort(); }
  function filterCodes() { options($('lap-kode'), codes($('lap-flagship').value), 'Semua kode', $('lap-kode').value); }
  filterCodes();
  let docs = [], page = 1, editing = null, deleting = null, selectedId = null, storageError = '';
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(saved)) throw new Error('Invalid data');
    docs = saved.filter(d => d && typeof d.id === 'string' && typeof d.judul === 'string' && safeURL(d.url) && types.includes(d.jenis) && /^(202[5-9])$/.test(d.tahun) && (!d.flagship || flags.includes(d.flagship)) && divisions.includes(d.divisi) && (!d.kode || codes(d.flagship).includes(d.kode)) && ['Tahunan','Q1','Q2','Q3','Q4','Semester 1','Semester 2'].includes(d.periode));
    docs = docs.map(d => ({...d, strategi: strategyMap[d.flagship] || (strategies.includes(d.strategi) ? d.strategi : '')}));
    if (docs.length !== saved.length) storageError = 'Sebagian data tersimpan tidak valid dan tidak ditampilkan.';
  } catch { storageError = 'Penyimpanan browser tidak tersedia atau data tersimpan tidak dapat dibaca. Data lama tidak ditimpa.'; }
  // Add examples once per browser, without replacing user documents or resurrecting deleted samples.
  const seedKey = key + '-examples-v1';
  if (storageError && !docs.length) docs = (window.ReportSamples || []).map(d=>({...d}));
  try {
    if (!localStorage.getItem(seedKey) && !storageError) {
      const ids = new Set(docs.map(d=>d.id));
      docs = docs.concat((window.ReportSamples || []).filter(d=>!ids.has(d.id)).map(d=>({...d})));
      localStorage.setItem(key, JSON.stringify(docs));
      localStorage.setItem(seedKey, '1');
    }
  } catch {
    if (!docs.length) docs = (window.ReportSamples || []).map(d=>({...d}));
    storageError = 'Dokumen contoh ditampilkan; penyimpanan browser tidak tersedia. Perubahan tidak dapat disimpan.';
  }
  function persist(next) {
    try { if (storageError) throw new Error(); localStorage.setItem(key, JSON.stringify(next)); docs = next; return true; }
    catch { $('lap-notice').textContent = 'Perubahan belum disimpan: penyimpanan browser tidak tersedia. Coba browser biasa dengan penyimpanan lokal aktif.'; return false; }
  }
  function approved(d) {
    const id = d.activityId || d.aktivitas;
    const activity = (id ? activityRecords[id] : null)
      || (d.flagship && d.kode ? Object.values(activityRecords).find(a => a && a.flag === d.flagship && a.code === d.kode) : null);
    return (activity?.activityReviewStatus || d.reviewStatus) === 'Disetujui';
  }
  function filtered() {
    const f = Object.fromEntries(['flagship','strategi','kode','divisi','tahun','jenis','status','cari'].map(k => [k, $('lap-' + k).value]));
    const words = normalize(f.cari).trim().split(/\s+/).filter(Boolean);
    return docs.filter(d => ['flagship','strategi','kode','divisi','tahun','jenis'].every(k => !f[k] || d[k] === f[k]) && (!f.status || (f.status==='approved'?approved(d):!approved(d))) && words.every(w => normalize([d.judul,d.url,d.flagship,d.strategi,d.kode,d.divisi,d.jenis,d.catatan,d.aktivitasJudul,d.periode,d.tahun].join(' ')).includes(w)));
  }
  const icons = {
    update: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m10.5 2 3.5 3.5-8 8-4 1 1-4zM9 3.5 12.5 7" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    delete: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M6 4V2h4v2M4 4l.5 10h7L12 4M6.5 7v4M9.5 7v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  function action(label, kind, callback) {
    const button = node('button', undefined, 'laporan-icon' + (kind === 'delete' ? ' laporan-icon-delete' : ''));
    button.type = 'button'; button.title = label; button.setAttribute('aria-label', label); button.innerHTML = icons[kind]; button.addEventListener('click', callback); return button;
  }
  function render() {
    const matches = filtered(), totalPages = Math.max(1, Math.ceil(matches.length / 10));
    page = Math.min(page, totalPages);
    const body = $('lap-dokumen'); body.replaceChildren();
    matches.slice((page-1)*10,page*10).forEach(d => {
      const tr = node('tr'); tr.dataset.documentId = d.id;
      const title = node('td');
      if (d.demo) title.append(node('span', 'Contoh', 'laporan-demo'));
      title.append(node('span', d.judul, 'laporan-document-title'));
      const link = node('a', d.url, 'laporan-document-link'); link.href = safeURL(d.url); link.target = '_blank'; link.rel = 'noopener noreferrer'; link.title = d.url; title.append(link);
      if (d.aktivitasJudul) title.append(node('span', d.aktivitasJudul, 'laporan-document-sub'));
      tr.append(title);
      const flagship = node('td'); flagship.append(node('span', d.flagship || 'Lintas flagship', 'td-flag'), node('span', d.strategi ? 'Strategi '+d.strategi : 'Strategi umum', 'laporan-document-sub'), node('span', d.kode ? 'Aktivitas '+d.kode : 'Aktivitas umum', 'laporan-document-sub')); tr.append(flagship);
      tr.append(node('td', d.divisi), node('td', d.tahun + ' · ' + d.periode), node('td', d.jenis));
      const preview = node('td'), button = node('button', undefined, 'laporan-icon laporan-preview-button'); button.type = 'button'; button.title='Preview '+d.judul; button.setAttribute('aria-label','Preview ' + d.judul); button.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>'; button.addEventListener('click', () => showPreview(d)); preview.append(button); tr.append(preview);
      tr.tabIndex = 0;
      tr.setAttribute('aria-label', 'Lihat preview ' + d.judul);
      tr.addEventListener('click', event => {
        if (!event.target.closest('a, button')) showPreview(d);
      });
      tr.addEventListener('keydown', event => {
        if (event.target === tr && ['Enter', ' '].includes(event.key)) {
          event.preventDefault(); showPreview(d);
        }
      });
      [...tr.cells].forEach((cell, i) => cell.dataset.label = ['Dokumen / tautan','Flagship / kode','Divisi','Periode','Jenis','Aksi'][i]);
      body.append(tr);
    });
    $('lap-hitung').textContent = `${matches.length} dokumen ditemukan`;
    $('lap-kosong').hidden = matches.length > 0;
    $('lap-kosong-judul').textContent = docs.length ? 'Tidak ada dokumen yang cocok' : 'Belum ada dokumen';
    $('lap-kosong-teks').textContent = docs.length ? 'Ubah pencarian atau reset filter untuk melihat dokumen lainnya.' : 'Dokumen ditambahkan melalui halaman Aktivitas.';

    $('lap-pagination').hidden = !matches.length;
    $('lap-rentang').textContent = `${(page-1)*10+1}–${Math.min(page*10,matches.length)} dari ${matches.length} dokumen`;
    $('lap-halaman').textContent = `${page} / ${totalPages}`;
    $('lap-sebelum').disabled = page === 1; $('lap-sesudah').disabled = page === totalPages;
    $('lap-ekspor').disabled = !matches.length;
    const visible = matches.slice((page-1)*10,page*10);
    const selected = visible.find(d => d.id === selectedId) || visible[0];
    if (selected) showPreview(selected, false);
    else { selectedId = null; $('lap-preview-area').replaceChildren(node('p', 'Tidak ada dokumen untuk ditampilkan.', 'laporan-catatan')); $('lap-preview-detail').replaceChildren(); $('lap-preview-link').hidden = true; $('lap-preview-meta').textContent = ''; $('lap-preview-info').textContent = ''; }
  }
  ['flagship','strategi','kode','divisi','tahun','jenis','status'].forEach(k => $('lap-'+k).addEventListener('change', () => { if (k === 'flagship') filterCodes(); page = 1; render(); }));
  $('lap-cari').addEventListener('input', () => { page = 1; render(); });
  $('lap-reset').addEventListener('click', () => { ['flagship','strategi','kode','divisi','tahun','jenis','status','cari'].forEach(k => $('lap-'+k).value=''); filterCodes(); page=1; render(); });
  $('lap-sebelum').addEventListener('click',()=>{page--;render();}); $('lap-sesudah').addEventListener('click',()=>{page++;render();});
  function editorCodes(selected = '') { options($('doc-kode'), codes($('doc-flagship').value), 'Umum / Tanpa kode aktivitas', selected); editorActivities(); }
  function editorStrategy(selected = '') {
    const mapped = strategyMap[$('doc-flagship').value];
    $('doc-strategi').disabled = !!mapped;
    $('doc-strategi').value = mapped || selected;
  }
  function editorActivities(selected = '') {
    const sel = $('doc-aktivitas'); sel.replaceChildren(new Option('Dokumen program / tidak terkait satu aktivitas', ''));
    const flag = $('doc-flagship').value, code = $('doc-kode').value;
    if (flag) catalog.filter(a => a.flagship === flag && (!code || a.kode === code)).forEach(a => sel.add(new Option(`${a.kode} · ${a.tahun} · ${a.judul}`, String(a.id))));
    sel.disabled = !flag; sel.value = [...sel.options].some(o=>o.value===String(selected)) ? String(selected) : '';
  }
  function openEditor(d = null) {
    editing = d?.id || null; $('lap-form').reset(); $('doc-error').hidden = true;
    $('doc-jenis').value = 'Laporan tahunan';
    $('lap-editor-judul').textContent = d ? 'Update tautan dokumen' : 'Upload tautan dokumen';
    $('doc-simpan').textContent = d ? 'Simpan update' : 'Simpan tautan';
    $('doc-flagship').value = d?.flagship || $('lap-flagship').value;
    editorStrategy(d?.strategi || $('lap-strategi').value);
    editorCodes(d?.kode || $('lap-kode').value);
    editorActivities(d?.aktivitas || '');
    ['judul','url','divisi','tahun','jenis','cover','catatan'].forEach(k => {
      if (d) $('doc-'+k).value = d[k] || '';
      else if (['divisi','tahun','jenis'].includes(k) && $('lap-'+k).value) $('doc-'+k).value = $('lap-'+k).value;
    });
    if (!d && $('doc-jenis').value === 'Laporan kuartalan') $('doc-periode').value = 'Q1';
    $('lap-editor').showModal();
  }

  $('doc-flagship').addEventListener('change',()=>{ editorCodes(); editorStrategy($('doc-strategi').value); });
  $('doc-kode').addEventListener('change',()=>editorActivities());
  $('doc-jenis').addEventListener('change',()=>{
    if ($('doc-jenis').value === 'Laporan kuartalan' && $('doc-periode').value === 'Tahunan') $('doc-periode').value = 'Q1';
    if (['Laporan tahunan','Laporan Dampak Tahunan'].includes($('doc-jenis').value)) $('doc-periode').value = 'Tahunan';
  });
  $('doc-aktivitas').addEventListener('change',()=>{
    const a = catalog.find(a=>String(a.id)===$('doc-aktivitas').value);
    if (a) { $('doc-kode').value=a.kode; $('doc-divisi').value=a.divisi; $('doc-tahun').value=String(a.tahun); }
  });
  $('lap-form').addEventListener('submit', event => {
    event.preventDefault();
    const d = Object.fromEntries(new FormData(event.target));
    Object.keys(d).forEach(k=>d[k]=d[k].trim());
    d.strategi = strategyMap[d.flagship] || d.strategi || '';
    const error = message => { $('doc-error').textContent=message; $('doc-error').hidden=false; };
    if (!d.judul) return error('Judul dokumen harus diisi.');
    if (!periods.includes(d.periode) || (d.strategi && !strategies.includes(d.strategi))) return error('Pilih periode dan kode strategi yang valid.');
    if (!safeURL(d.url) || (d.cover && !safeURL(d.cover))) return error('Gunakan tautan http atau https yang valid, tanpa username atau password.');
    if (d.kode && !d.flagship) return error('Pilih flagship untuk dokumen dengan kode aktivitas tertentu.');
    if (!types.includes(d.jenis) || !divisions.includes(d.divisi) || !/^(202[5-9])$/.test(d.tahun)) return error('Lengkapi jenis, divisi, dan tahun yang sesuai.');
    const related = catalog.find(a=>String(a.id)===d.aktivitas);
    if (related && (related.flagship!==d.flagship || related.kode!==d.kode)) return error('Aktivitas tidak sesuai dengan flagship dan kode yang dipilih.');
    d.url = safeURL(d.url); d.cover = d.cover ? safeURL(d.cover) : '';
    d.aktivitasJudul = related?.judul || '';
    d.id = editing || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    d.updatedAt = new Date().toISOString();
    if (editing) d.demo = docs.find(old=>old.id===editing)?.demo || false;
    const next = editing ? docs.map(old=>old.id===editing?d:old) : [d,...docs];
    if (!persist(next)) return error('Dokumen belum tersimpan. Penyimpanan lokal browser tidak tersedia.');
    $('lap-editor').close(); page=1; render();
    $('lap-notice').textContent = filtered().some(x=>x.id===d.id) ? 'Tautan dokumen berhasil disimpan.' : 'Tautan tersimpan, tetapi berada di luar filter aktif. Reset filter untuk melihatnya.';
  });
  $('lap-delete-confirm').addEventListener('click',()=>{ if (persist(docs.filter(d=>d.id!==deleting))) { $('lap-delete').close(); render(); $('lap-notice').textContent='Tautan dokumen dihapus dari daftar.'; } });
  screen.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
  screen.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{ const r=dialog.getBoundingClientRect(); if(event.target===dialog && (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom))dialog.close(); }));
  $('lap-preview-close').addEventListener('click', () => { $('lap-preview').hidden = true; selectedId = null; screen.querySelectorAll('[data-document-id]').forEach(row => row.classList.remove('is-selected')); });
  function googlePreview(url) {
    const u = new URL(url);
    if (u.protocol !== 'https:') return '';
    const m = u.pathname.match(/^\/(document|spreadsheets|presentation)(?:\/u\/\d+)?\/d\/([a-zA-Z0-9_-]+)/);
    if (u.hostname==='docs.google.com' && m) return `https://docs.google.com/${m[1]}/d/${m[2]}/preview`;
    if (u.hostname==='drive.google.com') {
      const id = u.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || u.searchParams.get('id');
      if (id && /^[a-zA-Z0-9_-]+$/.test(id)) return `https://drive.google.com/file/d/${id}/preview`;
    }
    return '';
  }
  function cover(d) {
    const card=node('div',undefined,'laporan-cover'); card.append(node('small','SEAMOLEC · FYDP 2025–2029'),node('small',d.jenis),node('h3',d.judul),node('p',`${d.flagship || 'Lintas flagship'} · ${d.strategi || 'Strategi umum'} · ${d.kode || 'Umum'}\n${d.tahun} · ${d.periode}`)); return card;
  }
  function showPreview(d, live = true) {
    selectedId = d.id;
    $('lap-preview').hidden = false;
    $('lap-preview-link').hidden = false;
    screen.querySelectorAll('[data-document-id]').forEach(row => row.classList.toggle('is-selected', row.dataset.documentId === d.id));
    $('lap-preview-judul').textContent='Preview dokumen';
    $('lap-preview-meta').textContent=`${d.flagship || 'Lintas flagship'} · ${d.strategi || 'Strategi umum'} · ${d.kode || 'Umum'} · ${d.tahun} · ${d.periode}`;
    $('lap-preview-link').href=safeURL(d.url);
    const area=$('lap-preview-area'); area.replaceChildren();
    const preview=googlePreview(d.url);
    if (d.cover && safeURL(d.cover)) {
      const img=node('img',undefined,'laporan-cover-image'); img.alt='Cover '+d.judul; img.referrerPolicy='no-referrer'; img.src=safeURL(d.cover);
      img.addEventListener('error',()=>{area.replaceChildren(cover(d));$('lap-preview-info').textContent='Gambar cover tidak dapat dimuat. Ditampilkan cover ringkasan dari metadata dokumen.';});
      area.append(img); $('lap-preview-info').textContent='Cover dari tautan gambar yang Anda tambahkan.';
    } else if (preview && live) {
      const iframe=node('iframe',undefined,'laporan-preview-frame'); iframe.title='Preview '+d.judul; iframe.referrerPolicy='no-referrer'; iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups'); iframe.src=preview; area.append(iframe);
      $('lap-preview-info').textContent='Preview berasal dari Google. Jika kosong atau meminta login, periksa izin berbagi atau buka dokumen asli.';
    } else {
      area.append(cover(d)); $('lap-preview-info').textContent='Cover ringkasan dari judul dan metadata; bukan halaman asli dokumen. Tambahkan tautan gambar cover untuk menampilkan cover asli.';
    }
    const detail = $('lap-preview-detail'); detail.replaceChildren();
    [['Judul', d.judul], ['Flagship', d.flagship || 'Lintas flagship'], ['Strategi / aktivitas', `${d.strategi || 'Umum'} / ${d.kode || 'Umum'}`], ['Divisi', d.divisi], ['Periode', `${d.tahun} · ${d.periode}`], ['Jenis dokumen', d.jenis]].forEach(([label, value]) => detail.append(node('dt', label), node('dd', value)));
  }
  $('lap-ekspor').addEventListener('click',()=>{
    const rows=[['Judul','Tautan','Flagship','Kode strategi','Kode aktivitas','Aktivitas','Divisi','Tahun','Periode','Jenis dokumen','Keterangan'],...filtered().map(d=>[d.judul,d.url,d.flagship||'Lintas flagship',d.strategi||'Umum',d.kode||'Umum',d.aktivitasJudul,d.divisi,d.tahun,d.periode,d.jenis,d.catatan])];
    const cell=value=>{let s=String(value??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    const blob=new Blob(['\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob), a=node('a');a.href=url;a.download='laporan-filter.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  if(storageError)$('lap-notice').textContent=storageError;
  render();
})();
