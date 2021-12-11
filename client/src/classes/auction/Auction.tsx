import React, { useState } from "react";
import styles from "./Auction.module.scss";
import { Product } from "shared/Product";
import { DocData } from "../../models/meta";
import { User } from "../../auth/Auth";
import { Card, CardContent, TextField, Button } from "@material-ui/core";
import { useFormState } from "react-use-form-state";
import { firebase, firestore } from "../../util/firebase";
import { BidData } from "../../models";
import { BidDialog } from "./BidDialog";

export interface Props {
  isMine: boolean;
  user: User | null;
  product: DocData<Product>;
  load: any;
}

interface Fields {
  bidPrice: number;
}

export const Auction: React.FC<Props> = (props: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const product = props.product;
  const isMine = props.isMine;
  const user = props.user;
  const [form, { number }] = useFormState<Fields>({
    bidPrice: 0,
  });
  function load() {
    props.load();
  }

  const handleclose = () => {
    setOpen(false);
  };

  return (
    <div>
      {open && (
        <BidDialog
          handler={handleclose}
          isMine={isMine}
          user={user}
          product={product}
          load={props.load}
        />
      )}
      <Card className={styles.buyBox}>
        <CardContent className={styles.price}>
          <div className={styles.row}>
            <h1> 현재가 {product.data.price}원</h1>
            <Button
              onClick={() => {
                setOpen(true);
              }}
              style={{ textTransform: "none" }}
            >
              참여하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
