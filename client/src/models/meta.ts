import * as firebase from "firebase";
import { Entity } from "shared/Entity";

export interface DocData<T extends Entity> {
  id: string;
  data: T;

  raw: firebase.firestore.DocumentSnapshot;
}

export interface timeStamp{
  timestamp: Date;
}

export interface chatroomInfo{
  members: String[];
  createdAt: Date;
  lastViewed: {[uid:string]:timeStamp}
}

export interface message{
  chatId: string;
  senderUID: String;
  content: String;
  createdAt: any;
}

export interface DocSnapshot<T extends Entity> {
  readonly id: string;
  data: T;
  raw: firebase.firestore.DocumentSnapshot;
}