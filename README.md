LottoVillage - 로또빌리지 노드서버
============

config/maria.pool.js
-----------------
<pre><code>
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
    database: '디비명 적기',
    //2017.08.20
    //mysql connection pool 공홈 참고해봤는데 뭔가 이상하다.
    //local 이 default 라는데, Z값이나 +00:10 이런거하면 제대로안먹히고
    //아래와 같이 +0000 = +HHMM 해야 타임존이 yyyy-mm-dd hh:mm:ss 이렇게 나오는데 또 값이 플러스가 안됨
    //일단은 원하는형식으로 나오길래 아래와 같이 해놓음
    timezone:+0001
});
module.exports = pool;
</code></pre>
