import { useState, useEffect, useRef } from "react";
import React from "react";
import styles from "./PhotoDialog.module.scss"
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import { ThumbnailSwipper } from "./ThumbnailSwipper";

export interface Props {
    images: string[];
    handler: any;
}

export const PhotoDialog: React.FC<Props> = (props: Props) => {
    const [open, setOpen] = useState(true);
    const [index, setIndex] = useState(0);
    

    const handler = (i:number) =>{
        setIndex(i);
    }

    const handleClose = () => {
        props.handler();
    }

    return (
        <Dialog
            PaperProps={{
                style: {
                    backgroundColor: "#1e1e1e"
                }
            }}
            fullScreen
            open={open}
            onClose={handleClose}
            aria-labelledby="title"
            aria-describedby="description"
        >
            <DialogContent>
                <div className={styles.root}>

                    <div className={styles.container}>

                        <div
                            className={styles.bigImgArea}
                        >
                            <img src={props.images[index]} className={styles.img} />

                            <div className={styles.marginBottom10} />
                        </div>

                        <div className={styles.thumbnailArea}>
                            <ThumbnailSwipper images={props.images} setIndex={handler} index={index} color={"white"}/>
                        </div>
                    </div>

                    <div className={styles.close}>
                        <IconButton edge="start" onClick={handleClose} aria-label="close">
                            <CloseIcon style={{ fill: "white" }} />
                        </IconButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};