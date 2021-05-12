// set up basic variables for app
const canvas = document.querySelector('.visualizer');
const canvasCtx = canvas.getContext("2d");
let   audioCtx;

function startRecording() {
	//main block for doing the audio recording
	if(navigator.mediaDevices.getUserMedia) {
		const constraints = { audio: true };

		let onSuccess = function(stream) {
			const mediaRecorder = new MediaRecorder(stream);
			visualize(stream);
		}

		let onError = function(err) {
			console.log('The following error occured: ' + err);
		}

		navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

	} else {
		 console.log('getUserMedia not supported on your browser!');
	}
}

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 8192;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);

  draw();

	//Analyze data here
	function process_data(data)
	{
		let maxval = Math.max.apply(Math, data);
		console.log(maxval);
	}

  function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

		//Run draw() about 60 times/second -> we put it here so it gets
		// called again the next time
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);   //Get FFT
    //analyser.getByteTimeDomainData(dataArray);    //Get waveform

		//Abusing the draw function to easily get the data array
		process_data(dataArray);

		//Clear the canvas
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		//Set up visualization line
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

		//Everything from here down is drawing
    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}

window.onresize = function() {
	const mainSection = document.querySelector('.main-controls');
  canvas.width = mainSection.offsetWidth;
}

window.onresize();
