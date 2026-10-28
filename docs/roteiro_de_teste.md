# Roteiro de teste - Estok

Cada caso tem os passos, o resultado esperado e o resultado observado. A coluna
"Onde e quando" diz em que aparelho e em que data o caso foi executado. Um caso com
falha ganha a correção e é executado de novo; a linha registra as duas execuções.

Legenda do resultado: **aprovado** (o observado é o esperado), **falha** (não é),
**corrigido** (falhou, foi corrigido e aprovado na repetição), **não executado**.

## Ambiente

- Aparelho:
- Versão do Android:
- Forma de execução (Expo Go ou APK):
- Versão do aplicativo: 1.0.0
- Casos sem rede: Wi-Fi e dados móveis do celular desligados (o cabo USB mantém a ligação com o Expo, mas não dá rede ao aplicativo)

## Casos

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C01 | Carga com rede | Abrir o aplicativo com internet | Aba Início com o resumo (produtos cadastrados, ativos, aguardando sincronização); aba Produtos com a lista da nuvem, sem aviso de offline | não executado | - | - |
| C02 | Navegação em pilha | Produtos; "Ver detalhes" em um produto; voltar | Tela de detalhes com nome, código, preço, categoria, situação e estoque atual; ao voltar, a lista | não executado | - | - |
| C03 | Cadastro válido com rede | Cadastro; nome `Produto teste`, código `7891000100103`, preço `10,50` e categoria `1`; Adicionar | Alerta `Cadastro realizado`; o produto aparece na lista e na tabela `produtos` do Supabase | não executado | - | - |
| C04 | Cadastro inválido | Cadastro; deixar o nome em branco ou o preço `abc`; Adicionar | Mensagem `Preencha todos os campos do produto.` ou `Informe um preço válido.` na tela; os campos continuam preenchidos | não executado | - | - |
| C05 | Cadastro recusado pela nuvem | Trocar uma letra da chave publicável no `.env.local`; reiniciar com `npx expo start -c`; cadastrar um produto válido (código `7891000100103`) | Mensagem `Acesso negado pelo servidor. Verifique a chave e as permissões do projeto.` na tela de cadastro; linha `[cadastro de produto] api: ErroDaApi 401` no terminal; os campos continuam preenchidos. Depois, restaurar a chave | não executado | - | - |
| C06 | Registrar entrada com rede | Movimentações; escolher um produto; tipo Entrada; quantidade `10`; Registrar | Alerta `Movimentação registrada`; item no topo do histórico; estoque atual do produto aumenta 10; linha nova na tabela `movimentacoes` | não executado | - | - |
| C07 | Saída maior que o estoque | Movimentações; escolher um produto; tipo Saída; quantidade maior que o estoque atual | Mensagem `Estoque insuficiente. Saldo atual: N unidades.`; nada é gravado | não executado | - | - |
| C08 | Carga sem rede, com cache | Abrir com rede uma vez; ligar o modo avião; recarregar a lista de produtos | Lista do aparelho; aviso `Sem conexão com a internet` acima dela | não executado | - | - |
| C09 | Carga sem rede, sem cache | Instalação nova (ou Sobre, `Apagar dados do aparelho`); modo avião; abrir Produtos | Tela de erro com `Sem conexão com o servidor. Verifique a rede e tente de novo.` e botão `Tentar novamente` | não executado | - | - |
| C10 | Cadastro sem rede | Modo avião; cadastrar um produto válido (código `7891000100103`) | Alerta `Produto salvo no aparelho`; o produto aparece na lista; Início mostra `Aguardando sincronização: 1` | não executado | - | - |
| C11 | Movimentação sem rede | Modo avião; registrar uma entrada | Alerta `Movimentação salva no aparelho`; o item aparece no histórico com `Aguardando sincronização` | não executado | - | - |
| C12 | Sincronização | Desligar o modo avião; esperar alguns segundos | As marcas `Aguardando sincronização` somem; os dois registros estão no Supabase, cada um uma vez só | não executado | - | - |
| C13 | Dados sobrevivem ao fechamento | Cadastrar sem rede; fechar o aplicativo por completo; abrir de novo (com o APK instalado) | O produto continua na lista e a fila continua com 1 pendência | não executado | - | - |
| C14 | Contagem na tela Sobre | Aba Sobre depois de uma carga com rede | `Produtos guardados: N` e `Movimentações guardadas: M` iguais às listas; `Aguardando envio ao Supabase: 0` | não executado | - | - |
| C15 | Apagar dados do aparelho | Sobre; `Apagar dados do aparelho`; Apagar | Contagens de produtos e movimentações vão a 0 (ou ao que estava pendente); com rede, as listas voltam a carregar da nuvem | não executado | - | - |
| C16 | Chave da nuvem não apaga | No SQL Editor: `select has_table_privilege('anon', 'public.produtos', 'DELETE');` | `false` | não executado | - | - |
| C17 | Código de barras inválido | Cadastro; nome `Produto teste`, preço `10,50` e categoria `1`; código `12`; Adicionar | Mensagem `O código de barras deve ter só números, de 8 a 14 dígitos.` na tela; nada é salvo; os campos continuam preenchidos | não executado | - | - |

## Registro das correções

Problemas encontrados durante o desenvolvimento e o teste, com o caso do roteiro a que
cada um se liga. Um caso só passa a `corrigido` na tabela depois de ser executado de novo
no aparelho; "Origem" diz como o problema foi encontrado.

### 1. Variáveis do Supabase não eram lidas (C01)
- **Origem:** log do Expo, `Configure a URL e a chave publicável do Supabase no .env.local`.
- **Observado:** o aplicativo abria sem URL nem chave, e as listas de produtos e movimentações não carregavam.
- **Causa:** o `.env.local` usava nomes `NEXT_PUBLIC_*`; o Expo só lê variáveis com o prefixo `EXPO_PUBLIC_*`.
- **Correção:** renomear para `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e reiniciar com `npx expo start -c`. O `.env.local` não vai para o Git; o commit abaixo registra os nomes corretos no `.env.example`.
- **Data:** 19/10/2026 | **Commit:** 5f357dd (Atualiza .env.example com os nomes das variáveis)

### 2. Cadastro recusado apagava o que a pessoa digitou (C04, C05)
- **Origem:** revisão do código.
- **Observado (no código):** a tela de cadastro capturava o erro e não o repassava ao formulário, que então limpava os campos como se tivesse dado certo.
- **Correção:** a tela de cadastro deixou de capturar o erro; ele sobe para o formulário, que mostra a mensagem e mantém os campos.
- **Data:** 26/10/2026 | **Commit:** ccb8111 (Contexto, formulários e telas registram e mostram erros classificados)

### 3. Movimentações sem permissão no Supabase (C06)
- **Origem:** revisão do script SQL das movimentações.
- **Observado (no script):** a tabela `movimentacoes` não tinha as permissões (`grant`) nem as políticas `to anon`, então a leitura e o registro seriam recusados pela chave publicável.
- **Correção:** políticas de leitura e inclusão `to anon`, `grant select, insert` e permissão nas sequências; versionado em `supabase/esquema.sql`.
- **Data:** 26/10/2026 | **Commit:** 596ec2d (Esquema do Supabase, roteiro de teste e README)

### 4. Erro de transação no cache do SQLite (C01, C08, C14)
- **Origem:** log do Expo no celular.
- **Observado:** `ErroDoBanco ... cannot start a transaction within a transaction` e `cannot rollback - no transaction is active`, nas linhas `[cache de produtos]` e `[cache de movimentações]`, na abertura do aplicativo.
- **Causa:** as listas de produtos e de movimentações gravam o cache ao mesmo tempo na mesma conexão do SQLite, e as duas transações se atropelam.
- **Correção:** as operações do banco local passaram a entrar numa fila, uma de cada vez (`noBanco` em `src/banco/bancoLocal.ts`).
- **Data:** 27/10/2026 | **Commit:** 110143d (feat: atualização do banco de dados local)
- **Para marcar `corrigido`:** repetir C01 e C14 e conferir que as linhas de erro não aparecem mais no terminal.

### 5. Código de barras aceitava qualquer valor (C17, C03)
- **Origem:** observado no uso do aplicativo: um código de apenas dois números foi aceito.
- **Causa:** só se exigia que o campo não estivesse vazio.
- **Correção:** validação em `validarDadosNovoProduto`: só números, de 8 a 14 dígitos (`src/servicos/produto.ts`). Vale para cadastros novos, online e offline.
- **Data:** 27/10/2026 | **Commit:** 0019ef8 (feat: aprimora servico de produtos)
- **Para marcar `corrigido`:** executar C17 e conferir que `12` é recusado e `7891000100103` é aceito.

### 6. Nomes de arquivo com maiúscula diferente do import (conferência final)
- **Origem:** `npx tsc --noEmit`, erro `TS1261` (casing).
- **Observado:** `estadotela.ts` e `Movimentacao.ts` eram importados como `estadoTela` e `movimentacao`. No Windows funciona, mas o `tsc` reclama e o build do APK no Linux (EAS) falharia.
- **Correção:** renomear com `git mv` em duas etapas: `estadoTela.ts` e `movimentacao.ts`.
- **Data:** 26/10/2026 | **Commit:** 803f150 (Módulo de erros e banco local com ErroDoBanco)

### 7. Pasta `api/` (servidor Express) dentro do aplicativo (conferência final)
- **Origem:** `npx tsc --noEmit`, 15 erros vindos de `api/`.
- **Correção:** pasta removida do projeto e `tsconfig.json` com `exclude` para `api` e `node_modules`.
- **Data:** não registrada | **Commit:** não registrado (pasta removida do projeto)

### Ambiente (não são casos do roteiro)
- **Web:** o aplicativo é para celular. Na Web o `expo-sqlite` não funciona (`Unable to resolve "./wa-sqlite/wa-sqlite.wasm"`), e o teste deve ser feito no Expo Go.
- **Conexão do Expo Go:** o erro `Failed to download remote update` no celular era a ligação com o computador. Resolvido com o cabo USB: `adb reverse tcp:8081 tcp:8081`, variável `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1` e URL `exp://127.0.0.1:8081` no Expo Go. Observado em 27/10/2026.