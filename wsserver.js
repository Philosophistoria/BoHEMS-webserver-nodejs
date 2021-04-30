const server = require("ws").Server;
const s = new server({ port: 5001 });
let tryable = true;
let current_player = '';
const timeoutlimit = 5; //[s]
let timeclock = 0;//[s]
let intervalID = {};

function connect_with(ws, player_name) {
	timeclock = 0;
	tryable = false;
	ws.playable = true;
	current_player = player_name;
	const retmessage = "connected@" + current_player;
	s.clients.forEach(client => {
		client.send(retmessage);
	});
	ws.send("accepted@" + current_player);
	console.log("Server: accepted");
	intervalID = setInterval(tickUntilTimeout, 1000, ws);
}

function disconnect_off(ws) {
	tryable = true;
	ws.playable = false;
	clearInterval(intervalID);
	const retmessage = "disconnected@" + current_player;
	s.clients.forEach(client => {
		client.send(retmessage);
	});
	console.log("Server: " + retmessage);
	current_player = '';
}

function tickUntilTimeout(ws) {
	const retmessage = "time:" + (timeoutlimit - timeclock) + '@' + current_player;
	s.clients.forEach(client => {
		client.send(retmessage);
	});
	if (timeclock == timeoutlimit) {
		disconnect_off(ws);
	}
	timeclock++;
}

s.on("connection", ws => {
	ws.playable = false;
	ws.on("message", message => {
		console.log("Received: " + message);

		if (message === "ping") {
			ws.send("pong");
		}
		else if (message.match("Can I try?")) {
			if (tryable) {
				connect_with(ws, message.split('>')[0])
			}
			else{
				ws.send("rejected@" + current_player);
				console.log("Server: rejected");
			}
		}
		else if (message === "disconnect") {
			if (ws.playable) {
				disconnect_off(ws);
			}
		}
		else if (message.match("start")) {
			if (ws.playable) {
				const retmessage = message + "@" + current_player;
				console.log("Server: " + retmessage);
				s.clients.forEach(client => {
					client.send(retmessage);
				});
			}
		}
		else if (message.match("stop")) {
			if (ws.playable) {
				const retmessage = message + "@" + current_player;
				console.log("Server: " + retmessage);
				s.clients.forEach(client => {
					client.send(retmessage);
				});
			}
		}
		else {
			ws.send("echo back: " + message);
			console.log("echo back: " + message);
		}
	});
});

console.log("wating at port:5001");