import MenuIcon from "@material-ui/icons/Menu";
import React, { useState, useRef, useContext } from "react";
import Typography from "@material-ui/core/Typography";
import { useFormState } from "react-use-form-state";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import InputBase from "@material-ui/core/InputBase";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import {
  createStyles,
  fade,
  Theme,
  makeStyles,
} from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import {
  Avatar,
  Divider,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { UserContext } from "../auth/Auth";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      display: "none",
      [theme.breakpoints.up("sm")]: {
        display: "block",
      },
    },
    search: {
      position: "relative",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      "&:hover": {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(1),
        width: "auto",
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: "100%",
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    inputRoot: {
      color: "inherit",
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        width: 120,
        "&:focus": {
          width: 200,
        },
      },
    },
    list: {
      width: 250,
    },
    fullList: {
      width: "auto",
    },
  })
);

export const Header: React.FC = () => {
  const user = useContext(UserContext).user;
  const classes = useStyles();
  const [state, setState] = useState<boolean>(false);
  const [redirect, setRedirect] = useState("");

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      console.log(open);

      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setState(open);
      console.log(open);
    };

  function setrdir(dest: string) {
    let to = `/${dest}?redirect=${encodeURIComponent(
      //eslint-disable-next-line
      location.pathname
    )}`;
    setRedirect(to);
  }
  const profile = (
    <ListItem>
      <ListItemAvatar>
        <Avatar>
          <AccountCircleIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={user?.name} secondary={user?.type} />
    </ListItem>
  );

  const signin = (
    <ListItem
      button
      onClick={() => {
        setrdir("login");
      }}
    >
      <ListItemAvatar>
        <Avatar>
          <AccountCircleIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={"login"} secondary={"click to login"} />
    </ListItem>
  );

  const list = () => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {user && profile}
      {!user && signin}
      <Divider />
      <List>
        <ListItem button component="a" href="/product" key="products">
          <ListItemText primary={"products"} />
        </ListItem>
        <ListItem button component="a" href="/search" key="search">
          <ListItemText primary={"search"} />
        </ListItem>
        <ListItem button component="a" href="/wishlist" key="wish list">
          <ListItemText primary={"wish list"} />
        </ListItem>
        <ListItem button component="a" href="/shoppinglist" key="history">
          <ListItemText primary={"shopping list"} />
        </ListItem>
        {user?.type == "admin" && (
          <ListItem button component="a" href="/admin" key="admin">
            <ListItemText primary={"admin"} />
          </ListItem>
        )}
        {(user?.type == "admin" || user?.type == "student") && (
          <ListItem
            button
            component="a"
            href={`/sellerlist/${user.fbUser.uid}`}
            key="sellerlist"
          >
            <ListItemText primary={"my products"} />
          </ListItem>
        )}
        {user && (
          <ListItem
            button
            onClick={() => {
              setrdir("logout");
            }}
            key="logout"
          >
            <ListItemText primary={"logout"} />
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <React.Fragment>
      {redirect && <Redirect to={redirect} />}
      <AppBar>
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            onClick={toggleDrawer(true)}
            edge="start"
            className={classes.menuButton}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>

          <Typography className={classes.title} noWrap>
            <Link href="/product/" color="inherit" variant="h6">
              SKKU Safety Education
            </Link>
          </Typography>
          <SearchBar />
        </Toolbar>
      </AppBar>
      <Drawer open={state} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </React.Fragment>
  );
};

interface SearchField {
  query: string;
}

const SearchBar = () => {
  const classes = useStyles();
  const [form, { text }] = useFormState<SearchField>({ query: "" });
  const [redirect, setRedirect] = useState("");
  const inputRef = useRef<HTMLInputElement>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!form.values.query) {
      return;
    }

    setRedirect(`/product?q=${form.values.query}`);
    if (inputRef.current) {
      inputRef.current!.blur();
    }
  }

  return (
    <form className={classes.search} onSubmit={submit}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        {...text("query")}
        placeholder="검색..."
        inputRef={inputRef}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
      />
      {redirect && <Redirect to={redirect} />}
    </form>
  );
};
