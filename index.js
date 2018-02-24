function main(){

	$(".js-pick-hike").click( event => {
		event.preventDefault();
		console.log('clicked');
		$('body').scrollTop( $('.map-view').offset().top);
	} );


	function renderLocationView(){

	}

	function renderHikeView(){

	}

	function renderBreweryView(){

	}


$(".js-pick-location-button").click( event => {
		event.preventDefault();
		console.log('clicked');
		let userLocationChoice = $("select").val(); 
		console.log("location"+userLocationChoice);
	} );

}




//on page load
$(function() {
  main();
});
