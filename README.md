### LottoVillage

## 로또빌리지 노드서버


### config/maria.pool.js

var maria = require('mysql'); 
var pool = maria.createPool({
    //밑에 설정 조건들, 다 Default 라서 주석
    //connectionLimit: 10,
    //queueLimit: 0,
    //waitForConnections: true,
    //acquireTimeout: 10000
    host: '서버 아이피 적기',
    user: '디비 아이디적기',
    password: '디비 비밀번호적기',
    database: '디비명 적기'
});
module.exports = pool;
