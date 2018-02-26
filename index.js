function main(){

let userLocationChoice = "Charlottesville";
let userLat = 0;
let userLong =0;
let radiusAmount = 10000;

//getDataFromApi("", renderHikeView);

	$(".js-pick-hike").click( event => {
		event.preventDefault();
		console.log('clicked');
		$('body').scrollTop( $('.map-view').offset().top);
	} );


	function renderLocationView(){

	}

	function renderHikeView(data, status){

		console.log("getting data: ", data);
		console.log("getting data: "+ data.trails[0].name);


		let listContent  = '';
		for(let i = 0; i < data.trails.length; i++)
		{
		 listContent += `<li><img src="${data.trails[i].imgSmall}" alt="${data.trails[i].name}"> 
								<p class="hike-name">${data.trails[i].name}</p><button class="js-select-hike-button small-right" data="${i}">Select</button>
								<p class="hike-summary">${data.trails[i].summary}</p>
								<p class="hike-info">Distance: ${data.trails[i].length}<br>Difficulty: ${data.trails[i].difficulty}<br>Rating: ${data.trails[i].stars}/5</p>
								</li>`;
		}


		$('#js-hike-list').html(listContent);

		$(".js-select-hike-button").click( event => {
			event.preventDefault();
			console.log('clicked');
			let userHikeChoice =  parseInt( $(event.currentTarget).attr("data") );
			console.log("hike #"+userHikeChoice);

			$('.js-hike-view').addClass('hide');
			$('.js-brewery-view').removeClass('hide');

			console.log("location"+userLocationChoice);

			userLat = data.trails[userHikeChoice].latitude;
			userLong = data.trails[userHikeChoice].longitude;
			console.log (userLat, userLong); 


			//console.log("loc or:"+data.trails[userHikeChoice].location+" loc"+ data.trails[userHikeChoice].location.replace(/\s/g,''));

			//getDataFromBreweryApi(data.trails[userHikeChoice].location.replace(/\s/g,''), renderBreweryView);

			//getDataFromBreweryApi( (userLocationChoice + ",va"), renderBreweryView);
			
			getDataFromBreweryGoogleApi( radiusAmount, renderBreweryView);

			//getDataFromBreweryGoogleApi( (userLocationChoice + ",va"), renderBreweryView);



		});

	}

	function renderBreweryView(data, status){
		console.log("api call status: ", status);

		if(data.length < 3) {

			radiusAmount += 5000;

			getDataFromBreweryGoogleApi( radiusAmount, renderBreweryView);


			return;
		}

		console.log("getting data: ", data);

		let listContent = '';

		for(let i = 0; i < data.length; i++) {

			listContent += `<li>
							<img src="http://badgerheadgames.com/wp-content/uploads/2018/02/beer-2370783_1920-e1519612752761-1.jpg" alt="${data[i].name}"><input type="checkbox" name="brewery" id="brewery${i}" value="${i}" data="${i}"><label for="brewery${i}">Add to list</label>
							<p class="brewery-name">${data[i].name}</p>
							<p class="brewery-summary">${data[i].vicinity}</p>
							</li>`;
			}

		$('#js-brewery-list').html(listContent);	

		//reset to default value just in case we enlarged the search
		radiusAmount = 10000; 



	}

	function getHikeData(){

	}

	function parseHikeData(){

	}



//const HIKE_SEARCH_URL = 'https://www.hikingproject.com/data/get-trails?lat=38.6647&lon=-78.4581&maxDistance=20&key=200222039-9fe0c8f1c7fdd7389cb046d84ce4f77e';

function getDataFromApi(searchTerm, latitude, longitude, maxDistance, callback) {

	const BREWERY_SEARCH_URL = 'http://beermapping.com/webservice/loccity/66bbabba983697bf56465bf8e1a3de0e/Charlottesville,va&s=json';
	const HIKE_SEARCH_URL = 'https://www.hikingproject.com/data/get-trails';

	const query = {
	  lat: latitude,
	  lon: longitude,
	  maxDistance: maxDistance,
	  key: '200222039-9fe0c8f1c7fdd7389cb046d84ce4f77e'
	};

	$.getJSON(HIKE_SEARCH_URL, query, callback);
}

function getDataFromBreweryApi(city, callback) {

	let BREWERY_SEARCH_URL = '';
	BREWERY_SEARCH_URL = 'http://beermapping.com/webservice/loccity/66bbabba983697bf56465bf8e1a3de0e/' + city + '&s=json';

	$.getJSON(BREWERY_SEARCH_URL, '', callback);
}

function getDataFromBreweryGoogleApi(radius, callback) {

	
 let userLoc = new google.maps.LatLng(userLat,userLong);

 let map = new google.maps.Map(document.getElementById('map'), {
      center: userLoc,
      zoom: 15
    });

  let request = {
    location: userLoc,
    radius: `${radius}`,
    keyword: 'brewery'
  };

  console.log(request.radius);

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);

	//$.getJSON(BREWERY_SEARCH_URL, '', callback);
}


function callb(data, status)
{

	console.log("getting data: ", data);
	//console.log("getting data: "+ data.trails[0].name);

}




$(".js-pick-location-button").click( event => {
		event.preventDefault();
		console.log('clicked');
		userLocationChoice = $("select").val(); 
		console.log("location"+userLocationChoice);

		$('.js-location-view').addClass('hide');
		$('.js-hike-view').removeClass('hide');

		if(userLocationChoice == "Great Falls") { 
			userLat = 38.9982;
			userLong = -77.2883;
			getDataFromApi("",38.9982,-77.2883,30, renderHikeView);
		}
		if(userLocationChoice === "Charlottesville") {
		userLat = 38.0293;
			userLong = -78.4767; 
		getDataFromApi("",38.0293,-78.4767,30, renderHikeView);
	}
		if(userLocationChoice === "Harrisonburg") { 
			userLat = 38.4496;
			userLong = -78.8689; 
		getDataFromApi("",38.4496,-78.8689,30, renderHikeView);
	}
		if(userLocationChoice === "Roanoke") { 
			userLat = 37.2710;
			userLong = -79.9414; 
		getDataFromApi("",37.2710,-79.9414,30, renderHikeView);
	}	

	} );

}




//on page load
$(function() {
  main();
});

//Harrisonburg Va / Shendandoah Valley  38.4496° N, 78.8689° W
//Roanoke Va, Southern VA 37.2710° N, 79.9414° W
//Great Falls VA 38.9982° N, 77.2883° W
//Charlottesville VA 38.0293° N, 78.4767° W
