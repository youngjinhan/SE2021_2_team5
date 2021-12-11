import * as express from "express";
import * as admin from "firebase-admin";

admin.initializeApp();

export async function setHistory(
  req: express.Request,
  res: express.Response
): Promise<void> {
  console.log(req.params);
  const sid: string = req.params.sid;
  const key: string = req.params.key;

    const userColRef = await admin.firestore().collection("users")
    const userDocs = await userColRef.where('sid', "==", sid).limit(1).get();
    // if(!userDocs.docs.length){
    //   //no user found
    // }
    console.log(userDocs);

    const worldColRef = await admin.firestore().collection("worlds")
    const worldStartDoc = await worldColRef.where('startKey', "==", key).limit(1).get()
    const worldEndDoc = await worldColRef.where('endKey', "==", key).limit(1).get()

    console.log(worldStartDoc);
    console.log(worldEndDoc);

    // if(worldStartDoc.docs.length){

    // }
    // else if(worldEndDoc.docs.length){

    // }

  console.log(JSON.stringify(req.headers));
  key === "1234"
? res.redirect("https://youtu.be/TAqukZduvv0")
    : key === "5678"
    ? res.redirect("https://youtu.be/H9G__051vKw")
    : res.redirect("https://youtu.be/TItMRFSgIL4");
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