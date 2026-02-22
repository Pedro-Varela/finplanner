export type RepositoryErrorCode =
  | "NOT_FOUND"
  | "CREATE_FAILED"
  | "UPDATE_FAILED"
  | "DELETE_FAILED"
  | "QUERY_FAILED";

/**
 * Erro padronizado para toda a camada de repositórios.
 *
 * - `code` permite tratamento programático sem depender da mensagem.
 * - `cause` preserva o erro original do Supabase para debug.
 */
export class RepositoryError extends Error {
  readonly name = "RepositoryError";

  constructor(
    message: string,
    public readonly code: RepositoryErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
  }
}
