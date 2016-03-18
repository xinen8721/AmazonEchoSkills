/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Greeter to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.2204f700-c5a6-4a8d-9781-492c60e907a9"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var https = require('https');
/**
 * CurrencyGuy is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var CurrencyGuy = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
CurrencyGuy.prototype = Object.create(AlexaSkill.prototype);
CurrencyGuy.prototype.constructor = CurrencyGuy;

CurrencyGuy.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("CurrencyGuy onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

CurrencyGuy.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("CurrencyGuy onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Alexa Skills Kit, you can say hello";
    var repromptText = "You can say hello";
    response.ask(speechOutput, repromptText);
};

CurrencyGuy.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("CurrencyGuy onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

CurrencyGuy.prototype.intentHandlers = {
    // register custom intent handlers
    "TellRateIntent": function (intent, session, response) {
        handleTellMeTheRateIntent(session, response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say what is the rate of USD to CNY!", "You can say what is the rate of USD to CNY!");
    }
};

var handleTellMeTheRateIntent = function(session, response) {
    var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D%22http%3A%2F%2Ffinance.yahoo.com%2Fd%2Fquotes.csv%3Fe%3D.csv%26f%3Dnl1d1t1%26s%3Dusdcny%3DX%22%3B&format=json&callback=';
    getJSONfromYahoo(url, function(data){
      if(data.query.results.row.col1 !== 'N/A') {
        var text = data.query.results.row.col1;  
        var card_text = 'The rate of USD to CNY is ' + text ;

        var heading = 'Rate you input';
      }
      else {
        var heading = 'Not found';
        var card_text = 'Sorry, I didn\'t find a match of your currency';
      }
      response.tellWithCard(card_text, heading, card_text);
    });
};

var getJSONfromYahoo = function(url, callback){
  https.get(url, function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var result = JSON.parse(body);
      callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  });
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
// Create an instance of the CurrencyGuy skill.
  var currencyGuy = new CurrencyGuy();
  currencyGuy.execute(event, context);
};
