export interface Movimentacao {
  id: number;
  id_produto: number;
  quantidade: number;
  tipo: "entrada" | "saida";
  data: Date;
}
