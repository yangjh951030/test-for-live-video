let stream;
let videoStream = {};
let videoBlob = [];
let startBtn =  document.getElementById('startBtn');
let closeBtn = document.getElementById('closeBtn');
let hostStopStatus = false;
let stop;
let hostVideo =  document.getElementById('host-video');
let recorder;
let flieReader = new FileReader(); // 将blob流转成arraybuffer;
let ws = new WebSocket('ws://localhost:7000');
let wsStatus = false;
ws.onopen = function(){
    console.log('连接成功');
    wsStatus = true;
}
ws.onmessage = function(e){
    console.log(e.data);
}
function changeToUnit8Array(value){
    let text  = new TextEncoder();
    let user = text.encode(value);
    return user;
}
function arraybufferToUnit8array(value){
    let data = new Uint8Array(value);
    return data;
}
function mergeArraybuffer(...arrays){ // 合并多个arraybuffer;
    let totalLen = 0;
    for (let i = 0; i < arrays.length; i++) {
        totalLen += arrays[i].length;
    }
    let value = new Uint8Array(totalLen);
    let offset = 0;
    for(let arr of arrays) {
        value.set(arr, offset);
        offset += arr.length;
    }
    return value.buffer;
}
function sendBlob(value){
    // let user = changeToUnit8Array('123');
    // console.log(user);
    // let data = arraybufferToUnit8array(value);
    // let message = mergeArraybuffer(user,data);
    // console.log('开始发送');
    // console.log(message);
    ws.send(value);
}
startBtn.addEventListener('click',function(){
    openCam();
})
closeBtn.addEventListener('click',function(){
    stopRecorde();
    hostStopStatus = true;
    clearTimeout(stop);
})
function openCam(){
    if(stream === undefined){
        let status = 0;
        navigator.mediaDevices.getUserMedia({audio:true,video:true})
        .then(function(mediaStream){
            stream = mediaStream;
            hostVideo.srcObject = mediaStream;
            hostVideo.onloadedmetadata =  function(){
                hostVideo.play();
            }
            reconder = new MediaRecorder(mediaStream,{type:'video/webm,codecs="vorbis, vp8"'});
            reconder.ondataavailable  =  function(e){
                videoBlob.push(e.data);
                console.log('收到一个blob');
            }
            reconder.onstop = function(e){
                let blob = new Blob(videoBlob, { type : 'video/webm,,codecs="vorbis, vp8"' });
                status++;
                downloadMp4(blob,status);
                videoBlob = [];
                sendBlob(blob);
                console.log(blob);
                if(hostStopStatus === false){
                    startRecorde();
                   }else{
                    console.log('主播决定离开');
                }
                // flieReader.readAsArrayBuffer(blob);
                // flieReader.onload = function(){
                //    let timer = new Date();
                //    let hours = timer.getHours(); //获取系统时，
                //    let minutes = timer.getMinutes(); //分
                //    let seconds = timer.getSeconds(); //秒
                //    let key = hours + '-' + minutes + '-'+ seconds;
                //    let arraybuffer = this.result.slice(0); // clone一个新的arraybuffer;
                //    videoStream[key] = arraybuffer;
                //    console.log(arraybuffer);
                //    sendBlob(arraybuffer);
                //    console.log('获取了一个短视频');
                //    if(hostStopStatus === false){
                //     startRecorde();
                //    }else{
                //        console.log('主播决定离开');
                //    }
                // }
            }
            startRecorde();
        }).catch(function(e){
            console.log(e);
            alert('打开摄像头失败');
        })
    }else{
        alert('您的摄像头已被占用');
        stream = undefined;
    }
}

function startRecorde(){
    reconder.start();
    stop =  setTimeout(function(){
        stopRecorde();
        clearTimeout(stop);
    },5000)
}
function stopRecorde(){
    reconder.stop();
}
function  downloadMp4(blob,status) {
    let url = window.URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url ;
    link.setAttribute('download', './' + status + '.webm' );
    document.body.appendChild(link);
    link.click();
      // 然后移除
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

}