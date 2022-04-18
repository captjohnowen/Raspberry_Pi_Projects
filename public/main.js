//sets up variables for gauge values for Avocado Tree Temperature gauge 
var avoTemp = 0;
var avoSetPoint = 0;
var avoRange = 0;


//sets up variable guage values for ESP32 temperature gauge
var esp32Temp1 = 0;
var esp32Temp2 = 0;
var esp32SetPoint = 0;
var esp32Range = 0;

// sets up variables guages values for Solar temperature gauges
var Tank1Temp = 0;
var Tank2Temp = 0;
var collectorTemp = 0;
var feedTemp = 0;
var returnTemp = 0;
var cirPump = 0;
var tank1Valve = "OPEN";
var tank2Valve = "CLOSED";
var sysPressure = 0;
var flowRate = 0;
var shwSetPoint = 12;
var shwRange = 4;
var shwSystemStatus = "Heating Complete";


let param = new Object();
let wsData = new Object();

/************  Receives data from the server  ****************************/

	
var socket = io(); //load socket.io-client and connect to the host that serves the page
window.addEventListener("load", function(){ //when page loads
  if( isMobile.any() ) {
//    alert('Mobile');  
    document.addEventListener("touchstart", ReportTouchStart, false);
    document.addEventListener("touchend", ReportTouchEnd, false);
    document.addEventListener("touchmove", TouchMove, false);
  }else{
//    alert('Desktop');  
    document.addEventListener("mouseup", ReportMouseUp, false);
    document.addEventListener("mousedown", ReportMouseDown, false);
  }
  
});

// Gets initial data from the server
socket.on('Param', function (data) {
  param = JSON.parse(data);
  avoTemp = parseInt(param.avoTemp);
  avoSetPoint = parseInt(param.avoSetPoint);
  avoRange = parseInt(param.avoRange);
  document.getElementById("avosetpoint").innerHTML = parseInt(param.avoSetPoint);
  document.getElementById("avorange").innerHTML = parseInt (param.avoRange); 
  esp32Temp1 = parseInt(param.esp32Temp1);
  esp32Temp2 = parseInt(param.esp32Temp2);
  esp32Range = parseInt(param.esp32Range);
  esp32SetPoint = parseInt(param.esp32SetPoint);
  document.getElementById("esp32setpoint").innerHTML = parseInt (param.esp32SetPoint);
  document.getElementById("esp32range").innerHTML = parseInt (param.esp32Range);
  if (String(param.avoOutputA) === "ON") {
    document.getElementById("outADot").style.visibility = "visible";
  } else if (String(param.avoOutputA) === "OFF") {
    document.getElementById("outADot").style.visibility = "hidden";
  }
  if (String(param.avoOutputB) === "ON") {
    document.getElementById("outBDot").style.visibility = "visible";
  } else if (String(param.avoOutputB) === "OFF") {
    document.getElementById("outBDot").style.visibility = "hidden";
  }
  avoTempGauge();
  esp32Temp1Gauge();
  esp32Temp2Gauge();
  
  
});

/**
 * 
 * This section will display weather data on the main page 
 * that was retreived from the Davis weather station
 * 
 */

socket.on('WSDATA', function (data) {  
  console.log('Weather Station Data Function Called');
  //console.log(data);
  wsData = JSON.parse(data);
  console.log(wsData.temp_f);
  console.log(wsData.wind_mph);
  console.log(wsData.wind_dir)
  tempGauge();
  windGauge();
  windDirectionGauge(); 

});



/** 
 * 
 * This section is for Avocado Tree Elements 
 * This is a ESP DevKit C Board
 *
 * 	Information received to and updated on the webpage for this module is:
 * 
 * 	Avocado Tree Temp:
 * 		Socket: AvoTemp  
 * 		Parameter: param.avoTemp
 * 
 * 	Avocado Tree Set Point:  
 * 		Socket: AVOSP
 * 		Parameter: param.avoSetPoint
 * 
 *  Avocado Tree Range:  
 * 		Socket: AVORN
 * 		Parameter: param.avoRange
 * 
 *  Output Status:  --- Currently 2 GPIOs connected to ESP32 board that
 *                      can be set to AUTO or MAN operations
 * 
 *  Output A Mode: - Avocado Tree Output A
 * 		Socket: MQTT31 -  Toggles values, either:  1 = MAN, 0 = AUTO
 * 		Parameter: param.MQTT31value
 * 
 *  Output B Mode: - Avocado Tree Output B
 * 		Socket: MQTT32 -  Toggles values, either:  1 = MAN, 0 = AUTO
 * 		Parameter: param.MQTT32value
 * 
 *  Output A Status: -  Avocado Tree Output A Status -  When server receives a 
 *                      MQTT message that Output A has turned on, either while in
 *                      MAN or AUTO mode, feeds that back to the client as an
 *                      indicator 
 * 		Socket: AVOOUTA - Makes the indicator visible (1) or hidden (0)
 * 		Parameter: param.avoOutputA
 * 
 *  Output B Status: -  Avocado Tree Output B Status -  When server receives a 
 *                      MQTT message that Output B has turned on, either while in
 *                      MAN or AUTO mode, feeds that back to the client as an
 *                      indicator 
 * 		Socket: AVOOUTB - Makes the indicator visible (1) or hidden (0)
 * 		Parameter: param.avoOutputB
 * 
 */ 


//Update AvoTemp when server sends updated temperature
socket.on('AvoTemp', function (data) {  
  console.log('AvoTemp function called');
  console.log(data);
  param.avoTemp = JSON.parse(data);
  console.log(" New avoTemp: " + param.avoTemp);
  avoTemp = parseInt(param.avoTemp);
  avoTempGauge();// Avo Tree temp gauge
});

//Update Avocado Set Point when server sends updated set point
socket.on('AVOSP', function (data) {  
  console.log('Avocado Set Point function called');
  console.log(data);
  param.avoSetPoint = JSON.parse(data);
  console.log(param.avoSetPoint);
  avoSetPoint = parseInt(param.avoSetPoint);
  console.log('AvoSP: '+param.avoSetPoint);
  document.getElementById("avosetpoint").innerHTML = parseInt (param.avoSetPoint);
  document.getElementById("avorange").innerHTML = parseInt (param.avoRange);
  avoTempGauge();
});

//Update Avocado Range when server sends updated range
socket.on('AVORN', function (data) {  
  console.log('Avocado Range function called');
  console.log(data);
  param.avoRange = JSON.parse(data);
  console.log(param.avoRange);
  avoRange = parseInt(param.avoRange);
  console.log('AvoRange: '+param.avoRange);
  document.getElementById("avosetpoint").innerHTML = parseInt(param.avoSetPoint);
  document.getElementById("avorange").innerHTML = parseInt(param.avoRange);
  avoTempGauge();
});

//Update slide switch (output A) on the webpage server when it changes state
socket.on('MQTT31', function (data) {  
  console.log('Avo Socket A function called');
  console.log(data);
  param.MQTT31value = JSON.parse(data);
  console.log(param.MQTT31value);
  document.getElementById('MQTT31').checked = param.MQTT31value;
  console.log('Avo Socket A: '+param.MQTT31value);
});

//Update slide switch (output B) on the webpage server when it changes state
socket.on('MQTT32', function (data) {  
  console.log('Avo Socket B function called');
  console.log(data);
  param.MQTT32value = JSON.parse(data);
  console.log(param.MQTT32value);
  document.getElementById('MQTT32').checked = param.MQTT32value;
  console.log('Avo Socket B: '+param.MQTT32value);
});

/**
 * Update Avocado Output A indicator on webpage based on information received by the 
 * server for Output A
*/
socket.on('AVOOUTA', function (data) {  
  console.log('Avocado Output A function called');
  console.log(data);
  param.avoOutputA = data;
  console.log(param.avoOutputA);
  if (String(param.avoOutputA) === "ON") {
    document.getElementById("outADot").style.visibility = "visible";
  } else if (String(param.avoOutputA) === "OFF") {
    document.getElementById("outADot").style.visibility = "hidden";
  }
});

/**
 * Update Avocado Output B indicator on the webpage based on information received by the 
 * server for Output B
*/
socket.on('AVOOUTB', function (data) {  
  console.log('Avocado Output B function called');
  console.log(data);
  param.avoOutputB = data;
  console.log(param.avoOutputB);
  if (String(param.avoOutputB) === "ON") {
    document.getElementById("outBDot").style.visibility = "visible";
  } else if (String(param.avoOutputB) === "OFF") {
    document.getElementById("outBDot").style.visibility = "hidden";
  }
});

/** 
 * 
 * End of Avocado Tree elements 
 * 
 * */

/************************************************************************/

/** 
 * 
 * This section is for the Heltec ESP32 development Board 
 * 
 * 	Information received to and updated on the webpage for this module is:
 * 
 * 	ESP32 Temp 1:
 * 		Socket: ESP32Temp1  
 * 		Parameter: param.esp32Temp1
 * 
 *  ESP32 Temp 2:
 * 		Socket: ESP32Temp2  
 * 		Parameter: param.esp32Temp2
 * 
 * 	ESP32 Set Point:  
 * 		Socket: ESP32SP
 * 		Parameter: param.esp32SetPoint
 * 
 *  ESP32 Range:  
 * 		Socket: ESP32RN
 * 		Parameter: param.esp32Range
 * 
 *  Output Status:  --- Current only 1 GPIO connected, does not control anythiing
 * 						other than a single led
 * 		Socket: MQTT11 - Toggles values, either:  1 = ON, 0 = OFF
 * 		Parameter: param.MQTT11value
 * 
 */ 

/**  
 * 
 * Update ESP32 Temp 1 when server sends updated temperature
 * Temp 1 is regular, freestanding temp probe
 * 
 * */
socket.on('ESP32Temp1', function (data) {  
  console.log('ESP32Temp 1 function called');
  console.log(data);
  param.esp32Temp1 = JSON.parse(data);
  console.log(" New esp32 Temp: " + param.esp32Temp1);
  esp32Temp1 = parseInt(param.esp32Temp1);
  console.log("ESP32Temp: "+param.esp32Temp1);
  esp32Temp1Gauge();
});

/**
 * 
 * Update ESP32 Temp 2 when server sends updated temperature
 * Temp 2 is a temp probe in thermal well w/ 1/2" NPT fitting
 * 
 * */
socket.on('ESP32Temp2', function (data) {  
  console.log("ESP32Temp 2 function called");
  console.log(data);
  param.esp32Temp2 = JSON.parse(data);
  console.log(param.esp32Temp2);
  esp32Temp2 = parseInt(param.esp32Temp2);
  console.log("ESP32Temp 2: "+param.esp32Temp2);
  esp32Temp2Gauge();
});

//Update ESP32 Set Point when server sends updated set point
socket.on('ESP32SP', function (data) {  
  console.log('ESP32 Set Point function called');
  console.log(data);
  param.esp32SetPoint = JSON.parse(data);
  console.log(param.esp32SetPoint);
  esp32SetPoint = parseInt(param.esp32SetPoint);
  console.log('ESP32SP: '+param.esp32SetPoint);
  document.getElementById("esp32setpoint").innerHTML = parseInt (param.esp32SetPoint);
  document.getElementById("esp32range").innerHTML = parseInt(param.esp32Range);
  esp32Temp1Gauge();
  esp32Temp2Gauge();
});

//Update ESP32 Range when server sends updated set point
socket.on('ESP32RN', function (data) {  
  console.log('ESP32 Range function called');
  console.log(data);
  param.esp32Range = JSON.parse(data);
  console.log(param.esp32Range);
  esp32Range = parseInt(param.esp32Range);
  console.log('ESP32 Range: '+param.esp32Range);
  document.getElementById("esp32setpoint").innerHTML = parseInt (param.esp32SetPoint);
  document.getElementById("esp32range").innerHTML = parseInt(param.esp32Range);
  esp32Temp1Gauge();
  esp32Temp2Gauge();
});


//Update slide switch (GPIO 23 on Heltec Board) on the webpage server when it changes state
socket.on('MQTT11', function (data) {  
  console.log('GPIO23 function called');
  console.log(data);
  param.MQTT11value = JSON.parse(data);
  console.log(param.MQTT11value);
  document.getElementById('MQTT11').checked = param.MQTT11value;
  console.log('GPIO23: '+param.MQTT11value);
});

/** 
 * 
 * End of Heltec ESP32 Dvelopment board section 
 * 
 * */

/*************************************************************************/

/** 
 * This section is for developing additional ESP32 development module(s)
 * 	Information sending to (published) this module is:
 * 
 * 	GPIO 2:
 * 		Socket: MQTT21 - Toggles values, either:  1 = ON, 0 = OFF 
 * 		Parameter: param.MQTT21value
 * 
 * 	GPIO 17:
 * 		Socket: MQTT22 - Toggles values, either:  1 = ON, 0 = OFF 
 * 		Parameter: param.MQTT22value
 * 
 * GPIO 33:
 * 		Socket: MQTT23 - Toggles values, either:  1 = ON, 0 = OFF
 * 		Parameter: param.MQTT23value
 * */



//Update gpio feedback when server changes LED state
socket.on('MQTT21', function (data) {  
  console.log('GPIO2 function called');
  console.log(data);
  param.MQTT21value = JSON.parse(data);
  console.log(param.MQTT21value);
  document.getElementById('MQTT21').checked = param.MQTT21value;
  console.log('GPIO2: '+param.MQTT21value);
});

//Update gpio feedback when server changes LED state
socket.on('MQTT22', function (data) {  
  console.log('GPIO17 function called');
  console.log(data);
  param.MQTT22value = JSON.parse(data);
  console.log(param.MQTT22value);
  document.getElementById('MQTT22').checked = param.MQTT22value;
  console.log('GPIO17: '+param.MQTT22value);
});

//Update gpio feedback when server changes LED state
socket.on('MQTT23', function (data) {  
  console.log('GPIO33 function called');
  console.log(data);
  param.MQTT23value = JSON.parse(data);
  console.log(param.MQTT23value);
  document.getElementById('MQTT23').checked = param.MQTT23value;
  console.log('GPIO33: '+param.MQTT23value);
});

/******************** End of Development Board ***************************/

/**  
 * 
 * This section transmits change a webpage slide switch position to the server. 
 * The server then repeats back those positions via sockets which actually changes
 * the appearence on the webpage
 * 
 */
function ReportTouchStart(e) {
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) { 
  // Now we know that x is defined, we are good to go.
    if (x === "MQTT11") {
 //     console.log("GPIO23 toggle");
      socket.emit("MQTT11T");  // send GPIO button toggle to node.js server
    } else if (x === "MQTT31") {
 //     console.log("Avo Socket A toggle");
      socket.emit("MQTT31T");  // send GPIO button toggle to node.js server
    } else if (x === "MQTT32") {
//      console.log("Avo Socket B toggle");
      socket.emit("MQTT32T");  // send GPIO button toggle to node.js server
    } else if (x === "MQTT21") {
  //    console.log("GPIO2 toggle");
      socket.emit("MQTT21T");  // send GPIO button toggle to node.js server
    }  else if (x === "MQTT22") {
  //    console.log("GPIO17 toggle");
      socket.emit("MQTT22T");  // send GPIO button toggle to node.js server
    }  else if (x === "MQTT23") {
  //    console.log("GPIO17 toggle");
      socket.emit("MQTT23T");  // send GPIO button toggle to node.js server
    } 
    
  }
  /******************** End of slide switch transmit to server *************/

  /******************** NOT USED - Future reference ************************/
 // consol.log ("GPIO23 pressed");
  if (e.target.id === "MQTT11M") {
    socket.emit("MQTT11", 1); 
    document.getElementById('MQTT11').checked = 1;
  } else if (e.target.id === "MQTT31M") {
 //   console.log("Avo Socket A pressed");
    socket.emit("MQTT31", 1); 
    document.getElementById('MQTT31').checked = 1;
  } else if (e.target.id === "MQTT32M") {
  //  console.log("Avo Socket B pressed");
    socket.emit("MQTT32", 1); 
    document.getElementById('MQTT32').checked = 1;
  } else if (e.target.id === "MQTT21M") {
//    console.log("GPIO2 pressed");
    socket.emit("MQTT21", 1); 
    document.getElementById('MQTT21').checked = 1;
  }  else if (e.target.id === "MQTT22M") {
//    console.log("GPIO17 pressed");
    socket.emit("MQTT22", 1); 
    document.getElementById('MQTT22').checked = 1;
  } else if (e.target.id === "MQTT23M") {
//    console.log("GPIO33 pressed");
    socket.emit("MQTT23", 1); 
    document.getElementById('MQTT23').checked = 1;
  }
}

function ReportTouchEnd(e) {
  if (e.target.id === "MQTT11M") {
    socket.emit("MQTT11", 0); 
    document.getElementById('MQTT11').checked = 0;
  } else if (e.target.id === "MQTT31M") {
    socket.emit("MQTT31", 0); 
    document.getElementById('MQTT31').checked = 0;
  } else if (e.target.id === "MQTT32M") {
    socket.emit("MQTT32", 0); 
    document.getElementById('MQTT32').checked = 0;
  } else if (e.target.id === "MQTT21M") {
    socket.emit("MQTT21", 0); 
    document.getElementById('MQTT21').checked = 0;
  } else if (e.target.id === "MQTT22M") {
    socket.emit("MQTT22", 0); 
    document.getElementById('MQTT22').checked = 0;
  } else if (e.target.id === "MQTT23M") {
    socket.emit("MQTT23", 0); 
    document.getElementById('MQTT23').checked = 0;
  }
}

function ReportMouseDown(e) {
  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) { 
  // Now we know that x is defined, we are good to go.
    if (x === "MQTT11") {
 //     console.log("GPIO23 toggle");
      socket.emit("MQTT11T");  // send GPIO button toggle to node.js server
    } else if (x === "MQTT31") {
//     console.log("Avo Socket A toggle");
      socket.emit("MQTT31T");  // send GPIO button toggle to node.js server
    } else if (x === "MQTT32") {
 //     console.log("Avo Socket B toggle");
      socket.emit("MQTT32T");  // send GPIO button toggle to node.js server
    } else if (x === "MQTT21") {
 //     console.log("GPIO2 toggle");
      socket.emit("MQTT21T");  // send GPIO button toggle to node.js server
    } else if (x === "MQTT22") {
 //     console.log("GPIO17 toggle");
      socket.emit("MQTT22T");  // send GPIO button toggle to node.js server
    } else if (x === "MQTT23") {
 //     console.log("GPIO33 toggle");
      socket.emit("MQTT23T");  // send GPIO button toggle to node.js server
    } 
  }
  
  if (e.target.id === "MQTT11M") {
 //   console.log("GPIO23 pressed");
    socket.emit("MQTT11", 1); 
    document.getElementById('MQTT11').checked = 1;
  } else if (e.target.id === "MQTT31M") {
//    console.log("Avo Socket A pressed");
    socket.emit("MQTT31", 1); 
    document.getElementById('MQTT31').checked = 1;
  } else if (e.target.id === "MQTT32M") {
//    console.log("Avo Socket B pressed");
    socket.emit("MQTT32", 1); 
    document.getElementById('MQTT32').checked = 1;
  } else if (e.target.id === "MQTT21M") {
//    console.log("GPIO2 pressed");
    socket.emit("MQTT21", 1); 
    document.getElementById('MQTT21').checked = 1;
  } else if (e.target.id === "MQTT22M") {
//    console.log("GPIO17 pressed");
    socket.emit("MQTT22", 1);
    document.getElementById('MQTT22').checked = 1;
  } else if (e.target.id === "MQTT23M") {
//    console.log("GPIO33 pressed");
    socket.emit("MQTT23", 1);
    document.getElementById('MQTT23').checked = 1;
  } 
}

/****************** END of NOT USED - above - Future reference *******************/

/** 
 * 
 * Sends data to the Server for changes to the Avocado Tree Set Point and Range
 * 
 * */

function updateAvo() {
  event.preventDefault(); // prevents form from autosubmitting
  
//Updates the Avocado Tree Set point value  
  var avoSetPointNew = document.getElementById('AvoSetPoint').value;
  if (avoSetPointNew != param.avoSetPoint && avoSetPointNew != ""){
    param.avoSetPoint = avoSetPointNew;
    socket.emit("AVOSP", param.avoSetPoint);
  };
  //console.log("Avocado Tree Set Point: " + avoSPNew);
  document.getElementById("AvoSetPoint").value =null;
  
// Updates the Avocado Tree range value  
  var avoRangeNew = document.getElementById("AvoRange").value;
  if (avoRangeNew != param.avoRange && avoRangeNew != ""){
    param.avoRange = avoRangeNew;
    socket.emit("AVORN", param.avoRange);
  };
  document.getElementById("AvoRange").value =null;
};

/** 
 * 
 * Sends data to the Server for changes to the ESP 32 Set Point and Range
 * 
 * */

function updateESP32() {
    event.preventDefault(); // prevents form from autosubmitting
    
  //Updates the ESP 32 Set Point value  
    var esp32setPointNew = document.getElementById('ESP32SetPoint').value;
    if (esp32setPointNew != param.esp32SetPoint && esp32setPointNew != ""){
      param.esp32SetPoint = esp32setPointNew;
      socket.emit("ESP32SP", param.esp32SetPoint);
    };
    console.log("ESP 32 Set Point: " + esp32setPointNew);
    document.getElementById("ESP32SetPoint").value =null;
    
// updates the ESP32 range value  
  var esp32RangeNew = document.getElementById("ESP32Range").value;
  if (esp32RangeNew != param.esp32Range && esp32RangeNew != ""){
    param.esp32Range = esp32RangeNew;
    socket.emit("ESP32RN", param.esp32Range);
  } 
  console.log("ESP32 Range: " + esp32RangeNew);
  document.getElementById("ESP32Range").value =null;
};

/*****************  NOT USED - Futrue Reference ***********************************/ 

function ReportMouseUp(e) {
  if (e.target.id === "MQTT11M") {
    socket.emit("MQTT11", 0); 
    document.getElementById('MQTT11').checked = 0;
  } else if (e.target.id === "MQTT31M") {
    socket.emit("MQTT31", 0); 
    document.getElementById('MQTT31').checked = 0;
  } else if (e.target.id === "MQTT31M") {
    socket.emit("MQTT32", 0); 
    document.getElementById('MQTT32').checked = 0;
  } else if (e.target.id === "MQTT21M") {
    socket.emit("MQTT21", 0); 
    document.getElementById('MQTT21').checked = 0;
  } else if (e.target.id === "MQTT22M") {
    socket.emit("MQTT22", 0); 
    document.getElementById('MQTT22').checked = 0;
  } else if (e.target.id === "MQTT23M") {
    socket.emit("MQTT23", 0); 
    document.getElementById('MQTT23').checked = 0;
  }
}

function TouchMove(e) {

}
/*****************  END of NOT USED - Futrue Reference *****************************/ 


/** function to sense if device is a mobile device ***/
// Reference: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

var isMobile = {
  Android: function() {
      return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
      return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

/** 
 * 
 * Builds Gauges onto webpage 
 * 
 */

      


/** Produces the guages on the webpage */

function avoTempGauge() {
  new RadialGauge({
      renderTo: 'mp_avoTemp_gauge',
      width: 180,
      height: 180,
      units: 'F',
      title: 'Temperature',
      value: avoTemp,
      minValue: 0,
      maxValue: 120,
      majorTicks: [
        '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110', '120'
      ],
      minorTicks: 2,
      strokeTicks: false,
      highlights: [
          { from: 0, to: (avoSetPoint-avoRange), color: '#DC3912' },
          { from: (avoSetPoint-avoRange), to: avoSetPoint, color: '#FF9900' },
          { from: avoSetPoint, to: 120, color: '#228B22'}
      ],
      colorPlate: '#FFFAFA',
      colorMajorTicks: '#000000',
      colorMinorTicks: '#2f4f4f',
      colorTitle: '#2f4f4f',
      colorUnits: '#2f4f4f',
      colorNumbers: '#2f4f4f',
      colorNeedle: 'rgba(240, 128, 128, 1)',
      colorNeedleEnd: 'rgba(255, 160, 122, .9)',
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '2'
  }).draw();
}

function esp32Temp1Gauge() {
  new RadialGauge({
      renderTo: 'mp_esp32Temp1_gauge',
      width: 180,
      height: 180,
      units: 'F',
      title: 'Temperature 1',
      value: esp32Temp1,
      minValue: 0,
      maxValue: 120,
      majorTicks: [
        '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110', '120'
      ],
      minorTicks: 2,
      strokeTicks: false,
      highlights: [
        { from: 0, to: (esp32SetPoint-(esp32Range/2)), color: '#DC3912' },
        { from: (esp32SetPoint-(esp32Range/2)), to: (esp32SetPoint+(esp32Range/2)), color: '#FF9900' },
        { from: (esp32SetPoint+(esp32Range/2)), to: 120, color: '#228B22'}
      ],
      colorPlate: '#FFFAFA',
      colorMajorTicks: '#000000',
      colorMinorTicks: '#2f4f4f',
      colorTitle: '#2f4f4f',
      colorUnits: '#2f4f4f',
      colorNumbers: '#2f4f4f',
      colorNeedle: 'rgba(240, 128, 128, 1)',
      colorNeedleEnd: 'rgba(255, 160, 122, .9)',
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '2'
  }).draw();
}

function esp32Temp2Gauge() {
  new RadialGauge({
      renderTo: 'mp_esp32Temp2_gauge',
      width: 180,
      height: 180,
      units: 'F',
      title: 'Temperature 2',
      value: esp32Temp2,
      minValue: 0,
      maxValue: 120,
      majorTicks: [
        '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110', '120'
      ],
      minorTicks: 2,
      strokeTicks: false,
      highlights: [
          { from: 0, to: (esp32SetPoint-(esp32Range/2)), color: '#DC3912' },
          { from: (esp32SetPoint-(esp32Range/2)), to: (esp32SetPoint+(esp32Range/2)), color: '#FF9900' },
          { from: (esp32SetPoint+(esp32Range/2)), to: 120, color: '#228B22'}
      ],
      colorPlate: '#FFFAFA',
      colorMajorTicks: '#000000',
      colorMinorTicks: '#2f4f4f',
      colorTitle: '#2f4f4f',
      colorUnits: '#2f4f4f',
      colorNumbers: '#2f4f4f',
      colorNeedle: 'rgba(240, 128, 128, 1)',
      colorNeedleEnd: 'rgba(255, 160, 122, .9)',
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '2'
  }).draw();
}

function tempGauge() {
  new RadialGauge({
      renderTo: 'mp_temp_gauge',
      width: 100,
      height: 100,
      units: 'F',
      title: 'Temperature',
      value: wsData.temp_f,
      minValue: 0,
      maxValue: 120,
      majorTicks: [
        '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110', '120'
      ],
      minorTicks: 2,
      strokeTicks: false,
      highlights: [
          { from: (wsData.davis_current_observation.temp_day_high_f -1), to: (wsData.davis_current_observation.temp_day_high_f), color: '#B22222' },
          { from: (wsData.davis_current_observation.temp_day_low_f -1), to: (wsData.davis_current_observation.temp_day_low_f), color: '#0000CD' }
      ],
      colorPlate: '#FFFAFA',
      colorMajorTicks: '#000000',
      colorMinorTicks: '#2f4f4f',
      colorTitle: '#2f4f4f',
      colorUnits: '#2f4f4f',
      colorNumbers: '#2f4f4f',
      colorNeedle: 'rgba(240, 128, 128, 1)',
      colorNeedleEnd: 'rgba(255, 160, 122, .9)',
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '2'
  }).draw();
}

// Wind Gauge
function windGauge() {
  new RadialGauge({
      renderTo: 'mp_wind_gauge',
      width: 100,
      height: 100,
      units: 'MPH',
      title: 'Wind Speed',
      value: wsData.wind_mph,
      minValue: 0,
      maxValue: 50,
      majorTicks: [
        '0', '10', '20', '30', '40', '50'
      ],
      minorTicks: 10,
      strokeTicks: false,
      highlights: [
          { from: (wsData.davis_current_observation.wind_day_high_mph -.5), to: (wsData.davis_current_observation.wind_day_high_mph), color: '#B22222' },
      ],
      colorPlate: '#FFFAFA',
      colorMajorTicks: '#000000',
      colorMinorTicks: '#2f4f4f',
      colorTitle: '#2f4f4f',
      colorUnits: '#2f4f4f',
      colorNumbers: '#2f4f4f',
      colorNeedle: 'rgba(240, 128, 128, 1)',
      colorNeedleEnd: 'rgba(255, 160, 122, .9)',
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '1'
  }).draw();
}
  // Wind Direction Compass Gauge
function windDirectionGauge() {
  new RadialGauge({
      renderTo: 'mp_windDir_gauge',
      width: 100,
      height: 100,
      units: 'Degrees',
      title: 'Wind Direction',
      value: wsData.wind_degrees,
      minValue: 0,
      maxValue: 360,
      startAngle: 180,
      ticksAngle: 360,
      majorTicks: [
        'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N',
      ],
      minorTicks: 5,
      strokeTicks: false,
      highlights: false, 
      
      /**[    { from: 28, to: 28.5, color: '#B22222' },
          { from: 28.5, to: 29, color: '#FFFF00' },
          { from: (wsData.davis_current_observation.pressure_day_high_in -.02), to: wsData.davis_current_observation.pressure_day_high_in, color: '#228B22' },
          { from: (wsData.davis_current_observation.pressure_day_low_in -.02), to: wsData.davis_current_observation.pressure_day_low_in, color: '#228B22' },
          { from: 31, to: 31.5, color: '#FFFF00' },
          { from: 31.5, to: 32, color: '#B22222' }
      ],*/
      colorPlate: '#FFFAFA',
      colorMajorTicks: '#000000',
      colorMinorTicks: '#2f4f4f',
      colorTitle: '#2f4f4f',
      colorUnits: '#2f4f4f',
      colorNumbers: '#2f4f4f',
      colorNeedle: 'rgba(240, 128, 128, 1)',
      colorNeedleEnd: 'rgba(255, 160, 122, .9)',
      valueBox: false,
      valueBoxWidth: '10',
      valueInt: '1'
  }).draw();
}
