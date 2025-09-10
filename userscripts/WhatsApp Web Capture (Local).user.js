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
  let state = {
    enabled: false,
    targetChatName: null,
    messages: {}
  };

  // ---- Storage helpers (usando API do Tampermonkey) ----
  function saveState() {
    GM_setValue(STORAGE_KEY, state);
  }
  function loadState() {
    const s = GM_getValue(STORAGE_KEY, null);
    if (s) state = Object.assign(state, s);
  }

  // ---- DOM helpers ----
  function getChatTitleElement() {
    return document.querySelector('header [data-testid="chat-header"]') ||
           document.querySelector('header span[title]') ||
           document.querySelector('header div[role="button"] span');
  }
  function getCurrentChatName() {
    const el = getChatTitleElement();
    return el?.getAttribute('title') || el?.textContent?.trim() || null;
  }
  function extractMessageFromNode(node) {
    try {
      const id = node.getAttribute('data-id') || node.dataset.id || null;
      const txtEl = node.querySelector('span.selectable-text') || node.querySelector('span');
      const text = txtEl?.innerText?.trim() || "";
      if (!text) return null;
      const ts = Date.now();
      return { id: id || `local-${ts}-${text.slice(0,10)}`, text, ts };
    } catch (e) { return null; }
  }
  function storeMessage(msg) {
    if (!msg || !msg.id || state.messages[msg.id]) return false;
    state.messages[msg.id] = msg;
    saveState();
    return true;
  }

  // ---- Observador de mensagens ----
  let observer = null;
  function startObserving() {
    stopObserving();
    const convo = document.querySelector('[data-testid="conversation-panel"]');
    if (!convo) return;
    observer = new MutationObserver(muts => {
      if (!state.enabled) return;
      const current = getCurrentChatName();
      if (state.targetChatName && current !== state.targetChatName) return;
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (!(n instanceof HTMLElement)) continue;
          const candidates = n.matches('div[data-id]') ? [n] : n.querySelectorAll?.('div[data-id]');
          candidates && candidates.forEach(c => {
            const msg = extractMessageFromNode(c);
            msg && storeMessage(msg);
          });
        }
      }
    });
    observer.observe(convo, { childList: true, subtree: true });
  }
  function stopObserving() {
    observer?.disconnect();
    observer = null;
  }

  // ---- UI flutuante ----
  function createUI() {
    const ui = document.createElement("div");
    ui.id = "wa-capture-ui";
    ui.style.cssText = `
      position:fixed;bottom:12px;right:12px;z-index:99999;
      background:#fff;border:1px solid #ccc;border-radius:8px;
      box-shadow:0 2px 8px rgba(0,0,0,.2);padding:8px;font-size:13px;
      font-family:Inter,Roboto,Arial,sans-serif;min-width:200px;
    `;
    ui.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <strong style="font-size:12px">WA Capture</strong>
        <button id="wa-close" style="background:none;border:none;cursor:pointer">
          <!-- Feather X -->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="margin-bottom:4px">
        <input id="wa-target" placeholder="Chat alvo" style="width:100%;padding:4px;font-size:12px;border:1px solid #ccc;border-radius:4px" />
        <button id="wa-set" title="Definir chat aberto" style="margin-top:4px;width:100%;background:#1976d2;color:#fff;border:none;border-radius:4px;padding:4px;cursor:pointer">
          <!-- Feather Target -->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          Definir como atual
        </button>
      </div>
      <div style="display:flex;gap:4px;align-items:center;margin-bottom:4px">
        <label style="font-size:12px"><input type="checkbox" id="wa-enabled"/> Captura</label>
        <button id="wa-export" style="background:#2e7d32;color:#fff;border:none;border-radius:4px;padding:4px;cursor:pointer">
          <!-- Feather Download -->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
        </button>
      </div>
      <div id="wa-status" style="font-size:11px;color:#555">Inativo</div>
    `;
    document.body.appendChild(ui);

    // Eventos
    ui.querySelector("#wa-close").onclick = () => ui.remove();
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
      state.targetChatName = ev.target.value.trim() || null;
      saveState();
      updateStatus();
    };
    ui.querySelector("#wa-enabled").onchange = ev => {
      state.enabled = ev.target.checked;
      saveState();
      state.enabled ? startObserving() : stopObserving();
      updateStatus();
    };
    ui.querySelector("#wa-export").onclick = exportCaptured;

    // restore
    ui.querySelector("#wa-target").value = state.targetChatName || "";
    ui.querySelector("#wa-enabled").checked = state.enabled;
    if (state.enabled) startObserving();
    updateStatus();
  }

n  function updateStatus() {
    const s = document.querySelector("#wa-status");
    if (!s) return;
    const count = Object.keys(state.messages).length;
    s.textContent = `${state.enabled?"Ativo":"Inativo"} • alvo: ${state.targetChatName||"(nenhum)"} • msgs: ${count}`;
  }

  // ---- Export JSON ----
  function exportCaptured() {
    const arr = Object.values(state.messages).sort((a,b)=>a.ts-b.ts);
    const dataStr = JSON.stringify({ exportedAt:new Date().toISOString(), targetChatName:state.targetChatName, count:arr.length, messages:arr }, null, 2);
    GM_download({ url: URL.createObjectURL(new Blob([dataStr], {type:"application/json"})), name: `wa_capture_${Date.now()}.json` });
  }

  // ---- Init ----
  function init() {
    loadState();
    createUI();
    setInterval(updateStatus, 1500);
  }

  init();
})();
