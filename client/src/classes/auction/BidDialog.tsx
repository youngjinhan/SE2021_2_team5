import React, { useEffect, useState } from "react";
import styles from "./BidDialog.module.scss";
import { Product } from "shared/Product";
import { DocData } from "../../models/meta";
import {
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { User } from "../../auth/Auth";
import { firebase, firestore } from "../../util/firebase";
import { BidData } from "../../models";
import { useFormState } from "react-use-form-state";
import { Time } from "../../common/Time";

export interface Props {
  handler: any;
  isMine: boolean;
  user: User | null;
  product: DocData<Product>;
  load: any;
}

interface Fields {
  bidPrice: number;
}

export const BidDialog: React.FC<Props> = (props: Props) => {
  const [open, setOpen] = useState(true);
  const [fullWidth, setFullWidth] = React.useState(true);

  const product = props.product;
  const isMine = props.isMine;
  const user = props.user;
  const [form, { number }] = useFormState<Fields>({
    bidPrice: 0,
  });
  function load() {
    props.load();
  }

  const handleClose = () => {
    props.handler();
  };

  const [bids, setBids] = useState<BidData[]>([]);
  const [initLoad, setInitLoad] = useState<boolean>(true);
  const bid_ref = firestore.collection("products").doc(product.id);

  async function loadBids() {
    setInitLoad(false);
    return bid_ref
      .collection("bids")
      .orderBy("createdAt")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              setBids((oldArray) => [
                change.doc.data() as BidData,
                ...oldArray,
              ]);
            }
          });
        },
        (err) => {
          alert(err);
        }
      );
  }

  async function handleBid() {
    if (isMine) {
      alert("자신의 상품을 구매할 수 없습니다.");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!product) {
      return;
    }
    load();
    const inputPrice = parseInt(form.values.bidPrice);
    console.log(product.data.price, inputPrice)
    if (inputPrice <= product.data.price) {
      alert("현재가 보다 높은 가격으로 경매에 참여할 수 있습니다.");
      return;
    }
    const ref = firestore.collection("products").doc(product.id);
    ref.update({
      price: inputPrice,
      status: "Process",
    });

    const bid = firestore
      .collection("products")
      .doc(product.id)
      .collection("bids")
      .doc();
    const bdata: BidData = {
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      biderUid: user.fbUser.uid,
      biderName: user.name,
      bidPrice: inputPrice,
    };
    bid.set(bdata);
  }

  async function selectBid() {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!product) {
      return;
    }
    load();

    if (product.data.status == "Available") {
      alert("아직 경매가 존재하지 않습니다");
      return;
    }
    const ref = firestore.collection("products").doc(product.id);

    const bestBidRef = ref.collection("bids").orderBy("bidPrice").limit(1);
    const bestBidDoc = (await bestBidRef.get()).docs[0];
    if (!bestBidDoc.exists) {
      return;
    }
    const bestBidData = bestBidDoc.data();

    ref.update({
      price: bestBidData.bidPrice,
      buyerName: bestBidData.biderName,
      buyerUid: bestBidData.biderUid,
      boughtAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: "Sold",
    });
  }

  function renderBids() {
    let i = 0;
    let bidCount = bids.length;
    let rederedBids = [<Divider />];
    while (i < bidCount) {
      let target = bids[i];
      rederedBids.push(<BidItem bidData={target} />);
      rederedBids.push(<Divider />);
      i += 1;
    }
    return rederedBids;
  }

  const buyBox = (
    <div>
      <h1> 현재가 {product.data.price}원</h1>
      <div className={styles.row3}>
        <TextField required {...number("bidPrice")} />
        <div className={styles.marginLeft10} />
        <Button
          variant="contained"
          onClick={() => {
            handleBid();
          }}
          style={{ textTransform: "none" }}
        >
          Bid
        </Button>
      </div>
    </div>
  );

  const sellBox = (
    <div>
      <h1> 현재가 {product.data.price}원</h1>

      <div className={styles.row3}>
        <Button
          variant="contained"
          onClick={() => {
            selectBid();
          }}
          style={{ textTransform: "none" }}
        >
          Sell
        </Button>
      </div>
    </div>
  );

  useEffect(() => {
    loadBids();
  }, []);

  //   useEffect(()=>{},[bids]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={fullWidth}
      maxWidth="sm"
    >
      <DialogContent>
        <div className={styles.close}>
          <IconButton edge="start" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>

        <div className={styles.root}>
          <div className={styles.outerbox}>
            <div className={styles.scrollList}>{renderBids()}</div>
          </div>

          {!isMine && buyBox}
          {isMine && sellBox}
        </div>

        <div className={styles.marginBottom10} />
      </DialogContent>
    </Dialog>
  );
};

export interface Props1 {
  bidData: BidData;
}
export const BidItem: React.FC<Props1> = (props: Props1) => {
  const bidData = props.bidData;
  let temp = null;
  if (bidData.createdAt != null) {
    temp = bidData.createdAt.toDate();
  }
  return (
    <div className={styles.row}>
      <Time time={temp} />
      <div className={styles.row2}>
        <Typography>{bidData.biderName}</Typography>
        <Typography>{bidData.bidPrice}원</Typography>
      </div>
    </div>
  );
};
