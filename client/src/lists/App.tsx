import { CircularProgress } from "@material-ui/core";
import React, { useContext } from "react";
import {Switch, RouteComponentProps, Route } from "react-router";
import { UserContext } from "../auth/Auth";
import {WishlistPage} from "./WishlistPage"

export interface Props extends RouteComponentProps {}

/**
 * `/wishlist
 */
const App: React.FC<Props> = (props: Props) => {
  
  return (
    <Switch>
      <Route path={`${props.match.path}`} exact component={WishlistPage} />
    </Switch>
  )
}

export default App;