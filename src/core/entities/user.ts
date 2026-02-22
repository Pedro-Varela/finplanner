import type { UserId } from "./id";

export interface User {
  id: UserId;
  email: string;
  createdAt: string; // ISO 8601
}
