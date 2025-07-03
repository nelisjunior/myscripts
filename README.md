# myscripts
Repositório com scripts diversos

[![Version](https://img.shields.io/badge/dynamic/json?color=blue&label=Version&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fnelisjunior%2Fmyscripts%2Fmain%2FVERSION)](https://github.com/nelisjunior/myscripts/releases)
[![Auto Versioning](https://img.shields.io/badge/Versioning-Automated-green)](./VERSIONING.md)

> **🔄 Versionamento Automático**: Este repositório usa versionamento automático baseado em Conventional Commits. Veja [VERSIONING.md](./VERSIONING.md) para detalhes.

## UserScripts

### Auto-Aceite LGPD e SIGMINE

[![Instalar com TamperMonkey](https://img.shields.io/badge/TamperMonkey-Instalar%20Script-blue?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/nelisjunior/myscripts/main/userscripts/Auto-Aceite%20LGPD%20e%20SIGMINE.user.js)

> **📋 Pré-requisito**: É necessário ter o [TamperMonkey](https://www.tampermonkey.net/) instalado em seu navegador. Clique no botão acima para instalação automática do script.

UserScript unificado para automação de aceite de termos em sites de mineração:
- **GEOANP**: Automatiza clique no botão "Prosseguir" do aviso LGPD
- **SIGMINE (geo.anm.gov.br)**: Automatiza checkbox "Eu concordo" e botão "OK"
- **Geoportal SGB**: Automatiza checkbox "Não mostrar esta tela de abertura novamente"

📁 **Localização**: `/userscripts/Auto-Aceite LGPD e SIGMINE.user.js`  
📖 **Documentação**: `/userscripts/README.md`

#### Justificativa
Os domínios https://geo.anm.gov.br/, https://geomaps.anp.gov.br/ e https://geoportal.sgb.gov.br/ exigem, por algum motivo, que concordemos com os termos SEMPRE que atualizamos (refresh [f5]) ou acessamos as páginas. Isso é deveras irritante! Diante desse cenário, criei com auxílio de IA o script que vos apresento neste repositório.

#### Características:
- ✅ Detecção automática de sites
- ✅ Múltiplos seletores para compatibilidade  
- ✅ Sistema de fallback robusto
- ✅ Debug logging detalhado
- ✅ Suporte a elementos dinâmicos

## 🔄 Fluxo de Desenvolvimento

Este repositório segue um fluxo de desenvolvimento padronizado para garantir qualidade e organização:

### 📋 Processo Recomendado

1. **Desenvolvimento na branch `dev`**
   - Todas as novas funcionalidades e correções devem ser desenvolvidas na branch `dev`
   - Use commits seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat:` para novas funcionalidades
     - `fix:` para correções de bugs
     - `docs:` para atualizações de documentação
     - `chore:` para tarefas de manutenção

2. **Integração via Pull Request**
   - **Obrigatório**: Sempre faça merge na `main` apenas via Pull Request
   - Nunca faça push direto na branch `main`
   - O PR deve ter uma descrição clara das mudanças implementadas
   - Aguarde revisão antes do merge (quando aplicável)

3. **Releases a partir da `main`**
   - **Releases só devem ser criadas a partir da branch `main`**
   - Use tags adequadas conforme o tipo de release:

### 🏷️ Padrões de Tags para Releases

#### **Releases Estáveis** (Produção)
- **Padrão**: `v*` (ex: `v1.0.0`, `v2.1.3`)
- **Uso**: Versões finais, prontas para uso em produção
- **Comando**: 
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

#### **Pre-releases** (Teste/Beta)
- **Padrão**: Tags contendo `beta` ou `alpha`
- **Exemplos**: `v1.0.0-beta.1`, `beta-v0.1.0`, `alpha-v0.2.0`
- **Uso**: Versões de teste, desenvolvimento ou features experimentais
- **Comando**:
  ```bash
  git tag v1.0.0-beta.1
  git push origin v1.0.0-beta.1
  ```

### ⚙️ Automação

- **Versionamento Automático**: Commits na `main` geram automaticamente novas versões beta
- **Releases Manuais**: Tags criadas manualmente geram releases conforme o padrão da tag
- **Sincronização**: Todas as versões são automaticamente sincronizadas nos arquivos `.user.js`

Para mais detalhes sobre o sistema de versionamento, consulte [VERSIONING.md](./VERSIONING.md).
