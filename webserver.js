var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var url = require('url');
var path = require('path');
var io = require('socket.io','net')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
let param = new Object();

var packParamJSON = "";

fs.readFile("param.txt", function (err, data) {
	console.log("Unpacked params: " + data);
	param = JSON.parse(data);
	packParamJSON = JSON.stringify(param);
});

const WebPort = 80;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
	user: 'captjohnowen@gmail.com',
	pass: 'g1F$o2x0'
    }
});

/** 
 * 
 * This sections retreives the weather data from Daivs Instruments 
 * 
 * 
*/


const https = require('https');

let wsData = new Object();

/*
* Here is the list of parameters that are needed to connect to the weather data
*/
var apiToken = "7927BE9B506545859954963EE1FCDA58";
var deviceID = "001D0A010E82";
var pass = "wl1F$o2x0";


console.log("v1 API URL: https://api.weatherlink.com/v1/NoaaExt.json?user=" + 
  "&deviceID=" + deviceID + 
  "&pass=" + pass +
  "&apiToken=" + apiToken
);


const website = "https://api.weatherlink.com/v1/NoaaExt.json&user=";

var queryFinal = website.concat(deviceID,"&pass=",pass,"&apiToken=",apiToken);

function currentConditions (){ // updates all clients with current conditions

	console.log(" Current Temp: " + String(wsData.temp_f));
	io.emit('WSDATA', JSON.stringify(wsData)); //send weather station data to ALL clients

};
/** Retreieves the current observations from the weatherlink service */	
function retrieveCurrentConditions (){ 

	https.get(queryFinal, (res) => {
		const { statusCode } = res;
		const contentType = res.headers['content-type'];

	  let error;
	  // Any 2xx status code signals a successful response but
	  // here we're only checking for 200.
	  if (statusCode !== 200) {
		error = new Error('Request Failed.\n' +
						  `Status Code: ${statusCode}`);
	  } else if (!/^application\/json/.test(contentType)) {
		error = new Error('Invalid content-type.\n' +
						  `Expected application/json but received ${contentType}`);
	  }
	  if (error) {
		console.error(error.message);
		// Consume response data to free up memory
		res.resume();
		return;
	  }

	  res.setEncoding('utf8');
	  let rawData = '';
	  res.on('data', (chunk) => { rawData += chunk; });
	  res.on('end', () => {
		try {
		  wsData = JSON.parse(rawData);
		  //console.log(wsData);
		  currentConditions();
		  weatherLogFile();
		} catch (e) {
		  console.error(e.message);
		}
	  });
	}).on('error', (e) => {
	  console.error(`Got error: ${e.message}`);
	});
	
};

setInterval (retrieveCurrentConditions, 60000);
setInterval (currentConditions, 10000);

//console.log("Current Temp: " + parsedWeatherData.temp_f);

// Packs the current temperature and range values into a JSON string

/**
 * 
 * End of Weather Station section
 * 
 */

/**
 * Saves paremeters to a JSON string and text file to be retreived when the 
 * webserver restarts
 * 
 */

function saveParam () {

    packParamJSON = JSON.stringify(param);
    console.log("Saved params: " + packParamJSON);
    fs.writeFile("param.txt", packParamJSON, function(err) {
	if (err) {
	    console.log(err);
	}
    });
}

/**
 * 
 * This builds and saves a log file
 *  
 */

 

function padStart(num) {
	num = num.toString();
	if (num.length < 2) {
		num = "0" + num;
	}
	return num;
}
/**
 * 
 * Generates current time and date (timestamp)
 * 
 */
function currentDateTime (){
	var currentdate = new Date()
	
	var mm = padStart(currentdate.getMonth()+1);
	var dd = padStart((currentdate.getDate()).toString());
	var yyyy = (currentdate.getFullYear().toString());

	var hh = padStart(currentdate.getHours());  
	var mmm = padStart(currentdate.getMinutes()); 
	var ss = padStart(currentdate.getSeconds());
	param.currentDateTime  = (mm+"/"+dd+"/"+yyyy+"@"+hh+":"+mmm+":"+ss);
	param.currentDate  = (mm+"/"+dd+"/"+yyyy);
	param.currentTime  = (hh+":"+mmm+":"+ss);
	param.currentMonth = mm;
	param.currentYear = yyyy;
	param.filePreID = (yyyy+mm);

	console.log(param.currentDateTime);

}
/**
 * 
 * This section generates a logfiles for modules data and if the file
 * already exists appends a new entry.
 * 
 * Data is updated every 10 minutes
 * 
 */
  // used to control line placement when server restarts
  var avoCount = 0;
  var esp32Count = 0;
  var weatherCount = 0;


function avoLogFile (){

	currentDateTime();

	const path = "logFiles/avoTreeLogFiles/"+param.filePreID+"avoTreeLogFile.csv";

	

	//  param values to write to log entry file
	var avoLogEntry = (
		param.currentDate + ","+
		param.currentTime+","+
		param.avoTemp + ","+
		param.avoSetPoint + ","+
		param.avoRange + ","+
		param.avoOutputA + ","+
		param.avoOutputB + "\r\n"
	);


	//  header fields to set up
	var avoFileHeader = (
		"Date"+","+
		"Time"+","+
		"Avocado Tree Temp"+","+
		"Avocado Tree Set Point"+","+
		"Avocado Tree Range"+","+
		"Avocado Tree Output A"+","+
		"Avocado Tree Output B"+","+"\r\n"
	);

	logFile(path, avoLogEntry, avoFileHeader, avoCount);
	avoCount = avoCount + 1;


}

function esp32LogFile (){

	currentDateTime();

	const path = "logFiles/esp32LogFiles/"+param.filePreID+"esp32LogFile.csv";

	

	//  param values to write to log entry file
	var esp32LogEntry = (
		param.currentDate + ","+
		param.currentTime+","+
		param.esp32Temp1 + ","+
		param.esp32Temp2 + ","+
		param.esp32SetPoint + ","+
		param.esp32Range + ","+"\r\n"
	);


	//  header fields to set up
	var esp32FileHeader = (
		"Date"+","+
		"Time"+","+
		"ESP32 Temp 1"+","+
		"ESP32 Temp 2"+","+
		"ESP32 Set Point"+","+
		"ESP32 Tree Range"+","+"\r\n"
	);

	logFile(path, esp32LogEntry, esp32FileHeader, esp32Count);
	esp32Count = esp32Count + 1;


}

function weatherLogFile (){

	currentDateTime();

	const path = "logFiles/weatherLogFiles/"+param.filePreID+"weatherLogFile.csv";

	

	//  param values to write to log entry file
	var weatherLogEntry = (
		param.currentDate + ","+
		param.currentTime+","+
		wsData.temp_f + ","+
		wsData.wind_mph + ","+
		wsData.wind_degrees + ","+
		wsData.relative_humidity + ","+
		wsData.pressure_in + ","+
		wsData.davis_current_observation.rain_rate_in_per_hr + ","+
		wsData.davis_current_observation.rain_day_in + ","+
		wsData.davis_current_observation.rain_month_in + ","+
		wsData.davis_current_observation.rain_year_in + ","+
		wsData.windchill_f + ","+
		wsData.heat_index_f + ","+
		wsData.dewpoint_f + ","+
		wsData.davis_current_observation.temp_day_high_f + ","+
		wsData.davis_current_observation.temp_day_low_f + ","+
		wsData.davis_current_observation.temp_month_high_f + ","+
		wsData.davis_current_observation.temp_month_low_f + ","+
		wsData.davis_current_observation.temp_year_high_f + ","+
		wsData.davis_current_observation.temp_year_low_f + ","+
		wsData.davis_current_observation.wind_ten_min_avg_mph + ","+
		wsData.davis_current_observation.wind_ten_min_gust_mph + ","+
		wsData.davis_current_observation.wind_day_high_mph + ","+
		wsData.davis_current_observation.wind_month_high_mph + ","+
		wsData.davis_current_observation.wind_year_high_mph + "\r\n"
	);


	//  header fields to set up
	var weatherFileHeader = (
		"Date"+","+
		"Time"+","+
		"Current Temperature"+","+
		"Current Wind Speed"+","+
		"Current Wind Direction"+","+
		"Current Relative Humidity"+","+
		"Current Barometric Pressure"+","+
		"Current Rain Rate"+","+
		"Daily Rain Total"+","+
		"Month Rain Total"+","+
		"Year Rain Total"+","+
		"Windchill"+","+
		"Heat Index"+","+
		"Dewpoint"+","+
		"Daily High Temperature"+","+
		"Daily Low Temperature"+","+
		"Month High Temperature"+","+
		"Month Low Temperature"+","+
		"Year High Temperature"+","+
		"Year Low Temperature"+","+
		"Wind 10 minute Average"+","+
		"Wind 10 minute Gust"+","+
		"Daily Wind High"+","+
		"Month Wind High"+","+
		"Year Wind High"+"\r\n"
	);

	logFile(path, weatherLogEntry, weatherFileHeader, weatherCount);
	weatherCount = weatherCount + 1;


}
/**
 * 
 * Common log file function
 * 
 * Path:  file path to save the log file
 * logEntry:  data to be entered into the log
 * fileHeader: names for the file when newly created
 * 
 */

function logFile (path, logEntry, fileHeader, count) {

	

	if (fs.existsSync(path)){
		console.log("Log file exists")
		if (count === 0){
			fs.appendFile(path, "\r\n", function (err){  // file exist, but server restarted
				if (err) throw err;
				console.log("Added new line");
			});
		} else {
			fs.appendFile(path, logEntry, function(err) { // regular entry into file
				if (err) throw err; 
				console.log("Log Entry Saved upper");
				});
		}
	} else {  //  if file does not exist, create a new file and add first entry
		console.log("File Does Not Exist, creating a new logfile");
		fs.writeFile(path, fileHeader, function (err) {  // create header row
				if (err) throw err; 
				console.log("File Header Saved");
				fs.writeFile(path, fileHeader, function (err) {  // create header row
					if (err) throw err; 
					console.log("Lof Entry Saved lower");
				});
			});
	}
}




/** 
 * sends and email or text alert based on webserver or module conditions
 * 
 */

// sends an email or text message
function mailMessage(message) {
    
    var mailOptions = {
	from: 'captjohnowen@gmail.com',
	to: '4084973761@vtext.com',
	text: message
	};

    
    transporter.sendMail(mailOptions, function(error, info){
	if (error) {
	console.log(error);
	} else {
	    console.log('Email sent: ' +info.response + ' Content: ' + messageContent);
	}
    });
}
/***
 * 
 * Set any interval needs here
 * 
 */

setInterval (avoLogFile, 600000);
setInterval (esp32LogFile, 600000);
setInterval (checkPulse, 10000);
setInterval (saveParam, 60000);

/*** This section is variables for the MQTT interface ***/

var mqtt = require('mqtt');
const { clearTimeout } = require('timers');
var count = 0
var options = {clientId: "mqtt.foxgrove",
		username: "pi",
		password: "foxgrovepi",
		clean: "true"};
var client = mqtt.connect("mqtt://10.0.1.214", options);
console.log ("connected flag " + client.connected);

/**
 * 
 * This function publishes via MQTT messages passed by the functions below
 *  
 */
function publishMQTT (topic, message, options){
	console.log(" Publishing: "+message+" on Topic: "+topic);

	if (client.connected == true){
		client.publish(topic,message,options);
	}
	count+-1;
	if (count==2){ // ends script
		clearTimeout(timer_id);
		client.end();

	}

	var options={
		retain:true,
		qos:1};
		var timer_id=setInterval(function(){publish(topic,message,options);},5000);
		//notice this is printed even before we connect
		console.log("end of script");
}


/***
 * Checks if the ESP32 module if it is online
 * Add more checkPulse client publish / response when adding more modules
 * 
 * This section isn't working yet
 * 
 * 
 ***/
 
 
 
 function checkPulse(){
    if (client.connected == true) {
		client.publish("esp32/heartbeat", "checkPulse");
		console.log("Check for pulse - esp32 ");
		client.subscribe("esp32/pulse",{qos:1});
		var count = 0;
		if (count == 0){
			client.on('message', function(topic, message, packet){
			if (topic =="esp32/pulse"){
				if (message == "strongPulse"){
					client.unsubscribe("esp32/pulse");
					param.esp32Status = "online";
					//console.log("ESP 32 Online");
				} else {
					param.esp32Status = "offline";
					//console.log("ESP32 Offline");
				}
			}
		});
		count = count + 1;
	}
}


    }





/*************** Web Browser Communication ****************************/

// Start http webserver
http.listen(WebPort, function() {  // This gets call when the web server is first started.

	console.log('Server running on Port '+WebPort);
	console.log('Current Params: '+JSON.stringify(param));
	
});


/*** 
 * This section subscribes to the MQTT broker
 * 
 * USE client.on functions below to retrieve (listen for) information from broker 
 * USE client.publish functions below to transmit information to the broker
 * 
 * ***/

var options={
retain:true,
qos:1};
console.log("subscribing to topics");
client.subscribe("AvoTree/temperature",{qos:1}); //temperature sensor at the Avocado Tree
client.subscribe("AvoTree/outputA", {qos:1}); // status of Avocado Tree Output socket A
client.subscribe("AvoTree/outputB", {qos:1}); // status of Avocado Tree Output socket B
client.subscribe("esp32/temperature1",{qos:1}); //temperature1 sensor at the ESP 32
client.subscribe("esp32/temperature2",{qos:1}); //temperature2 sensor at the ESP 32
client.subscribe("SolarHW/feedTemperature",{qos:1}); // temperature of the fluid feeding to the solar panels
client.subscribe("SolarHW/returnTemperature",{qos:1}); // temperature of the fluid returning from the solar panels
client.subscribe("SolarHW/collectorTemperature",{qos:1}); // temperature of the fluid at the solar panels
client.subscribe("SolarHW/tank1Temperature",{qos:1}); // temperature of the water in Tank 1
client.subscribe("SolarHW/tank2Temperature",{qos:1}); // temperature of the water in Tank 2
client.subscribe("SolarHW/cirPumpState",{qos:1}); // Is the circulation pump ON or OFF
client.subscribe("SolarHW/tank1valveState",{qos:1}); // Is the soliniod valve on Tank 1 OPEN or CLOSED
client.subscribe("SolarHW/tank2valveState",{qos:1}); // Is the soliniod valve on Tank 1 OPEN or CLOSED
client.subscribe("SolarHW/systemPressure",{qos:1}); // Pressure of the system in PSI
client.subscribe("SolarHW/flowRate",{qos:1}); // Flow Rate of the system in GPM
client.subscribe("SolarHW/systemStatus",{qos:1}); // Is the system: Heating Tank 1, Heating Tank 2, Finished Heating
//client.subscribe("esp32/heartbeat",{qos:1}); //response to check pulse at the ESP 32
console.log("end of script");

/**  
 * Retrieves information from the MQTT broker
 * 
 * */ 

/** This section handles information from the Avocado Tree ESP32 module
 * 	Information coming from (subscribed) this module is:
 * 
 * 	Temperature Sensor:  
 * 		MQTT: AvoTree/temperature
 * 		Parameter: param.avoTemp
 * 
 *  Output A: 
 * 		MQTT: AvoTree/outputA
 * 		Parameter: param.avoOutputA
 * 
 * 	Output B: 
 * 		MQTT: AvoTree/outputB
 * 		Parameter: param.avoOutputB
 */


client.on('message',function(topic, message, packet){

	switch (topic){
		//handle incoming messages for Avocado Tree temperature
		case "AvoTree/temperature":
			var avoTempNew = parseInt (message);
	    	console.log(" Avocado Tree Temp: " + avoTempNew);
	    	if (avoTempNew !== param.avoTemp) {
				param.avoTemp = avoTempNew;
				io.emit('AvoTemp', param.avoTemp); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new AvoTemp value= '+param.avoTemp);
			}
			break;

		//handle incoming messages for Avocado Tree Output A status
		case "AvoTree/outputA":
			//console.log(" Incoming message Avo Output A: "+message);
	    	var avoOutputANew = String(message);
			if (avoOutputANew !== param.avoOutputA){
				param.avoOutputA = avoOutputANew;
				console.log ("IO emit output A")
				io.emit('AVOOUTA', param.avoOutputA);
				// Params saved once a minute
			}
	    	if (param.avoOutputA == "ON" && param.MQTT31value == 0 && param.avoMessageFlag == 0) {
			var message = "Avocado Tree temperature is below set point";
			//mailMessage(message);
			console.log('new message content value= '+message);
			param.avoMessageFlag = 1;
	    	} else if (param.avoOutputA == "OFF" && param.avoOutputB == "OFF" && param.avoMessageFlag == 1) {
			console.log("Message flag has been reset");
			param.avoMessageFlag = 0;
	   		}
			break;	

		//handle incoming messages for Avocado Tree Output B status
		case "AvoTree/outputB":
			var avoOutputBNew = String(message);
			if (avoOutputBNew !== param.avoOutputB){
				param.avoOutputB = avoOutputBNew;
				console.log ("IO emit output B")
				io.emit('AVOOUTB', param.avoOutputB);
				// Params saved once a minute
			}
	    	if ((param.avoOutputB == "ON") && (param.MQTT32value = 0) && param.avoMessageFlag == 0) {
			var message = "Avocado Tree temperature is below lower limit";
			//mailMessage(message);
			console.log('new message content value:'+message);
			param.avoMessageFlag = 1;
			//packParam();
	    	} else if (param.avoOutputB == "OFF" && param.avoOutputA == "OFF" && param.avoMessageFlag == 1) {
			console.log("Message flag has been reset");
			param.avoMessageFlag = 0;
	    	}
			break;
/** This section handles information from the development ESP32 module
 * 	Information coming from (subscribed) this module is:
 * 
 * 	Temperature Sensor 1:  MQTT: esp32/temperature1 | Parameter: param.esp32Temp1
 * 		Note:  Temp 1 is regular, freestanding temp probe
 * 
 * 	Temperature Sensor 2:  MQTT: esp32/temperature2 | Parameter: param.esp32Temp2
 * 		Note:  Temp 2 is a temp probe in thermal well w/ 1/2" NPT fitting
 */
    
		//handle incoming messages for ESP32 temperature sensor 1
		case "esp32/temperature1":
	    	var esp32tempNew = parseInt (message);
	    	//if (esp32tempNew !== param.esp32Temp1) {
			param.esp32Temp1 = esp32tempNew;
			io.emit('ESP32Temp1', param.esp32Temp1); //send esp32 temp value to ALL clients
			// this gets called whenever ESP32 temperature is update
			console.log(' ESP32 Temp 1 value: '+param.esp32Temp1);
			break;

		//handle incoming messages for ESP32 temperature sensor 2
		case "esp32/temperature2":
	    	var esp32tempNew = parseInt (message);
	    	console.log(" ESP32 Temperature 2: " + esp32tempNew);
	    	//if (esp32tempNew !== param.esp32Temp2) {
			param.esp32Temp2 = esp32tempNew;
			io.emit('ESP32Temp2', param.esp32Temp2); //send esp32 temp value to ALL clients
			// this gets called whenever ESP32 temperature is update
			console.log('new ESP32 Temp 2 value='+param.esp32Temp2);
			break;

/** This section handles information from the Solar Hot Water module
 * 	Information coming from (subscribed) this module is:
 * 
 * 	Temperature Sensor:  
 * 		MQTT: AvoTree/temperature
 * 		Parameter: param.avoTemp
 * 
 *  Output A: 
 * 		MQTT: AvoTree/outputA
 * 		Parameter: param.avoOutputA
 * 
 * 	Output B: 
 * 		MQTT: AvoTree/outputB
 * 		Parameter: param.avoOutputB
 */

//handle incoming messages for Avocado Tree temperature
		case "SolarHW/feedTemperature":
			var feedTempNew = parseInt (message);
			console.log(" Feed Temp: " + feedTempNew);
			if (feedTempNew !== param.feedTemp) {
				param.feedTemp = feedTempNew;
				io.emit('feedTemp', param.feedTemp); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new feedTemp value= '+param.feedTemp);
			}
			break;
		case "SolarHW/returnTemperature":
			var returnTempNew = parseInt (message);
			console.log(" Return Temp: " + returnTempNew);
			if (returnTempNew !== param.returnTemp) {
				param.returnTemp = returnTempNew;
				io.emit('returnTemp', param.returnTemp); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new returnTemp value= '+param.returnTemp);
			}
			break;
		case "SolarHW/collectorTemperature":
			var collectorTempNew = parseInt (message);
			console.log(" Collector Temp: " + collectorTempNew);
			if (collectorTempNew !== param.collectorTemp) {
				param.collectorTemp = collectorTempNew;
				io.emit('collectorTemp', param.collectorTemp); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new collectorTemp value= '+param.collectorTemp);
			}
			break;
		case "SolarHW/tank1Temperature":
			var tank1TempNew = parseInt (message);
			console.log(" Tank 1 Temp: " + tank1TempNew);
			if (tank1TempNew !== param.tank1Temp) {
				param.tank1Temp = tank1TempNew;
				io.emit('tank1Temp', param.tank1Temp); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new tank1Temp value= '+param.tank1Temp);
			}
			break;
			 
		case "SolarHW/tank2Temperature":
			var tank2TempNew = parseInt (message);
			console.log(" Tank 2 Temp: " + tank2TempNew);
			if (tank2TempNew !== param.tank2Temp) {
				param.tank2Temp = tank2TempNew;
				io.emit('tank2Temp', param.tank2Temp); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new tank2Temp value= '+param.tank2Temp);
			}
			break;
		case "SolarHW/cirPumpState":
			var cirPumpNew = parseInt (message);
			console.log(" Circulation Pump State: " + cirPumpNew);
			if (cirPumpNew !== param.cirPump) {
				param.cirPump = cirPumpNew;
				io.emit('cirPump', param.cirPump); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new cirPump State = '+param.cirPump);
			}
			break;
		case "SolarHW/tank1valveState":
			var tank1ValveNew = parseInt (message);
			console.log(" Tank 1 Valve State: " + tank1ValveNew);
			if (tank1ValveNew !== param.tank1Valve) {
				param.tank1Valve = tank1ValveNew;
				io.emit('tank1Valve', param.tank1Valve); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new tank1Valve State = '+param.tank1Valve);
			}
			break;
		case "SolarHW/tank2valveState":
			var tank2ValveNew = parseInt (message);
			console.log(" Tank 2 Valve State: " + tank2ValveNew);
			if (tank2ValveNew !== param.tank2Valve) {
				param.tank2Valve = tank2ValveNew;
				io.emit('tank2Valve', param.tank1Valve); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new tank2Valve State = '+param.tank2Valve);
			}
			break;
		case "SolarHW/systemPressure":
			var sysPressureNew = parseInt (message);
			console.log(" System Pressure (PSI): " + sysPressureNew);
			if (sysPressureNew !== param.sysPressure) {
				param.sysPressure = sysPressureNew;
				io.emit('sysPressure', param.sysPressure); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new sysPressure = '+param.sysPressure);
			}
			break;
		case "SolarHW/flowRate":
			var flowRateNew = parseInt (message);
			console.log(" Flow Rate (GPM): " + flowRateNew);
			if (flowRateNew !== param.flowRate) {
				param.flowRate = flowRateNew;
				io.emit('flowRate', param.flowRate); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new flowRate = '+param.flowRate);
			}
			break;
		case "SolarHW/systemStatus":
			var sysStatusNew = parseInt (message);
			console.log(" System Status: " + sysStatusNew);
			if (sysStatusNew !== param.sysStatus) {
				param.sysStatus = sysStatusNew;
				io.emit('sysStatus', param.sysStatus); //send Avo Temp temp value to ALL clients
				// this gets called whenever avocado tree temperature is update
				console.log('new sysStatus = '+param.sysStatus);
			}
			break;




	}
});    
    
client.on("connect", function(){
console.log ("connected flag " + client.connected);
})

/*** This section is variables for the MQTT interface ***/

client.on("connect",function(){	
console.log("connected  "+ client.connected);

})
//handle errors
client.on("error",function(error){
console.log("Can't connect" + error);
process.exit(1)});

//publish
function publish(topic,msg,options){
console.log("publishing",msg);

if (client.connected == true){
	
client.publish(topic,msg,options);

}
count+=1;
if (count==2) //ens script
	clearTimeout(timer_id); //stop timer
	client.end();	
}

/** function handler is called whenever a client makes an http request 
 * to the server such as requesting a web page. **/

function handler (req, res) { 
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    console.log('filename='+filename);
    var extname = path.extname(filename);
    if (filename=='./') {
      console.log('retrieving default index.html file');
      filename= './index.html';
    }
    
    // Initial content type
    var contentType = 'text/html';
    
    // Check ext and set content type
    switch(extname) {
	case '.js':
	    contentType = 'text/javascript';
	    break;
	case '.css':
	    contentType = 'text/css';
	    break;
	case '.json':
	    contentType = 'application/json';
	    break;
	case '.png':
	    contentType = 'image/png';
	    break;
	case '.jpg':
	    contentType = 'image/jpg';
	    break;
	case '.ico':
	    contentType = 'image/png';
	    break;
    }
    

    
    fs.readFile(__dirname + '/public/' + filename, function(err, content) {
	if(err) {
	    console.log('File not found. Filename='+filename);
	    fs.readFile(__dirname + '/public/404.html', function(err, content) {
		res.writeHead(200, {'Content-Type': 'text/html'}); 
		return res.end(content,'utf8'); //display 404 on error
	    });
	}
	else {
	    // Success
	    res.writeHead(200, {'Content-Type': contentType}); 
	    return res.end(content,'utf8');
	}
      
    });
}


/****** io.socket is the websocket connection to the client's browser  ********/

/** This gets called whenever a new clients connects */
io.on('connection', function (socket) {// WebSocket Connection
    console.log('A new client has connectioned. Send LED status');
    socket.emit('Param', packParamJSON); // send current parameters to ALL clients
	socket.emit('WSDATA', JSON.stringify(wsData)); //send weather station data to ALL clients



/** This section handles information coming from the webpage (user input) and sends 
 * to the modules via MQTT topics
*/

/** 
 * This section handles information from the Avocado Tree ESP32 module
 * 	Information sending to (published) this module is:
 * 
 * 	Avocado Tree Set Point:
 * 		Socket: AVOSP  
 * 		MQTT: AvoTree/setTemperaturePoint 
 * 		Parameter: param.avoSetPoint
 * 
 * 	Avocado Tree Range:  
 * 		Socket: AVORN
 * 		MQTT: AvoTree/setRange
 * 		Parameter: param.avoRange
 * 
 *  Output A Status:
 * 		Socket: MQTT31T - Toggles values, either:  1 = MAN, 0 = AUTO
 * 		MQTT: AvoTree/outputAMode - Values either: "MAN" or "AUTO"
 * 		Parameter" param.MQTT31value
 * 
 * 	Output A Status:
 * 		Socket: MQTT32T - Toggles values, either:  1 = MAN, 0 = AUTO
 * 		MQTT: AvoTree/outputBMode - Values either: "MAN" or "AUTO"
 * 		Parameter" param.MQTT32value
 * 
 */

// this gets called whenever Avocado Tree Set Point is updated
socket.on('AVOSP', function(data) { 
	if (data !== param.avoSetPoint) {
		param.avoSetPoint = data
		param.avoMessageFlag = 0;
		if (client.connected == true) {
		    client.publish("AvoTree/setTemperaturePoint", param.avoSetPoint);
		    console.log('new Avocado Tree Set Point value= '+ param.avoSetPoint);
		} else {
		console.log("No change to Avo Tree Set Point");
	    }
	// Params saved once a minute
	console.log('Send new Avocado Set Point (AVOSP) value to ALL clients');
	io.emit('AVOSP', param.avoSetPoint); //send set point value to ALL clients
	}
});
    
// this gets called whenever Avocado Tree Range is updated
socket.on('AVORN', function(data) { 
	if (data !== param.avoRange) {
		param.avoRange = data
		param.avoMessageFlag = 0;
		if (client.connected == true) {
		    client.publish("AvoTree/setRange", param.avoRange);
		    console.log('new Avocado Tree Range value= '+param.avoRange);
	    } else {
		console.log("No change to Avo Tree Range");
	    }
	}
	// Params saved once a minute
	console.log('Send new Avocado Range (AVORN) value to ALL clients');
	io.emit('AVORN', param.avoRange); //send range value to ALL clients
});

// this gets called whenever client presses Avo Socket A (MQTT31) toggle light button
socket.on('MQTT31T', function(data) { 
	if (param.MQTT31value) param.MQTT31value = 0;
		else param.MQTT31value = 1;
		console.log('new Avo Socket A value='+param.MQTT31value);
		if (client.connected == true) {
			if (param.MQTT31value == 1) {
			client.publish("AvoTree/outputAMode", "MAN");
			} else if (param.MQTT31value == 0) {
			client.publish("AvoTree/outputAMode", "AUTO");
			}
		}
	// Params saved once a minute
	console.log('Send new Avo Socket A (MQTT31) state to ALL clients');
	io.emit('MQTT31', param.MQTT31value); //send button status to ALL clients 
});
		
// this gets called whenever client presses Avo Socket B (MQTT32) toggle light button
socket.on('MQTT32T', function(data) { 
	if (param.MQTT32value) param.MQTT32value = 0;
		else param.MQTT32value = 1;
		console.log('new Avo Socket B value='+param.MQTT32value);
		if (client.connected == true) {
			if (param.MQTT32value == 1) {
			client.publish("AvoTree/outputBMode", "MAN");
			} else if (param.MQTT32value == 0) {
			client.publish("AvoTree/outputBMode", "AUTO");
			}
		}
	// Params saved once a minute
	console.log('Send new Avo Socket B (MQTT32) state to ALL clients');
	io.emit('MQTT32', param.MQTT32value); //send button status to ALL clients 
});

/** 
 * This section handles information from the ESP32 development module
 * 	Information sending to (published) this module is:
 * 
 * 	ESP32 Set Point:
 * 		Socket: ESP32SP  
 * 		MQTT: Currently not transmitted to the module 
 * 		Parameter: param.esp32SetPoint
 * 
 * 	ESP32 Range:  
 * 		Socket: ESP32RN
 * 		MQTT: Currently not transmitted to the module 
 * 		Parameter: param.esp32Range
 * 
 *  Output Status:  --- Current only 1 GPIO connected, does not control anythiing
 * 						other than a single led
 * 		Socket: MQTT11T - Toggles values, either:  1 = ON, 0 = OFF
 * 		MQTT: N/A - Does not tranmit a MQTT value
 * 		Parameter" param.MQTT11value
 * 
 */

// this gets called whenever ESP32 Set Point is updated
socket.on('ESP32SP', function(data) { 
	param.esp32SetPoint = data
	console.log(' new ESP32 Set Point value= '+param.esp32SetPoint);
	// Params saved once a minute
	io.emit('ESP32SP', param.esp32SetPoint); //send set point value to ALL clients
	
});
    
// this gets called whenever ESP32 Range is updated
socket.on('ESP32RN', function(data) { 
	param.esp32Range = data
	console.log(' new ESP32 Range value= '+param.esp32Range);
	// Params saved once a minute
	io.emit('ESP32RN', param.esp32Range); //send range value to ALL clients
	
});
    
    
// this gets called whenever client presses GPIO23 (MQTT11) toggle light button
socket.on('MQTT11T', function(data) { 
	console.log("MQTT11 Data: " + data);
	if (param.MQTT11value) param.MQTT11value = 0;
	else param.MQTT11value = 1;
	console.log('new GPIO23 value='+param.MQTT11value);
	if (client.connected == true) {
	    if (param.MQTT11value == 1) {
		client.publish("esp32/led", "ON");
	    } else if (param.MQTT11value == 0) {
		client.publish("esp32/led", "OFF");
	    }
	}
	// Params saved once a minute
	console.log('Send new GPIO23 (MQTT11) state to ALL clients');
	io.emit('MQTT11', param.MQTT11value); //send button status to ALL clients
});
    
/** 
 * This section is for developing additional ESP32 development module(s)
 * 	Information sending to (published) this module is:
 * 
 * 	GPIO 2:
 * 		Socket: MQTT21T - Toggles values, either:  1 = ON, 0 = OFF
 * 		MQTT: Currently not transmitted to the module 
 * 		Parameter: param.MQTT21value
 * 
 * 	GPIO 17:
 * 		Socket: MQTT22T - Toggles values, either:  1 = ON, 0 = OFF
 * 		MQTT: Currently not transmitted to the module 
 * 		Parameter: param.MQTT22value
 * 
 * GPIO 33:
 * 		Socket: MQTT23T - Toggles values, either:  1 = ON, 0 = OFF
 * 		MQTT: Currently not transmitted to the module 
 * 		Parameter: param.MQTT23value
 * */
    
// this gets called whenever client presses GPIO02 (MQTT21) toggle light button
socket.on('MQTT21T', function(data) { 
	if (param.MQTT21value) param.MQTT21value = 0;
	else param.MQTT21value = 1;
	console.log('new GPIO02='+param.MQTT21value);
	//LED26.writeSync(MQTT32value); //turn LED on or off
	// Params saved once a minute
	console.log('Send new GPIO02 (MQTT21) state to ALL clients');
	io.emit('MQTT21', param.MQTT21value); //send button status to ALL clients 
});
    
 // this gets called whenever client presses GPIO17 (MQTT22) toggle light button
socket.on('MQTT22T', function(data) { 
	if (param.MQTT22value) param.MQTT22value = 0;
	else param.MQTT22value = 1;
	console.log('new GPIO17value='+param.MQTT22value);
	//LED26.writeSync(MQTT22value); //turn LED on or off
	// Params saved once a minute
	console.log('Send new GPIO17 (MQTT22) state to ALL clients');
	io.emit('MQTT22', param.MQTT22value); //send button status to ALL clients 
});
    
 // this gets called whenever client presses GPIO33 (MQTT23) toggle light button
socket.on('MQTT23T', function(data) { 
	if (param.MQTT23value) param.MQTT23value = 0;
	else param.MQTT23value = 1;
	console.log('new GPIO33value='+param.MQTT23value);
	//LED26.writeSync(MQTT23value); //turn LED on or off
	// Params saved once a minute
	console.log('Send new GPIO33 (MQTT23) state to ALL clients');
	io.emit('MQTT23', param.MQTT23value); //send button status to ALL clients 
});

/** 
 * This section handles information for the Solar Hot Water module
 * 	Information sending to (published) this module is:
 * 
 * 	Solar Hot Water Set Point:
 * 		Socket: SHWSP  
 * 		MQTT: SolarHW/setPoint 
 * 		Parameter: param.shwSetPoint
 * 
 * 	Solar Hot Water Range:  
 * 		Socket: SHWRN
 * 		MQTT: SolarHW/range
 * 		Parameter: param.shwRange
 * 
 */
 socket.on('SHWSP', function(data) { 
	if (data !== param.shwSetPoint) {
		param.shwSetPoint = data
		param.shwMessageFlag = 0;
		if (client.connected == true) {
		    client.publish("SolarHW/setPoint", param.shwSetPoint);
		    console.log('new Solar Hot Water Set Point value= '+ param.shwSetPoint);
		} else {
		console.log("No change to Solar Hot Water Set Point");
	    }
	// Params saved once a minute
	console.log('Send new Solar Hot Water Set Point (SHWSP) value to ALL clients');
	io.emit('SHWSP', param.shwSetPoint); //send set point value to ALL clients
	}
});

socket.on('SHWRN', function(data) { 
	if (data !== param.shwRange) {
		param.shwRange = data
		param.shwMessageFlag = 0;
		if (client.connected == true) {
		    client.publish("SolarHW/range", param.shwRange);
		    console.log('new Solar Hot Water value= '+param.shwRange);
	    } else {
		console.log("No change to Solar Hot Water Range");
	    }
	}
	// Params saved once a minute
	console.log('Send new Solar Hot water Range (SHWRN) value to ALL clients');
	io.emit('SHWRN', param.shwRange); //send range value to ALL clients
});
       

/**** This section controls the monentary switch function
 * Here just for future reference
    
    // this gets called whenever client presses MQTT11 momentary light button
    socket.on('MQTT11', function(data) { 
	MQTT11value = data;
	if (MQTT11value != LED26.readSync()) { //only change LED if status has changed
	    LED26.writeSync(GPIO26value); //turn LED on or off
	    console.log('Send new GPIO26 state to ALL clients');
	    io.emit('GPIO26', GPIO26value); //send button status to ALL clients 
	};	
    });
    
    // this gets called whenever client presses GPIO20 momentary light button
    socket.on('GPIO20', function(data) { 
	GPIO20value = data;
	if (GPIO20value != LED20.readSync()) { //only change LED if status has changed
	    LED20.writeSync(GPIO20value); //turn LED on or off
	    console.log('Send new GPIO20 state to ALL clients');
	    io.emit('GPIO20', GPIO20value); //send button status to ALL clients 
	};

    });
    
    // this gets called whenever client presses GPIO21 momentary light button
    socket.on('GPIO21', function(data) { 
	GPIO21value = data;
	if (GPIO21value != LED21.readSync()) { //only change LED if status has changed
	    LED21.writeSync(GPIO21value); //turn LED on or off
	    console.log('Send new GPIO21 state to ALL clients');
	    io.emit('GPIO21', GPIO21value); //send button status to ALL clients e
	};

    });
    
    // this gets called whenever client presses GPIO16 momentary light button
    socket.on('GPIO16', function(data) { 
	GPIO16value = data;
	if (GPIO16value != LED16.readSync()) { //only change LED if status has changed
	    LED16.writeSync(GPIO16value); //turn LED on or off
	    console.log('Send new GPIO16 state to ALL clients');
	    io.emit('GPIO16', GPIO16value); //send button status to ALL clients 
	};
	
    });
    
    // this gets called whenever client presses GPIO23 momentary light button
    socket.on('11', function(data) { 
	GPIO23value = data;
	if (GPIO23value != LED23.readSync()) { //only change LED if status has changed
	    LED23.writeSync(GPIO23value); //turn LED on or off
	    console.log('Send new GPIO23 state to ALL clients');
	    io.emit('11', GPIO23value); //send button status to ALL clients 
	};
	
    });
 
 ***/

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
	console.log('A user disconnected');
    });
    

}); 

