if (Meteor.isClient) {

	var commons = true;

	Template.flickr.onRendered(function(){
		$("#search").focus();
	})

  	Template.flickr.events({
  		
  		'click .checkbox': function(event){
  			event.preventDefault();
  			var img = $(".cc");
  			if(img.hasClass("on")){
  				img.removeClass("on");
  				img.addClass("off");
  				img.attr("src","/cc-off.png");
  				commons = false;
  			} else {
  				img.removeClass("off");
  				img.addClass("on");
  				img.attr("src","/cc-on.png");
  				commons = true;
  			}
  			$("#search").focus();
  		},

	  	'keyup #search': _.throttle(function(event){
	  		var query = event.target.value.trim();
	  		query = query.replace(/\s/g,"+");

	  		if(query){
	  			Meteor.call('flickrInstant', query, commons, function(err, res){
	  				//console.log(err);
	  				// console.log(res);
	  				if(res){
	  					$("#image").attr("src", res);
	  				} else {
	  					$("#image").attr("src", "/no_image.png");
	  				}
	  				
	  			})
	  		} else {
	  			$("#image").attr("src", "/placeholder.png");
	  		}
	  	},200)

  	})
}

Router.route('/', function(){
	this.render('flickr');
})

if (Meteor.isServer) {	

	var key = Meteor.settings.flickrKey;

	var apiCall = function(apiUrl, callback) {

		try {
			var response = JSON.parse(HTTP.get(apiUrl).content);
			response = response["photos"]["photo"][0];
			response = "https://farm"+response["farm"]+".staticflickr.com/"+response["server"]+"/"+response["id"]+"_"+response["secret"]+".jpg";
			callback(null, response);
		} catch (error) {
			var myError = new Meteor.Error(500, 'Faced some problem');
			callback(myError, null);
		}
	}

	Meteor.methods({
		

		'flickrInstant': function(query, commons){
			this.unblock();
			var apiUrl = "";
			//date-posted-asc, date-posted-desc, date-taken-asc, date-taken-desc, interestingness-desc, interestingness-asc, and relevance
			var sortOrder = ["date-posted-asc", "date-posted-desc", "date-taken-asc", "relevance", "interestingness-desc", "interestingness-asc", "date-taken-desc"]
			var sort = sortOrder[Math.floor(Math.random()*(sortOrder.length))];
			// doesnt work if you change is_commons in url to false
			if(commons){
				apiUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+key+"&text="+query+"&sort="+sort+"&privacy_filter=1&content_type=1&media=photos&is_commons=true&per_page=1&format=json&nojsoncallback=1"
			} else {
				apiUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+key+"&text="+query+"&sort="+sort+"&privacy_filter=1&content_type=1&media=photos&per_page=1&format=json&nojsoncallback=1"
			}

			//var apiUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+key+"&text="+query+"&sort=interestingness-desc&privacy_filter=1&content_type=1&media=photos&is_commons="+is_commons+"&per_page=1&format=json&nojsoncallback=1"
			//console.log(apiUrl);
			var response = Meteor.wrapAsync(apiCall)(apiUrl);
			
			//response = "https://www.flickr.com/photos/"+response["owner"]+"/"+response["id"];
			return response;
		}
	})
}

