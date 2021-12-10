import React, { useState, useEffect } from "react";
import styles from "./List.module.scss";
import { DocData } from "../models/meta";
import * as querystring from "querystring";
import { Product } from "shared/Product";
import { firestore, parseDocs } from "../util/firebase";
import { RouteComponentProps, Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import { productIndex } from "../util/algolia";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

export interface Props extends RouteComponentProps {}

/**
 * `/product`
 */
export const ProductListPage: React.FC<Props> = (props: Props) => {
  const [products, setProducts] = useState<DocData<Product>[]>();
  const [wip, setWip] = useState(true);

  useEffect(() => {
    async function load() {
      setWip(true);

      try {
        const coll = firestore.collection("products");

        const q = querystring.parse(props.location.search.substring(1)).q;
        if (q) {
          const results = await productIndex.search(q);
          if (!results.hits || !Object.keys(results.hits).length) {
            setProducts([]);
            return;
          }

          const docs = await Promise.all(
            results.hits.map(hit => coll.doc(hit.objectID).get())
          );

          setProducts(parseDocs(docs));
        } else {
          const query = coll.orderBy("createdAt", "desc").limit(50);

          const qs = await query.get();

          setProducts(parseDocs(qs.docs));
        }
      } finally {
        setWip(false);
      }
    }

    load();
  }, [props.location.search]);

  if (!products || wip || !Object.keys(products).length) {
    return (
      <Grid container direction="row" alignContent="center" justify="center">
        <Grid item>
          {(!products || wip) && <CircularProgress></CircularProgress>}
          {products && !wip && <Typography>상품이 없습니다</Typography>}
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container direction="row" alignContent="center">
      {products &&
        products.map((product: DocData<Product>) => {
          return (
            <Grid key={product.id} item xs={12} sm={6} lg={3} xl={2}>
              <Card className={styles.card}>
                <CardContent>
                  <Link to={`/product/${product.id}`} className={styles.link}>
                    <Typography>{product.data.title}</Typography>
                  </Link>
                </CardContent>
                <CardContent>
                  <Typography>{product.data.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
    </Grid>
  );
};
