const http = require('http')
const fs = require('fs')
const url = require('url')


const tokyotrains = require('./tokyotrains')

const PATH_DATA = "trains.json"

let data = null
let datadt = 0

function save() {
  fs.writeFileSync(PATH_DATA, JSON.stringify(data))
}
function load() {
  try {
    data = JSON.parse(fs.readFileSync(PATH_DATA))
  } catch (e) {
  }
}
load()

//const CACHE_TIME = 10 * 1000 * 1000
const CACHE_TIME = 5 * 1000

async function serveAPI(fn, query) {
  if (fn.endsWith('/getTokyoTrainsNow')) {
    if (data && Date.now() - datadt < CACHE_TIME) {
      console.log("ret cache")
      return data
    }
    console.log("call getTokyoTrainsNow")
    data = await tokyotrains.getTokyoTrainsNow()
    datadt = Date.now()
    save()
    return data
  }
}

const server = http.createServer()
server.on('request', async function(req, res) {
  console.log(req.url)
  if (req.url.startsWith('/api/')) {
    const urlp = url.parse(req.url, true)
    res.writeHead(200, { 'Content-Type' : 'application/json; charset=utf-8', 'Access-Control-Allow-Origin' : '*' })
    let resjson = await serveAPI(urlp.pathname, urlp.query)
    if (!resjson)
      resjson = { 'res' : 'OK' }
    res.write(JSON.stringify(resjson))
  } else {
    serveStatic(res, req.url)
  }
  res.end()
})
server.listen(8001)

const CONTENT_TYPE = {
  'html' : 'text/html; charset=utf-8',
  'png' : 'image/png',
  'gif' : 'image/gif',
  'jpg' : 'image/jpeg',
  'txt' : 'text/plain',
  'js' : 'text/javascript',
  'json' : 'application/json',
  'jsonld' : 'application/ld+json',
  'csv' : 'text/csv',
  'css' : 'text/css',
  'pdf' : 'application/pdf',
  'ico' : 'image/vnd.microsoft.icon',
}

function serveStatic(res, fn) {
  fn = 'static' + fn
  if (fn.indexOf('..') >= 0) {
    return
  }
  if (fn.endsWith('/'))
    fn += "index.html"
  
  const ext = fn.substring(fn.lastIndexOf('.') + 1)
  let type = CONTENT_TYPE[ext]
  if (!type)
    type = 'text/plain'
  try {
    const b = fs.readFileSync(fn)
    res.writeHead(200, { 'Content-Type' : type })
    res.write(b)
  } catch (e) {
    res.writeHead(404)
  }
}
