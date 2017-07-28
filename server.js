var express = require('express');
var app = express();

app.use(express.static('./'));

app.listen(4002, function () {
  console.log('server is running at localhost:4002');
})