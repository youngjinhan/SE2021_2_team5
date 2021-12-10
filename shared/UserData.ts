import { Entity } from "./Entity";

export type UserId = string;

export interface UserData extends Entity {
  isAdmin?: boolean;
  pushTokens?: { [pushToken: string]: true };
}

export interface Author {
  uid: string;
  displayName: string;
}
