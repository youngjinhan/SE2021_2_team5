import qs from "querystring";
import React, { useEffect, useState } from "react";
import { auth } from "../util/firebase";
import { Redirect, RouteComponentProps } from "react-router";

export interface Props extends RouteComponentProps<{ redirect: string }> {}

export const LogoutPage: React.FC<Props> = (props: Props) => {
  const [redirect, setRedirect] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    auth.signOut().then(() => {
      if (mounted) {
        setRedirect(true);
      }
    });

    return () => {
      mounted = false;
    };
  });

  
  if (redirect) {
    let redirect = qs.parse(props.location.search.substring(1)).redirect;
    if (Array.isArray(redirect)) {
      redirect = redirect[0];
    }
    if (!redirect) {
      redirect = "/";
    }
    return <Redirect to={redirect} />;
  }

  return <div />;
};