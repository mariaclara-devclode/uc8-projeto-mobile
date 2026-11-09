# Roteiro de teste - Estok

Cada caso tem os passos, o resultado esperado e o resultado observado. A coluna
"Onde e quando" diz em que aparelho e em que data o caso foi executado. Um caso com
falha ganha a correção e é executado de novo; a linha registra as duas execuções.

Legenda do resultado: **aprovado** (o observado é o esperado), **falha** (não é),
**corrigido** (falhou, foi corrigido e aprovado na repetição), **não executado**.

## Ambiente

- Aparelho: Redmi Note 14
- Sistema do aparelho: HyperOS 3.0.305.0
- Forma de execução (Expo Go ou APK): Expo Go, ligado ao computador por cabo USB, até 29/10/2026 e nas execuções de 05/11/2026 (C05 e repetição do C09); APK gerado pelo EAS e instalado no celular: build de 03/11/2026, nas demais execuções de 03/11/2026, e build de 09/11/2026 (com as correções dos itens 10 a 13), nas execuções de 09/11/2026
- Versão do aplicativo: 1.0.0
- Casos sem rede: modo avião no celular, com Wi-Fi e dados móveis desligados (no Expo Go, o cabo USB mantém a ligação com o Expo, mas não dá rede ao aplicativo)

## Casos

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C01 | Carga com rede | Abrir o aplicativo com internet | Aba Início com o resumo (produtos cadastrados, ativos, aguardando sincronização); aba Produtos com a lista da nuvem, sem aviso de offline | corrigido | Redmi Note 14, 03/11/2026 e 09/11/2026 (APK do build de 09/11) | Itens 1 e 9 do registro |
| C02 | Navegação em pilha | Produtos; "Ver detalhes" em um produto; voltar | Tela de detalhes com nome, código, preço, categoria, situação e estoque atual; ao voltar, a lista | aprovado | Redmi Note 14, 03/11/2026 | - |
| C03 | Cadastro válido com rede | Cadastro; nome `Produto teste`, código `7891000100103`, preço `10,50` e categoria `1`; Adicionar produto | Alerta `Cadastro realizado`; o produto aparece na lista e na tabela `produtos` do Supabase | aprovado | Redmi Note 14, 03/11/2026 | - |
| C04 | Cadastro inválido | (a) Cadastro; nome preenchido, código em branco; Adicionar produto. (b) Tudo preenchido, preço `0`; Adicionar produto. (c) Tocar no campo Nome e sair dele sem escrever | (a) Mensagem `Preencha todos os campos do produto.`; (b) mensagem `Informe um preço válido.`; (c) `O nome do produto é obrigatório.` sob o campo e o botão desabilitado. Nos três, os campos continuam preenchidos | aprovado | Redmi Note 14, 03/11/2026 | - |
| C05 | Cadastro recusado pela nuvem | Trocar uma letra da chave publicável no `.env.local`; reiniciar com `npx expo start -c`; cadastrar um produto válido (código `7891000100103`) | Mensagem `Acesso negado pelo servidor. Verifique a chave e as permissões do projeto.` na tela de cadastro; linha `[cadastro de produto] api: ErroDaApi 401` no terminal; os campos continuam preenchidos. Depois, restaurar a chave | aprovado | Redmi Note 14, 05/11/2026 (Expo Go) | - |
| C06 | Registrar entrada com rede | Movimentações; escolher um produto; tipo Entrada; quantidade `10`; Registrar | Alerta `Movimentação registrada`; item no topo do histórico, com a hora igual à do relógio do celular; estoque atual do produto aumenta 10; linha nova na tabela `movimentacoes` | corrigido | Redmi Note 14, 29/10/2026 (falha) e 03/11/2026 (repetição) | Itens 3 e 8 do registro |
| C07 | Saída maior que o estoque | Movimentações; escolher um produto; tipo Saída; quantidade `9999` | Mensagem `Estoque insuficiente. Saldo atual: N unidades.`; nada é gravado | aprovado | Redmi Note 14, 03/11/2026 | - |
| C08 | Carga sem rede, com cache | Abrir com rede uma vez; ligar o modo avião; recarregar a lista de produtos | Lista do aparelho; aviso `Sem conexão com a internet. Os dados locais serão exibidos, se disponíveis.` acima dela | aprovado | Redmi Note 14, 03/11/2026 | - |
| C09 | Carga sem rede, sem cache | Sobre, `Apagar dados do aparelho`; modo avião; Produtos, Recarregar; depois desligar o modo avião, ligar o Wi-Fi e tocar em `Tentar novamente` | Tela de erro com `Sem conexão com o servidor. Verifique a rede e tente de novo.` e o botão `Tentar novamente`, com o texto visível; com a rede de volta, o botão recarrega a lista | corrigido | Redmi Note 14, 03/11/2026 (falha) e 05/11/2026 (repetição, Expo Go) | Itens 10 e 11 do registro |
| C10 | Cadastro sem rede | Modo avião; cadastrar um produto válido (nome `Produto offline`, código `7891000100110`) | Alerta `Produto salvo no aparelho`; o produto aparece na lista; Início mostra `Aguardando sincronização: 1` | aprovado | Redmi Note 14, 03/11/2026 | - |
| C11 | Movimentação sem rede | Modo avião; registrar uma entrada | Alerta `Movimentação salva no aparelho`; o item aparece no histórico com `Aguardando sincronização` | aprovado | Redmi Note 14, 03/11/2026 | - |
| C12 | Sincronização | Desligar o modo avião e ligar o Wi-Fi; esperar cerca de 30 segundos | As marcas `Aguardando sincronização` somem; os dois registros estão no Supabase, cada um uma vez só | aprovado | Redmi Note 14, 03/11/2026 | - |
| C13 | Dados sobrevivem ao fechamento | Com registros pendentes sem rede, fechar o aplicativo por completo; abrir de novo, ainda sem rede (com o APK instalado) | O produto continua na lista e a fila continua com as mesmas pendências de antes de fechar | aprovado | Redmi Note 14, 03/11/2026 | - |
| C14 | Contagem na tela Sobre | Aba Sobre depois de uma carga com rede | `Produtos guardados: N` e `Movimentações guardadas: M` iguais às listas; `Aguardando envio ao Supabase: 0` | aprovado | Redmi Note 14, 03/11/2026 | - |
| C15 | Apagar dados do aparelho | Sobre; `Apagar dados do aparelho`; Apagar | Contagens de produtos e movimentações vão a 0 (ou ao que estava pendente); com rede, as listas voltam a carregar da nuvem | aprovado | Redmi Note 14, 03/11/2026 | - |
| C16 | Chave da nuvem não apaga | No SQL Editor: `select has_table_privilege('anon', 'public.produtos', 'DELETE');` | `false` | aprovado | Supabase (SQL Editor), 03/11/2026 | - |
| C17 | Código de barras inválido | Cadastro; nome `Produto teste`, preço `10,50` e categoria `1`; código `12`; Adicionar produto | Mensagem `O código de barras deve ter só números, de 8 a 14 dígitos.` na tela; nada é salvo; os campos continuam preenchidos | corrigido | Redmi Note 14, 03/11/2026 | Item 5 do registro |

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
- **Repetição:** em 05/11/2026, no C05, a chave recusada mostrou a mensagem na tela e os campos continuaram preenchidos.

### 3. Movimentações recusadas pelo Supabase (C06)
- **Origem:** observado no aparelho em 29/10/2026, ao registrar uma entrada: a tela mostrou a mensagem de acesso negado e o terminal, `[movimentação] api: ErroDaApi 401`, com o código `42501` e `new row violates row-level security policy` (tabela `movimentacoes`).
- **Causa:** a tabela `movimentacoes` do projeto no Supabase estava sem as permissões (`grant`) e sem a política de inclusão `to anon`; sem política, o RLS recusa a linha.
- **Correção:** executado no SQL Editor do Supabase o script com `grant select, insert`, as políticas de leitura e de inclusão `to anon`, a permissão na sequência e o `revoke update, delete` do `anon`. O mesmo conteúdo está versionado em `supabase/esquema.sql`.
- **Data:** 29/10/2026 | **Commit:** 596ec2d (Esquema do Supabase, roteiro de teste e README) registra o script no repositório; a execução no Supabase não gera commit.
- **Repetição:** em 29/10/2026, depois do script, o alerta `Movimentação registrada` apareceu. Em 03/11/2026, no APK, o C06 foi repetido com a hora conferida (item 8) e passou.

### 4. Erro de transação no cache do SQLite (C01, C08, C14)
- **Origem:** log do Expo no celular.
- **Observado:** `ErroDoBanco ... cannot start a transaction within a transaction` e `cannot rollback - no transaction is active`, nas linhas `[cache de produtos]` e `[cache de movimentações]`, na abertura do aplicativo.
- **Causa:** as listas de produtos e de movimentações gravam o cache ao mesmo tempo na mesma conexão do SQLite, e as duas transações se atropelam.
- **Correção:** as operações do banco local passaram a entrar numa fila, uma de cada vez (`noBanco` em `src/banco/bancoLocal.ts`).
- **Data:** 27/10/2026 | **Commit:** 110143d (feat: atualização do banco de dados local)
- **Repetição:** em 05/11/2026, no Expo Go, a abertura com internet e a carga das duas listas não registraram no terminal nenhuma linha de erro de transação; o C14 passou em 03/11/2026.

### 5. Código de barras aceitava qualquer valor (C17, C03)
- **Origem:** observado no uso do aplicativo: um código de apenas dois números foi aceito.
- **Causa:** só se exigia que o campo não estivesse vazio.
- **Correção:** validação em `validarDadosNovoProduto`: só números, de 8 a 14 dígitos (`src/servicos/produto.ts`). Vale para cadastros novos, online e offline.
- **Data:** 27/10/2026 | **Commit:** 0019ef8 (feat: aprimora servico de produtos)
- **Repetição:** em 03/11/2026, o código `12` foi recusado com a mensagem esperada (C17) e o código `7891000100103` foi aceito (C03).

### 6. Nomes de arquivo com maiúscula diferente do import (conferência final)
- **Origem:** `npx tsc --noEmit`, erro `TS1261` (casing).
- **Observado:** `estadotela.ts` e `Movimentacao.ts` eram importados como `estadoTela` e `movimentacao`. No Windows funciona, mas o `tsc` reclama e o build do APK no Linux (EAS) falharia.
- **Correção:** renomear com `git mv` em duas etapas: `estadoTela.ts` e `movimentacao.ts`.
- **Data:** 26/10/2026 | **Commit:** 803f150 (Módulo de erros e banco local com ErroDoBanco)

### 7. Pasta `api/` (servidor Express) dentro do aplicativo (conferência final)
- **Origem:** `npx tsc --noEmit`, 15 erros vindos de `api/`.
- **Correção:** pasta removida do projeto e `tsconfig.json` com `exclude` para `api` e `node_modules`.
- **Data:** não registrada | **Commit:** não registrado (pasta removida do projeto)

### 8. Hora da movimentação 3 horas adiantada (C06)
- **Origem:** observado no aparelho em 29/10/2026: uma movimentação registrada às 19:16 apareceu no histórico como 22:16:26.
- **Causa:** a coluna `data` estava como `timestamp without time zone`. O aplicativo envia a hora em UTC, o banco guardava e devolvia sem fuso, e o aplicativo a lia como hora local.
- **Correção:** a coluna passou para `timestamptz` no Supabase, igual ao `supabase/esquema.sql`.
- **Data:** 29/10/2026 | **Commit:** não se aplica (alteração feita direto no banco do Supabase)
- **Repetição:** em 03/11/2026, no APK, a hora da movimentação do C06 ficou igual à do relógio do celular.

### 9. APK sem dados: variáveis do Supabase fora do build (C01)
- **Origem:** observado no aparelho em 03/11/2026, com o primeiro APK instalado: as telas Início, Produtos e Movimentações mostravam `Algo deu errado. Tente de novo.`, sem listas nem resumo, com o celular no Wi-Fi.
- **Causa:** as variáveis do Supabase não estavam no EAS quando o APK foi gerado. O `.env.local` não vai para o build, então o aplicativo ficou sem a URL e sem a chave.
- **Correção:** criadas no EAS, no ambiente `preview`, as variáveis `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; o perfil `preview` do `eas.json` passou a ter `"environment": "preview"`; novo build. O log do build listou as duas variáveis como carregadas do ambiente `preview`.
- **Data:** 03/11/2026 | **Commit:** bac5a52 (fix: build preview le as variaveis do ambiente preview)
- **Repetição:** em 03/11/2026, com o novo APK instalado, o aplicativo carregou sem erro.

### 10. Botão "Tentar novamente" sem texto na tela Produtos (C09)
- **Origem:** observado no aparelho em 03/11/2026, no APK: abaixo da mensagem de erro aparecia uma barra azul fina, sem texto.
- **Causa:** na tela Produtos o botão ficava dentro de um bloco em coluna, e o botão, feito para esticar na horizontal, encolhia. Na tela Movimentações, onde o bloco é uma linha, ele aparecia normal.
- **Correção:** `flexDirection: "row"` no estilo `botaoTentarNovamente` de `src/telas/TelaProdutos.tsx`.
- **Data:** 05/11/2026 | **Commit:** dec18c4
- **Repetição:** em 05/11/2026, no Expo Go, o botão apareceu com o texto `Tentar novamente`.

### 11. Falha de rede sem lista guardada aparecia como erro genérico (C09)
- **Origem:** observado no aparelho em 03/11/2026, no APK, no C09: a tela mostrava `Algo deu errado. Tente de novo.` no lugar de `Sem conexão com o servidor. Verifique a rede e tente de novo.`
- **Causa:** o aplicativo só reconhecia falha de rede quando o erro chegava como `TypeError: Network request failed`. No Redmi Note 14 a falha chega como `Error: fetch failed: java.net.UnknownHostException: Unable to resolve host ...`, que era classificada como erro desconhecido.
- **Correção:** `ErroDeRede` e `comoErroDeRede` em `src/erros/erros.ts`. As leituras (`carregarProdutos`, `carregarProdutoPorId` e `carregarMovimentacoes`) passaram a tratar qualquer falha do próprio `fetch` como falha de rede, porque o `fetch` só rejeita quando nenhuma resposta chega do servidor.
- **Data:** 05/11/2026 | **Commit:** dec18c4
- **Repetição:** em 05/11/2026, no Expo Go, a tela mostrou a mensagem de rede e o terminal, `[lista de produtos] rede: ErroDeRede: Error: fetch failed: java.net.UnknownHostException ...`; com a rede de volta, `Tentar novamente` recarregou a lista.

### 12. Abas sem ícone (todas as telas)
- **Origem:** observado no aparelho em 03/11/2026: as cinco abas mostravam um quadrado vazio, o ícone provisório do React Navigation, porque as abas só tinham título.
- **Correção:** ícones Ionicons (`@expo/vector-icons`) em cada aba, definidos em `App.tsx`; a aba ativa usa a cor primária do tema.
- **Data:** 05/11/2026 | **Commit:** a2254f4
- **Repetição:** em 05/11/2026, no Expo Go, as cinco abas mostraram o ícone. Em 09/11/2026, no APK do build de 09/11, as cinco abas também mostraram o ícone.

### 13. Build do APK falhou depois dos ícones: duas versões do `expo-font`
- **Origem:** o build do EAS de 05/11/2026 terminou com erro na fase `Run gradlew` (`Gradle build failed with unknown error`). Em 09/11/2026, `npx expo-doctor` terminou com 19 de 21 verificações e dois avisos.
- **Observado:** `Missing peer dependency: expo-font` (exigido por `@expo/vector-icons`) e duplicata do módulo nativo: `expo-font@58.0.11` na raiz do projeto e `expo-font@57.0.4` dentro de `expo`.
- **Causa:** ao instalar o `@expo/vector-icons` (item 12), o `npm` trouxe uma versão do `expo-font` fora do SDK 57. Um build nativo aceita uma só versão de cada módulo nativo. O Expo Go já traz o módulo embutido, por isso o aplicativo funcionava nele. O log do Gradle de 05/11 não foi analisado a fundo: o build passou depois desta correção.
- **Correção:** `npx expo install expo-font`, que instala a versão do SDK 57 e acrescenta o plugin `expo-font` ao `app.json`. Depois disso, `npx expo-doctor` terminou com 21 de 21 verificações e `npx expo export --platform android` terminou sem erro.
- **Data:** 09/11/2026 | **Commit:** 1896527
- **Repetição:** em 09/11/2026, um novo build do EAS terminou com sucesso e o APK foi instalado no Redmi Note 14.

### Ambiente (não são casos do roteiro)
- **Web:** o aplicativo é para celular. Na Web o `expo-sqlite` não funciona (`Unable to resolve "./wa-sqlite/wa-sqlite.wasm"`), e o teste deve ser feito no Expo Go.
- **Conexão do Expo Go:** o erro `Failed to download remote update` no celular era a ligação com o computador. Resolvido com o cabo USB: `adb reverse tcp:8081 tcp:8081`, variável `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1` e URL `exp://127.0.0.1:8081` no Expo Go. Observado em 27/10/2026.
- **Aviso de offline com o Wi-Fi ligado:** em 09/11/2026, no Expo Go, o aviso `Sem conexão com a internet...` apareceu com o celular conectado ao Wi-Fi, porque aquela rede estava sem acesso à internet. O aplicativo mostrou a lista guardada no aparelho com o aviso, como no C08. Não é defeito do aplicativo.
- **Aviso de `SafeAreaView`:** no Expo Go aparece um aviso amarelo, `SafeAreaView has been deprecated`. É do modo de desenvolvimento, não aparece no APK e não afeta o funcionamento. A troca por `react-native-safe-area-context` fica como melhoria futura.