import React from "react";
import { Switch, Route, RouteComponentProps } from "react-router-dom";
import { ChattingRoomsPage } from "./Rooms";
import { ChattingRoomPage } from "./chat_room/Room";

export interface Props extends RouteComponentProps {}

const App: React.FC<Props> = (props: Props) => {
  return (
    <Switch>
      <Route path={`${props.match.path}`} exact component={ChattingRoomsPage} />

      <Route
        path={`${props.match.path}/:roomId`}
        exact
        component={ChattingRoomPage}
      />
    </Switch>
  );
};

export default App;
