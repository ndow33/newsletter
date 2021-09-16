//modules and packages
const bodyParser = require("body-parser");
const request = require("request");
const express = require("express");
const json = require("json")
//const { json } = require("body-parser");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();

//import credentials from secrets.js
const {Secrets} = require('./secrets.js');
const listID = Secrets.listID;

//Mailchimp setup
mailchimp.setConfig({
  apiKey: Secrets.apiKey,
  server: Secrets.server,
});

//Check mailchimp api connection health
async function checkHealth() {
    const response = await mailchimp.ping.get();
    console.log(response);
  }
  
checkHealth();


//Access the public folder when using the webapp
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


//GET
app.get("/", function(req, res){
    //load the signup.html file as the homepage
    res.sendFile(__dirname + "/signup.html")    
});


//POST
app.post("/", function(req, res){
    //Take the first name, last name and email address from the user input
    //and turn it into a json object
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;
    console.log(firstName, lastName, email)

    
    
    //Create a json object with the subscriber's data
    const subscribingUser = {
        firstName: firstName,
        lastName: lastName,
        email: email
        };
    console.log(subscribingUser.firstName)

    
    async function addContact() {
      const response = await mailchimp.lists.addListMember(listID, {
        email_address: subscribingUser.email,
        status: "subscribed",
        merge_fields: {
          FNAME: subscribingUser.firstName,
          LNAME: subscribingUser.lastName
        }
      });
      console.log("successfully added someone as an audience member")
    }

    addContact();
    res.sendFile(__dirname + "/success.html");
});

/*
//assign a port to run our webapp on
app.listen(5000, function(){
    console.log("I'm listening on port 3000...")
})
*/
//This is needed for Heroku to dynamically assign a port when it is deployed.
app.listen(process.env.PORT || 5000);