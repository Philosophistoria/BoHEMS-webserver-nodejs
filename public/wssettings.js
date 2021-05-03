const wsclient = {};
//wsclient.sock = new WebSocket("ws://127.0.0.1:5001");
wsclient.sock = new WebSocket("ws://54.168.9.34:5001");
wsclient.is_connected_to_dev = false;

const reset_connect_button = () => {
  wsclient.button = wsclient.button || document.getElementById("connect");
  wsclient.is_connected_to_dev = false;
  wsclient.button.innerText = "Connect to EMS";
}

const wrilte_nl_in_logbox = (str_nl) => {
  wsclient.logbox = wsclient.logbox || document.getElementById("log_box");
  wsclient.logbox.innerHTML = "* " + str_nl + "<br /> " + wsclient.logbox.innerHTML;
}

wsclient.sock.addEventListener("open", e => {
  console.log("event as connected");
  reset_connect_button();
});

wsclient.sock.addEventListener("message", e => {
  console.log("event as getting message from the server");
  wsclient.button = wsclient.button || document.getElementById("connect");
  if (e.data.match('@')){
    const str = e.data.split('@');
    if (str[0] === "accepted"){
      wsclient.is_connected_to_dev = true;
      wrilte_nl_in_logbox("Your turn! > @" + str[1]);
      wsclient.button.innerText = "Dismiss now";
    }
    else if (str[0] === "rejected"){
      wrilte_nl_in_logbox("Sorry, now @" + str[1]);
    }
    else if (str[0] === "connected"){
      wrilte_nl_in_logbox("@server> @" + str[1]);
    }
    else if (str[0] === "disconnected"){
      if(wsclient.is_connected_to_dev) {
        wrilte_nl_in_logbox("You has been disconnected");
      }
      reset_connect_button();
      wrilte_nl_in_logbox("@server> @" + str[1] + " finished.");
    }
    else if (str[0].match(':')){
      const str_0 = str[0].split(':');
      if(str_0[0] === "time"){
        wsclient.button.innerText = str[1] + "'s turn ends in " + str_0[1];
        if (wsclient.is_connected_to_dev){
          wsclient.button.innerHTML += "<br /> Dismiss now"
        }
      }
      else if(str_0[0] === "start"){
        gwd.actions.events.setInlineStyle('electrode_' + str_0[1], 'background-color: #FFFF55;');
      }
      else if(str_0[0] === "stop"){
        gwd.actions.events.setInlineStyle('electrode_' + str_0[1], 'background-color: #FFFFFF;');
      }
      console.log(str_0);
    }
    else {
      wrilte_nl_in_logbox("@server> " + e.data);
    }
  }
  else {
    wrilte_nl_in_logbox("@server> " + e.data);
  }
});

wsclient.sock.addEventListener("close", e => {
  console.log("event as closed");
});

wsclient.sock.addEventListener("error", e => {
  console.log("event as some error occurs");
});

wsclient.connect_to_dev = (name) => {
  wsclient.sock.send(name + "> Can I try?");
};

wsclient.disconnect_from_dev = () => {
  wsclient.sock.send("disconnect");
};

wsclient.start_dev = (index) => {
  wsclient.sock.send("start:" + index);
}

wsclient.stop_dev = (index) => {
  wsclient.sock.send("stop:" + index);
}