(() => {

 'use strict';

 document.body.classList.add('role-pages');

 const $=id=>document.getElementById(id), activity=!!$('layar-aktivitas'), screen=$(activity?'layar-aktivitas':'layar-kpi');

 if(!screen)return;

 const selector=$('pilih-peran'), labels={bod:'BOD',manajer:'Manajer Program',staf:'Staf',pic:'PIC (Penanggung jawab)'};

 let role='manajer';

 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};

 const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{notice.textContent='Perubahan tidak dapat disimpan. Penyimpanan browser tidak tersedia.';return false;}};

 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};

 const button=(text,fn,primary=false)=>{const b=node('button',text,'tombol'+(primary?' tombol-utama':''));b.type='button';b.onclick=fn;return b;};

 const link=(text,fn)=>{const b=button(text,fn);b.className='role-link';return b;};

 const badge=text=>{const cls=['Selesai','Tercapai'].some(x=>text.startsWith(x))?'selesai':text.startsWith('On track')?'ontrack':text.startsWith('Perlu perhatian')?'perhatian':'netral';const b=node('span',undefined,'pill pill-'+cls);b.append(node('span','','pill-titik'),document.createTextNode(text));return b;};

 // The selector is a demo session; a real login can supply window.currentUser.
 const account=()=>window.currentUser||read('seamolec-role-accounts-v1',{})[role]||({bod:{name:'Andi Darmawan'},manajer:{name:'Manajer Program'},staf:{name:'Staf Program'},pic:{name:'Arie Susanty'}}[role]);
 const identity=()=>({name:account().name,role:labels[role]});
 const audit=(d,action)=>({...d,history:[...(d.history||[]),{...identity(),actor:account().name+' ('+labels[role]+')',action,time:new Date().toISOString()}]});
 function author(form){const info=identity();const input=field(form,'Komentar sebagai',info.name+' · '+info.role);input.readOnly=true;return info;}
 function icon(kind,label,fn){const b=button('',fn);b.className='role-icon'+(kind==='delete'?' role-danger':'');b.title=label;b.setAttribute('aria-label',label);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',kind==='edit'?'M15 5l4 4M4 20l4-1L20 7l-4-4L4 15v5Z':kind==='delete'?'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7':'M4 4h16l2 10v6H2v-6L4 4ZM2 14h6l2 3h4l2-3h6');svg.append(path);b.append(svg);return b;}

 const notice=node('p','','role-note');notice.setAttribute('role','status');screen.querySelector('.layar-head').after(notice);

 const safeURL=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};

 const csv=(name,rows)=>{const cell=v=>'"'+(/^[\s]*[=+@-]/.test(String(v))?"'":'')+String(v??'').replaceAll('"','""')+'"';const u=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=node('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};

 const dialog=node('dialog',undefined,'role-dialog');dialog.id='role-popup';dialog.setAttribute('aria-labelledby','role-popup-title');document.body.append(dialog);

 function popup(title){dialog.classList.remove('role-upload-dialog');dialog.replaceChildren();const head=node('div',undefined,'role-dialog-head'),h=node('h2',title);h.id='role-popup-title';const close=button('×',()=>dialog.close());close.className='role-close';close.setAttribute('aria-label','Tutup popup');head.append(h,close);const form=node('form',undefined,'role-dialog-body');form.onsubmit=e=>e.preventDefault();dialog.append(head,form);dialog.showModal();return form;}

 function field(form,label,value='',options=null,kind='text',required=true){const wrap=node('div',undefined,'role-field'),caption=node('label',label);wrap.append(caption);const input=node(options?'select':kind==='textarea'?'textarea':'input');if(options){options.forEach(v=>input.add(new Option(typeof v==='string'?v:v.label,typeof v==='string'?v:v.value)));}else if(kind!=='textarea')input.type=kind;input.id='role-field-'+crypto.randomUUID();caption.htmlFor=input.id;input.value=value;input.required=required;wrap.append(input);form.append(wrap);return input;}

 function actions(form,text,fn,allowed){const area=node('div',undefined,'role-dialog-actions'),error=node('p','','role-error');error.setAttribute('role','alert');form.append(error,area);area.append(button('Batal',()=>dialog.close()),button(text,()=>{if(!allowed.includes(role)){dialog.close();return;}if(!form.reportValidity())return;try{if(fn(error)!==false)dialog.close();}catch{error.textContent='Periksa kembali data yang diisi.';}} ,true));}

 const flags=['AILOS','PROGRES','ADCEND','R-MODE','FLEXERA','CREATE','CODEA','NEXEL','COALA'];

 const strategy={AILOS:'ST3',PROGRES:'ST1',ADCEND:'ST1','R-MODE':'WT2',FLEXERA:'WT3',CREATE:'WT3',CODEA:'WT3',NEXEL:'WT3',COALA:'WO2'};

 let programs=read('seamolec-role-flagships-v1',flags.map(name=>({name,division: name==='AILOS'?'IT&KM':name==='COALA'?'R&D':['FLEXERA','CREATE','CODEA','NEXEL'].includes(name)?'Training':'CPMP'})));

 function manageFlags(){if(role!=='bod')return;const form=popup('Kelola flagship'),sel=field(form,'Flagship',flags[0],flags),div=field(form,'Divisi pelaksana',programs[0].division,['IT&KM','CPMP','Training','R&D','Admin & Finance']);sel.onchange=()=>div.value=programs.find(p=>p.name===sel.value)?.division||'CPMP';form.append(node('p','Pemetaan strategi mengikuti FYDP. Pengaturan ini berlaku pada prototipe Aktivitas dan KPI.','role-note'));actions(form,'Simpan flagship',()=>{const next=programs.map(p=>p.name===sel.value?{...p,division:div.value}:p);if(!save('seamolec-role-flagships-v1',next))return false;programs=next;notice.textContent='Pengaturan flagship disimpan.';},['bod']);}

 const docsKey='seamolec-report-documents-v1';

 function documents(){const saved=read(docsKey,null);const base=Array.isArray(saved)?saved:(window.ReportSamples||[]).map(d=>({...d}));const demoIds=(window.ReportSamples||[]).slice(0,4).map(d=>d.id);return base.map(d=>demoIds.includes(d.id)&&!d.reviewStatus?{...d,reviewStatus:'Menunggu approval BOD',uploadedBy:{name:'Manajer Program',role:'Manajer Program'}}:d);} 

 const pendingDocs=()=>documents().filter(d=>d.reviewStatus==='Menunggu approval BOD');
 const inbox=icon('inbox','Persetujuan dokumen',approve),inboxCount=node('span','','role-inbox-count');inbox.append(inboxCount);document.querySelector('.header-kanan').prepend(inbox);
 function updateInbox(){const count=pendingDocs().length;inbox.hidden=role!=='bod';inboxCount.textContent=count;inboxCount.hidden=!count;inbox.setAttribute('aria-label','Persetujuan dokumen: '+count+' menunggu');inbox.title=count+' dokumen meminta persetujuan BOD';}
 window.addEventListener('storage',e=>{if(e.key===docsKey)updateInbox();});
 function approve(){if(role!=='bod')return;const form=popup('Persetujuan dokumen'),docs=documents();const pending=pendingDocs();author(form);if(!pending.length){form.append(node('p','Belum ada dokumen yang menunggu persetujuan.'));return;}

 const sel=field(form,'Dokumen',pending[0].id,pending.map(d=>({value:d.id,label:d.judul})));const area=node('div');form.append(area);const comment=field(form,'Komentar (opsional)','',null,'textarea',false);const render=()=>{const d=pending.find(d=>d.id===sel.value);area.replaceChildren();const reader=node('div',undefined,'role-reader');reader.append(node('h3',d.judul),node('p','Preview ringkasan dokumen'),node('p',d.catatan||'Buka tautan asli untuk membaca dokumen.'));const a=node('a','Buka dokumen asli ↗');a.href=safeURL(d.url);a.target='_blank';a.rel='noopener noreferrer';reader.append(a);area.append(reader,node('p','Laporan utama: belum dikonfirmasi dibaca · Lampiran: belum diperiksa','role-note'),node('p','Baca semua dokumen sebelum menyetujui. Approval belum diaktifkan pada prototipe ini.','role-note'));};const list=node('div',undefined,'role-approval-list');pending.forEach(d=>{const card=button('',()=>{sel.value=d.id;render();});card.className='role-document role-approval-item';card.append(node('strong',d.judul),node('span',`${d.flagship} · ${d.kode} · ${d.tahun} · ${d.periode}`),node('small',d.demo?'Data dummy · Menunggu persetujuan':'Menunggu persetujuan'));list.append(card);});sel.parentElement.before(list);sel.onchange=render;render();const bar=node('div',undefined,'role-dialog-actions');const disabled=button('🔒 Setujui',()=>{},true);disabled.disabled=true;bar.append(button('Minta revisi',()=>{if(role!=='bod')return;if(!comment.value.trim()){comment.required=true;comment.reportValidity();return;}const next=docs.map(d=>d.id===sel.value?audit({...d,reviewStatus:'Perlu revisi',reviewNote:comment.value,reviewer:identity()},'Meminta revisi dokumen'):d);if(save(docsKey,next)){notice.textContent='Permintaan revisi disimpan.';updateInbox();dialog.close();}}),disabled);form.append(bar);}

 const roleButtons=node('div',undefined,'role-toolbar');

 if(activity){

  const table=$('tabel-aktivitas'),body=table.tBodies[0],radios=[...screen.querySelectorAll('input[name="aktivitas-page"]')];

  let items=[...body.rows].map((r,i)=>({id:'activity-'+(i+1),number:i+1,flag:r.cells[1].textContent.trim(),component:r.cells[2].textContent.trim(),code:r.cells[3].textContent.trim(),title:r.cells[4].textContent.trim(),pillar:r.querySelector('.pilar-nama')?.textContent.trim()||r.cells[5].textContent.trim(),division:r.cells[6].textContent.trim(),pic:r.cells[7].textContent.trim(),status:r.cells[8].textContent.replace('▾','').trim(),note:r.cells[9].textContent.trim(),progress:0}));

  const originalRows=new Map([...body.rows].map((r,i)=>[items[i].id,r.cloneNode(true)]));

  const updates=read('seamolec-role-activities-v1',{});items=items.map(d=>({...d,...updates[d.id]}));items.push(...Object.values(updates).filter(d=>!items.some(i=>i.id===d.id)));

  const demoComments=[{name:'Andi Darmawan',role:'BOD',actor:'Andi Darmawan (BOD)',text:'Pastikan bukti capaian sesuai dengan target tahun 2026 sebelum laporan diajukan.',time:'2026-10-01T02:00:00Z'},{name:'Manajer Program',role:'Manajer Program',actor:'Manajer Program',text:'Dokumen pendukung sedang dilengkapi bersama tim pelaksana.',time:'2026-10-02T03:30:00Z'}];items=items.map((d,i)=>({...d,comments:d.comments===undefined&&i<4?demoComments.map(c=>({...c})):d.comments||[]}));
  let subtasks=read('seamolec-role-subtasks-v1',[{id:'sample-sub-1',parent:'activity-3',title:'Audit kebutuhan konektivitas',owner:'Staf',due:'2026-06-10',status:'Selesai'},{id:'sample-sub-2',parent:'activity-3',title:'Uji coba akses offline',owner:'Staf',due:'2026-06-30',status:'On track'},{id:'sample-sub-3',parent:'activity-3',title:'Dokumentasi pilot',owner:'Staf',due:'2026-07-15',status:'Belum mulai'}]);

  const staffRoute=location.pathname.match(/\/Staf\/aktivitas-(subtaskopened|addtask)\.html$/)?.[1];
  const requestedId=new URLSearchParams(location.search).get('activity');
  const routeParent=items.find(d=>d.id===(requestedId||'activity-3')&&!d.deleted)||items.find(d=>!d.deleted);
  const expanded=new Set(staffRoute&&routeParent?[routeParent.id]:[]);let page=1,matches=[];
  function staffNavigate(state,id){const url=new URL(state==='closed'?'aktivitas.html':`aktivitas-${state}.html`,location.href);if(id)url.searchParams.set('activity',id);location.assign(url.href);}
  dialog.addEventListener('close',()=>{if(role==='staf'&&staffRoute==='addtask')staffNavigate('subtaskopened',dialog.dataset.parent||routeParent?.id);});

  const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();

  const assigned=d=>String(d.pic).split(',').map(x=>x.trim()).includes(account().name);

  const commit=next=>{const changed=Object.fromEntries(next.map(d=>[d.id,d]));if(!save('seamolec-role-activities-v1',changed))return false;items=next;render();return true;};

  function editor(d=null){if(role!=='manajer')return;

   const form=popup(d?'Ubah aktivitas':'Tambah aktivitas');

   const flag=field(form,'Flagship',d?.flag||'AILOS',flags),component=field(form,'Program / komponen',d?.component||'',[]),division=field(form,'Divisi',d?.division||'IT&KM',['IT&KM','CPMP','Training','R&D','Admin & Finance']),code=field(form,'Kode aktivitas',d?.code||''),title=field(form,'Judul aktivitas',d?.title||''),pic=field(form,'PIC (pisahkan beberapa nama dengan koma)',d?.pic||'Arie Susanty'),pillar=field(form,'Pilar',d?.pillar||'I - IT&KM',['T - Capacity Building','R - R&D','I - IT&KM','C - CPMP']),status=field(form,'Status',d?.status||'Belum mulai',['Belum mulai','On track','Perlu perhatian','Selesai','Ditunda']),partner=field(form,'Mitra',d?.partner||'',null,'text',false),funding=field(form,'Pendanaan (Rp)',String(d?.funding||0),null,'number'),year=field(form,'Tahun target',d?.year||'2026',['2025','2026','2027','2028','2029']);funding.min=0;funding.step=1;

   const defs=read('seamolec-role-kpis-v1',[{id:'kpi-1',program:'PROGRES / ADCEND',indicator:'Adopsi kebijakan ODL oleh negara'},{id:'kpi-2',program:'FLEXERA / CREATE / CODEA / NEXEL',indicator:'Kepercayaan employer'},{id:'kpi-3',program:'R-MODE',indicator:'Alokasi dana non-inti'},{id:'kpi-4',program:'AILOS',indicator:'Penurunan konsumsi data'},{id:'kpi-5',program:'COALA',indicator:'Integrasi perubahan kapasitas institusi'}]),kpi=field(form,'KPI terkait',d?.kpiId||'',[{value:'',label:'Belum dikaitkan'},...defs.map(k=>({value:k.id,label:k.program+'  -  '+k.indicator}))], 'text',false);

   const autoCode=()=>{const prefix={'Training':'T','R&D':'R','IT&KM':'I','CPMP':'C','Admin & Finance':'A'}[division.value];const nums=items.filter(i=>i.id!==d?.id&&i.flag===flag.value&&i.component===component.value&&i.division===division.value).map(i=>Number(i.code.match(new RegExp('^'+prefix+'(\\d+)$'))?.[1]||0));code.value=prefix+(Math.max(0,...nums)+1);};

   const choices=()=>{const options=[...new Set(items.filter(i=>i.flag===flag.value).map(i=>i.component))];if(d?.flag===flag.value&&!options.includes(d.component))options.push(d.component);component.replaceChildren(...options.map(v=>new Option(v,v)));component.value=d?.flag===flag.value?d.component:options[0]||'';if(!d)autoCode();};choices();flag.onchange=()=>{choices();autoCode();};division.onchange=component.onchange=autoCode;

   form.append(node('p','Kode dibuat otomatis per program dan divisi; dapat diedit. Realisasi KPI dihitung dari hasil terverifikasi, bukan jumlah subtask.','role-note'));

   actions(form,'Simpan aktivitas',error=>{if(items.some(i=>i.id!==d?.id&&i.flag===flag.value&&i.component===component.value&&i.code===code.value.trim())){error.textContent='Kode sudah digunakan dalam program ini.';return false;}const next=audit({...d,id:d?.id||crypto.randomUUID(),number:d?.number||items.length+1,flag:flag.value,component:component.value,code:code.value.trim(),title:title.value,division:division.value,pic:pic.value,pillar:pillar.value,status:status.value,partner:partner.value,funding:Number(funding.value),year:year.value,kpiId:kpi.value,progress:d?.progress||0,note:d?.note||' - '},d?'Mengubah aktivitas':'Menambah aktivitas');return commit(d?items.map(i=>i.id===d.id?next:i):[...items,next]);},['manajer']);

  }

  function details(d){const form=popup('Detail & komentar aktivitas');author(form);form.append(node('h3',d.title),node('p',`${d.flag}  -  ${d.code}  -  ${d.division}  -  ${d.year||'2026'}`),node('p','Mitra: '+(d.partner||' - ')+'  -  Pendanaan: Rp '+new Intl.NumberFormat('id-ID').format(d.funding||0)),node('p',d.note||'Belum ada catatan.'));(d.comments||[]).forEach(c=>form.append(node('p',c.actor+'  -  '+new Date(c.time).toLocaleString('id-ID')+'  -  '+c.text)));if(role==='bod'){const comment=field(form,'Komentar BOD','',null,'textarea');actions(form,'Kirim komentar',()=>commit(items.map(i=>i.id===d.id?audit({...i,comments:[...(i.comments||[]),{...identity(),actor:account().name,text:comment.value,time:new Date().toISOString()}]},'Memberikan komentar'):i)),['bod']);}form.append(node('h3','Riwayat perubahan'));(d.history||[]).forEach(h=>form.append(node('p',`${h.actor}  -  ${new Date(h.time).toLocaleString('id-ID')}  -  ${h.action}`,'role-note')));}

  function editSubtask(s){if(role!=='staf'||s.owner!=='Staf'||(s.ownerName&&s.ownerName!==account().name))return;const form=popup('Update subtask'),status=field(form,'Status',s.status,['Belum mulai','On track','Perlu perhatian','Selesai']),note=field(form,'Catatan kegiatan',s.description||'',null,'textarea');actions(form,'Simpan subtask',()=>{const next=subtasks.map(x=>x.id===s.id?audit({...x,status:status.value,description:note.value},'Update subtask'):x);if(!save('seamolec-role-subtasks-v1',next))return false;subtasks=next;render();},['staf']);}

  function addSubtask(parent=null){if(role!=='staf')return;if(staffRoute!=='addtask'){staffNavigate('addtask',parent?.id||routeParent?.id);return;}const form=popup('Tambah subtask'),sel=field(form,'Aktivitas induk',parent?.id||routeParent?.id||'activity-3',items.filter(d=>!d.deleted).map(d=>({value:d.id,label:`${d.flag} · ${d.code} — ${d.title}`}))),title=field(form,'Judul subtask',''),description=field(form,'Deskripsi','',null,'textarea',false),owner=field(form,'Penanggung jawab',account().name+' (Staf)'),due=field(form,'Tenggat','',null,'date');owner.disabled=true;dialog.dataset.parent=sel.value;sel.onchange=()=>dialog.dataset.parent=sel.value;actions(form,'Simpan subtask',()=>{const next=[...subtasks,{id:crypto.randomUUID(),parent:sel.value,title:title.value,description:description.value,owner:'Staf',ownerName:account().name,due:due.value,status:'Belum mulai'}];if(!save('seamolec-role-subtasks-v1',next))return false;subtasks=next;expanded.add(sel.value);render();},['staf']);}

  function upload(parent=null){
   if(role!=='manajer')return;
   const form=popup('Upload tautan dokumen');dialog.classList.add('role-upload-dialog');
   const title=field(form,'Judul dokumen',''),url=field(form,'Tautan dokumen','',null,'url');
   const flag=field(form,'Flagship',parent?.flag||'',[{value:'',label:'Lintas flagship / Umum'},...flags]),strat=field(form,'Kode strategi',parent?strategy[parent.flag]:'',[{value:'',label:'Umum / Tanpa strategi tertentu'},'ST1','ST3','WT2','WT3','WO2']),code=field(form,'Kode aktivitas',parent?.code||'',[]);
   const search=field(form,'Aktivitas terkait',parent?`${parent.flag} · ${parent.code} — ${parent.title}`:'');search.placeholder='Ketik flagship, kode, atau nama aktivitas';search.required=false;search.setAttribute('role','combobox');search.setAttribute('aria-autocomplete','list');search.setAttribute('aria-controls','upload-activity-results');
   const results=node('div',undefined,'role-activity-results');results.id='upload-activity-results';results.setAttribute('role','listbox');search.parentElement.append(results);let selected=parent;
   const division=field(form,'Divisi',parent?.division||'CPMP',[...new Set(['IT&KM','CPMP','Training','R&D','Admin & Finance',...items.map(i=>i.division)])]),year=field(form,'Tahun',parent?.year||'2026',['2025','2026','2027','2028','2029']),period=field(form,'Periode laporan','Tahunan',['Tahunan','Q1','Q2','Q3','Q4','Semester 1','Semester 2']),type=field(form,'Jenis dokumen','Laporan teknis',['Laporan kuartalan','Laporan tahunan','Laporan Dampak Tahunan','Laporan teknis','Laporan keuangan','Audit / evaluasi','Notulen / kebijakan','Bukti aktivitas']),cover=field(form,'Tautan gambar cover (opsional)','',null,'url',false),note=field(form,'Keterangan (opsional)','',null,'textarea',false);
   let resultButtons=[];
   const options=()=>{const keep=code.value;code.replaceChildren(new Option('Umum / Tanpa kode aktivitas',''),...[...new Set(items.filter(d=>!d.deleted&&(!flag.value||d.flag===flag.value)).map(d=>d.code))].map(v=>new Option(v,v)));code.value=[...code.options].some(o=>o.value===keep)?keep:'';};options();if(parent)code.value=parent.code;
   const choose=d=>{selected=d;flag.value=d.flag;options();code.value=d.code;strat.value=strategy[d.flag]||'';division.value=d.division;year.value=d.year||'2026';search.value=`${d.flag} · ${d.code} — ${d.title}`;results.hidden=true;search.setAttribute('aria-expanded','false');};
   const find=()=>{const words=normalize(search.value).split(' ').filter(Boolean);const list=items.filter(d=>!d.deleted&&(!flag.value||d.flag===flag.value)&&(!code.value||d.code===code.value)&&words.every(w=>normalize(`${d.flag} ${d.code} ${d.title} ${d.component}`).includes(w)));results.replaceChildren();resultButtons=list.map(d=>{const b=button(`${d.flag} · ${d.code} — ${d.title}`,()=>choose(d));b.setAttribute('role','option');results.append(b);return b;});if(!list.length)results.append(node('p','Tidak ada aktivitas yang cocok.'));results.hidden=false;search.setAttribute('aria-expanded','true');};
   results.hidden=true;search.onfocus=find;search.oninput=()=>{selected=null;find();};search.onkeydown=e=>{if(e.key==='ArrowDown'&&resultButtons.length){e.preventDefault();resultButtons[0].focus();}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();results.hidden=true;search.setAttribute('aria-expanded','false');}};results.onkeydown=e=>{const index=resultButtons.indexOf(document.activeElement);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();resultButtons[(index+(e.key==='ArrowDown'?1:-1)+resultButtons.length)%resultButtons.length]?.focus();}};
   flag.onchange=()=>{selected=null;search.value='';strat.value=strategy[flag.value]||'';options();find();};code.onchange=()=>{selected=null;search.value='';find();};
   actions(form,'Kirim dokumen',error=>{if(!safeURL(url.value)||(cover.value&&!safeURL(cover.value))){error.textContent='Gunakan tautan HTTP atau HTTPS yang valid.';return false;}if(search.value.trim()&&!selected){error.textContent='Pilih aktivitas dari hasil pencarian.';return false;}const d=selected;const next=[...documents(),audit({id:crypto.randomUUID(),judul:title.value,url:safeURL(url.value),flagship:flag.value,strategi:strategy[flag.value]||strat.value,kode:code.value,aktivitas:d?.id||'',aktivitasJudul:d?.title||'',activityId:d?.id||'',divisi:division.value,tahun:year.value,periode:period.value,jenis:type.value,catatan:note.value,cover:cover.value?safeURL(cover.value):'',uploadedBy:identity(),uploadedAt:new Date().toISOString(),reviewStatus:'Menunggu approval BOD'},'Mengunggah tautan untuk persetujuan BOD')];if(!save(docsKey,next))return false;notice.textContent='Tautan disimpan dan dikirim untuk persetujuan BOD.';render();updateInbox();},['manajer']);
  }
  function removeActivity(d){if(role!=='manajer')return;const form=popup('Hapus aktivitas?');form.append(node('p',d.flag+' · '+d.code+' — '+d.title),node('p','Aktivitas dan subtask disembunyikan dari daftar. Dokumen asli tidak dihapus.','role-note'));actions(form,'Hapus aktivitas',()=>commit(items.map(i=>i.id===d.id?audit({...i,deleted:true},'Menghapus aktivitas'):i)),['manajer']);form.querySelector('.tombol-utama').classList.add('role-danger-fill');}
  function render(){

   const words=normalize($('f-cari').value).split(' ').filter(Boolean),flag=$('f-flagship').value?$('f-flagship').selectedOptions[0].textContent.split(' — ')[0].trim():'';

   matches=items.filter(d=>!d.deleted&&(!flag||d.flag===flag)&&['divisi','pilar','status'].every(k=>!$('f-'+k).value||({divisi:d.division,pilar:d.pillar,status:d.status})[k]===$('f-'+k).value)&&words.every(w=>normalize([...Object.values(d),...subtasks.filter(s=>s.parent===d.id).map(s=>s.title)].join(' ')).includes(w)));

   const pages=Math.max(1,Math.ceil(matches.length/10));

   while(radios.length<pages){const i=radios.length,r=node('input');r.type='radio';r.name='aktivitas-page';r.className='sr-only';r.id='aktivitas-page-'+(i+1);r.onchange=()=>{page=i+1;render();};$('tabel-bungkus').before(r);const label=node('label',String(i+1),'aktivitas-page-label');label.htmlFor=r.id;screen.querySelector('.aktivitas-pagination label').parentElement.append(label);radios.push(r);}

   page=Math.min(page,pages);table.classList.toggle('role-manager-table',role==='manajer');body.replaceChildren();const head=table.tHead.rows[0];head.querySelector('.role-actions-head')?.remove();if(role==='manajer')head.append(node('th','AKSI','role-actions-head'));

   matches.slice((page-1)*10,page*10).forEach(d=>{let row=originalRows.get(d.id)?.cloneNode(true);if(!row){row=node('tr');for(let i=0;i<10;i++)row.append(node('td'));}row.dataset.activityId=d.id;if(['Perlu perhatian','Ditunda'].includes(d.status))row.dataset.risiko='';else delete row.dataset.risiko;

    [String(d.number),d.flag,d.component,d.code,d.title,d.pillar,d.division,d.pic,d.status,d.note||'—'].forEach((text,i)=>{row.cells[i].replaceChildren(i===8?badge(text):node('span',text));});

    const pillarCell=node('span',undefined,'pilar-sel');pillarCell.append(node('span',d.pillar.charAt(0),'pilar-tanda'),node('span',d.pillar,'pilar-nama'));row.cells[5].replaceChildren(pillarCell);row.cells[4].classList.add('td-aktivitas');

    const tools=node('div',undefined,'role-row-tools');const toggle=link('',()=>{if(role==='staf'){staffNavigate(expanded.has(d.id)?'closed':'subtaskopened',d.id);return;}expanded.has(d.id)?expanded.delete(d.id):expanded.add(d.id);render();});toggle.classList.add('role-subtask-toggle');toggle.setAttribute('aria-label','See Subtask ('+subtasks.filter(s=>s.parent===d.id).length+')');toggle.setAttribute('aria-expanded',String(expanded.has(d.id)));toggle.append(node('span',expanded.has(d.id)?'⌃':'⌄','role-subtask-arrow'),node('span','See Subtask ('+subtasks.filter(s=>s.parent===d.id).length+')'));tools.append(toggle);

    if(role==='manajer'){if(d.submission==='Menunggu verifikasi Manager')tools.append(link('Verifikasi progres',()=>{if(role!=='manajer')return;commit(items.map(i=>i.id===d.id?audit({...i,status:i.proposedStatus||i.status,submission:'Progres tervalidasi'},'Manager memverifikasi progres'):i));}));}if(role==='staf')tools.append(link('+ Subtask',()=>addSubtask(d)));row.cells[4].append(tools);row.cells[9].replaceChildren(node('span',d.comments?.length?d.comments[d.comments.length-1].text:(d.note||'—'),'role-comment-preview'),link('Detail / komentar',()=>details(d)),link('Dokumen',()=>viewDocs(d)));if(d.submission)row.cells[9].append(node('span',d.submission,'role-status'));if(role==='manajer'){const statusWrap=node('div',undefined,'role-inline-status'),select=node('select',undefined,'role-status-select');['Belum mulai','On track','Perlu perhatian','Selesai','Ditunda'].forEach(v=>select.add(new Option(v,v)));select.value=d.status;select.setAttribute('aria-label','Ubah status '+d.title);select.onchange=()=>{if(role!=='manajer')return;commit(items.map(i=>i.id===d.id?audit({...i,status:select.value},'Mengubah status menjadi '+select.value):i));};statusWrap.append(badge(d.status),node('span','⌄','role-status-chevron'),select);row.cells[8].replaceChildren(statusWrap);const cell=node('td',undefined,'role-actions-cell');const actionGroup=node('div',undefined,'role-actions-group');actionGroup.append(icon('edit','Edit aktivitas '+d.title,()=>editor(d)),icon('delete','Hapus aktivitas '+d.title,()=>removeActivity(d)));cell.append(actionGroup);row.append(cell);}body.append(row);

    if(expanded.has(d.id)){const subrow=node('tr',undefined,'role-subtasks'),cell=node('td');cell.colSpan=role==='manajer'?11:10;const list=subtasks.filter(s=>s.parent===d.id);if(!list.length)cell.append(node('span','Belum ada subtask.','role-note'));list.forEach(s=>{const line=node('div',undefined,'role-subtask-line');line.append(node('span','↳ '+s.title),node('span',s.ownerName||s.owner),node('span',s.due),badge(s.status));if(role==='staf'&&s.owner==='Staf'&&(!s.ownerName||s.ownerName===account().name))line.append(link('Ubah subtask',()=>editSubtask(s)));cell.append(line);});subrow.append(cell);body.append(subrow);}

   });

   radios.forEach((r,i)=>{r.checked=i+1===page;r.disabled=i>=pages;screen.querySelector(`label[for="${r.id}"]`).hidden=i>=pages;});$('filter-hitung').textContent=`Menampilkan ${matches.length} dari ${items.filter(d=>!d.deleted).length} aktivitas`;screen.querySelector('.aktivitas-pagination p').textContent=matches.length?`${(page-1)*10+1}–${Math.min(page*10,matches.length)} dari ${matches.length} aktivitas`:'0 aktivitas';$('tabel-bungkus').hidden=!matches.length;$('hasil-kosong').hidden=!!matches.length;

   roleButtons.replaceChildren();if(role==='bod')roleButtons.append(button('Kelola flagship',manageFlags));if(role==='manajer')roleButtons.append(button('Upload tautan',()=>upload()),button('Tambah aktivitas',()=>editor(),true));if(role==='staf')roleButtons.append(button('Tambah subtask',()=>addSubtask()));if(role==='pic'){const disabled=button('Upload tautan',()=>{});disabled.disabled=true;disabled.title='Upload dokumen hanya untuk Manager';roleButtons.append(disabled);}

  }

  screen.querySelector('.filter-aksi').prepend(roleButtons);

  ['flagship','divisi','pilar','status'].forEach(k=>$('f-'+k).onchange=()=>{page=1;render();});$('f-cari').oninput=$('f-cari').onsearch=()=>{page=1;render();};radios.forEach((r,i)=>r.onchange=()=>{page=i+1;render();});$('tombol-reset').onclick=()=>{['flagship','divisi','pilar','status','cari'].forEach(k=>$('f-'+k).value='');page=1;render();};$('tombol-ekspor-aktivitas').onclick=()=>csv('aktivitas-filter.csv',[['No','Flagship','Program','Kode','Aktivitas','Pilar','Divisi','PIC','Status','Catatan'],...matches.map(d=>[d.number,d.flag,d.component,d.code,d.title,d.pillar,d.division,d.pic,d.status,d.note])]);

  $('hasil-kosong').textContent='Tidak ada aktivitas yang cocok. Ubah pencarian atau reset filter.';

  window.renderRolePage=()=>{page=staffRoute&&routeParent?Math.floor(items.filter(d=>!d.deleted).findIndex(d=>d.id===routeParent.id)/10)+1:1;render();};
  window.openStaffRoute=()=>{if(role==='staf'&&staffRoute==='addtask')addSubtask(routeParent);};

 } else {

  let kpis=[...screen.querySelectorAll('tbody tr')].map((r,i)=>({id:'kpi-'+(i+1),category:r.cells[0].textContent.trim(),program:r.cells[1].textContent.trim(),indicator:r.cells[2].textContent.trim(),target:Number(r.cells[3].textContent.replaceAll('.','').replace(',','.')),unit:r.cells[4].textContent.trim(),actual:r.querySelector('input').value===''?null:Number(r.querySelector('input').value),group:i<5?'strategi':'smart',review:''}));

  const stored=read('seamolec-role-kpis-v1',null);if(Array.isArray(stored)&&stored.length)kpis=stored;

  const allowed=d=>false;

  const number=v=>v==null?'—':new Intl.NumberFormat('id-ID',{maximumFractionDigits:3}).format(v);

  function commit(next){if(!save('seamolec-role-kpis-v1',next))return false;kpis=next;render();return true;}

  function editKPI(d=null){if(role!=='bod')return;const form=popup(d?'Ubah KPI':'Tambah KPI'),program=field(form,'Flagship / program',d?.program||'AILOS',[...new Set([...flags,...kpis.map(k=>k.program)])]),indicator=field(form,'Rumusan indikator',d?.indicator||'',null,'textarea'),target=field(form,'Target',String(d?.target??0.3),null,'number'),unit=field(form,'Satuan',d?.unit||'% penurunan'),year=field(form,'Tahun target',d?.year||'2027',['2025','2026','2027','2028','2029']);target.min='0.000001';target.step=unit.value.includes('%')?'any':'1';unit.oninput=()=>target.step=unit.value.includes('%')?'any':'1';actions(form,'Simpan KPI',()=>commit(d?kpis.map(k=>k.id===d.id?{...k,program:program.value,indicator:indicator.value,target:Number(target.value),unit:unit.value,year:year.value}:k):[...kpis,{id:crypto.randomUUID(),category:'Strategi',program:program.value,indicator:indicator.value,target:Number(target.value),unit:unit.value,year:year.value,actual:null,group:'strategi',review:''}]),['bod']);}

  function actual(d){if(role!=='pic'||!allowed(d))return;const form=popup('Isi realisasi: '+d.program),target=field(form,'Target',`${number(d.target)} ${d.unit}`);target.disabled=true;const year=field(form,'Tahun','2026',['2025','2026','2027','2028','2029']),quarter=field(form,'Kuartal','Q2',['Q1','Q2','Q3','Q4']),value=field(form,'Realisasi',String(d.pending??d.actual??''),null,'number');value.step='any';value.min=0;const evidence=documents().filter(doc=>d.program.split(' / ').some(p=>doc.flagship===p));const proof=field(form,'Sumber bukti',evidence[0]?.id||'',evidence.length?evidence.map(doc=>({value:doc.id,label:doc.judul})):[{value:'',label:'Belum ada bukti — upload melalui Aktivitas'}]);proof.required=true;form.append(node('p','Bukti diunggah melalui halaman Aktivitas.','role-note'));const note=field(form,'Catatan','',null,'textarea',false);form.append(button('Simpan draf',()=>{if(role!=='pic'||!value.reportValidity())return;if(commit(kpis.map(k=>k.id===d.id?{...k,pending:Number(value.value),evidence:proof.value,period:year.value+' · '+quarter.value,submissionNote:note.value,review:'Draf realisasi'}:k)))dialog.close();}));actions(form,'Kirim verifikasi',()=>commit(kpis.map(k=>k.id===d.id?{...k,pending:Number(value.value),evidence:proof.value,period:year.value+' · '+quarter.value,submissionNote:note.value,review:'Menunggu verifikasi Manager'}:k)),['pic']);}

  function verify(d){if(role!=='manajer')return;const form=popup('Verifikasi realisasi');form.append(node('p',d.program+' — '+d.indicator),node('p',`Target: ${number(d.target)} ${d.unit}`),node('p',`Realisasi diajukan: ${number(d.pending)} · ${d.period||''}`));const proof=documents().find(doc=>doc.id===d.evidence);if(proof){const a=node('a',proof.judul);a.href=safeURL(proof.url);a.target='_blank';a.rel='noopener noreferrer';form.append(a);}const note=field(form,'Catatan verifikasi','',null,'textarea',false);const bar=node('div',undefined,'role-dialog-actions');bar.append(button('Kembalikan',()=>{if(role!=='manajer')return;if(!note.value.trim()){note.required=true;note.reportValidity();return;}if(commit(kpis.map(k=>k.id===d.id?{...k,review:'Perlu revisi',reviewNote:note.value}:k)))dialog.close();}),button('Validasi data',()=>{if(role!=='manajer'||d.pending==null)return;if(commit(kpis.map(k=>k.id===d.id?{...k,actual:k.pending,pending:null,review:'Tervalidasi',reviewNote:note.value}:k)))dialog.close();},true));form.append(bar);}

  function correctActual(d){if(role!=='bod')return;const form=popup('Koreksi realisasi KPI'),value=field(form,'Realisasi',String(d.actual??''),null,'number'),reason=field(form,'Alasan koreksi','',null,'textarea');value.min=0;value.step=d.unit.includes('%')?'any':'1';form.append(node('p','Realisasi counting harus bilangan bulat. Koreksi dicatat atas nama BOD.','role-note'));actions(form,'Simpan koreksi',()=>commit(kpis.map(k=>k.id===d.id?audit({...k,actual:Number(value.value),review:'Koreksi BOD',reviewNote:reason.value},'Koreksi realisasi: '+reason.value):k)),['bod']);}

  function annual(){if(!['bod','manajer'].includes(role))return;const form=popup(role==='bod'?'Tetapkan target tahunan':'Usulan target tahunan'),sel=field(form,'KPI',kpis[0].id,kpis.map(d=>({value:d.id,label:d.program+'  -  '+d.indicator}))),year=field(form,'Tahun','2026',['2025','2026','2027','2028','2029']),value=field(form,'Target tahunan','',null,'number'),note=field(form,'Catatan / alasan','',null,'textarea');value.min=0;const update=()=>{const d=kpis.find(k=>k.id===sel.value);value.step=d.unit.includes('%')?'any':'1';value.value=(role==='bod'?d.annualProposal?.[year.value]:null)??d.annualTargets?.[year.value]??'';};sel.onchange=year.onchange=update;update();form.append(node('p','Target tahunan kumulatif. Alur Manager mengusulkan dan BOD menetapkan masih merupakan usulan prototipe.','role-note'));actions(form,role==='bod'?'Tetapkan target':'Kirim usulan',()=>commit(kpis.map(k=>k.id===sel.value?audit({...k,[role==='bod'?'annualTargets':'annualProposal']:{...(role==='bod'?k.annualTargets:k.annualProposal),[year.value]:Number(value.value)},annualNote:note.value},(role==='bod'?'Menetapkan':'Mengusulkan')+' target '+year.value):k)),['bod','manajer']);}

  function render(){let counts={done:0,ontrack:0,attention:0,empty:0};['strategi','smart'].forEach(group=>{const tbody=$('kpi-isi-'+group);tbody.replaceChildren();kpis.filter(d=>d.group===group).forEach(d=>{const ratio=d.actual==null?null:d.actual/d.target,status=ratio==null?'Belum ada data':ratio>=1?'Tercapai':ratio>=.7?'On track':'Perlu perhatian';counts[ratio==null?'empty':ratio>=1?'done':ratio>=.7?'ontrack':'attention']++;

   const tr=node('tr');tr.dataset.kpiId=d.id;[d.category,d.program,d.indicator].forEach((v,i)=>tr.append(node('td',v,['kk-kat','kk-prog','kk-rumus'][i])));const target=node('td',number(d.target),'kk-target td-angka');if(role==='bod')target.append(link(' ✎',()=>editKPI(d)));tr.append(target,node('td',d.unit,'kk-satuan'));const cell=node('td'),input=node('input',undefined,'realisasi-input');input.type='number';input.step='any';input.min=0;input.value=d.actual??'';input.readOnly=true;input.setAttribute('aria-label','Realisasi untuk '+d.program);input.onclick=()=>{if(role==='bod')correctActual(d);};cell.append(input);if(role==='pic'&&allowed(d))cell.append(link('Isi realisasi',()=>actual(d)));if(d.pending!=null)cell.append(node('span','Diajukan: '+number(d.pending),'role-status'));tr.append(cell,node('td',ratio==null?'—':new Intl.NumberFormat('id-ID',{minimumFractionDigits:1,maximumFractionDigits:1}).format(ratio*100)+'%','kk-capa'));const stat=node('td',undefined,'kk-stat');stat.append(badge(status));if(d.review)stat.append(node('span',d.review,'role-status'));if(role==='manajer'&&d.review==='Menunggu verifikasi Manager')stat.append(link('Verifikasi',()=>verify(d)));tr.append(stat);tbody.append(tr);

  });screen.querySelector('#kpi-grup-'+group).nextElementSibling.textContent=`${kpis.filter(k=>k.group===group).length} indikator · ${group==='strategi'?'sasaran strategis FYDP':'target SMART akhir periode'}`;});

  $('kpi-ringkas').replaceChildren(node('span',`${kpis.length-counts.empty} dari ${kpis.length} indikator memiliki realisasi.`),badge('Tercapai '+counts.done),badge('On track '+counts.ontrack),badge('Perlu perhatian '+counts.attention),badge('Belum ada data '+counts.empty));roleButtons.replaceChildren();if(role==='bod')roleButtons.append(button('Kelola flagship',manageFlags),button('Tambah KPI',()=>editKPI(),true));if(role==='manajer')roleButtons.append(button('Verifikasi realisasi ('+kpis.filter(k=>k.review==='Menunggu verifikasi Manager').length+')',()=>{const d=kpis.find(k=>k.review==='Menunggu verifikasi Manager');if(d)verify(d);else notice.textContent='Belum ada realisasi yang menunggu verifikasi.';}));if(['bod','manajer'].includes(role))roleButtons.append(button('Target per tahun',annual));

  }

  const exportButton=screen.querySelector('.kpi-kaki button');const tools=node('div',undefined,'role-toolbar');exportButton.before(tools);tools.append(roleButtons,exportButton);exportButton.onclick=()=>csv('kpi.csv',[['Kategori','Program','Indikator','Target','Satuan','Realisasi','Status verifikasi'],...kpis.map(d=>[d.category,d.program,d.indicator,d.target,d.unit,d.actual,d.review])]);

  window.renderRolePage=render;

 }

 function changeRole(){dialog.close();role=selector.value;notice.textContent=role==='staf'?'Akses lihat'+(activity?' · Staf dapat menambahkan subtask.':'.'):role==='pic'?'Penugasan contoh: '+account().name+' · '+(activity?'Akses lihat aktivitas; upload dokumen dinonaktifkan.':'Akses lihat KPI; update bukti dilakukan melalui Aktivitas.'):role==='bod'?'BOD · Kelola flagship, KPI, dan persetujuan dokumen.':'Manajer Program · '+(activity?'Kelola aktivitas dan verifikasi dokumen.':'Pantau realisasi dan ajukan target tahunan kepada BOD.');window.renderRolePage();updateInbox();}

 selector.onchange=changeRole;changeRole();window.openStaffRoute?.();

})();

