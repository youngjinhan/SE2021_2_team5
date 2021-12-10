import { firestore } from "../util/firebase";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps, Redirect, Link } from "react-router-dom";
import { Product } from "shared/Product";
import { UserContext } from "../auth/Auth";
import { DocData } from "../models/meta";
import { productIndex } from "../util/algolia";
import { parseDocs } from "../util/firebase";
import styles from "./WishlistPage.module.scss";
import {
  CircularProgress,
  Grid,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { Table } from "@material-ui/core";

interface Props extends RouteComponentProps {}

export const WishlistPage: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user;
  const [products, setProducts] = useState<DocData<Product>[]>();
  const [wip, setWip] = useState<boolean>(true);

  async function load() {
    if (!user) {
      return;
    }
    setWip(true);
    try {
      const ref = firestore
        .collection("products")
        .where("wishlists", "array-contains", user.fbUser.uid);

      const query = ref
        .orderBy("status")
        .orderBy("createdAt", "desc");
      const qs = await query.get();

      setProducts(parseDocs(qs.docs));
    } finally {
      setWip(false);
    }
  }
  useEffect(() => {
    load();
  }, [user]);

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
        <h2>Wish List</h2>
        <Grid container direction="row" alignContent="center" justify="center">
          <Grid item>
            {(!products || wip) && <CircularProgress></CircularProgress>}
            {products && !wip && (
              <Typography>Wish List가 존재하지 않습니다</Typography>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.marginBottom10} />
      <h2>Wish List</h2>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography align={"left"}>제품명</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>가격</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>장소</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>status</Typography>
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
      <TableCell align="left">{status}</TableCell>
    </TableRow>
  );
};
