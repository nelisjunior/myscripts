# UserScript: Auto-Aceite LGPD e SIGMINE

Este UserScript automatiza o processo de aceite de termos em dois sites relacionados à mineração no Brasil:

- **GEOANP**: Automatiza o clique no botão "Prosseguir" do aviso LGPD
- **SIGMINE (geo.anm.gov.br)**: Automatiza o checkbox "Eu concordo" e clique no botão "OK"

## Funcionalidades

### 🔍 Detecção Automática de Sites
O script detecta automaticamente em qual site está executando:
- Sites que contêm "geoanp" no hostname → Executa automação LGPD
- Sites "geo.anm.gov.br" → Executa automação SIGMINE

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

### 🐛 Debug e Logging
- Console logging detalhado para depuração
- Mensagens informativas sobre cada etapa da automação
- Facilita identificação de problemas ou mudanças nos sites

## Instalação

1. Instale uma extensão de UserScript em seu navegador:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge)
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