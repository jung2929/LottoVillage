exports.login = function (req, res) {
    if (req.session.visit) {
        req.session.lastVisit = req.session.visit;
        req.session.visit = new Date();
    }

    req.session.visit = new Date();
    console.log('접속시간 : ' + req.session.visit);

    if (req.session.lastVisit !== undefined) {
        console.log('마지막접속시간 : ' + req.session.lastVisit)
    }

    var pool = require(process.cwd() + '/config/maria.pool');
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

                //console.log(JSON.stringify(results));
                console.log("{isSuccess : true}");

                //res.json(results);
                res.json({isSuccess:true});
                //res.send(JSON.stringify(results))
                /*res.render('index', {
                    title: JSON.stringify(results)
                });*/
            });
    });
};

exports.logout = function (req, res) {
    console.log(req.session.visit);
    if (req.session.visit === undefined) {
        res.redirect('/');
        return;
    }
    res.json({isSuccess:true});
};

exports.register = function (req, res) {
    console.log(req.body);

    res.render('index', {
        title: "회원가입"
    });
};