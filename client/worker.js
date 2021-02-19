

function workers(){
    onmessage = function(e){
        let src = e.data;
        console.log(src);
        open(src);
    }
    function open(src){
        let xml = new XMLHttpRequest();
        xml.open('get',src,true);
        xml.responseType = 'arraybuffer';
        xml.onload =  function(){
            postMessage(xml.response);
        }
    }
}
if(window!=self){
  workers();
}
