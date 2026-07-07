---
tags: [wiki, format, instructions]
created: 2026-01-03
updated: 2026-01-03
sources: [.qwen/skills/wiki-workflow/SKILL.md]
---

# Wiki Format

Guia de formatos de páginas wiki, links, e logs.

> ⚡ **Nota de Performance:** Páginas relacionadas a algoritmos devem incluir complexidade computacional e recomendações de uso.

---

## Frontmatter

Cada página wiki começa com um frontmatter YAML:

```yaml
---
tags: [categoria, tag]
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [caminho/para/arquivo1, caminho/para/arquivo2]
complexity: O(n) | O(n²) | etc. (se aplicável)
performance_notes: breves notas de performance
---
```

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

```markdown
[[Architecture]] — arquitetura geral do sistema
[[PhysicsConcepts]] — conceitos físicos e matemáticos
[[ConfigurationRecipes]] — receitas de configuração
```

---

## Links para arquivos do projeto

Caminhos relativos a partir da página wiki:

```markdown
[tick-particles.ts](../../src/engine/tick-particles.ts)
[use-physics-particles.ts](../../src/react/use-physics-particles.ts)
```

---

## Citação de Código

Ao referenciar código, especifique o arquivo e contexto:

```typescript
De `halton.ts`:
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

```markdown
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
```

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

```markdown
# Wiki Index

## 📋 Visão Geral

| Categoria | Página | Descrição |
|-----------|--------|-------------|
| overview | [[Página]] | Descrição |
```

**Regras:**
- Agrupar por categorias
- Usar emoji para separação visual
- Toda página deve estar no catálogo
- Breve descrição para cada página
- Incluir seção de performance guidelines
