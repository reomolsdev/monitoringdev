/* Local prototype: KPI outcomes are distinct from activity completion. */
(() => {
 'use strict';
 const KEY='seamolec-kpi-outcomes-v2',YEARS=['2025','2026','2027','2028','2029'];
 const canonical=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'');
 const definitions=[
  ['ST1',['PROGRES','ADCEND'],'Negara yang secara formal mengadopsi / menyelaraskan regulasi ODL',5,'negara','count',[0,1,3,4,5],'Ada keputusan adopsi resmi nasional; pelatihan atau platform saja belum dihitung.'],
  ['WT3',['FLEXERA','CREATE','CODEA','NEXEL'],'Kenaikan skor kepercayaan employer atas kredensial ODL',20,'% kenaikan','increase',[0,5,10,15,20],'Survei dengan metode dan populasi yang sama dibandingkan baseline.'],
  ['WT2',['R-MODE'],'Dana non-inti untuk komunitas kurang terlayani',40,'% dari dana','ratio',[0,13,27,40,40],'Dana untuk komunitas kurang terlayani / total dana non-inti.'],
  ['ST3',['AILOS'],'Penurunan konsumsi data melalui SEAMOLEC Lite',30,'% penurunan','decrease',[0,15,30,30,30],'Pengukuran konsumsi data sebelum dan sesudah dengan skenario yang sama.'],
  ['WO2',['COALA'],'Intervensi dengan metrik perubahan kapasitas institusi',100,'% integrasi','ratio',[0,33,67,100,100],'Intervensi yang memiliki metrik kapasitas / seluruh intervensi utama.'],
  ['SMART-01',['FLEXERA','CREATE'],'Praktisi ODL tersertifikasi (minimum 40% komunitas kurang terlayani)',1500,'praktisi','count',[0,375,750,1125,1500],'Sertifikat sah dan ID peserta unik; BOD memeriksa syarat minimum 40%.'],
  ['SMART-02',['AILOS'],'Proyek percontohan skala besar di negara anggota',3,'proyek','count',[0,1,2,3,3],'Pilot sudah diterapkan dan memiliki berita acara penerimaan.'],
  ['SMART-03',['ADCEND','PROGRES'],'Kerangka ODL / QA regional yang diadopsi',5,'kerangka','count',[0,1,2,3,5],'Kerangka yang berbeda memiliki dokumen pengesahan adopsi.'],
  ['SMART-04',['PROGRES'],'Kemitraan strategis formal baru',15,'kemitraan','count',[0,4,8,11,15],'Perjanjian resmi dengan ID kemitraan unik; periksa juga program kolaboratif lintas negara.'],
  ['SMART-05',['R-MODE'],'Peningkatan dana non-inti yang terdiversifikasi',50,'% peningkatan','increase',[0,13,25,38,50],'Dana non-inti periode pengukuran dibandingkan baseline yang disepakati.']
 ];
 function seed(){
  const kpis=definitions.map((d,i)=>({id:'kpi-'+(i+1),code:d[0],flags:d[1],indicator:d[2],target:d[3],unit:d[4],method:d[5],annual:Object.fromEntries(YEARS.map((y,j)=>[y,d[6][j]])),criterion:d[7],group:i<5?'strategi':'smart',annualNote:'Contoh distribusi kumulatif. BOD perlu menetapkan angka final.'}));
  const proof='https://www.seamolec.org/';
  const outcomes=[
   {id:'demo-country-id',kpiId:'kpi-1',entity:'ID',name:'Contoh: Indonesia',year:'2026',status:'approved',activityIds:[],evidence:[proof],note:'Data dummy, contoh keputusan adopsi resmi.',demo:true},
   {id:'demo-country-my',kpiId:'kpi-1',entity:'MY',name:'Contoh: Malaysia',year:'2026',status:'pending',activityIds:[],evidence:[proof],note:'Data dummy, menunggu validasi hasil oleh BOD.',demo:true},
   {id:'demo-pilot',kpiId:'kpi-7',entity:'PILOT-MALUKU',name:'Contoh: Pilot Maluku',year:'2026',status:'pending',activityIds:['activity-3'],evidence:[proof],note:'IT dan divisi pelatihan mendukung pilot yang sama. Hitung satu pilot setelah diterima.',demo:true},
   {id:'demo-data',kpiId:'kpi-4',entity:'MEASURE-2026',name:'Contoh: Uji konsumsi data 2026',year:'2026',status:'approved',activityIds:[],evidence:[proof],a:100,b:85,note:'Data dummy: baseline 100 MB, hasil 85 MB.',demo:true}
  ];
  return {version:2,kpis,outcomes,history:[]};
 }
 function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.version===2&&Array.isArray(s.kpis)&&Array.isArray(s.outcomes))return s;}catch{}const s=seed();
  // Keep old data untouched. Legacy manual values require explicit confirmation, never become validated outcomes.
  try{const old=JSON.parse(localStorage.getItem('seamolec-role-kpis-v1'));if(Array.isArray(old))old.forEach(d=>{const k=s.kpis.find(k=>k.id===d.id);if(k){const scale=k.method==='count'?1:100;if(d.actual!=null)k.legacyActual=d.actual*scale;if(Number.isFinite(d.target)&&d.target>0)k.target=d.target*scale;k.indicator=d.indicator||k.indicator;if(d.annualTargets){Object.entries(d.annualTargets).forEach(([y,v])=>{if(YEARS.includes(y))k.annual[y]=Number(v)*scale;});k.annualConfirmed=true;}k.annual['2029']=k.target;}else if(d.id&&d.indicator){s.kpis.push({id:d.id,code:d.code||'CUSTOM',flags:String(d.program||'').split(' / '),indicator:d.indicator,target:d.target*(String(d.unit).includes('%')?100:1),unit:d.unit,method:String(d.unit).includes('%')?'ratio':'count',annual:{},criterion:'BOD perlu menetapkan patokan hasil KPI ini.',group:d.group||'strategi',legacyActual:d.actual});}});}catch{}
  persist(s);return s;
 }
 function persist(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
 function measurement(k,o){const a=Number(o.a),b=Number(o.b);if(!Number.isFinite(a)||!Number.isFinite(b)||a<=0||b<0)return null;if(k.method==='ratio')return b<=a?b/a*100:null;if(k.method==='decrease')return b<=a?(a-b)/a*100:null;return b>=a?(b-a)/a*100:null;}
 function calculate(s,k,year='2029'){
  const eligible=s.outcomes.filter(o=>o.kpiId===k.id).flatMap(o=>o.claims?[...Object.values(o.claims).filter(c=>c.status==='approved').map(c=>({...o,...c})),...(o.legacyApproval?[{...o,...o.legacyApproval}]:[])]:o.status==='approved'?[o]:[]).filter(o=>Number(o.year)<=Number(year));
  let actual=k.method==='count'?new Set(eligible.map(o=>canonical(o.entity))).size:null;
  if(k.method!=='count'){const latest=eligible.sort((a,b)=>Number(b.year)-Number(a.year)||String(b.approvedAt||'').localeCompare(String(a.approvedAt||'')))[0];if(latest)actual=measurement(k,latest);}
  const override=k.overrides?.[year];if(override)actual=override.value;
  const target=year==='2029'?k.target:k.annual[year];const ratio=actual==null||target==null||target<=0?null:actual/target;
  const status=target==null?'Target belum diatur':target===0?'Belum ditargetkan':ratio==null?'Belum ada data':ratio>=1?'Tercapai':ratio>=.7?'On track':'Perlu perhatian';
  return {actual,target,ratio,status,override:!!override};
 }
 function validOutcome(s,k,o){if(!o.entity||!canonical(o.entity)||!YEARS.includes(String(o.year))||!o.evidence?.length||o.evidence.some(u=>{try{return !['https:','http:'].includes(new URL(u).protocol);}catch{return true;}}))return false;if(k.method==='count'){if(k.unit==='negara'&&!['BN','KH','ID','LA','MY','MM','PH','SG','TH','TL','VN'].includes(canonical(o.entity)))return false;return !s.outcomes.some(x=>x.id!==o.id&&x.kpiId===k.id&&canonical(x.entity)===canonical(o.entity)&&x.status==='approved');}return measurement(k,o)!=null;}
 const COUNTRIES=[['BN','Brunei Darussalam'],['KH','Kamboja'],['ID','Indonesia'],['LA','Laos'],['MY','Malaysia'],['MM','Myanmar'],['PH','Filipina'],['SG','Singapura'],['TH','Thailand'],['TL','Timor-Leste'],['VN','Vietnam']];
 function planResult(state,kpiId,choice,name,year){
  const s=JSON.parse(JSON.stringify(state)),k=s.kpis.find(k=>k.id===kpiId);if(!choice)return {state:s,id:''};if(!k)return {error:'Pilih KPI terlebih dahulu.'};
  const existing=s.outcomes.find(o=>o.id===choice&&o.kpiId===k.id);if(existing)return {state:s,id:existing.id};
  let entity,label;if(choice.startsWith('country:')&&k.method==='count'&&k.unit.toLowerCase()==='negara'){const country=COUNTRIES.find(c=>c[0]===choice.slice(8));if(!country)return {error:'Pilih negara dari daftar.'};[entity,label]=country;}
  else if(choice==='measurement'&&k.method!=='count'){entity='MEASURE-'+year;label='Pengukuran '+year;}
  else if(choice==='new'&&k.method==='count'&&String(name||'').trim()){label=name.trim();entity='RESULT-'+canonical(label);}else return {error:'Pilih hasil yang tersedia atau isi nama hasil baru.'};
  const duplicate=s.outcomes.find(o=>o.kpiId===k.id&&(canonical(o.entity)===canonical(entity)||canonical(o.name.replace(/^Contoh:\s*/i,''))===canonical(label)));if(duplicate)return {state:s,id:duplicate.id};
  const id=crypto.randomUUID();s.outcomes.push({id,kpiId:k.id,entity,name:label,year:String(year),status:'planned',activityIds:[],evidence:[],note:'',claims:{}});return {state:s,id};
 }
 function summarizeOutcome(o,k){
  const approved=Object.values(o.claims||{}).filter(c=>c.status==='approved');
  if(approved.length){const claim=approved.sort((a,b)=>k.method==='count'?Number(a.year)-Number(b.year):Number(b.year)-Number(a.year)||String(b.approvedAt).localeCompare(String(a.approvedAt)))[0];Object.assign(o,{status:'approved',year:claim.year,a:claim.a,b:claim.b,approvedAt:claim.approvedAt,reviewedBy:claim.actor,evidence:claim.evidence,note:claim.note});}
  else if(o.legacyApproval)Object.assign(o,o.legacyApproval);
  else{o.status=Object.values(o.claims||{}).some(c=>c.status==='pending')?'pending':Object.values(o.claims||{}).some(c=>c.status==='revision')?'revision':'planned';o.evidence=[...new Set(Object.values(o.claims||{}).flatMap(c=>c.evidence||[]))];}
 }
 function activityResult(state,d,{status='pending',year=d.year||'2026',a=null,b=null,evidence=[],note='',actor={}}={}){
  const fulfills=status==='approved'&&Boolean(d.kpiId);
  const s=JSON.parse(JSON.stringify(state)),k=s.kpis.find(k=>k.id===d.kpiId),o=s.outcomes.find(o=>o.id===d.kpiOutcomeId&&o.kpiId===d.kpiId);
  if(fulfills){if(!k||!o||!k.flags.includes(d.flag))return {error:'Pilih KPI dan hasil terkait pada aktivitas terlebih dahulu.'};const candidate={...o,year:String(year),a,b,evidence};
   if(!YEARS.includes(String(year))||!evidence.length||evidence.some(u=>{try{return !['https:','http:'].includes(new URL(u).protocol);}catch{return true;}}))return {error:'Tahun hasil dan tautan bukti harus valid.'};
   if(k.method!=='count'&&(a==null||b==null||measurement(k,candidate)==null))return {error:'Isi pengukuran yang valid. Nilai awal / total harus lebih dari nol; hasil penurunan / bagian tidak boleh melebihi nilai awal / total.'};
  }
  // Each activity has its own approval: revising one source must not remove another source's valid result.
  s.outcomes.forEach(result=>{const definition=s.kpis.find(k=>k.id===result.kpiId);if(!definition)return;
   if(result.id!==o?.id&&!result.claims?.[d.id])return;
   if(!result.claims&&result.status==='approved')result.legacyApproval={status:result.status,year:result.year,a:result.a,b:result.b,approvedAt:result.approvedAt,evidence:result.evidence,note:result.note};
   result.claims=result.claims||{};const matched=result.id===o?.id;
   result.claims[d.id]={status:matched?status:'withdrawn',year:String(year),a,b,evidence:matched?evidence:[],note,actor,approvedAt:new Date().toISOString()};
   if(matched)result.activityIds=[...new Set([...result.activityIds,d.id])];summarizeOutcome(result,definition);
  });
  s.history.push({...actor,time:new Date().toISOString(),action:'Aktivitas '+d.code+': '+status+(fulfills?' · memenuhi '+k?.code:' · belum menambah hasil KPI')});return {state:s};
 }
 window.KPISystem={KEY,YEARS,COUNTRIES,canonical,load,persist,calculate,measurement,validOutcome,planResult,activityResult};
 window.mountKPI=function(c){
  const {screen,$,node,button,link,badge,field,popup,actions,roleButtons,notice,csv,manageFlags,identity,safeURL}=c;
  const role=()=>c.role();let s=load(),year='2026',flag='';
  const num=v=>v==null?'—':new Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(v);
  const actor=()=>({...identity(),time:new Date().toISOString()});
  function write(action){s.history.push({...actor(),action});if(!persist(s)){s=load();notice.textContent='Perubahan gagal disimpan di browser.';return false;}render();return true;}
  const activities=()=>Object.values(c.read('seamolec-role-activities-v1',{})).filter(a=>!a.deleted);
  function compatible(a,k){return k.flags.includes(a.flag);}
  function linked(k){return activities().filter(a=>a.kpiId===k.id||s.outcomes.some(o=>o.kpiId===k.id&&o.activityIds.includes(a.id)));}
  const format=(k,v)=>num(v)+(k.method==='count'?'':'%');
  function edit(k=null){if(role()!=='bod')return;const f=popup(k?'Ubah KPI':'Tambah KPI');f.classList.add('kpi-editor-form');f.parentElement?.classList.add('role-editor-dialog','kpi-editor-dialog');
   const row=()=>{const r=node('div',undefined,'role-editor-row');f.append(r);return r;};
   const first=row(),code=field(first,'Kode KPI',k?.code||''),flags=field(first,'Flagship',k?.flags.join(', ')||'');
   const selectedFlags=new Set(k?.flags||[]),wrap=flags.parentElement,picker=node('div',undefined,'kpi-flagship-options');
   flags.readOnly=true;flags.placeholder='Pilih flagship';flags.setAttribute('role','combobox');flags.setAttribute('aria-expanded','false');flags.setAttribute('aria-controls','kpi-flagship-options');picker.id='kpi-flagship-options';picker.hidden=true;picker.setAttribute('role','group');picker.setAttribute('aria-label','Pilih satu atau beberapa flagship');
   wrap?.classList.add('kpi-flagship-field');wrap?.append(node('span','\u2304','kpi-flagship-chevron'),picker);
   const toggle=()=>{picker.hidden=!picker.hidden;flags.setAttribute('aria-expanded',String(!picker.hidden));};flags.onclick=toggle;flags.onkeydown=e=>{if(['Enter',' ','ArrowDown'].includes(e.key)){e.preventDefault();if(picker.hidden)toggle();else if(e.key!=='ArrowDown')toggle();}if(e.key==='Escape'){picker.hidden=true;flags.setAttribute('aria-expanded','false');}};
   c.flags.forEach(name=>{const option=node('label',undefined,'kpi-flagship-option'),check=node('input');check.type='checkbox';check.value=name;check.checked=selectedFlags.has(name);check.onchange=()=>{if(check.checked)selectedFlags.add(name);else selectedFlags.delete(name);flags.value=[...selectedFlags].join(', ');};option.append(check,node('span',name));picker.append(option);});
   const closePicker=()=>{picker.hidden=true;flags.setAttribute('aria-expanded','false');};f.addEventListener?.('click',e=>{if(wrap&&!wrap.contains(e.target))closePicker();});picker.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();closePicker();flags.focus();}};
   const title=field(f,'Rumusan indikator',k?.indicator||'',null,'textarea'),calculation=row(),method=field(calculation,'Cara menghitung',k&&k.method!=='count'?'ratio':'count',[{value:'count',label:'Hitung hasil unik'},{value:'ratio',label:'Persentase'}]),unit=field(calculation,'Satuan',k?.unit||'negara'),target=field(f,'Target akhir 2029',k?.target??1,null,'number'),criterion=field(f,'Patokan hasil boleh dihitung',k?.criterion||'',null,'textarea');
   // Existing percentage KPI formulas retain their stored calculation when only their metadata is edited.
   const savedMethod=()=>method.value==='ratio'&&k&&k.method!=='count'?k.method:method.value;
   const sync=()=>{target.min=method.value==='count'?'1':'0.000001';target.step=method.value==='count'?'1':'any';};method.onchange=sync;sync();
   f.append(node('p','Persentase diisi dalam angka persen: target 30 berarti 30%. Satu KPI bersama tetap satu indikator, meskipun muncul pada beberapa flagship.','role-note'));
   actions(f,'Simpan KPI',error=>{const fs=[...selectedFlags];if(!code.value.trim()||!title.value.trim()||!criterion.value.trim()||s.kpis.some(x=>x.id!==k?.id&&x.code===code.value.trim())){error.textContent='Isi kode unik, indikator, dan patokan hasil.';return false;}if(!fs.length||fs.some(v=>!c.flags.includes(v))){error.textContent='Gunakan kode flagship yang tersedia di Kelola flagship.';return false;}if(method.value==='count'&&!Number.isInteger(Number(target.value))){error.textContent='Target satuan harus bilangan bulat.';return false;}if(k&&savedMethod()!==k.method&&s.outcomes.some(o=>o.kpiId===k.id)){error.textContent='Cara menghitung KPI yang sudah memiliki hasil tidak dapat diganti. Buat indikator baru.';return false;}if(k&&YEARS.slice(0,4).some(y=>k.annual[y]>Number(target.value))){error.textContent='Target akhir tidak boleh di bawah target tahunan.';return false;}
    const next={...k,id:k?.id||crypto.randomUUID(),code:code.value.trim(),flags:fs,indicator:title.value.trim(),method:savedMethod(),target:Number(target.value),unit:unit.value.trim(),criterion:criterion.value.trim(),annual:{...k?.annual,'2029':Number(target.value)},group:k?.group||'strategi'};s.kpis=k?s.kpis.map(x=>x.id===k.id?next:x):[...s.kpis,next];return write('Menetapkan KPI '+next.code);},['bod']);
  }
  function annual(k=s.kpis[0]){if(role()!=='bod')return;const f=popup('Tetapkan target per tahun'),sel=field(f,'KPI',k.id,s.kpis.map(k=>({value:k.id,label:k.code+' · '+k.indicator})));const box=node('div',undefined,'kpi-year-grid');f.append(box);const inputs=YEARS.map(y=>field(box,y,'',null,'number'));const note=field(f,'Alasan / catatan distribusi','',null,'textarea');
   const sync=()=>{k=s.kpis.find(k=>k.id===sel.value);inputs.forEach((n,i)=>{n.value=k.annual[YEARS[i]]??(i===4?k.target:'');n.min=0;n.max=k.target;n.step=k.method==='count'?'1':'any';});};sel.onchange=sync;sync();f.append(node('p','Target kumulatif: target 2027 sudah mencakup hasil 2025–2026. Angka contoh belum merupakan penetapan BOD.','role-note'));
   actions(f,'Tetapkan target',error=>{const values=inputs.map(n=>Number(n.value));if(!note.value.trim()||values.some((v,i)=>v<0||v>k.target||(k.method==='count'&&!Number.isInteger(v))||(i&&v<values[i-1]))||values[4]!==k.target){error.textContent='Isi catatan; target harus meningkat / tetap, berupa bilangan bulat untuk satuan, dan 2029 sama dengan target akhir.';return false;}k.annual=Object.fromEntries(YEARS.map((y,i)=>[y,values[i]]));k.annualConfirmed=true;k.annualNote=note.value.trim();return write('Target tahunan '+k.code+': '+note.value.trim());},['bod']);
  }
  function dialogClose(){document.getElementById('role-popup').close();}
  function correct(k){if(role()!=='bod')return;const f=popup('Koreksi manual · '+k.code),v=field(f,'Realisasi kumulatif '+year,k.overrides?.[year]?.value??calculate(s,k,year).actual??0,null,'number'),reason=field(f,'Alasan koreksi','',null,'textarea');v.min=0;v.step=k.method==='count'?'1':'any';f.append(node('p','Koreksi menggantikan angka otomatis pada tahun ini; tidak ditambahkan ke hasil otomatis. Hasil otomatis tetap tersimpan.','role-note'));if(k.legacyActual!=null)f.append(node('p','Angka lama tersimpan: '+k.legacyActual+'. Belum diperlakukan sebagai hasil tervalidasi.','role-note'));if(k.overrides?.[year])f.append(button('Gunakan perhitungan otomatis lagi',()=>{if(role()!=='bod')return;delete k.overrides[year];if(write('Menghapus koreksi '+k.code+' '+year))dialogClose();}));
   actions(f,'Simpan koreksi',error=>{const value=Number(v.value);if(!reason.value.trim()||(k.method==='count'&&!Number.isInteger(value))){error.textContent='Isi alasan dan gunakan bilangan bulat untuk satuan.';return false;}k.overrides={...k.overrides,[year]:{value,reason:reason.value.trim(),...actor()}};return write('Koreksi '+k.code+' '+year+': '+reason.value.trim());},['bod']);
  }
  function detail(k){const f=popup('Rincian KPI · '+k.code),r=calculate(s,k,year),final=calculate(s,k,'2029');f.append(node('h3',k.indicator),node('p',k.criterion,'role-note'),node('p',year+': '+format(k,r.actual)+' / '+format(k,r.target)+' · '+r.status),node('p','Target akhir 2029: '+format(k,final.target)+' · Capaian akhir '+(final.ratio==null?'—':num(final.ratio*100)+'%')));
   const tasks=linked(k);f.append(node('p','Progres pekerjaan: '+tasks.filter(a=>a.status==='Selesai').length+' / '+tasks.length+' aktivitas selesai. Angka ini tidak dikonversi menjadi negara / proyek.','role-note'));
   tasks.forEach(a=>f.append(node('p',a.code+' · '+a.title+' · '+a.status)));
   f.append(node('h3','Hasil dan sumber hitungan'));const results=s.outcomes.filter(o=>o.kpiId===k.id);if(!results.length)f.append(node('p','Belum ada hasil.'));results.forEach(o=>{const line=node('div',undefined,'kpi-result-line');line.append(node('strong',o.name),node('span',o.entity+' · '+o.year+' · '+({approved:'Tercapai',pending:'Menunggu pemeriksaan aktivitas',revision:'Perlu revisi',planned:'Belum tercapai'}[o.status]||o.status)+(o.demo?' · Dummy':'')),node('small',o.note));if(o.reviewNote)line.append(node('small','BOD: '+o.reviewNote));o.evidence.forEach(url=>{const a=node('a','Buka bukti ↗');a.href=safeURL(url);a.target='_blank';a.rel='noopener noreferrer';line.append(a);});f.append(line);});
   if(role()==='bod')f.append(button('Target per tahun',()=>annual(k)),button('Koreksi manual',()=>correct(k)));f.append(node('h3','Target kumulatif per tahun'),node('p',YEARS.map(y=>y+': '+format(k,k.annual[y])).join(' · ')),node('p',k.annualConfirmed?'Sudah ditetapkan BOD.':'Distribusi contoh — belum ditetapkan BOD.','role-note'));
   s.history.filter(h=>h.action.includes(k.code)).slice(-5).forEach(h=>f.append(node('small',h.name+' · '+h.action)));
  }
  const filters=node('div',undefined,'kpi-scope-filter'),ys=field(filters,'Tahun',year,YEARS.map(y=>({value:y,label:y==='2029'?'2029 · target akhir':y}))),fs=field(filters,'Flagship','',[{value:'',label:'Semua flagship'},...c.flags]);screen.querySelector('.kpi-kaki').before(filters);ys.onchange=()=>{year=ys.value;render();};fs.onchange=()=>{flag=fs.value;render();};
  screen.querySelector('.layar-deskripsi').textContent='Realisasi mengikuti hasil yang disetujui BOD melalui detail aktivitas. Target dan capaian mengikuti tahun yang dipilih; progres aktivitas dilihat terpisah.';
  const explanation=$('kpi-catatan');if(explanation)explanation.textContent='Capaian = realisasi / target kumulatif tahun terpilih. Hijau ≥ 100%, kuning ≥ 70%, merah < 70%. Target nol tidak dibagi. Hasil negara / proyek dihitung sekali per ID; persentase berasal dari pengukuran, bukan jumlah aktivitas selesai.';
  function render(){s=load();const visible=s.kpis.filter(k=>!flag||k.flags.includes(flag)),counts={done:0,ontrack:0,attention:0,empty:0};
   for(const g of ['strategi','smart']){const tbody=$('kpi-isi-'+g);tbody.replaceChildren();visible.filter(k=>k.group===g).forEach(k=>{const r=calculate(s,k,year);counts[r.ratio==null?'empty':r.ratio>=1?'done':r.ratio>=.7?'ontrack':'attention']++;
    (flag?[flag]:k.flags).forEach(p=>{const tr=node('tr');tr.dataset.kpiId=k.id;tr.append(node('td',g==='strategi'?'Strategi':'SMART','kk-kat'));const prog=node('td',p,'kk-prog');if(k.flags.length>1)prog.append(node('small',k.code+' · KPI bersama','role-status'));tr.append(prog);const title=node('td',undefined,'kk-rumus');title.append(link(k.indicator,()=>detail(k)));tr.append(title);const t=node('td',undefined,'kk-target td-angka'),targetLine=node('div',undefined,'kpi-target-line');targetLine.append(node('span',format(k,r.target)));if(role()==='bod'){const pencil=link('\u270e',()=>edit(k));pencil.classList.add('kpi-target-edit');pencil.title='Edit KPI dan target';pencil.setAttribute('aria-label','Edit KPI '+k.code);targetLine.append(pencil);}t.append(targetLine,node('small','Akhir: '+format(k,k.target),'role-status'));tr.append(t,node('td',k.unit,'kk-satuan'));const actual=node('td',undefined,'kk-realisasi');actual.append(node('span',format(k,r.actual)));if(r.override)actual.append(node('small','Koreksi BOD','role-status'));tr.append(actual,node('td',r.ratio==null?'—':num(r.ratio*100)+'%','kk-capa'));const stat=node('td',undefined,'kk-stat');stat.append(badge(r.status));const pending=s.outcomes.filter(o=>o.kpiId===k.id&&o.status==='pending').length;if(pending)stat.append(node('small',pending+' hasil menunggu BOD','role-status'));tr.append(stat);tbody.append(tr);});
   });const caption=screen.querySelector('#kpi-grup-'+g).nextElementSibling;caption.textContent=visible.filter(k=>k.group===g).length+' indikator unik · tahun '+year;}
   const statuses=node('span',undefined,'kpi-summary-statuses');statuses.append(badge('Tercapai '+counts.done),badge('On track '+counts.ontrack),badge('Perlu perhatian '+counts.attention),badge('Belum ada data / target '+counts.empty));$('kpi-ringkas').replaceChildren(node('span',visible.length+' indikator unik · '+year,'kpi-summary-label'),statuses);roleButtons.replaceChildren();if(role()==='bod')roleButtons.append(button('Kelola flagship',manageFlags),button('Tambah KPI',()=>edit(),true),button('Target per tahun',()=>annual()));
   notice.textContent=(role()==='bod'?'BOD menetapkan target; hasil KPI diperiksa lewat detail aktivitas.':role()==='manajer'?'Manager mengisi hasil dan bukti lewat detail aktivitas.':'Akses lihat KPI dan sumber hitungannya.')+' Data contoh untuk simulasi; tersimpan di browser. KPI bersama dihitung sekali dalam ringkasan.';
  }
  const exportButton=screen.querySelector('.kpi-kaki button'),tools=node('div',undefined,'role-toolbar kpi-summary-actions');exportButton.before(tools);tools.append(roleButtons,exportButton);exportButton.onclick=()=>csv('kpi-'+year+'.csv',[['Kode','Flagship','Indikator','Tahun','Target kumulatif','Target akhir','Satuan','Realisasi','Capaian (%)','Status'],...s.kpis.filter(k=>!flag||k.flags.includes(flag)).map(k=>{const r=calculate(s,k,year);return[k.code,k.flags.join(' / '),k.indicator,year,r.target,k.target,k.unit,r.actual,r.ratio==null?'':r.ratio*100,r.status];})]);
  window.addEventListener('storage',e=>{if([KEY,'seamolec-role-activities-v1'].includes(e.key))render();});return render;
 };
})();
