import { useState, useRef, useEffect } from 'react';


export default function Home() {
  let video, canvas, outputContext, temporaryCanvas, temporaryContext, video2;
  const canvasRef = useRef();
  const videoRef = useRef(undefined);
  // const [computed, setComputed] = useState(false);
  const [process, setProcess] = useState('unedited', 'computing', 'computed');
  const [link, setLink] = useState('');
  const [blob, setBlob] = useState();
  const [message, setMessage] = useState('please wait...');

  useEffect(() => {
    setProcess('unedited');
  }, []);
 
  const processVideo = () => {
    console.log('processing...');
    setProcess('computing');
    video = document.getElementById('video');

    video2 = document.createElement('video');
    video2.setAttribute("width", 800);
    video2.setAttribute("height", 450);
    video2.src = "video/background.mp4";
    video2.setAttribute("ref", videoRef.current);
    video2.muted = true;
    video2.autoplay = true;
    video2.play();
    video2.loop = true;

    canvas = document.getElementById('output-canvas');
    outputContext = canvas.getContext('2d');

    temporaryCanvas = document.createElement('canvas');
    temporaryCanvas.setAttribute('width', 800);
    temporaryCanvas.setAttribute('height', 450);
    temporaryContext = temporaryCanvas.getContext('2d');
    video.addEventListener("play", computeFrame)
  }

  async function computeFrame() {

    if (video.paused || video.ended) {
      return;
    }


    temporaryContext.drawImage(video, 0, 0, video.width, video.height);
    let frame = temporaryContext.getImageData(0, 0, video.width, video.height);


    temporaryContext.drawImage(video2, 0, 0, video2.width, video2.height);
    let frame2 = temporaryContext.getImageData(0, 0, video2.width, video2.height);

    for (let i = 0; i < frame.data.length / 4; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];

      if (r > 100 && r < 190 && g > 145 && g < 208 && b > 70 && b < 150) {
        frame.data[i * 4 + 0] = frame2.data[i * 4 + 0];
        frame.data[i * 4 + 1] = frame2.data[i * 4 + 1];
        frame.data[i * 4 + 2] = frame2.data[i * 4 + 2];
      }
    }
    setProcess('computed');
    outputContext.putImageData(frame, 0, 0)
    setTimeout(computeFrame, 0);

    const chunks = [];
    const cnv = canvasRef.current;
    const stream = cnv.captureStream();
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = e => setBlob(new Blob(chunks, { type: 'video/webm' })); //in case of backend upload use the 'uploadHandler' function
    rec.start();
    setTimeout(() => rec.stop(), 10000);
  }

  //file reader - converts media file blobs to base64 string
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      let fr = new FileReader();

      fr.onload = function () {
        resolve(fr.result);
      };

      fr.onerror = function () {
        reject(fr);
      };

      fr.readAsDataURL(file);
    });
  };

  //(optional) backend cloudinary upload!
  async function uploadHandler(blob) {
    console.log(blob)
    // await readFile(blob).then((encoded_file) => {
    //   try {
    //     fetch('/api/upload', {
    //       method: 'POST',
    //       body: JSON.stringify({ data: encoded_file }),
    //       headers: { 'Content-Type': 'application/json' },
    //     })
    //       .then((response) => response.json())
    //       .then((data) => {
    //         setComputed(true);
    //         setLink(data.data);
    //       });
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });
  }
  return (
    <>
      <div className='container'>
        <div className='header'>
          <h1 className='heading'>
            <span
              onClick={computeFrame}
              className="heading-primary-main"
            >
              <b>JAVASCRIPT CHROMA KEY</b>
            </span>
          </h1>
        </div>
        <div className="row">
          <div className="column">
            <h3>sample videos</h3>
            <video className="video" crossOrigin="Anonymous" src='https://res.cloudinary.com/dogjmmett/video/upload/v1658223838/production_ID_4838318_cxpbfp.mp4' id='video' width='800' height='450' autoPlay muted loop type="video/mp4" />
            <video className="video" crossOrigin="Anonymous" src='video/background.mp4' id='background' width='800' height='450' autoPlay muted loop type="video/mp4" /><br />
            {
            process =='unedited' ? 
            <button onClick={processVideo}>Merge</button>
             :
              process == 'computing' ? <p>please wait ...</p>
              : 
              ''}
          </div>
 
            <div className="column">
              <a href={link}><b>PROCESSED VIDEO SAMPLE</b></a>  <br />
              <canvas crossOrigin="Anonymous" className="canvas" ref={canvasRef} id="output-canvas" width="800" height="450" ></canvas><br />
              {/* <a href="#" className="btn btn-white btn-animated" onClick={uploadHandler}>Get video Link</a> */}
            </div>
        </div>
      </div>
    </>
  )
}