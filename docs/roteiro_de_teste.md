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

## Casos

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C01 | Carga com rede | Abrir o aplicativo com internet | Aba Início com o resumo (produtos cadastrados, ativos, aguardando sincronização); aba Produtos com a lista da nuvem, sem aviso de offline | não executado | - | - |
| C02 | Navegação em pilha | Produtos; "Ver detalhes" em um produto; voltar | Tela de detalhes com nome, código, preço, categoria, situação e estoque atual; ao voltar, a lista | não executado | - | - |
| C03 | Cadastro válido com rede | Cadastro; preencher nome, código, preço `10,50` e categoria `1`; Adicionar | Alerta `Cadastro realizado`; o produto aparece na lista e na tabela `produtos` do Supabase | não executado | - | - |
| C04 | Cadastro inválido | Cadastro; deixar o nome em branco ou o preço `abc`; Adicionar | Mensagem `Preencha todos os campos do produto.` ou `Informe um preço válido.` na tela; os campos continuam preenchidos | não executado | - | - |
| C05 | Cadastro recusado pela nuvem | Trocar uma letra da chave publicável no `.env.local`; reiniciar com `npx expo start -c`; cadastrar um produto válido | Mensagem `Acesso negado pelo servidor. Verifique a chave e as permissões do projeto.` na tela de cadastro; linha `[cadastro de produto] api: ErroDaApi 401` no terminal; os campos continuam preenchidos. Depois, restaurar a chave | não executado | - | - |
| C06 | Registrar entrada com rede | Movimentações; escolher um produto; tipo Entrada; quantidade `10`; Registrar | Alerta `Movimentação registrada`; item no topo do histórico; estoque atual do produto aumenta 10; linha nova na tabela `movimentacoes` | não executado | - | - |
| C07 | Saída maior que o estoque | Movimentações; escolher um produto; tipo Saída; quantidade maior que o estoque atual | Mensagem `Estoque insuficiente. Saldo atual: N unidades.`; nada é gravado | não executado | - | - |
| C08 | Carga sem rede, com cache | Abrir com rede uma vez; ligar o modo avião; recarregar a lista de produtos | Lista do aparelho; aviso `Sem conexão com a internet` acima dela | não executado | - | - |
| C09 | Carga sem rede, sem cache | Instalação nova (ou Sobre, `Apagar dados do aparelho`); modo avião; abrir Produtos | Tela de erro com `Sem conexão com o servidor. Verifique a rede e tente de novo.` e botão `Tentar novamente` | não executado | - | - |
| C10 | Cadastro sem rede | Modo avião; cadastrar um produto válido | Alerta `Produto salvo no aparelho`; o produto aparece na lista; Início mostra `Aguardando sincronização: 1` | não executado | - | - |
| C11 | Movimentação sem rede | Modo avião; registrar uma entrada | Alerta `Movimentação salva no aparelho`; o item aparece no histórico com `Aguardando sincronização` | não executado | - | - |
| C12 | Sincronização | Desligar o modo avião; esperar alguns segundos | As marcas `Aguardando sincronização` somem; os dois registros estão no Supabase, cada um uma vez só | não executado | - | - |
| C13 | Dados sobrevivem ao fechamento | Cadastrar sem rede; fechar o aplicativo por completo; abrir de novo (com o APK instalado) | O produto continua na lista e a fila continua com 1 pendência | não executado | - | - |
| C14 | Contagem na tela Sobre | Aba Sobre depois de uma carga com rede | `Produtos guardados: N` e `Movimentações guardadas: M` iguais às listas; `Aguardando envio ao Supabase: 0` | não executado | - | - |
| C15 | Apagar dados do aparelho | Sobre; `Apagar dados do aparelho`; Apagar | Contagens de produtos e movimentações vão a 0 (ou ao que estava pendente); com rede, as listas voltam a carregar da nuvem | não executado | - | - |
| C16 | Chave da nuvem não apaga | No SQL Editor: `select has_table_privilege('anon', 'public.produtos', 'DELETE');` | `false` | não executado | - | - |

## Registro das correções

Para cada caso com falha, anotar aqui: o que foi observado, o que foi corrigido e o
commit da correção.