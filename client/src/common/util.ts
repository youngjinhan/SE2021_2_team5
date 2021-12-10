import { User } from "../auth/Auth";
import { firebase, storage } from "../util/firebase";
import SHA256 from "crypto-js/sha256";

export async function hash(file: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = event => {
      let data = event.target!.result!;
      if (!data) {
        reject(new Error("파일 해시 실패: data == null"));
        return;
      }
      if (typeof data !== 'string') {
        data = String.fromCharCode.apply(null, data as any);
      }
      resolve(SHA256(data as string).toString());
    };
    reader.onerror = e => {
      reject(e);
    };
    reader.readAsBinaryString(file);
  });
}

export async function uploadFile(user: User, file: Blob): Promise<string> {
  const storageRef = storage.ref();
  const sum = await hash(file);

  const ref = storageRef.child(`_upload/${sum}`);

  // try {
  //   await ref.getMetadata();
  //   return `https://storage.googleapis.com/flea-market-51587.appspot.com/_upload/${sum}`;
  // } catch (e) {
  //   //ignore
  // }

  const task = ref.put(file);

  task.on('state_changed', function(snapshot){
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    // console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        // console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        // console.log('Upload is running');
        break;
    }
  }, function(error) {
    // Handle unsuccessful uploads
  }, function() {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      // console.log('File available at', downloadURL);
    });
  });

  return task.snapshot.ref.getDownloadURL();
}
