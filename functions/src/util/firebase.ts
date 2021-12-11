import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

export { admin };

export const config = functions.config();
export const storage = admin.storage();
export const messaging = admin.messaging();