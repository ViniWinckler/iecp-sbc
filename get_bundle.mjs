const url = 'https://iecp-sbc.web.app';
fetch(url)
  .then(r => r.text())
  .then(t => {
    const m = t.match(/src="(\/assets\/index[^"]+)"/);
    console.log(m ? m[1] : 'not found');
  });
