/*
- Telegram Bot API:
  docs: https://core.telegram.org/bots/api

- Telegram api request data example:
  {
  update_id: 119681188,
  message: {
    message_id: 103,
    from: {
      id: 5009220789,
      is_bot: false,
      first_name: 'Jailton',
      language_code: 'en'
    },
    chat: { id: 5009220789, first_name: 'Jailton', type: 'private' },
    date: 1680748299,
    text: '/echo testing @test /echo again',
    entities: [ { offset: 0, length: 5, type: 'bot_command' }, { offset: 14, length: 7, type: 'mention' } ]
  }
}

- Generating https keys/certificates with OpenSSL:
  - generate a private key:
    openssl genrsa -out privateKey.pem 2048

  - generate a public key:
    openssl rsa -pubout -in /privateKey.pem -outform PEM -out publicKey.pem

  - generate a self-signed certificate:
    openssl req -newkey rsa:2048 -sha256 -nodes -keyout privateKey.pem -x509 -days 9999 -out certificate.pem -subj "/C=BR/ST=State-Test/L=Locality-Test/O=Organization-Test/OU=OrganizationalUnit-Test/CN=localhost/emailAddress=Email-Test"
*/
const https = require('node:https')
const fs = require('node:fs')
const TelegramApiTypes = require('./telegramApiTypes')
const port = 443

const telegramBotToken = '6076259682:AAEwFW9MwcwDGID0yXIeiKoR6ctNeDzx16k'
const telegramApiHost = 'api.telegram.org'
const telegramApiPath = '/bot'+telegramBotToken
const webhookHost = '2c86-2804-29b8-509b-d613-c523-505f-ef8a-4d9.sa.ngrok.io'
const webhookPath = '/webhook'
const webhookSecretToken = 'mySecretToken123'

serverOptions = {
  key: fs.readFileSync('ssl/privateKey.pem'),
  cert: fs.readFileSync('ssl/certificate.pem'),
  rejectUnauthorized: false
}

const server = https.createServer(serverOptions, (req, res) => {
  console.log('requested to: '+req.url)
  if(req.url === '/'){
    res.writeHead(200);res.write('<h1>Hello, world</h1>');res.end()
  }else if(req.url === webhookPath){
    webhookHandler(req, res)
  }else{
    res.writeHead(404);res.write('<h1>404, not found</h1>');res.end()
  }
})
server.listen(port);console.log('listening on port '+port+'...')
server.on('error', (error)=>{console.log('server error: '+error.message)})

function webhookHandler(req, res){
  if(req.headers['x-telegram-bot-api-secret-token'] !== webhookSecretToken){
    console.log('invalid secret token')
  }else{
    let rawData = ''
    req.on('data', (chunk)=>{
      rawData+=chunk
    })
    req.on('end', ()=>{
      const parsedData = JSON.parse(rawData)
      console.log('webhookHandler() request info: ')
      console.log(parsedData)
      res.writeHead(200)
      res.end()

      //check Entities in the message (like usernames (@), URLs (http://...), bot commands (/command), etc. that appear in the text)
      if(parsedData.hasOwnProperty('message') && parsedData.message.hasOwnProperty('entities')){
        console.log('message contains entities')
        for(let i=0; i < parsedData.message.entities.length; i++){
          if(parsedData.message.entities[i].type === 'bot_command'){
            console.log(parsedData.message.entities[i].type+' detected')
            commandHandler(parsedData.message, parsedData.message.text.substr(parsedData.message.entities[i].offset, parsedData.message.entities[i].length))
          }
        }
      }
      else{
        console.log('no entities to handle')
      }
     })
  }
}
/**
 * @param {TelegramMessage} msg 
 * @param {String} command 
 */
function commandHandler(msg, command){
  console.log('commandHandler(): '+command)
  
  const parameters = JSON.stringify({
    chat_id: msg.from.id,
    text: msg.text.substring(msg.entities[0].length) !== '' ? msg.text.substring(msg.entities[0].length) : '*no message to echo'
  })
  const reqOptions = {
    host: telegramApiHost,
    path: telegramApiPath+'/sendmessage',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': parameters.length
    }
  }
  const req = https.request(reqOptions, (res)=>{
    let rawData = ''
    res.on('data', (chunk)=>{
      rawData+=chunk
    })
    res.on('end', ()=>{
      console.log('/sendmessage response: ')
      console.log(JSON.parse(rawData))
    })
  })
  req.write(parameters)
  req.end()
}



function getWebhookInfo(){
  const reqOptions = {
    host: telegramApiHost,
    path: telegramApiPath+'/getwebhookinfo',
  }
  https.request(reqOptions, (res)=>{
    let rawData = ''
    res.on('data', (chunk) => {rawData += chunk})
    res.on('end', () => {console.log('getWebhookInfo() response:\n\t'+rawData)})
  }).end().on('error', (error) => {console.log('getWebhookInfo() request error: '+error.message)})
}

function setWebhook(){
  const reqOptions = {
    hostname: telegramApiHost,
    path: telegramApiPath+'/setwebhook?url='+webhookHost+webhookPath+'&secret_token='+webhookSecretToken+'&drop_pending_updates=true',
    method: 'POST',
  }
  https.request(reqOptions, (res)=>{
    let rawData = ''
    res.on('data', (chunk) => {rawData += chunk})
    res.on('end', () => {console.log('setWebhook() response:\n\t'+rawData);
    getWebhookInfo()})
  }).end().on('error', (error) => {console.log('setWebhook() request error: '+error.message)})
}
setWebhook()
