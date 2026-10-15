export type EstadoTela<T> =
  | {
      status: "carregando";
    }
  | {
      status: "erro";
      mensagem: string;
    }
  | {
      status: "pronto";
      dados: T;
    };
