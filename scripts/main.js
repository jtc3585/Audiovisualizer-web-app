var app = app || {};

app.main = (function(){
	"use strict";
			
	//Starter variables. Used to set how the app looks on start up
	let sound1 = 'media/The Joy of Painting.mp3';
	let sound2 = 'media/The Pixard Song.mp3';
	let sound3 = 'media/New Adventure Theme.mp3';
	
	let audioElement, audioCtx;
	let sourceNode, analyserNode;
	let NUM_SAMPLES = 256;
	let biquadFilter;
	let highshelf = false;
	let highFilterGain = 15;
	let lowShelfBiquadFilter;
	let lowshelf = false;
	let lowFilterGain = 15;
	
	let canvas,ctx;
	let invert, tint, noise;
	let rainbow;
	let tintColor = "red";
	let barColor = "white";
	let lineColor = "white";
	let backgroundColor = "paint1";
	let curveColor = "white";
	let circleColor = "white";
	let circleRadius = 5;
	let showBars = true;
	let showLines = true;
	let showCurves = false;
	let showCircles = false;
	let dataForm = "frequency";
	
	let bobIcon = new Image();
	let rainBobIcon = new Image();
	let windowBobIcon = new Image();
	let paintImage1 = new Image();		
	let paintImage2 = new Image();
	let paintImage3 = new Image();	
	let showBob = false;
	let showRainBob = false;
	let showWindowBob = true;
	let showNoBob = false;
	let showPaint1 = false;
	let showPaint2 = false;
	let showPaint3 = false;
	
	function init(){
		// set up canvas and images
		canvas = document.querySelector('canvas');
		ctx = canvas.getContext("2d");
		bobIcon.src = 'media/bob.png';
		rainBobIcon.src = 'media/rainbob.png';
		windowBobIcon.src = 'media/windowbob.png';
		paintImage1.src = 'media/paint1.jpg';
		paintImage2.src = 'media/paint2.jpg';
		paintImage3.src = 'media/paint3.jpg';
		//set gradient to use later
		rainbow = ctx.createLinearGradient(0,canvas.height/2,canvas.width,canvas.height/2);
		rainbow.addColorStop(0,"violet");
		rainbow.addColorStop(.2,"blue");
		rainbow.addColorStop(.4,"green");
		rainbow.addColorStop(.6,"yellow");
		rainbow.addColorStop(.8,"orange");
		rainbow.addColorStop(1,"red");
		
		// audio setup
		setupWebaudio();
		
		
		// interface setup
		setupUI();
		
		// start animation loop
		update();
		
	}

		function setupWebaudio(){
			// 1 - The || is because WebAudio has not been standardized across browsers yet
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			audioCtx = new AudioContext();
			
			// 2 - get a reference to the <audio> element on the page
			audioElement = document.querySelector("audio");
			audioElement.src = sound1;
			
			// 3 - create an a source node that points at the <audio> element
			sourceNode = audioCtx.createMediaElementSource(audioElement);
			
			// 4 - create an analyser node
			analyserNode = audioCtx.createAnalyser();
			
			/*
			We will request NUM_SAMPLES number of samples or "bins" spaced equally 
			across the sound spectrum.
			
			If NUM_SAMPLES (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
			the third is 344Hz. Each bin contains a number between 0-255 representing 
			the amplitude of that frequency.
			*/ 
			
			// fft stands for Fast Fourier Transform
			analyserNode.fftSize = NUM_SAMPLES;
			
			//Set audio nodes for user interaction
			biquadFilter = audioCtx.createBiquadFilter();
			biquadFilter.type = "highshelf";
			
			lowShelfBiquadFilter = audioCtx.createBiquadFilter();
			lowShelfBiquadFilter.type = "lowshelf";
			
			// 5 - create a gain (volume) node
			//gainNode = audioCtx.createGain();
			//gainNode.gain.value = 1;
			
			// 6 - connect the nodes - we now have an audio graph
			sourceNode.connect(biquadFilter);
			biquadFilter.connect(lowShelfBiquadFilter);
			lowShelfBiquadFilter.connect(analyserNode);
			analyserNode.connect(audioCtx.destination);
		}
	
		//Used to set up anything the user can change and manages their choices through events that change whats on screen
	function setupUI(){
	
		//Song drop down
		document.querySelector("#trackSelect").onchange = function(e) {
			audioElement.src = e.target.value;
			
			document.querySelector('#nowPlaying').innerHTML = "Now playing: " + e.target.value;
		};
		
		//User slider for the highpass intensity and the checkbox for activation
		let highSlider = document.querySelector("#highGainSlider");
		highSlider.oninput = e => {
			highFilterGain = e.target.value;
			highFilterLabel.innerHTML = e.target.value;
						toggleHighshelf();
		};
		highSlider.dispatchEvent(new InputEvent("input"));
				
		document.querySelector('#highshelfCB').checked = highshelf;
		document.querySelector('#highshelfCB').onchange = e => {
			highshelf = e.target.checked;
			toggleHighshelf();
		};
		toggleHighshelf();
		
		//User slider for the lowpass intensity and the checkbox for activation
		let lowSlider = document.querySelector("#lowGainSlider");
		lowSlider.oninput = e => {
			lowFilterGain = e.target.value;
			lowFilterLabel.innerHTML = e.target.value;
					toggleLowshelf();
		};
		lowSlider.dispatchEvent(new InputEvent("input"));		
	
		document.querySelector('#lowshelfCB').checked = lowshelf;
		document.querySelector('#lowshelfCB').onchange = e => {
			lowshelf = e.target.checked;
			toggleLowshelf();
		};
		toggleLowshelf();
		
		// Activates or deactivates the tint filter, user can change its color
		document.querySelector("#checkbox1").onclick = function() {
			
			if (this.checked) { tint = true; }
			else { tint = false; }
		};
		document.querySelector("#tintStyleChooser").onchange = function(e) {
		
			tintColor = e.target.value;
		};
		
		// User can change which type of audio data they want to visualize
		document.querySelector("#formStyleChooser").onchange = function(e) {
		
			dataForm = e.target.value;
		};
		
		// Activates or deactivates the invert filter
		document.querySelector("#checkbox2").onclick = function() {
			
			if (this.checked) { invert = true; }
			else { invert = false; }
		};
		
		// Activates or Deactivates  the noise filter
		document.querySelector("#checkbox3").onclick = function() {
			
			if (this.checked) { noise = true; }
			else { noise = false; }
		};
		
		// Activates or deactivates the drawing of bars
		document.querySelector("#checkbox4").onclick = function() {
			
			if (this.checked) { showBars = true; }
			else { showBars = false; }
		};
		
		// Activates or deactivates the drawing of lines		
		document.querySelector("#checkbox5").onclick = function() {
			
			if (this.checked) { showLines = true; }
			else { showLines = false; }
		};		
		
		// Sets the users choice of color up and onto the bars
		document.querySelector("#barStyleChooser").onchange = function(e) {
		
			barColor = e.target.value;
		};		
		
		// Sets the users choice of color up and onto the circles
		document.querySelector("#circleStyleChooser").onchange = function(e) {
		
			circleColor = e.target.value;
		};		
		
		// brings the AV up into full screen
		document.querySelector("#fullscreen").onclick = function() {
			requestFullscreen(canvas);
		};		
		
		// button from icon state machine, shows a bob variant or no bob at all based on the users input
		document.querySelector("#showBobRadio").onclick = function() {
		
			if (this.checked) { showBob = true;
								showRainBob = false;
								showWindowBob = false;
								showNoBob = false;}
			else { showBob = false; }
		};
		document.querySelector("#showRainBobRadio").onclick = function() {
		
			if (this.checked) { showRainBob = true;  
								showBob = false;
								showWindowBob = false;
								showNoBob = false;}
			else { showRainBob = false; }
		};
		document.querySelector("#showWindowBobRadio").onclick = function() {
		
			if (this.checked) { showWindowBob = true;
								showBob = false;
								showRainBob = false;
								showNoBob = false;}
			else { showWindowBob = false; }
		};
		document.querySelector("#showNoBobRadio").onclick = function() {
		
			if (this.checked) { showNoBob = true; 
								showBob = false;
								showRainBob = false;
								showWindowBob = false;}
			else { showNoBob = false; }
		};		
		
		// Sets the users choice of background up and onto the canvas		
		document.querySelector("#backgroundStyleChooser").onchange = function(e) {
		
			backgroundColor = e.target.value;
		};
		
		// Sets the users choice of color up and onto the lines		
		document.querySelector("#lineStyleChooser").onchange = function(e) {
		
			lineColor = e.target.value;
		};		
		
		// Activates or deactivates the drawing of curves			
		document.querySelector("#checkbox6").onclick = function() {
			
			if (this.checked) { showCurves = true; }
			else { showCurves = false; }		
		};
		
		// Activates or deactivates the drawing of circles			
		document.querySelector("#checkbox7").onclick = function() {
			
			if (this.checked) { showCircles = true; }
			else { showCircles = false; }		
		};		
		
		// Sets the users choice of color up and onto the curves			
		document.querySelector("#curveStyleChooser").onclick = function(e) {
			
			curveColor = e.target.value;
		};
		
		// User slider for circle radius
		let radiusSlider = document.querySelector("#circleRadiusSlider");
		radiusSlider.oninput = e => {
			circleRadius = e.target.value;
			circleRadiusLabel.innerHTML = e.target.value;
		};
		radiusSlider.dispatchEvent(new InputEvent("input"));
		
	}
	

	// Gets whats on the canvas visually and manipulates it
	function manipulatePixels() {
	
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		
		let data = imageData.data;
		let length = data.length;	
		let width = imageData.width;
		
		for (let i = 0; i < length; i += 4) {
			if (tint) {
					// R G B A values are indexed through data[] in that order
				if(tintColor == "red")
				{
					data[i] = data[i] + 100;
				}
				if(tintColor == "blue")
				{
					data[i+2] = data[i+2] + 100;
				}
				if(tintColor == "green")
				{
					data[i+1] = data[i+1] + 100;
				}
							
			}
			if (invert) {
				let red = data[i], green = data[i+1], blue = data[i+2];
				data[i] = 255 - red;
				data[i+1] = 255 - green;
				data[i+2] = 255 - blue;
			}
			if (noise && Math.random() < .10) {
				data[i] = data[i+1] = data[i+2] = 128; // gray noise
			}
		}
		
		ctx.putImageData(imageData, 0, 0);
	}
	
	// Draws and keeps values up to date
	function update() { 
		// this schedules a call to the update() method in 1/60 seconds
		requestAnimationFrame(update);
		
		/*
			Nyquist Theorem
			http://whatis.techtarget.com/definition/Nyquist-Theorem
			The array of data we get back is 1/2 the size of the sample rate 
		*/
		
		// create a new array of 8-bit integers (0-255)
		let audioData = new Uint8Array(NUM_SAMPLES/2); 
		
		// populate the array with the frequency data
		// notice these arrays can be passed "by reference" 
		
		// Uses the data format the user has selected, the default is on the top of main
		if(dataForm =="frequency"){
			analyserNode.getByteFrequencyData(audioData); // frequency data
		}
		if(dataForm=="waveform")
		{
			analyserNode.getByteTimeDomainData(audioData); // waveform data
		}
		

		
		// DRAW!
		ctx.clearRect(0,0,1200,650);  
		
		ctx.fillStyle = backgroundColor;

		ctx.fillRect(0,0,1200,650);		
		
		// All part of the background state machine system connected to the radio button group through DOM
		if(backgroundColor == "paint1")
		{
			ctx.drawImage(paintImage1, 0, 0);
		}
		
		if(backgroundColor == "paint2")
		{
			ctx.drawImage(paintImage2, 0, 0);
		}
		
		if(backgroundColor == "paint3")
		{
			ctx.drawImage(paintImage3, 0, 0);
		}
		
		if(backgroundColor == "rainbow")
		{
			ctx.fillStyle = rainbow;
			ctx.fillRect(0,0,1200,650);
		}
		
		if(showBob){
			ctx.drawImage(bobIcon, 400, 200);
		}
		
		if(showRainBob){
			ctx.drawImage(rainBobIcon, 400, 200);
		}
		
		if(showWindowBob){
			ctx.drawImage(windowBobIcon, 400, 200);
		}
		
		//VISUALIZE
		let barWidth = 4;
		let barSpacing = 2;
		let barHeight = 100;
		let topSpacing = 50;
		if(showBars){
			// loop through the data and draw!
			for(let i=0; i<audioData.length; i++) { 
				ctx.fillStyle = barColor; 
				
				// the higher the amplitude of the sample (bin) the taller the bar
				// left side
				ctx.fillRect(1100 - audioData[i],i * (barWidth + barSpacing),barHeight,barWidth); 
				
				// right side
				ctx.fillRect(audioData[i],i * (barWidth + barSpacing), barHeight,barWidth); 				
				
			}		 		
		}
		
		if(showLines){
			// loop through the data and draw!				
			ctx.strokeStyle = lineColor; 
			ctx.lineWidth = 3;
			for(let i=0; i<audioData.length; i++) { 
				ctx.beginPath();
				// the higher the amplitude of the sample (bin) the taller the bar
				// right side
				ctx.moveTo(1200,0); 
				ctx.lineTo(1200 - audioData[i],i * (barWidth + barSpacing)); 
				ctx.stroke();
				ctx.closePath();
				
				// left side
				
				ctx.beginPath();
				ctx.moveTo(0,0);
				ctx.lineTo(audioData[i],i * (barWidth + barSpacing)); 
				ctx.stroke();
				ctx.closePath();
				
			}					
		}
		
		if(showCurves){
			ctx.strokeStyle = curveColor;
			
			for(let i=0; i < audioData.length / 2; i++){
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.bezierCurveTo(300, (300 + audioData[i] * 3), 900, (300 - audioData[i] * 3), 1200, 650);
				//Set to go from the top left corner to the bottom right
				ctx.stroke(); 
			}	
		}
		
		if(showCircles) {
				ctx.fillStyle = circleColor;
				
			for(let i=0; i<audioData.length; i++) { 
				let drawRadius = (audioData[i] /25) * circleRadius;
				
				// top
				ctx.beginPath();
				ctx.arc(canvas.width / 2 , 100, drawRadius * 1.5, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
				
				// left
				ctx.beginPath();
				ctx.arc(canvas.width / 2 - 350, 500, drawRadius * 1.5, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
				
				// right side
				ctx.beginPath();
				ctx.arc(canvas.width / 2 + 350, 500, drawRadius * 1.5, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
				
			}
		}		
		manipulatePixels(); // at the end so it can collect all visual data
	} 
	
	
	
	
	// SHELF METHODS
	function toggleHighshelf(){
	  if(highshelf){
		biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
		
		// depends on highFilterGain set by a slider and defaults
		biquadFilter.gain.setValueAtTime(highFilterGain, audioCtx.currentTime);
	  }else{
		biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
	  }
	}
	
	function toggleLowshelf(){
	  if(lowshelf){
		lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
		
		// depends on lowFilterGain set by a slider and defaults
		lowShelfBiquadFilter.gain.setValueAtTime(lowFilterGain, audioCtx.currentTime);
	  }else{
		lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
	  }
	}
	
	 // FULL SCREEN MODE
	function requestFullscreen(element) {
	
		if (element.requestFullscreen) {
		  element.requestFullscreen();
		} else if (element.mozRequestFullscreen) {
		  element.mozRequestFullscreen();
		} else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
		  element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
		  element.webkitRequestFullscreen();
		}
		// .. and do nothing if the method is not supported
	};
	
	return {
		init
	};
	
})();