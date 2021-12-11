import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { VerifiedRoute } from "./auth/Guards";
import { Route, Switch, Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import { Header } from "./site/Header";
import styles from "./ActualApp.module.scss";

import UserApp from "./user/App";
import AdminApp from "./admin/App";
import ProductApp from "./product/App";
import WishlistApp from "./lists/App";
import {SellerList} from "./lists/SellerList";
import {ShoppingList} from "./lists/ShoppingList";
import ClassesAPP from "./classes/App"


const Main = React.memo(() => {
  return (
    <main className={styles.root}>
      <Switch>
        {/* <Route path="/" exact component={HomePage} /> */}

        <Route path="/user" component={UserApp} />

        {/* <Route path="/chatting" component={ChattingApp} /> */}

        <Route path="/product" component={ProductApp} />
        <VerifiedRoute path="/classes" component={ClassesAPP}/>
        <VerifiedRoute path="/wishlist" component={WishlistApp}/>
        <Route path="/sellerlist/:sellerUid" component={SellerList}/>
        <VerifiedRoute path="/shoppinglist" component={ShoppingList}/>


        <VerifiedRoute path="/admin" needAdmin component={AdminApp} />

      </Switch>
    </main>
  );
});

export const ActualApp = React.memo(() => {
  // const user = useContext(UserContext).user;

  return (
    <div>
      <CssBaseline />
      <Header />
      <Grid
        container
        direction="row"
        justify="center"
        className={styles.content}
      >
        <Grid item xs={12} sm={8} md={8} lg={8} xl={6}>
          <Main />
        </Grid>
      </Grid>

    </div>
  );
});
