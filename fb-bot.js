var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('./config');
var fs = require('fs');

const app = express();
const port = '80';
const VERIFY_TOKEN = config.VERIFY_TOKEN;
const PAGE_TOKEN = config.PAGE_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var currentSenderId = ''

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})

app.get('/msg', function(req, res) {
    console.log(req.query.text);    
    sendTextMessage(currentSenderId, req.query.text);
    res.sendStatus(200);
});

app.post('/webhook/', function (req, res) {

  //console.log(req.body);

  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;

    if (event.message && event.message.text) {
      text = event.message.text;

      console.log('receieve command: ' + text);
      
      sendTextMessage(sender, "echo: "+ text.substring(0, 200));    

      currentSenderId = sender      
    }
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT || port);

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:PAGE_TOKEN},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}
