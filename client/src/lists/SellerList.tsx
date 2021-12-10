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

interface Props extends RouteComponentProps<{ sellerUid: string }> {}

export const SellerList: React.FC<Props> = (props: Props) => {
  const sellerUid = props.match.params.sellerUid;
  const [seller, setSeller] = useState<string>("");
  const [products, setProducts] = useState<DocData<Product>[]>();
  const [wip, setWip] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(true);

  async function load() {
    if (!sellerUid) {
      return;
    }
    setWip(true);
    try {
      const ref2 = firestore.collection("users").doc(sellerUid);
      const doc = await ref2.get();
      if (!doc.exists) {
        setLoaded(true);
        setWip(false);
        return;
      }
      const docData = doc.data() as any;
      setSeller(docData.name);

      const ref = firestore
        .collection("products")
        .where("sellerUid", "==", sellerUid);
      const query = ref.orderBy("status").orderBy("createdAt", "desc");
      const qs = await query.get();
      setProducts(parseDocs(qs.docs));
    } finally {
      setWip(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
        <h2>{seller}님의 판매 목록</h2>
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
      <h2>{seller}님의 판매 목록</h2>

      <Table className={styles.test}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography align={"left"}>제품명</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>판매 가격</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>wishes</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>상태</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products &&
            products.map((product) => (
              <ProductCell {...product} key={product.id} />
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ProductCell: React.FC<DocData<Product>> = (product: DocData<Product>) => {
  let status = "";
  if (product.data.status == "Available") {
    status = "Available";
  } else if (product.data.status == "Process") {
    status = "In auction";
  } else {
    status = "Sold";
  }
  return (
    <TableRow
      component={Link}
      to={`/product/${product.id}`}
      className={styles.link}
    >
      <TableCell align="left">{product.data.title}</TableCell>
      <TableCell align="left">{product.data.price}</TableCell>
      <TableCell align="left">{product.data.wishlists.length}</TableCell>
      <TableCell align="left">{product.data.status}</TableCell>
    </TableRow>
  );
};
