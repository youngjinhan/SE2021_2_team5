import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps, Redirect, Link } from "react-router-dom";
import styles from "./Detail.module.scss";
import { Product } from "shared/Product";
import Grid from "@material-ui/core/Grid";
import { firebase, firestore, parseDoc } from "../../util/firebase";
import { DocData } from "../../models/meta";
import CircularProgress from "@material-ui/core/CircularProgress";
import { ProductImages } from "./Images";
import Divider from "@material-ui/core/Divider";
import { ProductBottomBar } from "./BottomBar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Time } from "../../common/Time";
import { Button, TextField, Typography } from "@material-ui/core";
import { UserContext } from "../../auth/Auth";
import { useFormState } from "react-use-form-state";
import { BidData } from "../../models";
import { Auction } from "../auction/Auction";

interface Props extends RouteComponentProps<{ productId: string }> {}

/**
 * `/products/:productId`
 */
export const ProductDetailPage: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user;
  const { productId } = props.match.params;
  const [product, setProduct] = useState<DocData<Product>>();
  const [redirect, setRedirect] = useState("");

  const [isMine, setIsmine] = useState<boolean>(false);
  const [isSold, setIsSold] = useState<boolean>(false);
  const [wished, setWished] = useState<boolean>(false);

  async function load() {
    const ref = firestore.collection("products").doc(productId);

    const doc = await ref.get();
    if (!doc.exists) {
      setRedirect("/product");
      return;
    }

    setProduct(parseDoc(doc));
  }

  useEffect(() => {
    const doc = firestore
      .collection("products")
      .doc(productId)
      .onSnapshot(function (doc) {
        load();
      });
  }, []);

  useEffect(() => {
    if (!product) return;

    if (product.data.status == "Sold") {
      setIsSold(true);
    } else {
      setIsSold(false);
    }

    if (user) {
      if (product.data.wishlists.includes(user.fbUser.uid)) {
        setWished(true);
      } else {
        setWished(false);
      }

      if (product.data.sellerUid == user.fbUser.uid || user.type == "admin") {
        console.log("ismine");
        setIsmine(true);
      }
    }
  }, [product, user]);

  async function handleWish() {
    if (!user) {
      return;
    }
    const ref = firestore.collection("products").doc(productId);

    if (!wished) {
      ref.update({
        wishlists: firebase.firestore.FieldValue.arrayUnion(user.fbUser.uid),
      });
      console.log("add wish");
    } else {
      ref.update({
        wishlists: firebase.firestore.FieldValue.arrayRemove(user.fbUser.uid),
      });
      console.log("remove wish");
    }
  }

  async function buy() {
    if (isMine) {
      alert("자신의 상품을 구매할 수 없습니다.");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const ref = firestore.collection("products").doc(productId);
    ref.update({
      buyerName: user.name,
      buyerUid: user.fbUser.uid,
      boughtAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: "Sold",
    });
  }

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  if (!product) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
      </div>
    );
  }

  const detail = (
    <Grid container direction="row">
      <div className={styles.detail}> {product.data.desc}</div>
    </Grid>
  );

  const buyBox1 = (
    <Card className={styles.buyBox}>
      <CardContent className={styles.price}>
        <h1> {product.data.price}원</h1>
        <Button
          onClick={() => {
            buy();
          }}
        >
          구매하기
        </Button>
      </CardContent>
    </Card>
  );

  const bidBox = (
    <Auction isMine={isMine} user={user} product={product} load={load} />
  );

  const soldBox = (
    <Card className={styles.buyBox}>
      <CardContent>
        <div className={styles.price}>
          <h1> {product.data.price}원</h1>
          {isMine && <h1>판매 완료</h1>}
          {product.data.buyerUid == user?.fbUser.uid && <h1>구매 완료</h1>}
          {!isMine && product.data.buyerUid != user?.fbUser.uid && (
            <h1> Sold </h1>
          )}
        </div>
        {isMine && <div>구매자: {product.data.buyerName}</div>}
      </CardContent>
    </Card>
  );

  const edit = (
    <div>
      <Button component={Link} to={`/product/${productId}/edit`}>
        Edit
      </Button>
      <Button onClick={deletePost}>Delete</Button>
    </div>
  );

  async function deletePost() {
    if (!isMine) {
      alert("접근 권한 없음");
      return;
    }

    if (window.confirm("해당 상품을 삭제하시겠습니까?")) {
      const ref = firestore.collection("products").doc(productId);
      await ref.delete();
      setRedirect("/product");
    }
    return;
  }

  let type: string = product.data.sellType;
  if (type == "bid") {
    type = "Auction";
  } else {
    type = "Fixed price";
  }

  let status: string = product.data.status;
  if (status == "Process") {
    status = "In Auction";
  }

  return (
    <div className={styles.root}>
      <div className={styles.marginBottom10} />
      <div className={styles.row}>
        <h2>상품 상세정보</h2>
        {isMine && edit}
      </div>
      <div className={styles.rowContainer}>
        <div className={styles.flex1}>
          <Card>
            <CardContent className={styles.productImg}>
              <ProductImages images={product.data.images}></ProductImages>
            </CardContent>
          </Card>
        </div>

        <div className={styles.marginLeft10} />

        <div className={styles.flex1}>
          <div className={styles.infoBox}>
            <Card className={styles.sellorBox}>
              <CardContent className={styles.sellor}>
                <div className={styles.title}>{product.data.title}</div>
                <div className={styles.row}>
                  <Time time={product.data.createdAt.toDate()} />
                  <div>
                    <Button
                    color="primary"
                      onClick={() => {
                        handleWish();
                      }}
                      style={{ textTransform: "none" }}
                    >
                      wish
                    </Button>
                    wishes: {product.data.wishlists.length}
                  </div>
                </div>
                <Divider />
                <div className={styles.marginBottom10} />
                <Typography>판매자: {product.data.sellerName}</Typography>
                <div className={styles.marginBottom10} />
                <Divider />
                <div className={styles.marginBottom10} />
                <Typography>거래 장소: {product.data.location}</Typography>
                <div className={styles.marginBottom10} />
                <Divider />
                <div className={styles.marginBottom10} />
                <Typography>연락처: {product.data.phonenumber}</Typography>
                <div className={styles.marginBottom10} />
                <Divider />
                <div className={styles.marginBottom10} />
                <Typography>{type}</Typography>
                <div className={styles.marginBottom10} />
                <Divider />
                <div className={styles.marginBottom10} />
                <Typography>Status: {status}</Typography>
              </CardContent>
            </Card>

            <div className={styles.marginBottom10} />

            {isSold && soldBox}
            {product.data.sellType == "bid" && !isSold && bidBox}
            {product.data.sellType == "fixed" && !isSold && buyBox1}
          </div>
        </div>
      </div>
      <div className={styles.marginBottom10} />
      <div className={styles.marginBottom10} />
      <div className={styles.body}>
        <Card>
          <CardContent className={styles.detail}>{detail}</CardContent>
        </Card>
      </div>
      <div className={styles.marginBottom10} />
    </div>
  );
};
