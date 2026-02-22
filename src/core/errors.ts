/**
 * Erro de validação da camada de domínio.
 *
 * Lançado pelos use cases quando os dados de entrada violam regras de negócio.
 * Permite que a camada de UI distinga erro de validação de erros técnicos:
 *
 *   if (err instanceof ValidationError) → mostrar mensagem ao user
 *   else → erro inesperado, logar e mostrar fallback
 */
export class ValidationError extends Error {
  readonly name = "ValidationError";

  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
  }
}
