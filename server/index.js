const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const studentRoutes = require("./routes/student-routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.use("/api", studentRoutes.routes);

app.get("/", (req, res) => {
  res.render("index", {});
});

app.get("/myPage", (req, res) => {
  res.render("myPage", {});
});

app.listen(port, () => {
  console.log(`server is listening at localhost:${port}`);
});
