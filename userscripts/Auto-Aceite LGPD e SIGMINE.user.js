// ==UserScript==
// @name         Auto-Aceite LGPD e SIGMINE
// @namespace    http://tampermonkey.net/
// @version      0.1-beta
// @description  Aceita automaticamente avisos de LGPD e termos no SIGMINE (ANM) e geoanp (ANP).
// @author       Nélis Júnior
// @homepage     *://github.com/nelisjunior
// @match        *://geo.anm.gov.br/*
// @match        *://geomaps.anp.gov.br/geoanp/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const interval = setInterval(() => {
        // Caso SIGMINE - ANM
        const checkboxDiv = document.querySelector('div[role="checkbox"][aria-label*="Eu concordo"]');
        const okButton = document.querySelector('button[title="OK"]');

        if (checkboxDiv && checkboxDiv.getAttribute('aria-checked') === 'false') {
            checkboxDiv.click();
            console.log('✅ Checkbox SIGMINE clicada');
        }

        if (checkboxDiv && checkboxDiv.getAttribute('aria-checked') === 'true' && okButton) {
            okButton.click();
            console.log('✅ Botão OK SIGMINE clicado');
            clearInterval(interval);
            return;
        }

        // Caso LGPD geoanp - ANP
        const lgpdBtn = document.getElementById('lgpd_compliance_agreed');
        if (lgpdBtn) {
            lgpdBtn.click();
            console.log('✅ Botão "Prosseguir" LGPD clicado');
            clearInterval(interval);
            return;
        }

        // Mensagem de espera
        if (!checkboxDiv && !lgpdBtn) {
            console.log('⌛ Aguardando elementos aparecerem...');
        }
    }, 400);
})();
