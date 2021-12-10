import React, { useEffect, useState, useContext } from "react";
import { Product, ProductComment } from "shared/Product";
import { DocData } from "../../models/meta";
import Grid from "@material-ui/core/Grid";
import { firestore, parseDocs } from "../../util/firebase";
import { Progress } from "../../common/Progress";
import { UserContext } from "../../auth/Auth";
import { Typography } from "@material-ui/core";

interface Props {
  product: DocData<Product>;
}

export const ProductComments: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user;
  const { product } = props;
  const [comments, setComments] = useState<DocData<ProductComment>[]>();

  useEffect(() => {
    async function load() {
      const productRef = firestore.collection("products").doc(props.product.id);
      const coll = productRef.collection("comments");

      const qs = await coll.limit(15).get();

      setComments(parseDocs(qs.docs));
    }

    load();
  }, [product.id]);

  return (
    <Grid container direction="column">
      <Grid item>
        <h4>댓글</h4>
      </Grid>

      {!comments && <Progress />}
      {comments &&
        comments.map((cmt: DocData<ProductComment>) => {
          return (
            <Grid key={cmt.id} item>
              {cmt.data.content}
            </Grid>
          );
        })}
      <Grid item>
        {!user && <Typography>댓글을 달려면 로그인하세요</Typography>}
      </Grid>
    </Grid>
  );
};
