require('dotenv').config()
const API_TOKEN = process.env.API_TOKEN_ODPT

const opstations = {}
const getTokyoTrainsNow = async function() {
  const trains = await loadJSON("https://api-tokyochallenge.odpt.org/api/v4/odpt:Train?acl:consumerKey=" + API_TOKEN) // 列車取得 リアルタイム  496@6:11
  const getStation = async function(operator, stationid) {
    let stations = opstations[operator]
    if (!stations) {
      stations = await loadJSON("https://api-tokyochallenge.odpt.org/api/v4/odpt:Station?odpt:operator=" + operator + "&acl:consumerKey=" + API_TOKEN)
      opstations[operator] = stations
    }
    for (const st of stations) {
      if (st["owl:sameAs"] == stationid)
        return st
    }
  }
  const res = []
  for (const train of trains) {
    const st = await getStation(train["odpt:operator"], train["odpt:fromStation"])
//    console.log(st)
    const delay = st['odpt:delay'] || 0
//    const delay = Math.random() < .2 ? 1 : 0
    const pos = [ st["geo:lat"], st["geo:long"], delay ]
    res.push(pos)
  }
  return res
}

const webclient = require("request")
const loadJSON = async function(url) {
	return new Promise(function(resolve, reject) {
    webclient.get({ url: url }, function(error, response, body) {
      if (error) {
        reject(error)
      } else {
        resolve(JSON.parse(body))
      }
    })
  })
}

module.exports.getTokyoTrainsNow = getTokyoTrainsNow

/*
// test
const main = async function() {
  const data = await getTokyoTrainsNow()
  console.log(data)
}
main()
*/
