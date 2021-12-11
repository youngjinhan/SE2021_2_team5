import React from "react";
import { Switch, Route } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { ProductListPage } from "./List";
import { ProductDetailPage } from "./detail/Detail";
import { ProductEditorPage } from "./edit/EditPage";
import { NewProductPage } from "./edit/New";
import { VerifiedRoute } from "../auth/Guards";

export interface Props extends RouteComponentProps {}

/**
 * `/products`
 */
const App: React.FC<Props> = (props: Props) => {
  return (
    <Switch>
      <VerifiedRoute path={`${props.match.path}`} exact component={ProductListPage} />

      <VerifiedRoute
        path={`${props.match.path}/new`}
        exact
        component={NewProductPage}
      />

      <Route
        path={`${props.match.path}/:productId/edit`}
        exact
        component={ProductEditorPage}
      />

      <Route
        path={`${props.match.path}/:productId`}
        exact
        component={ProductDetailPage}
      />
    </Switch>
  );
};

export default App;
