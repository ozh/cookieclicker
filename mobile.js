var LaunchMobile=function()
{
	Game.m={fileSystem:{}};//handle for every thing mobile
	
	//docs for this stuff : http://docs.phonegap.com/en/3.0.0/cordova_file_file.md.html
	
	Game.m.readSaveRequest=function()
	{
		Debug('Load save request');
		Game.m.fileSystem.root.getFile(Game.SaveTo+'.txt',{create:true,exclusive: false},Game.m.readFileEntry,Game.m.fail);
	}
	Game.m.readSaveResponse=function(response)
	{
		Debug('Load save response');
		Game.LoadSave(unescape(response));
	}
	Game.m.writeSaveRequest=function()
	{
		Debug('Write save request');
		Game.m.fileSystem.root.getFile(Game.SaveTo+'.txt',{create:true,exclusive: false},Game.m.writeFileEntry,Game.m.fail);
	}
	
	
	Game.m.onDeviceReady=function()
	{
		Debug('Ready');
		window.requestFileSystem(LocalFileSystem.PERSISTENT,0,Game.m.gotFileSystem,Game.m.fail);//ask for the file system
	}

	Game.m.gotFileSystem=function(fileSystem)
	{
		Debug('Got file system');
		Game.m.fileSystem=fileSystem;//did we get the file system? Good, save it
		Game.LoadSave();//load the save for good measure
	}

	Game.m.readFileEntry=function(fileEntry)
	{
		Debug('Read file entry');
		fileEntry.file(Game.m.readFile,Game.m.fail);//did we get the requested file entry? That's just super, get ready to read it
	}
	Game.m.readFile=function(file)
	{
		Debug('Read file');
		var reader=new FileReader();//we got the file we wanted? Radical. Let's read it now
		reader.onloadend=function(evt)
		{
			Game.m.readSaveResponse(evt.target.result);
			//console.log(evt.target.result);
		};
		reader.readAsText(file);
	}
	
	

	Game.m.writeFileEntry=function(fileEntry)
	{
		Debug('Write file entry');
		fileEntry.createWriter(Game.m.writeFile,Game.m.fail);//did we get the requested file entry? Joy and butterflies, now we can write to it
	}
	Game.m.writeFile=function(writer)
	{
		Debug('Write file');
		writer.onwriteend=function(evt)//why this plugin isn't using unquestionably superior camel-case is beyond me
		{
		};
		writer.write(Game.saveData);//well oh my goodness I think we're done here
	}

	

	Game.m.fail=function(evt)//well I guess something went wrong
	{
		Debug('Failed');
		console.log(evt.target.error.code);
		Game.Popup(evt.target.error.code);
	}
	
	//Wait for device API libraries to load
	Debug('Readying mobile');
	document.addEventListener('deviceready',Game.m.onDeviceReady,false);
}