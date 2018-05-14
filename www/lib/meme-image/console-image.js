/**
 * Dubiously created by Adrian Cooney
 * http://dunxrion.github.io
 */

(function(console) {
	"use strict";

	var canvas = document.createElement("canvas");

	function drawMemeText(ctx, type, size, fontColor, strokColor, text, width, y) {
		if (text) {
			text = text.toUpperCase();
			drawText(ctx, size, text, fontColor, strokColor, width/2, y);
		}
	}

	function drawText(ctx, size, text, fontColor, strokColor, x, y) {
		//Set the text styles
		ctx.font = "bold " + size + "px Impact";
		ctx.fillStyle = '#' + fontColor;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#' + strokColor;
		ctx.strokeText(text, x, y);
		ctx.fillText(text, x, y);
	}
	function wrap(text, num) {
		var output = [],
			split = text.split(" ");

		var str = [];
		for(var i = 0, cache = split.length; i < cache; i++) {
			if((str + split[i]).length < num) str.push(split[i])
			else {
				output.push(str.join(" "));
				str.length = 0;
				str.push(split[i]);
			}
		}

		//Push the final line
		output.push(str.join(" "));

		return output;
	}
	console.meme = function(upper, lower, image, upperSize, lowerSize, upperFontColor, upperStrokColor, lowerFontColor, lowerStrokColor) {
		if(!upper && !lower && !image) return console.log('Image Required');
		
			var ctx = canvas.getContext("2d"),
			_w = 500, _h = 500; 
			
			// ctx.clearRect(0,0,width,height);

		var img = new Image();
    		img.setAttribute('crossOrigin','anonymous');
		img.onload = function() {
			_w = window.innerWidth - 20;
			_h = img.naturalHeight;
			canvas.width = _w;
			canvas.height = img.naturalHeight;

			// var text = upper.toUpperCase();

			//Draw the background
			ctx.drawImage(this, 0, 0, _w, _h);

			drawMemeText(ctx, "upper", upperSize, upperFontColor, upperStrokColor, upper, _w, 25); //upper
			drawMemeText(ctx, "lower", lowerSize, lowerFontColor, lowerStrokColor, lower, _w, _h - 30); //lower

			//my lil' hack
			canvas.id = 'myCanvas';
			$('.canvas').html(canvas);
			
		};

		var url = image;
		img.src = url; //"http://www.corsproxy.com/" + url.replace(/https?:\/\//, "");
	};
})(console);