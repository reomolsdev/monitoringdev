(() => {
  const folders = { bod: 'BOD', manajer: 'Manager', staf: 'Staf', pic: 'PIC' };
  const selector = document.getElementById('pilih-peran');
  const scriptURL = new URL(document.currentScript.src);
  const root = new URL('../../', scriptURL);
  const current = new URL(location.href);
  const path = decodeURIComponent(current.pathname.slice(root.pathname.length));
  const match = path.match(/^(BOD|Manager|Staf|PIC)\/(aktivitas|kpi)\.html$/);
  function links(role) {
    document.querySelectorAll('a[href]').forEach(a => {
      if (a.getAttribute('href').startsWith('#')) return;
      const url = new URL(a.getAttribute('href'), current);
      if (url.origin === root.origin && /\/(aktivitas|kpi)\.html$/.test(url.pathname)) {
        const page = url.pathname.match(/\/(aktivitas|kpi)\.html$/)[1];
        a.href = new URL(folders[role] + '/' + page + '.html', root).href;
      }
    });
  }
  if (!selector) return;
  const initial = match ? Object.keys(folders).find(key => folders[key] === match[1]) : 'bod';
  selector.value = initial;
  links(initial);
  selector.addEventListener('change', () => {
    if (!folders[selector.value]) return;
    if (match) location.assign(new URL(folders[selector.value] + '/' + match[2] + '.html', root).href);
    else links(selector.value);
  });
})();
