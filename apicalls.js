

//const YOUTUBE_SEARCH_URL = 'http://beermapping.com/webservice/loccity/66bbabba983697bf56465bf8e1a3de0e/Charlottesville,va&s=json';
const YOUTUBE_SEARCH_URL = 'https://www.hikingproject.com/data/get-trails?lat=38.6647&lon=-78.4581&maxDistance=20&key=200222039-9fe0c8f1c7fdd7389cb046d84ce4f77e';

function getDataFromApi(searchTerm, callback) {



	const query = {
	  
	};

	$.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}

function callb(data, status)
{
	console.log("getting data: ", data);


}

//getDataFromApi("", callb);