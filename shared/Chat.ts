import { Entity } from "./Entity";

/**
 * `$chattingRooms/$roomId`
 */
export interface ChattingRoom extends Entity {
  productId: string;

  /**
   * 사용자 UID
   */
  members: string[];

  lastMsg: string;

  done: boolean;
}

export interface ChatMsg extends Entity {
  content: string;
}
