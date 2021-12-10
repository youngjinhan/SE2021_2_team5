import { firestore } from "../util/firebase";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps, Redirect, Link } from "react-router-dom";
import { Product } from "shared/Product";
import { UserContext } from "../auth/Auth";
import { DocData } from "../models/meta";
import { parseDocs } from "../util/firebase";
import styles from "./WishlistPage.module.scss";
import {
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { Height } from "@material-ui/icons";

export interface Props {}

export const ShoppingList: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user;
  const [products, setProducts] = useState<DocData<Product>[]>();
  const [wip, setWip] = useState<boolean>(true);
  const [totalCost, setTotalCost] = useState<number>(0);

  async function load() {
    if (!user) {
      return;
    }
    setWip(true);
    try {
      const ref = firestore
        .collection("products")
        .where("buyerUid", "==", user.fbUser.uid);

      const query = ref.orderBy("boughtAt", "desc");
      const qs = await query.get();
      console.log(qs.docs);
      setProducts(parseDocs(qs.docs));
    } finally {
      setWip(false);
    }
  }

  function calcSum() {
    if (!products) {
      setTotalCost(0);
      return;
    }

    let temp = totalCost;
    for (let i = 0; i < products!.length; i++) {
      temp = temp + products![i].data.price;
    }
    setTotalCost(temp);
  }
  useEffect(() => {
    load();
  }, [user]);

  useEffect(() => {
    calcSum();
  }, [products]);

  if (wip) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
      </div>
    );
  }

  if (!products || wip || !Object.keys(products).length) {
    return (
      <div className={styles.root}>
        <div className={styles.marginBottom10} />
        <h2>Shopping List</h2>
        <Grid container direction="row" alignContent="center" justify="center">
          <Grid item>
            {(!products || wip) && <CircularProgress></CircularProgress>}
            {products && !wip && (
              <Typography>구매내역이 존재하지 않습니다</Typography>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.marginBottom10} />
      <h2>Shopping List</h2>

      <Table className={styles.test}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography align={"left"}>제품명</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>구매 가격</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>거래 장소</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>판매자 연락처</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products &&
            products.map((product) => (
              <ProductCell product= {product} uid={user!.fbUser.uid} key={product.id} />
            ))}
        </TableBody>
      </Table>
      <h3>누적 구매 금액: {totalCost}원</h3>
    </div>
  );
};

export interface Props1 {
    product: DocData<Product>;
    uid: string
}

const ProductCell: React.FC<Props1> = (props:Props1) => {
  let status = "";
  const product = props.product;
  const uid = props.uid;
  console.log(uid);
  if (product.data.status == "Available") {
    status = "Available";
  } else if (product.data.status == "Process") {
    status = "In auction";
  } else if(uid == product.data.buyerUid){
    status = "Purchased";
  }
  else{
      status = "Sold"
  }
  return (
    <TableRow
      component={Link}
      to={`/product/${product.id}`}
      className={styles.link}
    >
      <TableCell align="left">{product.data.title}</TableCell>
      <TableCell align="left">{product.data.price}</TableCell>
      <TableCell align="left">{product.data.location}</TableCell>
      <TableCell align="left">{product.data.phonenumber}</TableCell>
    </TableRow>
  );
};
