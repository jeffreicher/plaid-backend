const express = require('express')
const app = express()
const port = 3001
const cors = require('cors')
var bodyParser = require('body-parser')
const plaid = require('plaid')
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())

app.listen(port, () => {
  console.log(`app is listening on port ${port}`)
  console.log(process.env.PLAID_CLIENT_ID)
})

const plaidClient = new plaid.Client(
  process.env.PLAID_CLIENT_ID,
  process.env.PLAID_SECRET,
  process.env.PLAID_PUBLIC_KEY,
  plaid.environments[process.env.PLAID_ENV],
  { version: '2018-05-22' }
)

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null
let PUBLIC_TOKEN = null
let ITEM_ID = null

app.post('/get_access_token', (request, response) => {
  console.log(request.body)

  PUBLIC_TOKEN = request.body.public_token
  plaidClient.exchangePublicToken(PUBLIC_TOKEN, (error, tokenResponse) => {
    if (error != null) {
      console.log(error)
      return response.json({
        error: error
      })
    }
    ACCESS_TOKEN = tokenResponse.access_token
    ITEM_ID = tokenResponse.item_id
    console.log(tokenResponse)
    return response.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null
    })
  })
})

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/auth', (request, response, next) => {
  plaidClient.getAuth(ACCESS_TOKEN, (error, authResponse) => {
    if (error != null) {
      console.log(error)
      return response.json({
        error: error
      })
    }
    console.log(authResponse)
    response.json({ error: null, auth: authResponse })
  })
})
