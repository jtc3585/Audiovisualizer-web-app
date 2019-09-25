var app = app || {};

app.utilities = (function(){ 

	function makeColor(red, green, blue, alpha) {
	
		let color='rgba('+red+','+green+','+blue+', '+alpha+')';
		return color;
	}
	
	return{
		makeColor
	};
})();