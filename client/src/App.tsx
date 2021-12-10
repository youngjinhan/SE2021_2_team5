import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Authenticated } from "./auth/Auth";
import { LoginPage } from "./auth/LoginPage";
import { ActualApp } from "./ActualApp";
import { LogoutPage } from "./auth/LogoutPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Authenticated>
        <Switch>
          <Route path="/login" exact component={LoginPage} />
          <Route path="/logout" component={LogoutPage} />
          {/* <AuthenticatedRoute
            path="/verify/email"
            exact
            component={EmailVerficationPage}
          /> */}

          {/* <AuthenticatedRoute
            path="/verify/phone"
            exact
            component={PhoneVerificationPage}
          /> */}

          {/* <Route path="/logout" exact component={LogoutPage} /> */}

          <ActualApp />
        </Switch>
      </Authenticated>
    </BrowserRouter>
  );
};

export default App;
