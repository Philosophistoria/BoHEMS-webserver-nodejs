const wsclient = {};
//wsclient.sock = new WebSocket("ws://127.0.0.1:5001");
wsclient.sock = new WebSocket("ws://172.16.80.7:5001");
wsclient.playable = false;

wsclient.sock.addEventListener("open", e => {
  console.log("event as connected");
});

wsclient.sock.addEventListener("message", e => {
  console.log("event as getting message from the server");
  const logbox = document.getElementById("log_box");
  const button = document.getElementById("connect");
  if (e.data.match('@')){
    str = e.data.split('@');
    if (str[0] === "accepted"){
      wsclient.playable = true;
      logbox.innerHTML = "Your turn! > @" + str[1] +  "<br />" + logbox.innerHTML;
      button.innerText = "Disconnect";
    }
    else if (str[0] === "rejected"){
      logbox.innerHTML = "Sorry, now @" + str[1] + " is playing.<br />" + logbox.innerHTML;
    }
    else if (str[0] === "connected"){
      logbox.innerHTML = "@server> @" + str[1] + " gets started. <br />" + logbox.innerHTML;
    }
    else if (str[0] === "disconnected"){
      if(wsclient.playable){
        wsclient.playable = false;
        logbox.innerHTML = "You has been disconnected <br />" + logbox.innerHTML;
        button.innerText = "Connect";
      }
      logbox.innerHTML = "@server> @" + str[1] + " finished. <br />" + logbox.innerHTML;
    }
    else {
      logbox.innerHTML = "@server> " + e.data + "<br />" + logbox.innerHTML;
    }
  }
  else {
    logbox.innerHTML = "@server> " + e.data + "<br />" + logbox.innerHTML;
  }
  logbox.innerHTML = "* " + logbox.innerHTML;
});

wsclient.sock.addEventListener("close", e => {
  console.log("event as closed");
});

wsclient.sock.addEventListener("error", e => {
  console.log("event as some error occurs");
});

