function getPhotos() {
  var userAddress = document.getElementById("searchnear").value;
  if (userAddress.length === 0) {
    alert("Please enter things into the text fields!");
  }
  else {
    geocodeAddress(userAddress);
  }
}

function geocodeAddress(address) {
  var geocoder = new google.maps.Geocoder();
  var geocoderRequest = {
    "address": address
  };
  var callbackFunc = (function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      fetchPhotosWithLocation(results[0].geometry.location);

      appendAddressToPage(results[0].formatted_address);
    }
  });

  geocoder.geocode(geocoderRequest, callbackFunc);
}

function appendAddressToPage (address) {
  var addressDiv = document.getElementById("addressfound");
  addressDiv.innerHTML = "";
  var text = document.createTextNode("We found these in " + address);
  addressDiv.appendChild(text);
}

function fetchPhotosWithLocation(latlng) {
  var lat = latlng.lat();
  var lng = latlng.lng();
  var userTag = document.getElementById("searchtag").value;

  var userRange;
  var userRangeRadios = document.getElementsByName("searchrange");
  for (var i = 0; i < userRangeRadios.length; i++) {       
    if (userRangeRadios[i].checked) {
      userRange = userRangeRadios[i].value;
      break;
    }
  }

  var delta = 0;

  switch (userRange) {
    case "veryclose":
      delta = 0.001;
      break;
    case "close":
      delta = 0.01;
      break;
    case "normal":
      delta = 0.1;
      break;
    case "far":
      delta = 1;
      break;
    default:
      break;
  }

  var photoRequest = new panoramio.PhotoRequest({
    "tag" : userTag,
    "rect" : {
      "sw" : {
        "lat" : lat - delta,
        "lng" : lng - delta
      },
      "ne" : {
        "lat" : lat + delta,
        "lng" : lng + delta
      }
    }
  });

  var options = {
    'width': 900,
    'height': 270,
    'columns': 5,
    'croppedPhotos': true
  };

  var wapiblock = document.getElementById('wapiblock');
  var widget = new panoramio.PhotoListWidget(wapiblock, photoRequest, options);

  widget.setPosition(0);
}