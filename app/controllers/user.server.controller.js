exports.render = function (req, res) {
    if (req.session.visit) {
        req.session.lastVisit = req.session.visit;
        req.session.visit = new Date();
    }

    req.session.visit = new Date();
    console.log('접속시간 : ' + req.session.visit);

    if (req.session.lastVisit !== undefined) {
        console.log('마지막접속시간 : ' + req.session.lastVisit)
    }

    var pool = require('../../config/maria.pool');
    pool.getConnection(function (err, connection) {
        connection.query({
                sql: 'SELECT PHONE_NO \
                  FROM USER_INFO \
                  WHERE PHONE_NO LIKE ?',
                timeout: 40000
            },
            ['%010%'],
            function (error, results, columns) {
                connection.release();

                if (error) throw error;

                console.log(JSON.stringify(results))

                res.render('index', {
                    title: JSON.stringify(results)
                });
            });
    });
};