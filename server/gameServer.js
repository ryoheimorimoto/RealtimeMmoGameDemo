function gameServer(spec, my) {

	var WIDTH = 1000;
	var HEIGHT = 1000;

	var app = spec.httpServer;
	var logLevel = spec.logLevel || 1;
	var io = require('socket.io').listen(app, {
		'log level' : logLevel
	});

	var users = {};

	io.sockets.on('connection', function(socket) {

		socket.on('in', function(data) {
			var msgText = data.name + " just joined!";
			var iniX = Math.floor(Math.random() * WIDTH);
			var iniY = Math.floor(Math.random() * HEIGHT);

			var userInfo = {
				x : iniX,
				y : iniY,
				name : data.name,
				id : socket.id
			};

			users[socket.id] = userInfo;

			io.sockets.emit("in", {
				msg : msgText,
				info : userInfo,
				users : users
			});
		});

		socket.on('cmd', function(data) {
			var userId = data.userId;
			users[userId].x = data.x;
			users[userId].y = data.y;

			io.sockets.emit('cmd', data);
		});

		socket.on('disconnect', function(data) {
			if (users[socket.id]) {
				var userInfo = users[socket.id];
				var msgText = userInfo.name + " defected (T_T)";
				delete users[socket.id];
				io.sockets.emit("out", {
					msg : msgText,
					userId : socket.id
				});
			}
		});
	});

	return io;
};
module.exports = gameServer;
