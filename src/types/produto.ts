export interface Produto {
  id: number;
  nome: string;
  codigo_barras: string;
  preco_venda: number;
  id_categoria: number;
  ativo: boolean;
}
