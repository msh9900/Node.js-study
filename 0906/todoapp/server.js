const express = require("express");
const app = express();
const port = 5500;
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.set("view engine", "ejs");

app.use("/public", express.static("public"));

let db;
MongoClient.connect(
  "mongodb+srv://root:root@cluster0.rqpf5kr.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);

    db = client.db("todoapp");

    app.listen(port, function () {
      console.log("5500 포트 오픈");
    });
  }
);

app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("index.ejs");
});
app.get("/write", function (req, res) {
  res.render("write.ejs");
});

app.get("/list", function (req, res) {
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      console.log(result);
      res.render("list.ejs", { posts: result });
    });
});

app.get("/search", function (req, res) {
  console.log(req.query.value);
  var searchReq = [
    {
      $search: {
        index: "nameSearch",
        text: {
          query: req.query.value,
          path: "이름", // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        },
      },
    },
    { $project: { 이름: 1, _id: 0, score: { $meta: "searchScore" } } },
    // { $sort: { _id: 1 } },
    // { $limit: 2 },
  ];
  if (!req.query.value) {
    db.collection("post")
      .find()
      .toArray(function (err, result) {
        console.log(result);
        res.render("search.ejs", { posts: result });
      });
  } else {
    db.collection("post")
      .aggregate(searchReq)
      .toArray(function (err, result) {
        console.log(result);
        res.render("search.ejs", { posts: result });
      });
  }
});

app.delete("/delete", function (req, res) {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, function (err, result) {
    console.log("삭제완료");
    res.status(200).send({ message: "성공했습니다" });
  });
});

app.get("/detail/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      console.log(result);
      res.render("detail.ejs", { data: result });
    }
  );
});

app.get("/edit/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      console.log(result);
      res.render("edit.ejs", { post: result });
    }
  );
});

app.put("/edit", (req, res) => {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { 이름: req.body.title, 나이: req.body.date } },
    (err, result) => {
      console.log(result);
      res.redirect("/list");
    }
  );
});
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne(
        { id: 입력한아이디 },
        function (err, result) {
          if (err) return done(err);
          if (!result)
            return done(null, false, { message: "존재하지않는 아이디요" });
          if (입력한비번 == result.pw) {
            return done(null, result);
          } else {
            return done(null, false, { message: "비번틀렸어요" });
          }
        }
      );
    }
  )
);

app.get("/mypage", logincheck, (req, res) => {
  console.log(req.user);
  res.render("mypage.ejs", { user: req.user });
});

function logincheck(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인을 안하셨음");
  }
}
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});
app.post("/signup", (req, res) => {
  console.log(req.body);
  db.collection("login").insertOne({ id: req.body.id, pw: req.body.pw });
  res.redirect("/login");
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((아이디, done) => {
  db.collection("login").findOne({ id: 아이디 }, (err, result) => {
    done(null, result);
  });
});

app.post("/register", function (req, res) {
  db.collection("login").insertOne(
    { id: req.body.id, pw: req.body.pw },
    function (err, result) {
      res.redirect("/");
    }
  );
});

app.post("/add", function (req, res) {
  res.send("전송완료");
  db.collection("counter").findOne(
    { name: "게시물갯수" },
    function (err, result) {
      console.log(result.totalPost);
      let tP = result.totalPost;

      let 저장할거 = {
        _id: tP + 1,
        이름: req.body.title,
        나이: req.body.date,
        작성자: req.user._id,
      };
      db.collection("post").insertOne(저장할거, function (err, result) {
        console.log("저장완료");
        db.collection("counter").updateOne(
          { name: "게시물갯수" },
          { $inc: { totalPost: 1 } },
          function (err, result) {
            if (err) {
              return console.log(err);
            }
          }
        );
      });
    }
  );

  console.log(req.body);
});
