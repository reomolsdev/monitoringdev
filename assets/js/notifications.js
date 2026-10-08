(() => {
 'use strict';
 const selector=document.getElementById('pilih-peran'),header=document.querySelector('.header-kanan');
 if(!selector||!header)return;
 const root=new URL('../../',document.currentScript.src),folders={bod:'BOD',manajer:'Manager',staf:'Staf',pic:'PIC'};
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn,primary=false)=>{const b=node('button',text,'tombol'+(primary?' tombol-utama':''));b.type='button';b.onclick=fn;return b;};
 function icon(kind,label,fn){const b=button('',fn);b.className='role-icon';b.title=label;b.setAttribute('aria-label',label);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',kind==='details'?'M6 3h8l4 4v14H6V3ZM14 3v5h4M9 12h6M9 16h6':kind==='comments'?'M4 4h16v13H9l-5 4V4ZM8 8h8M8 12h6':'M4 4h16l2 10v6H2v-6L4 4ZM2 14h6l2 3h4l2-3h6');svg.append(path);b.append(svg);return b;}
 function docStatus(d){const status=d.reviewStatus,kind=status==='Disetujui'?'approved':['Revisi','Perlu revisi'].includes(status)?'revision':status==='Ditolak'?'rejected':'pending',text={approved:'Disetujui',revision:'Revisi',rejected:'Ditolak',pending:'Menunggu Persetujuan'}[kind];return node('span',text,'role-doc-status role-doc-'+kind);}
 const ownDialog=node('dialog',undefined,'role-dialog role-notification-dialog');ownDialog.id='navbar-notifications';document.body.append(ownDialog);
 function ownPopup(title){ownDialog.replaceChildren();const head=node('div',undefined,'role-dialog-head'),close=button('×',()=>ownDialog.close());close.className='role-close';close.setAttribute('aria-label','Tutup popup');const h=node('h2',title);h.id='navbar-notification-title';ownDialog.setAttribute('aria-labelledby',h.id);head.append(h,close);const form=node('div',undefined,'role-dialog-body');ownDialog.append(head,form);ownDialog.showModal();return form;}
 function context(){const active=window.activityNotificationsContext?.();if(active)return active;const role=selector.value,accounts=read('seamolec-role-accounts-v1',{}),account=window.currentUser||accounts[role]||{name:role==='bod'?'Andi Darmawan':'Manajer Program'};return {role,account,items:window.ActivityData?window.ActivityData.items():Object.values(read('seamolec-role-activities-v1',{})),documents:window.ActivityData?window.ActivityData.documents():read('seamolec-report-documents-v1',window.ReportSamples||[]),dialog:ownDialog,popup:ownPopup,commit(next){try{localStorage.setItem('seamolec-role-activities-v1',JSON.stringify(Object.fromEntries(next.map(d=>[d.id,d]))));update();return true;}catch{return false;}},details(d,commentId){ownDialog.close();const url=new URL(folders[role]+'/aktivitas.html',root);url.searchParams.set('detail',d.id);if(commentId)url.searchParams.set('comment',commentId);location.assign(url.href);}};}
 function model(c){const contextAccount=c.account;const role=c.role,items=c.items.filter(d=>!d.deleted),key=role+':'+(c.account.id||c.account.name),incoming=c=>{if(c.deleted||!c.text?.trim()||!['bod','manajer'].includes(role))return false;const sender=c.role||(/BOD/.test(c.actor)?'BOD':'Manajer Program');return (role==='bod'?sender==='Manajer Program':sender==='BOD')&&!(c.authorId&&contextAccount.id&&c.authorId===contextAccount.id);};
  const notificationDocuments=d=>c.documents.filter(doc=>doc.activityId===d.id||(!doc.activityId&&doc.flagship===d.flag&&doc.kode===d.code));
  const notificationFor=d=>d.bodNotification||{kind:'documents_received',at:d.reviewRequestedAt||notificationDocuments(d)[0]?.uploadedAt||'',readAt:null};
  const managerNotificationFor=d=>d.managerNotification||{kind:'review_decision',at:d.activityReviewedAt||'',readAt:null};
  const reviewQueue=()=>items.filter(d=>notificationDocuments(d).length).sort((a,b)=>(Date.parse(notificationFor(b).at)||0)-(Date.parse(notificationFor(a).at)||0));
  const commentNotifications=()=>items.flatMap(d=>(d.comments||[]).map((c,i)=>({...c,id:c.id||`comment-${d.id}-${i}`,activity:d,unread:!c.readBy?.[key]})).filter(incoming)).sort((a,b)=>(Date.parse(b.time)||0)-(Date.parse(a.time)||0));
  const activityNotificationCount=manager=>manager?items.filter(d=>managerNotificationFor(d).at&&!managerNotificationFor(d).readAt).length:reviewQueue().filter(d=>!notificationFor(d).readAt).length;
  return {items,notificationDocuments,notificationFor,managerNotificationFor,reviewQueue,commentNotifications,activityNotificationCount};
 }
 let refresh=null;
 const inbox=icon('inbox','Notifikasi aktivitas dan komentar',()=>open()),count=node('span','','role-inbox-count');inbox.id='navbar-notification-button';inbox.append(count);header.prepend(inbox);
 function update(){const c=context(),m=model(c),enabled=['bod','manajer'].includes(c.role),total=enabled?m.activityNotificationCount(c.role==='manajer')+m.commentNotifications().filter(c=>c.unread).length:0;inbox.hidden=!enabled;count.textContent=String(total);count.hidden=!total;inbox.setAttribute('aria-label','Notifikasi aktivitas: '+total+' belum dibaca');}
 function open(initialTab='activity'){
  const c=context();if(!['bod','manajer'].includes(c.role))return;
  let items=c.items;const role=c.role,dialog=c.dialog,popup=c.popup;
  const getters={};for(const name of ['notificationDocuments','notificationFor','managerNotificationFor','reviewQueue','commentNotifications','activityNotificationCount'])getters[name]=(...args)=>model({...context(),items})[name](...args);
  const {notificationDocuments,notificationFor,managerNotificationFor,reviewQueue,commentNotifications,activityNotificationCount}=getters;
  const commit=next=>{if(!c.commit(next))return false;items=next;update();return true;};
  const details=(d,commentId)=>{c.details(d,commentId);};
    function notificationPopup(initialTab='activity'){
   if(!['bod','manajer'].includes(role))return;
   const manager=role==='manajer',form=popup('Notifikasi aktivitas'),tabs=node('div',undefined,'role-notification-tabs'),list=node('div',undefined,'role-manager-doc-list role-activity-notifications');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Jenis notifikasi');list.setAttribute('role','tabpanel');form.append(tabs,list);
   let active=initialTab;
   const activitiesTab=button('',()=>draw('activity')),commentsTab=button('',()=>draw('comments'));tabs.append(activitiesTab,commentsTab);
   function openDetails(d,commentId=null){const latest=items.find(i=>i.id===d.id);if(!latest||latest.deleted)return;const property=manager?'managerNotification':'bodNotification',event=manager?managerNotificationFor(latest):notificationFor(latest);const next={...latest,[property]:{...event,readAt:new Date().toISOString()}};if(commit(items.map(i=>i.id===d.id?next:i))){details(next,commentId);if(commentId){const target=[...dialog.querySelectorAll('.role-chat-message')].find(el=>el.dataset.commentId===commentId);target?.scrollIntoView({block:'nearest'});}}}
   function draw(tab){active=tab;list.replaceChildren();
    for(const [btn,key,label,count] of [[activitiesTab,'activity','Aktivitas',activityNotificationCount(manager)],[commentsTab,'comments','Komentar',commentNotifications().filter(c=>c.unread).length]]){btn.className='role-notification-tab'+(active===key?' is-active':'');btn.setAttribute('role','tab');btn.setAttribute('aria-selected',String(active===key));btn.id='notification-tab-'+key;btn.setAttribute('aria-controls','notification-panel');btn.replaceChildren(node('span',label),node('span',String(count),'role-notification-badge'));}list.id='notification-panel';list.setAttribute('aria-labelledby','notification-tab-'+active);
    if(active==='comments'){const messages=commentNotifications();if(!messages.length)list.append(node('p','Belum ada komentar masuk.','role-note'));messages.forEach(c=>{const card=node('article',undefined,'role-document role-comment-notification'+(c.unread?' is-unread':'')),meta=node('div',undefined,'role-notification-meta');card.append(node('strong',c.activity.title),node('small',`${c.activity.flag} · ${c.activity.code} · ${c.activity.year||'2026'}`));meta.append(node('span',(c.name||c.actor||'Pengguna')+' · '+(c.role||'BOD'),'role-notification-event'));if(c.time)meta.append(node('time',new Date(c.time).toLocaleString('id-ID'),'role-notification-time'));card.append(meta,node('p',c.text,'role-notification-comment'));const open=icon('comments','Buka komentar',()=>openDetails(c.activity,c.id));open.classList.add('role-notification-open');card.append(open);list.append(card);});return;}
    if(manager){const queue=items.filter(d=>!d.deleted).sort((a,b)=>(Date.parse(managerNotificationFor(b).at)||0)-(Date.parse(managerNotificationFor(a).at)||0));if(!queue.length)list.append(node('p','Belum ada aktivitas.','role-note'));queue.forEach(d=>{const event=managerNotificationFor(d),card=node('article',undefined,'role-document role-activity-notification'+(event.at&&!event.readAt?' is-unread':''));card.append(node('strong',d.title),node('small',`${d.flag} · ${d.code} · ${d.year||'2026'}`),docStatus({reviewStatus:d.activityReviewStatus||'Menunggu persetujuan'}),node('span',notificationDocuments(d).length+' dokumen','role-notification-count'));const open=icon('details','Buka detail',()=>openDetails(d));open.classList.add('role-notification-open');card.append(open);list.append(card);});return;}
    const queue=reviewQueue();if(!queue.length)list.append(node('p','Belum ada dokumen aktivitas yang masuk.','role-note'));
   queue.forEach(d=>{const event=notificationFor(d),card=node('article',undefined,'role-document role-activity-notification'+(!event.readAt?' is-unread':'')),meta=node('div',undefined,'role-notification-meta');
    card.append(node('strong',d.title),node('small',`${d.flag} · ${d.code} · ${d.year||'2026'}`));
    meta.append(node('span',event.kind==='revision_submitted'?'Dokumen telah direvisi':'Dokumen masuk','role-notification-event'),node('span',notificationDocuments(d).length+' dokumen','role-notification-count'));
    if(event.at){const date=new Date(event.at);if(!Number.isNaN(date.getTime()))meta.append(node('time',date.toLocaleString('id-ID'),'role-notification-time'));}card.append(meta);
    const open=icon('details','Buka detail',()=>openDetails(d));open.classList.add('role-notification-open');card.append(open);list.append(card);
   });
   }
   draw(initialTab);
   refresh=window.refreshActivityNotifications=()=>{if(dialog.open&&dialog.querySelector('h2')?.textContent==='Notifikasi aktivitas'){items=context().items;draw(active);}};
  }

  notificationPopup(initialTab);
 }
 window.ActivityNotifications={open,update,model};
 selector.addEventListener('change',()=>{ownDialog.close();update();});
 window.addEventListener('storage',e=>{if(['seamolec-role-activities-v1','seamolec-report-documents-v1','seamolec-role-accounts-v1'].includes(e.key)){update();refresh?.();}});
 window.addEventListener('focus',update);
 update();
 const detailId=new URL(location.href).searchParams.get('detail'),active=window.activityNotificationsContext?.();
 if(detailId&&active){const d=active.items.find(d=>d.id===detailId&&!d.deleted);if(d){active.details(d);const commentId=new URL(location.href).searchParams.get('comment');if(commentId){const target=[...active.dialog.querySelectorAll('.role-chat-message')].find(el=>el.dataset.commentId===commentId);target?.scrollIntoView({block:'nearest'});}}}
})();
