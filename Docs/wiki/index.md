# Wiki Index

Catálogo de todas as páginas wiki para projeto Hadron.

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
