/**
 *  Firebase가 초기화되기 전에 사용하는 것을 막기 위한 파일입니다.
 */

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/messaging";
import "firebase/storage";
import "firebase/firestore";
import { DocData } from "../models/meta";
import { Entity } from "shared/Entity";

firebase.initializeApp({
  apiKey: "AIzaSyCBTvn2fxJFsISiyuXProRioCBQgA0eMI8",
  authDomain: "safety-edu.firebaseapp.com",
  projectId: "safety-edu",
  storageBucket: "safety-edu.appspot.com",
  messagingSenderId: "494272658352",
  appId: "1:494272658352:web:54923259ea6e199fdf7475"
});

let messaging: firebase.messaging.Messaging | undefined;

try {
  messaging = firebase.messaging();
  messaging.usePublicVapidKey(
    "BNtUXAX36U2P-L0A1u3MTiUdmwUczt_37lO5IiYRH-ahIc8GjWZ2Q-vLjdMh_xXHBUR1sW2xVmuxVCEueS_ALPc"
  );
} catch (e) {
  console.error(`푸시 초기화 실패: ${e}`);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();

export { firebase, messaging };

const memoizedQueries: firebase.firestore.Query[] = [];
export function memoizeQuery(
  q: firebase.firestore.Query
): firebase.firestore.Query {
  for (const mq of memoizedQueries) {
    if (mq.isEqual(q)) {
      return mq;
    }
  }

  memoizedQueries.push(q);
  return q;
}

export function parseDoc<T extends Entity>(
  ds: firebase.firestore.DocumentSnapshot
): DocData<T> {
  return {
    id: ds.id,
    data: ds.data!() as any,
    raw: ds
  };
}

export function parseDocs<T extends Entity>(
  docs: firebase.firestore.DocumentSnapshot[]
): DocData<T>[] {
  return docs.map(ds => {
    return {
      id: ds.id,
      data: ds.data!() as any,
      raw: ds
    };
  });
}
