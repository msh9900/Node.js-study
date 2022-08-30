const express = require('express');
const app = express();
const port = 5500;


app.use(express.urlencoded({extended : true}));

app.listen(port, function(){
    console.log("5500 포트 오픈");
});

app.get('/pet', function(req, res){
    res.send('펫쇼핑할 수 있는 사이트입니다.');
});
app.get('/beauty', function(req, res){
    res.send('뷰티용품 사세요.');
});
app.get('/', function(req, res){
    res.sendFile(__dirname +'/index.html');
});
app.get('/write', function(req, res){
    res.sendFile(__dirname +'/write.html');
});
app.post('/add', function(req, res){
    res.send('전송완료');
    console.log(req.body);
})