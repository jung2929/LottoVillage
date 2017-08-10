exports.render = function(req, res){
	/*if (req.session.visit){
		req.session.lastVisit = req.session.visit;
		req.session.visit = new Date();
	}

	req.session.visit = new Date();
	console.log('접속시간 : ' + req.session.visit);

	if (req.session.lastVisit !== undefined) {
		console.log('마지막접속시간 : ' + req.session.lastVisit)
	}*/

	res.render('index', {
		title: 'Hello EJS World'
	})
};