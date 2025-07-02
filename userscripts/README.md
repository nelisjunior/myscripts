# UserScript: Auto-Aceite LGPD e SIGMINE

[![Instalar com TamperMonkey](https://img.shields.io/badge/TamperMonkey-Instalar%20Script-blue?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/nelisjunior/myscripts/main/userscripts/Auto-Aceite%20LGPD%20e%20SIGMINE.user.js)

> **📋 Pré-requisito**: É necessário ter o [TamperMonkey](https://www.tampermonkey.net/) instalado em seu navegador. Clique no botão acima para instalação automática do script.

Este UserScript automatiza o processo de aceite de termos em três sites relacionados à mineração no Brasil:

- **GEOANP**: Automatiza o clique no botão "Prosseguir" do aviso LGPD
- **SIGMINE (geo.anm.gov.br)**: Automatiza o checkbox "Eu concordo" e clique no botão "OK"
- **Geoportal SGB**: Automatiza o checkbox "Não mostrar esta tela de abertura novamente"

## Funcionalidades

### 🔍 Detecção Automática de Sites
O script detecta automaticamente em qual site está executando:
- Sites que contêm "geoanp" no hostname → Executa automação LGPD
- Sites "geo.anm.gov.br" → Executa automação SIGMINE
- Sites "geoportal.sgb.gov.br" → Executa automação Geoportal SGB

### 🤖 Automação GEOANP (LGPD)
- Aguarda o aparecimento do botão "Prosseguir" do aviso LGPD
- Clica automaticamente no botão
- Utiliza múltiplos seletores para maior compatibilidade
- Fallback para busca por texto em caso de mudanças no site

### 🤖 Automação SIGMINE
- Localiza e marca o checkbox "Eu concordo"
- Localiza e clica no botão "OK" 
- Suporte a diferentes estruturas HTML (label associado, checkbox independente)
- Fallback para busca por proximidade de texto

### 🤖 Automação Geoportal SGB
- Localiza checkbox com role="checkbox" dentro da .confirmcheck-container
- Marca automaticamente quando aria-checked = 'false'
- Aceita aviso "Não mostrar esta tela de abertura novamente"
- Mantém compatibilidade com outros sites

### 🐛 Debug e Logging
- Console logging detalhado para depuração
- Mensagens informativas sobre cada etapa da automação
- Facilita identificação de problemas ou mudanças nos sites

## Instalação

### 🚀 Instalação Rápida (Recomendada)

1. **Instale o TamperMonkey** em seu navegador:
   - [TamperMonkey para Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [TamperMonkey para Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - [TamperMonkey para Safari](https://apps.apple.com/app/tampermonkey/id1482490089)
   - [TamperMonkey para Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. **Clique no botão de instalação** no topo desta página para instalar automaticamente

### 🔧 Instalação Manual

Para usuários de outros gerenciadores de UserScript:

1. Instale uma extensão de UserScript em seu navegador:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge) - **Recomendado**
   - [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/) (Firefox)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)

2. Copie o conteúdo do arquivo `Auto-Aceite LGPD e SIGMINE.user.js`

3. Crie um novo UserScript na extensão e cole o código

4. Salve e ative o script

## Como Funciona

### Execução
- O script executa automaticamente quando você visita os sites compatíveis
- Utiliza múltiplas tentativas para encontrar os elementos necessários
- Executa em momentos diferentes para capturar elementos carregados dinamicamente

### Seletores Inteligentes
O script utiliza uma abordagem em camadas para encontrar elementos:

1. **Seletores específicos**: Baseados em IDs, classes e atributos comuns
2. **Seletores por texto**: Busca elementos pelo conteúdo textual
3. **Seletores por proximidade**: Encontra elementos por proximidade com texto relevante

### Compatibilidade
- Funciona com diferentes estruturas HTML dos sites
- Adapta-se a mudanças menores no layout
- Suporte a elementos carregados dinamicamente via JavaScript

## Troubleshooting

### Script não funciona
1. Verifique se o site está nos domínios suportados
2. Abra o console do navegador (F12) para ver as mensagens de debug
3. Verifique se a extensão UserScript está ativa

### Elementos não encontrados
1. Os sites podem ter mudado sua estrutura HTML
2. Verifique as mensagens no console para identificar o problema
3. O script pode precisar de atualização para novos seletores

### Debug
Para ativar/desativar mensagens de debug, modifique a constante no início do script:
```javascript
const DEBUG = true; // true para ativar, false para desativar
```

## Changelog

### v0.2-beta
- Adicionado suporte para geoportal.sgb.gov.br
- Implementada automação para checkbox "Não mostrar esta tela de abertura novamente"
- Seletor para checkbox com role="checkbox" dentro de .confirmcheck-container
- Mantida compatibilidade com SIGMINE e GEOANP
- Debug logging detalhado para o novo site

### v1.0.0
- Implementação inicial
- Suporte para GEOANP (LGPD) e SIGMINE
- Sistema de detecção automática de sites
- Múltiplos seletores para compatibilidade
- Sistema de fallback robusto
- Logging detalhado para debug

## Licença

MIT License - veja o arquivo LICENSE no diretório raiz do repositório.

## Autor

Nelis Júnior - [GitHub](https://github.com/nelisjunior)