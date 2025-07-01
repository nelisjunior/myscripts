# myscripts
Repositório com scripts diversos

## UserScripts

### Auto-Aceite LGPD e SIGMINE

[![Instalar com TamperMonkey](https://img.shields.io/badge/TamperMonkey-Instalar%20Script-blue?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/nelisjunior/myscripts/main/userscripts/Auto-Aceite%20LGPD%20e%20SIGMINE.user.js)

> **📋 Pré-requisito**: É necessário ter o [TamperMonkey](https://www.tampermonkey.net/) instalado em seu navegador. Clique no botão acima para instalação automática do script.

UserScript unificado para automação de aceite de termos em sites de mineração:
- **GEOANP**: Automatiza clique no botão "Prosseguir" do aviso LGPD
- **SIGMINE (geo.anm.gov.br)**: Automatiza checkbox "Eu concordo" e botão "OK"

📁 **Localização**: `/userscripts/Auto-Aceite LGPD e SIGMINE.user.js`  
📖 **Documentação**: `/userscripts/README.md`

#### Justificativa
Ambos os domínios, https://geo.anm.gov.br/ e https://geomaps.anp.gov.br/, exigem, por algum motivo, que concordemos com os termos SEMPRE que atualizamos (refresh [f5]) ou acessamos ambas as páginas. Isso é deveras irritante! Ditante desse cenário, criei com auxílio de IA o script que vos apresento neste repositório.

#### Características:
- ✅ Detecção automática de sites
- ✅ Múltiplos seletores para compatibilidade  
- ✅ Sistema de fallback robusto
- ✅ Debug logging detalhado
- ✅ Suporte a elementos dinâmicos
