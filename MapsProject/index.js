const empireState = { lat: 40.748441, lng: -73.985664 };
const sleep = (time) => { return new Promise(resolve => setTimeout(resolve, time))};

function initMap() {
  const infowindow = new google.maps.InfoWindow({});

  //create map
  let map = new google.maps.Map(document.getElementById("map"),
  {
    zoom: 10,
    center: empireState,     
  });

   //create circle
   let circle = new google.maps.Circle({
      center: map.getCenter(),
      radius: 3219, // meters
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#ff0000",
      fillOpacity: 0.08,
      clickable: false
    });

    //render circle on map
    circle.setMap(map);

    //return bounds of the circle object
    //fits map to bounds
    //return southwest & northeast bounds
    let bounds = circle.getBounds();
    map.fitBounds(bounds);
    let sw = bounds.getSouthWest();
    let ne = bounds.getNorthEast();    

    for (let i = 0; i < 5;) {

     let ptLat = Math.random() * (ne.lat() - sw.lat()) + sw.lat();
     let ptLng = Math.random() * (ne.lng() - sw.lng()) + sw.lng();
     let point = new google.maps.LatLng(ptLat,ptLng);
     var respDistance; 
     var respTime; 
     //if distance from center to point is within the circle, create marker/infowindow
     if (google.maps.geometry.spherical.computeDistanceBetween(point,circle.getCenter()) < circle.getRadius()) {
        
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
  
        origins: [point],
        destinations: [empireState],
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      },(response, status) => {
        if (status !== "OK") {
          alert("Error was: " + status);
        }else{

          const results = response.rows[0].elements;

          respDistance = results[0].distance.text;
          respTime = results[0].duration.text;

          let staticMap = "https://maps.googleapis.com/maps/api/streetview?size=400x300&location=" + ptLat + "," + ptLng + "&key=AIzaSyBDSSgSj_rKWsQh6c2B6Hq8ImrQ_-27ChA"  ;
          let content = 
          `<h3><a><b>Friend ${i}</b></a></h3>`+ '<br>'+
          `<div><a>${respDistance}</a></div>`+
          `<div<a>${respTime}</a></div>`+ '<br>'+
          `<div></div> `+ '<br>'+
          `<div><a>Lat/Long: ${ptLat}, ${ptLng}</a></div>` + '<br>' +
          '<div id = "content">'+
          `<img src= "${staticMap}"/>`+
          '</div>';
          
          CreateMarker(infowindow, map, point,content,i, ptLat,ptLng);
          
        }
      });

      i++;
       }      
    }

    
}

//creates marker and sets eventListeners on friends in the side column
 function CreateMarker(infowindow, map, point, content, i, ptLat,ptLng) {
  
  let marker = new google.maps.Marker({
    position:point, 
    map:map
  });
   
  google.maps.event.addListener(marker, "click", function() {
    infowindow.setContent(content);
    infowindow.open(map, marker, ptLat,ptLng);
  });

  let targetElement = document.getElementById(`friend${i}`);

  targetElement.addEventListener('click', () => {
    var result = [empireState.lat, empireState.lng];
    transition(result, ptLat,ptLng, marker);
});

  return marker;
}

var dLat;
var dLng;

//increments the markers 1/100th at a time
function transition(result, ptLat,ptLng, marker ){
  
  dLat = (result[0] - ptLat)/100;
  dLng = (result[1] - ptLng)/100;
  
  moveMarker(ptLat,ptLng, marker);
}

const moveMarker = async (ptLat,ptLng, marker) => {
  
  ptLat += dLat;
  ptLng += dLng;
    
  var latlng = new google.maps.LatLng(ptLat, ptLng);
  marker.setPosition(latlng);
    
  for(var i= 0; i < 100; i++)
  { 
    ptLat += dLat;
    ptLng += dLng;  
    latlng = new google.maps.LatLng(ptLat, ptLng)
    await sleep(1);
    marker.setPosition(latlng); 
  }

}

