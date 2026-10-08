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
 const account=()=>window.currentUser||read('seamolec-role-accounts-v1',{})[role]||({bod:{name:'Andi Darmawan'},manajer:{name:'Manajer Program'},staf:{name:'Rafa',roleLabel:'Staf IT'},pic:{name:'Arie Susanty'}}[role]);
 const staffIdentity=()=>({name:account().name,role:account().roleLabel||('Staf'+(account().division?' '+account().division:''))});
 const identity=()=>({name:account().name,role:labels[role]});
 const audit=(d,action)=>({...d,history:[...(d.history||[]),{...identity(),actor:account().name+' ('+labels[role]+')',action,time:new Date().toISOString()}]});
 function author(form){const info=identity();const input=field(form,'Komentar sebagai',info.name+' · '+info.role);input.readOnly=true;return info;}
 function icon(kind,label,fn){const b=button('',fn);b.className='role-icon'+(kind==='delete'?' role-danger':'');b.title=label;b.setAttribute('aria-label',label);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',kind==='edit'?'M15 5l4 4M4 20l4-1L20 7l-4-4L4 15v5Z':kind==='upload'?'M5 3h10v6h4v12H5V3ZM15 3v6M17 2h6M20 0v6':kind==='details'?'M6 3h8l4 4v14H6V3ZM14 3v5h4M9 12h6M9 16h6':kind==='comments'?'M4 4h16v13H9l-5 4V4ZM8 8h8M8 12h6':kind==='delete'?'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7':'M4 4h16l2 10v6H2v-6L4 4ZM2 14h6l2 3h4l2-3h6');svg.append(path);b.append(svg);return b;}

 const notice=node('p','','role-note');notice.setAttribute('role','status');screen.querySelector('.layar-head').after(notice);

 const safeURL=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};

 const csv=(name,rows)=>{const cell=v=>'"'+(/^[\s]*[=+@-]/.test(String(v))?"'":'')+String(v??'').replaceAll('"','""')+'"';const u=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=node('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};

 const dialog=node('dialog',undefined,'role-dialog');dialog.id='role-popup';dialog.setAttribute('aria-labelledby','role-popup-title');document.body.append(dialog);

 function popup(title){dialog.classList.remove('role-upload-dialog','role-approval-dialog','role-chat-dialog','role-editor-dialog','role-flagship-dialog','kpi-editor-dialog');dialog.replaceChildren();const head=node('div',undefined,'role-dialog-head'),h=node('h2',title);h.id='role-popup-title';const close=button('×',()=>dialog.close());close.className='role-close';close.setAttribute('aria-label','Tutup popup');head.append(h,close);const form=node('form',undefined,'role-dialog-body');form.onsubmit=e=>e.preventDefault();dialog.append(head,form);dialog.showModal();return form;}

 function field(form,label,value='',options=null,kind='text',required=true){const wrap=node('div',undefined,'role-field'),caption=node('label',label);wrap.append(caption);const input=node(options?'select':kind==='textarea'?'textarea':'input');if(options){options.forEach(v=>input.add(new Option(typeof v==='string'?v:v.label,typeof v==='string'?v:v.value)));}else if(kind!=='textarea')input.type=kind;input.id='role-field-'+crypto.randomUUID();caption.htmlFor=input.id;input.value=value;input.required=required;wrap.append(input);form.append(wrap);return input;}

 function actions(form,text,fn,allowed){const area=node('div',undefined,'role-dialog-actions'),error=node('p','','role-error');error.setAttribute('role','alert');form.append(error,area);area.append(button('Batal',()=>dialog.close()),button(text,()=>{if(!allowed.includes(role)){dialog.close();return;}if(!form.reportValidity())return;try{if(fn(error)!==false)dialog.close();}catch{error.textContent='Periksa kembali data yang diisi.';}} ,true));}

 const flags=['AILOS','PROGRES','ADCEND','R-MODE','FLEXERA','CREATE','CODEA','NEXEL','COALA'];

 const partners=['Universitas Terbuka','Politeknik Negeri Bandung','Dinas Pendidikan Jawa Barat'];
 const strategy={AILOS:'ST3',PROGRES:'ST1',ADCEND:'ST1','R-MODE':'WT2',FLEXERA:'WT3',CREATE:'WT3',CODEA:'WT3',NEXEL:'WT3',COALA:'WO2'};

 let programs=read('seamolec-role-flagships-v1',flags.map(name=>({name,division: name==='AILOS'?'IT&KM':name==='COALA'?'R&D':['FLEXERA','CREATE','CODEA','NEXEL'].includes(name)?'Training':'CPMP'})));

 // Custom flagship codes share the same catalog across role routes and KPI.
 programs.forEach(p=>{if(!flags.includes(p.name))flags.push(p.name);strategy[p.name]=p.strategy||strategy[p.name]||'';});
 function refreshFlagshipChoices(){const select=$('f-flagship');if(!select)return;const previous=select.value;select.replaceChildren(new Option('Semua flagship',''),...flags.map(name=>new Option(name,name)));select.value=flags.includes(previous)?previous:'';}
 refreshFlagshipChoices();
 function manageFlags(){
  if(role!=='bod')return;
  const form=popup('Kelola flagship');dialog.classList.add('role-flagship-dialog');
  const intro=node('p','Pilih flagship untuk mengatur, atau tambahkan flagship baru.','role-note');form.append(intro);
  const layout=node('div',undefined,'role-flagship-layout'),sidebar=node('aside',undefined,'role-flagship-sidebar'),editor=node('section',undefined,'role-flagship-editor');form.append(layout);layout.append(sidebar,editor);
  let selected=programs[0]?.name||null;
  function drawList(){sidebar.replaceChildren();const add=button('+ Tambah flagship',()=>{selected=null;drawList();drawEditor();},true);add.classList.add('role-flagship-add');sidebar.append(add);const list=node('div',undefined,'role-flagship-list');list.setAttribute('aria-label','Daftar flagship');sidebar.append(list);
   programs.forEach(p=>{const item=button('',()=>{selected=p.name;drawList();drawEditor();});item.className='role-flagship-item'+(selected===p.name?' is-selected':'');item.setAttribute('aria-pressed',String(selected===p.name));item.append(node('strong',p.name),node('span',p.fullName||p.division),node('small',p.strategy||strategy[p.name]||'Belum dipetakan'));list.append(item);});
  }
  function drawEditor(){editor.replaceChildren();const current=programs.find(p=>p.name===selected),isNew=!current;editor.append(node('h3',isNew?'Tambah flagship':'Pengaturan '+current.name));
   const code=field(editor,'Kode flagship',current?.name||'');code.placeholder='Contoh: DIGITAL';code.maxLength=24;code.readOnly=!isNew;code.oninput=()=>{code.value=code.value.toUpperCase().replace(/\s+/g,'-');};
   const name=field(editor,'Nama flagship',current?.fullName||current?.name||'');name.placeholder='Contoh: Digital Learning Partnership';
   const row=node('div',undefined,'role-editor-row');editor.append(row);const div=field(row,'Divisi pelaksana',current?.division||'IT&KM',['IT&KM','CPMP','Training','R&D','Admin & Finance']),strat=field(row,'Kode strategi',current?.strategy||strategy[current?.name]||'ST3',['ST1','ST3','WT2','WT3','WO2']);
   const components=current?.components||window.activityProgramComponents?.(current?.name)||[];const component=field(editor,'Program / komponen awal',components[0]||'',null,'text',isNew);component.placeholder='Contoh: Pelatihan pembelajaran digital';
   editor.append(node('p',isNew?'Program awal langsung tersedia pada dropdown Tambah aktivitas.':'Kode tetap agar aktivitas yang sudah terkait tidak terputus.','role-editor-hint'));
   const error=node('p','','role-error');error.setAttribute('role','alert');const bar=node('div',undefined,'role-dialog-actions');editor.append(error,bar);
   bar.append(button('Batal',()=>dialog.close()),button(isNew?'Tambah flagship':'Simpan perubahan',()=>{
    if(role!=='bod')return;if(![code,name,div,strat,component].every(input=>input.reportValidity()))return;
    const key=code.value.trim().toUpperCase(),fullName=name.value.trim(),first=component.value.trim();
    if(!/^[A-Z][A-Z0-9-]{1,23}$/.test(key)){error.textContent='Kode berisi 2–24 karakter: huruf, angka, atau tanda hubung, diawali huruf.';code.focus();return;}
    if(!fullName||(isNew&&!first)){error.textContent='Isi nama flagship dan program awal.';return;}
    if(isNew&&programs.some(p=>p.name.toUpperCase()===key)){error.textContent='Kode flagship sudah digunakan. Pilih kode lain.';code.focus();return;}
    const nextRecord=audit({...current,name:key,fullName,division:div.value,strategy:strat.value,components:[...new Set([...(current?.components||components),...(first?[first]:[])])],createdAt:current?.createdAt||new Date().toISOString()},isNew?'Menambah flagship':'Mengatur flagship');
    const next=isNew?[...programs,nextRecord]:programs.map(p=>p.name===selected?nextRecord:p);if(!save('seamolec-role-flagships-v1',next))return;
    programs=next;if(!flags.includes(key))flags.push(key);strategy[key]=strat.value;refreshFlagshipChoices();window.renderRolePage?.();selected=key;drawList();drawEditor();notice.textContent=isNew?'Flagship '+key+' ditambahkan dan siap digunakan.':'Pengaturan flagship '+key+' disimpan.';
    const success=node('p',isNew?'Flagship berhasil ditambahkan.':'Perubahan berhasil disimpan.','role-flagship-success');success.setAttribute('role','status');editor.prepend(success);
   },true));
  }
  drawList();drawEditor();
 }

 const docsKey='seamolec-report-documents-v1';

 function documents(){return window.ActivityData.documents();}
 function docState(d){const status=d.reviewStatus;return status==='Ditolak'?{text:'Ditolak',cls:'rejected'}:status==='Disetujui'?{text:'Disetujui',cls:'approved'}:['Perlu revisi','Revisi'].includes(status)?{text:'Revisi',cls:'revision'}:{text:'Menunggu Persetujuan',cls:'pending'};}
 function docStatus(d,plain=false){const state=docState(d);return node('span',state.text,'role-doc-status role-doc-'+state.cls+(plain?' role-doc-plain':''));}
 function updateInbox(){window.ActivityNotifications?.update();}
 const roleButtons=node('div',undefined,'role-toolbar');

 if(activity){

  const table=$('tabel-aktivitas'),body=table.tBodies[0],radios=[...screen.querySelectorAll('input[name="aktivitas-page"]')];

  let items=[...body.rows].map((r,i)=>({id:'activity-'+(i+1),number:i+1,flag:r.cells[1].textContent.trim(),component:r.cells[2].textContent.trim(),code:r.cells[3].textContent.trim(),title:r.cells[4].textContent.trim(),pillar:r.querySelector('.pilar-nama')?.textContent.trim()||r.cells[5].textContent.trim(),division:r.cells[6].textContent.trim(),pic:r.cells[7].textContent.trim(),status:r.cells[8].textContent.replace('▾','').trim(),note:r.cells[9].textContent.trim(),progress:0}));

  const originalRows=new Map([...body.rows].map((r,i)=>[items[i].id,r.cloneNode(true)]));

  const updates=read('seamolec-role-activities-v1',{});items=items.map(d=>({...d,...updates[d.id]}));items.push(...Object.values(updates).filter(d=>!items.some(i=>i.id===d.id)));

  const directDemoId='demo-staff-direct-activity';
  if(!read('seamolec-staff-direct-example-v1',false)){
   if(!items.some(d=>d.id===directDemoId))items.push({id:directDemoId,number:81,flag:'AILOS',component:'Open High School (SMA Terbuka)',code:'I9',title:'Contoh: Uji coba SEAMOLEC Lite — penugasan langsung BOD',pillar:'I - IT&KM',division:'IT&KM',pic:'Rafa',status:'On track',progress:0,note:'Contoh penugasan langsung dari BOD kepada Rafa - Staf IT.',createdBy:{name:'Rafa',role:'Staf'},assignedBy:{name:'Andi Darmawan',role:'BOD'},demo:true});
   if(save('seamolec-role-activities-v1',Object.fromEntries(items.map(d=>[d.id,d]))))save('seamolec-staff-direct-example-v1',true);
  }
  const directIndex=items.findIndex(d=>d.id===directDemoId);if(directIndex>=0){const [demo]=items.splice(directIndex,1);items.splice(4,0,demo);}
  const demoComments=[{name:'Andi Darmawan',role:'BOD',actor:'Andi Darmawan (BOD)',text:'Pastikan bukti capaian sesuai dengan target tahun 2026 sebelum laporan diajukan.',time:'2026-10-01T02:00:00Z'},{name:'Manajer Program',role:'Manajer Program',actor:'Manajer Program',text:'Dokumen pendukung sedang dilengkapi bersama tim pelaksana.',time:'2026-10-02T03:30:00Z'}];items=items.map((d,i)=>({...d,comments:d.comments===undefined&&i<4?demoComments.map(c=>({...c})):d.comments||[]}));
  // Seed examples once; explicit saved user values and decisions always win.
  if(!read('seamolec-activity-flow-examples-v2',false)){
   const demoStates=['Menunggu persetujuan','Menunggu persetujuan','Disetujui','Perlu revisi','Ditolak'],now=Date.now();
   items=items.map((d,i)=>{const state=demoStates[i]||'Menunggu persetujuan',days=i===1?12:2+(i%6);return {...d,partner:d.partner??partners[i%partners.length],funding:d.funding??(i+1)*1500000,realization:d.realization??(i%3===2?15:1+i%5),realizationUnit:d.realizationUnit??(i%3===2?'%':'count'),detailNote:d.detailNote??('Contoh: '+(i%2?'Pelaksanaan program sedang berjalan; bukti pendukung dilengkapi bersama mitra.':'Dokumentasi pelaksanaan dan hasil kegiatan tersedia pada tautan dokumen.')),activityReviewStatus:d.activityReviewStatus??state,reviewRequestedAt:d.reviewRequestedAt??new Date(now-days*86400000).toISOString(),activityReviewedAt:d.activityReviewedAt??(['Disetujui','Perlu revisi','Ditolak'].includes(d.activityReviewStatus??state)?new Date(now-86400000).toISOString():null)};});
   if(save('seamolec-role-activities-v1',Object.fromEntries(items.map(d=>[d.id,d]))))save('seamolec-activity-flow-examples-v2',true);
  }
  let subtasks=read('seamolec-role-subtasks-v1',[{id:'sample-sub-1',parent:'activity-3',title:'Audit kebutuhan konektivitas',owner:'Staf',ownerName:'Rio',creator:{name:'Rio',role:'Staf IT'},due:'2026-06-10',status:'Selesai'},{id:'sample-sub-2',parent:'activity-3',title:'Uji coba akses offline',owner:'Staf',ownerName:'Rafa',creator:{name:'Rafa',role:'Staf IT'},due:'2026-06-30',status:'On track'},{id:'sample-sub-3',parent:'activity-3',title:'Dokumentasi pilot',owner:'Staf',ownerName:'Dina',creator:{name:'Dina',role:'Staf IT'},due:'2026-07-15',status:'Belum mulai'}]);

  const sampleCreators={'sample-sub-1':{name:'Rio',role:'Staf IT'},'sample-sub-2':{name:'Rafa',role:'Staf IT'},'sample-sub-3':{name:'Dina',role:'Staf IT'}};
  subtasks=subtasks.map(s=>({...s,creator:s.creator||(s.ownerName?{name:s.ownerName,role:s.ownerRole||'Staf'}:sampleCreators[s.id]||{name:s.owner||'Staf',role:'Staf'})}));
  const ownsSubtask=s=>role==='staf'&&s.creator.name===account().name;
  const expanded=new Set();let page=1,matches=[];
  const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();

  const assigned=d=>String(d.pic).split(',').map(x=>x.trim()).includes(account().name);

  const commit=next=>{const changed=Object.fromEntries(next.map(d=>[d.id,d]));if(!save('seamolec-role-activities-v1',changed))return false;items=next;render();updateInbox();return true;};

  const ownsActivity=d=>role==='staf'&&d?.createdBy?.role==='Staf'&&(d.createdBy.id&&account().id?d.createdBy.id===account().id:d.createdBy.name===account().name);
  const canManageActivity=d=>role==='manajer'||ownsActivity(d);
  if(!read('seamolec-kpi-activity-links-v2',false)){
   const next=items.map(d=>d.kpiId?d:['activity-1','activity-2','activity-3'].includes(d.id)&&d.flag==='AILOS'?{...d,kpiId:'kpi-7',kpiOutcomeId:'demo-pilot'}:d);
   if(save('seamolec-role-activities-v1',Object.fromEntries(next.map(d=>[d.id,d])))){items=next;save('seamolec-kpi-activity-links-v2',true);}
  }
  window.activityProgramComponents=name=>[...new Set(items.filter(d=>!d.deleted&&d.flag===name).map(d=>d.component))];
  function editor(d=null){if(!['manajer','staf'].includes(role)||(d&&!canManageActivity(d)))return;
   const form=popup(d?'Ubah aktivitas':'Tambah aktivitas');dialog.classList.add('role-editor-dialog');
   const row=(cls='')=>{const r=node('div',undefined,'role-editor-row '+cls);form.append(r);return r;};
   const programRow=row(),flag=field(programRow,'Flagship',d?.flag||'AILOS',flags),component=field(programRow,'Program / komponen',d?.component||'',[]);
   const titleRow=row('role-editor-title-row'),title=field(titleRow,'Judul aktivitas',d?.title||''),year=field(titleRow,'Tahun',d?.year||'2026',['2025','2026','2027','2028','2029']);title.placeholder='Nama aktivitas';
   const divisionOptions=[{value:'IT&KM',label:'I — IT&KM'},{value:'Training',label:'T — Training'},{value:'R&D',label:'R — Research & Development'},{value:'CPMP',label:'C — Communications / CPMP'},{value:'Admin & Finance',label:'A — Admin & Finance'}];
   const divisionRow=row(),division=field(divisionRow,'Divisi / pilar',d?.division||'IT&KM',divisionOptions),code=field(divisionRow,'Kode aktivitas',d?.code||'');code.placeholder='Otomatis, dapat diedit';
   const pic=field(form,'PIC (pisahkan beberapa nama dengan koma)',d?.pic||'Arie Susanty');if(role==='staf'){pic.value=account().name;pic.readOnly=true;pic.previousElementSibling.textContent='PIC (otomatis akun Anda)';}
   const financeRow=row(),partner=field(financeRow,'Mitra',d?.partner||'',[{value:'',label:'Pilih mitra (opsional)'},...partners,...(d?.partner&&!partners.includes(d.partner)?[d.partner]:[])],'text',false),funding=field(financeRow,'Pendanaan',d?.funding?String(d.funding):'',null,'number',false);funding.min=0;funding.step=1;funding.placeholder='0';
   function adorn(input,text,cls){const box=node('div',undefined,'role-editor-adornment '+cls),mark=node('span',text);mark.setAttribute('aria-hidden','true');input.parentElement.append(box);box.append(mark,input);return mark;}
   adorn(funding,'Rp','role-editor-prefix');
   const outcomeRow=row(),status=field(outcomeRow,'Status',d?.status||'Belum mulai',['Belum mulai','On track','Perlu perhatian','Selesai','Ditunda']);
   const valueArea=node('div',undefined,'role-editor-realization');outcomeRow.append(valueArea);
   const unit=field(valueArea,'Format realisasi',d?.realizationUnit||(String(d?.realization||'').endsWith('%')?'%':'count'),[{value:'count',label:'Satuan'},{value:'%',label:'Persen (%)'}]);
   const value=field(valueArea,'Realisasi aktivitas',String(parseFloat(d?.realization??d?.progress??0)||0),null,'number'),suffix=adorn(value,'%','role-editor-suffix');value.min=0;value.placeholder='0';
   const syncUnit=()=>{const percent=unit.value==='%';suffix.hidden=!percent;value.step=percent?'any':'1';value.setAttribute('aria-label',percent?'Realisasi KPI dalam persen':'Realisasi KPI dalam satuan');};unit.onchange=syncUnit;syncUnit();
   const kpiData=window.KPISystem.load(),kpiRow=row(),kpi=field(kpiRow,'KPI yang didukung',d?.kpiId||'',[]),result=field(kpiRow,'Hasil terkait',d?.kpiOutcomeId||'',[],'text',false);
   const resultName=field(form,'Nama hasil baru','',null,'text',false);resultName.placeholder='Contoh: Pilot Maluku';
   const syncResultName=()=>{const show=result.value==='new';resultName.parentElement.hidden=!show;resultName.required=show;};result.onchange=syncResultName;
   function syncResults(){const previous=result.value,k=kpiData.kpis.find(k=>k.id===kpi.value),existing=kpiData.outcomes.filter(o=>o.kpiId===kpi.value);const extra=!k?[]:k.method==='count'&&k.unit.toLowerCase()==='negara'?window.KPISystem.COUNTRIES.filter(c=>!existing.some(o=>o.entity===c[0])).map(c=>new Option(c[1],'country:'+c[0])):[new Option(k.method==='count'?'+ Tambah hasil baru':'Pengukuran tahun aktivitas',k.method==='count'?'new':'measurement')];result.replaceChildren(new Option('Belum memilih hasil',''),...existing.map(o=>new Option(o.name,o.id)),...extra);result.value=existing.some(o=>o.id===previous)?previous:'';syncResultName();}
   function syncKpis(){const previous=kpi.value||d?.kpiId||'';kpi.replaceChildren(new Option('Tidak terkait KPI',''),...kpiData.kpis.filter(k=>k.flags.includes(flag.value)).map(k=>new Option(k.code+' · '+k.indicator,k.id)));kpi.value=kpiData.kpis.some(k=>k.id===previous&&k.flags.includes(flag.value))?previous:'';syncResults();if(d?.kpiOutcomeId&&kpiData.outcomes.some(o=>o.id===d.kpiOutcomeId&&o.kpiId===kpi.value))result.value=d.kpiOutcomeId;}
   kpi.onchange=()=>{syncResults();};syncKpis();
   const prefixFor=()=>({'Training':'T','R&D':'R','IT&KM':'I','CPMP':'C','Admin & Finance':'A'}[division.value]);
   const autoCode=()=>{const prefix=prefixFor();const nums=items.filter(i=>!i.deleted&&i.id!==d?.id&&i.flag===flag.value&&i.component===component.value&&i.division===division.value).map(i=>Number(i.code.match(new RegExp('^'+prefix+'(\\d+)$'))?.[1]||0));code.value=prefix+(Math.max(0,...nums)+1);};
   const choices=()=>{const options=[...new Set([...(programs.find(p=>p.name===flag.value)?.components||[]),...items.filter(i=>!i.deleted&&i.flag===flag.value).map(i=>i.component)])];if(d?.flag===flag.value&&!options.includes(d.component))options.push(d.component);component.replaceChildren(...options.map(v=>new Option(v,v)));component.value=d?.flag===flag.value?d.component:options[0]||'';if(!d)autoCode();};choices();flag.onchange=()=>{division.value=programs.find(p=>p.name===flag.value)?.division||division.value;choices();autoCode();syncKpis();};division.onchange=component.onchange=autoCode;
   form.append(node('p','Pilih KPI dan hasil terkait, lalu simpan bukti melalui detail aktivitas. Approve BOD menyatakan hasil tersebut terbukti dan memasukkannya ke perhitungan KPI.','role-editor-hint'));
   actions(form,'Simpan aktivitas',error=>{const realization=Number(value.value);if(!Number.isFinite(realization)||realization<0||(unit.value==='count'&&!Number.isInteger(realization))){error.textContent='Gunakan bilangan bulat untuk satuan, atau pilih persen untuk nilai desimal.';return false;}if(items.some(i=>!i.deleted&&i.id!==d?.id&&i.flag===flag.value&&i.component===component.value&&i.code===code.value.trim())){error.textContent='Kode sudah digunakan dalam program ini.';return false;}
    const pillar={'Training':'T - Capacity Building','R&D':'R - R&D','IT&KM':'I - IT&KM','CPMP':'C - CPMP','Admin & Finance':'A - Admin & Finance'}[division.value];
    const oldKpi=window.KPISystem.load(),planned=window.KPISystem.planResult(oldKpi,kpi.value,result.value,resultName.value,year.value);if(planned.error){error.textContent=planned.error;return false;}
    const now=new Date().toISOString(),changed=!d||realization!==Number(parseFloat(d.realization??d.progress??0))||unit.value!==(d.realizationUnit||'count')||kpi.value!==d.kpiId||planned.id!==(d.kpiOutcomeId||'')||year.value!==d.year;
    const next=audit({...d,createdBy:d?.createdBy||{...identity(),id:account().id||null},id:d?.id||crypto.randomUUID(),createdAt:d?.createdAt||now,number:d?.number||items.length+1,flag:flag.value,component:component.value,code:code.value.trim(),title:title.value.trim(),division:division.value,pic:role==='staf'?account().name:pic.value,pillar,status:status.value,partner:partner.value,funding:Number(funding.value||0),year:year.value,kpiId:kpi.value,kpiOutcomeId:planned.id,kpiFulfilled:changed?false:d?.kpiFulfilled,realization,realizationUnit:unit.value,activityReviewStatus:changed?'Menunggu persetujuan':d.activityReviewStatus,reviewRequestedAt:changed?now:d.reviewRequestedAt,activityReviewedAt:changed?null:d.activityReviewedAt,progress:d?.progress||0,note:d?.note||' - '},d?'Mengubah aktivitas':'Menambah aktivitas');
    const transitioned=changed?window.KPISystem.activityResult(planned.state,next,{status:'planned',actor:identity()}):planned;if(!window.KPISystem.persist(transitioned.state)){error.textContent='Data KPI tidak dapat disimpan.';return false;}const saved=commit(d?items.map(i=>i.id===d.id?next:i):[...items,next]);if(!saved)window.KPISystem.persist(oldKpi);if(saved&&!d){['flagship','divisi','pilar','status'].forEach(k=>$('f-'+k).value='');$('f-cari').value=next.title;page=1;render();notice.textContent='Aktivitas tersimpan. Klik ikon detail/komentar untuk menambahkan tautan dan catatan.';}return saved;},['manajer','staf']);
  }

  const reviewClock=read('seamolec-activity-review-clock-v1',{});
  function activityReviewIndicator(d){
   const area=node('span',undefined,'role-activity-review-indicator');
   if(['Disetujui','Perlu revisi','Ditolak'].includes(d.activityReviewStatus)||d.activityReviewedAt)return area;
   let since=d.reviewRequestedAt||d.createdAt||reviewClock[d.id];
   if(!since){const times=documents().filter(doc=>doc.activityId===d.id||(!doc.activityId&&doc.flagship===d.flag&&doc.kode===d.code)).map(doc=>Date.parse(doc.uploadedAt)).filter(Number.isFinite);since=new Date(times.length?Math.min(...times):Date.now()).toISOString();reviewClock[d.id]=since;save('seamolec-activity-review-clock-v1',reviewClock);}
   const overdue=Date.now()-Date.parse(since)>10*24*60*60*1000;
   const label=overdue?'Perlu tindakan BOD — menunggu lebih dari 10 hari':'Perlu tindakan BOD — menunggu persetujuan aktivitas';
   area.title=label;area.setAttribute('aria-label',label);area.setAttribute('role','img');area.classList.add(overdue?'role-review-overdue':'role-review-pending');
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',overdue?'M12 3 2 21h20L12 3ZM12 9v5M12 17v1':'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18ZM12 7v6M12 16v1');svg.append(path);area.append(svg);return area;
  }
  function details(d){
   const readChanges=readActivityComments(d);if(readChanges&&commit(items.map(i=>i.id===d.id?readChanges:i)))d=readChanges;
   const form=popup('Detail & komentar aktivitas');dialog.classList.add('role-chat-dialog');
   const current=()=>items.find(i=>i.id===d.id)||d;
   const editable=role==='manajer',opened=new Set(),related=()=>documents().filter(doc=>doc.activityId===d.id||(!doc.activityId&&doc.flagship===d.flag&&doc.kode===d.code));
   const reviewSignature=()=>{const a=current();return JSON.stringify([a.kpiId,a.kpiOutcomeId,a.year,a.kpiMeasurement,a.detailNote,a.reviewRequestedAt,related().map(doc=>[doc.id,doc.url])]);},openedSignature=reviewSignature();
   const summary=node('div',undefined,'role-chat-summary');
   summary.append(node('h3',d.title,'role-detail-title'));
   const review=()=>current().activityReviewStatus||'Menunggu persetujuan';
   const requiresRevision=()=>role==='manajer'&&['Perlu revisi','Revisi'].includes(review());
   const state=docStatus({reviewStatus:review()});state.setAttribute('aria-label','Status persetujuan aktivitas: '+review());dialog.querySelector('.role-dialog-head').insertBefore(state,dialog.querySelector('.role-close'));
   summary.append(node('p',`${d.flag} · ${d.code} · ${d.division} · ${d.year||'2026'}`,'role-note'));form.append(summary);
   const actual=d.realization??d.progress??0;const actualText=String(actual)+(d.realizationUnit==='%'&&!String(actual).endsWith('%')?'%':'');form.append(node('p','Realisasi aktivitas: '+actualText,'role-detail-realization'));
   {const data=window.KPISystem.load(),outcomes=data.outcomes.filter(o=>o.activityIds.includes(d.id)||o.id===d.kpiOutcomeId),ids=[...new Set([d.kpiId,...outcomes.map(o=>o.kpiId)].filter(Boolean))];ids.forEach(id=>{const k=data.kpis.find(k=>k.id===id),o=outcomes.find(o=>o.kpiId===id);if(k)form.append(node('p','KPI: '+k.code+' · '+k.indicator+(o?' · Hasil: '+o.name+' · '+({approved:'Tercapai',pending:'Menunggu pemeriksaan aktivitas',revision:'Perlu revisi',planned:'Belum tercapai'}[o.status]||o.status):' · Belum memilih hasil terkait'), 'role-note'));});}
   const kpiData=window.KPISystem.load(),supportedKpi=kpiData.kpis.find(k=>k.id===d.kpiId),targetResult=kpiData.outcomes.find(o=>o.id===d.kpiOutcomeId&&o.kpiId===d.kpiId);
   let baseline,measured;
   if(supportedKpi&&targetResult&&supportedKpi.method!=='count'){
    const row=node('div',undefined,'role-editor-row');form.append(row);
    baseline=field(row,supportedKpi.method==='ratio'?'Total keseluruhan':'Nilai awal (baseline)',d.kpiMeasurement?.a??'',null,'number',false);measured=field(row,supportedKpi.method==='ratio'?'Bagian yang memenuhi syarat':'Nilai setelah perubahan',d.kpiMeasurement?.b??'',null,'number',false);baseline.min='0';baseline.step=measured.step='any';measured.min=0;baseline.readOnly=measured.readOnly=!editable;
   }
   const links=node('section',undefined,'role-detail-links');links.append(node('h3','Tautan dokumen'));const rows=node('div',undefined,'role-detail-link-list');links.append(rows);form.append(links);
   const inputs=[];let add,approveAction;
   function updatePlus(){if(add)add.disabled=inputs.some(input=>!safeURL(input.value.trim()));}
   function addLink(value='',doc=null){const row=node('div',undefined,'role-detail-link-row'),input=field(row,'Dokumen '+(inputs.length+1),value,null,'url',false);input.placeholder='https://docs.google.com/…';input.readOnly=!editable;inputs.push(input);
    const open=node('a','↗','role-detail-open');open.target='_blank';open.rel='noopener noreferrer';open.title='Buka dokumen';open.setAttribute('aria-label','Buka dokumen '+inputs.length);
    const refresh=()=>{const url=safeURL(input.value.trim());open.hidden=!url;if(url)open.href=url;else open.removeAttribute('href');updatePlus();};input.oninput=refresh;refresh();open.onclick=()=>{if(doc)opened.add(doc.id);if(approveAction)approveAction.disabled=!related().length||related().some(doc=>!opened.has(doc.id));};row.append(open);row.dataset.documentId=doc?.id||'';rows.append(row);
   }
   related().forEach(doc=>addLink(doc.url,doc));if(editable){if(!inputs.length)addLink();add=button('+',()=>{if(!add.disabled)addLink();});add.className='role-detail-add';add.setAttribute('aria-label','Tambah tautan dokumen');links.append(add);updatePlus();}else if(!inputs.length)rows.append(node('p','Belum ada dokumen yang diunggah.','role-note'));
   const note=field(form,'Catatan',d.detailNote??d.note??'',null,'textarea',false);note.readOnly=!editable;
   const detailError=node('p','','role-error');detailError.setAttribute('role','alert');const controls=node('div',undefined,'role-dialog-actions');form.append(detailError,controls);
   function persistDetails(sendRevision=false){
    if(role!=='manajer'||(sendRevision&&!requiresRevision()))return;
    const text=sendRevision?comment.value.trim():'';
    if(sendRevision&&!text){error.textContent='Isi komentar perbaikan sebelum mengirim revisi.';comment.setAttribute('aria-invalid','true');comment.focus();return;}
    const filled=inputs.filter(input=>input.value.trim());
    if(sendRevision&&!filled.length){error.textContent='Tambahkan minimal satu tautan dokumen sebelum mengirim revisi.';return;}
    if(filled.some(input=>!safeURL(input.value.trim()))){(sendRevision?error:detailError).textContent='Gunakan tautan HTTP atau HTTPS yang valid.';return;}
    const measurement={a:baseline&&baseline.value!==''?Number(baseline.value):null,b:measured&&measured.value!==''?Number(measured.value):null},resultY=current().year||'2026';
    if([measurement.a,measurement.b].some(v=>v!=null&&(!Number.isFinite(v)||v<0))){detailError.textContent='Angka pengukuran harus nol atau lebih.';return;}
    const oldDocs=documents(),oldRelated=related(),values=filled.map(input=>safeURL(input.value.trim())),changed=values.length!==oldRelated.length||values.some((url,i)=>url!==oldRelated[i]?.url)||note.value!==(current().detailNote??d.note??'')||(targetResult&&JSON.stringify(measurement)!==JSON.stringify(current().kpiMeasurement||{a:null,b:null}));
    const requestReview=sendRevision||(changed&&!requiresRevision()),now=new Date().toISOString(),nextDocs=oldDocs.filter(doc=>!oldRelated.some(old=>old.id===doc.id));
    values.forEach((url,i)=>{const previous=oldRelated[i];nextDocs.push(audit({...previous,id:previous?.id||crypto.randomUUID(),judul:previous?.judul||d.title+' - Dokumen '+(i+1),url,activityId:d.id,aktivitas:d.id,aktivitasJudul:d.title,flagship:d.flag,strategi:strategy[d.flag]||'',kode:d.code,divisi:d.division,tahun:d.year||'2026',periode:previous?.periode||'Tahunan',jenis:previous?.jenis||'Bukti aktivitas',catatan:note.value,uploadedBy:previous?.uploadedBy||identity(),uploadedAt:previous?.uploadedAt||now,reviewStatus:requestReview?'Menunggu approval BOD':requiresRevision()?'Perlu revisi':previous?.reviewStatus,reviewer:requestReview?null:previous?.reviewer,approvedAt:requestReview?null:previous?.approvedAt},sendRevision?'Mengirim revisi':'Menyimpan dokumen aktivitas'));});
    const next=audit({...current(),detailNote:note.value,kpiMeasurement:measurement,activityReviewStatus:requestReview?'Menunggu persetujuan':review(),reviewRequestedAt:requestReview?now:current().reviewRequestedAt,activityReviewedAt:requestReview?null:current().activityReviewedAt,bodNotification:requestReview&&values.length?{kind:sendRevision?'revision_submitted':'documents_received',at:now,readAt:null}:current().bodNotification,comments:sendRevision?[...messages(),{id:crypto.randomUUID(),...identity(),authorId:account().id||null,actor:account().name,text,kind:'revision_submission',time:now,replyTo:replying?.id||null}]:messages()},sendRevision?'Mengirim komentar dan revisi':'Menyimpan detail aktivitas');
    const oldKpi=window.KPISystem.load(),transition=window.KPISystem.activityResult(oldKpi,next,{status:requiresRevision()&&!sendRevision?'revision':'pending',year:resultY,...measurement,evidence:values,note:note.value,actor:identity()});
    if(!save(docsKey,nextDocs))return;if((requestReview||changed)&&!window.KPISystem.persist(transition.state)){save(docsKey,oldDocs);detailError.textContent='Data KPI gagal disimpan.';return;}
    if(!commit(items.map(i=>i.id===d.id?next:i))){save(docsKey,oldDocs);window.KPISystem.persist(oldKpi);return;}
    const nextBadge=docStatus({reviewStatus:next.activityReviewStatus});state.textContent=nextBadge.textContent;state.className=nextBadge.className;state.setAttribute('aria-label','Status persetujuan aktivitas: '+next.activityReviewStatus);
    detailError.textContent='';error.textContent='';revisionSend.disabled=!requiresRevision();
    notice.textContent=sendRevision?'Komentar dan revisi dikirim ke BOD.':requiresRevision()?'Perubahan disimpan. Status tetap Revisi.':'Detail aktivitas disimpan.';
    if(sendRevision){comment.value='';replying=null;replyBar.hidden=true;comment.removeAttribute('aria-invalid');}renderChat();
   }
   if(editable)controls.append(button('Save',()=>persistDetails(),true));
   function decide(status){if(role!=='bod')return;if(status==='Disetujui'&&(!related().length||related().some(doc=>!opened.has(doc.id))))return;
    if(status==='Disetujui'&&reviewSignature()!==openedSignature){notice.textContent='Detail atau bukti berubah. Buka ulang dokumen sebelum Approve.';details(current());return;}
    const text=comment?.value.trim()||'';if(status==='Perlu revisi'&&!text){error.textContent='Isi alasan revisi terlebih dahulu sebelum mengirim permintaan.';comment.setAttribute('aria-invalid','true');comment.focus();return;}
    const oldDocs=documents(),ids=new Set(related().map(doc=>doc.id)),now=new Date().toISOString(),nextDocs=oldDocs.map(doc=>ids.has(doc.id)?audit({...doc,reviewStatus:status,reviewNote:text,reviewer:identity(),approvedAt:status==='Disetujui'?now:null},status+' dokumen aktivitas'):doc);
    const oldKpi=window.KPISystem.load();
    const transition=window.KPISystem.activityResult(oldKpi,current(),{status:status==='Disetujui'?'approved':status==='Perlu revisi'?'revision':'rejected',year:current().year||'2026',a:current().kpiMeasurement?.a??null,b:current().kpiMeasurement?.b??null,evidence:related().map(doc=>safeURL(doc.url)),note:current().detailNote||'',actor:identity()});if(transition.error){detailError.textContent=transition.error;return;}
    if(!save(docsKey,nextDocs))return;if(!window.KPISystem.persist(transition.state)){save(docsKey,oldDocs);detailError.textContent='Data KPI gagal disimpan.';return;}const next=audit({...current(),kpiFulfilled:status==='Disetujui'&&Boolean(current().kpiId&&current().kpiOutcomeId),activityReviewStatus:status,activityReviewedAt:now,managerNotification:{kind:'review_decision',at:now,readAt:null},comments:text?[...messages(),{id:crypto.randomUUID(),...identity(),authorId:account().id||null,actor:account().name,text,time:now,replyTo:replying?.id||null}]:messages()},status+' aktivitas');if(!commit(items.map(i=>i.id===d.id?next:i))){save(docsKey,oldDocs);window.KPISystem.persist(oldKpi);return;}updateInbox();notice.textContent=status==='Perlu revisi'?'Permintaan revisi dan komentar dikirim ke Manager.':'Aktivitas: '+status+'.';details(next);
   }
   if(role==='bod'){approveAction=button('Approve',()=>decide('Disetujui'),true);approveAction.disabled=true;const request=button('Minta revisi',()=>{revisionGuide.hidden=false;comment.scrollIntoView?.({block:'center',behavior:'smooth'});comment.focus({preventScroll:true});});const reject=button('Reject',()=>decide('Ditolak'));reject.classList.add('role-danger');controls.append(approveAction,request,reject);form.append(node('p',d.kpiId?'Buka semua tautan dokumen. Approve menyatakan hasil terkait sudah memenuhi patokan KPI. Jika belum, pilih Minta revisi.':'Buka semua tautan dokumen untuk mengaktifkan Approve. Aktivitas ini tidak terkait KPI.','role-note'));}
   form.append(node('h3','Komentar','role-detail-comments-title'));
   const feed=node('div',undefined,'role-chat-feed');feed.setAttribute('role','log');feed.setAttribute('aria-label','Percakapan aktivitas');form.append(feed);
   const interactive=['bod','manajer'].includes(role);let replying=null;const replyBar=node('div',undefined,'role-chat-reply-bar');replyBar.hidden=true;
   let comment,send,error,revisionSend,revisionGuide;
   const messages=()=>((items.find(i=>i.id===d.id)?.comments)||[]).map((c,index)=>({...c,id:c.id||`comment-${d.id}-${index}`}));
   function chooseReply(c){if(c.deleted)return;replying=c;replyBar.replaceChildren(node('span','Membalas '+(c.name||c.actor)+': '+c.text),button('×',()=>{replying=null;replyBar.hidden=true;}));replyBar.hidden=false;comment.focus();}
   const canDelete=c=>interactive&&!c.deleted&&(c.authorId&&account().id?c.authorId===account().id:(c.name||c.actor?.replace(/ \(.*\)$/,''))===account().name&&(c.role||(/BOD/.test(c.actor)?'BOD':'Manajer Program'))===labels[role]);
   function deleteComment(c){const latest=messages().find(x=>x.id===c.id);if(!latest||!canDelete(latest))return;const current=items.find(i=>i.id===d.id);const next=audit({...current,comments:messages().map(x=>x.id===c.id?{...x,text:'',deleted:true,deletedAt:new Date().toISOString(),deletedBy:identity()}:x)},'Menghapus komentar sendiri');if(commit(items.map(i=>i.id===d.id?next:i))){if(replying?.id===c.id){replying=null;replyBar.hidden=true;}renderChat();}}
   function renderChat(){feed.replaceChildren();const list=messages().filter(c=>!c.deleted);if(!list.length)feed.append(node('p','Belum ada komentar.','role-note'));list.forEach(c=>{const message=node('article',undefined,'role-chat-message'),avatar=node('span',(c.name||c.actor||'?').split(' ').map(x=>x[0]).slice(0,2).join(''),'role-chat-avatar'),content=node('div',undefined,'role-chat-content'),head=node('div',undefined,'role-chat-message-head');head.append(node('strong',c.name||c.actor||'Pengguna'),node('span',c.role||(/BOD/.test(c.actor)?'BOD':'Manajer Program'),'role-chat-role'),node('time',new Date(c.time).toLocaleString('id-ID'),'role-chat-time'));content.append(head);const original=list.find(m=>m.id===c.replyTo);if(original&&!c.deleted)content.append(node('div','↳ '+(original.name||original.actor)+': '+original.text,'role-chat-quote'));content.append(node('p',c.text,'role-chat-text'));message.dataset.commentId=c.id;message.append(avatar,content);if(interactive&&!c.deleted){const tools=node('div',undefined,'role-chat-tools'),reply=button('↩',()=>chooseReply(c));reply.className='role-chat-reply';reply.title='Balas komentar';reply.setAttribute('aria-label','Balas komentar '+(c.name||c.actor));tools.append(reply);if(canDelete(c)){const remove=icon('delete','Hapus komentar sendiri',()=>{if(!canDelete(c))return;message.querySelector('.role-chat-delete-confirm')?.remove();const confirm=node('div',undefined,'role-chat-delete-confirm');confirm.append(node('span','Hapus komentar ini?'),button('Batal',()=>confirm.remove()),button('Hapus komentar',()=>deleteComment(c)));confirm.lastElementChild.classList.add('role-danger-fill');content.append(confirm);});tools.append(remove);}message.append(tools);}feed.append(message);});feed.scrollTop=feed.scrollHeight;}
   if(interactive){
    const composer=node('div',undefined,'role-chat-composer');composer.append(node('p',account().name+' · '+labels[role],'role-note'),replyBar);
    comment=field(composer,'Komentar','',null,'textarea');comment.placeholder='Tulis komentar atau balasan…';comment.oninput=()=>{error.textContent='';comment.removeAttribute('aria-invalid');};error=node('p','','role-error');error.setAttribute('role','alert');
    if(role==='bod'){revisionGuide=node('p','Isi alasan revisi, lalu klik Kirim permintaan revisi di bawah.','role-revision-guide');revisionGuide.hidden=true;revisionGuide.id='role-revision-guide';revisionGuide.setAttribute('role','status');composer.append(revisionGuide);}
    send=button('Kirim komentar',()=>{
     if(!['bod','manajer'].includes(role)||!comment.reportValidity())return;const text=comment.value.trim();if(!text){error.textContent='Isi komentar terlebih dahulu.';return;}
     const current=items.find(i=>i.id===d.id),now=new Date().toISOString();
     const next=audit({...current,comments:[...messages(),{id:crypto.randomUUID(),...identity(),authorId:account().id||null,actor:account().name,text,time:now,replyTo:replying?.id||null}]},replying?'Membalas komentar':'Memberikan komentar');
     if(!commit(items.map(i=>i.id===d.id?next:i)))return;
     comment.value='';replying=null;replyBar.hidden=true;error.textContent='';
     if(revisionGuide)revisionGuide.hidden=true;
     renderChat();
    },true);
    const sendActions=node('div',undefined,'role-chat-send-actions');send.className='tombol';
    revisionSend=button(role==='bod'?'Kirim permintaan revisi':'Kirim revisi',()=>role==='bod'?decide('Perlu revisi'):persistDetails(true),true);
    if(role==='manajer'){revisionSend.disabled=!requiresRevision();revisionSend.title='Aktif saat BOD meminta revisi.';}
    sendActions.append(send,revisionSend);composer.append(error,sendActions);form.append(composer);
   }else form.append(node('p','Akses lihat · Komentar hanya dapat ditambahkan oleh BOD dan Manager.','role-note'));
   renderChat();
  }

  function commentReaderKey(){return role+':'+(account().id||account().name);}
  function incomingComment(c){if(c.deleted||!c.text?.trim()||!['bod','manajer'].includes(role))return false;const sender=c.role||(/BOD/.test(c.actor)?'BOD':'Manajer Program');return (role==='bod'?sender==='Manajer Program':sender==='BOD')&&!(c.authorId&&account().id&&c.authorId===account().id);}
  function readActivityComments(d){const key=commentReaderKey();if(!(d.comments||[]).some(c=>incomingComment(c)&&!c.readBy?.[key]))return null;const now=new Date().toISOString();return {...d,comments:d.comments.map(c=>incomingComment(c)&&!c.readBy?.[key]?{...c,readBy:{...c.readBy,[key]:now}}:c)};}
  const commentNotifications=()=>items.filter(d=>!d.deleted).flatMap(d=>(d.comments||[]).map((c,i)=>({...c,id:c.id||`comment-${d.id}-${i}`,activity:d,unread:!c.readBy?.[commentReaderKey()]})).filter(incomingComment)).sort((a,b)=>(Date.parse(b.time)||0)-(Date.parse(a.time)||0));
  const notificationDocuments=d=>documents().filter(doc=>doc.activityId===d.id||(!doc.activityId&&doc.flagship===d.flag&&doc.kode===d.code));
  const notificationFor=d=>d.bodNotification||{kind:'documents_received',at:d.reviewRequestedAt||notificationDocuments(d)[0]?.uploadedAt||'',readAt:null};
  const reviewQueue=()=>items.filter(d=>!d.deleted&&notificationDocuments(d).length).sort((a,b)=>(Date.parse(notificationFor(b).at)||0)-(Date.parse(notificationFor(a).at)||0));
  const managerNotificationFor=d=>d.managerNotification||{kind:'review_decision',at:d.activityReviewedAt||'',readAt:null};
  const activityNotificationCount=manager=>manager?items.filter(d=>!d.deleted&&managerNotificationFor(d).at&&!managerNotificationFor(d).readAt).length:reviewQueue().filter(d=>!notificationFor(d).readAt).length;
  window.activityReviewCounts=manager=>activityNotificationCount(manager)+commentNotifications().filter(c=>c.unread).length;
  function notificationPopup(initialTab='activity'){window.ActivityNotifications?.open(initialTab);}
  window.openActivityReview=()=>{if(role==='bod')notificationPopup();};
  window.showActivityStatuses=()=>{if(role==='manajer')notificationPopup();};
  window.activityNotificationsContext=()=>({items,documents:documents(),account:account(),role,commit,details,popup,dialog});
  window.addEventListener('storage',e=>{if(!['seamolec-role-activities-v1',docsKey].includes(e.key))return;const latest=read('seamolec-role-activities-v1',{});items=items.map(d=>({...d,...latest[d.id]}));items.push(...Object.values(latest).filter(d=>!items.some(i=>i.id===d.id)));render();updateInbox();window.refreshActivityNotifications?.();});


  function saveSubtasks(next){if(!save('seamolec-role-subtasks-v1',next))return false;subtasks=next;render();return true;}
  function editSubtask(s){if(!ownsSubtask(s))return;const form=popup('Edit subtask'),creator=field(form,'Nama',s.creator.name+' - '+s.creator.role),parent=field(form,'Aktivitas induk',s.parent,items.filter(d=>!d.deleted).map(d=>({value:d.id,label:d.flag+' · '+d.code+' — '+d.title}))),title=field(form,'Judul subtask',s.title),due=field(form,'Tenggat',s.due,null,'date');creator.readOnly=true;parent.disabled=true;actions(form,'Simpan subtask',()=>saveSubtasks(subtasks.map(x=>x.id===s.id?audit({...x,title:title.value,due:due.value},'Mengedit subtask'):x)),['staf']);}
  function deleteSubtask(s){if(!ownsSubtask(s))return;const form=popup('Hapus subtask?');form.append(node('p',s.title));actions(form,'Hapus subtask',()=>saveSubtasks(subtasks.filter(x=>x.id!==s.id)),['staf']);form.querySelector('.tombol-utama').classList.add('role-danger-fill');}
  function addSubtask(parent=null){if(role!=='staf')return;const form=popup('Tambah subtask'),sel=field(form,'Aktivitas induk',parent?.id||'activity-3',items.filter(d=>!d.deleted).map(d=>({value:d.id,label:`${d.flag} · ${d.code} — ${d.title}`}))),title=field(form,'Judul subtask',''),creator=field(form,'Nama',staffIdentity().name+' - '+staffIdentity().role),due=field(form,'Tenggat','',null,'date');creator.readOnly=true;dialog.dataset.parent=sel.value;sel.onchange=()=>dialog.dataset.parent=sel.value;actions(form,'Simpan subtask',()=>{const next=[...subtasks,{id:crypto.randomUUID(),parent:sel.value,title:title.value,owner:'Staf',ownerName:account().name,creator:staffIdentity(),due:due.value,status:'Belum mulai'}];if(!save('seamolec-role-subtasks-v1',next))return false;subtasks=next;expanded.add(sel.value);render();},['staf']);}

  function removeActivity(d){if(!canManageActivity(d))return;const form=popup('Hapus aktivitas?');form.append(node('p',d.flag+' · '+d.code+' — '+d.title),node('p','Aktivitas dan subtask disembunyikan dari daftar. Dokumen asli tidak dihapus.','role-note'));actions(form,'Hapus aktivitas',()=>commit(items.map(i=>i.id===d.id?audit({...i,deleted:true},'Menghapus aktivitas'):i)),['manajer','staf']);form.querySelector('.tombol-utama').classList.add('role-danger-fill');}
  function render(){

   const words=normalize($('f-cari').value).split(' ').filter(Boolean),flag=$('f-flagship').value?$('f-flagship').selectedOptions[0].textContent.split(' — ')[0].trim():'';

   matches=items.filter(d=>!d.deleted&&(!flag||d.flag===flag)&&['divisi','pilar','status'].every(k=>!$('f-'+k).value||({divisi:d.division,pilar:d.pillar,status:d.status})[k]===$('f-'+k).value)&&words.every(w=>normalize([...Object.values(d),...subtasks.filter(s=>s.parent===d.id).map(s=>s.title)].join(' ')).includes(w)));

   const pages=Math.max(1,Math.ceil(matches.length/10));

   while(radios.length<pages){const i=radios.length,r=node('input');r.type='radio';r.name='aktivitas-page';r.className='sr-only';r.id='aktivitas-page-'+(i+1);r.onchange=()=>{page=i+1;render();};$('tabel-bungkus').before(r);const label=node('label',String(i+1),'aktivitas-page-label');label.htmlFor=r.id;screen.querySelector('.aktivitas-pagination label').parentElement.append(label);radios.push(r);}

   page=Math.min(page,pages);table.classList.toggle('role-manager-table',['manajer','staf'].includes(role));body.replaceChildren();const head=table.tHead.rows[0];head.querySelector('.role-actions-head')?.remove();if(['manajer','staf'].includes(role))head.append(node('th','AKSI','role-actions-head'));

   matches.slice((page-1)*10,page*10).forEach(d=>{let row=originalRows.get(d.id)?.cloneNode(true);if(!row){row=node('tr');for(let i=0;i<10;i++)row.append(node('td'));}row.dataset.activityId=d.id;if(['Perlu perhatian','Ditunda'].includes(d.status))row.dataset.risiko='';else delete row.dataset.risiko;

    [String(d.number),d.flag,d.component,d.code,d.title,d.pillar,d.division,d.pic,d.status,d.note||'—'].forEach((text,i)=>{row.cells[i].replaceChildren(i===8?badge(text):node('span',text));});

    const pillarCell=node('span',undefined,'pilar-sel');pillarCell.append(node('span',d.pillar.charAt(0),'pilar-tanda'),node('span',d.pillar,'pilar-nama'));row.cells[5].replaceChildren(pillarCell);row.cells[4].classList.add('td-aktivitas');

    const tools=node('div',undefined,'role-row-tools');const toggle=link('',()=>{expanded.has(d.id)?expanded.delete(d.id):expanded.add(d.id);render();});toggle.classList.add('role-subtask-toggle');toggle.setAttribute('aria-label','See Subtask ('+subtasks.filter(s=>s.parent===d.id).length+')');toggle.setAttribute('aria-expanded',String(expanded.has(d.id)));toggle.append(node('span',expanded.has(d.id)?'⌃':'⌄','role-subtask-arrow'),node('span','See Subtask ('+subtasks.filter(s=>s.parent===d.id).length+')'));tools.append(toggle);

    if(role==='manajer'){if(d.submission==='Menunggu verifikasi Manager')tools.append(link('Verifikasi progres',()=>{if(role!=='manajer')return;commit(items.map(i=>i.id===d.id?audit({...i,status:i.proposedStatus||i.status,submission:'Progres tervalidasi'},'Manager memverifikasi progres'):i));}));}if(role==='staf')tools.append(link('+ Subtask',()=>addSubtask(d)));row.cells[4].append(tools);const detailTools=node('div',undefined,'role-detail-tools');detailTools.append(icon('details','Detail / komentar: '+d.title,()=>details(d)),activityReviewIndicator(d));row.cells[9].replaceChildren(node('span',[...(d.comments||[])].reverse().find(c=>!c.deleted)?.text||(d.note||'\u2014'),'role-comment-preview'),detailTools);if(d.submission)row.cells[9].append(node('span',d.submission,'role-status'));if(canManageActivity(d)){const statusWrap=node('div',undefined,'role-inline-status'),select=node('select',undefined,'role-status-select');['Belum mulai','On track','Perlu perhatian','Selesai','Ditunda'].forEach(v=>select.add(new Option(v,v)));select.value=d.status;select.setAttribute('aria-label','Ubah status '+d.title);select.onchange=()=>{if(!canManageActivity(d))return;commit(items.map(i=>i.id===d.id?audit({...i,status:select.value},'Mengubah status menjadi '+select.value):i));};statusWrap.append(badge(d.status),node('span','⌄','role-status-chevron'),select);row.cells[8].replaceChildren(statusWrap);const cell=node('td',undefined,'role-actions-cell');const actionGroup=node('div',undefined,'role-actions-group');actionGroup.append(icon('edit','Edit aktivitas '+d.title,()=>editor(d)),icon('delete','Hapus aktivitas '+d.title,()=>removeActivity(d)));cell.append(actionGroup);row.append(cell);}else if(role==='staf')row.append(node('td',undefined,'role-actions-cell'));body.append(row);

    if(expanded.has(d.id)){const subrow=node('tr',undefined,'role-subtasks'),cell=node('td');cell.colSpan=['manajer','staf'].includes(role)?11:10;const list=subtasks.filter(s=>s.parent===d.id);if(!list.length)cell.append(node('span','Belum ada subtask.','role-note'));list.forEach(s=>{const line=node('div',undefined,'role-subtask-line');line.append(node('span','↳ '+s.title),node('span',s.creator.name+' - '+s.creator.role),node('span',s.due));if(ownsSubtask(s)){const wrap=node('div',undefined,'role-inline-status'),select=node('select',undefined,'role-status-select');['Belum mulai','On track','Perlu perhatian','Selesai','Ditunda'].forEach(v=>select.add(new Option(v,v)));select.value=s.status;select.setAttribute('aria-label','Ubah status subtask '+s.title);select.onchange=()=>{if(!ownsSubtask(s))return;saveSubtasks(subtasks.map(x=>x.id===s.id?audit({...x,status:select.value},'Mengubah status subtask'):x));};wrap.append(badge(s.status),node('span','⌄','role-status-chevron'),select);line.append(wrap);}else line.append(badge(s.status));const tools=node('div',undefined,'role-actions-group');if(ownsSubtask(s))tools.append(icon('edit','Edit subtask '+s.title,()=>editSubtask(s)),icon('delete','Hapus subtask '+s.title,()=>deleteSubtask(s)));line.append(tools);cell.append(line);});subrow.append(cell);body.append(subrow);}

   });

   radios.forEach((r,i)=>{r.checked=i+1===page;r.disabled=i>=pages;screen.querySelector(`label[for="${r.id}"]`).hidden=i>=pages;});$('filter-hitung').textContent=`Menampilkan ${matches.length} dari ${items.filter(d=>!d.deleted).length} aktivitas`;screen.querySelector('.aktivitas-pagination p').textContent=matches.length?`${(page-1)*10+1}–${Math.min(page*10,matches.length)} dari ${matches.length} aktivitas`:'0 aktivitas';$('tabel-bungkus').hidden=!matches.length;$('hasil-kosong').hidden=!!matches.length;

   roleButtons.replaceChildren();if(role==='bod')roleButtons.append(button('Kelola flagship',manageFlags));if(role==='manajer')roleButtons.append(button('Tambah aktivitas',()=>editor(),true));if(role==='staf')roleButtons.append(button('Tambah subtask',()=>addSubtask()),button('Tambah aktivitas',()=>editor(),true));

  }

  screen.querySelector('.filter-aksi').prepend(roleButtons);

  ['flagship','divisi','pilar','status'].forEach(k=>$('f-'+k).onchange=()=>{page=1;render();});$('f-cari').oninput=$('f-cari').onsearch=()=>{page=1;render();};radios.forEach((r,i)=>r.onchange=()=>{page=i+1;render();});$('tombol-reset').onclick=()=>{['flagship','divisi','pilar','status','cari'].forEach(k=>$('f-'+k).value='');page=1;render();};$('tombol-ekspor-aktivitas').onclick=()=>csv('aktivitas-filter.csv',[['No','Flagship','Program','Kode','Aktivitas','Pilar','Divisi','PIC','Status','Catatan'],...matches.map(d=>[d.number,d.flag,d.component,d.code,d.title,d.pillar,d.division,d.pic,d.status,d.note])]);

  $('hasil-kosong').textContent='Tidak ada aktivitas yang cocok. Ubah pencarian atau reset filter.';

  window.renderRolePage=()=>{page=1;render();};
 } else {
  window.renderRolePage=window.mountKPI({screen,$,node,button,link,badge,field,popup,actions,roleButtons,notice,csv,manageFlags,identity,safeURL,flags,read,role:()=>role});
 }

 function changeRole(){dialog.close();role=selector.value;notice.textContent=role==='staf'?'Akses lihat'+(activity?' · Kelola aktivitas buatan sendiri dan subtask; komentar hanya lihat.':'.'):role==='pic'?'Penugasan contoh: '+account().name+' · '+(activity?'Akses lihat aktivitas; upload dokumen dinonaktifkan.':'Akses lihat KPI; update bukti dilakukan melalui Aktivitas.'):role==='bod'?'BOD · Kelola flagship, KPI, dan persetujuan dokumen.':'Manajer Program · '+(activity?'Kelola aktivitas dan verifikasi dokumen.':'Pantau realisasi dan ajukan target tahunan kepada BOD.');window.renderRolePage();updateInbox();}

 selector.onchange=changeRole;changeRole();

})();
