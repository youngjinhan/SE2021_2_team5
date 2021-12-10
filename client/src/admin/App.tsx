import React, { useContext } from "react";
import { UserContext } from "../auth/Auth"
import CircularProgress from "@material-ui/core/CircularProgress";
import { Switch, Route, RouteComponentProps } from "react-router";
import { AdminPage } from "./AdminPage";


export interface Props extends RouteComponentProps {}

const AdminApp: React.FC<Props> = (props: Props) => {
  const loaded = useContext(UserContext).loaded;

  if(!loaded){
    return (
      <CircularProgress/>
    )
  }

  return (
    <Switch>
      <Route path={`${props.match.path}`} exact component={AdminPage} />
    </Switch>
  );

};

export default AdminApp;
