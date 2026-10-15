(() => {
 'use strict';
 const REGISTRY='seamolec-fydp-periods-v1',SELECTED='seamolec-fydp-selected-v1',LEGACY='2025-2029';
 const native=window.localStorage;
 const read=(key,fallback)=>{try{return JSON.parse(native.getItem(key))??fallback;}catch{return fallback;}};
 const initial={version:1,periods:[{id:LEGACY,name:'FYDP 2025–2029',start:2025,end:2029,status:'active'}]};
 let registry=read(REGISTRY,initial);
 if(!Array.isArray(registry.periods)||!registry.periods.length)registry=initial;
 let selected=read(SELECTED,null);if(!registry.periods.some(p=>p.id===selected))selected=registry.periods.find(p=>p.status==='active')?.id||registry.periods[0].id;
 const period=registry.periods.find(p=>p.id===selected),years=Array.from({length:period.end-period.start+1},(_,i)=>String(period.start+i));
 const operational=key=>/^seamolec-(role-(activities|subtasks|kpis)-|kpi-outcomes-|kpi-activity-links-|report-documents-|review-examples-|multi-document-examples-|staff-direct-example-|activity-flow-examples-|activity-review-clock-)/.test(key);
 const readonly=()=>read(REGISTRY,registry).periods.find(p=>p.id===selected)?.status!=='active';
 const scopedKey=key=>operational(key)&&selected!==LEGACY?key+'::fydp:'+selected:key;
 const storage={getItem(key){if(key==='seamolec-role-flagships-v1'&&readonly())return native.getItem(key+'::archive:'+selected)||native.getItem(key);return native.getItem(scopedKey(key));},setItem(key,value){if((operational(key)||key==='seamolec-role-flagships-v1')&&readonly())throw new Error('Periode arsip hanya dapat dilihat.');native.setItem(scopedKey(key),value);},removeItem(key){if((operational(key)||key==='seamolec-role-flagships-v1')&&readonly())throw new Error('Periode arsip hanya dapat dilihat.');native.removeItem(scopedKey(key));}};
 const role=()=>document.getElementById('pilih-peran')?.value||({BOD:'bod',Manager:'manajer',Staf:'staf',PIC:'pic'}[location.pathname.split('/').at(-2)])||read('seamolec-active-role','bod');
 const saveRegistry=next=>{native.setItem(REGISTRY,JSON.stringify(next));registry=next;};
 const currentYear=()=>Number(new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date()));
 const hasEnded=p=>currentYear()>p.end;
 const archivePhrase=p=>'ARSIPKAN '+p.id;
 const navigate=id=>{native.setItem(SELECTED,JSON.stringify(id));location.reload();};
 function create(start,name){if(role()!=='bod')throw new Error('Hanya BOD dapat mengelola periode.');start=Number(start);const end=start+4;
  if(!Number.isInteger(start)||start<2000||end>2199)throw new Error('Isi tahun mulai yang valid (2000–2195).');
  const current=read(REGISTRY,registry);if(current.periods.some(p=>start<=p.end&&end>=p.start))throw new Error('Tahun periode tidak boleh bertumpuk dengan periode yang sudah ada.');
  const p={id:start+'-'+end,name:name.trim()||'FYDP '+start+'–'+end,start,end,status:'planned',createdAt:new Date().toISOString()};
  saveRegistry({...current,periods:[...current.periods,p]});return p;
 }
 function materialize(p){if(p.id===selected&&!readonly()){window.KPISystem?.load();window.ActivityData?.items();window.ActivityData?.documents();}}
 function snapshotFlags(p){let flags=native.getItem('seamolec-role-flagships-v1');if(!flags){const names=['AILOS','PROGRES','ADCEND','R-MODE','FLEXERA','CREATE','CODEA','NEXEL','COALA'],strategies={AILOS:'ST3',PROGRES:'ST1',ADCEND:'ST1','R-MODE':'WT2',FLEXERA:'WT3',CREATE:'WT3',CODEA:'WT3',NEXEL:'WT3',COALA:'WO2'};flags=JSON.stringify(names.map(name=>({name,division:name==='AILOS'?'IT&KM':name==='COALA'?'R&D':['FLEXERA','CREATE','CODEA','NEXEL'].includes(name)?'Training':'CPMP',strategy:strategies[name],components:window.ActivityData?.programs?.(name)||[]})));}native.setItem('seamolec-role-flagships-v1::archive:'+p.id,flags);}
 const archivedRecord=(p,now)=>({...p,status:'archived',archivedAt:now,archivedBy:{name:window.currentUser?.name||read('seamolec-role-accounts-v1',{}).bod?.name||'Andi Darmawan',role:'BOD'}});
 function archive(id,confirmation){if(role()!=='bod')throw new Error('Hanya BOD dapat mengarsipkan periode.');const state=read(REGISTRY,registry),p=state.periods.find(p=>p.id===id);
  if(!p||p.status==='archived')throw new Error('Periode sudah diarsipkan atau tidak ditemukan.');
  if(!hasEnded(p))throw new Error('Periode ini belum selesai. Pengarsipan tersedia mulai 1 Januari '+(p.end+1)+'.');
  if(confirmation!==archivePhrase(p))throw new Error('Teks konfirmasi belum sesuai.');
  materialize(p);snapshotFlags(p);const now=new Date().toISOString();saveRegistry({...state,periods:state.periods.map(x=>x.id===id?archivedRecord(x,now):x)});navigate(selected);
 }
 function activationError(target,state){if(currentYear()<target.start)return 'Periode dapat diaktifkan mulai 1 Januari '+target.start+'.';if(hasEnded(target))return 'Periode ini sudah berakhir. Arsipkan atau tambahkan periode yang sesuai.';const active=state.periods.find(p=>p.status==='active');if(active&&!hasEnded(active))return active.name+' belum berakhir. Periode aktif tidak dapat diarsipkan lebih awal.';return '';}
 function activate(id){if(role()!=='bod')throw new Error('Hanya BOD dapat mengaktifkan periode.');const state=read(REGISTRY,registry),target=state.periods.find(p=>p.id===id);if(!target||target.status!=='planned')throw new Error('Pilih periode baru yang belum diaktifkan.');
  const error=activationError(target,state);if(error)throw new Error(error);
  const now=new Date().toISOString();state.periods.filter(p=>p.status==='active').forEach(p=>{materialize(p);snapshotFlags(p);});
  const updates=state.periods.map(p=>p.id===id?{...p,status:'active',activatedAt:now}:p.status==='active'?archivedRecord(p,now):p);
  saveRegistry({...state,periods:updates});navigate(id);
 }
 function exportPeriod(p){const values={};for(let i=0;i<native.length;i++){const key=native.key(i);if(p.id===LEGACY?operational(key)&&!key.includes('::fydp:'):key.endsWith('::fydp:'+p.id)){try{values[key]=JSON.parse(native.getItem(key));}catch{values[key]=native.getItem(key);}}}
  const snapshot=native.getItem('seamolec-role-flagships-v1::archive:'+p.id);if(snapshot)values.flagships=JSON.parse(snapshot);
  const url=URL.createObjectURL(new Blob([JSON.stringify({period:p,exportedAt:new Date().toISOString(),data:values},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='Arsip-FYDP-'+p.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn,primary=false)=>{const n=el('button',text,'tombol'+(primary?' tombol-utama':''));n.type='button';n.onclick=fn;return n;};
 let dialog;
 function manage(){if(role()!=='bod')return;if(!dialog){dialog=el('dialog',null,'role-dialog fydp-dialog');document.body.append(dialog);}dialog.replaceChildren();
  const head=el('div',null,'role-dialog-head');head.append(el('h2','Kelola periode FYDP'),button('×',()=>dialog.close()));dialog.append(head);
  const body=el('div',null,'role-dialog-body');dialog.append(body);body.append(el('p','Simulasi UI: periode dan arsip disimpan di browser ini, belum tersambung database.','role-note'));body.append(el('p','Mulai periode lima tahun baru tanpa menimpa data lama. Periode arsip tetap dapat dibuka dan diunduh.','role-note'));
  const list=el('div',null,'fydp-period-list');body.append(list);
  const state=read(REGISTRY,registry);state.periods.slice().sort((a,b)=>a.start-b.start).forEach(p=>{const row=el('article',null,'fydp-period-card'),info=el('div'),ended=hasEnded(p);info.append(el('strong',p.name),el('p',p.start+'–'+p.end+' · '+(p.status==='archived'?'Arsip · hanya-baca':ended?'Selesai · siap diarsipkan':p.status==='active'?'Aktif':'Direncanakan'),'role-note'));row.append(info);
   if(p.status==='planned'&&!ended){const activateButton=button('Aktifkan periode',()=>confirmActivate(p),true),reason=activationError(p,state);activateButton.disabled=Boolean(reason);if(reason){activateButton.title=reason;info.append(el('p',reason,'role-note'));}row.append(activateButton);}else if(p.id!==selected&&p.status!=='planned')row.append(button('Buka '+(p.status==='archived'?'arsip':'periode'),()=>navigate(p.id)));
   if(p.status==='archived'){row.append(button('Unduh arsip',()=>exportPeriod(p)));if(p.archivedAt)info.append(el('p','Diarsipkan '+new Date(p.archivedAt).toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta'})+' · '+(p.archivedBy?.name||'BOD'),'role-note'));}
   else{const archiveButton=button('Arsipkan periode',()=>confirmArchive(p));archiveButton.classList.add('fydp-archive-button');archiveButton.disabled=!ended;archiveButton.title=ended?'Arsipkan periode yang telah selesai':'Tersedia mulai 1 Januari '+(p.end+1);row.append(archiveButton);if(!ended)info.append(el('p','Pengarsipan tersedia mulai 1 Januari '+(p.end+1)+'.','role-note'));}
   list.append(row);});
  const form=el('form',null,'fydp-create-form');form.onsubmit=e=>e.preventDefault();form.append(el('h3','Tambah periode baru'));body.append(form);
  const max=Math.max(...registry.periods.map(p=>p.end)),row=el('div',null,'role-editor-row');form.append(row);
  function field(parent,label,value,type='text'){const wrap=el('div',null,'role-field'),l=el('label',label),input=el('input');input.type=type;input.value=value;input.id='fydp-'+Math.random().toString(36).slice(2);l.htmlFor=input.id;wrap.append(l,input);parent.append(wrap);return input;}
  const start=field(row,'Tahun mulai',max+1,'number'),end=field(row,'Tahun akhir',max+5,'number');end.readOnly=true;start.min=2000;start.max=2195;const name=field(form,'Nama periode','FYDP '+(max+1)+'–'+(max+5));
  start.oninput=()=>{end.value=Number(start.value)+4;name.value='FYDP '+start.value+'–'+end.value;};
  form.append(el('p','Lima tahun, termasuk tahun mulai dan tahun akhir. Contoh: 2030–2034.','role-note'));const error=el('p','','role-error');error.setAttribute('role','alert');form.append(error,button('Tambah periode',()=>{try{create(start.value,name.value);manage();}catch(e){error.textContent=e.message;}},true));
  if(!dialog.open)dialog.showModal();
 }
 function confirmArchive(p){materialize(p);dialog.replaceChildren();const head=el('div',null,'role-dialog-head');head.append(el('h2','Arsipkan '+p.name),button('×',()=>dialog.close()));const body=el('div',null,'role-dialog-body');dialog.append(head,body);
  body.append(el('p','Periode '+p.start+'–'+p.end+' telah berakhir pada 31 Desember '+p.end+'.','role-note'),el('p','KPI, target tahunan, aktivitas, subtask, realisasi, dokumen, catatan dan riwayat tetap disimpan. Setelah diarsipkan, seluruh data periode ini hanya dapat dilihat dan diekspor.'));
  body.append(el('p','Data tidak dihapus dan tidak dipindahkan ke periode baru. Anda dapat mengaktifkan periode berikutnya secara terpisah.','role-note'));
  const label=el('label','Ketik '+archivePhrase(p)+' untuk mengonfirmasi'),input=el('input');input.id='fydp-archive-confirm';label.htmlFor=input.id;input.className='filter-pilih';input.autocomplete='off';const error=el('p','','role-error');error.setAttribute('role','alert');const actions=el('div',null,'role-dialog-actions'),submit=button('Arsipkan periode',()=>{try{archive(p.id,input.value);}catch(e){error.textContent=e.message;}},true);submit.disabled=true;input.oninput=()=>submit.disabled=input.value!==archivePhrase(p);actions.append(button('Kembali',manage),submit);body.append(label,input,error,actions);
 }
 function confirmActivate(p){dialog.replaceChildren();const head=el('div',null,'role-dialog-head');head.append(el('h2','Aktifkan '+p.name),button('×',()=>dialog.close()));const body=el('div',null,'role-dialog-body');dialog.append(head,body);
  const current=read(REGISTRY,registry).periods.find(x=>x.status==='active');body.append(el('p',current?current.name+' akan menjadi arsip hanya-baca. Aktivitas, KPI, realisasi, dokumen dan catatan lama tetap disimpan.':'Periode ini akan menjadi periode aktif.'));
  body.append(el('p','Periode baru dimulai kosong. Katalog flagship dan program tetap tersedia untuk digunakan kembali.','role-note'));const label=el('label','Ketik AKTIFKAN untuk melanjutkan'),input=el('input');input.id='fydp-confirm';label.htmlFor=input.id;input.className='filter-pilih';const error=el('p','','role-error'),actions=el('div',null,'role-dialog-actions'),submit=button('Aktifkan & arsipkan periode lama',()=>{try{if(input.value==='AKTIFKAN')activate(p.id);}catch(e){error.textContent=e.message;}},true);submit.disabled=true;input.oninput=()=>submit.disabled=input.value!=='AKTIFKAN';actions.append(button('Kembali',manage),submit);body.append(label,input,error,actions);
 }
 window.FYDP={storage,period,years,isLegacy:selected===LEGACY,get readOnly(){return readonly();},defaultYear:()=>String(Math.min(period.end,Math.max(period.start,new Date().getFullYear()))),create,activate,archive,hasEnded,manage,select:navigate};
 // Small, shared UI shown on every current dashboard route.
 function mount(){const header=document.querySelector('.header-kanan');if(!header)return;
  const controls=el('div',null,'fydp-controls'),label=el('label','Periode FYDP'),select=el('select');select.id='fydp-period-select';select.className='filter-pilih';label.htmlFor=select.id;
  registry.periods.filter(p=>p.status!=='planned').forEach(p=>select.add(new Option(p.name+(p.status==='archived'?' · Arsip':''),p.id)));select.value=selected;select.onchange=()=>navigate(select.value);controls.append(label,select);header.prepend(controls);
  const main=document.getElementById('isi-utama')||document.querySelector('main');if(!main)return;
  const banner=el('div',null,'fydp-banner'+(readonly()?' is-archived':'')),text=el('div');text.append(el('strong',period.name+' · '+(readonly()?'Arsip — hanya-baca':hasEnded(period)?'Selesai — belum diarsipkan':'Periode aktif')),el('span',readonly()?'Data periode ini dapat dilihat dan diekspor, tetapi tidak dapat diubah.':hasEnded(period)?'Periode telah berakhir. BOD dapat mengarsipkannya melalui Pengaturan.':'KPI, aktivitas dan laporan mengikuti periode yang dipilih.'));banner.append(text);if(document.getElementById('layar-pengaturan'))main.prepend(banner);
  const settings=document.getElementById('layar-pengaturan');if(settings){const admin=el('section',null,'panel fydp-settings-panel');admin.id='periode-fydp';admin.setAttribute('aria-labelledby','fydp-settings-title');
   const heading=el('div',null,'panel-kepala'),title=el('h3','Periode FYDP','panel-judul');title.id='fydp-settings-title';heading.append(title,el('span','Administrasi sistem · BOD','panel-catatan'));const body=el('div',null,'lp-body fydp-settings-body');
   body.append(el('p','Kelola periode lima tahun dan arsipkan periode yang telah selesai. Pengarsipan menjaga data lama tetap tersedia tanpa dapat diubah.','lp-note'));const state=read(REGISTRY,registry),active=state.periods.find(p=>p.status==='active');body.append(el('p',(active?(hasEnded(active)?'Periode selesai: ':'Periode aktif: ')+active.name:'Belum ada periode aktif')+' · '+state.periods.filter(p=>p.status==='archived').length+' arsip','role-note'),button('Kelola periode FYDP',manage,true));admin.append(heading,body);settings.append(admin);
   const updateAdmin=()=>{admin.hidden=role()!=='bod';if(admin.hidden&&dialog?.open)dialog.close();};updateAdmin();document.getElementById('pilih-peran')?.addEventListener('change',updateAdmin);if(location.hash==='#periode-fydp'&&!admin.hidden)requestAnimationFrame(()=>admin.scrollIntoView({block:'start'}));
  }
  ['filter-tahun','lap-tahun','doc-tahun'].forEach(id=>{const select=document.getElementById(id);if(!select)return;const all=id==='lap-tahun';select.replaceChildren(...(all?[new Option('Semua tahun','')]:[]),...years.map(y=>new Option(y,y)));select.value=all?'':window.FYDP.defaultYear();});
  // Do not carry a previous-period deep link into a newly selected period.
  if(!window.FYDP.isLegacy){const footer=document.querySelector('.sidebar-kaki');if(footer)footer.textContent='Kerangka prototipe · '+period.name;}
  const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT);const texts=[];while(walker.nextNode())texts.push(walker.currentNode);texts.forEach(n=>{if(n.parentElement.closest('script,style'))return;n.textContent=n.textContent.replace(/FYDP 2025[–-]2029/g,period.name).replace(/SMART Objective 2029/g,'SMART Objective '+period.end);});
  if(!window.FYDP.isLegacy&&document.getElementById('linimasa')){const timeline=document.getElementById('linimasa');timeline.replaceChildren(...years.map(y=>{const card=el('article',null,'fydp-timeline-empty');card.append(el('h3',y),el('p','Belum ada milestone untuk periode ini.','role-note'));return card;}));}
  if(!window.FYDP.isLegacy&&document.getElementById('grid-smart')){['grid-smart','daftar-flagship','daftar-risiko'].forEach(id=>{const area=document.getElementById(id);if(area)area.replaceChildren(el('p','Ringkasan '+period.name+' belum tersedia. Kelola KPI dan aktivitas melalui menu terkait.','fydp-empty'));});}
  enforceReadOnly();const observer=new MutationObserver(enforceReadOnly);observer.observe(document.body,{childList:true,subtree:true});
 }
 function enforceReadOnly(){if(!readonly())return;document.querySelectorAll('.role-toolbar button,.role-actions-group button,.kpi-annual-edit,.kpi-target-edit,.role-status-select,.role-dialog-actions button,.role-bod-submit-actions button,.role-detail-add').forEach(b=>{if(b.closest('.fydp-dialog')||/Ekspor/i.test(b.textContent)||['Batal','Kembali'].includes(b.textContent.trim()))return;if(!b.disabled)b.disabled=true;b.title='Periode arsip — hanya-baca';});document.querySelectorAll('.role-manager-composer textarea,.role-bod-review-dialog textarea,.role-manager-submitted input:not([readonly]),.role-editor-dialog input').forEach(input=>input.readOnly=true);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
 window.addEventListener('storage',e=>{if(e.key===REGISTRY||e.key===SELECTED)location.reload();});
})();
