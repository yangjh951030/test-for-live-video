let ws = require('ws').Server;
let fs = require('fs');

let start = require('./httpServer');
let server = new ws({port:7000});
let guests = {};
let rooms = {};
let lastestStream;
let status = 0;
function send(connection,message){
    connection.send(JSON.stringify(message));
}
function sendGroup(message){
    for(let user in users){
        users[user].send(message);
    }
}
function bufferToString(array){
    if(array instanceof Buffer){
        return array.toString();
    }else{
        return array;
    }
}

server.on('connection',function(connection){
    let data;
    connection.on('message',function(message){ // 未实现多人直播的时候的区分；blob和字符串一起传值导致无法获取值；
        try{
            if(message instanceof Buffer){
                lastestStream = message;
                let file = fs.createWriteStream('./'+ status +'.mp4');
                file.write(message);
                file.end();
                // 处理流事件 --> finish、error
                file.on('finish', function() {
                    console.log("写入完成。");
                    status ++;
                });
                file.on('error', function(err){
                    console.log(err.stack);
                });
            }else{
                data = JSON.parse(message);
                handleData(data,connection);
            }
        }catch(e){
            console.log(e);
            data = null;
        }
    })
})
function handleData(data,conn){
    switch (data.type){
        case 'guest': // 表示游客类型，是第一次，把直播间发给他；
            let gruops = Object.keys(rooms);
            conn.name = data.guest;
            guests[data.guest] = conn;
            let message = {
                type:'guest',
                rooms:gruops,
            };
            send(conn,message);
            break;
        case 'watch':
            break;
        default :
            break;
    }
}
console.log('start websocket');
start()