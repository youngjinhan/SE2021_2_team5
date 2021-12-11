import {
  CircularProgress,
  Card,
  CardContent,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Button,
} from "@material-ui/core";
import { firebase, firestore } from "../../util/firebase";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps, Redirect, Link } from "react-router-dom";
import { useFormState } from "react-use-form-state";
import { Product, SellTypes } from "shared/Product";
import { UserContext } from "../../auth/Auth";
import { uploadFile } from "../../common/util";
import styles from "./New.module.scss";

interface Fields {
  price: number;
  title: string;
  location: string;
  sellType: string;
  desc: string;
  phonenumber: string;
  images: string[];
}

interface Props extends RouteComponentProps<{ productId: string }> {}

export const ProductEditorPage: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user;
  const loaded = useContext(UserContext).loaded;
  const { productId } = props.match.params;

  const [redirect, setRedirect] = useState("");
  const [wip, setWip] = useState<boolean>(true);
  const [form, { text, number, tel }] = useFormState<Fields>({
    title: "",
    location: "",
    price: 0,
    sellType: "fixed",
    desc: "",
    phonenumber: "",
    images: [],
  });

  const [images, setimages] = useState<string[]>();
  const [thumb, thumbready] = useState(0);
  const [save, setsave] = useState(0);
  let uploadimages: string[] = [];

  if (typeof images !== "undefined") {
    uploadimages = images.slice();
  }

  function deletepic(index: number) {
    if (typeof images !== "undefined") {
      uploadimages = images.slice();
    }
    uploadimages.splice(index, 1);
    setimages(uploadimages);
    form.setField("images", uploadimages);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.target.files) {
      return;
    }
    e.persist();

    let count = e.target.files.length;
    let preimages = uploadimages.length;

    for (let i = 0; i < e.target.files.length; i++) {
      var reader = new FileReader();
      reader.onload = async function (e: any) {
        const image = new Image();
        image.onload = async function (this: any) {
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d")!;
          ctx.drawImage(image, 0, 0);
          var MAX_WIDTH = 800;
          var MAX_HEIGHT = 600;
          var width = this.width;
          var height = this.height;

          if (width > height) {
            if (height > MAX_HEIGHT) {
            } else {
              alert("800X600 크기 이상의 사진을 올려주세요.");
              return;
            }
          } else {
            if (width > MAX_WIDTH) {
            } else {
              alert("800X600 크기 이상의 사진을 올려주세요.");
              return;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image, 0, 0, width, height);

          var dataurl = canvas.toDataURL("image/png");

          const url = await uploadFile(user!, dataURItoBlob(dataurl));
          uploadimages.push(url);
          if (preimages + count === uploadimages.length) {
            form.setField("images", uploadimages);
            setimages(uploadimages);
            thumbready(1);
            setsave(1);
          }
        };
        image.src = e.target!.result;
      };
      reader.readAsDataURL(e.target.files[i]);
    }
  }

  function dataURItoBlob(dataURI: string) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(",")[0].indexOf("base64") >= 0) {
      byteString = atob(dataURI.split(",")[1]);
    } else {
      byteString = unescape(dataURI.split(",")[1]);
    }
    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      return;
    }

    if (!form.values.images.length) {
      alert("이미지를 업로드 해주십시오");
      return;
    }

    setWip(true);
    try {
      const ref = firestore.collection("products").doc(productId);
      const data = {
        title: form.values.title,
        location: form.values.location,
        sellType: form.values.sellType as SellTypes,
        price: parseInt(form.values.price),
        images: form.values.images || [],
        desc: form.values.desc,
        phonenumber: form.values.phonenumber,
        createdAt: firebase.firestore.Timestamp.now(),
      };

      await ref.update(data);
      setRedirect(`/product/${ref.id}`);
    } finally {
      setWip(false);
    }
  }

  async function load() {
    if (!user && !loaded) {
      return;
    }

    if (!user && loaded) {
      alert("접근 권한 없음");
      setRedirect(`/product/${productId}`);
      return;
    }

    const ref = firestore.collection("products").doc(productId);
    const doc = await ref.get();
    if (!doc.exists) {
      setRedirect(`/product/${productId}`);
      return;
    }
    const data: Product = doc.data() as any;

    if (user?.fbUser.uid != data.sellerUid) {
      if (user?.type != "admin") {
        alert("접근 권한 없음");
        setRedirect(`/product/${productId}`);
        return;
      }
    }

    if (data.status != "Available") {{
        alert("거래가 진행된 상품은 수정이 불가능 합니다");
        setRedirect(`/product/${productId}`);
        return;
      }
    }


    form.setField("title", data.title);
    form.setField("location", data.location);
    form.setField("price", data.price);
    form.setField("sellType", data.sellType);
    form.setField("desc", data.desc);
    form.setField("phonenumber", data.phonenumber);
    form.setField("images", data.images);
    setimages(data.images);
    thumbready(1);

    setWip(false);
  }

  useEffect(() => {
    load();
  }, [loaded]);

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  if (wip || !loaded) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <form onSubmit={submit}>
        <div className={styles.marginBottom10} />
        <h2>상품 정보 입력</h2>
        <Card>
          <CardContent>
            <TextField
              {...text("title")}
              fullWidth
              required
              margin="normal"
              label="상품 이름"
            />
            <TextField
              {...text("location")}
              fullWidth
              required
              margin="normal"
              label="거래 장소"
            />
            <TextField
              {...tel("phonenumber")}
              fullWidth
              required
              margin="normal"
              label="연락처"
            />
            <RadioGroup
              value={form.values.sellType}
              aria-label="Type"
              onChange={text("sellType").onChange}
              className={styles.sellType}
            >
              <FormControlLabel
                value="fixed"
                control={<Radio />}
                label="고정 가격"
              />
              <FormControlLabel value="bid" control={<Radio />} label="경매" />
            </RadioGroup>
            {form.values.sellType == "fixed" && (
              <TextField
                {...number("price")}
                fullWidth
                required
                margin="normal"
                label="판매 가격"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">won</InputAdornment>
                  ),
                }}
              />
            )}
            {form.values.sellType == "bid" && (
              <TextField
                {...number("price")}
                fullWidth
                margin="normal"
                label="경매 시작 가격"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">won</InputAdornment>
                  ),
                }}
              />
            )}
          </CardContent>
        </Card>

        <div className={styles.marginBottom10} />

        <Card>
          <CardContent>
            <input
              accept="image/*"
              className={styles.input}
              style={{ display: "none" }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={onFile}
            />
            <label htmlFor="raised-button-file">
              <Button component="span" className={styles.button}>
                Upload
              </Button>
            </label>
            <div className={styles.row}>
              {!!thumb &&
                images &&
                images.map((image, index) => (
                  <div key={index} className={styles.column}>
                    <img
                      src={image}
                      width="100"
                      height="100"
                      onClick={() => deletepic(index)}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className={styles.marginBottom10} />

        <Card>
          <CardContent>
            <TextField
              {...text("desc")}
              fullWidth
              margin="normal"
              label="상세 정보"
              multiline
              rowsMax={20}
            />
          </CardContent>
        </Card>

        <Button fullWidth type="submit" variant="contained">
          상품 수정
        </Button>
      </form>
    </div>
  );
};
