
var watchCompassID = null;
var watchAccelID = null;
var watchGPSID = null;
 
var name = null;
var count = null;
var activity = null;

var exhaustion = null;
var mood = null;
var spoken = null;

var compass = null;
var accelX = null;
var accelY = null;
var accelZ = null;

var lat = null;
var lon = null;
var accuracy = null;;
var datetime = null;
var utc = null;

var pictureSource;   // picture source
var destinationType; // sets the format of returned value

var server = null;
var teammember = null;
var frequency = 60000;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	
	readServerFile();
	readTeamMember();
	
	pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;
	
	watchCompassID = navigator.compass.watchHeading(watchCompassSuccess, watchCompassError, { frequency: 10000,timeout: 3000 });
	watchAccelID = navigator.accelerometer.watchAcceleration(watchAccelSuccess, watchAccelError, { frequency: 10000, timeout: 5000 });
	watchGPSID = navigator.geolocation.watchPosition(watchGPSSuccess, onGPSError, {maximumAge: 10000, timeout: 30000, enableHighAccuracy: true});

	// Record audio once per minute
	var recordOften = setInterval(function() { 
	
		recordAudio();
		
	}, 600000);
	
	// BreadCrumb Record
	var breadCrumb = setInterval(function() { 
	
		
		utc = Math.floor(new Date().getTime()/1000);
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSBreadCrumb, fail);	
		
	}, 600000);
	
	
	document.addEventListener("menubutton",onMenuKeyDown, false);
	function onMenuKeyDown() {
		
	  	utc = Math.floor(new Date().getTime()/1000);
		
		
	  	
		$('#t_utc3').val(utc);
		$('#TeamMember3').val(teammember);
		$('#CompassHeading3').val(compass);
		$('#AccelerometerX3').val(accelX);
		$('#AccelerometerY3').val(accelY);
		$('#AccelerometerZ3').val(accelZ);
		$('#Latitude3').val(lat);
		$('#Longitude3').val(lon);
		$('#Accuracy3').val(accuracy);
		$('#DateTime3').val(datetime);
 		
		$( "#add-form" ).panel( "open" );
	
	}	
}
////////////////////////////////////////


var mediaRec;
////////////////////////////////////////
// RECORD AUDIO CLIPS
//
function recordAudio() {
	utc = Math.floor(new Date().getTime()/1000);
	var src = utc +".mp3";
	mediaRec = new Media(src, onRecordSuccess, onRecordError);

	// Record audio
	mediaRec.startRecord();

	// Stop recording after 10 sec
	var recTime = 0;
	var recInterval = setInterval(function() {
		recTime = recTime + 1;
		setAudioPosition(recTime + " sec");
		if (recTime >= 30) {
			clearInterval(recInterval);
			mediaRec.stopRecord();
			
		}
	}, 1000);
}

// onSuccess Callback
//
function onRecordSuccess() {
	var fileURI = mediaRec.src;

	var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "audio/mp3";
	
    var params = {};
	params.TeamMember = teammember;
	options.params = params;
  
	 // if we need to send parameters to the server request
    var ft = new FileTransfer();
    ft.upload("/storage/emulated/0/" + fileURI, server, winR, failR, options);
	
}

function winR (){
	
}

function failR (error){
	alert("Error uploading audio clip:" + error.message);	
}



// onError Callback
//
function onRecordError(error) {
	alert('Record Audio Error: ' + error.message + '\n');
}

// Set audio position
//
function setAudioPosition(position) {
	document.getElementById('audio_position').innerHTML = position;
}







//WATCH COMPASS///////////////////////////////
//Get the current heading

function watchCompassSuccess(heading) {
	
	var compassInfo = document.getElementById('compassInfo');
	compassInfo.innerHTML = heading.magneticHeading;
	compass = heading.magneticHeading;
	
}

//Failed to get the heading
function watchCompassError() {
	alert("Compass Error: \n" + error.message);
}

//////////////////////////////////////
//WATCH ACCEL DATA////////////////////
function watchAccelSuccess(acceleration){
	
	var accelInfo = document.getElementById('accelInfo');
	accelInfo.innerHTML = 'Acceleration X: ' + acceleration.x + '<br>' +
          'Acceleration Y: ' + acceleration.y + '<br>' +
          'Acceleration Z: ' + acceleration.z + '<br>' ;
	accelX = acceleration.x;
	accelY = acceleration.y;
	accelZ = acceleration.z;
		  
}

function watchAccelError(error){
	alert("Accelerometer Error: \n" +error.message);
}

///////////////////////////////////
// Watch GPS///////////////////////
function watchGPSSuccess(position){
	lat = position.coords.latitude;
    lon = position.coords.longitude; 
    accuracy = position.coords.accuracy;
    datetime = new Date(position.timestamp);
	
	var gpsInfo = document.getElementById('gpsInfo');
	gpsInfo.innerHTML = 
		  'Latitude: '          + position.coords.latitude          + '<br>' +
          'Longitude: '         + position.coords.longitude         + '<br>' +
          'Accuracy: '          + position.coords.accuracy          + '<br>' +
          'Heading: '           + position.coords.heading           + '<br>' +
          'Speed: '             + position.coords.speed             + '<br>' +
          'Timestamp: '         + new Date(position.timestamp)     + '<br>';

}

// onError Callback 
//
function onGPSError(error) {
	alert('GPS Error: ' + error.message + '\n');
}

//////////////////////////////////////////////
//BREAD CRUMB RECORD TO LOCAL
//////////////////////////////////////////////
function gotFSBreadCrumb(fileSystem) {
	fileSystem.root.getFile("breadcrumbs.txt", {create: true, exclusive: false}, gotFileEntryB, fail);
}

function gotFileEntryB(fileEntry) {
        fileEntry.createWriter(gotFileWriterB, fail);
}

function gotFileWriterB(writer) {
	
        writer.onwriteend = function(evt) {
		
        };
		var len = writer.length;
		writer.seek(len);
        if (len == 0){
		writer.write("[ \n"+
					"{ " +
					 "\"Latitude\": " + lat + ', ' +
					 "\"Longitude\": " + lon + ', ' +
					 "\"Accuracy\": " + accuracy + ', ' +
					 "\"CompassHeading\": " + compass + ', ' +
					 "\"AccelerometerX\": " + accelX + ', ' +
					 "\"AccelerometerY\": " + accelY + ', ' +
					 "\"AccelerometerZ\": " + accelZ + ', ' +
					 "\"DateTime\": \"" + datetime +  '\" } ' +
					 "\"t_utc\": " + utc + ' } ' +
					 "\n ]"
		);
	}
	else{
		writer.seek(len - 1);
		writer.write(
					 ", \n { "+
					 "\"Latitude\": " + lat + ', ' +
					 "\"Longitude\": " + lon + ', ' +
					 "\"Accuracy\": " + accuracy + ', ' +
					 "\"CompassHeading\": " + compass + ', ' +
					 "\"AccelerometerX\": " + accelX + ', ' +
					 "\"AccelerometerY\": " + accelY + ', ' +
					 "\"AccelerometerZ\": " + accelZ + ', ' +
					 "\"DateTime\": \"" + datetime + '\" } ' +
					 "\"t_utc\": " + utc + ' } ' +
					 "\n ]"
					 );

	}
    }

function fail(error){
	alert("Breadcrumb record error:" + error.message);
}

////////////////////////////////////////////
$("input[type='radio']").attr("checked",true).checkboxradio("refresh");
$("input[type='radio']").prop("checked",true).checkboxradio("refresh");

function setvalue(animal){
		
		
		$('#name').val(animal);
		name = animal;
		
		
		utc = Math.floor(new Date().getTime()/1000);
		
		//for regular sightings
		$('#t_utc').val(utc);
		$('#TeamMember').val(teammember);
		$('#CompassHeading').val(compass);
		$('#AccelerometerX').val(accelX);
		$('#AccelerometerY').val(accelY);
		$('#AccelerometerZ').val(accelZ);
		$('#Latitude').val(lat);
		$('#Longitude').val(lon);
		$('#Accuracy').val(accuracy);
		$('#DateTime').val(datetime);
		
		
		//for other sightings
		$('#t_utc2').val(utc);
		$('#TeamMember2').val(teammember);
		$('#CompassHeading2').val(compass);
		$('#AccelerometerX2').val(accelX);
		$('#AccelerometerY2').val(accelY);
		$('#AccelerometerZ2').val(accelZ);
		$('#Latitude2').val(lat);
		$('#Longitude2').val(lon);
		$('#Accuracy2').val(accuracy);
		$('#DateTime2').val(datetime);	
		
}
////////////////////////////////////////
function submitSighting(){
	uploadSighting();
	recordSighting();
	getElementById("sightingForm").reset();
}
////////////////////////////////////////
function uploadSighting(){
			
		var data = $(sightingForm).serialize();
	
	$.ajax({
		type: 'POST',
		data: data,
		url: server,
		success: function(data){
			console.log(data);
			
		},
		error: function(){
			console.log(data);
			alert('There was an error uploading this sighting');
		}
	});
	
	return false;
	  
}

///////////////////////////////////////
//RECORD SIGHTING
function recordSighting() {
	
	name = document.getElementById('name').value;
	activity = $("input:radio[name ='Activity']:checked").val();
	count = document.getElementById('Count').value;
	utc = Math.floor(new Date().getTime()/1000);		
		
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSR, fail);	

}

function gotFSR(fileSystem) {
	fileSystem.root.getFile("sightings.txt", {create: true, exclusive: false}, gotFileEntryR, failR);
	
}


 function gotFileEntryR(fileEntry) {
        fileEntry.createWriter(gotFileWriter, fail);
    }

    function gotFileWriter(writer) {
	
        writer.onwriteend = function(evt) {
     
			
        };
		var len = writer.length;
		writer.seek(len);
        if (len == 0){
		writer.write("[ \n"+
					"\n { "   +
					 "\"TeamMember\": \"" + teammember  + '\", ' + 
					 "\"Bird Name\": \"" + name  + '\", ' + 
					 "\"Activity\": \"" + activity  + '\", ' + 
					 "\"Count\": " + count  + ', ' + 
					 "\"CompassHeading\": " + compass + ', ' +
					 "\"Latitude\": " + lat + ', ' +
					 "\"Longitude\": " + lon + ', ' +
					 "\"Accuracy\": " + accuracy + ', ' +
					 "\"AccelerometerX\": " + accelX + ', ' +
					 "\"AccelerometerY\": " + accelY + ', ' +
					 "\"AccelerometerZ\": " + accelZ + ', ' +
					 "\"DateTime\": \"" + datetime + '\" } ' +
					 "\"t_utc\": " + utc + ' } ' +
					 "\n ]"
		);
	}
	else{
		writer.seek(len - 1);
		writer.write(
					 ", \n { "+
					 "\"TeamMember\": \"" + teammember  + '\", ' + 
					 "\"Bird Name\": \"" + name  + '\", ' + 
					 "\"Activity\": \"" + activity  + '\", ' + 
					 "\"Count\": " + count  + ', ' + 
					 "\"CompassHeading\": " + compass + ', ' +
					 "\"Latitude\": " + lat + ', ' +
					 "\"Longitude\": " + lon + ', ' +
					 "\"Accuracy\": " + accuracy + ', ' +
					 "\"AccelerometerX\": " + accelX + ', ' +
					 "\"AccelerometerY\": " + accelY + ', ' +
					 "\"AccelerometerZ\": " + accelZ + ', ' +
					 "\"DateTime\": \"" + datetime + '\" } ' +
					 "\"t_utc\": " + utc + ' } ' +
					 "\n ]"
					 );

	}
    }

function failR(){
	alert("Sighting Data Local Storage Error: " + error.message);
}

////////////////////////////////////////
function submitSightingOther(){
	uploadSightingOther();
	recordSightingOther();
}
////////////////////////////////////////
function uploadSightingOther(){
			
		var data = $(otherForm).serialize();
	
	$.ajax({
		type: 'POST',
		data: data,
		url: server,
		success: function(data){
			console.log(data);
			
		},
		error: function(){
			console.log(data);
			alert('There was an error uploading this sighting');
		}
	});
	
	return false;
	  
}
///////////////////////////////////////
//RECORD OTHER
function recordSightingOther() {
	
	name = document.getElementById('name2').value;
	activity = $("input:radio[name ='Activity2']:checked").val();
	count = document.getElementById('Count2').value;
	utc = Math.floor(new Date().getTime()/1000);		

	
		
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSR, fail);	

}

function gotFSR(fileSystem) {
	fileSystem.root.getFile("sightings.txt", {create: true, exclusive: false}, gotFileEntryR, failO);
	
}


 function gotFileEntryR(fileEntry) {
        fileEntry.createWriter(gotFileWriter, fail);
    }

    function gotFileWriter(writer) {
	
        writer.onwriteend = function(evt) {

			
        };
		var len = writer.length;
		writer.seek(len);
        if (len == 0){
		writer.write("[ \n"+
					"\n { "   +
					"\"TeamMember\": \"" + teammember  + '\", ' + 
					 "\"Bird Name\": \"" + name  + '\", ' + 
					 "\"Activity\": \"" + activity  + '\", ' + 
					 "\"Count\": " + count  + ', ' + 
					 "\"CompassHeading\": " + compass + ', ' +
					 "\"Latitude\": " + lat + ', ' +
					 "\"Longitude\": " + lon + ', ' +
					 "\"Accuracy\": " + accuracy + ', ' +
					 "\"AccelerometerX\": " + accelX + ', ' +
					 "\"AccelerometerY\": " + accelY + ', ' +
					 "\"AccelerometerZ\": " + accelZ + ', ' +
					 "\"DateTime\": \"" + datetime + '\" } ' +
					 "\"t_utc\": " + utc + ' } ' +
					 "\n ]"
		);
	}
	else{
		writer.seek(len - 1);
		writer.write(
					 ", \n { "+
					 "\"TeamMember\": \"" + teammember  + '\", ' + 
					 "\"Bird Name\": \"" + name  + '\", ' + 
					 "\"Activity\": \"" + activity  + '\", ' + 
					 "\"Count\": " + count  + ', ' + 
					 "\"CompassHeading\": " + compass + ', ' +
					 "\"Latitude\": " + lat + ', ' +
					 "\"Longitude\": " + lon + ', ' +
					 "\"Accuracy\": " + accuracy + ', ' +
					 "\"AccelerometerX\": " + accelX + ', ' +
					 "\"AccelerometerY\": " + accelY + ', ' +
					 "\"AccelerometerZ\": " + accelZ + ', ' +
					 "\"DateTime\": \"" + datetime + '\" } ' +
					 "\"t_utc\": " + utc + ' } ' +
					 "\n ]"
					 );

	}
    }

function failO(error){
	alert("Sighting Data Local Storage Error: " + error.message);
}
////////////////////////////////////////////
function submitEthnographic(){
	uploadEthnographic();
	recordEthnographic();
	
}
////////////////////////////////////////////
//Save Ethnographic Data to Local Storage
function recordEthnographic() {
	
	//teammember = document.getElementById('teammember').value;
	exhaustion = document.getElementById('exhaustion').value;
	mood = document.getElementById('mood').value;
	spoken = document.getElementById('lastSpoken').value;
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSE, failE);	
}

function gotFSE(fileSystem) {
	fileSystem.root.getFile("ethnographics.txt", {create: true, exclusive: false}, gotFileEntryE, failE);
}


 function gotFileEntryE(fileEntry) {
	 //alert('recording ethno local');
        fileEntry.createWriter(gotFileWriterE, failE);
    }

    function gotFileWriterE(writer) {
        writer.onwriteend = function(evt) {
           
			
        };
		var len = writer.length;
		writer.seek(len);
        if (len == 0){
		writer.write("[ \n"+
					"\n { " +
					"\"TeamMember\": \"" + teammember  + '\", ' + 
					"\"Exhaustion\": " + exhaustion  + ', ' + 
					 "\"Mood\": \"" + mood  + '\", ' + 
					 "\"LastSpoke\": \"" + spoken  + '\", ' + 
					 "\"CompassHeading\": " + compass + ', ' +
					 "\"Latitude\": " + lat + ', ' +
					 "\"Longitude\": " + lon + ', ' +
					 "\"Accuracy\": " + accuracy + ', ' +
					 "\"AccelerometerX\": " + accelX + ', ' +
					 "\"AccelerometerY\": " + accelY + ', ' +
					 "\"AccelerometerZ\": " + accelZ + ', ' +
					 "\"DateTime\": \"" + datetime + '\" } ' +
					 "\"t_utc\": " + utc + ' } ' +
					 "\n ]"
		);
	}
	else{
		writer.seek(len - 1);
		writer.write(
					 ", \n { "+
					 "\"TeamMember\": \"" + teammember  + '\", ' + 
					"\"Exhaustion\": " + exhaustion  + ', ' + 
					 "\"Mood\": \"" + mood  + '\", ' + 
					 "\"LastSpoke\": \"" + spoken  + '\", ' + 
					 "\"CompassHeading\": " + compass + ', ' +
					 "\"Latitude\": " + lat + ', ' +
					 "\"Longitude\": " + lon + ', ' +
					 "\"Accuracy\": " + accuracy + ', ' +
					 "\"AccelerometerX\": " + accelX + ', ' +
					 "\"AccelerometerY\": " + accelY + ', ' +
					 "\"AccelerometerZ\": " + accelZ + ', ' +
					 "\"DateTime\": \"" + datetime + '\" } ' +
					 "\"t_utc\": " + utc + ' } ' +
					 "\n ]"
					 );

	}
    }

function failE(error){
	alert("Sighting Data Local Storage Error:" + error.message);
}

///////////////////////////////////////////////
//Upload Ethnographic Data to Server
function uploadEthnographic(){
	
		var data = $(ethnoForm).serialize();
		
	
	$.ajax({
		type: 'POST',
		data: data,
		url: server,
		success: function(data){
			console.log(data);
		
		},
		error: function(){
			console.log(data);
			alert('There was an uploading adding ethnographic data');
		}
	});
	
	return false;
	   }


//////////////////////////////////
//TAKE PHOTO AND UPLOAD TO SERVER
function clearCache() {
    navigator.camera.cleanup();
}

var retries = 0;
function onCapturePhoto(fileURI) {
    var win = function (r) {
        clearCache();
        retries = 0;
       
    }

    var fail = function (error) {
        if (retries == 0) {
            retries ++
            setTimeout(function() {
                onCapturePhoto(fileURI)
            }, 1000)
        } else {
            retries = 0;
            clearCache();
            alert('Failure uploading photo');
        }
    }

    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    var params = {};
	params.TeamMember = teammember;
	options.params = params;
          	
	 // if we need to send parameters to the server request
    var ft = new FileTransfer();
    ft.upload(fileURI, server, win, fail, options);
}

function capturePhoto() {
    navigator.camera.getPicture(onCapturePhoto, onFail, {
        quality: 100,
        destinationType: destinationType.FILE_URI, saveToPhotoAlbum:true
    });
}

function onFail(message) {
    alert('Failed because: ' + message);
}

///////////////////////////////////////////////
//WRITE IP TO LOCAL TEXT FILE



function updateServerWrite() {

	server = document.getElementById('server').value;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSIPW, fail);
	
}

function gotFSIPW(fileSystem) {
	fileSystem.root.getFile("server.txt", {create: true, exclusive: false}, gotFileEntryIPW, fail);
	
}


 function gotFileEntryIPW(fileEntry) {
        fileEntry.createWriter(gotFileWriterIPW, fail); 
		
}

function gotFileWriterIPW(writer) {
	server = document.getElementById('server').value;
	writer.truncate(0);
	writer.onwriteend = function(evt) {
                writer.seek(0);
                writer.write("http://" +server+ ":3000/upload");
                writer.onwriteend = function(evt){
				//$('#server').val(server);	
				readServerFile();            
				};
	};
	
}

/////////////////////////////////////////////////
// READ SERVER FILE

function readServerFile() {
	//alert('accesing file');
	try {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);	
	} catch(err) {
		alert(err);	
	}
	
}

function gotFS(fileSystem) {
	//alert('got file entry');
	fileSystem.root.getFile("server.txt", null, gotFileEntry, readIPFail);
	
}

function gotFileEntry(fileEntry) {
	fileEntry.file(gotFile, fail);
	//alert('got file ');
}

function gotFile(file){
	//alert('got file entry');
	readAsText(file);
}

function readAsText(file) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		console.log("Read as text");
		server = evt.target.result;
		alert("Server: " + server);
		//$('#server').val(server);
	};
	reader.readAsText(file);
	
}

function fail(error) {
	alert(error.message);
}


function readIPFail(){
	alert('Please Update Server Address');	

}

///////////////////////////////////////////////
//WRITE TEAM MEMBER



function updateTeamMember() {

	teammember = document.getElementById('member').value;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSWriteTM, fail);
	
}

function gotFSWriteTM(fileSystem) {
	fileSystem.root.getFile("teammember.txt", {create: true, exclusive: false}, gotFileEntryWriteTM, fail);
	
}


 function gotFileEntryWriteTM(fileEntry) {
	 
        fileEntry.createWriter(gotFileWriterTM, fail); 
		
}

function gotFileWriterTM(writer) {
	teammember = document.getElementById('member').value;
	writer.truncate(0);
	writer.onwriteend = function(evt) {
                writer.seek(0);
                writer.write(teammember);
                writer.onwriteend = function(evt){            
				};
	};
	
}

/////////////////////////////////////////////////
// READ TEAM MEMBER FILE

function readTeamMember() {

	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFSTM, fail);	
	
}

function gotFSTM(fileSystem) {
	fileSystem.root.getFile("teammember.txt", null, gotFileEntryTM, readTMFail);
}

function gotFileEntryTM(fileEntry) {
	fileEntry.file(gotFileTM, fail);
}

function gotFileTM(file){

	readAsTextTM(file);
}

function readAsTextTM(file) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		console.log("Read as text");
		teammember = evt.target.result;
		
	};
	reader.readAsText(file);
	
}

function readTMFail(){
	alert('Please enter team member name in settings');	

}








