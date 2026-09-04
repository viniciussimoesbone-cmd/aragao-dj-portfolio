/** Erro de regra de negócio, com o status HTTP que a rota deve responder. */
export class ErroNegocio extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ErroNegocio";
    this.status = status;
  }
}
