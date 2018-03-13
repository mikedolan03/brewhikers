function main(){

//---Variables 

//place to search for hikes
let userLocationChoice = "Charlottesville";

//Lat/Lng initially set to search location and then to hike location
let userLat = 0;
let userLong =0;

//Starting radius to search from
let radiusAmount = 16000;

//arrays to store Hike / Brewery data pulled from APIs
let hikeData = [];
let breweryData = [];

//state of mobile menu
let editMenuShowing = false;

let userLoc;
const breweryDetails = [];
let showAmount = 6;
let autocomplete;
let directionShowing = false;

//state of directions so that we dont keep calling the direction api if we are just hiding / showing
let directionsGenerated = false;

//hikes the user has selected - currently just one is allowed but could branch to more hikes as a feature
const userHikes = []; 

//breweries the user has selected to visit
let userBreweries = []; 

let brewerylistContent = "";

//currentBrewery is the first brewery currently listed 
let currentBrewery = 0;


//this is used to as a fall back if the CSS loading animation is not supported on an older browser
if (!browserSupportsCSSProperty('animation')) {
  $('.sk-circle').html('<img src="https://media0.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif">');
  }


//RENDERING FUNCTIONS---------------------

//This function creates the Progress bar at the top of the page that lets the user know where they are in the program...
	function renderProgressSection(currentView){

		let progressContent	= "";
		editMenuShowing = false; 

		if(currentView	=== 2) {
				progressContent +=`<div class="col-12 right-side js-open-edit"><i class="far fa-edit"></i></div>
							<div class="col-4 progress-box progress-box-left hide-on-mobile">
							<p class="js-step1-txt ellipsis">Step 1: Exploring ${userLocationChoice}</p>
							<button class="progress-button js-go-back-to-start-button">Change Area</button></div>
							<div class="col-4 progress-box">
							<p class="js-step2-txt ellipsis">Step 2: Pick a hike...</p>
							</div>`;
		}
		if(currentView	=== 3) {
			progressContent += `<div class="col-12 right-side js-open-edit"><i class="far fa-edit"></i></div>
								<div class="col-4 progress-box progress-box-left hide-on-mobile">
								<p class="js-step1-txt ellipsis">Step 1: Exploring ${userLocationChoice}</p>
								<button class="progress-button js-go-back-to-start-button">Change Area</button></div>
								<div class="col-4 progress-box hide-on-mobile"><p class="js-step2-txt ellipsis">Step 2: Hiking ${hikeData.trails[userHikes[0]].name}</p>
								<button class="progress-button js-go-back-to-hike-button">Change Hike</button></div>
								<div class="col-4 progress-box progress-box-right"><p class="js-step3-txt ellipsis">Step 3: Choose breweries to visit...</p>
								</div>`;
						}

		if(currentView	=== 4) {

			let step3text = "";

			if(userBreweries.length > 0){

			 	step3text = "Step 3: Selected " + userBreweries.length

			 	if(userBreweries.length >1) {
			  		step3text += " breweries to visit.";
				}  	else {
						step3text += " brewery to visit";
					}
			} else {
				step3text = "Step 3: Selected " + userBreweries.length + " breweries to visit.";
			}


			progressContent += `<div class="col-12 right-side js-open-edit"><i class="far fa-edit"></i></div>
							<div class="col-3 progress-box progress-box-left hide-on-mobile"><p class="js-step1-txt ellipsis">Step 1: Exploring ${userLocationChoice}</p>
							<button class="progress-button js-go-back-to-start-button">Change Area</button></div>
							<div class="col-3 progress-box hide-on-mobile"><p class="js-step2-txt ellipsis">Step 2: Hiking ${hikeData.trails[userHikes[0]].name}</p>
							<button class="progress-button js-go-back-to-hike-button">Change Hike</button></div>
							<div class="col-3 progress-box hide-on-mobile progress-box-right"><p class="js-step3-txt ellipsis">${step3text}</p>
							<button class="progress-button js-go-to-breweries-button">Change Breweries</button></div>
							<div class="col-3 progress-box progress-box-right"><p class="js-step3-txt ellipsis">Results: Plan Details</p>
							<button class="progress-button js-go-back-to-start-button">Start Over</button>
							</div>`;
						}

		$('.js-progress-section').html(progressContent);


		$(".js-go-back-to-start-button").click( event => {
			console.log	("user clicked to go back to start - reloading page");
			//reloading the page should get rid of event handlers automatically and reset vars
			location.reload();

		});

		$(".js-open-edit").click( event => {
			console.log	("edit button clicked");
			//reloading the page should get rid of event handlers automatically and reset vars
			if (!editMenuShowing) { 
				$('.hide-on-mobile').removeClass('hide-on-mobile').addClass('can-be-hidden'); 
				editMenuShowing = true;
				} else {
				$('.can-be-hidden').removeClass('can-be-hidden').addClass('hide-on-mobile');
				editMenuShowing = false; 
				}

			

		});

		$(".js-close-edit").click( event => {
			console.log	("close edit button clicked");
			//reloading the page should get rid of event handlers automatically and reset vars
			$('.can-be-hidden').removeClass('can-be-hidden').addClass('hide-on-mobile'); 
			$('.js-close-edit').removeClass('js-close-edit').addClass('')

		});

		$(".js-go-back-to-hike-button").click( event => {
			event.preventDefault();
			console.log	("user clicked to go back to hikes");

			//will have to clean up data here since the user has picked a hike, and possibly breweries based on that hike
			userHikes[0] = null;
			userBreweries = [];
			directionsGenerated = false;


			//remove event handlers from brewery buttons for when we get to this page again 
			$('#js-brewery-list').off("click");

			$('#show-map').addClass('hide');
			$('.generate-trip').addClass('hide');
			$('.js-brewery-view').addClass('hide');

			getLocationAndCallHikesAPI(userLocationChoice);

			
		});

		
		$('.js-go-to-breweries-button').click( event => {
			event.preventDefault();
			console.log('clicked');
			
			$('#show-map').addClass('hide');

			$('.modal-text').html(`Finding the closest breweries...`);
			$('.modal').removeClass('hide');
			directionsGenerated = false;

			//no need to re-run API since we already have the data stored and sorted 
			renderBreweryView();

		
		});


		
		$(".js-go-to-map-button").click( event => {
			event.preventDefault();
			$('.js-brewery-view').addClass('hide');
			$('#show-map').removeClass('hide');
			initMap();
		});

	}


// This function renders the list of hikes for the user to select
	function renderHikeView(data, status){

		document.body.scrollTop = 0;
    	document.documentElement.scrollTop = 0;

		hikeData = data; 

		console.log("getting data: ", data);
		console.log("getting data: "+ data.trails[0].name);
		console.log("saved data: ", hikeData);


		let listContent  = '';
		let hikeImage	= "";
		for(let i = 0; i < data.trails.length; i++)
		{

				if(!data.trails[i].imgMedium) { hikeImage = "http://badgerheadgames.com/wp-content/uploads/2018/03/forest.jpg"} else {
					hikeImage	= data.trails[i].imgMedium;

				}

				hikeData.trails[i].hikeImage = hikeImage;

		let hikeDifficulty = data.trails[i].difficulty;

		if(data.trails[i].difficulty == "green" ) {hikeDifficulty = "Easy";}
		if(data.trails[i].difficulty == "greenBlue" ) {hikeDifficulty = "Easy to Moderate";}
		if(data.trails[i].difficulty == "blue" ) {hikeDifficulty = "Moderate";}
		if(data.trails[i].difficulty == "blueBlack" ) {hikeDifficulty = "Moderate to Difficult";}
		if(data.trails[i].difficulty == "black" ) {hikeDifficulty = "Difficult";}


		 listContent += `<li><img class="img-hikes" src="${hikeImage}" alt="${data.trails[i].name}"> 
								<p class="hike-name">${data.trails[i].name}</p>
								<p class="hike-summary">${data.trails[i].summary}</p>
								<p class="hike-info">
								<span class="info-bold">Distance:</span> ${data.trails[i].length}<br>
								<span class="info-bold">Difficulty:</span> ${hikeDifficulty}
								<br>
								<span class="info-bold">Rating:</span> ${data.trails[i].stars}/5</p>
								<button class="js-select-hike-button small-right" data="${i}">Select</button>
								</li>`;
		}

		$('.js-location-view').addClass('hide');
		$('.js-hike-view').removeClass('hide');

		$('.js-pick-hike-directions').html(`Step 2: Pick one of these ${data.trails.length} hikes near ${userLocationChoice}`);

		$('#js-hike-list').html(listContent);

		renderProgressSection(2);

		$(".js-select-hike-button").click( event => {
			event.preventDefault();
			console.log('clicked');
			let userHikeChoice =  parseInt( $(event.currentTarget).attr("data") );
			console.log("hike #"+userHikeChoice);

			userHikes[0] = userHikeChoice; 

			console.log("location"+userLocationChoice);

			userLat = data.trails[userHikeChoice].latitude;
			userLong = data.trails[userHikeChoice].longitude;
			console.log (userLat, userLong); 

			$('.modal-text').html(`Finding the closest breweries to ${data.trails[userHikeChoice].name}`);
			$('.modal').removeClass('hide');

			
			//CALL 
			getBreweryDataFromGoogleApi( radiusAmount, BreweryDataCallback);

		
		});

	}


//Function to render the list of breweries
	function renderBreweryView(scroll = true){
		//make sure to disable old event handlers since they will be regenerated
		$('#js-brewery-list').off("click");
		$('.js-green-go-button').off("click");
			if(scroll){
					document.body.scrollTop = 0;
			    	document.documentElement.scrollTop = 0;
			}
		let brewerylistContent = '';

		let breweryCount = breweryData.length;

		if(breweryCount <= 0) {

			//The hike/location is too remote that no breweries can be found. So render a modal popup and then send user back to search another location

			brewerylistContent =`<div class="col-4">
									<p>No breweries were found within 30 miles of this hike. </p></div>`

				$('.modal-text').html(`Oh no! You must be hiking way out there. We can't seem to find any breweries near the hike you chose. Please try a new location.`);
				 $('.modal').removeClass('hide');
				 $('.sk-circle').addClass('hide');
				 $('#modal-button-container').removeClass('hide');

				 $('#modal-button-container').on("click", '.modal-button', function (event) {
      				event.preventDefault();
      				$("#modal-button-container").off("click");
					$('.sk-circle').removeClass('hide');
				 	$('#modal-button-container').addClass('hide');
					$('.modal').addClass('hide');
					location.reload();

					});

		} else {
			
			
			let i = currentBrewery;
			let ii = 0;

			let count = 0;

			if(i+showAmount < breweryData.length) { 
				ii = (i+showAmount); 
			} else { 
				ii = breweryData.length;
				}

			
			while (count < showAmount)
			{

				console.log(i , breweryCount);
				console.log("lat", breweryData[i].geometry.location.lat(), breweryData[i].geometry.location.lng() );

				breweryData[i].distanceMi = findDistance(userLat, userLong, breweryData[i].geometry.location.lat(), breweryData[i].geometry.location.lng() ).distanceMi; 

				let imageToShow = "";

				//if(breweryData[i].photos) {
				//	imageToShow	= breweryData[i].photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500});
				//} else {
					imageToShow	= breweryData[i].myImage;
				//}

				if(breweryData[i].selected) { 
					brewerylistContent += `<div class="col-4 brew-card" id='${breweryData[i].place_id}'>
												<div class="box highlight">
														<div class="check-mark"><i class="far fa-check-circle"></i></div>
														<img class="img-brew" src="${imageToShow}" alt="${breweryData[i].name}">
														<p class="brewery-name"><span class="info-bold">${breweryData[i].name}</span><br />
														<span class="info-bold">Location:</span> ${ precisionRound(breweryData[i].distanceMi, 1)} miles away<br />
														<span class="info-bold">Rating:</span> ${breweryData[i].rating} stars</p>
														<button name="brewery" id="brewery${breweryData[i].place_id}" data="${i}" class="js-remove-brewery-button brew-button">Remove</button>
												</div>
											</div>`;
				
				} else { 
					brewerylistContent += `<div class="col-4 brew-card" id='${breweryData[i].place_id}'>
													<div class="box">
														<div class="check-mark hide"><i class="far fa-check-circle"></i></div>
														<img class="img-brew" src="${imageToShow}" alt="${breweryData[i].name}">
														<p class="brewery-name"><span class="info-bold">${breweryData[i].name}</span><br />
														<span class="info-bold">Location:</span> ${ precisionRound(breweryData[i].distanceMi, 1)} miles away<br />
														<span class="info-bold">Rating:</span> ${breweryData[i].rating} stars</p>
														<button name="brewery" id="brewery${breweryData[i].place_id}" data="${i}" class="js-add-brewery-button brew-button"> Add to list</button>
													</div>
											</div>`;
					}

				//console.log(detailsResult.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500}));
				count++;
				i++; 

				if(i >= breweryData.length) count = 1000;

			}

			brewerylistContent += `</div>`;

			console.log("generating next buttons",currentBrewery, breweryData.length);

			if(currentBrewery != 0) {
				brewerylistContent += `<div class="row" style="clear: both"><div class="col-4 hide-on-mobile">
											<button class="previous-button"><< Previous Breweries</button></div>`
			} else {
				brewerylistContent +=`<div class="row" style="clear: both"><div class="col-4 hide-on-mobile">
											&nbsp; </div>`
			}

			brewerylistContent += `<div class="col-4 hide-on-mobile">
													<div class="showing-results">
															<div class="show-results-inner">Showing results ${currentBrewery+1} to ${ii}
															</div>
													</div>
									</div>`

			if( breweryData.length > currentBrewery+6) {
				brewerylistContent += `<div class="col-4 hide-on-mobile"><button class="next-button">Next Breweries >></button></div>`

			}

			/*brewerylistContent += `</div>
									<div class="row" style="clear: both"><div class="col-4 hide-on-mobile">
											<button class="previous-button"><< Previous Brewery</button></div>
											<div class="col-4 hide-on-mobile">
													<div class="showing-results">
															<div class="show-results-inner">Showing results ${currentBrewery+1} to ${ii}
															</div>
													</div>
											</div>
											<div class="col-4 hide-on-mobile"><button class="next-button">Next Brewery >></button></div>`
											*/

			if(showAmount < breweryData.length) {
				brewerylistContent += `<div class="col-12 hide-on-big">
									<button class="js-show-more">Show more breweries</button>
									</div>`;
								}


		//where the else } was befor
			
		$('.js-hike-view').addClass('hide');

		$('.js-brewery-view').removeClass('hide');

		$('.js-breweries-search-results').html(`Choose from ${breweryCount} breweries listed below.`);

		$('.js-pick-breweries').html(`Step 3: Choose a few breweries from this list of ${breweryCount} near ${hikeData.trails[userHikes[0]].name}`);

		$('#js-brewery-list').html(brewerylistContent);	

		$('.modal').addClass('hide');

		renderProgressSection(3);

		if(userBreweries.length > 0) {
			$('.generate-trip').removeClass('hide'); 
			$('.generate-trip-button').html(`Generate Trip`);
			$('.trip-summary').html(`1 hike and ${userBreweries.length} breweries selected`);
		}

		//reset to default value just in case we enlarged the search
		radiusAmount = 10000; 

		

		//------------------create dynamic event listeners for new brewery BUTTONS 

		$(".js-show-more").click( event => {
				event.preventDefault();
				console.log('clicked');
				showAmount = showAmount + 6; 
				renderBreweryView(false);

		});

		$(".previous-button").click( event => {
				event.preventDefault();
				console.log('clicked', currentBrewery);
				currentBrewery = currentBrewery-6;
				if(currentBrewery < 0) {currentBrewery = 0};
				renderBreweryView();

		});

		$(".next-button").click( event => {
				event.preventDefault();
				console.log('clicked');
				currentBrewery = currentBrewery	+6;
				if((currentBrewery) >= breweryData.length) {
				currentBrewery = currentBrewery	-6;
				 return; 
				} else {
					renderBreweryView();
				  }

		});


		$("#js-brewery-list").on("click", ".js-add-brewery-button", function (event) {
      		event.preventDefault();
			
			userBreweries.push($(event.currentTarget).attr("data"));

			breweryData[parseInt($(event.currentTarget).attr("data"))].selected = true;

			console.log('clicked', userBreweries);

			$(event.currentTarget).parent().parent().find('.box').addClass("highlight");
			$(event.currentTarget).parent().parent().find('.check-mark').removeClass("hide");

			let step3text = "";

			if(userBreweries.length > 0){
			 	step3text = "Step 3: Selected " + userBreweries.length

			 	if(userBreweries.length >1) {
			  		step3text += " breweries to visit.";
				}  	else {
						step3text += " brewery to visit";
					}

			} else {
				step3text = "Step 3: Choose breweries to visit...";
				}

			$('.js-step3-txt').html(step3text);

			$('#js-breweries-selected-go-button').removeClass("greyed");

			$(event.currentTarget).removeClass('js-add-brewery-button').addClass('js-remove-brewery-button').html('Remove'); 

			$('.generate-trip').removeClass('hide'); 
			$('.generate-trip-button').html(`Generate Trip`);
			$('.trip-summary').html(`1 hike and ${userBreweries.length} breweries selected`);
			
		});

		$('.js-green-go-button').on('click', '.generate-trip', function (event) {
			event.preventDefault();
				$('.js-brewery-view').addClass('hide');
				$('#show-map').removeClass('hide');
				currentBrewery = 0;
				initMap();
		}); 


		$('#js-brewery-list').on('click', '.js-remove-brewery-button', function (event) {
      		event.preventDefault();
			
      		let breweryToRemove = userBreweries.indexOf($(event.currentTarget).attr("data"));

      		userBreweries.splice(breweryToRemove, 1);

      		breweryData[parseInt($(event.currentTarget).attr("data"))].selected = false;

      		$(event.currentTarget).parent().parent().find('.box').removeClass("highlight");
      		$(event.currentTarget).parent().parent().find('.check-mark').addClass("hide");

			let step3text = "";
			if(userBreweries.length > 0){
			 	step3text = "Step 3: Selected " + userBreweries.length


			 	if(userBreweries.length >1) {
			  	step3text += " breweries to visit.";
				}  else {
					step3text += " brewery to visit";
				}

				$('.trip-summary').html(`1 hike and ${userBreweries.length} breweries selected`);

			}	else {
					step3text = "Step 3: Choose breweries to visit...";
					$('.generate-trip').addClass('hide');
				}
			
		
			$('.js-step3-txt').html(step3text);

			$('#js-breweries-selected-go-button').removeClass("greyed");

			$(event.currentTarget).removeClass('js-remove-brewery-button').addClass('js-add-brewery-button').html('Add to list'); 



		});

		$("#js-breweries-selected-go-button").click( event => {
			event.preventDefault();
			console.log('clicked');
			$('.js-brewery-view').addClass('hide');
			$('#show-map').removeClass('hide');
			initMap();

		});

	} //else }



	}

//This function takes the data from the brewery API search, makes sure there is enough data, finds distances sorts it and then calls the renderer
function BreweryDataCallback(data, status){
		console.log("api call status: ", status);
		
		if(data.length < 7) {

			radiusAmount += 8000;

			if(radiusAmount >=60000) {
				if(data.length	<=0){
						console.log("no breweries nearby");
						breweryData = data;
						renderBreweryView();
						return;
					} else {
						console.log("few locations nearby");

						}
			} else {

				getBreweryDataFromGoogleApi( radiusAmount, BreweryDataCallback);


				return;
				}
		}

		breweryData = data;

		breweryData = breweryData.filter(b => {
			if( b.name.indexOf('Brewery') >= 0 || b.name.indexOf('Beer')  >= 0 || b.name.indexOf('Brewing')  >= 0 || b.name.indexOf('Beerworks')  >= 0) { 
				return true; 
					} else {
						return false;
					}
		});

		console.log("cleaned list ",breweryData.length);

		//get and add distance data
		breweryData.forEach(brewery => {

			brewery.distanceMi = findDistance(userLat, userLong, brewery.geometry.location.lat(), brewery.geometry.location.lng() ).distanceMi;
			brewery.selected = false;



				if(brewery.photos) {
					brewery.myImage = brewery.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500});
				} else {
											
						let randomNum = Math.floor(Math.random() * Math.floor(4) + 1);

						if(randomNum %2 == 0) { 
							brewery.myImage = "http://badgerheadgames.com/wp-content/uploads/2018/02/beer-2370783_1920-e1519612752761-1.jpg"; 
						} else {
								if(randomNum %3 == 0) { 
									brewery.myImage = "http://badgerheadgames.com/wp-content/uploads/2018/02/pexels-photo-597461.jpeg";
								} else 
									{
										if(randomNum %5 == 0) { 
											brewery.myImage = "http://badgerheadgames.com/wp-content/uploads/2018/02/yutacar-28290-unsplash.jpg";
										} else {
											brewery.myImage = "http://badgerheadgames.com/wp-content/uploads/2018/02/pexels-photo-681847.jpeg";
											}
									} 

							}
					}

			});

		//breweryData[i].distanceMi = findDistance(userLat, userLong, breweryData[i].geometry.location.lat(), breweryData[i].geometry.location.lng() ).distanceMi; 


		//sort the data based on distance 

		breweryData.sort((a, b) => a.distanceMi - b.distanceMi);

		//console.log("getting data: ", data);
				console.log("sorted data: ", breweryData);


		let brewerylistContent = '';

		let breweryCount = data.length;

		renderBreweryView();

		//if(breweryCount > 6) breweryCount = 6; 
	}


//UTILITY FUNCTIONS ------------------------

//Rounds numbers to the tenths place - used for displaying distances neatly
	function precisionRound(number, precision) {
  		let factor = Math.pow(10, precision);
  		return Math.round(number * factor) / factor;
	}


//---function to calculate distance with lat / long
	
		
	/* Based on original script formula by Andrew Hedges, andrew(at)hedges(dot)name used under the MIT license- not recomended to use this code for actual geospatial navigation  */
	function findDistance(latA, lonA, latB, lonB) {

		console.log("finding distance between:",latA, lonA, latB, lonB);

		let Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
		let Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator

		let t1, n1, t2, n2, lat1, lon1, lat2, lon2, dlat, dlon, a, c, dm, dk, mi, km;
		
		// get values for lat1, lon1, lat2, and lon2
		t1 = latA;
		n1 = lonA;
		t2 = latB;
		n2 = lonB;
		console.log("finding t distance between:", t1, t2);

		// convert coordinates to radians
		lat1 = deg2rad(t1);
		lon1 = deg2rad(n1);
		lat2 = deg2rad(t2);
		lon2 = deg2rad(n2);
		console.log("finding deg2rad", lat1, lon1, lat2, lon2);

		// find the differences between the coordinates
		dlat = lat2 - lat1;
		dlon = lon2 - lon1;
		console.log("dlat dlon",dlat, dlon );


		// here's the heavy lifting
		a  = Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2),2);
		c  = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); // great circle distance in radians
		dm = c * Rm; // great circle distance in miles
		dk = c * Rk; // great circle distance in km
		
		console.log("dm dk ",dm, dk);

		// round the results down to the nearest 1/1000
		mi = round(dm);
		km = round(dk);
		
		
		return {distanceMi: mi, distanceKm: km };
	}
	
	
	// convert degrees to radians
	function deg2rad(deg) {
		rad = deg * Math.PI/180; // radians = degrees * pi/180
		return rad;
	}
	
	
	// round to the nearest 1/1000
	function round(x) {
		return Math.round( x * 1000) / 1000;
	}


//Function currently not used but could be used to give user more info
	function parseBreweryDetails(place, status)
	{
		let newbrewerylistContent = ""; 

		console.log(status, place);

		breweryDetails.push( {
			name: place.name,
			id: place.place_id,
			latlong: place.geometry.location
		});

		let breweryIndex = breweryDetails.length - 1;

		newbrewerylistContent += `<li>
						<img class="img-hikes" src="http://badgerheadgames.com/wp-content/uploads/2018/02/beer-2370783_1920-e1519612752761-1.jpg" alt="${place.name}">
						<p class="brewery-name">${place.name}<br />
						Location: ${place.vicinity} - <br />
						Rating: ${place.rating} stars</p>
						<button name="brewery" id="brewery${place.place_id}" data="${breweryIndex}" class="js-add-brewery-button"> Add to list</button>`;

		if(place.reviews){
			newbrewerylistContent += `<p class="brewery-review">Recent Review: ${place.reviews[0].text}</p>`;
		}
							
		newbrewerylistContent += `</li>`;

		$(`#${place.place_id}`).html(newbrewerylistContent);		

	}


	function organizeSelectedBreweries()
	{

		let userSelectedBreweryData = [];

		for(let i = 0; i < userBreweries.length; i++)
		{
			userSelectedBreweryData.push( breweryData[i] );
		} 

		userSelectedBreweryData.sort((a, b) => a.distanceMi - b.distanceMi);

		return userSelectedBreweryData; 
	}

//------------------------- MAP FUNCTIONS
//
//
//
//---------------------------------------

	function initMap() {

		document.body.scrollTop = 0;
    	document.documentElement.scrollTop = 0;
    	
    	$('.generate-trip').addClass('hide');


	let myBreweryData = organizeSelectedBreweries(); 

	console.log("my brewery data", myBreweryData);

        let myLatLng = {lat: userLat, lng: userLong};

        // Create a map object and specify the DOM element for display.
       // let bhmap
        map = new google.maps.Map(document.getElementById('final-map'), {
          center: myLatLng,
          zoom: 11,
          gestureHandling: 'cooperative'
        });

        //console.log("brewery array", breweryDetails[userBreweries[0]]);

        // Create a marker and set its position.
        let hikeMarker = 'http://badgerheadgames.com/wp-content/uploads/2018/03/greenmarker.png';
        let marker = new google.maps.Marker({
          map: map,
          position: myLatLng,
          title: `${hikeData.trails[userHikes[0]].name}`,
          icon: hikeMarker
        });

       let infowindowH = new google.maps.InfoWindow({
          	content: `${hikeData.trails[userHikes[0]].name}`,
          	maxWidth: 200
        	});

       		//have hike pop up open
	         infowindowH.open(map, marker);

	         marker.addListener('click', function() {
          	infowindowH.open(map, marker);
        	});

	        let directionsService = new google.maps.DirectionsService;
        	let directionsDisplay = new google.maps.DirectionsRenderer();
        	//{suppressMarkers: true});
 
  

        	directionsDisplay.setMap(map);
        	directionsDisplay.setPanel(document.getElementById('directions-panel'));

      
        let waypts = [];
        let markers = [];
        let infoWindows = [];
        let brewMarker = 'http://badgerheadgames.com/wp-content/uploads/2018/03/orangemarker.png';


        let mapItineraryContent = "";

        mapItineraryContent += `<li class="hike-card"><img class="img-plan-page" src="${hikeData.trails[userHikes[0]].hikeImage}" alt="${hikeData.trails[userHikes[0]].name}"> 
								<p class="hike-name"><span class="info-bold">${hikeData.trails[userHikes[0]].name}</span></p>
								<p class="hike-summary">${hikeData.trails[userHikes[0]].summary}</p>
								<p class="hike-info"><span class="info-bold">Distance:</span> ${hikeData.trails[userHikes[0]].length}<br>
								<span class="info-bold">Difficulty:</span> ${hikeData.trails[userHikes[0]].difficulty}<br>
								<span class="info-bold">Rating:</span> ${hikeData.trails[userHikes[0]].stars}/5</p>
								</li>`;

        for (let i = 0; i < myBreweryData.length; i++)
        {
        	marker[i] = new google.maps.Marker({
	          map: map,
	          position: myBreweryData[i].geometry.location,
	          title: myBreweryData[i].name,
	          icon: brewMarker
	        });

	        if(i < (myBreweryData.length- 1)) {
	        	waypts.push({
           			location: {'placeId': myBreweryData[i].place_id},
              		stopover: true
            	});
	        }

	         infoWindows[i] = new google.maps.InfoWindow({
          	content: `${myBreweryData[i].name}`,
          	maxWidth: 200
        	});

	         marker[i].addListener('click', function() {
          	infoWindows[i].open(map, marker[i]);
        	});

	        console.log("placing"+myBreweryData[i].name);



			mapItineraryContent += `<li id='${i}' class="brewery-card">
										<img class="img-plan-page" src="${myBreweryData[i].myImage}" alt="${myBreweryData[i].name}">
										<p class="brewery-name"><span class="info-bold">${myBreweryData[i].name}</span></p>
										<p class="brewery-summary"><span class="info-bold">Address:</span> ${myBreweryData[i].vicinity}</p>
										<p class="brewery-summary"><span class="info-bold">Rating:</span> ${myBreweryData[i].rating}</p>
										</li>`;

			
		}

		

		$('.map-intinerary').html(mapItineraryContent);

		renderProgressSection(4);

		$('.js-directions-button').click(event => {
			event.preventDefault();
			if(!directionShowing){
				directionShowing = true;

				$('#directions-panel').removeClass('hide');

				if(!directionsGenerated){
					calculateAndDisplayRoute(directionsService, directionsDisplay, waypts, myBreweryData);
				}
					$('.js-directions-button').html('Hide Directions');
				} else {
					$('#directions-panel').addClass('hide');
					$('.js-directions-button').html('Show Directions');
					directionShowing = false;
				}
		});

    }

 function calculateAndDisplayRoute(directionsService, directionsDisplay, waypts, myBreweryData) {
 		
 		console.log(breweryData[0]);

    	let myLatLng = {lat: userLat, lng: userLong};
		let endlatlong = {lat: myBreweryData[myBreweryData.length-1].geometry.location.lat(), lng: myBreweryData[myBreweryData.length-1].geometry.location.lng()};

        directionsService.route({
          origin: myLatLng,
          destination: endlatlong,
          waypoints: waypts,
          optimizeWaypoints: true,
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
            directionsGenerated = true;
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
  }


//API CALLS ------------------------------------------------

	function getHikeDataFromApi(searchTerm, latitude, longitude, maxDistance, callback) {

		const HIKE_SEARCH_URL = 'https://www.hikingproject.com/data/get-trails';

		const query = {
		  lat: latitude,
		  lon: longitude,
		  maxDistance: maxDistance,
		  key: '200222039-9fe0c8f1c7fdd7389cb046d84ce4f77e'
		};

		$.getJSON(HIKE_SEARCH_URL, query, callback);
	}

	function getBreweryDataFromGoogleApi(radius, callback) {
		
	 userLoc = new google.maps.LatLng(userLat,userLong);

	 map = new google.maps.Map(document.getElementById('final-map'), {
	      center: userLoc,
	      zoom: 13
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

//Function that can call the Place Detail part of Google Maps. Get more info like user reviews. Future feature
	function getBreweryDetailDataFromGoogleApi(placeID, callback) {

		console.log(placeID);

	 let request = {
	  	placeId: `${placeID}`
		};

		console.log(request);

	service = new google.maps.places.PlacesService(map);
	service.getDetails(request, callback);

		
	}

	function getLocationFromGooglePlacesApi()
	{

		map = new google.maps.Map(document.getElementById('final-map'), {
	      center: userLoc,
	      zoom: 11
	    });
		 console.log("getting input");
		let input = document.getElementById('auto-complete-location'); 
		
		 console.log("setting up auto", input);

		 let countryRestrict = {'country':  ['us', 'ca']};

		autocomplete = new google.maps.places.Autocomplete(input,
								{
              						types: ['(cities)'],
              						componentRestrictions: countryRestrict
            						});

		autocomplete.addListener('place_changed', function() { 
							console.log("AutoComplete	listener");

							google.maps.event.clearInstanceListeners(autocomplete);
							//autocomplete.clearInstanceListeners(marker);

			handleChange("notbutton"); });

		var searchButton = document.getElementById('js-pick-loc-button');
       // searchButton.onclick = function() {
       //	console.log("search button on click");

        //  handleChange("button");
       // };

		function handleChange(submitType) {

				console.log("in handle change", buttonClicked);

          console.log(autocomplete);
          
          let place;
          place = autocomplete.getPlace();
          console.log(place);

          if(buttonClicked && place == undefined) {
          	
	          let placeName = autocomplete.gm_accessors_.place.dd.predictions[0].b;

	           
	          	console.log("oops no data...");
		            // User entered the name of a Place that was not suggested and
		            // pressed the Enter key, or the Place Details request failed.
		          
		       		autocompleteService = new google.maps.places.AutocompleteService();
		        	autocompleteService.getPlacePredictions(
			        	{
			                'input': placeName,
			                'offset': placeName.length,
			                'componentRestrictions': {'country':  ['us', 'ca']},
			                'types': ['(cities)']
			            },
			            function listentoresult(list, status) {
			                if(list == null || list.length == 0) {
			                    // There are no suggestions available.
			                    // The user saw an empty list and hit enter.
			                    console.log("No results");
			                } else {
			                    console.log("we have some autocomplete results to look at");
			                    placesService = new google.maps.places.PlacesService(map);
			                    placesService.getDetails(
			                        {'reference': list[0].reference},
			                        function detailsresult(detailsResult, placesServiceStatus) {
			                            // Here's the first result in the AutoComplete 
			                            console.log("We selected the first item from the list automatically because the user didn't select anything");
			                            console.log(detailsResult);
			                            console.log(detailsResult.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500}));

			                            userLocationChoice = detailsResult.name; 

			                            getHikeDataFromApi("",detailsResult.geometry.location.lat(),detailsResult.geometry.location.lng(),30, renderHikeView);
			                        }
			                    );
			                }
			            }
		        	);
    		
          	} else {
          		          console.log("we have some data and button click was", buttonClicked	);



			  place = autocomplete.getPlace();
         
	          if (!place.geometry) {

	          	console.log("oops no data...");
		            // User entered the name of a Place that was not suggested and
		            // pressed the Enter key, or the Place Details request failed.
		          
		       		autocompleteService = new google.maps.places.AutocompleteService();
		        	autocompleteService.getPlacePredictions(
			        	{
			                'input': place.name,
			                'offset': place.name.length,
			                'componentRestrictions': {'country':  ['us', 'ca']},
			                'types': ['(cities)']
			            },
			            function listentoresult(list, status) {
			                if(list == null || list.length == 0) {
			                    // There are no suggestions available.
			                    // The user saw an empty list and hit enter.
			                    console.log("No results");
			                } else {
			                    console.log("we have some autocomplete results to look at");
			                    placesService = new google.maps.places.PlacesService(map);
			                    placesService.getDetails(
			                        {'reference': list[0].reference},
			                        function detailsresult(detailsResult, placesServiceStatus) {
			                            // Here's the first result in the AutoComplete 
			                            console.log("We selected the first item from the list automatically because the user didn't select anything");
			                            console.log(detailsResult);
			                            console.log(detailsResult.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500}));

			                            userLocationChoice = detailsResult.name; 

			                            getHikeDataFromApi("",detailsResult.geometry.location.lat(),detailsResult.geometry.location.lng(),30, renderHikeView);
			                        }
			                    );
			                }
			            }
		        	);
	    		} else { 
	    			console.log	("we had good data", buttonClicked);
	    			userLocationChoice = place.name;
	    			getHikeDataFromApi("",place.geometry.location.lat(),place.geometry.location.lng(),30, renderHikeView);

	          		console.log("auto place", place);

    				}

         
			}
		}
	}

//Function to get user input on first page from drop down menu

	function getLocationAndCallHikesAPI(userLocChoice){

		var geocoder = new google.maps.Geocoder();

		var address = userLocChoice;

        geocoder.geocode(
        	{'address': address, 
    		 'componentRestrictions': {
            'country': 'US'
             }
        }, function(results, status) {
          if (status === 'OK') {
            console.log("geo coder found -", results[0]); //.geometry.location

            if(results[0].formatted_address != "United States"){

           		getHikeDataFromApi("",results[0].geometry.location.lat(), results[0].geometry.location.lng(),30, renderHikeView);
           		console.log("got hikes");
           		return;
            }
        } 

                 console.log("after ok status if");

                 $('.modal-text').html(`Oops, can't seem to find hikes near the location you entered. Please type a new location - like a city or park.`);
				 $('.modal').removeClass('hide');
				 $('.sk-circle').addClass('hide');
				 $('#modal-button-container').removeClass('hide');

				$('#modal-button-container').on("click", '.modal-button', function (event) {
      				event.preventDefault();
					$('.sk-circle').removeClass('hide');
				 	$('#modal-button-container').addClass('hide');
					$('.modal').addClass('hide');

					});



     			 
    				//userLocationChoice = "Charlottesville";
    				//getHikeDataFromApi("",38.0293,-78.4767,30, renderHikeView);
          
      });
        



	if(userLocChoice == "Great Falls") { 
				userLat = 38.9982;
				userLong = -77.2883;
				getHikeDataFromApi("",38.9982,-77.2883,30, renderHikeView);
			}
			if(userLocChoice === "Charlottesville") {
			userLat = 38.0293;
				userLong = -78.4767; 
			getHikeDataFromApi("",38.0293,-78.4767,30, renderHikeView);
		}
			if(userLocChoice === "Harrisonburg") { 
				userLat = 38.4496;
				userLong = -78.8689; 
			getHikeDataFromApi("",38.4496,-78.8689,30, renderHikeView);
		}
			if(userLocChoice === "Roanoke") { 
				userLat = 37.2710;
				userLong = -79.9414; 
			getHikeDataFromApi("",37.2710,-79.9414,30, renderHikeView);
		}	
	}

let buttonClicked = false;

	$(".js-pick-location-button").click( event => {
			event.preventDefault();
			console.log('clicked js-pick-location-button');
			//userLocationChoice = $("select").val(); 
			userLocationChoice = $("#search").val(); 

			console.log("location"+userLocationChoice);
			//buttonClicked = true;

			//google.maps.event.trigger(autocomplete, 'place_changed');

			getLocationAndCallHikesAPI(userLocationChoice);
			 
		} );

$(".feature-link").click( event => {
			event.preventDefault();
			userLocationChoice =$(event.currentTarget).text();

			getLocationAndCallHikesAPI( userLocationChoice);
		});


}

//Check for animation browser compatibility for IE0 and replace the css3 animation with a gif in the loading modal
function browserSupportsCSSProperty(propertyName) {
  var elm = document.createElement('div');
  propertyName = propertyName.toLowerCase();

  if (elm.style[propertyName] != undefined)
    return true;

  var propertyNameCapital = propertyName.charAt(0).toUpperCase() + propertyName.substr(1),
    domPrefixes = 'Webkit Moz ms O'.split(' ');

  for (var i = 0; i < domPrefixes.length; i++) {
    if (elm.style[domPrefixes[i] + propertyNameCapital] != undefined)
      return true;
  }

  return false;
}


//on page load
$(function() {

	main();
});






//Harrisonburg Va / Shendandoah Valley  38.4496° N, 78.8689° W
//Roanoke Va, Southern VA 37.2710° N, 79.9414° W
//Great Falls VA 38.9982° N, 77.2883° W
//Charlottesville VA 38.0293° N, 78.4767° W
