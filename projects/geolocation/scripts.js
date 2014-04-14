function toggleBtn() {
  var btn = $("#startstopbtn");
  if (btn.text() === "Start watching position") {
    watchPosition();
    btn.text("Stop watching position");
  }
  else if (btn.text() === "Stop watching position") {
    stopWatching();
    btn.text("Start watching position");
  }
}

function appendPosition(coords) {
  var lat = coords.latitude;
  var lng = coords.longitude;
  var acc = coords.accuracy;
  var speed = coords.speed;
  var alt = coords.altitude;
  var altacc = coords.altitudeAccuracy;

  var row = $("<tr>");
  row.append($("<td>").text(window.count++));
  row.append($("<td>").text(lat));
  row.append($("<td>").text(lng));
  row.append($("<td>").text(acc));
  row.append($("<td>").text(speed));
  row.append($("<td>").text(alt));
  row.append($("<td>").text(altacc));
  $("#bigtable").append(row);
}

function watchPosition() {
  var oldLat, oldLong;

  function successCallback(position) {
      console.log(position.coords);
      appendPosition(position.coords);
  }

  function errCallback(err) {
      var message = err.message;
      var code = err.code;
      alert("Erorr: " + code);
      //code = 0 => UNKNOWN_ERROR, 1 => PERMISSION_DENIED, 2 => POSITION_UNAVAILABLE, 3 => TIMEOUT
  }

  // optional for geolocation.watchPosition
  var options = { 
      enableHighAccuracy: true,
      maximumAge: 250,
      timeout: 10000
  };

  window.watchId = navigator.geolocation.watchPosition(successCallback, errCallback, options);
}

function stopWatching() {
  navigator.geolocation.clearWatch(window.watchId);
}

function getCurrentPosition() {
  navigator.geolocation.getCurrentPosition(function(position) {
      appendPosition(position.coords);
  });
}

$(document).ready(function() {
  window.count = 0;

  var nop = function() { };
  if (!navigator.geolocation) {
    navigator.geolocation = {};
  }
  if (!navigator.geolocation.getCurrentPosition) {
    navigator.geolocation.getCurrentPosition = nop;
  }

  getCurrentPosition();
});