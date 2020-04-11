var map;
var map_bounds=[];
var map_marker;
var map_style = [ {stylers: [ { "saturation":-100 }, { "lightness": 0 }, { "gamma": 1 } ]}];
var zoom_level = 17;

gmaps_initMap = function(div, lat, lng, info ){
	
	if( empty(lat) || empty(lng) ){
		toastMsg( getTrans("Missing Coordinates","missing_coordinates") );	
		return ;
	}
	
	$("#task_lat").val(lat);
	$("#task_lng").val(lng);
	
	map_icons = getIcons();         
	
	map_bounds=[];
	
	map = new GMaps({
	  div: '#'+div,
	   lat: lat,
       lng: lng,
	   disableDefaultUI: true,
	   styles: map_style 
	}); 
	
	latlng = toLatLng(lat,lng);
    map_bounds.push(latlng);
    
    var infoWindow = new google.maps.InfoWindow({
	    content: info
	});
        
    map_marker = map.addMarker({
     lat: lat ,
     lng: lng ,
     icon : map_icons.customer ,
     infoWindow: {
	   content: info
	 }
   });
   
   infoWindow.open(map, map_marker);
      
   
   /*PLOT DRIVER CURRENT LOCATION*/
	navigator.geolocation.getCurrentPosition( function(position){		
	    	       
       	  var your_lat = position.coords.latitude;
          var your_lng = position.coords.longitude;
          
          $("#your_lat").val(your_lat);
          $("#your_lng").val(your_lng);
                                      
          dump("your location=>"+your_lat + " => "+  your_lng);
          info_html = "<p>"+ getTrans('You are here','you_are_here') +"</b>";	   
		       var infoWindow = new google.maps.InfoWindow({
			   content: info_html
		  });	
		  
		  
          marker_driver =  map.addMarker({
			  lat: your_lat,
			  lng: your_lng	,			
			  icon: map_icons.driver,
			  infoWindow: infoWindow,		  
		  });
		  infoWindow.open(map, marker_driver);
		  		  
		  latlng = toLatLng(your_lat , your_lng);
		  map_bounds.push(latlng);		  
		  
		  map.drawRoute({
		    origin: [your_lat , your_lng ],
			destination: [ lat , lng ],
		    travelMode: 'driving',
		    strokeColor: '#131540',
		    strokeOpacity: 0.6,
		    strokeWeight: 6
		  });		
		  
		  centerMap();
          
       }, function(error){
       	  // GET LOCATION HAS FAILED     
       	  toastMsg( error.message );  	  
       }, 
    { timeout: 60000 , enableHighAccuracy: getLocationAccuracy(), maximumAge:Infinity } );	
      
		   
};

toLatLng = function(lat, lng){
  var latlng = new google.maps.LatLng( lat , lng );
  return latlng;
}

centerMap = function(){
	map.fitLatLngBounds(map_bounds); 	
};

setCenterMap = function(lat, lng){
	map.setCenter(lat,lng);
    map.setZoom(zoom_level);
};

createInfoWindow = function(html){	
    infoWindow = new google.maps.InfoWindow({
		content: html
	});
	return infoWindow;
};

/*DROP OFF MAP*/

init_MapDropOff = function(){
	dump('initMapDropOff');
	var data = JSON.parse(getStorage("task_full_data"));
	dump(data);
	
	map_icons = getIcons();		
	dump(map_icons);
	
	var lat = data.task_lat;
	var lng = data.task_lng;
	
	if(empty(lat) && empty(lng)){
	   toastMsg( getTrans("Missing Coordinates","missing_coordinates") );	
	   return;
	}
	
	var your_lat;
	var your_lng;
	
	var dropoff_lat;
	var dropoff_lng;
	
	
	map_bounds = [];
	
	options = {
	  div: "#map_canvas",
	  lat: lat,
	  lng: lng,
	  disableDefaultUI: true,
	  styles: map_style ,
   };
   
   map = new GMaps(options);	   
   info_html = '<p><b>'+data.customer_name+"<br/></b>";	  
    info_html+='<p>'+ data.delivery_address +'</p>';
   info_window = createInfoWindow(info_html);
   
   map_marker =  map.addMarker({
	  lat: lat,
	  lng: lng,
	  infoWindow: info_window,
	  icon: map_icons.customer
   });	   
   infoWindow.open(map, map_marker);
   
   var latlng = new google.maps.LatLng( lat , lng );
   map_bounds.push(latlng);
   
   centerMap();
   
   
   /*MARKER FOR DROP FF*/
   if(!empty(data.dropoff_task_lat) && !empty(data.dropoff_task_lng)){
   	
   	   dropoff_lat = data.dropoff_task_lat;
   	   dropoff_lng = data.dropoff_task_lng;
   	
   	   info_html = '<p><b>'+data.dropoff_contact_name+"<br/></b>";
   	   info_html+= '<p>'+ data.drop_address +'</p>';   	
   	   info_window = createInfoWindow(info_html);
   	   	   
   	   marker_merchant =  map.addMarker({
		  lat: dropoff_lat,
		  lng: dropoff_lng,
		  infoWindow: info_window,
		  icon: map_icons.merchant
	   });	   
	   infoWindow.open(map, marker_merchant);
	   
	   var latlng = new google.maps.LatLng( dropoff_lat , dropoff_lng );
       map_bounds.push(latlng);
       
       centerMap();
   }
   
   /*ADD DRIVER MARKER*/
   navigator.geolocation.getCurrentPosition( function(position){

   	   your_lat = position.coords.latitude;
       your_lng = position.coords.longitude;
       
       $(".driver_location_lat").val(your_lat);
       $(".driver_location_lng").val(your_lng);
       
       info_html = "<p>"+ getTrans('You are here','you_are_here') +"</b>";	   
	   info_window = createInfoWindow(info_html);
          
       marker_driver =  map.addMarker({
		  lat: your_lat,
		  lng: your_lng	,			
		  icon: map_icons.driver,
		  infoWindow: info_html,		  
	   });
	   infoWindow.open(map, marker_driver);
	  
	  var latlng = new google.maps.LatLng( your_lat , your_lng );
	  map_bounds.push(latlng);		  	

	  /*ADD ROUTE*/   
	  if(!empty(dropoff_lat) && !empty(dropoff_lng)){   	  
	   	  map.drawRoute({
		    origin: [your_lat , your_lng ],
			destination: [ dropoff_lat , dropoff_lng ],
		    travelMode: 'driving',
		    strokeColor: '#131540',
		    strokeOpacity: 0.6,
		    strokeWeight: 6
	      });
	   }     
	   
	   map.drawRoute({
	    origin: [dropoff_lat , dropoff_lng ],
		destination: [ lat , lng ],
	    travelMode: 'driving',
	    strokeColor: '#FFFF00',
	    strokeOpacity: 0.6,
	    strokeWeight: 6
      });
      
      centerMap();
	   	
   }, function(error){
       toastMsg( error.message ); 	  
   }, 
   { timeout: 60000 , enableHighAccuracy: getLocationAccuracy(), maximumAge:Infinity } );
           
};