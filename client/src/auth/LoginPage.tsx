import React, { useState, useContext } from "react";
import { UserContext } from "./Auth";
import { Link, Redirect, RouteComponentProps } from "react-router-dom";
import styles from "./LoginPage.module.scss";
import qs from "querystring";
import { useFormState } from "react-use-form-state";
import { auth } from "../util/firebase";

import { ThemeProvider } from "@material-ui/styles";
import {
  Container,
  createMuiTheme,
  CssBaseline,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";

import { RedirectDialog } from "../auth/Guards";
import { DialogInfo } from "../models";
import { firebase, firestore } from "../util/firebase";
import {UserData, UserType} from "../models/index"

const theme = createMuiTheme({
  palette: {
  },
});

const useStyles = makeStyles((theme) => ({
  "@global": {
    body: {
      backgroundColor: "#eeeeee",
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(1, 0),
  },
  button: {
    margin: theme.spacing(0, 1, 1),
    marginBottom: "50px",
  },
}));

export interface Props extends RouteComponentProps<{ redirect: string }> {}

interface Fields {
  email: string;
  password1: string;
  password2: string;
  name: string;
}

export const LoginPage: React.FC<Props> = (props: Props) => {
  const classes = useStyles();
  const user = useContext(UserContext).user;
  const [register, setRegister] = useState<boolean>(false);
  const [formState, { password, email, text }] = useFormState<Fields>({
    email: "",
    password1: "",
    password2: "",
    name: "",
  });
  const [userType, setUserType] = useState<UserType>("student");
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUserType(event.target.value as UserType);
  };

  const [rdInfo, setRdInfo] = useState<DialogInfo>();

  if (user) {
    let redirect = qs.parse(props.location.search.substring(1)).redirect;
    if (Array.isArray(redirect)) {
      redirect = redirect[0];
    }
    if (!redirect) {
      redirect = "/";
    }
    return <Redirect to={redirect} />;
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (register) {
      if (formState.values.email.includes("@") === false) {
        alert("이메일 형식이 올바르지 않습니다.");
        return;
      } else if (
        formState.values.password1.length < 6 ||
        formState.values.password2.length < 6
      ) {
        alert("비밀번호가 너무 짧습니다. 6자 이상으로 설정해주세요.");
        return;
      } else if (formState.values.password1 !== formState.values.password2) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      } else if (!formState.values.name){
        alert("사용자 이름이 입력되지 않았습니다.");
        return;
      } else if (!userType){
        alert("사용자 타입이 선택되지 않았습니다.");
        return;
      }

      if (formState.values.password1 !== formState.values.password2) {
        const RdInfoIncorrectPW: DialogInfo = {
          dialogType: "remain",
          redirectUrl: "",
          dialogTitle: "",
          dialogMessage: `비밀번호가 일치하지 않습니다`,
          options: 1,
          button1: "확인",
        };
        (RdInfoIncorrectPW as any).key = "" + Math.random();
        setRdInfo(RdInfoIncorrectPW);
        return;
      }

      /// TODO: 에러 처리
      const cred = await auth.createUserWithEmailAndPassword(
        formState.values.email,
        formState.values.password1
      );
      try {
        const doc = firestore.collection("users").doc(cred.user?.uid);
        const data: UserData = {
          type: userType,
          email: formState.values.email,
          name: formState.values.name,
          createdAt: firebase.firestore.FieldValue.serverTimestamp() as any,
          lastModified: firebase.firestore.FieldValue.serverTimestamp() as any
        };
        await doc.set(data);

        await cred.user!.sendEmailVerification();
      } catch (e: any) {
        if (
          e.code === "auth/invalid-password" ||
          e.code === "auth/wrong-password"
        ) {
          const RdInfoWrongPW: DialogInfo = {
            dialogType: "remain",
            redirectUrl: "",
            dialogTitle: "",
            dialogMessage: `비밀번호가 틀렸습니다`,
            options: 1,
            button1: "확인",
          };
          (RdInfoWrongPW as any).key = "" + Math.random();
          setRdInfo(RdInfoWrongPW);
          return;
        }

        const RdInfoError: DialogInfo = {
          dialogType: "remain",
          redirectUrl: "",
          dialogTitle: "Error",
          dialogMessage: `${e}`,
          options: 1,
          button1: "확인",
        };
        (RdInfoError as any).key = "" + Math.random();
        setRdInfo(RdInfoError);
      }
    } else {
      /// TODO: 에러 처리
      try {
        await auth.signInWithEmailAndPassword(
          formState.values.email,
          formState.values.password1
        );
      } catch (e: any) {
        if (e.code === "auth/invalid-email") {
          const RdInfoEmailType: DialogInfo = {
            dialogType: "remain",
            redirectUrl: "",
            dialogTitle: "",
            dialogMessage: `이메일 형식이 잘못되었습니다`,
            options: 1,
            button1: "확인",
          };
          (RdInfoEmailType as any).key = "" + Math.random();
          setRdInfo(RdInfoEmailType);
          return;
        }
        if (
          e.code === "auth/invalid-password" ||
          e.code === "auth/wrong-password"
        ) {
          const RdInfoIncorrectPW: DialogInfo = {
            dialogType: "remain",
            redirectUrl: "",
            dialogTitle: "",
            dialogMessage: `비밀번호가 틀렸습니다`,
            options: 1,
            button1: "확인",
          };
          (RdInfoIncorrectPW as any).key = "" + Math.random();
          setRdInfo(RdInfoIncorrectPW);
          return;
        }

        const RdInfoError: DialogInfo = {
          dialogType: "remain",
          redirectUrl: "",
          dialogTitle: "Error",
          dialogMessage: `user id not found`,
          options: 1,
          button1: "확인",
        };
        (RdInfoError as any).key = "" + Math.random();
        setRdInfo(RdInfoError);
      }
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      {rdInfo && <RedirectDialog {...rdInfo} />}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className={classes.paper} />
        <form onSubmit={login} className={classes.form}>
          {/* //header// */}
          <h1>SKKU Safety Education</h1>
          {/* header */}
          {/* body */}
          <div className={styles.container}>
            <div className={styles.formContainer}>
              <TextField
                {...email("email")}
                label="이메일"
                margin="normal"
                variant="filled"
                required
                fullWidth
                name="email"
                id="email"
                autoComplete="email"
              />
              <TextField
                {...password("password1")}
                label="비밀번호"
                variant="filled"
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                margin="normal"
              />
              {register && (
                <TextField
                  {...password("password2")}
                  required
                  fullWidth
                  label="비밀번호 확인"
                  margin="normal"
                  variant="filled"
                  autoComplete="current-password"
                />
              )}
              {register && (
                <TextField
                  {...text("name")}
                  required
                  fullWidth
                  label="사용자 이름"
                  margin="normal"
                  variant="filled"
                />
              )}
              {register && 
              <div className={styles.margintop16}></div>
              }
              {register && (
                <Select
                  label="User Type"
                  id="select"
                  required
                  fullWidth
                  variant="filled"
                  value={userType}
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select user type
                  </MenuItem>
                  <MenuItem value={"admin"}>Admin</MenuItem>
                  <MenuItem value={"seller"}>Seller</MenuItem>
                  <MenuItem value={"buyer"}>Buyer</MenuItem>
                </Select>
              )}
            </div>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="로그인 상태 유지"
            />

            <div className={classes.submit}>
              <Button
                variant="contained"
                type="submit"
                className={classes.submit}
                fullWidth
                color="primary"
              >
                {register ? "가입" : "로그인"}
              </Button>
            </div>
            <Grid container>
              <Grid item xs>
                {!register && (
                  <div className={classes.button}>
                    <Button href="/resetPassword" className={classes.button}>
                      비밀번호 찾기
                    </Button>
                  </div>
                )}
              </Grid>
              <Grid item>
                <div className={classes.button}>
                  <Button
                    href="#text-buttons"
                    className={classes.button}
                    // className={classes.submit}
                    onClick={() => setRegister(!register)}
                    tabIndex={-1}
                    type="submit"
                  >
                    {register ? "회원가입 취소" : "회원가입"}
                  </Button>
                </div>
              </Grid>
            </Grid>
            <Divider variant="middle" />
            <Box m={4}><div className={styles.center}>2020-2 Web Project</div></Box>
          </div>
        </form>
      </ThemeProvider>
    </Container>
  );
};
