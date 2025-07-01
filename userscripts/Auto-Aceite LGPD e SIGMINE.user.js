// ==UserScript==
// @name         Auto-Aceite LGPD e SIGMINE
// @namespace    https://github.com/nelisjunior/myscripts
// @version      1.0.0
// @description  Script unificado para automação de aceite LGPD no geoanp e SIGMINE no geo.anm.gov.br
// @author       Nelis Júnior
// @match        *://geoanp*/*
// @match        *://geo.anm.gov.br/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    // Configuração de debug
    const DEBUG = true;
    const log = (message, ...args) => {
        if (DEBUG) {
            console.log(`[Auto-Aceite LGPD e SIGMINE] ${message}`, ...args);
        }
    };
    
    // Detecta qual site está sendo executado
    const detectSite = () => {
        const hostname = window.location.hostname.toLowerCase();
        
        if (hostname.includes('geoanp')) {
            return 'geoanp';
        } else if (hostname.includes('geo.anm.gov.br')) {
            return 'sigmine';
        }
        
        return 'unknown';
    };
    
    // Função genérica para aguardar elemento aparecer
    const waitForElement = (selector, timeout = 10000, checkInterval = 100) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkElement = () => {
                const element = document.querySelector(selector);
                
                if (element) {
                    log(`Elemento encontrado: ${selector}`);
                    resolve(element);
                    return;
                }
                
                if (Date.now() - startTime >= timeout) {
                    log(`Timeout aguardando elemento: ${selector}`);
                    reject(new Error(`Timeout waiting for element: ${selector}`));
                    return;
                }
                
                setTimeout(checkElement, checkInterval);
            };
            
            checkElement();
        });
    };
    
    // Automação para GEOANP (LGPD)
    const automateGeoANP = async () => {
        log('Iniciando automação para GEOANP (LGPD)');
        
        try {
            // Aguarda o botão "Prosseguir" do aviso LGPD aparecer
            // Possíveis seletores comuns para botões de aceite LGPD
            const possibleSelectors = [
                'button[contains(text(), "Prosseguir")]',
                'button[contains(text(), "prosseguir")]',
                'input[type="button"][value*="Prosseguir"]',
                'input[type="submit"][value*="Prosseguir"]',
                'a[contains(text(), "Prosseguir")]',
                '.lgpd-accept, .lgpd-continue, .accept-lgpd',
                '[data-accept="lgpd"], [data-action="accept"]',
                'button.btn-primary, button.btn-success'
            ];
            
            let buttonFound = false;
            
            for (const selector of possibleSelectors) {
                try {
                    const button = await waitForElement(selector, 2000);
                    if (button && (button.textContent.toLowerCase().includes('prosseguir') || 
                                   button.value?.toLowerCase().includes('prosseguir'))) {
                        log('Clicando no botão "Prosseguir" do LGPD');
                        button.click();
                        buttonFound = true;
                        break;
                    }
                } catch (e) {
                    // Continua tentando próximo seletor
                }
            }
            
            if (!buttonFound) {
                log('Botão "Prosseguir" não encontrado, tentando abordagem mais genérica');
                // Fallback: procura por qualquer botão com texto relacionado
                const allButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"], a');
                for (const button of allButtons) {
                    const text = (button.textContent || button.value || '').toLowerCase();
                    if (text.includes('prosseguir') || text.includes('aceitar') || text.includes('concordo')) {
                        log(`Clicando no botão encontrado: "${text}"`);
                        button.click();
                        buttonFound = true;
                        break;
                    }
                }
            }
            
            if (buttonFound) {
                log('Automação GEOANP concluída com sucesso');
            } else {
                log('Nenhum botão de aceite LGPD encontrado');
            }
            
        } catch (error) {
            log('Erro na automação GEOANP:', error);
        }
    };
    
    // Automação para SIGMINE (geo.anm.gov.br)
    const automateSIGMINE = async () => {
        log('Iniciando automação para SIGMINE');
        
        try {
            // Aguarda o checkbox "Eu concordo" aparecer
            const checkboxSelectors = [
                'input[type="checkbox"][contains(text(), "Eu concordo")]',
                'input[type="checkbox"] + label[contains(text(), "Eu concordo")]',
                'input[type="checkbox"][id*="concordo"]',
                'input[type="checkbox"][name*="concordo"]',
                '.agree-checkbox, .consent-checkbox',
                '[data-agreement="true"], [data-consent="true"]'
            ];
            
            let checkboxFound = false;
            
            for (const selector of checkboxSelectors) {
                try {
                    let checkbox = await waitForElement(selector, 2000);
                    
                    // Se encontrou um label, procura o checkbox associado
                    if (checkbox.tagName === 'LABEL') {
                        const forId = checkbox.getAttribute('for');
                        if (forId) {
                            checkbox = document.getElementById(forId);
                        } else {
                            checkbox = checkbox.querySelector('input[type="checkbox"]');
                        }
                    }
                    
                    if (checkbox && checkbox.type === 'checkbox') {
                        log('Marcando checkbox "Eu concordo"');
                        if (!checkbox.checked) {
                            checkbox.checked = true;
                            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        checkboxFound = true;
                        break;
                    }
                } catch (e) {
                    // Continua tentando próximo seletor
                }
            }
            
            if (!checkboxFound) {
                log('Checkbox não encontrado, tentando abordagem mais genérica');
                // Fallback: procura por qualquer checkbox próximo a texto relevante
                const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
                for (const checkbox of allCheckboxes) {
                    const parentText = checkbox.parentElement?.textContent?.toLowerCase() || '';
                    const nextText = checkbox.nextElementSibling?.textContent?.toLowerCase() || '';
                    const prevText = checkbox.previousElementSibling?.textContent?.toLowerCase() || '';
                    
                    if (parentText.includes('concordo') || nextText.includes('concordo') || prevText.includes('concordo') ||
                        parentText.includes('aceito') || nextText.includes('aceito') || prevText.includes('aceito')) {
                        log('Marcando checkbox encontrado por proximidade de texto');
                        if (!checkbox.checked) {
                            checkbox.checked = true;
                            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        checkboxFound = true;
                        break;
                    }
                }
            }
            
            // Agora procura o botão "OK"
            const buttonSelectors = [
                'button[contains(text(), "OK")]',
                'input[type="button"][value="OK"]',
                'input[type="submit"][value="OK"]',
                'button.ok-button, button.confirm-button',
                '[data-action="ok"], [data-action="confirm"]'
            ];
            
            let buttonFound = false;
            
            for (const selector of buttonSelectors) {
                try {
                    const button = await waitForElement(selector, 2000);
                    if (button && (button.textContent.toLowerCase().includes('ok') || 
                                   button.value?.toLowerCase().includes('ok'))) {
                        log('Clicando no botão "OK"');
                        button.click();
                        buttonFound = true;
                        break;
                    }
                } catch (e) {
                    // Continua tentando próximo seletor
                }
            }
            
            if (!buttonFound) {
                log('Botão "OK" não encontrado, tentando abordagem mais genérica');
                // Fallback: procura por qualquer botão com texto "OK"
                const allButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
                for (const button of allButtons) {
                    const text = (button.textContent || button.value || '').toLowerCase();
                    if (text.includes('ok') || text.includes('confirmar') || text.includes('prosseguir')) {
                        log(`Clicando no botão encontrado: "${text}"`);
                        button.click();
                        buttonFound = true;
                        break;
                    }
                }
            }
            
            if (checkboxFound && buttonFound) {
                log('Automação SIGMINE concluída com sucesso');
            } else if (checkboxFound && !buttonFound) {
                log('Checkbox marcado, mas botão OK não encontrado');
            } else if (!checkboxFound && buttonFound) {
                log('Botão OK clicado, mas checkbox não encontrado');
            } else {
                log('Nenhum elemento de consentimento encontrado');
            }
            
        } catch (error) {
            log('Erro na automação SIGMINE:', error);
        }
    };
    
    // Função principal
    const main = () => {
        const site = detectSite();
        log(`Site detectado: ${site}`);
        
        // Aguarda o DOM estar pronto
        const executeAutomation = () => {
            switch (site) {
                case 'geoanp':
                    automateGeoANP();
                    break;
                case 'sigmine':
                    automateSIGMINE();
                    break;
                default:
                    log('Site não reconhecido para automação');
                    break;
            }
        };
        
        // Executa quando o DOM estiver carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', executeAutomation);
        } else {
            executeAutomation();
        }
        
        // Também executa depois de um tempo, caso os elementos apareçam dinamicamente
        setTimeout(executeAutomation, 1000);
        setTimeout(executeAutomation, 3000);
    };
    
    // Inicia o script
    main();
    
    log('Script Auto-Aceite LGPD e SIGMINE carregado');
    
})();