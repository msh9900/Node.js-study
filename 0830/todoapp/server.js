const express = require("express");
const app = express();
const port = 5500;
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

app.use('/public', express.static('public'));

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

app.get("/pet", function (req, res) {
  res.send("펫쇼핑할 수 있는 사이트입니다.");
});
app.get("/beauty", function (req, res) {
  res.send("뷰티용품 사세요.");
});
app.get("/", function (req, res) {
  res.render('index.ejs');
});
app.get("/write", function (req, res) {
    res.render('write.ejs');

});
app.post("/add", function (req, res) {
  res.send("전송완료");
  db.collection("counter").findOne({ name: "게시물갯수" },function (err, result) {
      console.log(result.totalPost);
      let tP = result.totalPost;
      db.collection("post").insertOne(
        { _id: tP + 1, 이름: req.body.title, 나이: req.body.date },
        function (err, result) {
          console.log("저장완료");
          db.collection("counter").updateOne({ name: "게시물갯수" },{ $inc: { totalPost: 1 } },function (err, result) {
              if (err) {
                return console.log(err);
              }
            }
          );
        }
      );
    }
  );

  console.log(req.body);
});
app.get("/list", function (req, res) {
  db.collection("post").find().toArray(function (err, result) {
      console.log(result);
      res.render("list.ejs", { posts: result });
    });
});

app.delete('/delete', function(req,res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function(err, result){
        console.log('삭제완료');
        res.status(200).send({message: '성공했습니다'});
    });
})

app.get('/detail/:id',function(req,res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err,result){
        console.log(result);
        res.render('detail.ejs', { data : result})

    })

})