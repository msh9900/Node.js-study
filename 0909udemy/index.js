const express = require("express");
const app = express();
const path = require("path");
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(PORT, () => {
  console.log(PORT + "번포트 실행");
});
