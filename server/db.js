// Import the functions you need from the SDKs you need
// const firebase = require("firebase/app");
const config = require("./config");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDmK14kBY-oFKimhh7dMO2ey_VCfO5WMtk",
//   authDomain: "safety-laboratory.firebaseapp.com",
//   databaseURL: "https://safety-laboratory-default-rtdb.firebaseio.com",
//   projectId: "safety-laboratory",
//   storageBucket: "safety-laboratory.appspot.com",
//   messagingSenderId: "67890807079",
//   appId: "1:67890807079:web:1e5c9f4390ad4bf6ce6902",
//   measurementId: "G-VR93Y5JQPV",
// };

var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./safety-laboratory-firebase-adminsdk-q65wv-199825d3c7.json");
const { getDatabase } = require("@firebase/database");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://safety-laboratory-default-rtdb.firebaseio.com",
});

// Initialize Firebase
// const db = firebase.initializeApp(config.firebaseConfig);
// const analytics = getAnalytics(app);
// const database = firebase.database();

// let defaultDatabase = getDatabase(db);
// console.log(defaultDatabase);

const db = admin.database();
// console.log(db);
module.exports = db;
