var express = require('express'),
    //morgan = require('morgan'),
    //compression = require('compression'),
    //bodyParser = require('body-parser'),
    //methodOverride = require('method-override'),
    expressSession = require('express-session');

module.exports = function () {
    var app = express();

    /*if (process.env.NODE_DEV === 'development'){
        app.use(morgan('dev'));
    } else if (process.env.NODE_DEV === 'production'){
        app.use(compression());
    }*/

    /*app.use(bodyParser.urlencoded({
        extended: true
    }));*/

    //app.use(bodyParser.json());

    //app.use(methodOverride());

    app.use(expressSession({
        saveUninitialized: true,
        resave: true,
        secret: 'developmentSessionSecret'
    }));

    app.set('views', process.cwd() + '/app/views');
    app.set('view engine', 'ejs');

    require(process.cwd() + '/app/routes/index.server.route')(app);
    require(process.cwd() + '/app/routes/user.server.route')(app);

    app.use(express.static(process.cwd() + '/public'));
    return app;
};