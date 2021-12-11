import { firestore, parseDocs } from "../util/firebase";
import React, { useState, useEffect, useContext } from "react";
import { RouteComponentProps, Link } from "react-router-dom";
import { UserContext } from "../auth/Auth";
import styles from "./AdminPage.module.scss";
import { UserData } from "../models";
import { DocData } from "../models/meta";
import {
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { Product } from "shared/Product";

export interface Props extends RouteComponentProps {}

export const AdminPage: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user!;
  const [users, setUsers] = useState<DocData<UserData>[]>();
  const [wip, setWip] = useState<boolean>(true);

  async function load() {
    if (!user) {
      return;
    }
    setWip(true);
    try {
      const ref = firestore.collection("users").orderBy("sid");
      const qs = await ref.get();

      setUsers(parseDocs(qs.docs));
    } finally {
      setWip(false);
    }
  }
  useEffect(() => {
    load();
  }, [user]);

  if (wip) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
      </div>
    );
  }

  if (!users || wip || !Object.keys(users).length) {
    return (
      <div className={styles.root}>
        <div className={styles.marginBottom10} />
        <h2>관리자 페이지</h2>
        <Grid container direction="row" alignContent="center" justify="center">
          <Grid item>
            {(!users || wip) && <CircularProgress></CircularProgress>}
            {users && !wip && (
              <Typography>사용자가 존재하지 않습니다</Typography>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }
  return (
    <div className={styles.root}>
      <div className={styles.marginBottom10} />
      <h2>관리자 페이지</h2>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography align={"left"}>학번</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>이름</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>학과</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>이수현황</Typography>
            </TableCell>

            <TableCell>
              <Typography align={"left"}>수정</Typography>
            </TableCell>

            {/* <TableCell>
              <Typography align={"left"}>status</Typography>
            </TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {users &&
            users.map((suser) => <UserCell user={suser} key={suser.id} />)}
        </TableBody>
      </Table>
    </div>
  );
};

export interface Props1 {
  user: DocData<UserData>;
}

const UserCell: React.FC<Props1> = (props: Props1) => {
  let status = "";
  const user = props.user;
  return (

    <TableRow>
      <TableCell align="left">{user.data.sid}</TableCell>
      <TableCell align="left">{user.data.name}</TableCell>
      <TableCell align="left">{user.data.major}</TableCell>
      <TableCell align="left">{`${user.data.completedClasses.length}/${user.data.classes.length}`}</TableCell>
      <TableCell align="left"><Link to="/">ㅁㄴㅇㄹ</Link></TableCell>
      
    </TableRow>
  );
};
