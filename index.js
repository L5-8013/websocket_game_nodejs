const express = require('express')
const app = express()
const ws = require('express-ws')
const wss = ws(app).getWss('/prepare')

let data = {x:2,y:2};
let links = 0;
let play =false;



const moveAction = (bool,direction)=>{
  // console.log(direction)
  switch (direction) {
    case 'top':
       if(bool){
        data.x=data.x-1
       }
      break;
    case 'left':
      if(bool){
        data.y=data.y-1
       }
      break;
    case 'bottom':
      if(bool){
        data.x=data.x+1
       }
      break;
    case 'right':
      if(bool){
        data.y=data.y+1
       }
      break;
    default:
      break;
  }
}

 //准备
app.ws('/prepare', (ws, req) => {
    // console.log('success',req.query);
    ws.on('message', msg => {
      const message = JSON.parse(msg);
      //游戏开始了
      if(play){
        wss.clients.forEach(w=>{
          if(w.readyState == 1) {
            w.send(JSON.stringify({played:true}));
          }
        })
        return
      }

      //统一发布开始游戏
      if(message?.play){
        play=true;
        wss.clients.forEach(w=>{
          if(w.readyState == 1) {
            w.send(JSON.stringify(message));
          }
        })
        return
      }
      if(message?.prepare){
        links=links+1;
        console.log('加',links)
      }
      if(message?.close){
        links = links-1<0?0:links-1;
        if(links == 0){
          play =false;
        }
        console.log('减',links)
      }
      let obj = {
        links
      }
      wss.clients.forEach(w=>{
        if(w.readyState == 1) {
          w.send(JSON.stringify(obj));
        }
      })
    })
})
//游戏开始
app.ws('/start', (ws, req) => {
  // console.log('start',req.query);
  ws.on('message', msg => {
    const message = JSON.parse(msg);
    if(message?.end && play){
      links= 0;
      play=false;
      console.log('重玩游戏了')
    }
    if(message?.close2 && play){
      links = links-1<0?0:links-1;
      if(links == 0){
        play =false;
      }
    }
    if(!play)return;
    if(message?.start){
      data = {x:2,y:2};
    }else{
      moveAction(message.bool,message.direction);
    }
    wss.clients.forEach(s => {
      if (s.readyState == 1) {
        s.send(JSON.stringify(data));
      }
    });
  })
})
 

app.get('/test', (req, res) => {
  // send()方法，表示向浏览器发送一个响应信息
  res.send('test');
});
 
app.listen(3001, () => {
    console.log('http://localhost:3001/')
})