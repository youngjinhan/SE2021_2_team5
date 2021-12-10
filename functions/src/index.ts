import express = require("express");
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as functions from "firebase-functions";
import * as user from "./user";
// import { indexUpdater, productIndex} from "./util/algolia";
// import { Product } from "shared/Product";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const app = express();
app.use(bodyParser());
app.use(cors({ maxAge: 60 * 60 * 24 * 7 }));
app.use(express.json());

app.get('/history/:roomid/:vrcid', user.setHistory);

export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

export const api = functions.https.onRequest((req, res) => {
    if (!req.path) {
      // prepending "/" keeps query params, path params intact
      req.url = `/${req.url}`;
    }
  
    return app(req, res);
  });

/**
 * products 게시판의 글이 수정/생성/삭제되었을 때 호출되며, 인덱스를 업데이트합니다.(이미지 제거)
 */
// export const updateProductIndexes = functions.firestore
//   .document("products/{productId}")
//   .onWrite(
//     indexUpdater<Product>("productId", productIndex, t => {
//       delete t.images;
//       return t;
//     })
//   );