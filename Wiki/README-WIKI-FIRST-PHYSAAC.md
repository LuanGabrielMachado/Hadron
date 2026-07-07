# Assistentes de IA — Abordagem Wiki-First para Hadron

Em projetos de código aberto e bibliotecas JavaScript/TypeScript, a documentação precisa ser clara, concisa e facilmente acessível tanto para humanos quanto para agentes de IA. A abordagem **wiki-first** resolve o problema de conhecimento fragmentado transformando a documentação em um centro de conhecimento vivo que orienta como desenvolvedores e IAs operam.

> 📌 **Nota:** Todos os exemplos estruturais, nomes de arquivos (`QWEN.md`, `.qwen/skills/`), e workflows neste artigo são fornecidos para o ecossistema **QWEN**. A metodologia é universal e pode ser adaptada para qualquer agente de IA capaz de trabalhar com instruções em Markdown.

> ⚡ **Foco do Hadron:** Diferente de sistemas de segurança crítica, o Hadron é um motor de física leve para animações web. A wiki prioriza **clareza de conceitos matemáticos**, **receitas de configuração**, e **exemplos práticos** em vez de protocolos de segurança.

---

## 🔍 O Que É Wiki-First?

**Wiki-first** é uma metodologia onde, antes de qualquer trabalho com o código (escrever features, revisar, refatorar, tomar decisões arquiteturais), o desenvolvedor ou agente de IA **deve** primeiro estudar a documentação wiki do projeto (`docs/wiki/`).

Princípio chave:
> `Wiki = visão geral + conceitos + receitas, Código = detalhes de implementação`

A wiki armazena conhecimento condensado e estruturado: arquitetura do sistema, conceitos físicos e matemáticos, padrões aceitos, receitas de configuração para diferentes efeitos visuais, e convenções de nomenclatura. Assinaturas específicas de funções, implementações de algoritmos, ou asserções de teste são consultadas diretamente no código se a wiki não cobrir o detalhe.

### Por Que Wiki-First é Crítico para Hadron?

| Aspecto | Sem Wiki-First | Com Wiki-First |
|---------|---------------|----------------|
| **Entendimento de Conceitos** | Desenvolvedores precisam ler código para entender Halton, noise, damping | Wiki explica matemática de forma acessível em 10 minutos |
| **Configuração de Efeitos** | Tentativa e erro para ajustar parâmetros | Wiki fornece receitas prontas para diferentes casos de uso |
| **Integração Multi-Framework** | Cada consumidor reinventa a roda | Wiki documenta padrões para React, Vue, Svelte, Vanilla |
| **Onboarding** | Novos levam horas decifrando física | Wiki resume conceitos fundamentais rapidamente |
| **Consistência de API** | Mudanças quebram contratos sem aviso | Wiki define contratos claros e versionamento |
| **Extensibilidade** | Difícil saber onde adicionar features | Wiki mapeia arquitetura e pontos de extensão |

---

## 🚀 Benefícios da Abordagem

| Aspecto | Sem Wiki-First | Com Wiki-First |
|--------|----------------|--------------|
| **Onboarding do Projeto** | Todos aprendem o código do zero | Visão geral pronta em 5 minutos |
| **Armazenamento de Conhecimento** | Conhecimento fica na cabeça dos devs | Conhecimento centralizado na wiki, acessível a todos |
| **Onboarding** | Novatos passam dias decifrando código | Novatos leem wiki → entendem conceitos em horas |
| **Fluxo de Agente de IA** | Desperdiça contexto escaneando milhares de linhas | Lê páginas wiki concisas, economizando tokens e tempo |
| **Atualidade da Documentação** | Wiki fica desatualizada, rapidamente obsoleta | Wiki é atualizada automaticamente após cada mudança |
| **Receitas de Configuração** | Parâmetros descobertos por tentativa e erro | Catálogo de configurações para diferentes efeitos |
| **Clareza Conceitual** | Matemática escondida no código | Explicações de Halton, noise, Euler integration na wiki |

---

## 🛠 Como Configurar Wiki-First no Projeto Hadron

Para configuração rápida e correta, use o template [`WIKI_FIRST_TEMPLATE_HADRON.md`](WIKI_FIRST_TEMPLATE_HADRON.md). Ele foi projetado **para execução por um agente de IA**, que criará automaticamente toda a infraestrutura de conhecimento e skills.

### Passo 1: Preparar Parâmetros

O template já está pré-configurado com os parâmetros do Hadron:

| Parâmetro | Valor |
|----------|-------|
| `project_name` | `Hadron` |
| `project_description` | `Motor de física newtoniana para partículas em interfaces web — com thermal noise, giroscópio e zero re-renders` |
| `tech_stack` | `TypeScript, JavaScript, React Hooks, DOM API, DeviceMotion API, requestAnimationFrame` |
| `docs_path` | `Docs/` |
| `wiki_path` | `docs/wiki/` |
| `skills_path` | `.qwen/skills/` |
| `source_dirs` | `src/` |

### Passo 2: Lançar o Agente de IA

Passe o arquivo preenchido para seu assistente de IA com o seguinte prompt:

> "Execute as instruções do `WIKI_FIRST_TEMPLATE_HADRON.md` estritamente passo a passo. Crie a estrutura wiki, skills de IA, e o arquivo de regras principais. Não modifique o código existente do projeto. Após criar a estrutura, execute o Initial Ingest (Passo 6)."

O agente irá automaticamente:

1. Criar o diretório `docs/wiki/` e três arquivos base:
   - `index.md` — catálogo de todas as páginas wiki
   - `log.md` — log de mudanças (append-only)
   - `Wiki Format.md` — guia de formatação de páginas

2. Gerar três skills especializados de IA em `.qwen/skills/`:
   - `wiki-workflow` — gerenciamento de conhecimento (ingest, query, lint, post-change lint)
   - `code-contributor` — escrita e modificação de código conforme padrões
   - `code-architecture` — revisão arquitetural (performance, API design, multi-framework)

3. Criar `QWEN.md` na raiz do projeto com regra wiki-first estrita e hierarquia de fontes: `docs/wiki/ > Código do projeto`.

### Passo 3: Análise Inicial do Projeto (Initial Ingest)

Após criar a estrutura, o agente executará o **Passo 6** do template:

- Escaneia os diretórios de código-fonte (`source_dirs`)
- Gera páginas wiki iniciais: `Architecture.md`, `Components.md`, `PhysicsConcepts.md`, `ConfigurationRecipes.md`, `CodePatterns.md`, `IntegrationGuide.md`
- Atualiza `index.md`, adicionando novas páginas ao catálogo
- Adiciona entrada em `log.md` sobre o carregamento inicial de conhecimento
- ⚠️ **Importante:** A wiki contém apenas visões gerais, conceitos e links relativos para arquivos. Copiar trechos longos de código é **desnecessário** — use links para arquivos fonte.

### Passo 4: Verificar Instalação

Após o agente terminar, verifique o resultado usando o checklist:

- [ ] `QWEN.md` contém a regra wiki-first e prioridade de fontes
- [ ] `docs/wiki/` contém `index.md`, `log.md`, `Wiki Format.md`
- [ ] `.qwen/skills/` contém 3 arquivos `SKILL.md` (`wiki-workflow`, `code-contributor`, `code-architecture`)
- [ ] Todas as skills declaram explicitamente: `wiki > código`
- [ ] Páginas wiki base para arquitetura, componentes, conceitos físicos e receitas foram geradas
- [ ] `index.md` contém links para todas as páginas criadas
- [ ] `log.md` contém entrada sobre o primeiro ingest com data e descrição

---

## 🔄 Como Trabalhar com Wiki-First Após Configuração

| Papel | Regra |
|------|---------|
| **Desenvolvedor** | Antes de tarefa → abrir `docs/wiki/index.md`. Após commit → atualizar wiki + adicionar entrada em `log.md`. |
| **Agente de IA** | Qualquer requisição → wiki primeiro. Após mudanças de código → post-change lint. Detalhes faltantes → ler código. |
| **Revisão de Código** | Se PR não atualizou wiki → solicitar mudanças. Wiki não pode divergir do código. |
| **Manutenção de API** | Toda mudança de API → atualizar `ConfigurationRecipes.md` e `IntegrationGuide.md`. |

Fluxo de trabalho típico de agente de IA:

1. `Wiki-first` → lê `index.md` → encontra páginas relevantes
2. `Query/Ingest` → esclarece detalhes no código se necessário
3. `Code` → escreve feature/fix conforme padrões wiki
4. `Post-Change Lint` → atualiza wiki e `log.md`
5. `Verify` → verifica links, frontmatter, alinhamento com código

---

## 🎯 Conteúdo Específico para Hadron

### Conceitos que Devem Estar na Wiki

A wiki do Hadron deve explicar claramente:

1. **Sequência de Halton**: Por que usar distribuição quasi-aleatória em vez de `Math.random()`
2. **Ruído Suave Determinístico**: Como `smoothNoise()` cria movimento orgânico
3. **Integração de Euler**: Modelo físico simplificado para atualização de posições
4. **Damping Adaptativo**: Como e por que o amortecimento muda durante shake
5. **Repulsão entre Partículas**: Fórmula de força e complexidade O(n²)
6. **Colisão AABB-Círculo**: Detecção e resolução de colisões com obstáculos
7. **Thermal Noise**: Manter partículas em movimento mesmo quando "paradas"

### Receitas de Configuração

A wiki deve incluir um catálogo de configurações prontas:

| Caso de Uso | collisionRadius | repulsionStrength | maxSpeed | damping | minSpeed | noiseStrength |
|------------|-----------------|-------------------|----------|---------|----------|---------------|
| Background calmo | 14 | 0.8 | 0.5 | 0.998 | 0.05 | 0.008 |
| Demo interativa | 14 | 1.4 | 1.2 | 0.994 | 0.08 | 0.012 |
| Alta energia | 12 | 2.5 | 3.0 | 0.990 | 0.15 | 0.025 |
| Simulação orbital | 8 | 0.5 | 2.0 | 0.999 | 0.02 | 0.005 |
| Fluido denso | 10 | 3.0 | 0.8 | 0.992 | 0.10 | 0.015 |

### Integração por Framework

A wiki deve documentar padrões específicos:

- **React**: Uso de `usePhysicsParticles`, refs, zero re-renders
- **Vue**: Padrão equivalente com `ref()` e `onMounted`
- **Svelte**: Uso de `onMount` e stores
- **Vanilla JS**: Loop `requestAnimationFrame` manual

---

## 🔄 Ciclo de Vida da Wiki: Manutenção, Consistência e Evolução de Skills

Configurar wiki-first não é uma configuração única, mas o lançamento de um processo vivo. Documentação deixada sem atenção rapidamente torna-se um "cemitério de conhecimento". Para garantir que a abordagem entregue valor a longo prazo, a wiki deve ser continuamente atualizada, e o agente de IA deve atuar como o principal guardião de sua consistência e completude.

### 🤖 Agente como Guardião da Integridade

Após a configuração inicial, a responsabilidade pela atualidade da wiki recai sobre o agente de IA. A cada mudança de código, o agente deve automaticamente executar um **post-change lint**: verificar se páginas existentes contradizem a nova implementação, atualizar descrições de componentes afetados, e registrar mudanças em `log.md`.

Exija confirmação explícita de sincronização do agente. Se um commit afeta arquitetura, configuração, ou adiciona novos módulos, o agente não deve apenas corrigir o código, mas também atualizar a wiki. Isso transforma a documentação de um "fardo extra" para uma parte integral do ciclo de desenvolvimento. Sem este passo, a wiki rapidamente divergirá do código, e a regra `wiki > código` perderá o significado.

### 📖 Documentando Cenários Complexos

O verdadeiro poder do wiki-first emerge quando não apenas descrições estáticas, mas também **workflows específicos do projeto** são adicionados à base de conhecimento.

Por exemplo, adicionar um novo parâmetro de configuração no Hadron pode exigir mudanças em múltiplos lugares: `options.ts`, `tick-particles.ts`, `initializeParticles.ts`, hooks React, e documentação. Em vez de explicar isso ao agente do zero toda vez, documente este cenário uma vez como uma página wiki separada ou uma seção em `CodePatterns.md`.

Uma vez que um cenário complexo é documentado na wiki, o agente começa a executá-lo **com confiança, sem alucinações ou passos perdidos**. Quando perguntado "Adicionar parâmetro X", o agente:

1. Encontra a instrução na wiki via `index.md`
2. Segue estritamente a sequência descrita de mudanças
3. Automaticamente atualiza a wiki se o cenário precisar de adaptação a novas realidades

Quanto mais cenários "rotineiros" e "facilmente esquecidos" você formalizar na wiki, menos tempo é gasto em microgerenciamento do agente, e maior a estabilidade dos resultados.

### 🧠 Natureza Específica de Modelos para Wiki

Diferentes modelos LLM estruturam pensamentos, escolhem prioridades e formulam instruções de maneira diferente. Isso **não é um bug, mas uma feature**. Quando um agente gera ou curadoria a wiki durante análise inicial (`Initial Ingest`) ou atualizações subsequentes, a documentação naturalmente "se adapta" à sua lógica interna, tokenização e padrões de atenção.

Um modelo seguirá uma wiki que ele mesmo gerou ou curou muito mais precisamente e com confiança do que documentação escrita por outro modelo ou humano "para si mesmo". Portanto, não busque estilística "humana" perfeita nos estágios iniciais. O principal é que a estrutura seja inequívoca, links funcionem, e a lógica de atualização seja mantida. Com o tempo, você notará que a wiki se torna a "língua nativa" de seu agente: ele encontra contexto mais rápido, alucina menos, e executa tarefas complexas com mais precisão.

### 🛠 Evolução de Skills e Regras

As `skills` criadas durante a configuração não estão definidas de forma imutável. À medida que o projeto cresce e a experiência com o agente acumula, elas devem ser adaptadas:

- Se o agente frequentemente perde um certo tipo de verificação, adicione a regra correspondente a `code-architecture` ou `wiki-workflow`.
- Se novas stacks tecnológicas ou padrões emergirem, expanda `code-contributor` com exemplos e convenções.
- Se a estrutura wiki tornar-se muito volumosa, refatore `index.md`, introduza tags, ou divida páginas monolíticas em blocos temáticos.

Os próprios arquivos `QWEN.md` e `SKILL.md` fazem parte do ecossistema wiki. Eles podem e devem ser refactorados para manter instruções precisas, minimizar consumo de contexto, e corresponder ao estágio atual de maturidade do projeto.

### 💡 Princípio Central: Wiki é um Organismo Vivo

A ideia chave da abordagem é esta: **você não pode apenas criar uma wiki, você deve continuamente desenvolvê-la**.

- **Manter atualidade:** toda mudança de código → mudança wiki + entrada em `log.md`.
- **Enriquecer contexto:** transformar acordos verbais, trackers de bugs, e procedimentos manuais complexos em instruções wiki formalizadas.
- **Evoluir o agente:** adaptar skills, esclarecer prioridades, e refinar prompts para tarefas reais do projeto.

Quando a wiki torna-se a fonte única de verdade, e o agente atua como seu curador ativo, a equipe obtém um sistema de conhecimento escalável. Ele não "murcha" com o tempo, mas ganha força: quanto mais você investe nele, mais rápido, preciso e confiante a IA trabalha, reduzindo tempo gasto em onboarding, revisões de código, e correção de bugs.

---

## 📋 Estrutura de Diretórios Proposta para Hadron

```
/workspace/
├── QWEN.md                          # Regras principais (wiki-first)
├── .qwen/
│   └── skills/
│       ├── wiki-workflow/
│       │   └── SKILL.md             # Skill de gerenciamento wiki
│       ├── code-contributor/
│       │   └── SKILL.md             # Skill de escrita de código
│       └── code-architecture/
│           └── SKILL.md             # Skill de revisão arquitetural
├── Docs/                            # Documentação histórica (manter como referência)
│   ├── 01-introducao.md
│   ├── 02-conceitos-fundamentais.md
│   ├── ...
│   └── 08-modificacao-extensao.md
└── docs/
    └── wiki/                        # Wiki ativa (fonte única de verdade)
        ├── index.md                 # Catálogo de páginas
        ├── log.md                   # Log de mudanças (append-only)
        ├── Wiki Format.md           # Guia de formatação
        ├── Architecture.md          # Arquitetura do Hadron
        ├── PhysicsConcepts.md       # Halton, noise, Euler, damping, repulsão
        ├── ConfigurationRecipes.md  # Receitas para diferentes efeitos visuais
        ├── Components.md            # Descrição de componentes (engine, react, adapters)
        ├── CodePatterns.md          # Padrões TypeScript, convenções
        └── IntegrationGuide.md      # Integração com React, Vue, Svelte, Vanilla
```

---

## 🎯 Próximos Passos Imediatos

### Fase 1: Fundação (1-2 dias)

1. **Executar template** `WIKI_FIRST_TEMPLATE_HADRON.md` com parâmetros do Hadron
2. **Criar estrutura básica**:
   - `docs/wiki/` com `index.md`, `log.md`, `Wiki Format.md`
   - 3 skills em `.qwen/skills/`: `wiki-workflow`, `code-contributor`, `code-architecture`
   - `QWEN.md` na raiz com regras wiki-first
3. **Configurar skills** com foco em:
   - Performance (O(n²) de repulsão, otimizações)
   - API design (contratos estáveis, versionamento)
   - Multi-framework (React, Vue, Svelte, Vanilla)

### Fase 2: Migração Inicial (3-5 dias)

1. **Migrar conteúdo crítico** dos 8 documentos atuais para wiki:
   - `02-conceitos-fundamentais.md` → `PhysicsConcepts.md`
   - `03-api-opcoes.md` → `ConfigurationRecipes.md`
   - `01-introducao.md` → `Architecture.md`
   - `06-hooks-react.md` + `07-adapters-utils.md` → `IntegrationGuide.md`
2. **Criar links cruzados** entre páginas wiki
3. **Estabelecer `Docs/`** como referência histórica (não modificar)

### Fase 3: Consolidação (Contínuo)

1. **Habilitar post-change lint automático** em CI/CD
2. **Integrar wiki update** no fluxo de PR (obrigatório antes de merge)
3. **Realizar auditoria trimestral** de clareza conceitual e completude
4. **Evoluir skills** baseado em feedback de uso real

---

## 📊 Métricas de Sucesso Esperadas

| Métrica | Antes | Depois (Estimado) |
|---------|-------|-------------------|
| **Tempo de Onboarding** | 1-2 dias | 2-3 horas |
| **Tokens de Contexto (IA)** | ~10.000 por tarefa | ~2.000 por tarefa |
| **Erros de Configuração** | Comuns (tentativa e erro) | Raros (receitas prontas) |
| **Consistência de API** | Varia entre contribuidores | 100% conforme wiki |
| **Atualidade da Documentação** | Desatualizada em semanas | Sempre sincronizada |
| **Confiança em Alterações** | Moderada (requer testes extensivos) | Alta (wiki garante padrões) |

---

## ⚠️ Considerações Especiais para Hadron

### Performance Não É Negociável

Hadron é uma biblioteca de animação — **performance é a feature principal**. A wiki deve documentar:

- **Complexidade algorítmica**: O(n²) para repulsão, limites práticos (<100 partículas para DOM)
- **Otimizações**: Spatial hashing, Web Workers, Canvas fallback
- **Budget de frame**: Manter 60 FPS (16ms por frame)
- **Memory leaks**: Limpeza adequada de RAF listeners, refs

### Clareza Conceitual É Essencial

Diferente de sistemas empresariais, Hadron envolve matemática e física que podem ser intimidantes. A wiki deve:

- **Explicar intuitivamente**: Halton como "aleatório uniforme", noise como "movimento orgânico"
- **Fornecer visualizações**: Diagramas de colisão, gráficos de damping
- **Oferecer analogias**: Thermal noise como "movimento browniano", repulsão como "carga elétrica"
- **Linkar para código**: Mostrar implementação após explicar conceito

### Multi-Framework Requer Padronização

Hadron funciona com React, Vue, Svelte e Vanilla JS. A wiki deve:

- **Documentar padrões por framework**: Como gerenciar refs, lifecycle, estado
- **Manter API consistente**: Mesmos parâmetros, mesmos comportamentos
- **Evitar vazamento de abstração**: React hook não deve vazar detalhes de implementação

---

## 💡 Conclusão

A abordagem wiki-first transforma documentação de um "artefato que é esquecido" para uma **ferramenta ativa de desenvolvimento**. Agentes de IA operando sob essas regras economizam contexto, aderem estritamente a padrões arquiteturais e de performance, e aceleram a entrega de features.

Configure wiki-first uma vez usando [`WIKI_FIRST_TEMPLATE_HADRON.md`](WIKI_FIRST_TEMPLATE_HADRON.md), integre-o em seus processos de CI/CD e onboarding, e você obterá um sistema de conhecimento escalável que cresce com seu projeto em vez de se tornar legado.

> ⚡ **Lembrete Final:** Em animações web, **documentação desatualizada causa bugs de performance e UX**. Mantenha a wiki viva, valide contra o código real, e nunca pule a etapa de post-change lint.

---

## 📚 Referências

1. **Sequência de Halton** - Distribuição quasi-aleatória de baixa discrepância
2. **Integração de Euler** - Método numérico para equações diferenciais ordinárias
3. **Brownian Motion** - Movimento aleatório de partículas em fluido
4. **DeviceMotion API** - W3C Specification for motion sensors
5. **React Hooks** - Documentation for useEffect, useRef, useCallback
6. **RequestAnimationFrame** - MDN Web Docs for smooth animations
7. **Original Hadron Documentation** - Documentos em `Docs/` (2026)
