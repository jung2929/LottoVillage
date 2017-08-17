var express = require(process.cwd() + '/config/express');
var app = express();
app.listen(3000);
module.exports = app;
console.log('Server Running 3000 Port');