import * as express from "express";
import * as admin from "firebase-admin";

admin.initializeApp();

export async function setHistory(
  req: express.Request,
  res: express.Response
): Promise<void> {
  console.log(req.params);
  const uid: string = req.params.sid;
  const key: string = req.params.key;
  await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("history")
    .add({
      timestamp: new Date(),
      lecture: req.params.roomid,
    })
    .then((docRef) => {
      console.log(uid, docRef.id);
    });

  console.log(JSON.stringify(req.headers));
  res.redirect("https://www.youtube.com/watch?v=p_LJR19ZSkY&ab_channel=%EC%86%8D%EC%82%AD%EC%9D%B4%EB%8A%94%EB%AA%BD%EC%9E%90");
}

// history/123123/J1K1zjnvcpWQXTkUIW21tlBd5mt1

export async function deleteUser(
  req: express.Request,
  res: express.Response
): Promise<void> {
  console.log(req.params);

  //const uid: string = req.params.uid;
  await admin
  .auth()
  .deleteUser(req.params.uid)
  .then(() => {
    console.log(`Successfully deleted user ${req.params.uid}`);
  })
  .catch((error) => {
    console.log('Error deleting user:', error);
  })

  console.log(JSON.stringify(req.headers));
  res.send("done");
}