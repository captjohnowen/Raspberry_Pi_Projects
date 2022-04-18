let wsData = new Object();

//var tempDayHigh = 0;
//var tempDayLow = 0;

/**
 * 
 * This section will display weather data on the main page 
 * that was retreived from the Davis weather station
 * 
 */

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

 socket.on('WSDATA', function (data) {  
    console.log('Weather Station Data Function Called');
    //console.log(data);
    wsData = JSON.parse(data);
    console.log(wsData.temp_f);
    console.log(wsData.wind_mph);
    console.log(wsData.wind_dir)
    document.getElementById("24_Temp_High").innerHTML = wsData.davis_current_observation.temp_day_high_f;
    document.getElementById("24_Temp_Low").innerHTML = wsData.davis_current_observation.temp_day_low_f;
    document.getElementById("24_Wind_High").innerHTML = wsData.davis_current_observation.wind_day_high_mph;
    document.getElementById("24_Wind_High_Time").innerHTML = wsData.davis_current_observation.wind_day_high_time;
    document.getElementById("24_Rh_High").innerHTML = wsData.davis_current_observation.relative_humidity_day_high;
    document.getElementById("24_Rh_Low").innerHTML = wsData.davis_current_observation.relative_humidity_day_low;
    document.getElementById("24_baro_High").innerHTML = wsData.davis_current_observation.pressure_day_high_in;
    document.getElementById("24_baro_Low").innerHTML = wsData.davis_current_observation.pressure_day_low_in;
    baroGauge();
    tempGauge();
    windGauge();
    humidityGauge();
    windDirectionGauge();
    rainRateGauge();
    rainDayTotalGauge();
    rainMonthTotalGauge();
    rainYearTotalGauge();
  });

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
    
  }
}
  
  function ReportTouchEnd(e) {
    if (e.target.id === "MQTT11M") {
      socket.emit("MQTT11", 0); 
      document.getElementById('MQTT11').checked = 0;
    } else if (e.target.id === "MQTT31M") {
      socket.emit("MQTT31", 0); 
      document.getElementById('MQTT31').checked = 0; 
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
    }  
  }
}
  



function ReportMouseUp(e) {
    if (e.target.id === "MQTT11M") {
      socket.emit("MQTT11", 0); 
      document.getElementById('MQTT11').checked = 0;
    }
  }
  
  function TouchMove(e) {
  
  }
  
  
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


  // Temp Gauge
  function tempGauge() {
    new RadialGauge({
        renderTo: 'cw_temp_gauge',
        width: 200,
        height: 200,
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
        renderTo: 'cw_wind_gauge',
        width: 200,
        height: 200,
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

  // Rh Gauge
  function humidityGauge() {
    new RadialGauge({
        renderTo: 'cw_rh_gauge',
        width: 200,
        height: 200,
        units: 'Rh%',
        title: 'Relative Humidity',
        value: wsData.relative_humidity,
        minValue: 0,
        maxValue: 100,
        majorTicks: [
          '0', '10', '20', '30', '40', '50','60', '70', '80', '90', '100'
        ],
        minorTicks: 5,
        strokeTicks: false,
        highlights: [
            { from: (wsData.davis_current_observation.relative_humidity_day_high -1), to: (wsData.davis_current_observation.relative_humidity_day_high), color: '#B22222' },
            { from: (wsData.davis_current_observation.relative_humidity_day_low -1), to: (wsData.davis_current_observation.relative_humidity_day_low), color: '#228B22' }
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

// Barometer  
function baroGauge() {
  new RadialGauge({
      renderTo: 'cw_baro_gauge',
      width: 200,
      height: 200,
      units: 'Hg',
      title: 'Barometer',
      value: wsData.pressure_in,
      minValue: 28,
      maxValue: 32,
      majorTicks: [
        '28', '28.5', '29', '29.5', '30', '30.5', '31', '31.5', '32',
      ],
      minorTicks: 5,
      strokeTicks: false,
      highlights: [
          { from: 28, to: 28.5, color: '#B22222' },
          { from: 28.5, to: 29, color: '#FFFF00' },
          { from: (wsData.davis_current_observation.pressure_day_high_in -.02), to: wsData.davis_current_observation.pressure_day_high_in, color: '#228B22' },
          { from: (wsData.davis_current_observation.pressure_day_low_in -.02), to: wsData.davis_current_observation.pressure_day_low_in, color: '#228B22' },
          { from: 31, to: 31.5, color: '#FFFF00' },
          { from: 31.5, to: 32, color: '#B22222' }
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
      renderTo: 'cw_windDir_gauge',
      width: 200,
      height: 200,
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
// Rain Rate Gauge
function rainRateGauge() {
  new RadialGauge({
      renderTo: 'cw_rainRate_gauge',
      width: 150,
      height: 150,
      units: 'Inches / Hour',
      title: 'Rain Rate',
      value: wsData.davis_current_observation.rain_rate_in_per_hr,
      minValue: 0,
      maxValue: 3,
      majorTicks: [
        '0.0','.25', '.5', '.75', '1.0', '1.25', '1.5', '1.75', '2.0', '2.25','2.5','2.75', '3.0'
      ],
      minorTicks: 4,
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
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '1'
  }).draw();
}
// Rain accumlation DAY gauge
function rainDayTotalGauge() {
  new LinearGauge({
      renderTo: 'cw_rainDayTotal_gauge',
      width: 100,
      height: 300,
      units: 'Inches',
      title: 'Day Total',
      value: wsData.davis_current_observation.rain_day_in,
      minValue: 0,
      maxValue: 6,
      majorTicks: [
        '0','.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5','5.0','5.5', '6.0'
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
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '1'
  }).draw();
}
// Rain accumlation MONTH gauge
function rainMonthTotalGauge() {
  new LinearGauge({
      renderTo: 'cw_rainMonthTotal_gauge',
      width: 100,
      height: 300,
      units: 'Inches',
      title: 'Month Total',
      value: wsData.davis_current_observation.rain_month_in,
      minValue: 0,
      maxValue: 12,
      majorTicks: [
        '0', '1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0','9.0','10.0', '11.0', '12.0'
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
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '1'
  }).draw();
}

// Rain accumlation YEAR gauge
function rainYearTotalGauge() {
  new LinearGauge({
      renderTo: 'cw_rainYearTotal_gauge',
      width: 100,
      height: 300,
      units: 'Inches',
      title: 'Year Total',
      value: wsData.davis_current_observation.rain_year_in,
      minValue: 0,
      maxValue: 30,
      majorTicks: [
        '0', '2', '4', '6', '8', '10', '12', '14', '16','18','20', '22', '24', '26', '28', '30'
      ],
      minorTicks: 4,
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
      valueBox: true,
      valueBoxWidth: '10',
      valueInt: '1'
  }).draw();
}



