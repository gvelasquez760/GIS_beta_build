
// Shifts background position of the sprite image
function shifter(arr) {

 var image = new google.maps.MarkerImage(arr[0]);
 return image;
}

function createMarker(point, name, info, category, id, sitioWeb, logo) {

  var g = google.maps;
  var image = shifter(icons[category]);

  var marker = new google.maps.Marker({
	position: point, 
	map: map,
    title: name,
    icon: image,
  });


  // Store category, name, and id as marker properties
  marker.category = category;
  marker.name = name;
  marker.id = id;
  gmarkers.push(marker);

    var html = '<div id="div_bomberos2">'+
	 '<table border="0">' +
	 '<tr>' +
		'<td> <!-- FOTO -->'+
			'<img src="'+logo+'" alt="logo" />' +
		'</td>' +
		'<td> <!-- CONTENIDO -->'+
		'<p><b>'+name+'</b></p>'+
		'<p>'+info+'</p>'+
		'<p><a href="'+sitioWeb+'" target="_blank" > Click para ir al Sitio Web</a>'+
		'</td>'+
	 '</tr></table>'+
	'</div>';
  

  g.event.addListener(marker, "click", function() {
   iw.setContent(html);
   iw.open(map, this);
  });

  // Hovering over the markers
  g.event.addListener(marker, "mouseover", function() {
 //  marker.setIcon(shifter(icons.white));
   var hovered = document.getElementById(id);
   if (hovered) {
    hovered.className = "focus";
    actual = hovered; // Store this element
   }
  });

  g.event.addListener(marker, "mouseout", function() {
//   marker.setIcon(shifter(icons[category]));
   if (actual) { actual.className= "normal"; }
  });
}


var hover = { // Hovering over the links
 over: function(i) {
  var marker = gmarkers[i];
  // Set another background color for the link
  var hovered = document.getElementById(marker.id);
  hovered.className = "focus";

  // Set another marker icon
 // marker.setIcon(shifter(icons.white));
 },

 out: function(i) {
  var marker = gmarkers[i];
  // Set the default link background
  var hovered = document.getElementById(marker.id);
  hovered.className = "normal";

  // Set the default marker icon
  marker.setIcon(shifter(icons[marker.category]));
 }
};

var visible= { // Make a category (un)visible
 show: function(category) {
  // Show all markers of one category
  for(var i= 0, m; m = gmarkers[i]; i++) {
   if (m.category == category) {
    m.setVisible(true);
   }
  }
   // Set the checkbox to true
   document.getElementById(category).checked = true;
 },

 hide: function(category) {
  // Hide all markers of one category
  for(var i= 0, m; m = gmarkers[i]; i++) {
   if (m.category == category) {
    m.setVisible(false);
   }
  }
  // Clear the checkbox of a hidden category
  document.getElementById(category).checked = false;
  iw.close();
 }
};

 function boxclick(box, category) {

  // Hide or show the category of the clicked checkbox
  if (box.checked) { visible.show(category); }
  else { visible.hide(category); }

  // Rebuild the sidebar
  makeSidebar();
 }

 // Trigger the clicks from the sidebar to open the appropriate infowindow
 function triggerClick(i) {
  google.maps.event.trigger(gmarkers[i],"click");
 }


 // Rebuild the sidebar to match currently displayed markers
 function makeSidebar() {

  var oldheader;
  var html = "";
  for (var i= 0, m; m = gmarkers[i]; i++) {
   if (m.getVisible()) {

 //  var header = gmarkers[i].category;
 var header = gmarkers[i].category;
   header = header.replace(/^./, header.charAt(0).toUpperCase());
    if (oldheader != header) html += "<b><hr>"+ header+"<\/b><br \/>";
    html += '<a id="'+ gmarkers[i].id+'" href="javascript:triggerClick('+i+')" onmouseover="hover.over('+i+')" onmouseout="hover.out('+i+')">' + gmarkers[i].name + '<\/a><br \/>';
    oldheader = header;
   }
  }
  document.getElementById("sidebar").innerHTML = html;
 }

function readData() { // Create Ajax request for XML

 var request;
 try {
   if (typeof ActiveXObject != "undefined") {
     request = new ActiveXObject("Microsoft.XMLHTTP");
   } else if (window["XMLHttpRequest"]) {
     request = new XMLHttpRequest();
   }
 } catch (e) {}

  request.open("GET", "entidades_quilpue.xml", true);
  request.onreadystatechange = function() {
  if (request.readyState == 4) {

   var xml = request.responseXML;
   var markers = xml.documentElement.getElementsByTagName("marker");
   for(var i = 0, m; m = markers[i]; i++) {
    // Obtain the attribues of each marker
    var lat = parseFloat(m.getAttribute("lat"));
    var lng = parseFloat(m.getAttribute("lng"));
    var point = new google.maps.LatLng(lat,lng);
    var info = m.getAttribute("info");
    var id = m.getAttribute("nr");
    var name = m.getAttribute("name");
    var category = m.getAttribute("category");
	var sitioWeb = m.getAttribute("web");
	var logo = m.getAttribute("logo");
    // Create the markers
    createMarker(point, name, info, category, id, sitioWeb, logo);
   }

  if(gmarkers) {

   // Sort categories and names to display
   // both in alphabetic order
   gmarkers.sort(compareCats);
  }

   visible.show("bomberos");
   visible.show("carabineros");
   visible.show("salud");
   visible.show("servicios");
   visible.show("colegios");
   makeSidebar();
  }
 }; request.send(null);
}


var compareCats = function(a, b) {

 var n1 = a.name;
 // Treat German umlauts like non-umlauts
 n1 = n1.toLowerCase();
 n1 = n1.replace(/ä/g,"a");
 n1 = n1.replace(/ö/g,"o");
 n1 = n1.replace(/ü/g,"u");
 n1 = n1.replace(/ß/g,"s");

 var n2 = b.name;

 n2 = n2.toLowerCase();
 n2 = n2.replace(/ä/g,"a");
 n2 = n2.replace(/ö/g,"o");
 n2 = n2.replace(/ü/g,"u");
 n2 = n2.replace(/ß/g,"s");

 var c1 = a.category;
 var c2 = b.category;

 // Sort categories and names
 if(a.category == b.category){
  if(a.name == b.name){
   return 0;
  }
   return (a.name < b.name) ? -1 : 1;
 }

 return (a.category < b.category) ? -1 : 1;
}
