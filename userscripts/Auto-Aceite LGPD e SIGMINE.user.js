// ==UserScript==
// @name         Auto-Aceite LGPD e SIGMINE
// @namespace    http://tampermonkey.net/
// @version      beta-v0.1.1
// @description  Aceita automaticamente avisos de LGPD e termos no SIGMINE (ANM), geoanp (ANP) e geoportal (SGB).
// @author       Nélis Júnior
// @homepage     *://github.com/nelisjunior
// @match        *://geo.anm.gov.br/*
// @match        *://geomaps.anp.gov.br/geoanp/*
// @match        *://geoportal.sgb.gov.br/*
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

        // Caso geoportal - SGB
        const geoportalCheckbox = document.querySelector('.confirmcheck-container [role="checkbox"]');
        if (geoportalCheckbox && geoportalCheckbox.getAttribute('aria-checked') === 'false') {
            geoportalCheckbox.click();
            console.log('✅ Checkbox geoportal SGB clicada');
        }

        // Mensagem de espera
        if (!checkboxDiv && !lgpdBtn && !geoportalCheckbox) {
            console.log('⌛ Aguardando elementos aparecerem...');
        }
    }, 400);
})();
