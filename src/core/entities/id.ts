/**
 * Branded types para IDs — impede mistura acidental entre IDs de domínios diferentes.
 *
 * Em runtime são strings normais. Em compile-time o TypeScript garante
 * que um `CategoryId` não é aceite onde se espera um `TransactionId`.
 */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type TransactionId = Brand<string, "TransactionId">;
export type CategoryId = Brand<string, "CategoryId">;
export type UserId = Brand<string, "UserId">;
