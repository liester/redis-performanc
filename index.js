const express = require('express')
const port = 3000
const redis = require('redis');
const largeJSON = require('./largeJson.json');

const {performance, PerformanceObserver} = require("perf_hooks")

const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(entry)
  })
})

perfObserver.observe({entryTypes: ["measure"], buffer: true})

const client = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});


const app = express()
app.use(express.json({limit: '50mb'}));


app.get('/get', (req, res) => {
  console.log(req.query.key)
  console.time(`Redis Get: ${req.query.key}`)
  const start = `Redis Get Start`;
  const end = `Redis Get End`;
  performance.mark(start)
  client.get(req.query.key, (err, reply) => {
    performance.mark(end)
    performance.measure("Redis Get Measurement", start, end)
    if (err) {
      res.json(err);
    }
    res.json(reply);
  })
})

app.post('/set', (req, res) => {
  console.log(req.query.key)
  const startSet = `Redis Set Start: ${req.query.key}`
  const endSet = `Redis Set Start: ${req.query.key}`
  const data = req.body
  performance.mark(startSet)
  client.set(req.query.key, JSON.stringify(largeJSON), (err, reply) => {
    console.log('just testing')
    performance.mark(endSet)
    performance.measure("Redis Set Measurement", startSet, endSet);
    if (err) {
      res.json(err);
    }
    res.json(reply);
  })
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})
