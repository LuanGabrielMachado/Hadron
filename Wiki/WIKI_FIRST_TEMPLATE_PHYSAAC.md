# WIKI-FIRST TEMPLATE — Hadron (Motor de Física Web)

> **Propósito:** Este documento é uma tarefa para um agente de IA (Code Agent) configurar um sistema wiki-first em um projeto de biblioteca JavaScript/TypeScript.
> Copie este arquivo em seu projeto, preencha os parâmetros, e entregue ao agente de IA para execução.

> ⚡ **FOCO DO HADRON:** Diferente de sistemas de segurança crítica, o Hadron é um motor de física leve para animações web. A wiki prioriza **clareza de conceitos matemáticos**, **receitas de configuração**, e **exemplos práticos** em vez de protocolos de segurança.

---

## DADOS DE ENTRADA (PRÉ-PREENCHIDOS PARA HADRON)

| Parâmetro | Valor |
|-----------|-------|
| `project_name` | `Hadron` |
| `project_description` | `Motor de física newtoniana para partículas em interfaces web — com thermal noise, giroscópio e zero re-renders` |
| `tech_stack` | `TypeScript, JavaScript, React Hooks, DOM API, DeviceMotion API, requestAnimationFrame` |
| `docs_path` | `Docs/` |
| `wiki_path` | `docs/wiki/` |
| `skills_path` | `.qwen/skills/` |
| `source_dirs` | `src/` |
| `performance_budget` | `60 FPS (16ms por frame), <100 partículas para DOM` |

---

## TAREFA PARA O AGENTE DE IA

### Objetivo

Criar um **sistema wiki-first** para o projeto Hadron — um conjunto de páginas wiki, skills, e instruções que fornecerão:

1. **Fonte única de verdade** sobre o projeto em `docs/wiki/`
2. **Regra wiki-first** — todas as skills de IA começam com wiki antes de ler código
3. **Atualidade automática** — wiki é atualizada sempre que o código muda
4. **Economia de contexto** — agente de IA lê wiki (visão geral + conceitos), não código (detalhes)
5. **Clareza conceitual** — explicações acessíveis de matemática e física

---

### Passo 1: Criar Estrutura Wiki

**Tarefa:** Criar diretório wiki e arquivos iniciais.

**Ações:**

```bash
mkdir -p {wiki_path}
```

**Criar 3 arquivos:**

| Arquivo | Propósito |
|---------|-----------|
| `{wiki_path}index.md` | Catálogo de todas as páginas wiki (navegação) |
| `{wiki_path}log.md` | Log de mudanças da wiki (append-only) |
| `{wiki_path}Wiki Format.md` | Guia de formatação de páginas |

Abaixo está o conteúdo para cada arquivo.

---

#### Arquivo 1: `wiki/log.md`

```markdown
# Wiki Log

Diário cronológico de todas as mudanças na wiki.

---

## [YYYY-MM-DD] setup | Inicialização da Wiki

**Tipo:** setup
**Autor:** AI agent

### Descrição

Estrutura inicial da wiki criada para projeto {project_name}.

### Arquivos criados

- `{wiki_path}index.md` — catálogo de páginas wiki
- `{wiki_path}log.md` — log de mudanças
- `{wiki_path}Wiki Format.md` — guia de formatação de páginas

### Conceitos Documentados

- Sequência de Halton para distribuição quasi-aleatória
- Ruído suave determinístico para movimento orgânico
- Integração de Euler para atualização de posições
- Damping adaptativo durante shake
- Repulsão entre partículas (O(n²))
- Colisão AABB-Círculo com obstáculos
```

---

#### Arquivo 2: `wiki/index.md`

```markdown
# Wiki Index

Catálogo de todas as páginas wiki para projeto {project_name}.

## 📋 Visão Geral

| Categoria | Página | Descrição |
|-----------|--------|-------------|
| overview | [[Architecture]] | Arquitetura geral do sistema Hadron |
| concepts | [[PhysicsConcepts]] | Halton, noise, Euler, damping, repulsão, colisões |
| recipes | [[ConfigurationRecipes]] | Receitas de configuração para diferentes efeitos |
| components | [[Components]] | Descrição de componentes (engine, react, adapters) |
| patterns | [[CodePatterns]] | Padrões TypeScript, convenções, estilo de código |
| integration | [[IntegrationGuide]] | Integração com React, Vue, Svelte, Vanilla JS |

## 📝 Instruções Wiki

| Página | Descrição |
|--------|-------------|
| [[Wiki Format]] | Formato de página: frontmatter, links, log.md, index.md |

## ⚡ Performance Guidelines

| Métrica | Target | Notas |
|---------|--------|-------|
| Frame Budget | 16ms (60 FPS) | Manter animação suave |
| Partículas (DOM) | <100 | Acima disso, considerar Canvas |
| Complexidade Repulsão | O(n²) | Otimizar com spatial hashing se necessário |
| Memory Leaks | Zero | Limpar RAF listeners, refs |

---

> **Como usar:** Quando solicitado a analisar ou estudar partes do projeto, o LLM atualiza este index.md adicionando novas páginas nas categorias relevantes.
```

---

#### Arquivo 3: `wiki/Wiki Format.md`

Este arquivo contém o guia de formato de páginas wiki. Crie-o com o seguinte conteúdo:

    ---
    tags: [wiki, format, instructions]
    created: YYYY-MM-DD
    updated: YYYY-MM-DD
    sources: [.qwen/skills/wiki-workflow/SKILL.md]
    ---

    # Wiki Format

    Guia de formatos de páginas wiki, links, e logs.

    > ⚡ **Nota de Performance:** Páginas relacionadas a algoritmos devem incluir complexidade computacional e recomendações de uso.

    ---

    ## Frontmatter

    Cada página wiki começa com um frontmatter YAML:

        ---
        tags: [categoria, tag]
        created: YYYY-MM-DD
        updated: YYYY-MM-DD
        sources: [caminho/para/arquivo1, caminho/para/arquivo2]
        complexity: O(n) | O(n²) | etc. (se aplicável)
        performance_notes: breves notas de performance
        ---

    **Campos:**

    | Campo | Descrição | Formato |
    |-------|-------------|---------|
    | `tags` | Categorias da página | Array de tags |
    | `created` | Data de criação | YYYY-MM-DD |
    | `updated` | Data da última atualização | YYYY-MM-DD |
    | `sources` | Fontes de informação | Array de caminhos |
    | `complexity` | Complexidade algorítmica (se aplicável) | Notação Big-O |
    | `performance_notes` | Notas de performance | Texto breve |

    ---

    ## Links para páginas wiki

    Use colchetes duplos:

        [[Architecture]] — arquitetura geral do sistema
        [[PhysicsConcepts]] — conceitos físicos e matemáticos
        [[ConfigurationRecipes]] — receitas de configuração

    ---

    ## Links para arquivos do projeto

    Caminhos relativos a partir da página wiki:

        [tick-particles.ts](../../src/engine/tick-particles.ts)
        [use-physics-particles.ts](../../src/react/use-physics-particles.ts)

    ---

    ## Citação de Código

    Ao referenciar código, especifique o arquivo e contexto:

        De `halton.ts`:
        ```typescript
        // Sequência de Halton para distribuição quasi-aleatória
        export function halton(index: number, base: number): number {
          let f = 1, r = 0, i = index;
          while (i > 0) {
            f /= base;
            r += f * (i % base);
            i = Math.floor(i / base);
          }
          return r;
        }
        ```

    ---

    ## Formato log.md

    Cada entrada em `wiki/log.md`:

        ## [YYYY-MM-DD] tipo | Breve descrição

        **Tipo:** ingest | update | setup | lint
        **Autor:** nome

        ### Descrição

        O que foi feito.

        ### Fontes

        - `caminho/para/arquivo1.ts`
        - `caminho/para/arquivo2.md`

        ### O que mudou

        | Antes | Depois |
        |-------|--------|
        | antigo | novo |

        ### Notas de Performance

        - Impacto no frame budget: X ms
        - Complexidade alterada: O(n) → O(n²)

    **Tipos de entrada:**

    | Tipo | Descrição |
    |------|-------------|
    | `setup` | Configuração inicial |
    | `ingest` | Adicionando novo conhecimento |
    | `update` | Atualizando páginas existentes |
    | `lint` | Corrigindo problemas wiki |

    ---

    ## Formato index.md

    Catálogo de páginas wiki com categorias:

        # Wiki Index

        ## 📋 Visão Geral

        | Categoria | Página | Descrição |
        |-----------|--------|-------------|
        | overview | [[Página]] | Descrição |

    **Regras:**
    - Agrupar por categorias
    - Usar emoji para separação visual
    - Toda página deve estar no catálogo
    - Breve descrição para cada página
    - Incluir seção de performance guidelines

---

### Passo 2: Criar Skill wiki-workflow

**Tarefa:** Criar uma skill de IA para gerenciamento wiki.

**Arquivo:** `{skills_path}wiki-workflow/SKILL.md`

Crie o arquivo com o seguinte conteúdo:

    ---
    name: wiki-workflow
    description: Gerencia o sistema wiki do projeto — operações ingest, query, lint com docs/wiki/. Use para aprender o projeto, atualizar conhecimento, ou verificar integridade.
    security_level: standard
    ---

    # Wiki Workflow

    ## Propósito da Skill

    Esta skill é o **gerente do sistema wiki**. Gerencia conhecimento do projeto:
    - Ingest — extraindo conhecimento do código para wiki
    - Query — buscando e sintetizando conhecimento da wiki
    - Lint — verificando integridade wiki
    - Post-Change Lint — atualizando wiki após mudanças de código

    **Quando usar:**
    - "Atualizar wiki" ou "estudar X" → operação **Ingest**
    - "Como X funciona?" ou "me conte sobre Y" → operação **Query**
    - "Verificar wiki" ou "encontrar problemas wiki" → operação **Lint**
    - Após qualquer mudança de código → **Post-Change Lint** (obrigatório)

    **Quando NÃO usar:**
    - Para escrever código → use `code-contributor`
    - Para revisão arquitetural → use `code-architecture`

    ---

    ## PRIORIDADE DE FONTES (OBRIGATÓRIO)

    Esta skill é o **gerente do sistema wiki**. Todas as outras skills devem consultar wiki antes de ler código do projeto.

    ### Hierarquia de fontes

    | Nível | Fonte | Prioridade | Descrição |
    |-------|--------|----------|-------------|
    | 1 | `docs/wiki/` | **Mais alta** | Conhecimento concreto do projeto. Regras atuais do projeto. |
    | 2 | Código do projeto | **Secundária** | Arquivos fonte — apenas se wiki for insuficiente. |

    **Regra:** Se wiki descreve uma coisa e código mostra outra, wiki reflete o estado atual. Código é fonte de detalhes, wiki é fonte de visão geral + conceitos.

    ### Wiki = visão geral + conceitos, Código = detalhes

    Páginas wiki contêm **visão geral** de estrutura, padrões, componentes, e **conceitos físicos/matemáticos**. Informações detalhadas estão no código:

    | Wiki contém | Código contém |
    |---------------|---------------|
    | Quais componentes existem | Implementação de cada método |
    | Conceitos (Halton, noise, Euler) | Algoritmos específicos |
    | Receitas de configuração | Valores padrão |
    | Padrões e convenções | Exemplos de uso |

    **Ao fazer ingest:** não copie trechos longos de código para wiki. Wiki = visão geral + conceito + link para arquivo.
    **Ao fazer query:** se wiki não tem detalhes — leia o código.

    ---

    ## Operações da Skill

    ### 1. Ingest — Adicionando Conhecimento

    **Gatilhos:** "analisar X", "estudar Y", "atualizar wiki", "adicionar conhecimento sobre Z"

    **Algoritmo:**

    1. Determinar escopo de análise (quais partes do projeto estudar)
    2. Ler arquivos relevantes do projeto
    3. Extrair informações chave:
       - Arquitetura e padrões
       - Dependências e interfaces
       - Decisões e mudanças
       - **Conceitos físicos/matemáticos (Halton, noise, damping)**
       - **Receitas de configuração**
    4. Criar ou atualizar páginas wiki em docs/wiki/
    5. Atualizar wiki/index.md (adicionar novas páginas ao catálogo)
    6. Adicionar entrada em wiki/log.md

    ### 2. Query — Recuperação de Conhecimento

    **Gatilhos:** "como X funciona", "me conte sobre Y", "o que Z faz", perguntas sobre projeto

    **Algoritmo:**

    1. Ler wiki/index.md para navegação
    2. Encontrar páginas wiki relevantes
    3. Se necessário, ler arquivos do projeto para esclarecimento
    4. Sintetizar resposta com citações e links para arquivos
    5. Se informação estiver faltando — executar Ingest para criá-la

    ### 3. Lint — Verificação de Saúde Wiki

    **Gatilhos:** "verificar wiki", "encontrar problemas", "verificar integridade"

    **Algoritmo:**

    1. Ler todas as páginas wiki
    2. Verificar por:
       - Contradições entre páginas
       - Afirmações desatualizadas (comparar com código do projeto)
       - Links quebrados de páginas wiki [[Página]]
       - Links quebrados de arquivos do projeto
       - Referências cruzadas faltantes entre tópicos relacionados
       - Páginas sem frontmatter
       - Entradas faltantes em log.md
       - **Receitas de configuração desatualizadas**
    3. Propor correções
    4. Após confirmação — aplicar correções

    ### 4. Post-Change Lint — Verificação Após Mudanças de Código

    **Gatilhos:** Executa após **qualquer** criação, modificação, ou deleção de arquivos de código.

    **Algoritmo:**

    1. Determinar quais páginas wiki podem conter informações desatualizadas
    2. Ler páginas wiki relevantes
    3. Ler arquivos de código alterados
    4. Verificar:
       - Descrições wiki correspondem ao código atual
       - Interfaces, funções, opções não mudaram
       - Novos arquivos/classes estão refletidos na wiki
       - Arquivos deletados são removidos de descrições
       - **Receitas de configuração ainda são válidas**
    5. Atualizar páginas wiki se necessário
    6. Adicionar entrada em wiki/log.md

    ---

    ## Proibições

    - NÃO modificar arquivos do projeto através de operações wiki
    - NÃO deletar páginas wiki sem confirmação do usuário
    - NÃO limpar `wiki/log.md` (append-only)
    - NÃO renomear páginas wiki sem atualizar todos os links
    - NÃO copiar trechos longos de código para wiki (use links)

---

### Passo 3: Criar Skill code-contributor

**Tarefa:** Criar uma skill de IA para escrever código com regra wiki-first.

**Arquivo:** `{skills_path}code-contributor/SKILL.md`

Crie o arquivo com o seguinte conteúdo:

    ---
    name: code-contributor
    description: Ajuda a adicionar e modificar código do projeto conforme padrões estabelecidos. Use ao criar features, corrigir bugs, refatorar, ou escrever documentação.
    security_level: standard
    requires_review: false
    ---

    # Code Contributor

    ## PRIORIDADE DE FONTES (OBRIGATÓRIO)

    Para **qualquer** solicitação de escrever código, refatorar, corrigir bugs, ou criar features:

    1. **Primeiro** ler `docs/wiki/index.md`
    2. **Encontrar** páginas wiki relevantes e estudar seu conteúdo
    3. **Usar wiki como fonte primária** de decisões arquiteturais, padrões, e convenções
    4. **Apenas se** wiki não tiver informação necessária — ler arquivos do projeto
    5. **Após** estudar código do projeto — atualizar wiki se nova ou alterada informação for encontrada

    **Wiki é a fonte primária de conhecimento, não o código do projeto.**

    ### Wiki vs Código — Onde Encontrar O Quê

    | Tipo de informação | Onde procurar |
    |------------------|---------------|
    | Arquitetura, padrões, convenções | **Wiki** — visão geral e links |
    | Detalhes de implementação | **Código** — arquivos fonte |
    | Conceitos físicos/matemáticos | **Wiki** ([[PhysicsConcepts]]) |
    | Receitas de configuração | **Wiki** ([[ConfigurationRecipes]]) |
    | Guias de integração | **Wiki** ([[IntegrationGuide]]) |
    | Assinaturas de funções | **Código** — arquivos .ts |

    ---

    ## Propósito da Skill

    Esta skill é a **bancada de trabalho do desenvolvedor**. Contém regras para escrever código conforme padrões do projeto.

    **Quando usar:**
    - Criar novas features ou funções
    - Corrigir bugs
    - Refatorar código existente
    - Escrever documentação do projeto

    **Quando NÃO usar:**
    - Para revisão arquitetural → use `code-architecture`
    - Para gerenciamento wiki → use `wiki-workflow`

    ---

    ## Antes de Começar o Trabalho

    Determine o tipo de tarefa e leia as páginas wiki relevantes:

    | Tipo de tarefa | Ler em wiki |
    |-----------|-------------|
    | Novo componente | Architecture, Components |
    | Mudança de código | CodePatterns |
    | Novo parâmetro de configuração | ConfigurationRecipes |
    | Integração com framework | IntegrationGuide |
    | Otimização de performance | PhysicsConcepts (seção de complexidade) |
    | Hook React | IntegrationGuide (seção React) |

    ---

    ## Regras de Performance Obrigatórias

    Ao trabalhar com código de animação:

    1. **Manter 60 FPS** — operações dentro do budget de 16ms
    2. **Evitar alocações desnecessárias** — reutilizar objetos quando possível
    3. **Zero re-renders no React** — atualizar DOM diretamente via refs
    4. **Limpar listeners** — remover RAF, event listeners on unmount
    5. **Documentar complexidade** — comentar O(n) de algoritmos

    ---

    ## Checklist Pré-Commit

    Antes de considerar uma tarefa completa:

    - [ ] Wiki consultada primeiro
    - [ ] Performance considerada (60 FPS target)
    - [ ] Memory leaks prevenidos (RAF, listeners)
    - [ ] Wiki atualizada com mudanças
    - [ ] Entrada adicionada em `log.md`

---

### Passo 4: Criar Skill code-architecture

**Tarefa:** Criar uma skill de IA para revisão arquitetural com regra wiki-first.

**Arquivo:** `{skills_path}code-architecture/SKILL.md`

Crie o arquivo com o seguinte conteúdo:

    ---
    name: code-architecture
    description: Verifica arquitetura de código para conformidade com padrões do projeto, API design, e multi-framework compatibility. Use durante code review, criação de módulos, ou análise de solução.
    security_level: standard
    requires_review: false
    ---

    # Code Architecture

    ## PRIORIDADE DE FONTES (OBRIGATÓRIO)

    Para **qualquer** solicitação de análise arquitetural, code review, criação de classes, ou design de módulos:

    1. **Primeiro** ler `docs/wiki/index.md`
    2. **Encontrar** páginas wiki relevantes e estudá-las
    3. **Usar wiki como fonte primária** de regras arquiteturais, padrões, e convenções
    4. **Apenas se** wiki não tiver informação necessária — ler arquivos do projeto
    5. **Após** análise — fornecer review com achados específicos e recomendações

    **Wiki é a fonte primária de conhecimento.**

    ---

    ## Propósito da Skill

    Esta skill é o **revisor arquitetural**. Avalia código para conformidade com padrões do projeto, API design consistente, e compatibilidade multi-framework.

    **Quando usar:**
    - Code review
    - Avaliando decisões arquiteturais antes da implementação
    - Verificando compatibilidade de API
    - Analisando relacionamentos entre módulos

    **Quando NÃO usar:**
    - Para escrever novo código → use `code-contributor`
    - Para correções de bugs → use `code-contributor`

    ---

    ## Critérios de Revisão

    ### Arquitetura

    - [ ] Separação de módulos respeitada (engine, react, adapters, device-motion)
    - [ ] Dependências unidirecionais (react depende de engine, não vice-versa)
    - [ ] Interfaces bem definidas entre módulos
    - [ ] Single Responsibility Principle aplicado

    ### API Design

    - [ ] Nomes de parâmetros claros e consistentes
    - [ ] Valores padrão sensatos
    - [ ] Tipos TypeScript bem definidos
    - [ ] Breaking changes documentados

    ### Multi-Framework Compatibility

    - [ ] Core vanilla não depende de React
    - [ ] Hooks React são opcionais
    - [ ] Refs funcionam com { current } pattern
    - [ ] Documentação cobre React, Vue, Svelte, Vanilla

    ### Performance

    - [ ] Complexidade algorítmica adequada (<O(n²) para loops por frame)
    - [ ] Alocações de memória minimizadas
    - [ ] RAF listeners limpos corretamente
    - [ ] Zero memory leaks

    ---

    ## Checklist de Review

    Antes de aprovar uma mudança arquitetural:

    - [ ] Wiki consultada primeiro
    - [ ] Separação de módulos mantida
    - [ ] API consistente com existente
    - [ ] Performance considerada
    - [ ] Multi-framework compatibility verificada
    - [ ] Wiki atualizada se necessário
    - [ ] Entrada adicionada em `log.md`

---

### Passo 5: Criar QWEN.md na Raiz

**Tarefa:** Criar arquivo de regras principais do projeto.

**Arquivo:** `QWEN.md`

Crie o arquivo com o seguinte conteúdo:

    # Regras Principais do Projeto Hadron

    ## Regra Wiki-First (OBRIGATÓRIO)

    Para **qualquer** tarefa neste projeto:

    1. **PRIMEIRO** ler `docs/wiki/index.md`
    2. **ENCONTRAR** páginas wiki relevantes
    3. **ESTUDAR** conteúdo wiki antes de tocar no código
    4. **SOMENTE SE** wiki não tiver informação suficiente — ler código
    5. **APÓS** mudanças — atualizar wiki e `log.md`

    **Hierarquia de fontes:**
    1. `docs/wiki/` — fonte primária (visão geral + conceitos + receitas)
    2. Código do projeto — fonte secundária (detalhes de implementação)

    ---

    ## Skills Disponíveis

    | Skill | Propósito | Quando Usar |
    |-------|-----------|-------------|
    | `wiki-workflow` | Gerenciamento wiki | Ingest, query, lint, post-change lint |
    | `code-contributor` | Escrita de código | Features, bugs, refactoring |
    | `code-architecture` | Revisão arquitetural | Code review, API design, multi-framework |

    ---

    ## Regras de Performance

    - **Target:** 60 FPS (16ms por frame)
    - **Partículas (DOM):** <100 para performance ideal
    - **Complexidade:** Evitar >O(n²) em loops por frame
    - **Memory:** Zero leaks — limpar RAF, listeners

    ---

    ## Regras de Documentação

    - Toda mudança de código → atualizar wiki + `log.md`
    - Conceitos matemáticos/físicos devem ser explicados intuitivamente
    - Receitas de configuração devem incluir casos de uso
    - Links entre páginas wiki devem funcionar

---

### Passo 6: Initial Ingest (Análise Inicial do Projeto)

**Tarefa:** Após criar toda a estrutura, executar análise inicial do projeto.

**Ações:**

1. **Ler diretórios de código** em `{source_dirs}`:
   - `src/engine/` — núcleo do motor de física
   - `src/react/` — hooks React
   - `src/adapters/` — utilitários DOM
   - `src/device-motion/` — captura de giroscópio

2. **Criar páginas wiki iniciais**:

   | Página | Conteúdo |
   |--------|----------|
   | `Architecture.md` | Visão geral dos módulos, dependências, fluxo de dados |
   | `PhysicsConcepts.md` | Halton, smoothNoise, Euler integration, damping, repulsão, colisões |
   | `ConfigurationRecipes.md` | Tabelas de configuração para diferentes efeitos visuais |
   | `Components.md` | Descrição de cada função/módulo com links para código |
   | `CodePatterns.md` | Convenções TypeScript, naming, tratamento de erros |
   | `IntegrationGuide.md` | Exemplos de integração com React, Vue, Svelte, Vanilla |

3. **Atualizar `index.md`** — adicionar links para todas as páginas criadas

4. **Adicionar entrada em `log.md`**:

   ```markdown
   ## [YYYY-MM-DD] ingest | Initial Project Analysis

   **Tipo:** ingest
   **Autor:** AI agent

   ### Descrição

   Análise inicial do código-fonte do Hadron e criação das páginas wiki fundamentais.

   ### Páginas Criadas

   - `Architecture.md` — arquitetura do sistema
   - `PhysicsConcepts.md` — conceitos físicos e matemáticos
   - `ConfigurationRecipes.md` — receitas de configuração
   - `Components.md` — descrição de componentes
   - `CodePatterns.md` — padrões de código
   - `IntegrationGuide.md` — guias de integração

   ### Fontes Analisadas

   - `src/engine/tick-particles.ts`
   - `src/engine/halton.ts`
   - `src/engine/noise.ts`
   - `src/engine/init-particles.ts`
   - `src/react/use-physics-particles.ts`
   - `src/device-motion/singleton.ts`
   - `src/adapters/dom.ts`
   ```

---

### Passo 7: Verificar Instalação

**Tarefa:** Validar que toda a estrutura foi criada corretamente.

**Checklist:**

- [ ] `QWEN.md` existe na raiz com regra wiki-first
- [ ] `docs/wiki/` contém `index.md`, `log.md`, `Wiki Format.md`
- [ ] `.qwen/skills/wiki-workflow/SKILL.md` existe
- [ ] `.qwen/skills/code-contributor/SKILL.md` existe
- [ ] `.qwen/skills/code-architecture/SKILL.md` existe
- [ ] Todas as skills declaram: `wiki > código`
- [ ] Páginas wiki iniciais foram criadas (Architecture, PhysicsConcepts, ConfigurationRecipes, Components, CodePatterns, IntegrationGuide)
- [ ] `index.md` contém links para todas as páginas
- [ ] `log.md` contém entrada sobre initial ingest
- [ ] Nenhuma modificação foi feita no código existente

---

## PRÓXIMOS PASSOS APÓS CONFIGURAÇÃO

Após completar este template:

1. **Testar o sistema**: Pedir ao agente para explicar como o Hadron funciona usando apenas a wiki
2. **Validar conceitos**: Verificar se Halton, noise, e física estão explicados claramente
3. **Testar receitas**: Usar configurações da wiki e verificar se funcionam como esperado
4. **Iterar**: Refinar wiki baseado em feedback

---

## NOTAS ESPECÍFICAS PARA HADRON

### Conceitos Chave a Documentar

1. **Sequência de Halton**: Explicar por que é melhor que `Math.random()` para distribuição inicial
2. **Ruído Suave**: Como `smoothNoise()` cria movimento orgânico sem saltos bruscos
3. **Integração de Euler**: Modelo simplificado de física (posição += velocidade)
4. **Damping Adaptativo**: Por que reduzir amortecimento durante shake
5. **Repulsão O(n²)**: Fórmula de força e limite prático de partículas
6. **Colisão AABB-Círculo**: Detecção e resolução de colisões

### Receitas a Incluir

| Caso de Uso | Configuração |
|------------|--------------|
| Background calmo | damping=0.998, maxSpeed=0.5, noiseStrength=0.008 |
| Demo interativa | damping=0.994, maxSpeed=1.2, noiseStrength=0.012 |
| Alta energia | damping=0.990, maxSpeed=3.0, noiseStrength=0.025 |
| Giroscópio | externalForceRef conectado, damping adaptativo |

### Integração Multi-Framework

Documentar padrões equivalentes para:
- **React**: `usePhysicsParticles`, refs, zero re-renders
- **Vue**: `ref()`, `onMounted`, loop manual
- **Svelte**: `onMount`, stores
- **Vanilla**: `requestAnimationFrame` loop direto

---

## CONCLUSÃO

Este template cria uma base sólida para desenvolvimento guiado por wiki no Hadron. A wiki se torna a fonte única de verdade para:
- Conceitos físicos e matemáticos
- Receitas de configuração
- Padrões de integração
- Guidelines de performance

O agente de IA, seguindo estas instruções, manterá a wiki atualizada automaticamente, economizando tempo de desenvolvimento e garantindo consistência.
