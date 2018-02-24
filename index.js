function main(){

$(".js-pick-hike").click( event => {
	event.preventDefault();
	console.log('clicked');
	$('body').scrollTop( $('.map-view').offset().top);
} );


}

//on page load
$(function() {
  main();
});
