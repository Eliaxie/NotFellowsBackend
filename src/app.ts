import express from 'express';
const mailchimp = require("@mailchimp/mailchimp_marketing");
require('dotenv').config()

var bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT || 3000;

mailchimp.setConfig({
  apiKey: process.env.SECRET_KEY,
  server: process.env.SERVER
})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'https://notfellows.github.io/');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  } else {
    return next();
  }
});

const listId = process.env.LISTID

var jsonParser = bodyParser.json()

var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.get('/', (req, res) => {
  //web check
  res.send("I'm working");
});

app.post('/', jsonParser, async function (req, res) {
  console.log("Received request: ", req.body)
  try {
    if (!validateEmail(req.body.email)) {
      console.log("broken email")
      res.sendStatus(400)
      return;
    }
    const jsonData = {
      email_address: req.body.email,
      status: "subscribed"
    }

    async function run() {
      try {
        const response = await mailchimp.lists.addListMember(listId, jsonData);
        if (response.status === "subscribed")
          res.sendStatus(200);
      } catch (error: any) {
        res.status(400).send(error.response.text);
      }
    }
    run();


  }
  catch (error: any) {
    res.sendStatus(500)
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
