import React, { useState, useEffect, useContext } from "react";
import styles from "./List.module.scss";
import { DocData } from "../models/meta";
import * as querystring from "querystring";
import { Product } from "shared/Product";
import { UserData, WorldData } from "../models";
import { firestore, parseDocs } from "../util/firebase";
import { RouteComponentProps, Link, Redirect } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import { productIndex } from "../util/algolia";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { UserContext } from "../auth/Auth";
import { Time } from "../common/Time";

export interface Props extends RouteComponentProps {}

/**
 * `/product`
 */
export const ClassListPage: React.FC<Props> = (props: Props) => {
  const user = useContext(UserContext).user;
  const loaded = useContext(UserContext).loaded;

  const [classes, setClasses] = useState<DocData<WorldData>[]>();
  const [wip, setWip] = useState(true);
  const [redirect, setRedirect] = useState("");
  const [worlds, setWorlds] = useState<String[]>();
  const [completedWorlds, setCompletedWorlds] = useState<String[]>();

 

  async function load() {
    setWip(true);

    if (!user && !loaded) {
      return;
    }

    if (!user && loaded) {
      alert("Signin Required");
      setRedirect(`/login`);
      return;
    }

    try {
      const userDocRef = firestore.collection("users").doc(user?.fbUser.uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        setRedirect("/login");
        return;
      }

      const userData = userDoc.data() as UserData;
      setWorlds(userData.classes);
      setCompletedWorlds(userData.completedClasses);

      const worldsRef = firestore.collection("worlds");
      const worldCollectionQ = worldsRef.orderBy("dueDate");
      const worldCollection = await worldCollectionQ.get();
      setClasses(parseDocs(worldCollection.docs));
    } finally {
      setWip(false);
    }
  }
  console.log("asdfasdf");
  console.log(classes);

  useEffect(() => {
    load();
  }, [loaded]);

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  if (wip || !loaded) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
      </div>
    );
  }

  if (!classes || wip || !worlds?.length) {
    return (
      <div className={styles.root}>
        <div className={styles.marginBottom10} />
        <div className={styles.row}>
          <h2>강의 목록</h2>
        </div>
        <Grid container direction="row" alignContent="center" justify="center">
          <Grid item>
            {(!classes || wip) && (
              <div className={styles.loading}>
                <CircularProgress />
              </div>
            )}
            {classes && !wip && <Typography>강의가 없습니다</Typography>}
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.marginBottom10} />
      <div className={styles.row}>
        <h2>{`${user?.name}님의 강의 목록`}</h2>
      </div>
      <div>
        {classes &&
          classes.map((classItem: DocData<WorldData>) => {
            console.log(worlds?.includes(classItem.id))
            console.log(worlds, classItem.id)
            if (worlds?.includes(classItem.id)) {
              return (
                <div className={styles.items} key={classItem.id}>
                  <a
                    href={`Vrchat://launch?ref=vrchat.com&id=wrld_58e44637-9916-481e-93e5-2929bacd3bb9`}
                    className={styles.link}
                  >
                    <Card className={styles.card}>
                      <CardContent>
                        <div className={styles.row}>
                          <h1>{classItem.data.name}</h1>
                          <Typography variant="h6">{}</Typography>
                        </div>
                        <div className={styles.row}>
                          <div>
                            <Typography>수강기한</Typography>
                            <Typography>
                              {classItem.data.dueDate.toDate().toString()}
                            </Typography>
                          </div>
                          <Typography variant="h5">
                            {completedWorlds?.includes(classItem.id)
                              ? "수강완료"
                              : "미수강"}
                          </Typography>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};
