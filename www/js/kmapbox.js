var mapbox;
var mapbox_marker = [];
var mapbox_bounds = [];

get_mapbox_token = function(){
	mapbox_token = getStorage("mapbox_token");
	if(!empty(mapbox_token)){
		return mapbox_token;
	}
	return false;
};

mapbox_initMap = function( div, lat, lng, info ){
	try {
		
		loader.show();
		
		if(empty(lat) && empty(lng)){
		   toastMsg( getTrans("Missing Coordinates","missing_coordinates") );	
		   return;
		}		
		
		$("#task_lat").val(lat);
		$("#task_lng").val(lng);
		
		map_icons = getIcons();		
		dump(map_icons);
		
		icon_customer = mapboxCreateIcon(map_icons.customer);
		icon_driver = mapboxCreateIcon(map_icons.driver);
		
		mapbox_bounds = [];
		
		mapbox = L.map("map_canvas",{ 
		   scrollWheelZoom:true,
		   zoomControl:false,
	    }).setView([lat,lng], 5 );
	    
	    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+ get_mapbox_token(), {		    
		    maxZoom: 18,
		    id: 'mapbox.streets',		    
		}).addTo(mapbox);
		
		latlng = [lat,lng];
		mapbox_bounds.push( latlng );		
		
		navigator.geolocation.getCurrentPosition( function(position){
			
			var your_lat = position.coords.latitude;
            var your_lng = position.coords.longitude;
                        
            $("#your_lat").val(your_lat);
            $("#your_lng").val(your_lng);
            
            var control = L.Routing.control({	
			waypoints: [
				    L.latLng(your_lat, your_lng),
				    L.latLng(lat, lng)
				],
			    router: L.Routing.mapbox(mapbox_token),
			    createMarker: function(i, wp, nWps) {					    
				    if(i==0){
				    	 return L.marker(wp.latLng, {icon: icon_driver });
				    } else {
				    	 return L.marker(wp.latLng, {icon: icon_customer });
				    }
				} 
		   });
		   
		   var routeBlock = control.onAdd(mapbox);    
		   mapbox_bounds.push( [your_lat,your_lng] );    
		   
		   
		   hideAllModal();
	       centerMapbox();
            
		});
	
	} catch(err) {		
		hideAllModal();
	    toastMsg(err.message);
	}  
};

centerMapbox = function(){
	mapbox.fitBounds(mapbox_bounds, {padding: [30, 30]}); 
};

mapboxCreateIcon = function(icon_url){
	icon = L.icon({
		iconUrl: icon_url
	});
	return icon;
};

mapbox_initDropOffMap = function(){
	
	var data = JSON.parse(getStorage("task_full_data"));
	dump(data);
	
	map_icons = getIcons();		
	dump(map_icons);
	
	icon_customer = mapboxCreateIcon(map_icons.customer);
    icon_driver = mapboxCreateIcon(map_icons.driver);
    icon_merchant = mapboxCreateIcon(map_icons.merchant);
	
	var lat = data.task_lat;
	var lng = data.task_lng;
	
	if(empty(lat) && empty(lng)){
	   toastMsg( getTrans("Missing Coordinates","missing_coordinates") );	
	   return;
	}
	
	loader.show();
	
	var your_lat;
	var your_lng;
	
	var dropoff_lat;
	var dropoff_lng;
	
	map_bounds = [];
	
	mapbox = L.map("map_canvas",{ 
		   scrollWheelZoom:true,
		   zoomControl:false,
	    }).setView([lat,lng], 5 );
		
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+ get_mapbox_token() , {		    
	    maxZoom: 18,
	    id: 'mapbox.streets',		    
	}).addTo(mapbox);
		
	mapbox_bounds.push( [lat,lng] ); 
	
    if(!empty(data.dropoff_task_lat) && !empty(data.dropoff_task_lng)){
    	dropoff_lat = data.dropoff_task_lat;
   	    dropoff_lng = data.dropoff_task_lng;
   	    
   	    mapbox_bounds.push( [dropoff_lat,dropoff_lng] );
    }
	
	navigator.geolocation.getCurrentPosition( function(position){
	
		 your_lat = position.coords.latitude;
         your_lng = position.coords.longitude;
         
         $(".driver_location_lat").val(your_lat);
         $(".driver_location_lng").val(your_lng);
        
         if(!empty(dropoff_lat) && !empty(dropoff_lng)){
	         var control = L.Routing.control({	
			 waypoints: [
				    L.latLng(your_lat, your_lng),
				    L.latLng(dropoff_lat, dropoff_lng),
				    L.latLng(lat, lng)
				],
			    router: L.Routing.mapbox(mapbox_token),
			    createMarker: function(i, wp, nWps) {			    	
				    if(i==0){
				    	 return L.marker(wp.latLng, {icon: icon_driver });
				    } else if (i==1) {
				    	return L.marker(wp.latLng, {icon: icon_merchant });
				    } else if (i==2) {
				    	 return L.marker(wp.latLng, {icon: icon_customer });
				    }
				} 
		    });
        } else {        
        	var control = L.Routing.control({	
			 waypoints: [
				    L.latLng(your_lat, your_lng),				    
				    L.latLng(lat, lng)
				],
			    router: L.Routing.mapbox(mapbox_token),
			    createMarker: function(i, wp, nWps) {			    	
				    if(i==0){
				    	 return L.marker(wp.latLng, {icon: icon_driver });
				    } else {
				    	 return L.marker(wp.latLng, {icon: icon_customer });
				    }
				} 
		    });
        }
	
        var routeBlock = control.onAdd(mapbox);    
   		
        mapbox_bounds.push( [your_lat,your_lng] );    
        centerMapbox();
        hideAllModal();
        		
	}, function(error){
	   hideAllModal();
       toastMsg( error.message ); 	  
    }, 
    { timeout: 60000 , enableHighAccuracy: getLocationAccuracy(), maximumAge:Infinity } );
	
};