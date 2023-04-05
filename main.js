/*
Telegram Bot API:
  docs: https://core.telegram.org/bots/api

OpenSSL:
  - generate a private key:
    openssl genrsa -out privateKey.pem 2048

  - generate a public key:
    openssl rsa -pubout -in /privateKey.pem -outform PEM -out publicKey.pem

  - generate a self-signed certificate:
    openssl req -newkey rsa:2048 -sha256 -nodes -keyout privateKey.pem -x509 -days 9999 -out certificate.pem -subj "/C=BR/ST=State-Test/L=Locality-Test/O=Organization-Test/OU=OrganizationalUnit-Test/CN=localhost/emailAddress=Email-Test"
*/
const https = require('node:https')
const fs = require('node:fs')
const port = 443

const telegramBotToken = '6076259682:AAEwFW9MwcwDGID0yXIeiKoR6ctNeDzx16k'
const telegramApiHost = 'api.telegram.org'
const telegramApiPath = '/bot'+telegramBotToken
const webhookHost = '68ed-2804-29b8-509b-d613-391e-a2db-3774-1492.sa.ngrok.io'
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
      console.log('webhookHandler() request info: ')
      // console.log(JSON.parse(rawData))
      console.log(rawData)
      res.writeHead(200)
      res.end()

    })
  }
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
