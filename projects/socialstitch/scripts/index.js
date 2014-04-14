$(document).ready(function() {
  $(window).bind("unload", function() {});
  $("#content").hide();
  $("#content").css("display", "none");
  $("#content").fadeIn(500);
  $("a.transition").click(function(event){
      event.preventDefault();
      linkLocation = this.href;
      $("#content").fadeOut(500, redirectPage);    
    });
  function redirectPage() {
    window.location = linkLocation;
  }

  function displayPage() {
    $("#content").fadeIn(500);
  }

  window.addEventListener("load", displayPage, false);
  window.addEventListener("unload", displayPage, false);
});

function loginAction() {
  // alert("Logging in...");
  var loginBox = $("#loginbox");
  var opacity = parseInt(loginBox.css("opacity"));
  if (opacity === 0)
    loginBox.css("opacity", "1.0");
  else
    loginBox.css("opacity", "0.0");
}

function openPhotosModule() {
  alert("Opening Photos Module...");
}

function openVideosModule() {
  alert("Opening Videos Module...");
}

function loginFacebook() {
  FB.login(function(response) {
     if (response.authResponse) {
       console.log('Welcome!  Fetching your information.... ');
       FB.api('/me', function(response) {
         console.log('Good to see you, ' + response.name + '.');
       });
     } else {
       console.log('User cancelled login or did not fully authorize.');
     }
   });
}

function loginYouTube() {
  alert("Logging in to YouTube...");
}

function loginInstagram() {
  alert("Logging in to Instagram...");
}

// Facebook login

