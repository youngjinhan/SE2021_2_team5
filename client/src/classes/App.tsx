import React from "react";
import { Switch, Route } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { ClassListPage } from "./List";
import { VerifiedRoute } from "../auth/Guards";

export interface Props extends RouteComponentProps {}

/**
 * `/classes`
 */
const App: React.FC<Props> = (props: Props) => {
  return (
    <Switch>
      <VerifiedRoute
        path={`${props.match.path}`}
        exact
        component={ClassListPage}
      />
    </Switch>
  );
};

export default App;
