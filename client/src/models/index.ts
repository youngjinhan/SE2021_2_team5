import { firestore } from "firebase";
export interface Entity {}

export type UserType = "admin" | "professor" | "student"
export interface UserData {
    type: UserType;
    name: string;
    email: string;
    sid: string;
    major: string;
    vrcID: string;
    classes: Array<string>;
    completedClasses: Array<string>

    createdAt: firebase.firestore.Timestamp;
    lastModified: firebase.firestore.Timestamp;

    // photoUrl?: string;
    // clubs: string[];
    // pushTokens?: { [pushToken: string]: true };
    // major?: string;
    // studentNo?: string;
  }

export interface WorldData{
  name: string;
  worldUrl: string;
  duration: string;
  description: string;
  dueDate: any;
}

export interface BidData {
  createdAt: any;
  biderUid: string;
  biderName: string;
  bidPrice: number;
}

export type DialogType = "redirect" | "remain" | "proceed";

export interface DialogInfo {
  dialogType: DialogType;
  redirectUrl: string;
  dialogTitle?: string;
  dialogMessage: string;
  options: number;
  button1: string;
  button2?: string;
  /**
   * 단위: ms
   */
  timeout?: number;
}

export interface AttachedFile {
  name: string;
  url: string;
}