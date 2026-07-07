# Guia de Contribuição - Hadron

Obrigado por seu interesse em contribuir com o Hadron! Este documento estabelece diretrizes para garantir que o projeto continue crescendo de forma organizada e consistente.

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Contribuir](#como-contribuir)
3. [Padrões de Código](#padrões-de-código)
4. [Processo de Pull Request](#processo-de-pull-request)
5. [Reportando Bugs](#reportando-bugs)
6. [Solicitando Features](#solicitando-features)

---

## Código de Conduta

Este projeto segue um [Código de Conduta](./CODE_OF_CONDUCT.md). Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

---

## Como Contribuir

### 1. Fork e Clone

```bash
# Faça fork do repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU_USUARIO/physaac.git
cd physaac

# Adicione o upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/physaac.git
```

### 2. Crie uma Branch

```bash
# Sempre crie branches a partir da main atualizada
git checkout main
git pull upstream main

# Crie branch para sua feature/fix
git checkout -b feature/minha-nova-feature
# ou
git checkout -b fix/correcao-importante
```

### 3. Desenvolva

- Siga os [Padrões de Código](#padrões-de-código)
- Escreva testes quando aplicável
- Documente mudanças na API

### 4. Teste

```bash
# Instale dependências
npm install

# Rode testes
npm test

# Build
npm run build
```

### 5. Commit

```bash
# Mensagens de commit claras e descritivas
git commit -m "feat: adiciona suporte a obstáculos circulares"
git commit -m "fix: corrige cálculo de repulsão em bordas"
git commit -m "docs: atualiza exemplos de uso no README"
```

**Formato de mensagens:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, sem mudança de lógica
- `refactor:` - Refatoração, sem mudança de comportamento
- `test:` - Adição ou correção de testes
- `chore:` - Configuração, build, ferramentas

---

## Padrões de Código

### TypeScript

- Use tipos explícitos em funções públicas
- Interfaces para tipos complexos
- Evite `any`, use `unknown` quando necessário
- Nullish coalescing (`??`) para valores padrão

```typescript
// ✅ CORRETO
export function tickParticles(
  particles: Particle[],
  options: PhysicsOptions = {}
): void {
  const damping = options.damping ?? DEFAULT_DAMPING;
}

// ❌ EVITAR
export function tickParticles(particles: any, options: any): any {
  // ...
}
```

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Funções/Variáveis | camelCase | `tickParticles`, `containerWidth` |
| Types/Interfaces | PascalCase | `Particle`, `PhysicsOptions` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_COLLISION_RADIUS` |
| Arquivos | kebab-case | `tick-particles.ts` |

### Estrutura de Arquivos

```typescript
// 1. Imports
import { Particle } from './particle';
import type { PhysicsOptions } from './options';

// 2. Constantes
const DEFAULT_VALUE = 42;

// 3. Types/Interfaces
export interface MyInterface {
  // ...
}

// 4. Funções principais
export function mainFunction() {
  // ...
}

// 5. Funções auxiliares
function helperFunction() {
  // ...
}
```

### Performance

- Zero re-renders no React (atualize DOM diretamente via refs)
- Evite alocações no hot path (loops de animação)
- Use `Math.sqrt` apenas quando necessário
- Cleanup de RAF listeners e event listeners

```typescript
// ✅ CORRETO: zero re-render
particleRefs.current[i].style.left = `${x}px`;

// ❌ ERRADO: causa re-render
setParticles([...particles]);
```

---

## Processo de Pull Request

### 1. Antes de Submeter

- [ ] Código segue padrões do projeto
- [ ] Testes passam (`npm test`)
- [ ] Build funciona (`npm run build`)
- [ ] Documentação atualizada (se aplicável)
- [ ] Mensagens de commit claras

### 2. Abra o PR

- Título descritivo
- Descrição detalhada das mudanças
- Link para issues relacionadas (se houver)
- Screenshots/vídeos para mudanças visuais

### 3. Template de PR

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação
- [ ] Performance
- [ ] Refatoração

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Build passa sem erros
- [ ] Documentação atualizada
- [ ] Segue padrões de código do projeto

## Issues Relacionadas
Fixes #123
```

### 4. Review

- Mantenedores revisarão seu código
- Feedback deve ser incorporado
- Aprovação necessária para merge

---

## Reportando Bugs

### Onde Reportar

Abra uma issue no GitHub com a label `bug`.

### Template de Bug Report

```markdown
## Descrição
Descrição clara do bug.

## Passos para Reproduzir
1. Passo 1
2. Passo 2
3. Comportamento observado

## Comportamento Esperado
O que deveria acontecer.

## Ambiente
- OS: [ex: macOS 14.0]
- Browser: [ex: Chrome 120]
- Versão do Hadron: [ex: 1.0.0]

## Código de Exemplo
```typescript
// Código mínimo que reproduz o bug
```

## Screenshots/Vídeos
Se aplicável.

## Contexto Adicional
Qualquer outra informação relevante.
```

---

## Solicitando Features

### Onde Solicitar

Abra uma issue no GitHub com a label `enhancement`.

### Template de Feature Request

```markdown
## Problema Relacionado
Existe um problema que esta feature resolveria? Descreva.

## Solução Proposta
Descrição clara do que você quer que aconteça.

## Alternativas Consideradas
Outras soluções que você pensou.

## Casos de Uso
Como esta feature seria usada?

## Exemplos de Código
```typescript
// Como a API ficaria
usePhysicsParticles(50, containerRef, particleRefs, {
  novaFeature: true,
});
```

## Contexto Adicional
Qualquer outra informação relevante.
```

---

## 📚 Recursos

- [Documentação Completa](./Docs/README.md)
- [Wiki Técnica](./docs/wiki/index.md)
- [Arquitetura do Projeto](./docs/wiki/Architecture.md)
- [Padrões de Código](./docs/wiki/CodePatterns.md)

---

## 💬 Dúvidas?

Abra uma discussão no GitHub ou entre em contato com os mantenedores.

---

Obrigado por contribuir com o Hadron! 🎉
