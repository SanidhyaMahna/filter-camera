
let video = document.querySelector("video");
let captBtnCont = document.querySelector(".capture-Btn-cont");
let recordBtnCont = document.querySelector(".record-btn-cont");
let transparentColor = "transparent";
let captBtn = document.querySelector(".capture-btn");
let recordBtn = document.querySelector(".record-btn");
let recorder;
var uid = new ShortUniqueId();

let constraints = {
    video:true,
    
}

let shouldRecord = false;

navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream;
        recorder = new MediaRecorder(stream);
        recorder.addEventListener("start", (e)=>{
            //memory
            chunks = [];
        })

        recorder.addEventListener("dataavailable", (e) =>{
            chunks.push(e.data);//all the recording is sent to chunks array
        });

        recorder.addEventListener("stop", ()=>{
            //video is converted 
            let blob = new Blob(chunks, {type: 'video/mp4'});

            //download video on desktop
            //store in database
            let videoUrl = URL.createObjectURL(blob);
            console.log(videoUrl);

            // let a = document.createElement('a');
            // a.href = videoUrl;
            // a.download = "myVideo.mp4";
            // a.click();
        //store in database

        if (db) {
            let videoId = uid();
            let dbTransaction = db.transaction("video", "readwrite");
            let videoStore = dbTransaction.objectStore("video");
            let videoEntry = {
              id: `vid-${videoId}`,
              blobData: blob,
            };
            let addRequest = videoStore.add(videoEntry);
            addRequest.onsuccess = () => {
              console.log("video added to db successfully");
            };
          }

        });
    });


    //click photos
   
captBtnCont.addEventListener("click", ()=>{
    captBtn.classList.add("scale-capture");
    console.log("capture butn clicked");
    let canvas = document.createElement('canvas');
    let tool = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    tool.drawImage(video, 0,0,canvas.width, canvas.height);

    //applying filters on photo
    tool.fillStyle = transparentColor;
    tool.fillRect(0,0,canvas.width, canvas.height);
    let imageUrl = canvas.toDataURL();
    console.log(uid);

    // let img = document.createElement("img");
    // imageUrl.src = imageUrl;
    // document.body.append(img);
    if (db) {
        let imageId = uid();
        let dbTransaction = db.transaction("image", "readwrite");
          let imageStore = dbTransaction.objectStore("image");
          let imageEntry = {
            id: `img-${imageId}`,
            url: imageUrl,
          };
          let addRequest=imageStore.add(imageEntry);
          addRequest.onsuccess=() => {
           console.log("image added to db successfully");   
          }
      }
    setTimeout(()=>{
        captBtn.classList.remove("scale-capture");
    }, 510);
});

recordBtnCont.addEventListener("click", ()=>{
    recordBtn.classList.add("scale-record");
    shouldRecord = !shouldRecord;
    if(shouldRecord){
        //start recording
        recorder.start();
        console.log("recording started");
        //timer start
        startTimer();
    }
    else{
        //stop recording
        recorder.stop();
        console.log("recording stopped");
        
        recordBtn.classList.remove("scale-record");
        
        stopTimer();
    }
});

let timer = document.querySelector(".timer");
let counter = 0;
let timerID;
function startTimer() {
    timer.style.display = 'block';
    function displayTimer(){
        let totalSeconds = counter;
        let hours = Number.parseInt(totalSeconds/3600);
        totalSeconds = totalSeconds%3600;

        let minutes = Number.parseInt(totalSeconds/60);
        totalSeconds = totalSeconds%60;

        let seconds = totalSeconds;

        hours = (hours<10)?`0 ${hours}` : hours;
        minutes = (minutes<10)?`0 ${minutes}` : minutes;
        seconds = (seconds<10)?`0 ${seconds}` : seconds;
        
        timer.innerText = `${hours}:${minutes}:${seconds}`;
        
        counter++;
    }

    timerID = setInterval(displayTimer,1000);

}

function stopTimer(){
    clearInterval(timerID);
    timer.innerText = "00:00:00";
    timer.style.display = 'none';
    counter = 0;

}
//filter add

let filterLayer = document.querySelector(".filter-layer");
let allFilters = document.querySelectorAll(".filter");

allFilters.forEach((filterElem) => {
    filterElem.addEventListener('click', () => {
        transparentColor = getComputedStyle(filterElem).getPropertyValue('background-color');
        console.log(transparentColor + "filter clicked");

        filterLayer.style.backgroundColor = transparentColor;
    })
})


// gallery connect
let gallery = document.querySelector(".material-icons");
        gallery.addEventListener("click", ()=>{

            console.log("gallery clicked");
            location.assign("./Gallery.html");
})