enchant();
window.onload = function() {
	//TODO サーバーから取得する
	var FIELD_SIZE = 640;
	var game = new Core(FIELD_SIZE, FIELD_SIZE);
	game.fps = 30;

	game.preload("images/chara1.png");

	var socket;
	var userId;
	var userName;

	var player;
	var enemyList = {};

	game.onload = function() {
		game.rootScene.backgroundColor = 'rgb(192, 192, 255)';
		socket = io.connect(location.origin);

		connect();

		socket.on('connect', function(msg) {
			userId = socket.socket.transport.sessid;
			console.log("Connection ID:" + userId + ", Protocol:" + socket.socket.transport.name);
			userName += 'user' + userId;
		});

		socket.on('in', function(data) {
			console.log(JSON.stringify(data.info));
			if (data.info.id === userId) {
				console.log('MyUserId : ' + data.info.id);
				createPlayer(data.info.x, data.info.y);
			}
			createEnemy(data);
		});

		socket.on('out', function(data) {
			console.log(JSON.stringify(data.msg));
			game.rootScene.removeChild(enemyList[data.userId]);
			delete enemyList[data.userId];
		});

		socket.on('cmd', function(data) {
			console.log(JSON.stringify(data));
			if (data.userId !== userId) {
				enemyList[data.userId].x = data.x;
				enemyList[data.userId].y = data.y;
				enemyList[data.userId].frame = this.tick % 3;
				enemyList[data.userId].tick++;
			}
		});
	};
	game.start();

	function createPlayer(x, y) {
		player = new Sprite(32, 32);
		player.image = game.assets["images/chara1.png"];
		game.rootScene.addChild(player);
		player.frame = 0;
		player.x = x;
		player.y = y;
		player.tick = 0;

		player.addEventListener('enterframe', function(e) {
			var keyFlag = false;
			if (game.input.left) {
				this.x -= 4;
				this.frame = this.tick % 3;
				this.tick++;
				keyFlag = true;
			}
			if (game.input.right) {
				this.x += 4;
				this.frame = this.tick % 3;
				this.tick++;
				keyFlag = true;
			}
			if (game.input.up) {
				this.y -= 4;
				this.frame = this.tick % 3;
				this.tick++;
				keyFlag = true;
			}
			if (game.input.down) {
				this.y += 4;
				this.frame = this.tick % 3;
				this.tick++;
				keyFlag = true;
			}
			if (this.frame === 2 && keyFlag) {
				console.log('Send Command!!');
				var cmd = {
					userId : userId,
					x : this.x,
					y : this.y
				};
				sendCommand(cmd);
			}
			if (this.x > FIELD_SIZE)
				this.x = 0;
			else if (this.x < 0)
				this.x = FIELD_SIZE;
			if (this.y > FIELD_SIZE)
				this.y = 0;
			else if (this.y < 0) {
				this.y = FIELD_SIZE;
			}
		}, false);
	}

	function createEnemy(data) {
		for (var pname in data.users) {
			console.log('porperty name : ' + pname);
			if (pname == userId) {
				console.log("Match!");
			} else {
				console.log("NOT Match!");
				console.log('Enemy ID : ' + data.info.id);

				var enemyInfo = data.users[pname];
				var enemy = new Sprite(32, 32);
				enemy.image = game.assets["images/chara1.png"];
				game.rootScene.addChild(enemy);
				enemy.frame = 0;
				enemy.x = enemyInfo.x;
				enemy.y = enemyInfo.y;
				enemy.tick = 0;

				enemyList[pname] = enemy;
			}
		}
	}

	function sendCommand(cmd) {
		socket.emit('cmd', cmd);
	}

	function connect() {
		socket.emit('in', {
			name : userName
		});
	}

	function disconnect() {
		socket.emit('out');
		socket.disconnect();
	}

};
