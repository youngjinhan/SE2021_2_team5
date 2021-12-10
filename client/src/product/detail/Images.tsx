import React, { useState } from "react";
import styles from "./Images.module.scss";
import { Product } from "shared/Product";
import { DocData } from "../../models/meta";
import Grid from "@material-ui/core/Grid";
import { style } from "@material-ui/system";
import { PhotoDialog } from "./phodoDialog/PhotoDialog";
import { ThumbnailSwipper } from "./phodoDialog/ThumbnailSwipper";

export interface Props {
  images: string[];
}

export const ProductImages: React.FC<Props> = (props: Props) => {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  const handleclose = () => {
    setFullscreen(false);
  }

  const handler = (index:number) => {
    setIndex(index);
  }

  return (
    <div className={styles.root}>
      {fullscreen &&
        <PhotoDialog
          images={props.images}
          handler={handleclose}
        />
      }

      <div className={styles.container}>

        <div
          className={styles.bigImgArea}
          onClick={()=>setFullscreen(true)}
        >
          <img src={props.images[index]} className={styles.img} />

          <div className={styles.marginBottom10} />
        </div>

        <div className={styles.thumbnailArea}>
          <div className={styles.marginBottom10}/>
          <ThumbnailSwipper images={props.images} setIndex={handler} index={index} color={"grey"}/>
        </div>
      </div>

    </div>

    // <Grid container direction="column">
    //   <Grid item className={styles.imgContainer}>
    //     <img src={props.product.data.images[index]} className={styles.img} />
    //   </Grid>
    //   <Grid item>
    //     <div className={styles.imgs}>
    //       {props.product.data.images.map((src, i) => {
    //         return (
    //           <div
    //             key={i}
    //             className={styles.imgContainer}
    //             onClick={() => setIndex(i)}
    //           >
    //             <img src={src} className={styles.img} />
    //           </div>
    //         );
    //       })}
    //     </div>
    //   </Grid>
    // </Grid>
  );
};
