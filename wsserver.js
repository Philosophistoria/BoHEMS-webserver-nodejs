const server = require("ws").Server;
const s = new server({ port: 5001 });
let tryable = true;
let current_player = { name: '', ws: {} };
const timeoutlimit = 60; //[s]
let timeclock = 0;//[s]
let intervalID = {};

function connect_to(ws, player_name) {
	timeclock = 0;
	tryable = false;
	ws.playable = true;
	current_player.name += player_name;
	current_player.name = current_player.name.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0,10);
	current_player.ws = ws;
	const retmessage = "connected@" + current_player.name;
	s.clients.forEach(client => {
		client.send(retmessage);
	});
	ws.send("accepted@" + current_player.name);
	console.log("Server: accepted");
	intervalID = setInterval(tickUntilTimeout, 1000, ws);
}

function disconnect_off(ws) {
	tryable = true;
	ws.playable = false;
	clearInterval(intervalID);
	const retmessage = "disconnected@" + current_player.name;
	s.clients.forEach(client => {
		client.send(retmessage);
	});
	console.log("Server: " + retmessage);
	current_player.name = '';
	current_player.ws = {};
}

function tickUntilTimeout(ws) {
	const retmessage = "time:" + (timeoutlimit - timeclock) + '@' + current_player.name;
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
	ws.on("close", () => {
		if (ws.playable) {
			disconnect_off(ws);
		}
	});
	ws.on("message", message => {
		console.log("Received: " + message);

		if (message === "ping") {
			ws.send("pong");
		}
		else if (message.match("Can I try?")) {
			const name = message.split('>')[0];
			if (name.match('admin%')) {
				if (name.split('%')[1] == "dismiss") {
					disconnect_off(current_player.ws);
				}
			}
			else if (tryable) {
				connect_to(ws, name)
			}
			else{
				ws.send("rejected@" + current_player.name);
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
				const retmessage = message + "@" + current_player.name;
				console.log("Server: " + retmessage);
				s.clients.forEach(client => {
					client.send(retmessage);
				});
			}
		}
		else if (message.match("stop")) {
			if (ws.playable) {
				const retmessage = message + "@" + current_player.name;
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