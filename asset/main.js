// main.js untuk HodlMagz
// Tambahkan script custom di sini

document.addEventListener('DOMContentLoaded', function() {
  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
      navLinks.classList.toggle('show');
    });
  }

  // ====== HodlBot kecil (floating) ======
  const $toggle = document.getElementById('chatToggle');
  const $panel  = document.getElementById('chatPanel');
  const $form   = document.getElementById('chatForm');
  const $input  = document.getElementById('chatInput');
  const $msgs   = document.getElementById('chatMessages');

  const history = [];

  function sanitize(text){
    return String(text).replace(/</g,'&lt;').replace(/\n/g,'<br>');
  }
  function addMsg(role, text){
    const wrap = document.createElement('div');
    wrap.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
    wrap.innerHTML = `<div class="meta">${role === 'user' ? 'Kamu' : 'HodlBot'}</div><div>${sanitize(text)}</div>`;
    $msgs.appendChild(wrap); $msgs.scrollTop = $msgs.scrollHeight;
  }
  function setTyping(on){
    if(on){ addMsg('bot', '...'); $msgs.lastChild.dataset.typing = '1'; }
    else { const last = $msgs.querySelector('[data-typing="1"]'); if(last) last.remove(); }
  }

  if ($toggle && $panel && $form && $input && $msgs) {
    $toggle.addEventListener('click', () => {
      const open = $panel.classList.toggle('active');
      $toggle.setAttribute('aria-expanded', open); $panel.setAttribute('aria-hidden', !open);
      $toggle.textContent = open ? 'Tutup Chat' : 'Chat';
      if(open && $msgs.children.length === 0){ addMsg('bot', 'Hai! Aku HodlBot. Tanyakan apa saja.'); }
    });

    $form.addEventListener('submit', async (e) => {
      e.preventDefault(); const text = $input.value.trim(); if(!text) return;
      addMsg('user', text); history.push({role:'user', content:text}); $input.value='';
      setTyping(true);
      try{
        const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages: history.slice(-20) })});
        const data = await res.json(); setTyping(false);
        const reply = data.reply || 'Maaf, terjadi error.'; addMsg('bot', reply); history.push({role:'assistant', content:reply});
      }catch(err){ setTyping(false); addMsg('bot', 'Gagal menghubungi server. Coba lagi ya.'); }
    });

    // Unit tests
    console.group('HodlBot tests');
    console.assert(sanitize('a<b')==='a&lt;b','Escape < failed');
    console.assert(sanitize('x\ny')==='x<br>y','Newline failed');
    console.groupEnd();
  }

  // ====== Pro Chatbot (section besar) ======
  const proMsgs = document.getElementById('proMsgs');
  const proForm = document.getElementById('proForm');
  const proInput= document.getElementById('proInput');

  function proAdd(role, text){
    const el = document.createElement('div');
    el.className = `msg ${role==='user'?'user':'bot'}`;
    el.innerHTML = `<div class="meta">${role==='user'?'Kamu':'Hodl Analyst'}</div><div>${sanitize(text)}</div>`;
    proMsgs.appendChild(el); proMsgs.scrollTop = proMsgs.scrollHeight;
  }

  if (proMsgs && proForm && proInput) {
    document.querySelectorAll('[data-prompt]').forEach(btn=>{
      btn.addEventListener('click',()=>{ proInput.value = btn.dataset.prompt; proInput.focus(); });
    });

    proForm.addEventListener('submit', async (e)=>{
      e.preventDefault(); const text = proInput.value.trim(); if(!text) return;
      proAdd('user', text); proInput.value='';
      proAdd('bot','...');
      try{
        const r = await fetch('/api/pro-chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages:[{role:'system', content:'Kamu adalah Hodl Analyst, analis trading profesional. Jawab ringkas, jelaskan risk, dan gunakan data LuxQuant & Solyzer bila ada.'},{role:'user', content:text}] }) });
        const j = await r.json();
        proMsgs.lastChild.remove();
        proAdd('bot', j.reply || 'Maaf, terjadi error.');
      }catch(err){ proMsgs.lastChild.remove(); proAdd('bot','Gagal menghubungi server pro-chat.'); }
    });
  }

  // Dropdown nav Info & Update

  const navGroup = document.querySelector('.nav-group');
  if (navGroup) {
    const btn = navGroup.querySelector('button');
    const dropdown = navGroup.querySelector('.nav-dropdown');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      dropdown.style.display = expanded ? 'none' : 'block';
    });
    document.addEventListener('click', function() {
      btn.setAttribute('aria-expanded', false);
      dropdown.style.display = 'none';
    });
    dropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
});
