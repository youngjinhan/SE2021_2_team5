import React from "react";
import styles from "./Progress.module.scss";
import CircularProgress from "@material-ui/core/CircularProgress";

export const Progress: React.FC = () => {
  return (
    <div className={styles.root}>
      <CircularProgress />
    </div>
  );
};
