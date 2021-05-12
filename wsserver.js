const server = require("ws").Server;
const s = new server({ port: 5001 });
let tryable = true;
let current_player = { name: '', ws: {} };
const timeoutlimit = 60; //[s]
let timeclock = 0;//[s]
let intervalID = {};

function send_response(arg_ws, arg_res, arg_opt, arg_name) {
	arg_ws.send(JSON.stringify({
		response: arg_res,
		option: arg_opt,
		name: arg_name
	}));
}
function broadcast_all(arg_res, arg_opt, arg_name) {
	s.clients.forEach(client => {
		send_response(client, arg_res, arg_opt, arg_name);
	});
}
function connect_to(ws, player_name) {
	tryable = false;
	ws.playable = true;
	current_player.name += player_name;
	console.log(current_player.name);
	current_player.name = current_player.name.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0,10);
	console.log(current_player.name);
	current_player.ws = ws;
	broadcast_all("connected", undefined, current_player.name)
	send_response(ws, "accepted", undefined, current_player.name);
	console.log("Server: accepted");
	timeclock = 0;
	intervalID = setInterval(tickUntilTimeout, 1000, ws);
}

function disconnect_off(ws) {
	tryable = true;
	ws.playable = false;
	clearInterval(intervalID);
	s.clients.forEach(client => {
		send_response(client,"disconnected",undefined,current_player.name)
	});
	console.log("Server: disconnected");
	current_player.name = '';
	current_player.ws = {};
}

function tickUntilTimeout(ws) {
	s.clients.forEach(client => {
		send_response(client, "time", (timeoutlimit - timeclock), current_player.name);
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
	ws.on("message", payload => {
		let payload_type = undefined;
		let message = {};
		// parse payload
		// A json type message is supposed to contain
		// - request: {"Can I try?", "disconnect", "start", "stop"},
		// - option : {1,2,3,4}; these are opted when "start" is requested,
		// - name : name who requests
		try {
			payload_type = 'JSON';
			message = JSON.parse(payload);
		} catch (e) {
			if (typeof (payload) === String) {
				payload_type = 'String';
				message = payload;
			}
		} finally {
			console.log("Received: " + payload);
		}

		// respons
		// a json message to be sent from thins server should support:
		// - respons: respons to the request
		// - option: this is used when broadcasting which one is "start"ed
		// - name: destination or who occrurs the issues.
		if (payload_type == 'String') {
			ws.send("echo back: " + message);
			console.log("echo back: " + message);
		}
		else if (payload_type == 'JSON') {
			if (message.request == "Can I try?") {
				if (message.name.match("admin_command") && message.name.split('%')[1] == 'dismiss') {
					disconnect_off(current_player.ws);
				}
				else if (tryable) {
					connect_to(ws, message.name)
				}
				else {
					send_response(ws, "rejected", undefined, current_player.name)
					console.log("Server: rejected");
				}
			}
			else if (message.request == "disconnect") {
				if (ws.playable) {
					disconnect_off(ws);
				}
			}
			else if (message.request == "start" || message.request == 'stop') {
				if (ws.playable) {
					broadcast_all(message.request, message.option, message.name);
					console.log("Server conducts: " + message);
				}
			}

		}
	});
});

console.log("wating at port:5001");