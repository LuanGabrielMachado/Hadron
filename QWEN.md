# QWEN.md — Regras do Projeto Hadron

## 🎯 Regra Wiki-First (OBRIGATÓRIO)

**Para QUALQUER tarefa neste projeto:**

1. **PRIMEIRO** ler `docs/wiki/index.md`
2. **ENCONTRAR** páginas wiki relevantes para a tarefa
3. **ESTUDAR** conteúdo das páginas wiki
4. **SÓ ENTÃO** proceder com a implementação

### Hierarquia de Fontes

| Prioridade | Fonte | Uso |
|------------|-------|-----|
| 1 (Mais Alta) | `docs/wiki/` | Visão geral, conceitos, padrões, receitas |
| 2 (Secundária) | Código do projeto | Detalhes de implementação, assinaturas |

**Regra de Ouro:** Se wiki e código divergirem, wiki reflete o estado atual. Atualize wiki se necessário.

---

## 📚 Estrutura de Conhecimento

### Wiki (`docs/wiki/`)

| Arquivo | Propósito |
|---------|-----------|
| `index.md` | Catálogo de todas as páginas wiki |
| `log.md` | Log cronológico de mudanças (append-only) |
| `Wiki Format.md` | Guia de formatação de páginas |
| `Architecture.md` | Arquitetura do sistema |
| `PhysicsConcepts.md` | Conceitos físicos e matemáticos |
| `ConfigurationRecipes.md` | Receitas de configuração |
| `Components.md` | Descrição de componentes |
| `CodePatterns.md` | Padrões TypeScript e convenções |
| `IntegrationGuide.md` | Integração com frameworks |

### Skills (`.qwen/skills/`)

| Skill | Responsabilidade |
|-------|------------------|
| `wiki-workflow` | Gerenciamento de conhecimento wiki |
| `code-contributor` | Escrita de código conforme padrões |
| `code-architecture` | Revisão arquitetural e performance |

---

## 🔄 Fluxo de Trabalho

### Nova Tarefa

```
1. Abrir docs/wiki/index.md
2. Identificar páginas relevantes
3. Ler páginas wiki
4. Se necessário, ler código para detalhes
5. Implementar seguindo padrões wiki
6. Executar Post-Change Lint (atualizar wiki se mudou algo)
7. Adicionar entrada em docs/wiki/log.md
```

### Após Mudança de Código

```
1. Identificar páginas wiki afetadas
2. Comparar wiki com código atual
3. Atualizar wiki se desatualizado
4. Adicionar entrada em log.md
```

---

## ⚡ Performance Guidelines

| Métrica | Target |
|---------|--------|
| Frame Budget | 16ms (60 FPS) |
| Partículas (DOM) | <100 |
| Complexidade Repulsão | O(n²) até ~100 partículas |
| Memory Leaks | Zero |

---

## 📋 Checklist Pré-Commit

- [ ] Consultei wiki antes de codificar
- [ ] Segui padrões do CodePatterns.md
- [ ] Performance dentro do target (60 FPS)
- [ ] Zero re-renders (se React)
- [ ] RAF listeners com cleanup
- [ ] Wiki atualizada (se aplicável)
- [ ] Entrada adicionada em log.md (se aplicável)

---

## 🚫 Proibições

- NÃO trabalhar sem consultar wiki primeiro
- NÃO copiar trechos longos de código para wiki (use links)
- NÃO limpar `log.md` (append-only)
- NÃO renomear páginas wiki sem atualizar todos os links
- NÃO causar re-renders desnecessários no React
- NÃO alocar objetos no hot path (loop de animação)

---

## 📄 Links

- [[docs/wiki/index.md]] — Catálogo wiki
- [[docs/wiki/log.md]] — Log de mudanças
- [[.qwen/skills/wiki-workflow/SKILL.md]] — Skill de gerenciamento wiki
- [[.qwen/skills/code-contributor/SKILL.md]] — Skill de escrita de código
- [[.qwen/skills/code-architecture/SKILL.md]] — Skill de revisão arquitetural
