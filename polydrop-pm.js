/* Polydrop — live Polymarket data helper.
   Talks to the public Polymarket Data API (open CORS, no auth). */
window.PMApi = (function(){
  var BASE = 'https://data-api.polymarket.com';

  function normalizeAddress(input){
    if(!input) return null;
    var m = String(input).trim().match(/0x[a-fA-F0-9]{40}/);
    return m ? m[0].toLowerCase() : null;
  }
  function shortAddr(a){ return a ? a.slice(0,6) + '\u2026' + a.slice(-4) : ''; }

  async function fetchJson(url){
    var r = await fetch(url);
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  async function getSummary(address){
    var addr = normalizeAddress(address);
    if(!addr) throw new Error('Invalid address');
    var LB = 'https://lb-api.polymarket.com';
    var r = await Promise.all([
      fetchJson(BASE + '/value?user=' + addr).catch(function(){ return []; }),
      fetchJson(BASE + '/positions?user=' + addr + '&limit=200&sortBy=CURRENT&sortDirection=DESC').catch(function(){ return []; }),
      fetchJson(BASE + '/activity?user=' + addr + '&limit=200').catch(function(){ return []; }),
      fetchJson(LB + '/volume?window=all&limit=1&address=' + addr).catch(function(){ return []; })
    ]);
    var value = (r[0] && r[0][0] && typeof r[0][0].value === 'number') ? r[0][0].value : 0;
    var positions = Array.isArray(r[1]) ? r[1] : [];
    var activity  = Array.isArray(r[2]) ? r[2] : [];
    var volume = (r[3] && r[3][0] && typeof r[3][0].amount === 'number') ? r[3][0].amount : 0;
    var trades = activity.filter(function(a){ return a.type === 'TRADE'; });
    // fallback: estimate volume from returned trades if the volume endpoint is empty
    if(!volume){ volume = trades.reduce(function(s,t){ return s + (Number(t.usdcSize) || 0); }, 0); }
    var pnl = positions.reduce(function(s,p){ return s + (Number(p.cashPnl) || 0); }, 0);
    var invested = positions.reduce(function(s,p){ return s + (Number(p.initialValue) || 0); }, 0);
    var prof = activity.find(function(a){ return a.pseudonym; }) || {};
    return {
      address: addr,
      value: value,
      positions: positions,
      activity: activity,
      trades: trades,
      tradeCount: trades.length,
      activityCount: activity.length,
      positionsCount: positions.length,
      volume: volume,
      pnl: pnl,
      invested: invested,
      pseudonym: prof.pseudonym || null,
      hasData: (value > 0 || activity.length > 0 || positions.length > 0 || volume > 0)
    };
  }

  // formatting helpers
  function money(n, dec){ dec = (dec==null?2:dec); n = Number(n)||0; return '$' + n.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
  function num(n){ return (Number(n)||0).toLocaleString('en-US'); }
  function timeAgo(ts){
    var s = Math.floor(Date.now()/1000) - ts;
    if(s < 0) s = 0;
    if(s < 60) return s + 's ago';
    if(s < 3600) return Math.floor(s/60) + 'm ago';
    if(s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
  }

  return {
    BASE: BASE,
    normalizeAddress: normalizeAddress,
    shortAddr: shortAddr,
    getSummary: getSummary,
    money: money, num: num, timeAgo: timeAgo
  };
})();
