
# Roteiro de testes — ESTOK

## Ambiente
- Dispositivo:
- Versão do Android:
- Versão do aplicativo:
- Data dos testes:

## 1. Navegação
- [ ] A tela inicial abre.
- [ ] É possível acessar a lista de produtos.
- [ ] É possível abrir os detalhes de um produto.
- [ ] É possível acessar o cadastro.
- [ ] É possível acessar as movimentações.
- [ ] A tela Sobre está acessível, se fizer parte da navegação.

## 2. Produtos e Supabase
- [ ] A lista de produtos é carregada da nuvem.
- [ ] Um produto válido pode ser cadastrado.
- [ ] O cadastro aparece no Supabase.
- [ ] Os campos inválidos são tratados adequadamente.

## 3. Funcionamento offline
- [ ] Produtos já carregados continuam visíveis sem internet.
- [ ] A interface informa que está offline.
- [ ] Um cadastro offline fica salvo no aparelho.
- [ ] A operação pendente continua registrada após fechar e abrir o aplicativo.
- [ ] A operação é sincronizada quando a conexão retorna.
- [ ] Uma falha de sincronização não apaga o cadastro pendente.

## 4. Segurança e erros
- [ ] As políticas RLS foram verificadas.
- [ ] Falhas de conexão são apresentadas sem encerrar o aplicativo.
- [ ] Nenhuma chave privada ou credencial sensível foi publicada.

## 5. Entrega
- [ ] TypeScript verificado com npx tsc --noEmit.
- [ ] APK gerado e instalado para teste.
- [ ] Repositório Git atualizado.

## Registro dos resultados

Para cada teste executado, anote:
- Resultado: aprovado ou reprovado.
- Comportamento observado.
- Erro encontrado, se houver.
- Correção realizada, se houver.
