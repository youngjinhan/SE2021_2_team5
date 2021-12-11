import React, { useEffect, useState } from "react";
import firebase from "firebase";
import { auth, messaging, firestore } from "../util/firebase";
import { UserData, UserType } from "../models";

/**
 * 현재 사용자
 */
export interface User {
  fbUser: firebase.User;
  reload(): Promise<void>;

  readonly type: UserType;
  readonly name: string;
  readonly email: string;
  readonly sid: string;
  readonly major: string;
  readonly vrcID: string;
}

interface Props {
  children: React.ReactNode;
}

interface State {
  user: User | null;
  loaded: boolean;
}

const def: State = { user: null, loaded: false };
export const UserContext = React.createContext(def);

export const Authenticated: React.FC<Props> = (props: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 앱이 초기화될 때 한 번만 호출됩니다

    let mounted = true;
    const unsubscribe = auth.onAuthStateChanged(async function onChange(
      fbUser: firebase.User | null
    ) {
      if (!mounted) return;
      if (!fbUser) {
        setUser(null);
        setLoaded(true);
        return;
      }

      const doc = firestore.collection("users").doc(fbUser.uid);

      doc.get().then((doc) => {
        if (!mounted) return;

        const data: UserData = doc.data() as any;
        setUser({
          fbUser: fbUser,
          reload: async () => {
            await fbUser.reload();
            await onChange(fbUser);
          },
          type: data.type,
          name: data.name,
          email: data.email,
          sid: data.sid,
          major: data.major,
          vrcID: data.vrcID
        });
        setLoaded(true);
      });
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loaded,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};
