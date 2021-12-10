import React, { useState, useEffect, useContext } from "react";
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
import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { userInfo } from "os";
import { UserContext } from "../auth/Auth";

export interface Props extends RouteComponentProps {}

/**
 * `/product`
 */
export const ProductListPage: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user;
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
            results.hits.map((hit) => coll.doc(hit.objectID).get())
          );

          setProducts(parseDocs(docs));
        } else {
          const query = coll.orderBy("status").orderBy("createdAt", "desc");

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
      <div className={styles.root}>
        <div className={styles.marginBottom10} />
        <div className={styles.row}>
          <h2>상품 목록</h2>
          {user && user.type != "student" && (
            <Button component={Link} to="/product/new">
              <AddIcon />
            </Button>
          )}
        </div>
        <Grid container direction="row" alignContent="center" justify="center">
          <Grid item>
            {(!products || wip) && (
              <div className={styles.loading}>
                <CircularProgress />
              </div>
            )}
            {products && !wip && <Typography>상품이 없습니다</Typography>}
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.marginBottom10} />
      <div className={styles.row}>
        <h2>상품 목록</h2>
        {user && user.type != "student" && (
          <Button component={Link} to="/product/new">
            <AddIcon />
          </Button>
        )}
      </div>
      <div>
        {products &&
          products.map((product: DocData<Product>) => {
            let sellType = "";
            if (product.data.sellType == "bid") {
              sellType = "Auction";
            } else {
              sellType = "Fixed price";
            }
            return (
              <div className={styles.items} key={product.id}>
                <Link to={`/product/${product.id}`} className={styles.link}>
                  <Card className={styles.card}>
                    <CardContent>
                      <div className={styles.row}>
                        <h1>{product.data.title}</h1>
                        <Typography variant="h6">
                          {product.data.status}
                        </Typography>
                      </div>
                      <div className={styles.row}>
                        <div>
                          <Typography>{sellType}</Typography>
                          <Typography>
                            location: {product.data.location}
                          </Typography>
                        </div>
                        <Typography variant="h5">
                          {product.data.price}원
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
      </div>
    </div>
  );
};
