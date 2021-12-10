import React, { useState, useEffect, useCallback, useContext } from "react";
import { Redirect, Route, RouteProps } from "react-router";
import { UserContext } from "./Auth";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import qs from "querystring";
import { DialogInfo } from "../models/index";
import { CircularProgress } from "@material-ui/core";
import styles from "./Guards.module.scss"

export interface SimpleProps extends RouteProps {}

export interface Props extends SimpleProps {
  needAdmin?: boolean;
}

/**
 * 미인증 외부인 사용자가 새 글 작성 페이지에 접근하려고 할 때 뜨는 Dialog입니다.
 */
export const RedirectDialog = (rdInfo: DialogInfo) => {
  const [open, setOpen] = useState(true);
  const [redirect, setRedirect] = useState<string>("");
  //eslint-disable-next-line
  let currentUrl = encodeURIComponent(
    //eslint-disable-next-line
    location.pathname
  );
  const handleClose = useCallback(() => {
    switch (rdInfo.dialogType) {
      case "proceed": {
        setOpen(false);
        //eslint-disable-next-line
        currentUrl = location.pathname;
        setRedirect(`${currentUrl}?proceed=1`);
        break;
      }
      case "remain": {
        setOpen(false);
        //setRedirect(`${currentUrl}`);
        break;
      }
      case "redirect": {
        setOpen(false);
        setRedirect(rdInfo.redirectUrl);
        break;
      }
    }
  }, [rdInfo.dialogType, currentUrl, rdInfo.redirectUrl]);

  useEffect(() => {
    if (rdInfo.timeout) {
      setTimeout(() => {
        handleClose();
      }, rdInfo.timeout);
    }
  }, [rdInfo.timeout, handleClose]);

  function handleRedirect() {
    setOpen(false);
    setRedirect(rdInfo.redirectUrl);
  }

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  switch (rdInfo.options) {
    case 1: {
      if (rdInfo.dialogType === "remain") {
        return (
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="title"
            aria-describedby="description"
          >
            <DialogTitle id="title">{rdInfo.dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText id="description">
                {rdInfo.dialogMessage}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                {rdInfo.button1}
              </Button>
            </DialogActions>
          </Dialog>
        );
      } else {
        return (
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="title"
            aria-describedby="description"
          >
            <DialogTitle id="title">{rdInfo.dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText id="description">
                {rdInfo.dialogMessage}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRedirect} color="primary">
                {rdInfo.button1}
              </Button>
            </DialogActions>
          </Dialog>
        );
      }
    }
    case 2: {
      return (
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="title"
          aria-describedby="description"
        >
          <DialogTitle id="title">{rdInfo.dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="description">
              {rdInfo.dialogMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRedirect} color="primary">
              {rdInfo.button1}
            </Button>
            <Button onClick={handleClose} color="primary">
              {rdInfo.button2}
            </Button>
          </DialogActions>
        </Dialog>
      );
    }
    default: {
      return null;
    }
  }
};

/**
 * 로그인한 사용자만 접근할 수 있게 하는 Route입니다.
 */
export const AuthenticatedRoute: React.FC<SimpleProps> = (
  props: SimpleProps
) => {
  const user = useContext(UserContext).user;

  if (!user) {
    const to = `/login?redirect=${encodeURIComponent(
      //eslint-disable-next-line
      location.pathname
    )}`;

    return <Redirect to={to} />;
  }

  return <Route {...props} />;
};

/**
 * 인증한 사용자만 접근할 수 있게 하는 Route입니다.
 * 위의 인증은 성대생의 경우 이메일 인증, 외부인의 경우에 휴대폰 인증을 의미합니다.
 */
export const VerifiedRoute: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user;
  const loaded = useContext(UserContext).loaded;

  if(!loaded){
    return (
      <div className={styles.loading}>
        <CircularProgress/>
      </div>
    )
  }

  // const { needAdmin = false } = props;
  if (props.needAdmin) {

    if (!user && loaded) {
      const to = `/login?redirect=${encodeURIComponent(
        //eslint-disable-next-line
        location.pathname
      )}`;

      return <Redirect to={to} />;
    }

    if (user?.type != "admin" && loaded) {
      return <Redirect to="/" />;
    }
  }

  if (!user && loaded) {
    const to = `/login?redirect=${encodeURIComponent(
      //eslint-disable-next-line
      location.pathname
    )}`;

    return <Redirect to={to} />;
  }

  return <Route {...props} />;
};
