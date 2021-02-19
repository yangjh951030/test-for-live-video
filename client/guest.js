let roomsContent =  document.getElementById('roomsContent');
let remoteVideo =  document.getElementById('remoteVideo');
let messageContent = document.getElementById('messageContent');
let message = document.getElementById('message');
let sendBtn =  document.getElementById('sendBtn');
let ws = new WebSocket('ws://localhost:7000');
let wsStatus = false;
let guest = '456';
let status = 0;

let sourceBuffer;
let mediaSource = new MediaSource();
remoteVideo.src = URL.createObjectURL(mediaSource);
remoteVideo.muted = true;

mediaSource.addEventListener('sourceopen',function(e){
    console.log(mediaSource.readyState);
    let config = 'video/webm; codecs="vorbis, vp8"';
    let noConfig = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
    console.log(MediaSource.isTypeSupported(config));
    sourceBuffer = mediaSource.addSourceBuffer(config);
    getVideo(status);
    //console.log(sourceBuffer);
})
function getVideo(status) {
    let xml = new XMLHttpRequest();
    //let url = 'http://localhost:8000/video?status='+ status;
     let url =  1 + '.webm';
    xml.open('get',url);
   // xml.setRequestHeader('Origin','http://localhost:8000');
    xml.responseType = 'arraybuffer';
    xml.onload =  function(){
        sourceBuffer.addEventListener('updateend', function (_) {
            mediaSource.endOfStream();
            remoteVideo.controls = true;
            remoteVideo.play();
            getVideo(status++);
            remoteVideo.onloadeddata =  function(){
                remoteVideo.play();
            }
            //console.log(mediaSource.readyState); // ended
        });
        sourceBuffer.addEventListener('error',function(_){
            console.log('出错')
        })
        sourceBuffer.appendBuffer(this.response);
    }
    xml.send();
}
setInterval(() => {
    //mediaSource.dispatchEvent('sourceopen');
}, 6000);

ws.onopen = function(){
    console.log('连接成功');
    wsStatus = true;
    let message = {
        type:'guest',
        guest:guest
    }
    ws.send(JSON.stringify(message));
    ws.binaryType = 'arraybuffer';
}
ws.onmessage = function(e){
    let data;
    if (typeof e.data === 'string'){
        try{
            data= JSON.parse(e.data);
            handleData(data);
        }catch(e){
            console.log(e);
        }
    }else{
        console.log(e.data);
        sourceBuffer.appendBuffer(e.data);
    }
    console.log(e.data);
}
function handleData(data){
    switch (data.type){
        case 'guest':
            handleRooms(data.rooms);
            break;
        default:
            break;
    }
}
function handleRooms(data){
    for(let item of data){
        let div = document.createElement('div');
        div.id = item;
        div.addEventListener('click',function(e){
            let message = {
                type:'watch',
                host:item,
                guest:guest
            }
            ws.send(JSON.stringify(message));
        });
        roomsContent.appendChild(div);
    }
}


