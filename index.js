/*
* 2017.08.07
* Package.json - Dependencies List
* morgan = 단순한 로거 미들웨어 제공
* compression = 응답 압축
* body-parser = 요청 데이터 처리
* method-override = HTTP 동사 기본 지원 기능 제공 (DELETE, PUT ..)
*/
var express = require(process.cwd() + '/config/express');
var app = express();
app.listen(3000);
module.exports = app;
console.log('Server Running 3000 Port');