// ==UserScript==
// @name         WhatsApp Web Capture (Local)
// @namespace    https://github.com/nelisjr
// @version      0.2
// @description  Captura mensagens de um chat específico no WhatsApp Web, processa localmente e exporta JSON. Nenhum dado é enviado para fora.
// @author       Você
// @match        https://web.whatsapp.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// ==/UserScript==

(function() {
  'use strict';

  const STORAGE_KEY = "meu_script_whatsapp_state_v1";
  const DEBUG = false; // override padrão; use a flag persistida em state.debug
  let state = {
    enabled: false,
    targetChatName: null,
    debug: false,
  messages: {},
  lastExportCount: 0
  };

  // painel restrito: apenas progresso de carregamento e status
  let __loadProgress = '';
  let __statusText = '';
  function uiLog(type, text){
    try{
  const el = document.querySelector('#wa-log');
  if(!el) return;
  if(type === 'progress') __loadProgress = text || '';
  if(type === 'status') __statusText = text || '';
  // montar conteúdo com duas linhas quando disponível
  let out = '';
  if(__loadProgress) out += 'Progresso: ' + __loadProgress;
  if(__statusText) out += (out? '\n' : '') + 'Status: ' + __statusText;
  el.textContent = out;
  el.style.whiteSpace = 'pre-wrap';
  el.style.fontSize = '11px';
  el.style.color = '#444';
    }catch(e){}
  }

  function debug(...args){
    try{
      const on = state?.debug || DEBUG;
      if (on) console.debug('[WA-CAP]', ...args);
    }catch(e){}
  }

  // ---- Storage helpers (usando API do Tampermonkey) ----
  function saveState() {
    try {
      const res = GM_setValue(STORAGE_KEY, state);
      if (res && typeof res.then === 'function') res.catch(()=>{});
    } catch (e) { /* ignore */ }
  }
  function loadState() {
    try {
      const s = GM_getValue(STORAGE_KEY, null);
      if (s && typeof s.then === 'function') {
        s.then(v => { if (v) state = Object.assign(state, v); }).catch(()=>{});
      } else {
        if (s) state = Object.assign(state, s);
      }
    } catch (e) { /* ignore */ }
  }

  // retorna label curta para exibição no status (até maxNames nomes, +N)
  function abbreviateChatLabel(name, maxNames = 3){
    if(!name) return null;
    // usar mesma lógica de sanitize para separar
    const parts = name.split(/\n|,|•|·/).map(s=>s.trim()).filter(Boolean);
    const phoneLike = s => /^\+?[\d\s().\-]{6,}$/.test(s) || /\b\d{6,}\b/.test(s);
    const nonPhone = parts.filter(p=>!phoneLike(p));
    if(nonPhone.length===0){
      // se só telefones, retornar o primeiro truncado
      const first = parts[0]||'';
      return first.length>30? first.slice(0,27)+'...': first;
    }
    const take = nonPhone.slice(0,maxNames);
    const more = Math.max(0, nonPhone.length - take.length);
    return take.join(', ') + (more>0? ` +${more}` : '');
  }

  // ---- DOM helpers ----
  function getChatTitleElement() {
    return document.querySelector('header [data-testid="chat-header"]') ||
           document.querySelector('header span[title]') ||
           document.querySelector('header div[role="button"] span');
  }
  function getCurrentChatName() {
    const el = getChatTitleElement();
    const raw = el?.getAttribute('title') || el?.textContent?.trim() || null;
    const clean = sanitizeChatName(raw);
    debug('chat name raw:', raw, '=>', clean);
    return clean;
  }

  function sanitizeChatName(name){
    if(!name) return null;
    // split by common separators
    const parts = name.split(/\n|,|•|·/).map(s=>s.trim()).filter(Boolean);
    // phone-like detection
    const phoneLike = s => /^\+?[\d\s().\-]{6,}$/.test(s) || /\b\d{6,}\b/.test(s);
    const nonPhone = parts.filter(p=>!phoneLike(p));
    if(nonPhone.length===0){
      // fallback: return first part truncated
      return parts[0]?.slice(0,30) || parts[0] || null;
    }
    // if first non-phone part is short, likely the group name
    if(nonPhone[0] && nonPhone[0].length < 80) return nonPhone[0];
    // otherwise join up to 3 names
    return nonPhone.slice(0,3).join(', ');
  }
  function extractMessageFromNode(node) {
    try {
      const id = node.getAttribute('data-id') || node.dataset.id || null;
      const txtEl = node.querySelector('span.selectable-text') || node.querySelector('span');
      const text = txtEl?.innerText?.trim() || "";
  if (!text) return null;
  // proteger contra listas de números (p.ex. lista de membros do grupo)
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const phoneLike = s => /^\+?[\d\s().\-]{6,}$/.test(s);
  const allPhones = lines.length>0 && lines.every(phoneLike);
  // se for uma lista com vários telefones, ignorar
  if (allPhones && lines.length >= 2) return null;
  // se for apenas um token que parece telefone, ignorar
  if (lines.length === 1 && phoneLike(lines[0]) ) return null;
  // evitar textos muito grandes ou ruídos (proteção extra)
  if (text.length > 4000) return null;
      // tentar extrair timestamp do atributo usado pelo WhatsApp
      let ts = null;
      const pre = node.getAttribute('data-pre-plain-text') || node.dataset?.prePlainText || node.querySelector?.('[data-pre-plain-text]')?.getAttribute('data-pre-plain-text');
      if (pre) {
        // formato comum: "[12:34, 01/01/20] Nome: "
        const m = pre.match(/\[(.*?)\]/);
        if (m && m[1]) {
          const parsed = Date.parse(m[1]);
          if (!isNaN(parsed)) ts = parsed;
        }
      }
      if (!ts) {
        const timeEl = node.querySelector('time') || node.querySelector('[data-testid="msg-time"]');
        if (timeEl) {
          const t = timeEl.getAttribute('datetime') || timeEl.textContent;
          const parsed = Date.parse(t);
          if (!isNaN(parsed)) ts = parsed;
        }
      }
      if (!ts) ts = Date.now();
      const summaryId = id || `local-${ts}-${text.slice(0,10).replace(/\s+/g,'_')}`;
      // tentar extrair autor/nome a partir do data-pre-plain-text: 
      // exemplo: "[12:34, 01/01/20] Nome: "
      let author = null;
      if (pre) {
        const ma = pre.match(/\] *([^:]+):/);
        if (ma && ma[1]) author = ma[1].trim();
      }
      return { id: summaryId, text, ts, author };
    } catch (e) { return null; }
  }

  function formatTimestamp(ts){
    try{
      const d = new Date(ts);
      return d.toLocaleString();
    }catch(e){return String(ts)}
  }
  function storeMessage(msg) {
    if (!msg || !msg.id) return false;
    const exists = state.messages[msg.id];
    if (exists) {
      // merge para adicionar campos novos (ex: author)
      state.messages[msg.id] = Object.assign({}, exists, msg);
      saveState();
      debug('updated message', msg.id, msg);
      return false;
    }
    state.messages[msg.id] = msg;
    saveState();
    debug('stored message', msg.id, msg);
    return true;
  }

  // ---- Observador de mensagens ----
  let observer = null;
  function startObserving() {
    stopObserving();
  const convo = document.querySelector('[data-testid="conversation-panel"]') || document.querySelector('[role="region"]');
    if (!convo) return;
    debug('startObserving on', convo);
  uiLog('progress', 'Observador iniciado');
    observer = new MutationObserver(muts => {
      debug('mutations', muts.length);
      if (!state.enabled) return;
      const current = getCurrentChatName();
      if (state.targetChatName && current !== state.targetChatName) return;
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (!(n instanceof HTMLElement)) continue;
          const candidates = n.matches('div[data-id]') ? [n] : n.querySelectorAll?.('div[data-id]');
          candidates && candidates.forEach(c => {
            const msg = extractMessageFromNode(c);
            if (msg) {
              storeMessage(msg);
              debug('captured', msg.id, msg.author || '(unknown)', msg.text?.slice(0,40));
            }
          });
        }
      }
    });
    observer.observe(convo, { childList: true, subtree: true });
  }
  function stopObserving() {
  debug('stopObserving');
  observer?.disconnect();
  observer = null;
  uiLog('progress', 'Observador parado');
  }

  // ---- UI flutuante ----
  function createUI() {
    const ui = document.createElement("div");
    ui.id = "wa-capture-ui";
    ui.style.cssText = `position:fixed;bottom:18px;right:18px;z-index:2147483647;max-width:320px;min-width:220px;font-family:Inter,Roboto,Arial,sans-serif;`;
    ui.innerHTML = `
      <div id="wa-header" style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:linear-gradient(90deg,#1976d2,#42a5f5);color:#fff;border-radius:8px 8px 0 0;cursor:move">
        <strong style="font-size:13px">WA Capture</strong>
  <small style="opacity:.9;font-size:11px;margin-left:auto">v0.2</small>
  <span id="wa-badge" style="display:inline-block;margin-left:8px;background:#ff3b30;color:#fff;border-radius:10px;padding:2px 6px;font-size:11px;min-width:20px;text-align:center;visibility:hidden">0</span>
        <button id="wa-close" title="Fechar" style="background:transparent;border:none;color:inherit;cursor:pointer;padding:4px;margin-left:6px">✕</button>
      </div>
      <div style="padding:10px;background:#fff;border:1px solid #e6eef9;border-radius:0 0 8px 8px;box-shadow:0 6px 18px rgba(33,150,243,0.08)">
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <input id="wa-target" placeholder="Chat alvo" style="flex:1;padding:6px 8px;font-size:13px;border:1px solid #d7e9ff;border-radius:6px" />
          <button id="wa-set" title="Definir chat aberto" style="background:#1976d2;color:#fff;border:none;border-radius:6px;padding:6px 8px;cursor:pointer">Usar</button>
        </div>
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">
          <label style="font-size:13px;display:flex;align-items:center;gap:6px"><input type="checkbox" id="wa-enabled"/> Captura</label>
          <label style="font-size:13px;display:flex;align-items:center;gap:6px;margin-left:6px"><input type="checkbox" id="wa-debug"/> Debug</label>
          <button id="wa-clear" title="Limpar capturas" style="margin-left:auto;background:#f44336;color:#fff;border:none;border-radius:6px;padding:6px 8px;cursor:pointer">Limpar</button>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button id="wa-export" style="flex:1;background:#2e7d32;color:#fff;border:none;border-radius:6px;padding:6px 8px;cursor:pointer">Exportar</button>
          <button id="wa-copy" title="Copiar JSON" style="background:#556cd6;color:#fff;border:none;border-radius:6px;padding:6px 8px;cursor:pointer">Copiar</button>
        </div>
    <div id="wa-status" style="font-size:12px;color:#555;margin-top:8px">Inativo</div>
    <div id="wa-log" style="margin-top:6px;font-size:11px;color:#666;white-space:pre-wrap;min-height:28px"></div>
      </div>
    `;
    document.body.appendChild(ui);

    // Eventos
    const closeBtn = ui.querySelector("#wa-close");
    if (closeBtn) {
      closeBtn.setAttribute('type','button');
      closeBtn.addEventListener('click', (e)=>{
        try{ e.stopPropagation(); }catch(e){}
        stopObserving();
        ui.remove();
      });
    }
  ui.querySelector("#wa-set").onclick = () => {
      const current = getCurrentChatName();
      if (current) {
        state.targetChatName = current;
        ui.querySelector("#wa-target").value = current;
        saveState();
        updateStatus();
      }
    };
    ui.querySelector("#wa-target").onchange = ev => {
  // sanitize manual input to avoid pasting huge member lists
  const v = ev.target.value.trim() || null;
  state.targetChatName = sanitizeChatName(v) || null;
      saveState();
      updateStatus();
    };
    ui.querySelector("#wa-enabled").onchange = ev => {
      state.enabled = ev.target.checked;
      saveState();
      state.enabled ? startObserving() : stopObserving();
      updateStatus();
    };
    ui.querySelector("#wa-debug").onchange = ev => {
      state.debug = !!ev.target.checked;
      saveState();
      updateStatus();
    };
    ui.querySelector("#wa-export").onclick = exportCaptured;
    ui.querySelector("#wa-copy").onclick = () => {
      const arr = Object.values(state.messages).sort((a,b)=>a.ts-b.ts);
      const dataStr = JSON.stringify({ exportedAt:new Date().toISOString(), targetChatName:state.targetChatName, count:arr.length, messages:arr }, null, 2);
      navigator.clipboard?.writeText(dataStr).then(()=>{
        const s = document.querySelector('#wa-status'); if(s) s.textContent = 'Copiado para área de transferência';
  // marcar como exportado (copiado)
  state.lastExportCount = arr.length; saveState(); updateBadge();
  setTimeout(updateStatus,1500);
      }).catch(()=>{
        const w = window.open(); w.document.write('<pre>'+escapeHtml(dataStr)+'</pre>');
      });
    };
    ui.querySelector("#wa-clear").onclick = () => {
      if (!confirm('Limpar todas as mensagens capturadas? Esta ação não pode ser desfeita.')) return;
      state.messages = {};
      saveState();
  state.lastExportCount = 0;
  saveState();
  updateStatus();
    };

    // restore
    ui.querySelector("#wa-target").value = state.targetChatName || "";
    ui.querySelector("#wa-enabled").checked = state.enabled;
  ui.querySelector("#wa-debug").checked = !!state.debug;
    if (state.enabled) startObserving();
    updateStatus();
  // tornar draggable
  makeDraggable(ui.querySelector('#wa-header'));
  }

  function updateStatus() {
    const s = document.querySelector("#wa-status");
    if (!s) return;
    const count = Object.keys(state.messages).length;
  const label = state.targetChatName? abbreviateChatLabel(state.targetChatName, 3) : '(nenhum)';
  const st = `${state.enabled?"Ativo":"Inativo"} • alvo: ${label} • msgs: ${count}`;
  s.textContent = st;
  uiLog('status', st);
    updateBadge();
  }

  function updateBadge(){
    try{
      const badge = document.querySelector('#wa-badge');
      if(!badge) return;
      const count = Object.keys(state.messages).length - (state.lastExportCount||0);
      if(count>0){
        badge.textContent = String(count>99? '99+': count);
        badge.style.visibility = 'visible';
      } else {
        badge.style.visibility = 'hidden';
      }
    }catch(e){}
  }

  // ---- Export JSON ----
  function exportCaptured() {
    const arr = Object.values(state.messages).sort((a,b)=>a.ts-b.ts);
    const dataStr = JSON.stringify({ exportedAt:new Date().toISOString(), targetChatName:state.targetChatName, count:arr.length, messages:arr }, null, 2);
    try {
      const blob = new Blob([dataStr], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const nameSafe = (state.targetChatName||'wa') .replace(/[\\/:*?"<>|]/g,'_');
      GM_download({ url, name: `wa_capture_${nameSafe}_${Date.now()}.json` });
      // revogar depois de um tempo
      setTimeout(()=>{ try{ URL.revokeObjectURL(url);}catch(e){} }, 5000);
  // marcar como exportado
  state.lastExportCount = arr.length;
  saveState();
  updateBadge();
    } catch (e) {
      const w = window.open();
      w.document.write('<pre>'+escapeHtml(dataStr)+'</pre>');
    }
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>\"']/g, c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'
    }[c]));
  }

  // ---- Init ----
  function init() {
    loadState();
    createUI();
  setInterval(updateStatus, 1500);
  uiLog('progress', 'Inicializando...');
  setTimeout(()=>uiLog('progress','Pronto'),1200);
  }

  // torna um elemento arrastável pelo header
  function makeDraggable(handle){
    if(!handle) return;
    const root = handle.closest('#wa-capture-ui');
    let isDown=false, startX=0,startY=0,origX=0,origY=0;
    handle.style.userSelect='none';
    handle.addEventListener('pointerdown', e=>{
      // não iniciar drag quando o pointerdown veio de um elemento interativo
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'A' || e.target.closest && e.target.closest('button,input,a')) return;
      isDown=true; startX=e.clientX; startY=e.clientY;
      const rect = root.getBoundingClientRect(); origX = rect.left; origY = rect.top;
      try{ handle.setPointerCapture(e.pointerId); }catch(err){}
    });
    window.addEventListener('pointermove', e=>{
      if(!isDown) return;
      const dx = e.clientX - startX; const dy = e.clientY - startY;
      root.style.right = 'auto'; root.style.left = Math.max(8, origX + dx) + 'px';
      root.style.top = Math.max(8, origY + dy) + 'px'; root.style.bottom = 'auto';
    });
    window.addEventListener('pointerup', e=>{ isDown=false; });
  }

  init();
})();
