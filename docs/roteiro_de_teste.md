## Registro das correções

Problemas encontrados durante o desenvolvimento e o teste, com o caso do roteiro a que
cada um se liga. Um caso só passa a `corrigido` na tabela depois de ser executado de novo
no aparelho; "Origem" diz como o problema foi encontrado.

### 1. Variáveis do Supabase não eram lidas (C01)
- **Origem:** log do Expo, `Configure a URL e a chave publicável do Supabase no .env.local`.
- **Observado:** o aplicativo abria sem URL nem chave, e as listas de produtos e movimentações não carregavam.
- **Causa:** o `.env.local` usava nomes `NEXT_PUBLIC_*`; o Expo só lê variáveis com o prefixo `EXPO_PUBLIC_*`.
- **Correção:** renomear para `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e reiniciar com `npx expo start -c`.
- **Data:** (preencher) | **Commit:** (não se aplica, o `.env.local` não vai para o Git)

### 2. Cadastro recusado apagava o que a pessoa digitou (C04, C05)
- **Origem:** revisão do código.
- **Observado (no código):** a tela de cadastro capturava o erro e não o repassava ao formulário, que então limpava os campos como se tivesse dado certo.
- **Correção:** a tela de cadastro deixou de capturar o erro; ele sobe para o formulário, que mostra a mensagem e mantém os campos.
- **Data:** (preencher) | **Commit:** (preencher)

### 3. Movimentações sem permissão no Supabase (C06)
- **Origem:** revisão do script SQL das movimentações.
- **Observado (no script):** a tabela `movimentacoes` não tinha as permissões (`grant`) nem as políticas `to anon`, então a leitura e o registro seriam recusados pela chave publicável.
- **Correção:** políticas de leitura e inclusão `to anon`, `grant select, insert` e permissão nas sequências; versionado em `supabase/esquema.sql`.
- **Data:** (preencher) | **Commit:** (preencher)

### 4. Erro de transação no cache do SQLite (C01, C08, C14)
- **Origem:** log do Expo no celular.
- **Observado:** `ErroDoBanco ... cannot start a transaction within a transaction` e `cannot rollback - no transaction is active`, nas linhas `[cache de produtos]` e `[cache de movimentações]`, na abertura do aplicativo.
- **Causa:** as listas de produtos e de movimentações gravam o cache ao mesmo tempo na mesma conexão do SQLite, e as duas transações se atropelam.
- **Correção:** as operações do banco local passaram a entrar numa fila, uma de cada vez (`noBanco` em `src/banco/bancoLocal.ts`).
- **Data:** 27/10/2026 | **Commit:** (preencher)
- **Para marcar `corrigido`:** repetir C01 e C14 e conferir que as linhas de erro não aparecem mais no terminal.

### 5. Código de barras aceitava qualquer valor (C17, C03)
- **Origem:** observado no uso do aplicativo: um código de apenas dois números foi aceito.
- **Causa:** só se exigia que o campo não estivesse vazio.
- **Correção:** validação em `validarDadosNovoProduto`: só números, de 8 a 14 dígitos (`src/servicos/produto.ts`). Vale para cadastros novos, online e offline.
- **Data:** 27/10/2026 | **Commit:** (preencher)
- **Para marcar `corrigido`:** executar C17 e conferir que `12` é recusado e `7891000100103` é aceito.

### 6. Nomes de arquivo com maiúscula diferente do import (conferência final)
- **Origem:** `npx tsc --noEmit`, erro `TS1261` (casing).
- **Observado:** `estadotela.ts` e `Movimentacao.ts` eram importados como `estadoTela` e `movimentacao`. No Windows funciona, mas o `tsc` reclama e o build do APK no Linux (EAS) falharia.
- **Correção:** renomear com `git mv` em duas etapas: `estadoTela.ts` e `movimentacao.ts`.
- **Data:** (preencher) | **Commit:** (preencher)

### 7. Pasta `api/` (servidor Express) dentro do aplicativo (conferência final)
- **Origem:** `npx tsc --noEmit`, 15 erros vindos de `api/`.
- **Correção:** pasta removida do projeto e `tsconfig.json` com `exclude` para `api` e `node_modules`.
- **Data:** (preencher) | **Commit:** (preencher)

### Ambiente (não são casos do roteiro)
- **Web:** o aplicativo é para celular. Na Web o `expo-sqlite` não funciona (`Unable to resolve "./wa-sqlite/wa-sqlite.wasm"`), e o teste deve ser feito no Expo Go.
- **Conexão do Expo Go:** o erro `Failed to download remote update` no celular era a ligação com o computador. Resolvido com o cabo USB: `adb reverse tcp:8081 tcp:8081`, variável `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1` e URL `exp://127.0.0.1:8081` no Expo Go. Observado em 27/10/2026.