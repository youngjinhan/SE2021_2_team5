import { useState, useEffect, useRef } from "react";
import React from "react";
import styles from "./ThumbnailSwipper.module.scss";
import { IconButton } from "@material-ui/core";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

export interface Props {
  images: string[];
  setIndex: any;
  index: number;
  color: string;
}

export const ThumbnailSwipper: React.FC<Props> = (props: Props) => {
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [isOverflow, setIsOverflow] = useState(false);
  const [loaded, setLoaded] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<Array<HTMLDivElement | null>>([]);

  async function setOverflow() {
    console.log(loaded);
    if (containerRef.current) {
      if (containerRef.current.clientWidth < containerRef.current.scrollWidth) {
        setIsOverflow(true);
      }
    }
  }

  function scrollRight() {
    if (containerRef.current && imgRefs.current[0] && imgRefs.current[1]) {
      const width = containerRef.current.clientWidth;
      const imgWidth =
        imgRefs.current[1].offsetLeft - imgRefs.current[0].offsetLeft;
      const maxView = Math.floor(width / imgWidth);
      let nextView = thumbnailIndex + maxView;
      if (nextView < props.images.length) {
        setThumbnailIndex(nextView);
        containerRef.current.scrollTo({
          left:
            imgRefs.current[nextView]!.offsetLeft -
            imgRefs.current[0].offsetLeft,
          behavior: "smooth"
        });
        props.setIndex(nextView);
      } else {
        setThumbnailIndex(props.images.length - 1);
        containerRef.current.scrollTo({
          left:
            imgRefs.current[props.images.length - 1]!.offsetLeft -
            imgRefs.current[0].offsetLeft,
          behavior: "smooth"
        });
        props.setIndex(props.images.length - 1);
      }
    }
  }

  function scrollLeft() {
    if (containerRef.current && imgRefs.current[0] && imgRefs.current[1]) {
      const width = containerRef.current.clientWidth;
      const imgWidth =
        imgRefs.current[1].offsetLeft - imgRefs.current[0].offsetLeft;
      const maxView = Math.floor(width / imgWidth);
      let nextView = thumbnailIndex - maxView;
      if (nextView >= 0) {
        setThumbnailIndex(nextView);
        containerRef.current.scrollTo({
          left:
            imgRefs.current[nextView]!.offsetLeft -
            imgRefs.current[0].offsetLeft,
          behavior: "smooth"
        });
        props.setIndex(nextView);
      } else {
        setThumbnailIndex(0);
        containerRef.current.scrollTo({
          left: imgRefs.current[0]!.offsetLeft - imgRefs.current[0].offsetLeft,
          behavior: "smooth"
        });
        props.setIndex(0);
      }
    }
  }

  useEffect(() => {
    setOverflow();
  }, [loaded]);

  return (
    <div className={styles.root}>
      {isOverflow && (
        <div className={styles.test}>
          <IconButton onClick={() => scrollLeft()}>
            <NavigateBeforeIcon
              style={{ fill: props.color, alignSelf: "center" }}
            />
          </IconButton>
        </div>
      )}

      <div className={styles.thumbnailWrapper} ref={containerRef}>
        {props.images.map((src, i) => {
          return (
            <div
              key={i}
              className={styles.imgContainer}
              ref={ref => (imgRefs.current[i] = ref)}
              onClick={() => props.setIndex(i)}
              onLoad={() => setLoaded(prev => prev + 1)}
            >
              <img
                src={src}
                className={cx("img2", {
                  active: props.index == i,
                  white: props.color == "white",
                  grey: props.color == "grey"
                })}
              />
            </div>
          );
        })}
      </div>

      {isOverflow && (
        <div className={styles.test}>
          <IconButton onClick={() => scrollRight()}>
            <div className={styles.marginLeft10} />
            <NavigateNextIcon style={{ fill: props.color }} />
          </IconButton>
        </div>
      )}
    </div>
  );
};
