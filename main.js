/*
All this code is copyright Orteil, 2013-2017.
	-with some help, advice and fixes by Nicholas Laux, Debugbro and Opti
	-also includes a bunch of snippets found on stackoverflow.com
Hello, and welcome to the joyous mess that is main.js. Code contained herein is not guaranteed to be good, consistent, or sane. Most of this is years old at this point and harkens back to simpler, cruder times. Have a nice trip.
Spoilers ahead.
http://orteil.dashnet.org
*/

VERSION=2.0042;
BETA=0;

/*=====================================================================================
MISC HELPER FUNCTIONS
=======================================================================================*/
function l(what) {return document.getElementById(what);}
function choose(arr) {return arr[Math.floor(Math.random()*arr.length)];}

function escapeRegExp(str){return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");}
function replaceAll(find,replace,str){return str.replace(new RegExp(escapeRegExp(find),'g'),replace);}

//disable sounds coming from soundjay.com (sorry)
var realAudio=Audio;//backup real audio
Audio=function(src){
	if (src.indexOf('soundjay')>-1) {Game.Popup('Sorry, no sounds hotlinked from soundjay.com.');this.play=function(){};}
	else return new realAudio(src);
};

if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === needle) {return i;}
        }
        return -1;
    };
}

function randomFloor(x) {if ((x%1)<Math.random()) return Math.floor(x); else return Math.ceil(x);}

function shuffle(array)
{
	var counter = array.length, temp, index;
	// While there are elements in the array
	while (counter--)
	{
		// Pick a random index
		index = (Math.random() * counter) | 0;

		// And swap the last element with it
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}
	return array;
}

var sinArray=[];
for (var i=0;i<360;i++)
{
	//let's make a lookup table
	sinArray[i]=Math.sin(i/360*Math.PI*2);
}
function quickSin(x)
{
	//oh man this isn't all that fast actually
	//why do I do this. why
	var sign=x<0?-1:1;
	return sinArray[Math.round(
		(Math.abs(x)*360/Math.PI/2)%360
	)]*sign;
}


//Beautify and number-formatting adapted from the Frozen Cookies add-on (http://cookieclicker.wikia.com/wiki/Frozen_Cookies_%28JavaScript_Add-on%29)
function formatEveryThirdPower(notations)
{
	return function (value)
	{
		var base = 0,
		notationValue = '';
		if (value >= 1000000 && isFinite(value))
		{
			value /= 1000;
			while(Math.round(value) >= 1000)
			{
				value /= 1000;
				base++;
			}
			if (base>=notations.length) {return 'Infinity';} else {notationValue = notations[base];}
		}
		return ( Math.round(value * 1000) / 1000 ) + notationValue;
	};
}

function rawFormatter(value) {return Math.round(value * 1000) / 1000;}

var numberFormatters =
[
	rawFormatter,
	formatEveryThirdPower([
		'',
		' million',
		' billion',
		' trillion',
		' quadrillion',
		' quintillion',
		' sextillion',
		' septillion',
		' octillion',
		' nonillion',
		' decillion',
		' undecillion',
		' duodecillion',
		' tredecillion',
		' quattuordecillion',
		' quindecillion'
	]),
	formatEveryThirdPower([
		'',
		' M',
		' B',
		' T',
		' Qa',
		' Qi',
		' Sx',
		' Sp',
		' Oc',
		' No',
		' Dc',
		' UnD',
		' DoD',
		' TrD',
		' QaD',
		' QiD'
	])
];

function Beautify(value,floats)
{
	var negative=(value<0);
	var decimal='';
	var fixed=value.toFixed(floats);
	if (value<1000000 && floats>0 && Math.floor(fixed)!=fixed) decimal='.'+(fixed.toString()).split('.')[1];
	value=Math.floor(Math.abs(value));
	if (floats>0 && fixed==value+1) value++;
	var formatter=numberFormatters[Game.prefs.format?0:1];
	var output=formatter(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
	return negative?'-'+output:output+decimal;
}

var beautifyInTextFilter=/(([\d]+[,]*)+)/g;//new regex
var a=/\d\d?\d?(?:,\d\d\d)*/g;//old regex
function BeautifyInTextFunction(str){return Beautify(parseInt(str.replace(/,/g,''),10));};
function BeautifyInText(str) {return str.replace(beautifyInTextFilter,BeautifyInTextFunction);}//reformat every number inside a string
function BeautifyAll()//run through upgrades and achievements to reformat the numbers
{
	var func=function(what){what.desc=BeautifyInText(what.baseDesc);}
	Game.UpgradesById.forEach(func);
	Game.AchievementsById.forEach(func);
}

function utf8_to_b64( str ) {
	try{return Base64.encode(unescape(encodeURIComponent( str )));}
	catch(err)
	{return '';}
}

function b64_to_utf8( str ) {
	try{return decodeURIComponent(escape(Base64.decode( str )));}
	catch(err)
	{return '';}
}


function CompressBin(arr)//compress a sequence like [0,1,1,0,1,0]... into a number like 54.
{
	var str='';
	var arr2=arr.slice(0);
	arr2.unshift(1);
	arr2.push(1);
	arr2.reverse();
	for (var i in arr2)
	{
		str+=arr2[i];
	}
	str=parseInt(str,2);
	return str;
}

function UncompressBin(num)//uncompress a number like 54 to a sequence like [0,1,1,0,1,0].
{
	var arr=num.toString(2);
	arr=arr.split('');
	arr.reverse();
	arr.shift();
	arr.pop();
	return arr;
}

function CompressLargeBin(arr)//we have to compress in smaller chunks to avoid getting into scientific notation
{
	var arr2=arr.slice(0);
	var thisBit=[];
	var bits=[];
	for (var i in arr2)
	{
		thisBit.push(arr2[i]);
		if (thisBit.length>=50)
		{
			bits.push(CompressBin(thisBit));
			thisBit=[];
		}
	}
	if (thisBit.length>0) bits.push(CompressBin(thisBit));
	arr2=bits.join(';');
	return arr2;
}

function UncompressLargeBin(arr)
{
	var arr2=arr.split(';');
	var bits=[];
	for (var i in arr2)
	{
		bits.push(UncompressBin(parseInt(arr2[i])));
	}
	arr2=[];
	for (var i in bits)
	{
		for (var ii in bits[i]) arr2.push(bits[i][ii]);
	}
	return arr2;
}


function pack(bytes) {
    var chars = [];
	var len=bytes.length;
    for(var i = 0, n = len; i < n;) {
        chars.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
    }
    return String.fromCharCode.apply(null, chars);
}

function unpack(str) {
    var bytes = [];
	var len=str.length;
    for(var i = 0, n = len; i < n; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char >>> 8, char & 0xFF);
    }
    return bytes;
}

//modified from http://www.smashingmagazine.com/2011/10/19/optimizing-long-lists-of-yesno-values-with-javascript/
function pack2(/* string */ values) {
    var chunks = values.match(/.{1,14}/g), packed = '';
    for (var i=0; i < chunks.length; i++) {
        packed += String.fromCharCode(parseInt('1'+chunks[i], 2));
    }
    return packed;
}

function unpack2(/* string */ packed) {
    var values = '';
    for (var i=0; i < packed.length; i++) {
        values += packed.charCodeAt(i).toString(2).substring(1);
    }
    return values;
}

//file save function from https://github.com/eligrey/FileSaver.js
var saveAs=saveAs||function(view){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var doc=view.document,get_URL=function(){return view.URL||view.webkitURL||view},save_link=doc.createElementNS("http://www.w3.org/1999/xhtml","a"),can_use_save_link="download"in save_link,click=function(node){var event=new MouseEvent("click");node.dispatchEvent(event)},is_safari=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),webkit_req_fs=view.webkitRequestFileSystem,req_fs=view.requestFileSystem||webkit_req_fs||view.mozRequestFileSystem,throw_outside=function(ex){(view.setImmediate||view.setTimeout)(function(){throw ex},0)},force_saveable_type="application/octet-stream",fs_min_size=0,arbitrary_revoke_timeout=500,revoke=function(file){var revoker=function(){if(typeof file==="string"){get_URL().revokeObjectURL(file)}else{file.remove()}};if(view.chrome){revoker()}else{setTimeout(revoker,arbitrary_revoke_timeout)}},dispatch=function(filesaver,event_types,event){event_types=[].concat(event_types);var i=event_types.length;while(i--){var listener=filesaver["on"+event_types[i]];if(typeof listener==="function"){try{listener.call(filesaver,event||filesaver)}catch(ex){throw_outside(ex)}}}},auto_bom=function(blob){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)){return new Blob(["\ufeff",blob],{type:blob.type})}return blob},FileSaver=function(blob,name,no_auto_bom){if(!no_auto_bom){blob=auto_bom(blob)}var filesaver=this,type=blob.type,blob_changed=false,object_url,target_view,dispatch_all=function(){dispatch(filesaver,"writestart progress write writeend".split(" "))},fs_error=function(){if(target_view&&is_safari&&typeof FileReader!=="undefined"){var reader=new FileReader;reader.onloadend=function(){var base64Data=reader.result;target_view.location.href="data:attachment/file"+base64Data.slice(base64Data.search(/[,;]/));filesaver.readyState=filesaver.DONE;dispatch_all()};reader.readAsDataURL(blob);filesaver.readyState=filesaver.INIT;return}if(blob_changed||!object_url){object_url=get_URL().createObjectURL(blob)}if(target_view){target_view.location.href=object_url}else{var new_tab=view.open(object_url,"_blank");if(new_tab==undefined&&is_safari){view.location.href=object_url}}filesaver.readyState=filesaver.DONE;dispatch_all();revoke(object_url)},abortable=function(func){return function(){if(filesaver.readyState!==filesaver.DONE){return func.apply(this,arguments)}}},create_if_not_found={create:true,exclusive:false},slice;filesaver.readyState=filesaver.INIT;if(!name){name="download"}if(can_use_save_link){object_url=get_URL().createObjectURL(blob);setTimeout(function(){save_link.href=object_url;save_link.download=name;click(save_link);dispatch_all();revoke(object_url);filesaver.readyState=filesaver.DONE});return}if(view.chrome&&type&&type!==force_saveable_type){slice=blob.slice||blob.webkitSlice;blob=slice.call(blob,0,blob.size,force_saveable_type);blob_changed=true}if(webkit_req_fs&&name!=="download"){name+=".download"}if(type===force_saveable_type||webkit_req_fs){target_view=view}if(!req_fs){fs_error();return}fs_min_size+=blob.size;req_fs(view.TEMPORARY,fs_min_size,abortable(function(fs){fs.root.getDirectory("saved",create_if_not_found,abortable(function(dir){var save=function(){dir.getFile(name,create_if_not_found,abortable(function(file){file.createWriter(abortable(function(writer){writer.onwriteend=function(event){target_view.location.href=file.toURL();filesaver.readyState=filesaver.DONE;dispatch(filesaver,"writeend",event);revoke(file)};writer.onerror=function(){var error=writer.error;if(error.code!==error.ABORT_ERR){fs_error()}};"writestart progress write abort".split(" ").forEach(function(event){writer["on"+event]=filesaver["on"+event]});writer.write(blob);filesaver.abort=function(){writer.abort();filesaver.readyState=filesaver.DONE};filesaver.readyState=filesaver.WRITING}),fs_error)}),fs_error)};dir.getFile(name,{create:false},abortable(function(file){file.remove();save()}),abortable(function(ex){if(ex.code===ex.NOT_FOUND_ERR){save()}else{fs_error()}}))}),fs_error)}),fs_error)},FS_proto=FileSaver.prototype,saveAs=function(blob,name,no_auto_bom){return new FileSaver(blob,name,no_auto_bom)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(blob,name,no_auto_bom){if(!no_auto_bom){blob=auto_bom(blob)}return navigator.msSaveOrOpenBlob(blob,name||"download")}}FS_proto.abort=function(){var filesaver=this;filesaver.readyState=filesaver.DONE;dispatch(filesaver,"abort")};FS_proto.readyState=FS_proto.INIT=0;FS_proto.WRITING=1;FS_proto.DONE=2;FS_proto.error=FS_proto.onwritestart=FS_proto.onprogress=FS_proto.onwrite=FS_proto.onabort=FS_proto.onerror=FS_proto.onwriteend=null;return saveAs}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!=null){define([],function(){return saveAs})}


//seeded random function, courtesy of http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html
(function(a,b,c,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var e,c=[],d=(typeof a)[0];if(b&&"o"==d)for(e in a)try{c.push(l(a[e],b-1))}catch(f){}return c.length?c:"s"==d?a:a+"\0"}function m(a,b){for(var d,c=a+"",e=0;c.length>e;)b[j&e]=j&(d^=19*b[j&e])+c.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=c.pow(d,e),h=c.pow(2,f),i=2*h,j=d-1;c.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),c.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(c.random(),b)})(this,[],Math,256,6,52);

function bind(scope,fn)
{
	//use : bind(this,function(){this.x++;}) - returns a function where "this" refers to the scoped this
	return function() {fn.apply(scope,arguments);};
}

CanvasRenderingContext2D.prototype.fillPattern=function(img,X,Y,W,H,iW,iH,offX,offY)
{
	//for when built-in patterns aren't enough
	if (img.alt!='blank')
	{
		var offX=offX||0;
		var offY=offY||0;
		if (offX<0) {offX=offX-Math.floor(offX/iW)*iW;} if (offX>0) {offX=(offX%iW)-iW;}
		if (offY<0) {offY=offY-Math.floor(offY/iH)*iH;} if (offY>0) {offY=(offY%iH)-iH;}
		for (var y=offY;y<H;y+=iH){for (var x=offX;x<W;x+=iW){this.drawImage(img,X+x,Y+y,iW,iH);}}
	}
}

var OldCanvasDrawImage=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function()
{
	//only draw the image if it's loaded
	if (arguments[0].alt!='blank') OldCanvasDrawImage.apply(this,arguments);
}


if (!document.hasFocus) document.hasFocus=function(){return document.hidden;};//for Opera

function AddEvent(html_element, event_name, event_function)
{
	if(html_element.attachEvent) html_element.attachEvent("on" + event_name, function() {event_function.call(html_element);});
	else if(html_element.addEventListener) html_element.addEventListener(event_name, event_function, false);
}

function FireEvent(el, etype)
{
	if (el.fireEvent)
	{el.fireEvent('on'+etype);}
	else
	{
		var evObj=document.createEvent('Events');
		evObj.initEvent(etype,true,false);
		el.dispatchEvent(evObj);
	}
}

var Loader=function()//asset-loading system
{
	this.loadingN=0;
	this.assetsN=0;
	this.assets=[];
	this.assetsLoading=[];
	this.assetsLoaded=[];
	this.domain='';
	this.loaded=0;//callback
	this.doneLoading=0;
	
	this.blank=document.createElement('canvas');
	this.blank.width=8;
	this.blank.height=8;
	this.blank.alt='blank';

	this.Load=function(assets)
	{
		for (var i in assets)
		{
			this.loadingN++;
			this.assetsN++;
			if (!this.assetsLoading[assets[i]] && !this.assetsLoaded[assets[i]])
			{
				var img=new Image();
				img.src=this.domain+assets[i];
				img.alt=assets[i];
				img.onload=bind(this,this.onLoad);
				this.assets[assets[i]]=img;
				this.assetsLoading.push(assets[i]);
			}
		}
	}
	this.Replace=function(old,newer)
	{
		if (this.assets[old])
		{
			var img=new Image();
			if (newer.indexOf('http')!=-1) img.src=newer;
			else img.src=this.domain+newer;
			img.alt=newer;
			img.onload=bind(this,this.onLoad);
			this.assets[old]=img;
		}
	}
	this.onLoadReplace=function()
	{
	}
	this.onLoad=function(e)
	{
		this.assetsLoaded.push(e.target.alt);
		this.assetsLoading.splice(this.assetsLoading.indexOf(e.target.alt),1);
		this.loadingN--;
		if (this.doneLoading==0 && this.loadingN<=0 && this.loaded!=0)
		{
			this.doneLoading=1;
			this.loaded();
		}
	}
	this.getProgress=function()
	{
		return (1-this.loadingN/this.assetsN);
	}
}

var Pic=function(what)
{
	if (Game.Loader.assetsLoaded.indexOf(what)!=-1) return Game.Loader.assets[what];
	else if (Game.Loader.assetsLoading.indexOf(what)==-1) Game.Loader.Load([what]);
	return Game.Loader.blank;
}

var Sounds=[];
var PlaySound=function(url,vol)
{
	var volume=1;
	if (vol!==undefined) volume=vol;
	if (!Game.volume || volume==0) return 0;
	if (!Sounds[url]) {Sounds[url]=new Audio(url);Sounds[url].onloadeddata=function(e){e.target.volume=Math.pow(volume*Game.volume/100,2);}}
	else if (Sounds[url].readyState>=2) {Sounds[url].currentTime=0;Sounds[url].volume=Math.pow(volume*Game.volume/100,2);}
	Sounds[url].play();
}

if (!Date.now){Date.now=function now() {return new Date().getTime();};}


var debugStr='';
var Debug=function(what)
{
	if (!debugStr) debugStr=what;
	else debugStr+='; '+what;
}

var Timer={};
Timer.t=Date.now();
Timer.labels=[];
Timer.smoothed=[];
Timer.reset=function()
{
	Timer.labels=[];
	Timer.t=Date.now();
}
Timer.track=function(label)
{
	if (!Game.sesame) return;
	var now=Date.now();
	if (!Timer.smoothed[label]) Timer.smoothed[label]=0;
	Timer.smoothed[label]+=((now-Timer.t)-Timer.smoothed[label])*0.1;
	Timer.labels[label]='<div style="padding-left:8px;">'+label+' : '+Math.round(Timer.smoothed[label])+'ms</div>';
	Timer.t=now;
}
Timer.clean=function()
{
	if (!Game.sesame) return;
	var now=Date.now();
	Timer.t=now;
}
Timer.say=function(label)
{
	if (!Game.sesame) return;
	Timer.labels[label]='<div style="border-top:1px solid #ccc;">'+label+'</div>';
}


/*=====================================================================================
GAME INITIALIZATION
=======================================================================================*/
var Game={};

Game.Launch=function()
{
	Game.version=VERSION;
	Game.beta=BETA;
	if (window.location.href.indexOf('/beta')>-1) Game.beta=1;
	Game.mobile=0;
	Game.touchEvents=0;
	//if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) Game.mobile=1;
	if (Game.mobile) Game.touchEvents=1;
			
	var css=document.createElement('style');
	css.type='text/css';
	css.innerHTML='body .icon,body .crate,body .usesIcon{background-image:url(img/icons.png?v='+Game.version+');}';
	document.head.appendChild(css);
	
	Game.baseSeason='';//halloween, christmas, valentines, fools, easter
	//automatic season detection (might not be 100% accurate)
	var day=Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/(1000*60*60*24));
	if (day>=41 && day<=46) Game.baseSeason='valentines';
	else if (day>=90 && day<=92) Game.baseSeason='fools';
	else if (day>=304-7 && day<=304) Game.baseSeason='halloween';
	else if (day>=349 && day<=365) Game.baseSeason='christmas';
	else
	{
		//easter is a pain goddamn
		var easterDay=function(Y){var C = Math.floor(Y/100);var N = Y - 19*Math.floor(Y/19);var K = Math.floor((C - 17)/25);var I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;I = I - 30*Math.floor((I/30));I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));var J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);J = J - 7*Math.floor(J/7);var L = I - J;var M = 3 + Math.floor((L + 40)/44);var D = L + 28 - 31*Math.floor(M/4);return new Date(Y,M-1,D);}(new Date().getFullYear());
		easterDay=Math.floor((easterDay-new Date(easterDay.getFullYear(),0,0))/(1000*60*60*24));
		if (day>=easterDay-7 && day<=easterDay) Game.baseSeason='easter';
	}
	
	Game.updateLog=
	'<div class="section">Info</div>'+
	'</div><div class="subsection">'+
	'<div class="title">About</div>'+
	'<div class="listing">Cookie Clicker is a javascript game by <a href="http://orteil.dashnet.org" target="_blank">Orteil</a> and <a href="http://dashnet.org" target="_blank">Opti</a>.</div>'+
	'<div class="listing">We have an <a href="http://forum.dashnet.org" target="_blank">official forum</a>; '+
		'if you\'re looking for help, you may also want to visit the <a href="http://www.reddit.com/r/CookieClicker" target="_blank">subreddit</a> '+
		'or the <a href="http://cookieclicker.wikia.com/wiki/Cookie_Clicker_Wiki" target="_blank">wiki</a>. We\'re also on <a href="http://forum.dashnet.org/discussion/277/irc-chat-channel/p1" target="_blank">IRC</a>.</div>'+
	'<div class="listing">News and teasers are usually posted on my <a href="http://orteil42.tumblr.com/" target="_blank">tumblr</a> and <a href="http://twitter.com/orteil42" target="_blank">twitter</a>.</div>'+
	'<div class="listing">We\'ve got some <a href="http://www.redbubble.com/people/dashnet" target="_blank">rad cookie shirts, hoodies and stickers</a> for sale!</div>'+
	'<div class="listing warning">Note : if you find a new bug after an update and you\'re using a 3rd-party add-on, make sure it\'s not just your add-on causing it!</div>'+
	'<div class="listing warning">Warning : clearing your browser cache or cookies <small>(what else?)</small> will result in your save being wiped. Export your save and back it up first!</div>'+
	
	'</div><div class="subsection">'+
	'<div class="title">Version history</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">08/08/2017 - 4 more years</div>'+
	'<div class="listing">&bull; new building : Chancemakers</div>'+
	'<div class="listing">&bull; new milk, new kittens, new dragon aura, new cookie, new upgrade tier</div>'+
	'<div class="listing">&bull; buffs no longer affect offline CpS</div>'+
	'<div class="listing">&bull; Godzamok\'s hunger was made less potent (this is a nerf, very sorry)</div>'+
	'<div class="listing">&bull; grimoire spell costs and maximum magic work differently</div>'+
	'<div class="listing">&bull; Spontaneous Edifice has been reworked</div>'+
	'<div class="listing">&bull; changed unlock levels and prices for some cursor upgrades</div>'+
	'<div class="listing">&bull; fixed buggy pantheon slots, hopefully</div>'+
	'<div class="listing">&bull; fixed "Legacy started a long while ago" showing as "a few seconds ago"</div>'+
	'<div class="listing">&bull; Cookie Clicker just turned 4. Thank you for sticking with us this long!</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">15/07/2017 - the spiritual update</div>'+
	'<div class="listing">&bull; implemented sugar lumps, which start coalescing if you\'ve ascended at least once and can be used as currency for special things</div>'+
	'<div class="listing">&bull; buildings can now level up by using sugar lumps in the main buildings display, permanently boosting their CpS</div>'+
	'<div class="listing">&bull; added two new features unlocked by levelling up their associated buildings, Temples and Wizard towers; more building-related minigames will be implemented in the future</div>'+
	'<div class="listing">&bull; active buffs are now saved</div>'+
	'<div class="listing">&bull; the background selector upgrade is now functional</div>'+
	'<div class="listing">&bull; the top menu no longer scrolls with the rest</div>'+
	'<div class="listing">&bull; timespans are written nicer</div>'+
	'<div class="listing">&bull; Dragonflights now tend to supercede Click frenzies, you will rarely have both at the same time</div>'+
	'<div class="listing">&bull; some old bugs were phased out and replaced by new ones</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">24/07/2016 - golden cookies overhaul</div>'+
	'<div class="listing">&bull; golden cookies and reindeer now follow a new system involving explicitly defined buffs</div>'+
	'<div class="listing">&bull; a bunch of new golden cookie effects have been added</div>'+
	'<div class="listing">&bull; CpS gains from eggs are now multiplicative</div>'+
	'<div class="listing">&bull; shiny wrinklers are now saved</div>'+
	'<div class="listing">&bull; reindeer have been rebalanced ever so slightly</div>'+
	'<div class="listing">&bull; added a new cookie upgrade near the root of the heavenly upgrade tree; this is intended to boost early ascensions and speed up the game as a whole</div>'+
	'<div class="listing">&bull; due to EU legislation, implemented a warning message regarding browser cookies; do understand that the irony is not lost on us</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">08/02/2016 - legacy</div>'+
	'<div class="listing"><b>Everything that was implemented during the almost 2-year-long beta has been added to the live game. To recap :</b></div>'+
	'<div class="listing">&bull; 3 new buildings : banks, temples, and wizard towers; these have been added in-between existing buildings and as such, may disrupt some building-related achievements</div>'+
	'<div class="listing">&bull; the ascension system has been redone from scratch, with a new heavenly upgrade tree</div>'+
	'<div class="listing">&bull; mysterious new features such as angel-powered offline progression, challenge runs, and a cookie dragon</div>'+
	'<div class="listing">&bull; sounds have been added (can be disabled in the options)</div>'+
	'<div class="listing">&bull; heaps of rebalancing and bug fixes</div>'+
	'<div class="listing">&bull; a couple more upgrades and achievements, probably</div>'+
	'<div class="listing">&bull; fresh new options to further customize your cookie-clicking experience</div>'+
	'<div class="listing">&bull; quality-of-life improvements : better bulk-buy, better switches etc</div>'+
	'<div class="listing">&bull; added some <a href="http://en.wikipedia.org/wiki/'+choose(['Krzysztof_Arciszewski','Eustachy_Sanguszko','Maurycy_Hauke','Karol_Turno','Tadeusz_Kutrzeba','Kazimierz_Fabrycy','Florian_Siwicki'])+'" target="_blank">general polish</a></div>'+/* i liked this dumb pun too much to let it go unnoticed */
	'<div class="listing">&bull; tons of other little things we can\'t even remember right now</div>'+
	'<div class="listing">Miss the old version? Your old save was automatically exported <a href="http://orteil.dashnet.org/cookieclicker/v10466/" target="_blank">here</a>!</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">05/02/2016 - legacy beta, more fixes</div>'+
	'<div class="listing">&bull; added challenge modes, which can be selected when ascending (only 1 for now : "Born again")</div>'+
	'<div class="listing">&bull; changed the way bulk-buying and bulk-selling works</div>'+
	'<div class="listing">&bull; more bugs ironed out</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">03/02/2016 - legacy beta, part III</div>'+
	'<div class="listing warning">&bull; Not all bugs have been fixed, but everything should be much less broken.</div>'+
	'<div class="listing">&bull; Additions'+
		'<div style="opacity:0.8;margin-left:12px;">'+
		'-a few more achievements<br>'+
		'-new option for neat, but slow CSS effects (disabled by default)<br>'+
		'-new option for a less grating cookie sound (enabled by default)<br>'+
		'-new option to bring back the boxes around icons in the stats screen<br>'+
		'-new buttons for saving and loading your game to a text file<br>'+
		'</div>'+
	'</div>'+
	'<div class="listing">&bull; Changes'+
		'<div style="opacity:0.8;margin-left:12px;">'+
		'-early game should be a bit faster and very late game was kindly asked to tone it down a tad<br>'+
		'-dragonflight should be somewhat less ridiculously overpowered<br>'+
		'-please let me know if the rebalancing was too heavy or not heavy enough<br>'+
		'-santa and easter upgrades now depend on Santa level and amount of eggs owned, respectively, instead of costing several minutes worth of CpS<br>'+
		'-cookie upgrades now stack multiplicatively rather than additively<br>'+
		'-golden switch now gives +50% CpS, and residual luck is +10% CpS per golden cookie upgrade (up from +25% and +1%, respectively)<br>'+
		'-lucky cookies and cookie chain payouts have been modified a bit, possibly for the better, who knows!<br>'+
		'-wrinklers had previously been reduced to a maximum of 8 (10 with a heavenly upgrade), but are now back to 10 (12 with the upgrade)<br>'+
		/*'-all animations are now handled by requestAnimationFrame(), which should hopefully help make the game less resource-intensive<br>'+*/
		'-an ascension now only counts for achievement purposes if you earned at least 1 prestige level from it<br>'+
		'-the emblematic Cookie Clicker font (Kavoon) was bugged in Firefox, and has been replaced with a new font (Merriweather)<br>'+
		'-the mysterious wrinkly creature is now even rarer, but has a shadow achievement tied to it<br>'+
		'</div>'+
	'</div>'+
	'<div class="listing">&bull; Fixes'+
		'<div style="opacity:0.8;margin-left:12px;">'+
		'-prestige now grants +1% CpS per level as intended, instead of +100%<br>'+
		'-heavenly chips should no longer add up like crazy when you ascend<br>'+
		'-upgrades in the store should no longer randomly go unsorted<br>'+
		'-window can be resized to any size again<br>'+
		'-the "Stats" and "Options" buttons have been swapped again<br>'+
		'-the golden cookie sound should be somewhat clearer<br>'+
		'-the ascend screen should be less CPU-hungry<br>'+
		'</div>'+
	'</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">20/12/2015 - legacy beta, part II</div>'+
	'<div class="listing warning">&bull; existing beta saves have been wiped due to format inconsistencies and just plain broken balance; you\'ll have to start over from scratch - which will allow you to fully experience the update and find all the awful little bugs that no doubt plague it</div>'+
	'<div class="listing warning">&bull; importing your save from the live version is also fine</div>'+
	'<div class="listing">&bull; we took so long to make this update, Cookie Clicker turned 2 years old in the meantime! Hurray!</div>'+
	'<div class="listing">&bull; heaps of new upgrades and achievements</div>'+
	'<div class="listing">&bull; fixed a whole bunch of bugs</div>'+
	'<div class="listing">&bull; did a lot of rebalancing</div>'+
	'<div class="listing">&bull; reworked heavenly chips and heavenly cookies (still experimenting, will probably rebalance things further)</div>'+
	'<div class="listing">&bull; you may now unlock a dragon friend</div>'+
	'<div class="listing">&bull; switches and season triggers now have their own store section</div>'+
	'<div class="listing">&bull; ctrl-s and ctrl-o now save the game and open the import menu, respectively</div>'+
	'<div class="listing">&bull; added some quick sounds, just as a test</div>'+
	'<div class="listing">&bull; a couple more options</div>'+
	'<div class="listing">&bull; even more miscellaneous changes and additions</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">25/08/2014 - legacy beta, part I</div>'+
	'<div class="listing">&bull; 3 new buildings</div>'+
	'<div class="listing">&bull; price and CpS curves revamped</div>'+
	'<div class="listing">&bull; CpS calculations revamped; cookie upgrades now stack multiplicatively</div>'+
	'<div class="listing">&bull; prestige system redone from scratch, with a whole new upgrade tree</div>'+
	'<div class="listing">&bull; added some <a href="http://en.wikipedia.org/wiki/'+choose(['Krzysztof_Arciszewski','Eustachy_Sanguszko','Maurycy_Hauke','Karol_Turno','Tadeusz_Kutrzeba','Kazimierz_Fabrycy','Florian_Siwicki'])+'" target="_blank">general polish</a></div>'+
	'<div class="listing">&bull; tons of other miscellaneous fixes and additions</div>'+
	'<div class="listing">&bull; Cookie Clicker is now 1 year old! (Thank you guys for all the support!)</div>'+
	'<div class="listing warning">&bull; Note : this is a beta; you are likely to encounter bugs and oversights. Feel free to send me feedback if you find something fishy!</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">18/05/2014 - better late than easter</div>'+
	'<div class="listing">&bull; bunnies and eggs, somehow</div>'+
	'<div class="listing">&bull; prompts now have keyboard shortcuts like system prompts would</div>'+
	'<div class="listing">&bull; naming your bakery? you betcha</div>'+
	'<div class="listing">&bull; "Fast notes" option to make all notifications close faster; new button to close all notifications</div>'+
	'<div class="listing">&bull; the dungeons beta is now available on <a href="http://orteil.dashnet.org/cookieclicker/betadungeons" target="_blank">/betadungeons</a></div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">09/04/2014 - nightmare in heaven</div>'+
	'<div class="listing">&bull; broke a thing; heavenly chips were corrupted for some people</div>'+
	'<div class="listing">&bull; will probably update to /beta first in the future</div>'+
	'<div class="listing">&bull; sorry again</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">09/04/2014 - quality of life</div>'+
	'<div class="listing">&bull; new upgrade and achievement tier</div>'+
	'<div class="listing">&bull; popups and prompts are much nicer</div>'+
	'<div class="listing">&bull; tooltips on buildings are more informative</div>'+
	'<div class="listing">&bull; implemented a simplified version of the <a href="https://github.com/Icehawk78/FrozenCookies" target="_blank">Frozen Cookies</a> add-on\'s short number formatting</div>'+
	'<div class="listing">&bull; you can now buy 10 and sell all of a building at a time</div>'+
	'<div class="listing">&bull; tons of optimizations and subtler changes</div>'+
	'<div class="listing">&bull; you can now <a href="http://orteil.dashnet.org/cookies2cash/" target="_blank">convert your cookies to cash</a>!</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">05/04/2014 - pity the fool</div>'+
	'<div class="listing">&bull; wrinklers should now be saved so you don\'t have to pop them everytime you refresh the game</div>'+
	'<div class="listing">&bull; you now properly win 1 cookie upon reaching 10 billion cookies and making it on the local news</div>'+
	'<div class="listing">&bull; miscellaneous fixes and tiny additions</div>'+
	'<div class="listing">&bull; added a few very rudimentary mod hooks</div>'+
	'<div class="listing">&bull; the game should work again in Opera</div>'+
	'<div class="listing">&bull; don\'t forget to check out <a href="http://orteil.dashnet.org/randomgen/" target="_blank">RandomGen</a>, our all-purpose random generator maker!</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/04/2014 - fooling around</div>'+
	'<div class="listing">&bull; it\'s about time : Cookie Clicker has turned into the much more realistic Cookie Baker</div>'+
	'<div class="listing">&bull; season triggers are cheaper and properly unlock again when they run out</div>'+
	'<div class="listing">&bull; buildings should properly unlock (reminder : building unlocking is completely cosmetic and does not change the gameplay)</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">14/02/2014 - lovely rainbowcalypse</div>'+
	'<div class="listing">&bull; new building (it\'s been a while). More to come!</div>'+
	'<div class="listing">&bull; you can now trigger seasonal events to your heart\'s content (upgrade unlocks at 5000 heavenly chips)</div>'+
	'<div class="listing">&bull; new ultra-expensive batch of seasonal cookie upgrades you\'ll love to hate</div>'+
	'<div class="listing">&bull; new timer bars for golden cookie buffs</div>'+
	'<div class="listing">&bull; buildings are now hidden when you start out and appear as they become available</div>'+
	'<div class="listing">&bull; technical stuff : the game is now saved through localstorage instead of browser cookies, therefore ruining a perfectly good pun</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">22/12/2013 - merry fixmas</div>'+
	'<div class="listing">&bull; some issues with the christmas upgrades have been fixed</div>'+
	'<div class="listing">&bull; reindeer cookie drops are now more common</div>'+
	'<div class="listing">&bull; reindeers are now reindeer</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">20/12/2013 - Christmas is here</div>'+
	'<div class="listing">&bull; there is now a festive new evolving upgrade in store</div>'+
	'<div class="listing">&bull; reindeer are running amok (catch them if you can!)</div>'+
	'<div class="listing">&bull; added a new option to warn you when you close the window, so you don\'t lose your un-popped wrinklers</div>'+
	'<div class="listing">&bull; also added a separate option for displaying cursors</div>'+
	'<div class="listing">&bull; all the Halloween features are still there (and having the Spooky cookies achievements makes the Halloween cookies drop much more often)</div>'+
	'<div class="listing">&bull; oh yeah, we now have <a href="http://www.redbubble.com/people/dashnet" target="_blank">Cookie Clicker shirts, stickers and hoodies</a>! (they\'re really rad)</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">29/10/2013 - spooky update</div>'+
	'<div class="listing">&bull; the Grandmapocalypse now spawns wrinklers, hideous elderly creatures that damage your CpS when they reach your big cookie. Thankfully, you can click on them to make them explode (you\'ll even gain back the cookies they\'ve swallowed - with interest!).</div>'+
	'<div class="listing">&bull; wrath cookie now 27% spookier</div>'+
	'<div class="listing">&bull; some other stuff</div>'+
	'<div class="listing">&bull; you should totally go check out <a href="http://candybox2.net/" target="_blank">Candy Box 2</a>, the sequel to the game that inspired Cookie Clicker</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - it\'s a secret</div>'+
	'<div class="listing">&bull; added a new heavenly upgrade that gives you 5% of your heavenly chips power for 11 cookies (if you purchased the Heavenly key, you might need to buy it again, sorry)</div>'+
	'<div class="listing">&bull; golden cookie chains should now work properly</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - player-friendly</div>'+
	'<div class="listing">&bull; heavenly upgrades are now way, way cheaper</div>'+
	'<div class="listing">&bull; tier 5 building upgrades are 5 times cheaper</div>'+
	'<div class="listing">&bull; cursors now just plain disappear with Fancy Graphics off, I might add a proper option to toggle only the cursors later</div>'+
	'<div class="listing">&bull; warning : the Cookie Monster add-on seems to be buggy with this update, you might want to wait until its programmer updates it</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - a couple fixes</div>'+
	'<div class="listing">&bull; golden cookies should no longer spawn embarrassingly often</div>'+
	'<div class="listing">&bull; cursors now stop moving if Fancy Graphics is turned off</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">14/10/2013 - going for the gold</div>'+
	'<div class="listing">&bull; golden cookie chains work a bit differently</div>'+
	'<div class="listing">&bull; golden cookie spawns are more random</div>'+
	'<div class="listing">&bull; CpS achievements are no longer affected by golden cookie frenzies</div>'+
	'<div class="listing">&bull; revised cookie-baking achievement requirements</div>'+
	'<div class="listing">&bull; heavenly chips now require upgrades to function at full capacity</div>'+
	'<div class="listing">&bull; added 4 more cookie upgrades, unlocked after reaching certain amounts of Heavenly Chips</div>'+
	'<div class="listing">&bull; speed baking achievements now require you to have no heavenly upgrades; as such, they have been reset for everyone (along with the Hardcore achievement) to better match their initially intended difficulty</div>'+
	'<div class="listing">&bull; made good progress on the mobile port</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/10/2013 - smoothing it out</div>'+
	'<div class="listing">&bull; some visual effects have been completely rewritten and should now run more smoothly (and be less CPU-intensive)</div>'+
	'<div class="listing">&bull; new upgrade tier</div>'+
	'<div class="listing">&bull; new milk tier</div>'+
	'<div class="listing">&bull; cookie chains have different capping mechanics</div>'+
	'<div class="listing">&bull; antimatter condensers are back to their previous price</div>'+
	'<div class="listing">&bull; heavenly chips now give +2% CpS again (they will be extensively reworked in the future)</div>'+
	'<div class="listing">&bull; farms have been buffed a bit (to popular demand)</div>'+
	'<div class="listing">&bull; dungeons still need a bit more work and will be released soon - we want them to be just right! (you can test an unfinished version in <a href="http://orteil.dashnet.org/cookieclicker/betadungeons/" target="_blank">the beta</a>)</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">28/09/2013 - dungeon beta</div>'+
	'<div class="listing">&bull; from now on, big updates will come through a beta stage first (you can <a href="http://orteil.dashnet.org/cookieclicker/betadungeons/" target="_blank">try it here</a>)</div>'+
	'<div class="listing">&bull; first dungeons! (you need 50 factories to unlock them!)</div>'+
	'<div class="listing">&bull; cookie chains can be longer</div>'+
	'<div class="listing">&bull; antimatter condensers are a bit more expensive</div>'+
	'<div class="listing">&bull; heavenly chips now only give +1% cps each (to account for all the cookies made from condensers)</div>'+
	'<div class="listing">&bull; added flavor text on all upgrades</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/09/2013 - anticookies</div>'+
	'<div class="listing">&bull; ran out of regular matter to make your cookies? Try our new antimatter condensers!</div>'+
	'<div class="listing">&bull; renamed Hard-reset to "Wipe save" to avoid confusion</div>'+
	'<div class="listing">&bull; reset achievements are now regular achievements and require cookies baked all time, not cookies in bank</div>'+
	'<div class="listing">&bull; heavenly chips have been nerfed a bit (and are now awarded following a geometric progression : 1 trillion for the first, 2 for the second, etc); the prestige system will be extensively reworked in a future update (after dungeons)</div>'+
	'<div class="listing">&bull; golden cookie clicks are no longer reset by soft-resets</div>'+
	'<div class="listing">&bull; you can now see how long you\'ve been playing in the stats</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">08/09/2013 - everlasting cookies</div>'+
	'<div class="listing">&bull; added a prestige system - resetting gives you permanent CpS boosts (the more cookies made before resetting, the bigger the boost!)</div>'+
	'<div class="listing">&bull; save format has been slightly modified to take less space</div>'+
	'<div class="listing">&bull; Leprechaun has been bumped to 777 golden cookies clicked and is now shadow; Fortune is the new 77 golden cookies achievement</div>'+
	'<div class="listing">&bull; clicking frenzy is now x777</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">04/09/2013 - smarter cookie</div>'+
	'<div class="listing">&bull; golden cookies only have 20% chance of giving the same outcome twice in a row now</div>'+
	'<div class="listing">&bull; added a golden cookie upgrade</div>'+
	'<div class="listing">&bull; added an upgrade that makes pledges last twice as long (requires having pledged 10 times)</div>'+
	'<div class="listing">&bull; Quintillion fingers is now twice as efficient</div>'+
	'<div class="listing">&bull; Uncanny clicker was really too unpredictable; it is now a regular achievement and no longer requires a world record, just *pretty fast* clicking</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">02/09/2013 - a better way out</div>'+
	'<div class="listing">&bull; Elder Covenant is even cheaper, and revoking it is cheaper still (also added a new achievement for getting it)</div>'+
	'<div class="listing">&bull; each grandma upgrade now requires 15 of the matching building</div>'+
	'<div class="listing">&bull; the dreaded bottom cursor has been fixed with a new cursor display style</div>'+
	'<div class="listing">&bull; added an option for faster, cheaper graphics</div>'+
	'<div class="listing">&bull; base64 encoding has been redone; this might make saving possible again on some older browsers</div>'+
	'<div class="listing">&bull; shadow achievements now have their own section</div>'+
	'<div class="listing">&bull; raspberry juice is now named raspberry milk, despite raspberry juice being delicious and going unquestionably well with cookies</div>'+
	'<div class="listing">&bull; HOTFIX : cursors now click; fancy graphics button renamed; cookies amount now more visible against cursors</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/09/2013 - sorting things out</div>'+
	'<div class="listing">&bull; upgrades and achievements are properly sorted in the stats screen</div>'+
	'<div class="listing">&bull; made Elder Covenant much cheaper and less harmful</div>'+
	'<div class="listing">&bull; importing from the first version has been disabled, as promised</div>'+
	'<div class="listing">&bull; "One mind" now actually asks you to confirm the upgrade</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">31/08/2013 - hotfixes</div>'+
	'<div class="listing">&bull; added a way to permanently stop the grandmapocalypse</div>'+
	'<div class="listing">&bull; Elder Pledge price is now capped</div>'+
	'<div class="listing">&bull; One Mind and other grandma research upgrades are now a little more powerful, if not 100% accurate</div>'+
	'<div class="listing">&bull; "golden" cookie now appears again during grandmapocalypse; Elder Pledge-related achievements are now unlockable</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">31/08/2013 - too many grandmas</div>'+
	'<div class="listing">&bull; the grandmapocalypse is back, along with more grandma types</div>'+
	'<div class="listing">&bull; added some upgrades that boost your clicking power and make it scale with your cps</div>'+
	'<div class="listing">&bull; clicking achievements made harder; Neverclick is now a shadow achievement; Uncanny clicker should now truly be a world record</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">28/08/2013 - over-achiever</div>'+
	'<div class="listing">&bull; added a few more achievements</div>'+
	'<div class="listing">&bull; reworked the "Bake X cookies" achievements so they take longer to achieve</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">27/08/2013 - a bad idea</div>'+
	'<div class="listing">&bull; due to popular demand, retired 5 achievements (the "reset your game" and "cheat" ones); they can still be unlocked, but do not count toward your total anymore. Don\'t worry, there will be many more achievements soon!</div>'+
	'<div class="listing">&bull; made some achievements hidden for added mystery</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">27/08/2013 - a sense of achievement</div>'+
	'<div class="listing">&bull; added achievements (and milk)</div>'+
	'<div class="listing"><i>(this is a big update, please don\'t get too mad if you lose some data!)</i></div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">26/08/2013 - new upgrade tier</div>'+
	'<div class="listing">&bull; added some more upgrades (including a couple golden cookie-related ones)</div>'+
	'<div class="listing">&bull; added clicking stats</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">26/08/2013 - more tweaks</div>'+
	'<div class="listing">&bull; tweaked a couple cursor upgrades</div>'+
	'<div class="listing">&bull; made time machines less powerful</div>'+
	'<div class="listing">&bull; added offline mode option</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">25/08/2013 - tweaks</div>'+
	'<div class="listing">&bull; rebalanced progression curve (mid- and end-game objects cost more and give more)</div>'+
	'<div class="listing">&bull; added some more cookie upgrades</div>'+
	'<div class="listing">&bull; added CpS for cursors</div>'+
	'<div class="listing">&bull; added sell button</div>'+
	'<div class="listing">&bull; made golden cookie more useful</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">24/08/2013 - hotfixes</div>'+
	'<div class="listing">&bull; added import/export feature, which also allows you to retrieve a save game from the old version (will be disabled in a week to prevent too much cheating)</div>'+
	'<div class="listing">&bull; upgrade store now has unlimited slots (just hover over it), due to popular demand</div>'+
	'<div class="listing">&bull; added update log</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">24/08/2013 - big update!</div>'+
	'<div class="listing">&bull; revamped the whole game (new graphics, new game mechanics)</div>'+
	'<div class="listing">&bull; added upgrades</div>'+
	'<div class="listing">&bull; much safer saving</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">08/08/2013 - game launch</div>'+
	'<div class="listing">&bull; made the game in a couple hours, for laughs</div>'+
	'<div class="listing">&bull; kinda starting to regret it</div>'+
	'<div class="listing">&bull; ah well</div>'+
	'</div>'
	;
	
	Game.ready=0;
	
	Game.Load=function()
	{
		//l('javascriptError').innerHTML='<div style="padding:64px 128px;"><div class="title">Loading...</div></div>';
		Game.Loader=new Loader();
		Game.Loader.domain='img/';
		Game.Loader.loaded=Game.Init;
		Game.Loader.Load(['filler.png']);
	}
	Game.ErrorFrame=function()
	{
		l('javascriptError').innerHTML=
		'<div class="title">Oops. Wrong address!</div>'+
		'<div>It looks like you\'re accessing Cookie Clicker from another URL than the official one.<br>'+
		'You can <a href="http://orteil.dashnet.org/cookieclicker/" target="_blank">play Cookie Clicker over here</a>!<br>'+
		'<small>(If for any reason, you are unable to access the game on the official URL, we are currently working on a second domain.)</small></div>';
	}
	
	
	Game.Init=function()
	{
		Game.ready=1;

		/*=====================================================================================
		VARIABLES AND PRESETS
		=======================================================================================*/
		Game.T=0;
		Game.drawT=0;
		Game.loopT=0;
		Game.fps=30;
		
		Game.season=Game.baseSeason;
		
		Game.l=l('game');
		Game.bounds=0;//rectangle defining screen limits (right,left,bottom,top) updated every logic frame

		if (Game.mobile==1)
		{
			l('wrapper').className='mobile';
		}
		Game.clickStr=Game.touchEvents?'ontouchend':'onclick';
		
		Game.SaveTo='CookieClickerGame';
		if (Game.beta) Game.SaveTo='CookieClickerGameBeta';
		l('versionNumber').innerHTML='v. '+Game.version+(Game.beta?' <span style="color:#ff0;">beta</span>':'');
		
		if (Game.beta) {var me=l('linkVersionBeta');me.parentNode.removeChild(me);}
		else if (Game.version==1.0466) {var me=l('linkVersionOld');me.parentNode.removeChild(me);}
		else {var me=l('linkVersionLive');me.parentNode.removeChild(me);}

		//l('links').innerHTML=(Game.beta?'<a href="../" target="blank">Live version</a> | ':'<a href="beta" target="blank">Try the beta!</a> | ')+'<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Classic</a>';
		//l('links').innerHTML='<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Cookie Clicker Classic</a>';
		
		//latency compensator stuff
		Game.time=Date.now();
		Game.accumulatedDelay=0;
		Game.catchupLogic=0;
		Game.fpsStartTime=0;
		Game.frameNumber=0;
		Game.getFps=function()
		{
			Game.frameNumber++;
			var currentTime=(Date.now()-Game.fpsStartTime )/1000;
			var result=Math.floor((Game.frameNumber/currentTime));
			if (currentTime>1)
			{
				Game.fpsStartTime=Date.now();
				Game.frameNumber=0;
			}
			return result;
		}
		
		Game.cookiesEarned=0;//all cookies earned during gameplay
		Game.cookies=0;//cookies
		Game.cookiesd=0;//cookies display
		Game.cookiesPs=1;//cookies per second (to recalculate with every new purchase)
		Game.cookiesReset=0;//cookies lost to resetting (used to determine prestige and heavenly chips)
		Game.cookieClicks=0;//+1 for each click on the cookie
		Game.goldenClicks=0;//+1 for each golden cookie clicked (all time)
		Game.goldenClicksLocal=0;//+1 for each golden cookie clicked (this game only)
		Game.missedGoldenClicks=0;//+1 for each golden cookie missed
		Game.handmadeCookies=0;//all the cookies made from clicking the cookie
		Game.milkProgress=0;//you gain a little bit for each achievement. Each increment of 1 is a different milk displayed.
		Game.milkH=Game.milkProgress/2;//milk height, between 0 and 1 (although should never go above 0.5)
		Game.milkHd=0;//milk height display
		Game.milkType=0;//custom milk
		Game.bgType=0;//custom background
		Game.chimeType=0;//golden cookie chime
		Game.prestige=0;//prestige level (recalculated depending on Game.cookiesReset)
		Game.heavenlyChips=0;//heavenly chips the player currently has
		Game.heavenlyChipsDisplayed=0;//ticks up or down to match Game.heavenlyChips
		Game.heavenlyChipsSpent=0;//heavenly chips spent on cookies, upgrades and such
		Game.heavenlyCookies=0;//how many cookies have we baked from chips (unused)
		Game.permanentUpgrades=[-1,-1,-1,-1,-1];
		Game.ascensionMode=0;//type of challenge run if any
		Game.resets=0;//reset counter
		Game.lumps=0;//sugar lumps
		Game.lumpsTotal=0;//sugar lumps earned across all playthroughs
		Game.lumpT=Date.now();//time when the current lump started forming
		
		Game.makeSeed=function()
		{
			var chars='abcdefghijklmnopqrstuvwxyz'.split('');
			var str='';
			for (var i=0;i<5;i++){str+=choose(chars);}
			return str;
		}
		Game.seed=Game.makeSeed();//each run has its own seed, used for deterministic random stuff
		
		Game.volume=50;//sound volume
		
		Game.elderWrath=0;
		Game.elderWrathOld=0;
		Game.elderWrathD=0;
		Game.pledges=0;
		Game.pledgeT=0;
		Game.researchT=0;
		Game.nextResearch=0;
		Game.cookiesSucked=0;//cookies sucked by wrinklers
		Game.cpsSucked=0;//percent of CpS being sucked by wrinklers
		Game.wrinklersPopped=0;
		Game.santaLevel=0;
		Game.reindeerClicked=0;
		Game.seasonT=0;
		Game.seasonUses=0;
		Game.dragonLevel=0;
		Game.dragonAura=0;
		Game.dragonAura2=0;
		
		Game.blendModesOn=(document.createElement('detect').style.mixBlendMode==='');
		
		Game.bg='';//background (grandmas and such)
		Game.bgFade='';//fading to background
		Game.bgR=0;//ratio (0 - not faded, 1 - fully faded)
		Game.bgRd=0;//ratio displayed
		
		Game.windowW=window.innerWidth;
		Game.windowH=window.innerHeight;
		
		window.addEventListener('resize',function(event)
		{
			Game.windowW=window.innerWidth;
			Game.windowH=window.innerHeight;
		});
		
		Game.startDate=parseInt(Date.now());//when we started playing
		Game.fullDate=parseInt(Date.now());//when we started playing (carries over with resets)
		Game.lastDate=parseInt(Date.now());//when we last saved the game (used to compute "cookies made since we closed the game" etc)
		
		Game.prefs=[];
		Game.DefaultPrefs=function()
		{
			Game.prefs.particles=1;//particle effects : falling cookies etc
			Game.prefs.numbers=1;//numbers that pop up when clicking the cookie
			Game.prefs.autosave=1;//save the game every minute or so
			Game.prefs.autoupdate=1;//send an AJAX request to the server every 30 minutes (crashes the game when playing offline)
			Game.prefs.milk=1;//display milk
			Game.prefs.fancy=1;//CSS shadow effects (might be heavy on some browsers)
			Game.prefs.warn=0;//warn before closing the window
			Game.prefs.cursors=1;//display cursors
			Game.prefs.focus=1;//make the game refresh less frequently when off-focus
			Game.prefs.popups=0;//use old-style popups
			Game.prefs.format=0;//shorten numbers
			Game.prefs.notifs=0;//notifications fade faster
			Game.prefs.animate=1;//animate buildings
			Game.prefs.wobbly=1;//wobbly cookie
			Game.prefs.monospace=0;//alt monospace font for cookies
			Game.prefs.filters=0;//CSS filter effects (might be heavy on some browsers)
			Game.prefs.cookiesound=1;//use new cookie click sound
			Game.prefs.crates=0;//show crates around icons in stats
			Game.prefs.altDraw=0;//use requestAnimationFrame to update drawing instead of fixed 30 fps setTimeout
			Game.prefs.showBackupWarning=1;//if true, show a "Have you backed up your save?" message on save load; set to false when save is exported
		}
		Game.DefaultPrefs();
		
		window.onbeforeunload=function(event)
		{
			if (Game.prefs.warn)
			{
				if (typeof event=='undefined') event=window.event;
				if (event) event.returnValue='Are you sure you want to close Cookie Clicker?';
			}
		}
		
		Game.Mobile=function()
		{
			if (!Game.mobile)
			{
				l('wrapper').className='mobile';
				Game.mobile=1;
			}
			else
			{
				l('wrapper').className='';
				Game.mobile=0;
			}
		}
		
		Game.showBackupWarning=function()
		{
			Game.Notify('Back up your save!','Hello again! Just a reminder that you may want to back up your Cookie Clicker save every once in a while, just in case.<br>To do so, go to Options and hit "Export save" or "Save to file"!<div class="line"></div><a style="float:right;" onclick="Game.prefs.showBackupWarning=0;==CLOSETHIS()==">Don\'t show this again</a>',[25,7]);
		}
		
		/*=====================================================================================
		MOD HOOKS (will be subject to change, probably shouldn't be used yet)
		=======================================================================================*/
		//really primitive custom mods support - might not be of any use at all (could theoretically be used for custom upgrades and achievements I guess?)
		Game.customChecks=[];//push functions into this to add them to the "check for upgrade/achievement conditions" that happens every few seconds
		Game.customInit=[];//add to the initialization call
		Game.customLogic=[];//add to the logic calls
		Game.customDraw=[];//add to the draw calls
		Game.customSave=[];//add to the save write calls (save to your own localstorage key)
		Game.customLoad=[];//add to the save load calls
		Game.customReset=[];//add to the reset calls
		Game.customTickers=[];//add to the random tickers (functions should return arrays of text)
		Game.customCps=[];//add to the CpS computation (functions should return something to add to the multiplier ie. 0.1 for an addition of 10 to the CpS multiplier)
		Game.customCpsMult=[];//add to the CpS multiplicative computation (functions should return something to multiply by the multiplier ie. 1.05 for a 5% increase of the multiplier)
		Game.customMouseCps=[];//add to the cookies earned per click computation (functions should return something to add to the multiplier ie. 0.1 for an addition of 10 to the CpS multiplier)
		Game.customMouseCpsMult=[];//add to the cookies earned per click multiplicative computation (functions should return something to multiply by the multiplier ie. 1.05 for a 5% increase of the multiplier)
		Game.customCookieClicks=[];//add to the cookie click calls
		Game.customCreate=[];//create your new upgrades and achievements in there

		Game.LoadMod=function(url)//this loads the mod at the given URL and gives the script an automatic id (URL "http://example.com/my_mod.js" gives the id "modscript_my_mod")
		{
			var js=document.createElement('script');
			var id=url.split('/');id=id[id.length-1].split('.')[0];
			js.setAttribute('type','text/javascript');
			js.setAttribute('id','modscript_'+id);
			js.setAttribute('src',url);
			document.head.appendChild(js);
			console.log('Loaded the mod '+url+', '+id+'.');
		}
		
		//replacing an existing canvas picture with a new one at runtime : Game.Loader.Replace('perfectCookie.png','imperfectCookie.png');
		//upgrades and achievements can use other pictures than icons.png; declare their icon with [posX,posY,'http://example.com/myIcons.png']
		//check out the "UNLOCKING STUFF" section to see how unlocking achievs and upgrades is done (queue yours in Game.customChecks)
		//if you're making a mod, don't forget to add a Game.Win('Third-party') somewhere in there!
		
		//IMPORTANT : all of the above is susceptible to heavy change, proper modding API in the works
		
		
		
		
		/*=====================================================================================
		BAKERY NAME
		=======================================================================================*/
		Game.RandomBakeryName=function()
		{
			return (Math.random()>0.05?(choose(['Magic','Fantastic','Fancy','Sassy','Snazzy','Pretty','Cute','Pirate','Ninja','Zombie','Robot','Radical','Urban','Cool','Hella','Sweet','Awful','Double','Triple','Turbo','Techno','Disco','Electro','Dancing','Wonder','Mutant','Space','Science','Medieval','Future','Captain','Bearded','Lovely','Tiny','Big','Fire','Water','Frozen','Metal','Plastic','Solid','Liquid','Moldy','Shiny','Happy','Happy Little','Slimy','Tasty','Delicious','Hungry','Greedy','Lethal','Professor','Doctor','Power','Chocolate','Crumbly','Choklit','Righteous','Glorious','Mnemonic','Psychic','Frenetic','Hectic','Crazy','Royal','El','Von'])+' '):'Mc')+choose(['Cookie','Biscuit','Muffin','Scone','Cupcake','Pancake','Chip','Sprocket','Gizmo','Puppet','Mitten','Sock','Teapot','Mystery','Baker','Cook','Grandma','Click','Clicker','Spaceship','Factory','Portal','Machine','Experiment','Monster','Panic','Burglar','Bandit','Booty','Potato','Pizza','Burger','Sausage','Meatball','Spaghetti','Macaroni','Kitten','Puppy','Giraffe','Zebra','Parrot','Dolphin','Duckling','Sloth','Turtle','Goblin','Pixie','Gnome','Computer','Pirate','Ninja','Zombie','Robot']);
		}
		Game.GetBakeryName=function() {return Game.RandomBakeryName();}
		Game.bakeryName=Game.GetBakeryName();
		Game.bakeryNameL=l('bakeryName');
		Game.bakeryNameL.innerHTML=Game.bakeryName+'\'s bakery';
		Game.bakeryNameSet=function(what)
		{
			Game.bakeryName=what.replace(/\W+/g,' ');
			Game.bakeryName=Game.bakeryName.substring(0,28);
			Game.bakeryNameRefresh();
		}
		Game.bakeryNameRefresh=function()
		{
			var name=Game.bakeryName;
			if (name.slice(-1).toLowerCase()=='s') name+='\' bakery'; else name+='\'s bakery';
			Game.bakeryNameL.innerHTML=name;
			name=Game.bakeryName.toLowerCase();
			if (name=='orteil') Game.Win('God complex');
			if (name.indexOf('saysopensesame',name.length-('saysopensesame').length)>0 && !Game.sesame) Game.OpenSesame();
			Game.recalculateGains=1;
		}
		Game.bakeryNamePrompt=function()
		{
			Game.Prompt('<h3>Name your bakery</h3><div class="block" style="text-align:center;">What should your bakery\'s name be?</div><div class="block"><input type="text" style="text-align:center;width:100%;" id="bakeryNameInput" value="'+Game.bakeryName+'"/></div>',[['Confirm','if (l(\'bakeryNameInput\').value.length>0) {Game.bakeryNameSet(l(\'bakeryNameInput\').value);Game.Win(\'What\\\'s in a name\');Game.ClosePrompt();}'],['Random','Game.bakeryNamePromptRandom();'],'Cancel']);
			l('bakeryNameInput').focus();
			l('bakeryNameInput').select();
		}
		Game.bakeryNamePromptRandom=function()
		{
			l('bakeryNameInput').value=Game.RandomBakeryName();
		}
		AddEvent(Game.bakeryNameL,'click',Game.bakeryNamePrompt);
		
		/*=====================================================================================
		UPDATE CHECKER
		=======================================================================================*/
		Game.CheckUpdates=function()
		{
			ajax('server.php?q=checkupdate',Game.CheckUpdatesResponse);
		}
		Game.CheckUpdatesResponse=function(response)
		{
			var r=response.split('|');
			var str='';
			if (r[0]=='alert')
			{
				if (r[1]) str=r[1];
			}
			else if (parseFloat(r[0])>Game.version)
			{
				str='<b>New version available : v. '+r[0]+'!</b>';
				if (r[1]) str+='<br><small>Update note : "'+r[1]+'"</small>';
				str+='<br><b>Refresh to get it!</b>';
			}
			if (str!='')
			{
				l('alert').innerHTML=str;
				l('alert').style.display='block';
			}
		}
		
		Game.useLocalStorage=1;
		Game.localStorageGet=function(key)
		{
			var local=0;
			try {local=window.localStorage.getItem(key);} catch (exception) {}
			return local;
		}
		Game.localStorageSet=function(key,str)
		{
			var local=0;
			try {local=window.localStorage.setItem(key,str);} catch (exception) {}
			return local;
		}
		//window.localStorage.clear();//won't switch back to cookie-based if there is localStorage info
		
		/*=====================================================================================
		SAVE
		=======================================================================================*/
		Game.ExportSave=function()
		{
			Game.prefs.showBackupWarning=0;
			Game.Prompt('<h3>Export save</h3><div class="block">This is your save code.<br>Copy it and keep it somewhere safe!</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>'+Game.WriteSave(1)+'</textarea></div>',['All done!']);//prompt('Copy this text and keep it somewhere safe!',Game.WriteSave(1));
			l('textareaPrompt').focus();l('textareaPrompt').select();
		}
		Game.ImportSave=function()
		{
			Game.Prompt('<h3>Import save</h3><div class="block">Please paste in the code that was given to you on save export.</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;"></textarea></div>',[['Load','if (l(\'textareaPrompt\').value.length>0) {Game.ImportSaveCode(l(\'textareaPrompt\').value);Game.ClosePrompt();}'],'Nevermind']);//prompt('Please paste in the text that was given to you on save export.','');
			l('textareaPrompt').focus();
		}
		Game.ImportSaveCode=function(save)
		{
			if (save && save!='') Game.LoadSave(save);
		}
		
		Game.FileSave=function()
		{
			Game.prefs.showBackupWarning=0;
			var filename=Game.bakeryName.replace(/[^a-zA-Z0-9]+/g,'')+'Bakery';
			var text=Game.WriteSave(1);
			var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
			saveAs(blob,filename+'.txt');
		}
		Game.FileLoad=function(e)
		{
			if (e.target.files.length==0) return false;
			var file=e.target.files[0];
			var reader=new FileReader();
			reader.onload=function(e)
			{
				Game.ImportSaveCode(e.target.result);
			}
			reader.readAsText(file);
		}
		
		Game.WriteSave=function(type)
		{
			//type : none is default, 1=return string only, 2=return uncompressed string, 3=return uncompressed, commented string
			Game.lastDate=parseInt(Date.now());
			var str='';
			if (type==3) str+='\nGame version\n';
			str+=Game.version+'|';
			str+='|';//just in case we need some more stuff here
			if (type==3) str+='\n\nRun details';
			str+=//save stats
			(type==3?'\n	run start date : ':'')+parseInt(Game.startDate)+';'+
			(type==3?'\n	legacy start date : ':'')+parseInt(Game.fullDate)+';'+
			(type==3?'\n	date when we last opened the game : ':'')+parseInt(Game.lastDate)+';'+
			(type==3?'\n	bakery name : ':'')+(Game.bakeryName)+';'+
			(type==3?'\n	seed : ':'')+(Game.seed)+
			'|';
			if (type==3) str+='\n\nPacked preferences bitfield\n	';
			var str2=//prefs
			(Game.prefs.particles?'1':'0')+
			(Game.prefs.numbers?'1':'0')+
			(Game.prefs.autosave?'1':'0')+
			(Game.prefs.autoupdate?'1':'0')+
			(Game.prefs.milk?'1':'0')+
			(Game.prefs.fancy?'1':'0')+
			(Game.prefs.warn?'1':'0')+
			(Game.prefs.cursors?'1':'0')+
			(Game.prefs.focus?'1':'0')+
			(Game.prefs.format?'1':'0')+
			(Game.prefs.notifs?'1':'0')+
			(Game.prefs.wobbly?'1':'0')+
			(Game.prefs.monospace?'1':'0')+
			(Game.prefs.filters?'1':'0')+
			(Game.prefs.cookiesound?'1':'0')+
			(Game.prefs.crates?'1':'0')+
			(Game.prefs.showBackupWarning?'1':'0')+
			'';
			str2=pack2(str2);
			str+=str2+'|';
			if (type==3) str+='\n\nMisc game data';
			str+=
			(type==3?'\n	cookies : ':'')+parseFloat(Game.cookies).toString()+';'+
			(type==3?'\n	total cookies earned : ':'')+parseFloat(Game.cookiesEarned).toString()+';'+
			(type==3?'\n	cookie clicks : ':'')+parseInt(Math.floor(Game.cookieClicks))+';'+
			(type==3?'\n	golden cookie clicks : ':'')+parseInt(Math.floor(Game.goldenClicks))+';'+
			(type==3?'\n	cookies made by clicking : ':'')+parseFloat(Game.handmadeCookies).toString()+';'+
			(type==3?'\n	golden cookies missed : ':'')+parseInt(Math.floor(Game.missedGoldenClicks))+';'+
			(type==3?'\n	background type : ':'')+parseInt(Math.floor(Game.bgType))+';'+
			(type==3?'\n	milk type : ':'')+parseInt(Math.floor(Game.milkType))+';'+
			(type==3?'\n	cookies from past runs : ':'')+parseFloat(Game.cookiesReset).toString()+';'+
			(type==3?'\n	elder wrath : ':'')+parseInt(Math.floor(Game.elderWrath))+';'+
			(type==3?'\n	pledges : ':'')+parseInt(Math.floor(Game.pledges))+';'+
			(type==3?'\n	pledge time left : ':'')+parseInt(Math.floor(Game.pledgeT))+';'+
			(type==3?'\n	currently researching : ':'')+parseInt(Math.floor(Game.nextResearch))+';'+
			(type==3?'\n	research time left : ':'')+parseInt(Math.floor(Game.researchT))+';'+
			(type==3?'\n	ascensions : ':'')+parseInt(Math.floor(Game.resets))+';'+
			(type==3?'\n	golden cookie clicks (this run) : ':'')+parseInt(Math.floor(Game.goldenClicksLocal))+';'+
			(type==3?'\n	cookies sucked by wrinklers : ':'')+parseFloat(Game.cookiesSucked).toString()+';'+
			(type==3?'\n	wrinkles popped : ':'')+parseInt(Math.floor(Game.wrinklersPopped))+';'+
			(type==3?'\n	santa level : ':'')+parseInt(Math.floor(Game.santaLevel))+';'+
			(type==3?'\n	reindeer clicked : ':'')+parseInt(Math.floor(Game.reindeerClicked))+';'+
			(type==3?'\n	season time left : ':'')+parseInt(Math.floor(Game.seasonT))+';'+
			(type==3?'\n	season switcher uses : ':'')+parseInt(Math.floor(Game.seasonUses))+';'+
			(type==3?'\n	current season : ':'')+(Game.season?Game.season:'')+';';
			var wrinklers=Game.SaveWrinklers();
			str+=
			(type==3?'\n	amount of cookies contained in wrinklers : ':'')+parseFloat(Math.floor(wrinklers.amount))+';'+
			(type==3?'\n	number of wrinklers : ':'')+parseInt(Math.floor(wrinklers.number))+';'+
			(type==3?'\n	prestige level : ':'')+parseFloat(Game.prestige).toString()+';'+
			(type==3?'\n	heavenly chips : ':'')+parseFloat(Game.heavenlyChips).toString()+';'+
			(type==3?'\n	heavenly chips spent : ':'')+parseFloat(Game.heavenlyChipsSpent).toString()+';'+
			(type==3?'\n	heavenly cookies : ':'')+parseFloat(Game.heavenlyCookies).toString()+';'+
			(type==3?'\n	ascension mode : ':'')+parseInt(Math.floor(Game.ascensionMode))+';'+
			(type==3?'\n	permanent upgrades : ':'')+parseInt(Math.floor(Game.permanentUpgrades[0]))+';'+parseInt(Math.floor(Game.permanentUpgrades[1]))+';'+parseInt(Math.floor(Game.permanentUpgrades[2]))+';'+parseInt(Math.floor(Game.permanentUpgrades[3]))+';'+parseInt(Math.floor(Game.permanentUpgrades[4]))+';'+
			(type==3?'\n	dragon level : ':'')+parseInt(Math.floor(Game.dragonLevel))+';'+
			(type==3?'\n	dragon aura : ':'')+parseInt(Math.floor(Game.dragonAura))+';'+
			(type==3?'\n	dragon aura 2 : ':'')+parseInt(Math.floor(Game.dragonAura2))+';'+
			(type==3?'\n	chime type : ':'')+parseInt(Math.floor(Game.chimeType))+';'+
			(type==3?'\n	volume : ':'')+parseInt(Math.floor(Game.volume))+';'+
			(type==3?'\n	number of shiny wrinklers : ':'')+parseInt(Math.floor(wrinklers.shinies))+';'+
			(type==3?'\n	amount of cookies contained in shiny wrinklers : ':'')+parseFloat(Math.floor(wrinklers.amountShinies))+';'+
			(type==3?'\n	current amount of sugar lumps : ':'')+parseFloat(Math.floor(Game.lumps))+';'+
			(type==3?'\n	total amount of sugar lumps made : ':'')+parseFloat(Math.floor(Game.lumpsTotal))+';'+
			(type==3?'\n	time when current sugar lump started : ':'')+parseFloat(Math.floor(Game.lumpT))+';'+
			'|';//cookies and lots of other stuff
			
			if (type==3) str+='\n\nBuildings : amount, bought, cookies produced, level, minigame data';
			for (var i in Game.Objects)//buildings
			{
				var me=Game.Objects[i];
				if (type==3) str+='\n	'+me.name+' : ';
				if (me.vanilla)
				{
					str+=me.amount+','+me.bought+','+parseFloat(Math.floor(me.totalCookies))+','+parseInt(me.level);
					if (Game.isMinigameReady(me)) str+=','+me.minigame.save();
					str+=';';
				}
			}
			str+='|';
			if (type==3) str+='\n\nPacked upgrades bitfield (unlocked and bought)\n	';
			var toCompress=[];
			for (var i in Game.UpgradesById)//upgrades
			{
				var me=Game.UpgradesById[i];
				if (me.vanilla) toCompress.push(Math.min(me.unlocked,1),Math.min(me.bought,1));
			};
			
			toCompress=pack2(toCompress.join(''));//toCompress=pack(toCompress);//CompressLargeBin(toCompress);
			
			str+=toCompress;
			str+='|';
			if (type==3) str+='\n\nPacked achievements bitfield (won)\n	';
			var toCompress=[];
			for (var i in Game.AchievementsById)//achievements
			{
				var me=Game.AchievementsById[i];
				if (me.vanilla) toCompress.push(Math.min(me.won));
			}
			toCompress=pack2(toCompress.join(''));//toCompress=pack(toCompress);//CompressLargeBin(toCompress);
			str+=toCompress;
			
			str+='|';
			if (type==3) str+='\n\nBuffs : type, maxTime, time, arg1, arg2, arg3';
			for (var i in Game.buffs)
			{
				var me=Game.buffs[i];
				if (me.type)
				{
					if (type==3) str+='\n	'+me.type.name+' : ';
					if (me.type.vanilla)
					{
						str+=me.type.id+','+me.maxTime+','+me.time;
						if (typeof me.arg1!=='undefined') str+=','+parseFloat(me.arg1);
						if (typeof me.arg2!=='undefined') str+=','+parseFloat(me.arg2);
						if (typeof me.arg3!=='undefined') str+=','+parseFloat(me.arg3);
						str+=';';
					}
				}
			}
			
			
			if (type==3) str+='\n';
			
			for (var i in Game.customSave) {Game.customSave[i]();}
			
			if (type==2 || type==3)
			{
				return str;
			}
			else if (type==1)
			{
				str=escape(utf8_to_b64(str)+'!END!');
				return str;
			}
			else
			{
				if (Game.useLocalStorage)
				{
					//so we used to save the game using browser cookies, which was just really neat considering the game's name
					//we're using localstorage now, which is more efficient but not as cool
					//a moment of silence for our fallen puns
					str=utf8_to_b64(str)+'!END!';
					if (str.length<10)
					{
						if (Game.prefs.popups) Game.Popup('Error while saving.<br>Purchasing an upgrade might fix this.');
						else Game.Notify('Saving failed!','Purchasing an upgrade and saving again might fix this.<br>This really shouldn\'t happen; please notify Orteil on his tumblr.');
					}
					else
					{
						str=escape(str);
						Game.localStorageSet(Game.SaveTo,str);//aaand save
						if (!Game.localStorageGet(Game.SaveTo))
						{
							if (Game.prefs.popups) Game.Popup('Error while saving.<br>Export your save instead!');
							else Game.Notify('Error while saving','Export your save instead!');
						}
						else if (document.hasFocus())
						{
							if (Game.prefs.popups) Game.Popup('Game saved');
							else Game.Notify('Game saved','','',1,1);
						}
					}
				}
				else//legacy system
				{
					//that's right
					//we're using cookies
					//yeah I went there
					var now=new Date();//we storin dis for 5 years, people
					now.setFullYear(now.getFullYear()+5);//mmh stale cookies
					str=utf8_to_b64(str)+'!END!';
					Game.saveData=escape(str);
					str=Game.SaveTo+'='+escape(str)+'; expires='+now.toUTCString()+';';
					document.cookie=str;//aaand save
					if (document.cookie.indexOf(Game.SaveTo)<0)
					{
						if (Game.prefs.popups) Game.Popup('Error while saving.<br>Export your save instead!');
						else Game.Notify('Error while saving','Export your save instead!','',0,1);
					}
					else if (document.hasFocus())
					{
						if (Game.prefs.popups) Game.Popup('Game saved');
						else Game.Notify('Game saved','','',1,1);
					}
				}
			}
		}
		
		/*=====================================================================================
		LOAD
		=======================================================================================*/
		Game.LoadSave=function(data)
		{
			var str='';
			if (data) str=unescape(data);
			else
			{
				if (Game.useLocalStorage)
				{
					var local=Game.localStorageGet(Game.SaveTo);
					if (!local)//no localstorage save found? let's get the cookie one last time
					{
						if (document.cookie.indexOf(Game.SaveTo)>=0)
						{
							str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);
							document.cookie=Game.SaveTo+'=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
						}
						else return false;
					}
					else
					{
						str=unescape(local);
					}
				}
				else//legacy system
				{
					if (document.cookie.indexOf(Game.SaveTo)>=0) str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);//get cookie here
					else return false;
				}
			}
			
			if (str!='')
			{
				var version=0;
				var oldstr=str.split('|');
				if (oldstr[0]<1) {}
				else
				{
					str=str.split('!END!')[0];
					str=b64_to_utf8(str);
				}
				if (str!='')
				{
					var spl='';
					str=str.split('|');
					version=parseFloat(str[0]);
					
					if (isNaN(version) || str.length<5)
					{
						if (Game.prefs.popups) Game.Popup('Oops, looks like the import string is all wrong!');
						else Game.Notify('Error importing save','Oops, looks like the import string is all wrong!','',6,1);
						return false;
					}
					if (version>=1 && version>Game.version)
					{
						if (Game.prefs.popups) Game.Popup('Error : you are attempting to load a save from a future version (v. '+version+'; you are using v. '+Game.version+').');
						else Game.Notify('Error importing save','You are attempting to load a save from a future version (v. '+version+'; you are using v. '+Game.version+').','',6,1);
						return false;
					}
					if (version==1.0501)//prompt if we loaded from the 2014 beta
					{
						setTimeout(function(){Game.Prompt('<h3>New beta</h3><div class="block">Hey there! Unfortunately, your old beta save won\'t work here anymore; you\'ll have to start fresh or import your save from the live version.<div class="line"></div>Thank you for beta-testing Cookie Clicker, we hope you\'ll enjoy it and find strange and interesting bugs!</div>',[['Alright then!','Game.ClosePrompt();']]);},200);
						return false;
					}
					else if (version<1.0501)//prompt if we loaded from the 2014 live version
					{
						setTimeout(function(){Game.Prompt('<h3>Update</h3><div class="block"><b>Hey there!</b> Cookie Clicker just received a pretty substantial update, and you might notice that some things have been moved around. Don\'t panic!<div class="line"></div>Your building numbers may look strange, making it seem like you own buildings you\'ve never bought; this is because we\'ve added <b>3 new buildings</b> after factories (and swapped mines and factories), offsetting everything after them. Likewise, some building-related upgrades and achievements may look a tad shuffled around. This is all perfectly normal!<div class="line"></div>We\'ve also rebalanced Heavenly Chips amounts and behavior. Your amount of chips might be lower or higher than before.<br>You can now ascend through the <b>Legacy button</b> at the top!<div class="line"></div>Thank you for playing Cookie Clicker. We\'ve put a lot of work and care into this update and we hope you\'ll enjoy it!</div>',[['Neat!','Game.ClosePrompt();']]);},200);
					}
					if (version>=1)
					{
						spl=str[2].split(';');//save stats
						Game.startDate=parseInt(spl[0]);
						Game.fullDate=parseInt(spl[1]);
						Game.lastDate=parseInt(spl[2]);
						Game.bakeryName=spl[3]?spl[3]:Game.GetBakeryName();
						Game.seed=spl[4]?spl[4]:Game.makeSeed();
						//prefs
						if (version<1.0503) spl=str[3].split('');
						else spl=unpack2(str[3]).split('');
						Game.prefs.particles=parseInt(spl[0]);
						Game.prefs.numbers=parseInt(spl[1]);
						Game.prefs.autosave=parseInt(spl[2]);
						Game.prefs.autoupdate=spl[3]?parseInt(spl[3]):1;
						Game.prefs.milk=spl[4]?parseInt(spl[4]):1;
						Game.prefs.fancy=parseInt(spl[5]);if (Game.prefs.fancy) Game.removeClass('noFancy'); else if (!Game.prefs.fancy) Game.addClass('noFancy');
						Game.prefs.warn=spl[6]?parseInt(spl[6]):0;
						Game.prefs.cursors=spl[7]?parseInt(spl[7]):0;
						Game.prefs.focus=spl[8]?parseInt(spl[8]):0;
						Game.prefs.format=spl[9]?parseInt(spl[9]):0;
						Game.prefs.notifs=spl[10]?parseInt(spl[10]):0;
						Game.prefs.wobbly=spl[11]?parseInt(spl[11]):0;
						Game.prefs.monospace=spl[12]?parseInt(spl[12]):0;
						Game.prefs.filters=parseInt(spl[13]);if (Game.prefs.filters) Game.removeClass('noFilters'); else if (!Game.prefs.filters) Game.addClass('noFilters');
						Game.prefs.cookiesound=spl[14]?parseInt(spl[14]):1;
						Game.prefs.crates=spl[15]?parseInt(spl[15]):0;
						Game.prefs.showBackupWarning=spl[16]?parseInt(spl[16]):1;
						BeautifyAll();
						spl=str[4].split(';');//cookies and lots of other stuff
						Game.cookies=parseFloat(spl[0]);
						Game.cookiesEarned=parseFloat(spl[1]);
						Game.cookieClicks=spl[2]?parseInt(spl[2]):0;
						Game.goldenClicks=spl[3]?parseInt(spl[3]):0;
						Game.handmadeCookies=spl[4]?parseFloat(spl[4]):0;
						Game.missedGoldenClicks=spl[5]?parseInt(spl[5]):0;
						Game.bgType=spl[6]?parseInt(spl[6]):0;
						Game.milkType=spl[7]?parseInt(spl[7]):0;
						Game.cookiesReset=spl[8]?parseFloat(spl[8]):0;
						Game.elderWrath=spl[9]?parseInt(spl[9]):0;
						Game.pledges=spl[10]?parseInt(spl[10]):0;
						Game.pledgeT=spl[11]?parseInt(spl[11]):0;
						Game.nextResearch=spl[12]?parseInt(spl[12]):0;
						Game.researchT=spl[13]?parseInt(spl[13]):0;
						Game.resets=spl[14]?parseInt(spl[14]):0;
						Game.goldenClicksLocal=spl[15]?parseInt(spl[15]):0;
						Game.cookiesSucked=spl[16]?parseFloat(spl[16]):0;
						Game.wrinklersPopped=spl[17]?parseInt(spl[17]):0;
						Game.santaLevel=spl[18]?parseInt(spl[18]):0;
						Game.reindeerClicked=spl[19]?parseInt(spl[19]):0;
						Game.seasonT=spl[20]?parseInt(spl[20]):0;
						Game.seasonUses=spl[21]?parseInt(spl[21]):0;
						Game.season=spl[22]?spl[22]:Game.baseSeason;
						var wrinklers={amount:spl[23]?parseFloat(spl[23]):0,number:spl[24]?parseInt(spl[24]):0};
						Game.prestige=spl[25]?parseFloat(spl[25]):0;
						Game.heavenlyChips=spl[26]?parseFloat(spl[26]):0;
						Game.heavenlyChipsSpent=spl[27]?parseFloat(spl[27]):0;
						Game.heavenlyCookies=spl[28]?parseFloat(spl[28]):0;
						Game.ascensionMode=spl[29]?parseInt(spl[29]):0;
						Game.permanentUpgrades[0]=spl[30]?parseInt(spl[30]):-1;Game.permanentUpgrades[1]=spl[31]?parseInt(spl[31]):-1;Game.permanentUpgrades[2]=spl[32]?parseInt(spl[32]):-1;Game.permanentUpgrades[3]=spl[33]?parseInt(spl[33]):-1;Game.permanentUpgrades[4]=spl[34]?parseInt(spl[34]):-1;
						//if (version<1.05) {Game.heavenlyChipsEarned=Game.HowMuchPrestige(Game.cookiesReset);Game.heavenlyChips=Game.heavenlyChipsEarned;}
						Game.dragonLevel=spl[35]?parseInt(spl[35]):0;
						if (version<2.0041 && Game.dragonLevel==Game.dragonLevels.length-2) {Game.dragonLevel=Game.dragonLevels.length-1;}
						Game.dragonAura=spl[36]?parseInt(spl[36]):0;
						Game.dragonAura2=spl[37]?parseInt(spl[37]):0;
						Game.chimeType=spl[38]?parseInt(spl[38]):0;
						Game.volume=spl[39]?parseInt(spl[39]):50;
						wrinklers.shinies=spl[40]?parseInt(spl[40]):0;
						wrinklers.amountShinies=spl[41]?parseFloat(spl[41]):0;
						Game.lumps=spl[42]?parseFloat(spl[42]):1;
						Game.lumpsTotal=spl[43]?parseFloat(spl[43]):1;
						Game.lumpT=spl[44]?parseInt(spl[44]):Date.now();
						
						spl=str[5].split(';');//buildings
						Game.BuildingsOwned=0;
						for (var i in Game.ObjectsById)
						{
							var me=Game.ObjectsById[i];
							me.switchMinigame(false);
							if (spl[i])
							{
								var mestr=spl[i].toString().split(',');
								me.amount=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);me.totalCookies=parseFloat(mestr[2]);me.level=parseInt(mestr[3]||0);
								if (me.minigameLoaded) {me.minigame.reset();me.minigame.load(mestr[4]||'');} else me.minigameSave=(mestr[4]||'');
								Game.BuildingsOwned+=me.amount;
								if (version<2.003) me.level=0;
							}
							else
							{
								me.amount=0;me.unlocked=0;me.bought=0;me.totalCookies=0;me.level=0;
							}
						}
						Game.LoadMinigames();
						if (version<1.035)//old non-binary algorithm
						{
							spl=str[6].split(';');//upgrades
							Game.UpgradesOwned=0;
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (spl[i])
								{
									var mestr=spl[i].split(',');
									me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
									if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
								}
								else
								{
									me.unlocked=0;me.bought=0;
								}
							}
							if (str[7]) spl=str[7].split(';'); else spl=[];//achievements
							Game.AchievementsOwned=0;
							for (var i in Game.AchievementsById)
							{
								var me=Game.AchievementsById[i];
								if (spl[i])
								{
									var mestr=spl[i].split(',');
									me.won=parseInt(mestr[0]);
								}
								else
								{
									me.won=0;
								}
								if (me.won && me.pool!='shadow') Game.AchievementsOwned++;
							}
						}
						else if (version<1.0502)//old awful packing system
						{
							if (str[6]) spl=str[6]; else spl=[];//upgrades
							if (version<1.05) spl=UncompressLargeBin(spl);
							else spl=unpack(spl);
							Game.UpgradesOwned=0;
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (spl[i*2])
								{
									var mestr=[spl[i*2],spl[i*2+1]];
									me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
									if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
								}
								else
								{
									me.unlocked=0;me.bought=0;
								}
							}
							if (str[7]) spl=str[7]; else spl=[];//achievements
							if (version<1.05) spl=UncompressLargeBin(spl);
							else spl=unpack(spl);
							Game.AchievementsOwned=0;
							for (var i in Game.AchievementsById)
							{
								var me=Game.AchievementsById[i];
								if (spl[i])
								{
									var mestr=[spl[i]];
									me.won=parseInt(mestr[0]);
								}
								else
								{
									me.won=0;
								}
								if (me.won && me.pool!='shadow') Game.AchievementsOwned++;
							}
						}
						else
						{
							if (str[6]) spl=str[6]; else spl=[];//upgrades
							spl=unpack2(spl).split('');
							Game.UpgradesOwned=0;
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (spl[i*2])
								{
									var mestr=[spl[i*2],spl[i*2+1]];
									me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
									if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
								}
								else
								{
									me.unlocked=0;me.bought=0;
								}
							}
							if (str[7]) spl=str[7]; else spl=[];//achievements
							spl=unpack2(spl).split('');
							Game.AchievementsOwned=0;
							for (var i in Game.AchievementsById)
							{
								var me=Game.AchievementsById[i];
								if (spl[i])
								{
									var mestr=[spl[i]];
									me.won=parseInt(mestr[0]);
								}
								else
								{
									me.won=0;
								}
								if (me.won && me.pool!='shadow') Game.AchievementsOwned++;
							}
						}
						
						Game.killBuffs();
						var buffsToLoad=[];
						spl=(str[8]||'').split(';');//buffs
						for (var i in spl)
						{
							if (spl[i])
							{
								var mestr=spl[i].toString().split(',');
								buffsToLoad.push(mestr);
							}
						}
						
						
						for (var i in Game.ObjectsById)
						{
							var me=Game.ObjectsById[i];
							if (me.buyFunction) me.buyFunction();
							me.refresh();
						}
						
						if (version<1.0503)//upgrades that used to be regular, but are now heavenly
						{
							var me=Game.Upgrades['Persistent memory'];me.unlocked=0;me.bought=0;
							var me=Game.Upgrades['Season switcher'];me.unlocked=0;me.bought=0;
						}
						
						if (Game.bgType==-1) Game.bgType=0;
						if (Game.milkType==-1) Game.milkType=0;
						
						
						//advance timers
						var framesElapsed=Math.ceil(((Date.now()-Game.lastDate)/1000)*Game.fps);
						if (Game.pledgeT>0) Game.pledgeT=Math.max(Game.pledgeT-framesElapsed,1);
						if (Game.seasonT>0) Game.seasonT=Math.max(Game.seasonT-framesElapsed,1);
						if (Game.researchT>0) Game.researchT=Math.max(Game.researchT-framesElapsed,1);
						
						
						Game.ResetWrinklers();
						Game.LoadWrinklers(wrinklers.amount,wrinklers.number,wrinklers.shinies,wrinklers.amountShinies);
						
						//recompute season trigger prices
						if (Game.Has('Season switcher')) {for (var i in Game.seasons) {Game.Unlock(Game.seasons[i].trigger);}}
						Game.computeSeasonPrices();
						
						//recompute prestige
						Game.prestige=Math.floor(Game.HowMuchPrestige(Game.cookiesReset));
						//if ((Game.heavenlyChips+Game.heavenlyChipsSpent)<Game.prestige)
						//{Game.heavenlyChips=Game.prestige;Game.heavenlyChipsSpent=0;}//chips owned and spent don't add up to total prestige? set chips owned to prestige
						
						
						
						
						if (version==1.037 && Game.beta)//are we opening the new beta? if so, save the old beta to /betadungeons
						{
							window.localStorage.setItem('CookieClickerGameBetaDungeons',window.localStorage.getItem('CookieClickerGameBeta'));
							Game.Notify('Beta save data','Your beta save data has been safely exported to /betadungeons.',20);
						}
						else if (version==1.0501 && Game.beta)//are we opening the newer beta? if so, save the old beta to /oldbeta
						{
							window.localStorage.setItem('CookieClickerGameOld',window.localStorage.getItem('CookieClickerGameBeta'));
							//Game.Notify('Beta save data','Your beta save data has been safely exported to /oldbeta.',20);
						}
						if (version<=1.0466 && !Game.beta)//export the old 2014 version to /v10466
						{
							window.localStorage.setItem('CookieClickerGamev10466',window.localStorage.getItem('CookieClickerGame'));
							//Game.Notify('Beta save data','Your save data has been safely exported to /v10466.',20);
						}
						if (version==1.9)//are we importing from the 1.9 beta? remove all heavenly upgrades and refund heavenly chips
						{
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (me.bought && me.pool=='prestige')
								{
									me.unlocked=0;
									me.bought=0;
								}
							}
							Game.heavenlyChips=Game.prestige;
							Game.heavenlyChipsSpent=0;
							
							setTimeout(function(){Game.Prompt('<h3>Beta patch</h3><div class="block">We\'ve tweaked some things and fixed some others, please check the update notes!<div class="line"></div>Of note : due to changes in prestige balancing, all your heavenly upgrades have been removed and your heavenly chips refunded; you\'ll be able to reallocate them next time you ascend.<div class="line"></div>Thank you again for beta-testing Cookie Clicker!</div>',[['Alright then!','Game.ClosePrompt();']]);},200);
						}
						if (version<=1.0466)//are we loading from the old live version? reset HCs
						{
							Game.heavenlyChips=Game.prestige;
							Game.heavenlyChipsSpent=0;
						}
						
						if (Game.ascensionMode!=1)
						{
							if (Game.Has('Starter kit')) Game.Objects['Cursor'].free=10;
							if (Game.Has('Starter kitchen')) Game.Objects['Grandma'].free=5;
						}
						
						Game.CalculateGains();
						
						if (Math.random()<1/10000) Game.TOYS=1;//teehee!
						
						var timeOffline=(Date.now()-Game.lastDate)/1000;
						
						Game.loadLumps(timeOffline);
						
						//compute cookies earned while the game was closed
						if (Game.mobile || Game.Has('Perfect idling') || Game.Has('Twin Gates of Transcendence'))
						{
							if (Game.Has('Perfect idling'))
							{
								var maxTime=60*60*24*1000000000;
								var percent=100;
							}
							else
							{
								var maxTime=60*60;
								if (Game.Has('Belphegor')) maxTime*=2;
								if (Game.Has('Mammon')) maxTime*=2;
								if (Game.Has('Abaddon')) maxTime*=2;
								if (Game.Has('Satan')) maxTime*=2;
								if (Game.Has('Asmodeus')) maxTime*=2;
								if (Game.Has('Beelzebub')) maxTime*=2;
								if (Game.Has('Lucifer')) maxTime*=2;
								
								var percent=5;
								if (Game.Has('Angels')) percent+=10;
								if (Game.Has('Archangels')) percent+=10;
								if (Game.Has('Virtues')) percent+=10;
								if (Game.Has('Dominions')) percent+=10;
								if (Game.Has('Cherubim')) percent+=10;
								if (Game.Has('Seraphim')) percent+=10;
								if (Game.Has('God')) percent+=10;
								
								if (Game.Has('Chimera')) {maxTime+=60*60*24*2;percent+=5;}
							}
							
							var timeOfflineOptimal=Math.min(timeOffline,maxTime);
							var timeOfflineReduced=Math.max(0,timeOffline-timeOfflineOptimal);
							var amount=(timeOfflineOptimal+timeOfflineReduced*0.1)*Game.cookiesPs*(percent/100);
							
							if (amount>0)
							{
								if (Game.prefs.popups) Game.Popup('Earned '+Beautify(amount)+' cookie'+(Math.floor(amount)==1?'':'s')+' while you were away');
								else Game.Notify('Welcome back!','You earned <b>'+Beautify(amount)+'</b> cookie'+(Math.floor(amount)==1?'':'s')+' while you were away.<br>('+Game.sayTime(timeOfflineOptimal*Game.fps,-1)+' at '+Math.floor(percent)+'% CpS'+(timeOfflineReduced?', plus '+Game.sayTime(timeOfflineReduced*Game.fps,-1)+' at '+(Math.floor(percent*10)/100)+'%':'')+'.)',[Math.floor(Math.random()*16),11]);
								Game.Earn(amount);
							}
						}
						
						//we load buffs after everything as we do not want them to interfer with offline CpS
						for (var i in buffsToLoad)
						{
							var mestr=buffsToLoad[i];
							var type=Game.buffTypes[parseInt(mestr[0])];
							Game.gainBuff(type.name,parseFloat(mestr[1])/Game.fps,parseFloat(mestr[3]||0),parseFloat(mestr[4]||0),parseFloat(mestr[5]||0)).time=parseFloat(mestr[2]);
						}
						
			
						Game.bakeryNameRefresh();
						
					}
					else//importing old version save
					{
						Game.Notify('Error importing save','Sorry, you can\'t import saves from the old version anymore.','',6,1);
						return false;
					}
					
					
					Game.RebuildUpgrades();
					
					Game.TickerAge=0;
					
					Game.elderWrathD=0;
					Game.recalculateGains=1;
					Game.storeToRefresh=1;
					Game.upgradesToRebuild=1;
					
					Game.buyBulk=1;Game.buyMode=1;Game.storeBulkButton(-1);
			
					Game.specialTab='';
					Game.ToggleSpecialMenu(0);
					
					Game.killShimmers();
					
					if (Game.T>Game.fps*5 && Game.ReincarnateTimer==0)//fade out of black and pop the cookie
					{
						Game.ReincarnateTimer=1;
						Game.addClass('reincarnating');
						Game.BigCookieSize=0;
					}
					
					if (Game.prefs.popups) Game.Popup('Game loaded');
					else Game.Notify('Game loaded','','',1,1);
					
					if (Game.prefs.showBackupWarning==1) Game.showBackupWarning();
				}
			}
			else return false;
			return true;
		}
		
		/*=====================================================================================
		RESET
		=======================================================================================*/
		Game.Reset=function(hard)
		{
			var cookiesForfeited=Game.cookiesEarned;
			if (!hard)
			{
				if (cookiesForfeited>=1000000) Game.Win('Sacrifice');
				if (cookiesForfeited>=1000000000) Game.Win('Oblivion');
				if (cookiesForfeited>=1000000000000) Game.Win('From scratch');
				if (cookiesForfeited>=1000000000000000) Game.Win('Nihilism');
				if (cookiesForfeited>=1000000000000000000) Game.Win('Dematerialize');
				if (cookiesForfeited>=1000000000000000000000) Game.Win('Nil zero zilch');
				if (cookiesForfeited>=1000000000000000000000000) Game.Win('Transcendence');
				if (cookiesForfeited>=1000000000000000000000000000) Game.Win('Obliterate');
				if (cookiesForfeited>=1000000000000000000000000000000) Game.Win('Negative void');
				if (cookiesForfeited>=1000000000000000000000000000000000) Game.Win('To crumbs, you say?');
			}
			
			Game.killBuffs();
			
			Game.seed=Game.makeSeed();
			
			Game.cookiesReset+=Game.cookiesEarned;
			Game.cookies=0;
			Game.cookiesEarned=0;
			Game.cookieClicks=0;
			Game.goldenClicksLocal=0;
			//Game.goldenClicks=0;
			//Game.missedGoldenClicks=0;
			Game.handmadeCookies=0;
			if (hard)
			{
				Game.bgType=0;
				Game.milkType=0;
				Game.chimeType=0;
			}
			Game.pledges=0;
			Game.pledgeT=0;
			Game.elderWrath=0;
			Game.nextResearch=0;
			Game.researchT=0;
			Game.seasonT=0;
			Game.seasonUses=0;
			Game.season=Game.baseSeason;
			Game.computeSeasonPrices();
			
			Game.startDate=parseInt(Date.now());
			Game.lastDate=parseInt(Date.now());
			
			Game.cookiesSucked=0;
			Game.wrinklersPopped=0;
			Game.ResetWrinklers();
			
			Game.santaLevel=0;
			Game.reindeerClicked=0;
			
			Game.dragonLevel=0;
			Game.dragonAura=0;
			Game.dragonAura2=0;
			
			if (Game.gainedPrestige>0 && Game.resets==0)
			{
				//first ascension
				Game.lumpT=Date.now();
			}
			if (Game.gainedPrestige>0) Game.resets++;
			if (!hard && Game.resets>0 && Game.ascensionMode!=1) Game.addClass('lumpsOn');
			else Game.removeClass('lumpsOn');
			Game.gainedPrestige=0;
			
			for (var i in Game.ObjectsById)
			{
				var me=Game.ObjectsById[i];
				me.amount=0;me.bought=0;me.free=0;me.totalCookies=0;
				me.switchMinigame(false);
				me.refresh();
			}
			for (var i in Game.UpgradesById)
			{
				var me=Game.UpgradesById[i];
				if (hard || me.pool!='prestige')
				{me.unlocked=0;me.bought=0;}
			}
			
			Game.BuildingsOwned=0;
			Game.UpgradesOwned=0;
			
			if (!hard)
			{
				if (Game.ascensionMode!=1)
				{
					for (var i in Game.permanentUpgrades)
					{
						if (Game.permanentUpgrades[i]!=-1)
						{Game.UpgradesById[Game.permanentUpgrades[i]].earn();}
					}
					if (Game.Has('Season switcher')) {for (var i in Game.seasons) {Game.Unlock(Game.seasons[i].trigger);}}
					
					if (Game.Has('Starter kit')) Game.Objects['Cursor'].getFree(10);
					if (Game.Has('Starter kitchen')) Game.Objects['Grandma'].getFree(5);
				}
			}
			
			/*for (var i in Game.AchievementsById)
			{
				var me=Game.AchievementsById[i];
				me.won=0;
			}*/
			//Game.DefaultPrefs();
			BeautifyAll();
			
			Game.RebuildUpgrades();
			Game.TickerAge=0;
			Game.recalculateGains=1;
			Game.storeToRefresh=1;
			Game.upgradesToRebuild=1;
			Game.killShimmers();
			
			Game.buyBulk=1;Game.buyMode=1;Game.storeBulkButton(-1);
			
			Game.LoadMinigames();
			for (var i in Game.ObjectsById)
			{
				var me=Game.ObjectsById[i];
				if (hard && me.minigame && me.minigame.launch) {me.minigame.launch();me.minigame.reset();}
				else if (!hard && me.minigame && me.minigame.reset) me.minigame.reset();
			}
			
			l('toggleBox').style.display='none';
			l('toggleBox').innerHTML='';
			Game.choiceSelectorOn=-1;
			Game.specialTab='';
			Game.ToggleSpecialMenu(0);
			
			for (var i in Game.customReset) {Game.customReset[i]();}
			
			if (hard)
			{
				if (Game.T>Game.fps*5 && Game.ReincarnateTimer==0)//fade out of black and pop the cookie
				{
					Game.ReincarnateTimer=1;
					Game.addClass('reincarnating');
					Game.BigCookieSize=0;
				}
				if (Game.prefs.popups) Game.Popup('Game reset');
				else Game.Notify('Game reset','So long, cookies.',[21,6],6);
			}
		}
		Game.HardReset=function(bypass)
		{
			if (!bypass)
			{
				Game.Prompt('<h3>Wipe save</h3><div class="block">Do you REALLY want to wipe your save?<br><small>You will lose your progress, your achievements, and your heavenly chips!</small></div>',[['Yes!','Game.ClosePrompt();Game.HardReset(1);'],'No']);
			}
			else if (bypass==1)
			{
				Game.Prompt('<h3>Wipe save</h3><div class="block">Whoah now, are you really, <b><i>REALLY</i></b> sure you want to go through with this?<br><small>Don\'t say we didn\'t warn you!</small></div>',[['Do it!','Game.ClosePrompt();Game.HardReset(2);'],'No']);
			}
			else
			{
				for (var i in Game.AchievementsById)
				{
					var me=Game.AchievementsById[i];
					me.won=0;
				}
				for (var i in Game.ObjectsById)
				{
					var me=Game.ObjectsById[i];
					me.level=0;
				}

				Game.AchievementsOwned=0;
				Game.goldenClicks=0;
				Game.missedGoldenClicks=0;
				Game.Reset(1);
				Game.resets=0;
				Game.fullDate=parseInt(Date.now());
				Game.bakeryName=Game.GetBakeryName();
				Game.bakeryNameRefresh();
				Game.cookiesReset=0;
				Game.prestige=0;
				Game.heavenlyChips=0;
				Game.heavenlyChipsSpent=0;
				Game.heavenlyCookies=0;
				Game.permanentUpgrades=[-1,-1,-1,-1,-1];
				Game.ascensionMode=0;
				Game.lumps=1;
				Game.lumpsTotal=1;
				Game.lumpT=Date.now();
				Game.removeClass('lumpsOn');
			}
		}
		
		
		/*=====================================================================================
		TOOLTIP
		=======================================================================================*/
		Game.tooltip={text:'',x:0,y:0,origin:'',on:0,tt:l('tooltip'),tta:l('tooltipAnchor'),shouldHide:1,dynamic:0,from:0};
		Game.tooltip.draw=function(from,text,origin)
		{
			this.shouldHide=0;
			this.text=text;
			this.from=from;
			//this.x=x;
			//this.y=y;
			this.origin=origin;
			var tt=this.tt;
			var tta=this.tta;
			tt.style.left='auto';
			tt.style.top='auto';
			tt.style.right='auto';
			tt.style.bottom='auto';
			tt.innerHTML=typeof(this.text)=='function'?unescape(this.text()):unescape(this.text);
			tta.style.display='block';
			tta.style.visibility='hidden';
			Game.tooltip.update();
			tta.style.visibility='visible';
			this.on=1;
		}
		Game.tooltip.update=function()
		{
			var X=0;
			var Y=0;
			if (this.origin=='store')
			{
				X=Game.windowW-332-this.tt.clientWidth;
				Y=Game.mouseY-32;
				if (Game.onCrate) Y=Game.onCrate.getBoundingClientRect().top-42;
				Y=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-44,Y));
				/*this.tta.style.right='308px';//'468px';
				this.tta.style.left='auto';
				if (Game.onCrate) Y=Game.onCrate.getBoundingClientRect().top-2;
				this.tta.style.top=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-64,Y-48))+'px';*/
			}
			else
			{
				if (Game.onCrate)
				{
					var rect=Game.onCrate.getBoundingClientRect();
					rect={left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom};
					if (rect.left==0 && rect.top==0)//if we get that bug where we get stuck in the top-left, move to the mouse
					{rect.left=Game.mouseX-24;rect.right=Game.mouseX+24;rect.top=Game.mouseY-24;rect.bottom=Game.mouseY+24;}
					if (this.origin=='left')
					{
						X=rect.left-this.tt.clientWidth-16;
						Y=rect.top+(rect.bottom-rect.top)/2-this.tt.clientHeight/2-38;
						Y=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-19,Y));
						if (X<0) X=rect.right;
					}
					else
					{
						X=rect.left+(rect.right-rect.left)/2-this.tt.clientWidth/2-8;
						Y=rect.top-this.tt.clientHeight-48;
						X=Math.max(0,Math.min(Game.windowW-this.tt.clientWidth-16,X));
						if (Y<0) Y=rect.bottom-32;
					}
				}
				else if (this.origin=='bottom-right')
				{
					X=Game.mouseX+8;
					Y=Game.mouseY-32;
					X=Math.max(0,Math.min(Game.windowW-this.tt.clientWidth-16,X));
					Y=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-64,Y));
				}
				else if (this.origin=='bottom')
				{
					X=Game.mouseX-this.tt.clientWidth/2-8;
					Y=Game.mouseY+24;
					X=Math.max(0,Math.min(Game.windowW-this.tt.clientWidth-16,X));
					Y=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-64,Y));
				}
				else if (this.origin=='this' && this.from)
				{
					var rect=this.from.getBoundingClientRect();
					X=(rect.left+rect.right)/2-this.tt.clientWidth/2-8;
					Y=(rect.top)-this.tt.clientHeight-48;
					X=Math.max(0,Math.min(Game.windowW-this.tt.clientWidth-16,X));
					//Y=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-64,Y));
					if (Y<0) Y=(rect.bottom-24);
					if (Y+this.tt.clientHeight+40>Game.windowH)
					{
						X=rect.right+8;
						Y=rect.top+(rect.bottom-rect.top)/2-this.tt.clientHeight/2-38;
						Y=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-19,Y));
					}
				}
				else
				{
					X=Game.mouseX-this.tt.clientWidth/2-8;
					Y=Game.mouseY-this.tt.clientHeight-32;
					X=Math.max(0,Math.min(Game.windowW-this.tt.clientWidth-16,X));
					Y=Math.max(0,Math.min(Game.windowH-this.tt.clientHeight-64,Y));
				}
			}
			this.tta.style.left=X+'px';
			this.tta.style.right='auto';
			this.tta.style.top=Y+'px';
			this.tta.style.bottom='auto';
			if (this.shouldHide) {this.hide();this.shouldHide=0;}
			if (Game.drawT%10==0 && typeof(this.text)=='function')
			{
				this.tt.innerHTML=unescape(this.text());
			}
		}
		Game.tooltip.hide=function()
		{
			this.tta.style.display='none';
			this.dynamic=0;
			this.on=0;
		}
		Game.getTooltip=function(text,origin,isCrate)
		{
			origin=(origin?origin:'middle');
			if (isCrate) return 'onMouseOut="Game.setOnCrate(0);Game.tooltip.shouldHide=1;" onMouseOver="if (!Game.mouseDown) {Game.setOnCrate(this);Game.tooltip.dynamic=0;Game.tooltip.draw(this,\''+escape(text)+'\',\''+origin+'\');Game.tooltip.wobble();}"';
			else return 'onMouseOut="Game.tooltip.shouldHide=1;" onMouseOver="Game.tooltip.dynamic=0;Game.tooltip.draw(this,\''+escape(text)+'\',\''+origin+'\');Game.tooltip.wobble();"';
		}
		Game.getDynamicTooltip=function(func,origin,isCrate)
		{
			origin=(origin?origin:'middle');
			if (isCrate) return 'onMouseOut="Game.setOnCrate(0);Game.tooltip.shouldHide=1;" onMouseOver="if (!Game.mouseDown) {Game.setOnCrate(this);Game.tooltip.dynamic=1;Game.tooltip.draw(this,'+'function(){return '+func+'();}'+',\''+origin+'\');Game.tooltip.wobble();}"';
			return 'onMouseOut="Game.tooltip.shouldHide=1;" onMouseOver="Game.tooltip.dynamic=1;Game.tooltip.draw(this,'+'function(){return '+func+'();}'+',\''+origin+'\');Game.tooltip.wobble();"';
		}
		Game.tooltip.wobble=function()
		{
			//disabled because this effect doesn't look good with the slight slowdown it might or might not be causing.
			if (false)
			{
				this.tt.className='framed';
				this.tt.offsetWidth=this.tt.offsetWidth;
				this.tt.className='framed wobbling';
			}
		}
		
		Game.onCrate=0;
		Game.setOnCrate=function(what)
		{
			Game.onCrate=what;
		}
		Game.crate=function(me,context,forceClickStr,id,asFunction)
		{
			//produce a crate with associated tooltip for an upgrade or achievement
			//me is an object representing the upgrade or achievement
			//context can be "store", "ascend", "stats" or undefined
			//forceClickStr changes what is done when the crate is clicked
			//id is the resulting div's desired id
			//asFunction is used by dynamic tooltips when we just want to get the tooltip content
			
			var classes='crate';
			var tags=[];
			var price='';
			var enabled=0;
			var noFrame=0;
			var attachment='top';
			var neuromancy=0;
			var mysterious=0;
			var clickStr='';
			var text=[];
			
			if (me.type=='upgrade')
			{
				if (context=='stats' && me.bought==0 && !Game.Has('Neuromancy') && (!Game.sesame || me.pool!='debug')) return '';
				else if (context=='stats' && (Game.Has('Neuromancy') || (Game.sesame && me.pool=='debug'))) neuromancy=1;
				else if (context=='store' && !me.canBuy()) enabled=0;
				else if (context=='ascend' && me.bought==0) enabled=0;
				else enabled=1;
				
				if (context=='stats' && !Game.prefs.crates) noFrame=1;
				
				classes+=' upgrade';
				
				if (me.pool=='prestige') {tags.push('Heavenly','#efa438');classes+=' heavenly';}
				else if (me.pool=='tech') tags.push('Tech','#36a4ff');
				else if (me.pool=='cookie') tags.push('Cookie',0);
				else if (me.pool=='debug') tags.push('Debug','#00c462');
				else if (me.pool=='toggle') tags.push('Switch',0);
				else tags.push('Upgrade',0);
				
				//if (me.tier!=0) tags.push('Tier : '+Game.Tiers[me.tier].name,Game.Tiers[me.tier].color);//removed because this was somehow confusing to players
				
				if (me.bought>0)
				{
					if (me.pool=='tech') tags.push('Researched',0);
					else if (me.kitten) tags.push('Purrchased',0);
					else tags.push('Purchased',0);
					enabled=1;
				}
				
				if (neuromancy && me.bought==0) tags.push('Click to learn!','#00c462');
				else if (neuromancy && me.bought>0) tags.push('Click to unlearn!','#00c462');
				
				if (neuromancy) clickStr='Game.UpgradesById['+me.id+'].toggle();';
				
				price='<div style="float:right;"><span class="price'+
					(me.pool=='prestige'?(Game.heavenlyChips>=me.getPrice()?' heavenly':' heavenly disabled'):'')+
					(context=='store'?(me.canBuy()?'':' disabled'):'')+
				'">'+Beautify(Math.round(me.getPrice()))+'</span></div>';
			}
			else if (me.type=='achievement')
			{
				if (context=='stats' && me.won==0 && me.pool!='normal') return '';
				else if (context!='stats') enabled=1;
				
				if (context=='stats' && !Game.prefs.crates) noFrame=1;
				
				classes+=' achievement';
				if (me.pool=='shadow') {tags.push('Shadow Achievement','#9700cf');classes+=' shadow';}
				else tags.push('Achievement',0);
				if (me.won>0) {tags.push('Unlocked',0);enabled=1;}
				else {tags.push('Locked',0);mysterious=1;}
				if (!enabled) clickStr='Game.AchievementsById['+me.id+'].click();';
			}
			
			if (context=='store') attachment='store';
			
			if (forceClickStr) clickStr=forceClickStr;
			
			if (me.choicesFunction) classes+=' selector';
			
			var tagsStr='';
			for (var i=0;i<tags.length;i+=2)
			{
				if (i%2==0) tagsStr+=' <div class="tag" style="color:'+(tags[i+1]==0?'#fff':tags[i+1])+';">['+tags[i]+']</div>';
			}
			tagsStr=tagsStr.substring(1);
			
			var icon=me.icon;
			if (mysterious) icon=[0,7];
			
			if (me.iconFunction) icon=me.iconFunction();
			
			var desc=me.desc;
			if (me.bought && context=='store')
			{
				enabled=0;
				if (me.displayFuncWhenOwned) desc=me.displayFuncWhenOwned()+'<div class="line"></div>'+desc;
			}
			
			if (enabled) classes+=' enabled';// else classes+=' disabled';
			if (noFrame) classes+=' noFrame';
			
			if (Game.sesame)
			{
				if (Game.debuggedUpgradeCpS[me.name] || Game.debuggedUpgradeCpClick[me.name])
				{
					text.push('x'+Beautify(1+Game.debuggedUpgradeCpS[me.name],2));text.push(Game.debugColors[Math.floor(Math.max(0,Math.min(Game.debugColors.length-1,Math.pow(Game.debuggedUpgradeCpS[me.name]/2,0.5)*Game.debugColors.length)))]);
					text.push('x'+Beautify(1+Game.debuggedUpgradeCpClick[me.name],2));text.push(Game.debugColors[Math.floor(Math.max(0,Math.min(Game.debugColors.length-1,Math.pow(Game.debuggedUpgradeCpClick[me.name]/2,0.5)*Game.debugColors.length)))]);
				}
				if (Game.extraInfo) {text.push(Math.floor(me.order)+(me.power?'<br>P:'+me.power:''));text.push('#fff');}
			}
			
			var textStr='';
			for (var i=0;i<text.length;i+=2)
			{
				textStr+='<div style="opacity:0.9;z-index:1000;padding:0px 2px;background:'+text[i+1]+';color:#000;font-size:10px;position:absolute;top:'+(i/2*10)+'px;left:0px;">'+text[i]+'</div>';
			}
			
			if (asFunction)
			return function()
			{
				return '<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
				(me.bought && context=='store'?'':price)+
				'<div class="name">'+(mysterious?'???':me.name)+'</div>'+
				tagsStr+
				'<div class="line"></div><div class="description">'+(mysterious?'???':desc)+'</div></div>';
			};
			else return '<div'+
			(clickStr!=''?(' '+Game.clickStr+'="'+clickStr+'"'):'')+
			' class="'+classes+'" '+
			(context=='store'?
				Game.getDynamicTooltip(
					'Game.crate(Game.'+(me.type=='upgrade'?'Upgrades':'Achievements')+'ById['+me.id+'],'+(context?'\''+context+'\'':'')+',undefined,undefined,1)'
				,attachment,true)+' '
				:
				Game.getTooltip(
				'<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
				price+
				'<div class="name">'+(mysterious?'???':me.name)+'</div>'+
				tagsStr+
				'<div class="line"></div><div class="description">'+(mysterious?'???':desc)+'</div></div>'
				,attachment,true)+' '
			)+
			(id?'id="'+id+'" ':'')+
			'style="'+(mysterious?
				'background-position:'+(-0*48)+'px '+(-7*48)+'px':
				(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px')+';'+
				((context=='ascend' && me.pool=='prestige')?'position:absolute;left:'+me.posX+'px;top:'+me.posY+'px;':'')+
			'">'+
			textStr+
			(me.choicesFunction?'<div class="selectorCorner"></div>':'')+
			'</div>';
		}
		
		
		/*=====================================================================================
		PRESTIGE
		=======================================================================================*/
		
		Game.HCfactor=3;
		Game.HowMuchPrestige=function(cookies)//how much prestige [cookies] should land you
		{
			return Math.pow(cookies/1000000000000,1/Game.HCfactor);
		}
		Game.HowManyCookiesReset=function(chips)//how many cookies [chips] are worth
		{
			//this must be the inverse of the above function (ie. if cookies=chips^2, chips=cookies^(1/2) )
			return Math.pow(chips,Game.HCfactor)*1000000000000;
		}
		Game.gainedPrestige=0;
		Game.EarnHeavenlyChips=function(cookiesForfeited)
		{
			//recalculate prestige and chips owned
			var prestige=Math.floor(Game.HowMuchPrestige(Game.cookiesReset+cookiesForfeited));
			if (prestige>Game.prestige)//did we gain prestige levels?
			{
				var prestigeDifference=prestige-Game.prestige;
				Game.gainedPrestige=prestigeDifference;
				Game.heavenlyChips+=prestigeDifference;
				Game.prestige=prestige;
				if (Game.prefs.popups) Game.Popup('You gain '+Beautify(prestigeDifference)+' prestige level'+(prestigeDifference==1?'':'s')+'!');
				else Game.Notify('You forfeit your '+Beautify(cookiesForfeited)+' cookies.','You gain <b>'+Beautify(prestigeDifference)+'</b> prestige level'+(prestigeDifference==1?'':'s')+'!',[19,7]);
			}
		}
		
		Game.GetHeavenlyMultiplier=function()
		{
			var heavenlyMult=0;
			if (Game.Has('Heavenly chip secret')) heavenlyMult+=0.05;
			if (Game.Has('Heavenly cookie stand')) heavenlyMult+=0.20;
			if (Game.Has('Heavenly bakery')) heavenlyMult+=0.25;
			if (Game.Has('Heavenly confectionery')) heavenlyMult+=0.25;
			if (Game.Has('Heavenly key')) heavenlyMult+=0.25;
			if (Game.hasAura('Dragon God')) heavenlyMult*=1.05;
			if (Game.Has('Lucky digit')) heavenlyMult*=1.01;
			if (Game.Has('Lucky number')) heavenlyMult*=1.01;
			if (Game.Has('Lucky payout')) heavenlyMult*=1.01;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('creation');
				if (godLvl==1) heavenlyMult*=0.7;
				else if (godLvl==2) heavenlyMult*=0.8;
				else if (godLvl==3) heavenlyMult*=0.9;
			}
			return heavenlyMult;
		}
		
		Game.ascensionModes={
		0:{name:'None',desc:'No special modifiers.',icon:[10,0]},
		1:{name:'Born again',desc:'This run will behave as if you\'d just started the game from scratch. Prestige levels and heavenly upgrades will have no effect, as will sugar lumps and building levels.<div class="line"></div>Some achievements are only available in this mode.',icon:[2,7]}/*,
		2:{name:'Trigger finger',desc:'In this run, scrolling your mouse wheel on the cookie counts as clicking it. Some upgrades introduce new clicking behaviors.<br>No clicking achievements may be obtained in this mode.<div class="line"></div>Reaching 1 quadrillion cookies in this mode unlocks a special heavenly upgrade.',icon:[12,0]}*/
		};
		
		Game.ascendMeterPercent=0;
		Game.ascendMeterPercentT=0;
		Game.ascendMeterLevel=100000000000000000000000000000;
		
		Game.nextAscensionMode=0;
		Game.UpdateAscensionModePrompt=function()
		{
			var icon=Game.ascensionModes[Game.nextAscensionMode].icon;
			var name=Game.ascensionModes[Game.nextAscensionMode].name;
			l('ascendModeButton').innerHTML=
			'<div class="crate noFrame enabled" '+Game.clickStr+'="Game.PickAscensionMode();" '+Game.getTooltip(
				'<div style="min-width:200px;text-align:center;font-size:11px;">Challenge mode for the next run :<br><b>'+name+'</b><div class="line"></div>Challenge modes apply special modifiers to your next ascension.<br>Click to change.</div>'
			,'bottom-right')+' style="opacity:1;float:none;display:block;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>';
		}
		Game.PickAscensionMode=function()
		{
			PlaySound('snd/tick.mp3');
			Game.tooltip.hide();
			
			var str='';
			for (var i in Game.ascensionModes)
			{
				var icon=Game.ascensionModes[i].icon;
				str+='<div class="crate enabled'+(i==Game.nextAscensionMode?' highlighted':'')+'" id="challengeModeSelector'+i+'" style="opacity:1;float:none;display:inline-block;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="Game.nextAscensionMode='+i+';Game.PickAscensionMode();PlaySound(\'snd/tick.mp3\');Game.choiceSelectorOn=-1;" onMouseOut="l(\'challengeSelectedName\').innerHTML=Game.ascensionModes[Game.nextAscensionMode].name;l(\'challengeSelectedDesc\').innerHTML=Game.ascensionModes[Game.nextAscensionMode].desc;" onMouseOver="l(\'challengeSelectedName\').innerHTML=Game.ascensionModes['+i+'].name;l(\'challengeSelectedDesc\').innerHTML=Game.ascensionModes['+i+'].desc;"'+
				'></div>';
			}
			Game.Prompt('<h3>Select a challenge mode</h3>'+
						'<div class="line"></div><div class="crateBox">'+str+'</div><h4 id="challengeSelectedName">'+Game.ascensionModes[Game.nextAscensionMode].name+'</h4><div class="line"></div><div id="challengeSelectedDesc" style="min-height:128px;">'+Game.ascensionModes[Game.nextAscensionMode].desc+'</div><div class="line"></div>'
						,[['Confirm','Game.UpdateAscensionModePrompt();Game.ClosePrompt();']],0,'widePrompt');
		}
		
		Game.UpdateLegacyPrompt=function()
		{
			if (!l('legacyPromptData')) return 0;
			var date=new Date();
			date.setTime(Date.now()-Game.startDate);
			var timeInSeconds=date.getTime()/1000;
			var startDate=Game.sayTime(timeInSeconds*Game.fps,-1);
			
			var ascendNowToGet=Math.floor(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned)-Game.HowMuchPrestige(Game.cookiesReset));
			var cookiesToNext=Math.floor(Game.HowManyCookiesReset(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned)+1)-Game.cookiesReset-Game.cookiesEarned);
			l('legacyPromptData').innerHTML=''+
				'<div class="icon" style="pointer-event:none;transform:scale(2);opacity:0.25;position:absolute;right:-8px;bottom:-8px;background-position:'+(-19*48)+'px '+(-7*48)+'px;"></div>'+
				'<div class="listing"><b>Run duration :</b> '+(startDate==''?'tiny':(startDate))+'</div>'+
				//'<div class="listing">Earned : '+Beautify(Game.cookiesEarned)+', Reset : '+Beautify(Game.cookiesReset)+'</div>'+
				'<div class="listing"><b>Prestige level :</b> '+Beautify(Game.prestige)+'</div>'+
				'<div class="listing"><b>Heavenly chips :</b> '+Beautify(Game.heavenlyChips)+'</div>'+
				(ascendNowToGet>=1?('<div class="listing"><b>Ascending now will produce :</b> '+Beautify(ascendNowToGet)+' heavenly chip'+((ascendNowToGet)==1?'':'s')+'</div>'):
				('<div class="listing warning"><b>'+Beautify(cookiesToNext)+'</b> more cookie'+((cookiesToNext)==1?'':'s')+' for the next prestige level.<br>You may ascend now, but will gain no benefits.</div>'))+
			'';
			if (1 || ascendNowToGet>=1) l('promptOption0').style.display='inline-block'; else l('promptOption0').style.display='none';
		}
		
		l('ascendOverlay').innerHTML=
			'<div id="ascendBox">'+
			'<div class="ascendData smallFramed prompt" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">Each prestige level grants you a permanent +1% CpS.<br>The more levels you have, the more cookies they require.</div>'
							,'bottom-right')+' style="margin-top:8px;"><h3 id="ascendPrestige"></h3></div>'+
			'<div class="ascendData smallFramed prompt" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">Heavenly chips are used to buy heavenly upgrades.<br>You gain 1 chip every time you gain a prestige level.</div>'
							,'bottom-right')+'><h3 id="ascendHCs"></h3></div>'+
			'<a id="ascendButton" class="option framed large red" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">Click this once you\'ve bought<br>everything you need!</div>'
							,'bottom-right')+' style="font-size:16px;margin-top:0px;"><span class="fancyText" style="font-size:20px;">Reincarnate</span></a>'+
			'<div id="ascendModeButton" style="position:absolute;right:34px;bottom:25px;display:none;"></div>'+
			'<input type="text" style="display:block;" id="upgradePositions"/></div>'+
			
			'<div id="ascendInfo"><div class="ascendData smallFramed" style="margin-top:22px;width:40%;font-size:11px;">You are ascending.<br>Drag the screen around<br>or use arrow keys!<br>When you\'re ready,<br>click Reincarnate.</div></div>';
		
		Game.UpdateAscensionModePrompt();
		
		AddEvent(l('ascendButton'),'click',function(){
			PlaySound('snd/tick.mp3');
			Game.Reincarnate();
		});
		
		Game.ascendl=l('ascend');
		Game.ascendContentl=l('ascendContent');
		Game.ascendZoomablel=l('ascendZoomable');
		Game.ascendUpgradesl=l('ascendUpgrades');
		Game.OnAscend=0;
		Game.AscendTimer=0;//how far we are into the ascend animation
		Game.AscendDuration=Game.fps*5;//how long the ascend animation is
		Game.AscendBreakpoint=Game.AscendDuration*0.5;//at which point the cookie explodes during the ascend animation
		Game.UpdateAscendIntro=function()
		{
			if (Game.AscendTimer==1) PlaySound('snd/charging.mp3');
			if (Game.AscendTimer==Math.floor(Game.AscendBreakpoint)) PlaySound('snd/thud.mp3');
			Game.AscendTimer++;
			if (Game.AscendTimer>Game.AscendDuration)//end animation and launch ascend screen
			{
				PlaySound('snd/cymbalRev.mp3',0.5);
				PlaySound('snd/choir.mp3');
				Game.EarnHeavenlyChips(Game.cookiesEarned);
				Game.AscendTimer=0;
				Game.OnAscend=1;Game.removeClass('ascendIntro');
				Game.addClass('ascending');
				Game.BuildAscendTree();
				Game.heavenlyChipsDisplayed=Game.heavenlyChips;
				Game.nextAscensionMode=0;
				Game.ascensionMode=0;
				Game.UpdateAscensionModePrompt();
			}
		}
		Game.ReincarnateTimer=0;//how far we are into the reincarnation animation
		Game.ReincarnateDuration=Game.fps*1;//how long the reincarnation animation is
		Game.UpdateReincarnateIntro=function()
		{
			if (Game.ReincarnateTimer==1) PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			Game.ReincarnateTimer++;
			if (Game.ReincarnateTimer>Game.ReincarnateDuration)//end animation and launch regular game
			{
				Game.ReincarnateTimer=0;
				Game.removeClass('reincarnating');
			}
		}
		Game.Reincarnate=function(bypass)
		{
			if (!bypass) Game.Prompt('<h3>Reincarnate</h3><div class="block">Are you ready to return to the mortal world?</div>',[['Yes','Game.ClosePrompt();Game.Reincarnate(1);'],'No']);
			else
			{
				Game.ascendUpgradesl.innerHTML='';
				Game.ascensionMode=Game.nextAscensionMode;
				Game.nextAscensionMode=0;
				Game.Reset();
				if (Game.HasAchiev('Rebirth'))
				{
					if (Game.prefs.popups) Game.Popup('Reincarnated');
					else Game.Notify('Reincarnated','Hello, cookies!',[10,0],4);
				}
				if (Game.resets>=1000) Game.Win('Endless cycle');
				if (Game.resets>=100) Game.Win('Reincarnation');
				if (Game.resets>=10) Game.Win('Resurrection');
				if (Game.resets>=1) Game.Win('Rebirth');
				Game.removeClass('ascending');
				Game.OnAscend=0;
				//trigger the reincarnate animation
				Game.ReincarnateTimer=1;
				Game.addClass('reincarnating');
				Game.BigCookieSize=0;
			}
		}
		Game.GiveUpAscend=function(bypass)
		{
			if (!bypass) Game.Prompt('<h3>Give up</h3><div class="block">Are you sure? You\'ll have to start this run over and won\'t gain any heavenly chips!</div>',[['Yes','Game.ClosePrompt();Game.GiveUpAscend(1);'],'No']);
			else
			{
				if (Game.prefs.popups) Game.Popup('Game reset');
				else Game.Notify('Gave up','Let\'s try this again!',[0,5],4);
				Game.Reset();
			}
		}
		Game.Ascend=function(bypass)
		{
			if (!bypass) Game.Prompt('<h3>Ascend</h3><div class="block">Do you REALLY want to ascend?<div class="line"></div>You will lose your progress and start over from scratch.<div class="line"></div>All your cookies will be converted into prestige and heavenly chips.<div class="line"></div>You will keep your achievements'+(Game.resets>0?', building levels and sugar lumps':'')+'.</div>',[['Yes!','Game.ClosePrompt();Game.Ascend(1);'],'No']);
			else
			{
				if (Game.prefs.popups) Game.Popup('Ascending');
				else Game.Notify('Ascending','So long, cookies.',[20,7],4);
				Game.OnAscend=0;Game.removeClass('ascending');
				Game.addClass('ascendIntro');
				//trigger the ascend animation
				Game.AscendTimer=1;
				Game.killShimmers();
				l('toggleBox').style.display='none';
				l('toggleBox').innerHTML='';
				Game.choiceSelectorOn=-1;
				Game.ToggleSpecialMenu(0);
				Game.AscendOffX=0;
				Game.AscendOffY=0;
				Game.AscendOffXT=0;
				Game.AscendOffYT=0;
				Game.AscendZoomT=1;
				Game.AscendZoom=0.2;
			}
		}
		
		Game.DebuggingPrestige=0;
		Game.AscendDragX=0;
		Game.AscendDragY=0;
		Game.AscendOffX=0;
		Game.AscendOffY=0;
		Game.AscendZoom=1;
		Game.AscendOffXT=0;
		Game.AscendOffYT=0;
		Game.AscendZoomT=1;
		Game.AscendDragging=0;
		Game.AscendGridSnap=24;
		Game.heavenlyBounds={left:0,right:0,top:0,bottom:0};
		Game.UpdateAscend=function()
		{
			if (Game.keys[37]) Game.AscendOffXT+=16*(1/Game.AscendZoomT);
			if (Game.keys[38]) Game.AscendOffYT+=16*(1/Game.AscendZoomT);
			if (Game.keys[39]) Game.AscendOffXT-=16*(1/Game.AscendZoomT);
			if (Game.keys[40]) Game.AscendOffYT-=16*(1/Game.AscendZoomT);
			
			if (Game.AscendOffXT>-Game.heavenlyBounds.left) Game.AscendOffXT=-Game.heavenlyBounds.left;
			if (Game.AscendOffXT<-Game.heavenlyBounds.right) Game.AscendOffXT=-Game.heavenlyBounds.right;
			if (Game.AscendOffYT>-Game.heavenlyBounds.top) Game.AscendOffYT=-Game.heavenlyBounds.top;
			if (Game.AscendOffYT<-Game.heavenlyBounds.bottom) Game.AscendOffYT=-Game.heavenlyBounds.bottom;
			Game.AscendOffX+=(Game.AscendOffXT-Game.AscendOffX)*0.5;
			Game.AscendOffY+=(Game.AscendOffYT-Game.AscendOffY)*0.5;
			Game.AscendZoom+=(Game.AscendZoomT-Game.AscendZoom)*0.25;
			if (Math.abs(Game.AscendZoomT-Game.AscendZoom)<0.005) Game.AscendZoom=Game.AscendZoomT;
			
			if (Game.DebuggingPrestige)
			{
				for (var i in Game.PrestigeUpgrades)
				{
					var me=Game.PrestigeUpgrades[i];
					AddEvent(l('heavenlyUpgrade'+me.id),'mousedown',function(me){return function(){
						if (!Game.DebuggingPrestige) return;
						Game.SelectedHeavenlyUpgrade=me;
					}}(me));
					AddEvent(l('heavenlyUpgrade'+me.id),'mouseup',function(me){return function(){
						if (Game.SelectedHeavenlyUpgrade==me) {Game.SelectedHeavenlyUpgrade=0;Game.BuildAscendTree();}
					}}(me));
				}
			}
			
			if (Game.mouseDown && !Game.promptOn)
			{
				if (!Game.AscendDragging)
				{
					Game.AscendDragX=Game.mouseX;
					Game.AscendDragY=Game.mouseY;
				}
				Game.AscendDragging=1;
				
				if (Game.DebuggingPrestige)
				{
					if (Game.SelectedHeavenlyUpgrade)
					{
						Game.tooltip.hide();
						//drag upgrades around
						var me=Game.SelectedHeavenlyUpgrade;
						me.posX+=(Game.mouseX-Game.AscendDragX)*(1/Game.AscendZoomT);
						me.posY+=(Game.mouseY-Game.AscendDragY)*(1/Game.AscendZoomT);
						var posX=me.posX;//Math.round(me.posX/Game.AscendGridSnap)*Game.AscendGridSnap;
						var posY=me.posY;//Math.round(me.posY/Game.AscendGridSnap)*Game.AscendGridSnap;
						l('heavenlyUpgrade'+me.id).style.left=Math.floor(posX)+'px';
						l('heavenlyUpgrade'+me.id).style.top=Math.floor(posY)+'px';
						for (var ii in me.parents)
						{
							var origX=0;
							var origY=0;
							var targX=me.posX+28;
							var targY=me.posY+28;
							if (me.parents[ii]!=-1) {origX=me.parents[ii].posX+28;origY=me.parents[ii].posY+28;}
							var rot=-(Math.atan((targY-origY)/(origX-targX))/Math.PI)*180;
							if (targX<=origX) rot+=180;
							var dist=Math.floor(Math.sqrt((targX-origX)*(targX-origX)+(targY-origY)*(targY-origY)));
							//l('heavenlyLink'+me.id+'-'+ii).style='width:'+dist+'px;-webkit-transform:rotate('+rot+'deg);-moz-transform:rotate('+rot+'deg);-ms-transform:rotate('+rot+'deg);-o-transform:rotate('+rot+'deg);transform:rotate('+rot+'deg);left:'+(origX)+'px;top:'+(origY)+'px;';
							l('heavenlyLink'+me.id+'-'+ii).style='width:'+dist+'px;transform:rotate('+rot+'deg);left:'+(origX)+'px;top:'+(origY)+'px;';
						}
					}
				}
				if (!Game.SelectedHeavenlyUpgrade)
				{
					Game.AscendOffXT+=(Game.mouseX-Game.AscendDragX)*(1/Game.AscendZoomT);
					Game.AscendOffYT+=(Game.mouseY-Game.AscendDragY)*(1/Game.AscendZoomT);
				}
				Game.AscendDragX=Game.mouseX;
				Game.AscendDragY=Game.mouseY;
			}
			else
			{
				/*if (Game.SelectedHeavenlyUpgrade)
				{
					var me=Game.SelectedHeavenlyUpgrade;
					me.posX=Math.round(me.posX/Game.AscendGridSnap)*Game.AscendGridSnap;
					me.posY=Math.round(me.posY/Game.AscendGridSnap)*Game.AscendGridSnap;
					l('heavenlyUpgrade'+me.id).style.left=me.posX+'px';
					l('heavenlyUpgrade'+me.id).style.top=me.posY+'px';
				}*/
				Game.AscendDragging=0;
				Game.SelectedHeavenlyUpgrade=0;
			}
			if (Game.Click || Game.promptOn)
			{
				Game.AscendDragging=0;
			}
			
			//Game.ascendl.style.backgroundPosition=Math.floor(Game.AscendOffX/2)+'px '+Math.floor(Game.AscendOffY/2)+'px';
			//Game.ascendl.style.backgroundPosition=Math.floor(Game.AscendOffX/2)+'px '+Math.floor(Game.AscendOffY/2)+'px,'+Math.floor(Game.AscendOffX/4)+'px '+Math.floor(Game.AscendOffY/4)+'px';
			//Game.ascendContentl.style.left=Math.floor(Game.AscendOffX)+'px';
			//Game.ascendContentl.style.top=Math.floor(Game.AscendOffY)+'px';
			Game.ascendContentl.style.webkitTransform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendContentl.style.msTransform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendContentl.style.oTransform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendContentl.style.mozTransform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendContentl.style.transform='translate('+Math.floor(Game.AscendOffX)+'px,'+Math.floor(Game.AscendOffY)+'px)';
			Game.ascendZoomablel.style.webkitTransform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			Game.ascendZoomablel.style.msTransform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			Game.ascendZoomablel.style.oTransform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			Game.ascendZoomablel.style.mozTransform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			Game.ascendZoomablel.style.transform='scale('+(Game.AscendZoom)+','+(Game.AscendZoom)+')';
			
			//if (Game.Scroll!=0) Game.ascendContentl.style.transformOrigin=Math.floor(Game.windowW/2-Game.mouseX)+'px '+Math.floor(Game.windowH/2-Game.mouseY)+'px';
			if (Game.Scroll<0 && !Game.promptOn) {Game.AscendZoomT=0.5;}
			if (Game.Scroll>0 && !Game.promptOn) {Game.AscendZoomT=1;}
			
			if (Game.T%2==0)
			{
				l('ascendPrestige').innerHTML='Prestige level :<br>'+Beautify(Game.prestige);
				l('ascendHCs').innerHTML='Heavenly chips :<br><span class="price heavenly">'+Beautify(Math.round(Game.heavenlyChipsDisplayed))+'</span>';
				if (Game.prestige>0) l('ascendModeButton').style.display='block';
				else l('ascendModeButton').style.display='none';
			}
			Game.heavenlyChipsDisplayed+=(Game.heavenlyChips-Game.heavenlyChipsDisplayed)*0.4;
			
			if (Game.DebuggingPrestige && Game.T%10==0)
			{
				var str='';
				for (var i in Game.PrestigeUpgrades)
				{
					var me=Game.PrestigeUpgrades[i];
					str+=me.id+':['+Math.floor(me.posX)+','+Math.floor(me.posY)+'],';
				}
				l('upgradePositions').value='Game.UpgradePositions={'+str+'};';
			}
			//if (Game.T%5==0) Game.BuildAscendTree();
		}
		Game.AscendRefocus=function()
		{
			Game.AscendOffX=0;
			Game.AscendOffY=0;
			Game.ascendl.className='';
		}
		
		Game.SelectedHeavenlyUpgrade=0;
		Game.PurchaseHeavenlyUpgrade=function(what)
		{
			//if (Game.Has('Neuromancy')) Game.UpgradesById[what].toggle(); else
			if (Game.UpgradesById[what].buy())
			{
				if (l('heavenlyUpgrade'+what)){var rect=l('heavenlyUpgrade'+what).getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);}
				//Game.BuildAscendTree();
			}
		}
		Game.BuildAscendTree=function()
		{
			var str='';
			Game.heavenlyBounds={left:0,right:0,top:0,bottom:0};

			if (Game.DebuggingPrestige) l('upgradePositions').style.display='block'; else l('upgradePositions').style.display='none';
			
			for (var i in Game.PrestigeUpgrades)
			{
				var me=Game.PrestigeUpgrades[i];
				me.canBePurchased=1;
				if (!me.bought && !Game.DebuggingPrestige)
				{
					if (me.showIf && !me.showIf()) me.canBePurchased=0;
					else
					{
						for (var ii in me.parents)
						{
							if (me.parents[ii]!=-1 && !me.parents[ii].bought) me.canBePurchased=0;
						}
					}
				}
			}
			str+='<div class="crateBox" style="filter:none;-webkit-filter:none;">';//chrome is still bad at these
			for (var i in Game.PrestigeUpgrades)
			{
				var me=Game.PrestigeUpgrades[i];
				
				var ghosted=0;
				if (me.canBePurchased || Game.Has('Neuromancy'))
				{
					str+=Game.crate(me,'ascend','Game.PurchaseHeavenlyUpgrade('+me.id+');','heavenlyUpgrade'+me.id);
				}
				else
				{
					for (var ii in me.parents)
					{
						if (me.parents[ii]!=-1 && me.parents[ii].canBePurchased) ghosted=1;
					}
					if (me.showIf && !me.showIf()) ghosted=0;
					if (ghosted)
					{
						//maybe replace this with Game.crate()
						str+='<div class="crate upgrade heavenly ghosted" id="heavenlyUpgrade'+me.id+'" style="position:absolute;left:'+me.posX+'px;top:'+me.posY+'px;'+(me.icon[2]?'background-image:url('+me.icon[2]+');':'')+'background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>';
					}
				}
				if (me.canBePurchased || Game.Has('Neuromancy') || ghosted)
				{
					if (me.posX<Game.heavenlyBounds.left) Game.heavenlyBounds.left=me.posX;
					if (me.posX>Game.heavenlyBounds.right) Game.heavenlyBounds.right=me.posX;
					if (me.posY<Game.heavenlyBounds.top) Game.heavenlyBounds.top=me.posY;
					if (me.posY>Game.heavenlyBounds.bottom) Game.heavenlyBounds.bottom=me.posY;
				}
				for (var ii in me.parents)//create pulsing links
				{
					if (me.parents[ii]!=-1 && (me.canBePurchased || ghosted))
					{
						var origX=0;
						var origY=0;
						var targX=me.posX+28;
						var targY=me.posY+28;
						if (me.parents[ii]!=-1) {origX=me.parents[ii].posX+28;origY=me.parents[ii].posY+28;}
						var rot=-(Math.atan((targY-origY)/(origX-targX))/Math.PI)*180;
						if (targX<=origX) rot+=180;
						var dist=Math.floor(Math.sqrt((targX-origX)*(targX-origX)+(targY-origY)*(targY-origY)));
						str+='<div class="parentLink" id="heavenlyLink'+me.id+'-'+ii+'" style="'+(ghosted?'opacity:0.1;':'')+'width:'+dist+'px;-webkit-transform:rotate('+rot+'deg);-moz-transform:rotate('+rot+'deg);-ms-transform:rotate('+rot+'deg);-o-transform:rotate('+rot+'deg);transform:rotate('+rot+'deg);left:'+(origX)+'px;top:'+(origY)+'px;"></div>';
					}
				}
			}
			Game.heavenlyBounds.left-=128;
			Game.heavenlyBounds.top-=128;
			Game.heavenlyBounds.right+=128+64;
			Game.heavenlyBounds.bottom+=128+64;
			//str+='<div style="border:1px solid red;position:absolute;left:'+Game.heavenlyBounds.left+'px;width:'+(Game.heavenlyBounds.right-Game.heavenlyBounds.left)+'px;top:'+Game.heavenlyBounds.top+'px;height:'+(Game.heavenlyBounds.bottom-Game.heavenlyBounds.top)+'px;"></div>';
			str+='</div>';
			Game.ascendUpgradesl.innerHTML=str;
		}
		
		
		/*=====================================================================================
		COALESCING SUGAR LUMPS
		=======================================================================================*/
		Game.lumpMatureAge=1;
		Game.lumpRipeAge=1;
		Game.lumpOverripeAge=1;
		Game.lumpCurrentType=0;
		l('comments').innerHTML=l('comments').innerHTML+
			'<div id="lumps" onclick="Game.clickLump();" '+Game.getDynamicTooltip('Game.lumpTooltip','bottom')+'><div id="lumpsIcon" class="usesIcon"></div><div id="lumpsIcon2" class="usesIcon"></div><div id="lumpsAmount">0</div></div>';
		Game.lumpTooltip=function()
		{
			var str='<div style="padding:8px;width:400px;font-size:11px;text-align:center;">'+
			'You have <span class="price lump">'+Beautify(Game.lumps)+' sugar lump'+(Game.lumps==1?'':'s')+'</span>.'+
			'<div class="line"></div>'+
			'A <b>sugar lump</b> is coalescing here, attracted by your past feats.';
						
			var age=Date.now()-Game.lumpT;
			str+='<div class="line"></div>';
			if (age<Game.lumpMatureAge) str+='This sugar lump is still growing and will take <b>'+Game.sayTime(((Game.lumpMatureAge-age)/1000+1)*Game.fps,-1)+'</b> to reach maturity.';
			else if (age<Game.lumpRipeAge) str+='This sugar lump is mature and will be ripe in <b>'+Game.sayTime(((Game.lumpRipeAge-age)/1000+1)*Game.fps,-1)+'</b>.<br>You may <b>click it to harvest it now</b>, but there is a <b>50% chance you won\'t get anything</b>.';
			else if (age<Game.lumpOverripeAge) str+='<b>This sugar lump is ripe! Click it to harvest it.</b><br>If you do nothing, it will auto-harvest in <b>'+Game.sayTime(((Game.lumpOverripeAge-age)/1000+1)*Game.fps,-1)+'</b>.';
			
			var phase=(age/Game.lumpOverripeAge)*7;
			if (phase>=3)
			{
				if (Game.lumpCurrentType!=0) str+='<div class="line"></div>';
				if (Game.lumpCurrentType==1) str+='This sugar lump grew to be <b>bifurcated</b>; harvesting it has a 50% chance of yielding two lumps.';
				else if (Game.lumpCurrentType==2) str+='This sugar lump grew to be <b>golden</b>; harvesting it will yield 2 to 7 lumps, your current cookies will be doubled, and you will find 10% more golden cookies for the next 24 hours.';
				else if (Game.lumpCurrentType==3) str+='This sugar lump was affected by the elders and grew to be <b>meaty</b>; harvesting it will yield between 0 and 2 lumps.';
			}
			
			str+='<div class="line"></div>';
			str+='Your sugar lumps mature after <b>'+Game.sayTime((Game.lumpMatureAge/1000)*Game.fps,-1)+'</b>,<br>ripen after <b>'+Game.sayTime((Game.lumpRipeAge/1000)*Game.fps,-1)+'</b>,<br>and fall after <b>'+Game.sayTime((Game.lumpOverripeAge/1000)*Game.fps,-1)+'</b>.';
			
			str+='<div class="line"></div>'+
			'&bull; Sugar lumps can be harvested when ripe, though if left alone beyond that point they will eventually fall and be auto-harvested after some time.<br>&bull; Sugar lumps are delicious and may be used as currency for all sorts of things.<br>&bull; Once a sugar lump is harvested, another one will start growing in its place.<br>&bull; Note that sugar lumps keep growing when the game is closed.';
			
			str+='</div>';
			return str;
		}
		Game.computeLumpTimes=function()
		{
			var hour=1000*60*60;
			Game.lumpMatureAge=hour*20;
			Game.lumpRipeAge=hour*23;
			if (Game.Has('Stevia Caelestis')) Game.lumpRipeAge-=hour;
			if (Game.Has('Diabetica Daemonicus')) Game.lumpMatureAge-=hour;
			if (Game.hasGod && Game.BuildingsOwned%10==0)
			{
				var godLvl=Game.hasGod('order');
				if (godLvl==1) Game.lumpRipeAge-=hour;
				else if (godLvl==2) Game.lumpRipeAge-=(hour/3)*2;
				else if (godLvl==3) Game.lumpRipeAge-=(hour/3);
			}
			Game.lumpOverripeAge=Game.lumpRipeAge+hour;
			if (Game.Has('Glucose-charged air')) {Game.lumpMatureAge/=2000;Game.lumpRipeAge/=2000;Game.lumpOverripeAge/=2000;}
		}
		Game.loadLumps=function(time)
		{
			Game.computeLumpTimes();
			Game.computeLumpType();
			if (Game.resets==0 || Game.ascensionMode==1) Game.removeClass('lumpsOn');
			else
			{
				if (Game.ascensionMode!=1) Game.addClass('lumpsOn');
				var age=Math.max(Date.now()-Game.lumpT,0);
				var amount=Math.floor(age/Game.lumpOverripeAge);//how many lumps did we harvest since we closed the game?
				if (amount>=1)
				{
					Game.harvestLumps(1,true);
					Game.lumpCurrentType=0;//all offline lumps after the first one have a normal type
					if (amount>1) Game.harvestLumps(amount-1,true);
					if (Game.prefs.popups) Game.Popup('Harvested '+Beautify(amount)+' sugar lump'+(amount==1?'':'s')+' while you were away');
					else Game.Notify('','You harvested <b>'+Beautify(amount)+'</b> sugar lump'+(amount==1?'':'s')+' while you were away.',[29,14]);
					Game.lumpT=Date.now()-(age-amount*Game.lumpOverripeAge);
					Game.computeLumpType();
				}
			}
		}
		Game.gainLumps=function(yield)
		{
			Game.lumps+=yield;
			Game.lumpsTotal+=yield;
			
			if (Game.lumpsTotal>=7) Game.Win('Dude, sweet');
			if (Game.lumpsTotal>=30) Game.Win('Sugar rush');
			if (Game.lumpsTotal>=365) Game.Win('Year\'s worth of cavities');
		}
		Game.clickLump=function()
		{
			if (Game.resets==0) return;
			var age=Date.now()-Game.lumpT;
			if (age<Game.lumpMatureAge) {}
			else if (age<Game.lumpRipeAge)
			{
				var amount=choose([0,1]);
				if (amount!=0) Game.Win('Hand-picked');
				Game.harvestLumps(amount);
				Game.computeLumpType();
			}
			else if (age<Game.lumpOverripeAge)
			{
				Game.harvestLumps(1);
				Game.computeLumpType();
			}
		}
		Game.harvestLumps=function(amount,silent)
		{
			if (Game.resets==0) return;
			Game.lumpT=Date.now();
			var yield=amount;
			if (Game.lumpCurrentType==1 && Game.Has('Sucralosia Inutilis') && Math.random()<0.05) yield*=2;
			else if (Game.lumpCurrentType==1) yield*=choose([1,2]);
			else if (Game.lumpCurrentType==2)
			{
				yield*=choose([2,3,4,5,6,7]);
				Game.gainBuff('sugar blessing',24*60*60,1);
				Game.Earn(Game.cookies);
				if (Game.prefs.popups) Game.Popup('Sugar blessing activated!');
				else Game.Notify('Sugar blessing activated!','Your cookies have been doubled.<br>+10% golden cookies for the next 24 hours.',[29,16]);
			}
			else if (Game.lumpCurrentType==3) yield*=choose([0,0,1,2,2]);
			yield=Math.floor(yield);
			Game.gainLumps(yield);
			if (Game.lumpCurrentType==1) Game.Win('Sugar sugar');
			else if (Game.lumpCurrentType==2) Game.Win('All-natural cane sugar');
			else if (Game.lumpCurrentType==3) Game.Win('Sweetmeats');
			
			if (!silent)
			{
				var rect=l('lumpsIcon2').getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);
				if (yield>0) Game.Popup('<small>+'+Beautify(yield)+' sugar lump'+(yield==1?'':'s')+'</small>',(rect.left+rect.right)/2,(rect.top+rect.bottom)/2-48);
				else Game.Popup('<small>Botched harvest!</small>',(rect.left+rect.right)/2,(rect.top+rect.bottom)/2-48);
				PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			}
			Game.computeLumpTimes();
		}
		Game.computeLumpType=function()
		{
			Math.seedrandom(Game.seed+'/'+Game.lumpT);
			var rand=Math.random();
			var types=[0];
			if (rand<(Game.Has('Sucralosia Inutilis')?0.105:0.1)) types.push(1);//bifurcated
			if (rand<0.001) types.push(2);//golden
			if (rand<0.1*Game.elderWrath) types.push(3);//meaty
			Game.lumpCurrentType=choose(types);
			Math.seedrandom();
		}
		
		Game.doLumps=function()
		{
			if (Game.resets==0) return;
			var age=Date.now()-Game.lumpT;
			if (age>Game.lumpOverripeAge)
			{
				age=0;
				Game.harvestLumps(1);
				Game.computeLumpType();
			}
			var phase=Math.min(6,Math.floor((age/Game.lumpOverripeAge)*7));
			var phase2=Math.min(6,Math.floor((age/Game.lumpOverripeAge)*7)+1);
			var row=14;
			var row2=14;
			var type=Game.lumpCurrentType;
			if (type==1)//double
			{
				//if (phase>=6) row=15;
				if (phase2>=6) row2=15;
			}
			else if (type==2)//golden
			{
				if (phase>=4) row=16;
				if (phase2>=4) row2=16;
			}
			else if (type==3)//meaty
			{
				if (phase>=4) row=17;
				if (phase2>=4) row2=17;
			}
			var icon=[23+Math.min(phase,5),row];
			var icon2=[23+phase2,row2];
			var opacity=Math.min(6,(age/Game.lumpOverripeAge)*7)%1;
			if (phase>=6) {opacity=1;}
			l('lumpsIcon').style.backgroundPosition=(-icon[0]*48)+'px '+(-icon[1]*48)+'px';
			l('lumpsIcon2').style.backgroundPosition=(-icon2[0]*48)+'px '+(-icon2[1]*48)+'px';
			l('lumpsIcon2').style.opacity=opacity;
			l('lumpsAmount').innerHTML=Beautify(Game.lumps);
		}
		
		/*=====================================================================================
		COOKIE ECONOMICS
		=======================================================================================*/
		Game.Earn=function(howmuch)
		{
			Game.cookies+=howmuch;
			Game.cookiesEarned+=howmuch;
		}
		Game.Spend=function(howmuch)
		{
			Game.cookies-=howmuch;
		}
		Game.Dissolve=function(howmuch)
		{
			Game.cookies-=howmuch;
			Game.cookiesEarned-=howmuch;
			Game.cookies=Math.max(0,Game.cookies);
			Game.cookiesEarned=Math.max(0,Game.cookiesEarned);
		}
		Game.mouseCps=function()
		{
			var add=0;
			if (Game.Has('Thousand fingers')) add+=		0.1;
			if (Game.Has('Million fingers')) add+=		0.5;
			if (Game.Has('Billion fingers')) add+=		5;
			if (Game.Has('Trillion fingers')) add+=		50;
			if (Game.Has('Quadrillion fingers')) add+=	500;
			if (Game.Has('Quintillion fingers')) add+=	5000;
			if (Game.Has('Sextillion fingers')) add+=	50000;
			if (Game.Has('Septillion fingers')) add+=	500000;
			if (Game.Has('Octillion fingers')) add+=	5000000;
			var num=0;
			for (var i in Game.Objects) {num+=Game.Objects[i].amount;}
			num-=Game.Objects['Cursor'].amount;
			add=add*num;
			if (Game.Has('Plastic mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Iron mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Titanium mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Adamantium mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Unobtainium mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Eludium mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Wishalloy mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Fantasteel mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Nevercrack mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Armythril mouse')) add+=Game.cookiesPs*0.01;
			var mult=1;
			
			for (var i in Game.customMouseCps) {mult+=Game.customMouseCps[i]();}
			
			if (Game.Has('Santa\'s helpers')) mult*=1.1;
			if (Game.Has('Cookie egg')) mult*=1.1;
			if (Game.Has('Halo gloves')) mult*=1.1;
			
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('labor');
				if (godLvl==1) mult*=1.15;
				else if (godLvl==2) mult*=1.1;
				else if (godLvl==3) mult*=1.05;
			}
			
			for (var i in Game.buffs)
			{
				if (typeof Game.buffs[i].multClick != 'undefined') mult*=Game.buffs[i].multClick;
			}
			
			if (Game.hasAura('Dragon Cursor')) mult*=1.05;
			
			for (var i in Game.customMouseCpsMult) {mult*=Game.customMouseCpsMult[i]();}
			
			var out=mult*Game.ComputeCps(1,Game.Has('Reinforced index finger')+Game.Has('Carpal tunnel prevention cream')+Game.Has('Ambidextrous'),add);
			
			if (Game.hasBuff('Cursed finger')) out=Game.buffs['Cursed finger'].power;
			return out;
		}
		Game.computedMouseCps=1;
		Game.globalCpsMult=1;
		Game.lastClick=0;
		Game.CanClick=1;
		Game.autoclickerDetected=0;
		Game.BigCookieState=0;//0 = normal, 1 = clicked (small), 2 = released/hovered (big)
		Game.BigCookieSize=0;
		Game.BigCookieSizeD=0;
		Game.BigCookieSizeT=1;
		Game.cookieClickSound=Math.floor(Math.random()*7)+1;
		Game.playCookieClickSound=function()
		{
			if (Game.prefs.cookiesound) PlaySound('snd/clickb'+(Game.cookieClickSound)+'.mp3',0.5);
			else PlaySound('snd/click'+(Game.cookieClickSound)+'.mp3',0.5);
			Game.cookieClickSound+=Math.floor(Math.random()*4)+1;
			if (Game.cookieClickSound>7) Game.cookieClickSound-=7;
		}
		Game.ClickCookie=function(event,amount)
		{
			var now=Date.now();
			if (event) event.preventDefault();
			if (Game.OnAscend || Game.AscendTimer>0) {}
			else if (now-Game.lastClick<1000/250) {}
			else
			{
				if (now-Game.lastClick<1000/15)
				{
					Game.autoclickerDetected+=Game.fps;
					if (Game.autoclickerDetected>=Game.fps*5) Game.Win('Uncanny clicker');
				}
				var amount=amount?amount:Game.computedMouseCps;
				Game.Earn(amount);
				Game.handmadeCookies+=amount;
				if (Game.prefs.particles)
				{
					Game.particleAdd();
					Game.particleAdd(Game.mouseX,Game.mouseY,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.75,1,2);
				}
				if (Game.prefs.numbers) Game.particleAdd(Game.mouseX+Math.random()*8-4,Game.mouseY-8+Math.random()*8-4,0,-2,1,4,2,'','+'+Beautify(amount,1));
				
				for (var i in Game.customCookieClicks) {Game.customCookieClicks[i]();}
			
				Game.playCookieClickSound();
				Game.cookieClicks++;
			}
			Game.lastClick=now;
			Game.Click=0;
		}
		Game.mouseX=0;
		Game.mouseY=0;
		Game.mouseX2=0;
		Game.mouseY2=0;
		Game.mouseMoved=0;
		Game.GetMouseCoords=function(e)
		{
			var posx=0;
			var posy=0;
			if (!e) var e=window.event;
			if (e.pageX||e.pageY)
			{
				posx=e.pageX;
				posy=e.pageY;
			}
			else if (e.clientX || e.clientY)
			{
				posx=e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
				posy=e.clientY+document.body.scrollTop+document.documentElement.scrollTop;
			}
			var x=0;
			var y=32;
			/*
			var el=l('sectionLeft');
			while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop))
			{
				x+=el.offsetLeft-el.scrollLeft;
				y+=el.offsetTop-el.scrollTop;
				el=el.offsetParent;
			}*/
			Game.mouseX2=Game.mouseX;
			Game.mouseY2=Game.mouseY;
			Game.mouseX=posx-x;
			Game.mouseY=posy-y;
			Game.mouseMoved=1;
		}
		var bigCookie=l('bigCookie');
		Game.Click=0;
		Game.Scroll=0;
		Game.mouseDown=0;
		if (!Game.touchEvents)
		{
			AddEvent(bigCookie,'click',Game.ClickCookie);
			AddEvent(bigCookie,'mousedown',function(event){Game.BigCookieState=1;if (Game.prefs.cookiesound) {Game.playCookieClickSound();}if (event) event.preventDefault();});
			AddEvent(bigCookie,'mouseup',function(event){Game.BigCookieState=2;if (event) event.preventDefault();});
			AddEvent(bigCookie,'mouseout',function(event){Game.BigCookieState=0;});
			AddEvent(bigCookie,'mouseover',function(event){Game.BigCookieState=2;});
			AddEvent(document,'mousemove',Game.GetMouseCoords);
			AddEvent(document,'mousedown',function(event){Game.mouseDown=1;});
			AddEvent(document,'mouseup',function(event){Game.mouseDown=0;});
			AddEvent(document,'click',function(event){Game.Click=1;});
			Game.handleScroll=function(e)
			{
				if (!e) e=event;
				Game.Scroll=(e.detail<0||e.wheelDelta>0)?1:-1;
			};
			AddEvent(document,'DOMMouseScroll',Game.handleScroll);
			AddEvent(document,'mousewheel',Game.handleScroll);
		}
		else
		{
			//touch events
			AddEvent(bigCookie,'touchend',Game.ClickCookie);
			AddEvent(bigCookie,'touchstart',function(event){Game.BigCookieState=1;if (event) event.preventDefault();});
			AddEvent(bigCookie,'touchend',function(event){Game.BigCookieState=0;if (event) event.preventDefault();});
			//AddEvent(document,'touchmove',Game.GetMouseCoords);
			AddEvent(document,'mousemove',Game.GetMouseCoords);
			AddEvent(document,'touchstart',function(event){Game.mouseDown=1;});
			AddEvent(document,'touchend',function(event){Game.mouseDown=0;});
			AddEvent(document,'touchend',function(event){Game.Click=1;});
		}
		
		Game.keys=[];
		AddEvent(window,'keyup',function(e){
			if (e.keyCode==27)
			{
				Game.ClosePrompt();
				if (Game.AscendTimer>0) Game.AscendTimer=Game.AscendDuration;
			}//esc closes prompt
			else if (e.keyCode==13) Game.ConfirmPrompt();//enter confirms prompt
			Game.keys[e.keyCode]=0;
		});
		AddEvent(window,'keydown',function(e){
			if (!Game.OnAscend && Game.AscendTimer==0)
			{
				if (e.ctrlKey && e.keyCode==83) {Game.WriteSave();e.preventDefault();}//ctrl-s saves the game
				else if (e.ctrlKey && e.keyCode==79) {Game.ImportSave();e.preventDefault();}//ctrl-o opens the import menu
			}
			Game.keys[e.keyCode]=1;
		});
		
		
		/*=====================================================================================
		CPS RECALCULATOR
		=======================================================================================*/
		Game.heavenlyPower=1;//how many CpS percents a single heavenly chip gives
		Game.recalculateGains=1;
		Game.cookiesPsByType=[];
		//display bars with http://codepen.io/anon/pen/waGyEJ
		
		Game.CalculateGains=function()
		{
			Game.cookiesPs=0;
			var mult=1;
			
			if (Game.ascensionMode!=1) mult+=parseFloat(Game.prestige)*0.01*Game.heavenlyPower*Game.GetHeavenlyMultiplier();
			
			var cookieMult=0;
			for (var i in Game.cookieUpgrades)
			{
				var me=Game.cookieUpgrades[i];
				if (Game.Has(me.name))
				{
					mult*=(1+(typeof(me.power)=='function'?me.power(me):me.power)*0.01);
				}
			}
			mult*=(1+0.01*cookieMult);
			
			if (Game.Has('Specialized chocolate chips')) mult*=1.01;
			if (Game.Has('Designer cocoa beans')) mult*=1.02;
			if (Game.Has('Underworld ovens')) mult*=1.03;
			if (Game.Has('Exotic nuts')) mult*=1.04;
			if (Game.Has('Arcane sugar')) mult*=1.05;
			
			if (Game.Has('Increased merriness')) mult*=1.15;
			if (Game.Has('Improved jolliness')) mult*=1.15;
			if (Game.Has('A lump of coal')) mult*=1.01;
			if (Game.Has('An itchy sweater')) mult*=1.01;
			if (Game.Has('Santa\'s dominion')) mult*=1.2;
			
			var buildMult=1;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('asceticism');
				if (godLvl==1) mult*=1.15;
				else if (godLvl==2) mult*=1.1;
				else if (godLvl==3) mult*=1.05;
				
				var godLvl=Game.hasGod('ages');
				if (godLvl==1) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*3))*Math.PI*2);
				else if (godLvl==2) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*12))*Math.PI*2);
				else if (godLvl==3) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*24))*Math.PI*2);
				
				var godLvl=Game.hasGod('decadence');
				if (godLvl==1) buildMult*=0.93;
				else if (godLvl==2) buildMult*=0.95;
				else if (godLvl==3) buildMult*=0.98;
				
				var godLvl=Game.hasGod('industry');
				if (godLvl==1) buildMult*=1.1;
				else if (godLvl==2) buildMult*=1.05;
				else if (godLvl==3) buildMult*=1.03;
				
				var godLvl=Game.hasGod('labor');
				if (godLvl==1) buildMult*=0.97;
				else if (godLvl==2) buildMult*=0.98;
				else if (godLvl==3) buildMult*=0.99;
			}
			
			if (Game.Has('Santa\'s legacy')) mult*=1+(Game.santaLevel+1)*0.03;
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.storedCps=(typeof(me.cps)=='function'?me.cps(me):me.cps);
				if (Game.ascensionMode!=1) me.storedCps*=(1+me.level*0.01)*buildMult;
				me.storedTotalCps=me.amount*me.storedCps;
				Game.cookiesPs+=me.storedTotalCps;
				Game.cookiesPsByType[me.name]=me.storedTotalCps;
			}
			
			
			if (Game.Has('"egg"')) {Game.cookiesPs+=9;Game.cookiesPsByType['"egg"']=9;}//"egg"
			
			for (var i in Game.customCps) {mult*=Game.customCps[i]();}
			
			Game.milkProgress=Game.AchievementsOwned/25;
			var milkMult=1;
			if (Game.Has('Santa\'s milk and cookies')) milkMult*=1.05;
			if (Game.hasAura('Breath of Milk')) milkMult*=1.05;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('mother');
				if (godLvl==1) milkMult*=1.1;
				else if (godLvl==2) milkMult*=1.06;
				else if (godLvl==3) milkMult*=1.03;
			}
			if (Game.Has('Kitten helpers')) mult*=(1+Game.milkProgress*0.1*milkMult);
			if (Game.Has('Kitten workers')) mult*=(1+Game.milkProgress*0.125*milkMult);
			if (Game.Has('Kitten engineers')) mult*=(1+Game.milkProgress*0.15*milkMult);
			if (Game.Has('Kitten overseers')) mult*=(1+Game.milkProgress*0.175*milkMult);
			if (Game.Has('Kitten managers')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('Kitten accountants')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('Kitten specialists')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('Kitten experts')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('Kitten consultants')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('Kitten assistants to the regional manager')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('Kitten angels')) mult*=(1+Game.milkProgress*0.1*milkMult);
			
			var eggMult=1;
			if (Game.Has('Chicken egg')) eggMult*=1.01;
			if (Game.Has('Duck egg')) eggMult*=1.01;
			if (Game.Has('Turkey egg')) eggMult*=1.01;
			if (Game.Has('Quail egg')) eggMult*=1.01;
			if (Game.Has('Robin egg')) eggMult*=1.01;
			if (Game.Has('Ostrich egg')) eggMult*=1.01;
			if (Game.Has('Cassowary egg')) eggMult*=1.01;
			if (Game.Has('Salmon roe')) eggMult*=1.01;
			if (Game.Has('Frogspawn')) eggMult*=1.01;
			if (Game.Has('Shark egg')) eggMult*=1.01;
			if (Game.Has('Turtle egg')) eggMult*=1.01;
			if (Game.Has('Ant larva')) eggMult*=1.01;
			if (Game.Has('Century egg'))
			{
				//the boost increases a little every day, with diminishing returns up to +10% on the 100th day
				var day=Math.floor((Date.now()-Game.startDate)/1000/10)*10/60/60/24;
				day=Math.min(day,100);
				eggMult*=1+(1-Math.pow(1-day/100,3))*0.1;
			}
			
			mult*=eggMult;
			
			if (Game.hasAura('Radiant Appetite')) mult*=2;
			
			if (Game.hasAura('Dragon\'s Fortune'))
			{
				var n=Game.shimmerTypes['golden'].n;
				for (var i=0;i<n;i++){mult*=2.11;}
				//old behavior
				/*var buffs=0;
				for (var i in Game.buffs)
				{buffs++;}
				mult*=1+(0.07)*buffs;*/
			}
			
			var rawCookiesPs=Game.cookiesPs*mult;
			for (var i in Game.CpsAchievements)
			{
				if (rawCookiesPs>=Game.CpsAchievements[i].threshold) Game.Win(Game.CpsAchievements[i].name);
			}
			
			for (var i in Game.buffs)
			{
				if (typeof Game.buffs[i].multCpS != 'undefined') mult*=Game.buffs[i].multCpS;
			}
			
			name=Game.bakeryName.toLowerCase();
			if (name=='orteil') mult*=0.99;
			else if (name=='ortiel') mult*=0.98;//or so help me
			
			var sucked=1;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase==2) sucked-=1/20;
			}
			Game.cpsSucked=(1-sucked);
			
			
			if (Game.Has('Elder Covenant')) mult*=0.95;
			
			if (Game.Has('Golden switch [off]'))
			{
				var goldenSwitchMult=1.5;
				if (Game.Has('Residual luck'))
				{
					var upgrades=['Get lucky','Lucky day','Serendipity','Heavenly luck','Lasting fortune','Decisive fate','Lucky digit','Lucky number','Lucky payout'];
					for (var i in upgrades) {if (Game.Has(upgrades[i])) goldenSwitchMult+=0.1;}
				}
				mult*=goldenSwitchMult;
			}
			if (Game.Has('Magic shenanigans')) mult*=1000;
			if (Game.Has('Occult obstruction')) mult*=0;
			
			for (var i in Game.customCpsMult) {mult*=Game.customCpsMult[i]();}
			
			Game.globalCpsMult=mult;
			Game.cookiesPs*=Game.globalCpsMult;
			
			//if (Game.hasBuff('Cursed finger')) Game.cookiesPs=0;
			
			Game.computedMouseCps=Game.mouseCps();
			
			Game.computeLumpTimes();
			
			Game.recalculateGains=0;
		}
		
		/*=====================================================================================
		SHIMMERS (GOLDEN COOKIES & SUCH)
		=======================================================================================*/
		Game.shimmersL=l('shimmers');
		Game.shimmers=[];//all shimmers currently on the screen
		Game.shimmersN=Math.floor(Math.random()*10000);
		Game.shimmer=function(type,obj,noCount)
		{
			this.type=type;
			
			this.l=document.createElement('div');
			this.l.className='shimmer';
			if (!Game.touchEvents) {AddEvent(this.l,'click',function(what){return function(event){what.pop(event);};}(this));}
			else {AddEvent(this.l,'touchend',function(what){return function(event){what.pop(event);};}(this));}//touch events
			
			this.x=0;
			this.y=0;
			this.id=Game.shimmersN;
			
			this.forceObj=obj||0;
			this.noCount=noCount;
			if (!this.noCount) {Game.shimmerTypes[this.type].n++;Game.recalculateGains=1;}
			
			this.init();
			
			Game.shimmersL.appendChild(this.l);
			Game.shimmers.push(this);
			Game.shimmersN++;
		}
		Game.shimmer.prototype.init=function()//executed when the shimmer is created
		{
			Game.shimmerTypes[this.type].initFunc(this);
		}
		Game.shimmer.prototype.update=function()//executed every frame
		{
			Game.shimmerTypes[this.type].updateFunc(this);
		}
		Game.shimmer.prototype.pop=function(event)//executed when the shimmer is popped by the player
		{
			if (event) event.preventDefault();
			Game.Click=0;
			Game.shimmerTypes[this.type].popFunc(this);
		}
		Game.shimmer.prototype.die=function()//executed after the shimmer disappears (from old age or popping)
		{
			if (Game.shimmerTypes[this.type].spawnsOnTimer && this.spawnLead)
			{
				//if this was the spawn lead for this shimmer type, set the shimmer type's "spawned" to 0 and restart its spawn timer
				var type=Game.shimmerTypes[this.type];
				type.time=0;
				type.spawned=0;
				type.minTime=type.getMinTime();
				type.maxTime=type.getMaxTime();
			}
			Game.shimmersL.removeChild(this.l);
			if (Game.shimmers.indexOf(this)!=-1) Game.shimmers.splice(Game.shimmers.indexOf(this),1);
			if (!this.noCount) {Game.shimmerTypes[this.type].n=Math.max(0,Game.shimmerTypes[this.type].n-1);Game.recalculateGains=1;}
		}
		
		
		Game.updateShimmers=function()//run shimmer functions, kill overtimed shimmers and spawn new ones
		{
			for (var i in Game.shimmers)
			{
				Game.shimmers[i].update();
			}
			
			//cookie storm!
			if (Game.hasBuff('Cookie storm') && Math.random()<0.5)
			{
				var newShimmer=new Game.shimmer('golden',0,1);
				newShimmer.dur=Math.ceil(Math.random()*4+1);
				newShimmer.life=Math.ceil(Game.fps*newShimmer.dur);
				newShimmer.force='cookie storm drop';
				newShimmer.sizeMult=Math.random()*0.75+0.25;
			}
			
			//spawn shimmers
			for (var i in Game.shimmerTypes)
			{
				var me=Game.shimmerTypes[i];
				if (me.spawnsOnTimer && me.spawnConditions())//only run on shimmer types that work on a timer
				{
					if (!me.spawned)//no shimmer spawned for this type? check the timer and try to spawn one
					{
						me.time++;
						if (Math.random()<Math.pow(Math.max(0,(me.time-me.minTime)/(me.maxTime-me.minTime)),5))
						{
							var newShimmer=new Game.shimmer(i);
							newShimmer.spawnLead=1;
							if (Game.Has('Distilled essence of redoubled luck') && Math.random()<0.01) var newShimmer=new Game.shimmer(i);
							me.spawned=1;
						}
					}
				}
			}
		}
		Game.killShimmers=function()//stop and delete all shimmers (used on resetting etc)
		{
			for (var i in Game.shimmers)
			{
				Game.shimmers[i].die();
			}
			for (var i in Game.shimmerTypes)
			{
				var me=Game.shimmerTypes[i];
				if (me.reset) me.reset();
				me.n=0;
				if (me.spawnsOnTimer)
				{
					me.time=0;
					me.spawned=0;
					me.minTime=me.getMinTime();
					me.maxTime=me.getMaxTime();
				}
			}
		}
		
		Game.shimmerTypes={
			//in these, "me" refers to the shimmer itself, and "this" to the shimmer's type object
			'golden':{
				reset:function()
				{
					this.chain=0;
					this.totalFromChain=0;
					this.last='';
				},
				initFunc:function(me)
				{
					if (!this.spawned && Game.chimeType==1 && Game.ascensionMode!=1) PlaySound('snd/chime.mp3');
					
					//set image
					var bgPic='img/goldCookie.png';
					var picX=0;var picY=0;
					
					
					if ((!me.forceObj || !me.forceObj.noWrath) && ((me.forceObj && me.forceObj.wrath) || (Game.elderWrath==1 && Math.random()<1/3) || (Game.elderWrath==2 && Math.random()<2/3) || (Game.elderWrath==3) || (Game.hasGod && Game.hasGod('scorn'))))
					{
						me.wrath=1;
						if (Game.season=='halloween') bgPic='img/spookyCookie.png';
						else bgPic='img/wrathCookie.png';
					}
					else
					{
						me.wrath=0;
					}
					
					if (Game.season=='valentines')
					{
						bgPic='img/hearts.png';
						picX=Math.floor(Math.random()*8);
					}
					else if (Game.season=='fools')
					{
						bgPic='img/contract.png';
						if (me.wrath) bgPic='img/wrathContract.png';
					}
					else if (Game.season=='easter')
					{
						bgPic='img/bunnies.png';
						picX=Math.floor(Math.random()*4);
						picY=0;
						if (me.wrath) picY=1;
					}
					
					me.x=Math.floor(Math.random()*Math.max(0,(Game.bounds.right-300)-Game.bounds.left-128)+Game.bounds.left+64)-64;
					me.y=Math.floor(Math.random()*Math.max(0,Game.bounds.bottom-Game.bounds.top-128)+Game.bounds.top+64)-64;
					me.l.style.left=me.x+'px';
					me.l.style.top=me.y+'px';
					me.l.style.width='96px';
					me.l.style.height='96px';
					me.l.style.backgroundImage='url('+bgPic+')';
					me.l.style.backgroundPosition=(-picX*96)+'px '+(-picY*96)+'px';
					me.l.style.opacity='0';
					me.l.style.display='block';
					
					me.life=1;//the cookie's current progression through its lifespan (in frames)
					me.dur=13;//duration; the cookie's lifespan in seconds before it despawns
					
					var dur=13;
					if (Game.Has('Lucky day')) dur*=2;
					if (Game.Has('Serendipity')) dur*=2;
					if (Game.Has('Decisive fate')) dur*=1.05;
					if (Game.Has('Lucky digit')) dur*=1.01;
					if (Game.Has('Lucky number')) dur*=1.01;
					if (Game.Has('Lucky payout')) dur*=1.01;
					if (this.chain>0) dur=Math.max(2,10/this.chain);//this is hilarious
					me.dur=dur;
					me.life=Math.ceil(Game.fps*me.dur);
					me.force='';
					me.sizeMult=1;
				},
				updateFunc:function(me)
				{
					var curve=1-Math.pow((me.life/(Game.fps*me.dur))*2-1,4);
					me.l.style.opacity=curve;
					//this line makes each golden cookie pulse in a unique way
					me.l.style.transform='rotate('+(Math.sin(me.id*0.69)*24+Math.sin(Game.T*(0.35+Math.sin(me.id*0.97)*0.15)+me.id/*+Math.sin(Game.T*0.07)*2+2*/)*(3+Math.sin(me.id*0.36)*2))+'deg) scale('+(me.sizeMult*(1+Math.sin(me.id*0.53)*0.2)*curve*(1+(0.06+Math.sin(me.id*0.41)*0.05)*(Math.sin(Game.T*(0.25+Math.sin(me.id*0.73)*0.15)+me.id))))+')';
					me.life--;
					if (me.life<=0) {this.missFunc(me);me.die();}
				},
				popFunc:function(me)
				{
					//get achievs and stats
					if (me.spawnLead)
					{
						Game.goldenClicks++;
						Game.goldenClicksLocal++;
						
						if (Game.goldenClicks>=1) Game.Win('Golden cookie');
						if (Game.goldenClicks>=7) Game.Win('Lucky cookie');
						if (Game.goldenClicks>=27) Game.Win('A stroke of luck');
						if (Game.goldenClicks>=77) Game.Win('Fortune');
						if (Game.goldenClicks>=777) Game.Win('Leprechaun');
						if (Game.goldenClicks>=7777) Game.Win('Black cat\'s paw');
						
						if (Game.goldenClicks>=7) Game.Unlock('Lucky day');
						if (Game.goldenClicks>=27) Game.Unlock('Serendipity');
						if (Game.goldenClicks>=77) Game.Unlock('Get lucky');
						
						if ((me.life/Game.fps)>(me.dur-1)) Game.Win('Early bird');
						if (me.life<Game.fps) Game.Win('Fading luck');
					}
					
					if (Game.forceUnslotGod)
					{
						if (Game.forceUnslotGod('asceticism')) Game.useSwap(1000000);
					}
					
					//select an effect
					var list=[];
					if (me.wrath>0) list.push('clot','multiply cookies','ruin cookies');
					else list.push('frenzy','multiply cookies');
					if (me.wrath>0 && Game.hasGod && Game.hasGod('scorn')) list.push('clot','ruin cookies','clot','ruin cookies');
					if (me.wrath>0 && Math.random()<0.3) list.push('blood frenzy','chain cookie','cookie storm');
					else if (Math.random()<0.03 && Game.cookiesEarned>=100000) list.push('chain cookie','cookie storm');
					if (Math.random()<0.05 && Game.season=='fools') list.push('everything must go');
					if (Math.random()<0.1 && (Math.random()<0.05 || !Game.hasBuff('Dragonflight'))) list.push('click frenzy');
					if (me.wrath && Math.random()<0.1) list.push('cursed finger');
					
					if (Game.BuildingsOwned>=10 && Math.random()<0.25) list.push('building special');
					
					if (Game.resets>0 && Math.random()<0.0005) list.push('free sugar lump');
					
					if ((me.wrath==0 && Math.random()<0.15) || Math.random()<0.05)
					{
						if (Game.hasAura('Reaper of Fields')) list.push('dragon harvest');
						if (Game.hasAura('Dragonflight')) list.push('dragonflight');
					}
					
					if (this.last!='' && Math.random()<0.8 && list.indexOf(this.last)!=-1) list.splice(list.indexOf(this.last),1);//80% chance to force a different one
					if (Math.random()<0.0001) list.push('blab');
					var choice=choose(list);
					
					if (this.chain>0) choice='chain cookie';
					if (me.force!='') {this.chain=0;choice=me.force;me.force='';}
					if (choice!='chain cookie') this.chain=0;
					
					this.last=choice;
					
					//create buff for effect
					var effectDurMod=1;
					if (Game.Has('Get lucky')) effectDurMod*=2;
					if (Game.Has('Lasting fortune')) effectDurMod*=1.1;
					if (Game.Has('Lucky digit')) effectDurMod*=1.01;
					if (Game.Has('Lucky number')) effectDurMod*=1.01;
					if (Game.Has('Lucky payout')) effectDurMod*=1.01;
					if (Game.hasAura('Epoch Manipulator')) effectDurMod*=1.05;
					
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('decadence');
						if (godLvl==1) effectDurMod*=1.07;
						else if (godLvl==2) effectDurMod*=1.05;
						else if (godLvl==3) effectDurMod*=1.02;
					}
					
					var mult=1;
					if (me.wrath>0 && Game.hasAura('Unholy Dominion')) mult*=1.1;
					else if (me.wrath==0 && Game.hasAura('Ancestral Metamorphosis')) mult*=1.1;
					
					var popup='';
					var buff=0;
					
					if (choice=='building special')
					{
						var time=Math.ceil(30*effectDurMod);
						var list=[];
						for (var i in Game.Objects)
						{
							if (Game.Objects[i].amount>=10) list.push(Game.Objects[i].id);
						}
						if (list.length==0) {choice='frenzy';}//default to frenzy if no proper building
						else
						{
							var obj=choose(list);
							var pow=Game.ObjectsById[obj].amount/10+1;
							if (me.wrath && Math.random()<0.3)
							{
								buff=Game.gainBuff('building debuff',time,pow,obj);
							}
							else
							{
								buff=Game.gainBuff('building buff',time,pow,obj);
							}
						}
					}
					
					if (choice=='free sugar lump')
					{
						Game.gainLumps(1);
						popup='Sweet!<div style="font-size:65%;">Found 1 sugar lump!</div>';
					}
					else if (choice=='frenzy')
					{
						buff=Game.gainBuff('frenzy',Math.ceil(77*effectDurMod),7);
					}
					else if (choice=='dragon harvest')
					{
						buff=Game.gainBuff('dragon harvest',Math.ceil(60*effectDurMod),15);
					}
					else if (choice=='everything must go')
					{
						buff=Game.gainBuff('everything must go',Math.ceil(8*effectDurMod),5);
					}
					else if (choice=='multiply cookies')
					{
						var moni=mult*Math.min(Game.cookies*0.15,Game.cookiesPs*60*15)+13;//add 15% to cookies owned (+13), or 15 minutes of cookie production - whichever is lowest
						Game.Earn(moni);
						popup='Lucky!<div style="font-size:65%;">+'+Beautify(moni)+' cookies!</div>';
					}
					else if (choice=='ruin cookies')
					{
						var moni=Math.min(Game.cookies*0.05,Game.cookiesPs*60*10)+13;//lose 5% of cookies owned (-13), or 10 minutes of cookie production - whichever is lowest
						moni=Math.min(Game.cookies,moni);
						Game.Spend(moni);
						popup='Ruin!<div style="font-size:65%;">Lost '+Beautify(moni)+' cookies!</div>';
					}
					else if (choice=='blood frenzy')
					{
						buff=Game.gainBuff('blood frenzy',Math.ceil(6*effectDurMod),666);
					}
					else if (choice=='clot')
					{
						buff=Game.gainBuff('clot',Math.ceil(66*effectDurMod),0.5);
					}
					else if (choice=='cursed finger')
					{
						buff=Game.gainBuff('cursed finger',Math.ceil(10*effectDurMod),Game.cookiesPs*Math.ceil(10*effectDurMod));
					}
					else if (choice=='click frenzy')
					{
						buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),777);
					}
					else if (choice=='dragonflight')
					{
						buff=Game.gainBuff('dragonflight',Math.ceil(10*effectDurMod),1111);
						if (Math.random()<0.8) Game.killBuff('Click frenzy');
					}
					else if (choice=='chain cookie')
					{
						//fix by Icehawk78
						if (this.chain==0) this.totalFromChain=0;
						this.chain++;
						var digit=me.wrath?6:7;
						if (this.chain==1) this.chain+=Math.max(0,Math.ceil(Math.log(Game.cookies)/Math.LN10)-10);
						
						var maxPayout=Math.min(Game.cookiesPs*60*60*6,Game.cookies*0.25)*mult;
						var moni=Math.max(digit,Math.min(Math.floor(1/9*Math.pow(10,this.chain)*digit*mult),maxPayout));
						var nextMoni=Math.max(digit,Math.min(Math.floor(1/9*Math.pow(10,this.chain+1)*digit*mult),maxPayout));
						this.totalFromChain+=moni;
						var moniStr=Beautify(moni);

						//break the chain if we're above 5 digits AND it's more than 25% of our bank, it grants more than 6 hours of our CpS, or just a 1% chance each digit (update : removed digit limit)
						if (Math.random()<0.01 || nextMoni>=maxPayout)
						{
							this.chain=0;
							popup='Cookie chain<div style="font-size:65%;">+'+moniStr+' cookies!<br>Cookie chain over. You made '+Beautify(this.totalFromChain)+' cookies.</div>';
						}
						else
						{
							popup='Cookie chain<div style="font-size:65%;">+'+moniStr+' cookies!</div>';//
						}
						Game.Earn(moni);
					}
					else if (choice=='cookie storm')
					{
						buff=Game.gainBuff('cookie storm',Math.ceil(7*effectDurMod),7);
					}
					else if (choice=='cookie storm drop')
					{
						var moni=Math.max(mult*(Game.cookiesPs*60*Math.floor(Math.random()*7+1)),Math.floor(Math.random()*7+1));//either 1-7 cookies or 1-7 minutes of cookie production, whichever is highest
						Game.Earn(moni);
						popup='<div style="font-size:75%;">+'+Beautify(moni)+' cookies!</div>';
					}
					else if (choice=='blab')//sorry (it's really rare)
					{
						var str=choose([
						'Cookie crumbliness x3 for 60 seconds!',
						'Chocolatiness x7 for 77 seconds!',
						'Dough elasticity halved for 66 seconds!',
						'Golden cookie shininess doubled for 3 seconds!',
						'World economy halved for 30 seconds!',
						'Grandma kisses 23% stingier for 45 seconds!',
						'Thanks for clicking!',
						'Fooled you! This one was just a test.',
						'Golden cookies clicked +1!',
						'Your click has been registered. Thank you for your cooperation.',
						'Thanks! That hit the spot!',
						'Thank you. A team has been dispatched.',
						'They know.',
						'Oops. This was just a chocolate cookie with shiny aluminium foil.'
						]);
						popup=str;
					}
					
					if (popup=='' && buff && buff.name && buff.desc) popup=buff.name+'<div style="font-size:65%;">'+buff.desc+'</div>';
					if (popup!='') Game.Popup(popup,me.x+me.l.offsetWidth/2,me.y);
					
					Game.DropEgg(0.9);
					
					//sparkle and kill the shimmer
					Game.SparkleAt(me.x+48,me.y+48);
					if (choice=='cookie storm drop')
					{
						if (Game.prefs.cookiesound) PlaySound('snd/clickb'+Math.floor(Math.random()*7+1)+'.mp3',0.75);
						else PlaySound('snd/click'+Math.floor(Math.random()*7+1)+'.mp3',0.75);
					}
					else PlaySound('snd/shimmerClick.mp3');
					me.die();
				},
				missFunc:function(me)
				{
					if (this.chain>0 && this.totalFromChain>0)
					{
						Game.Popup('Cookie chain broken.<div style="font-size:65%;">You made '+Beautify(this.totalFromChain)+' cookies.</div>',me.x+me.l.offsetWidth/2,me.y);
						this.chain=0;this.totalFromChain=0;
					}
					if (me.spawnLead) Game.missedGoldenClicks++;
				},
				spawnsOnTimer:true,
				spawnConditions:function()
				{
					if (!Game.Has('Golden switch [off]')) return true; else return false;
				},
				spawned:0,
				time:0,
				minTime:0,
				maxTime:0,
				getTimeMod:function(m)
				{
					if (Game.Has('Lucky day')) m/=2;
					if (Game.Has('Serendipity')) m/=2;
					if (Game.Has('Golden goose egg')) m*=0.95;
					if (Game.Has('Heavenly luck')) m*=0.95;
					if (Game.hasAura('Arcane Aura')) m*=0.95;
					if (Game.hasBuff('Sugar blessing')) m*=0.9;
					if (Game.season=='easter' && Game.Has('Starspawn')) m*=0.98;
					else if (Game.season=='halloween' && Game.Has('Starterror')) m*=0.98;
					else if (Game.season=='valentines' && Game.Has('Starlove')) m*=0.98;
					else if (Game.season=='fools' && Game.Has('Startrade')) m*=0.95;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('industry');
						if (godLvl==1) m*=1.1;
						else if (godLvl==2) m*=1.06;
						else if (godLvl==3) m*=1.03;
						var godLvl=Game.hasGod('mother');
						if (godLvl==1) m*=1.15;
						else if (godLvl==2) m*=1.1;
						else if (godLvl==3) m*=1.05;
						
						if (Game.season!='')
						{
							var godLvl=Game.hasGod('seasons');
							if (Game.season!='fools')
							{
								if (godLvl==1) m*=0.97;
								else if (godLvl==2) m*=0.98;
								else if (godLvl==3) m*=0.99;
							}
							else
							{
								if (godLvl==1) m*=0.955;
								else if (godLvl==2) m*=0.97;
								else if (godLvl==3) m*=0.985;
							}
						}
					}
					if (this.chain>0) m=0.05;
					if (Game.Has('Gold hoard')) m=0.01;
					return Math.ceil(Game.fps*60*m);
				},
				getMinTime:function()
				{
					var m=5;
					return this.getTimeMod(m);
				},
				getMaxTime:function()
				{
					var m=15;
					return this.getTimeMod(m);
				},
				last:'',
			},
			'reindeer':{
				reset:function()
				{
				},
				initFunc:function(me)
				{
					if (!this.spawned && Game.chimeType==1 && Game.ascensionMode!=1) PlaySound('snd/jingle.mp3');
					
					me.x=-128;
					me.y=Math.floor(Math.random()*Math.max(0,Game.bounds.bottom-Game.bounds.top-256)+Game.bounds.top+128)-128;
					//me.l.style.left=me.x+'px';
					//me.l.style.top=me.y+'px';
					me.l.style.width='167px';
					me.l.style.height='212px';
					me.l.style.backgroundImage='url(img/frostedReindeer.png)';
					me.l.style.opacity='0';
					//me.l.style.transform='rotate('+(Math.random()*60-30)+'deg) scale('+(Math.random()*1+0.25)+')';
					me.l.style.display='block';
					
					me.life=1;//the reindeer's current progression through its lifespan (in frames)
					me.dur=4;//duration; the cookie's lifespan in seconds before it despawns
					
					var dur=4;
					if (Game.Has('Weighted sleighs')) dur*=2;
					me.dur=dur;
					me.life=Math.ceil(Game.fps*me.dur);
					me.sizeMult=1;
				},
				updateFunc:function(me)
				{
					var curve=1-Math.pow((me.life/(Game.fps*me.dur))*2-1,12);
					me.l.style.opacity=curve;
					me.l.style.transform='translate('+(me.x+(Game.bounds.right-Game.bounds.left)*(1-me.life/(Game.fps*me.dur)))+'px,'+(me.y-Math.abs(Math.sin(me.life*0.1))*128)+'px) rotate('+(Math.sin(me.life*0.2+0.3)*10)+'deg) scale('+(me.sizeMult*(1+Math.sin(me.id*0.53)*0.1))+')';
					me.life--;
					if (me.life<=0) {this.missFunc(me);me.die();}
				},
				popFunc:function(me)
				{
					//get achievs and stats
					if (me.spawnLead)
					{
						Game.reindeerClicked++;
					}
					
					var val=Game.cookiesPs*60;
					if (Game.hasBuff('Elder frenzy')) val*=0.5;//very sorry
					if (Game.hasBuff('Frenzy')) val*=0.75;//I sincerely apologize
					var moni=Math.max(25,val);//1 minute of cookie production, or 25 cookies - whichever is highest
					if (Game.Has('Ho ho ho-flavored frosting')) moni*=2;
					Game.Earn(moni);
					if (Game.hasBuff('Elder frenzy')) Game.Win('Eldeer');
					
					var failRate=0.8;
					var cookie='';
					if (Game.HasAchiev('Let it snow')) failRate=0.6;
					if (Game.Has('Santa\'s bottomless bag')) failRate*=0.9;
					if (Game.hasAura('Mind Over Matter')) failRate*=0.75;
					if (Game.Has('Starsnow')) failRate*=0.95;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('seasons');
						if (godLvl==1) failRate*=0.9;
						else if (godLvl==2) failRate*=0.95;
						else if (godLvl==3) failRate*=0.97;
					}
					if (Math.random()>failRate)//christmas cookie drops
					{
						cookie=choose(['Christmas tree biscuits','Snowflake biscuits','Snowman biscuits','Holly biscuits','Candy cane biscuits','Bell biscuits','Present biscuits']);
						if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
						{
							Game.Unlock(cookie);
						}
						else cookie='';
					}
					
					var popup='';
					
					if (Game.prefs.popups) Game.Popup('You found '+choose(['Dasher','Dancer','Prancer','Vixen','Comet','Cupid','Donner','Blitzen','Rudolph'])+'!<br>The reindeer gives you '+Beautify(moni)+' cookies.'+(cookie==''?'':'<br>You are also rewarded with '+cookie+'!'));
					else Game.Notify('You found '+choose(['Dasher','Dancer','Prancer','Vixen','Comet','Cupid','Donner','Blitzen','Rudolph'])+'!','The reindeer gives you '+Beautify(moni)+' cookies.'+(cookie==''?'':'<br>You are also rewarded with '+cookie+'!'),[12,9],6);
					popup='<div style="font-size:80%;">+'+Beautify(moni)+' cookies!</div>';
					
					if (popup!='') Game.Popup(popup,Game.mouseX,Game.mouseY);
					
					//sparkle and kill the shimmer
					Game.SparkleAt(Game.mouseX,Game.mouseY);
					PlaySound('snd/jingleClick.mp3');
					me.die();
				},
				missFunc:function(me)
				{
				},
				spawnsOnTimer:true,
				spawnConditions:function()
				{
					if (Game.season=='christmas') return true; else return false;
				},
				spawned:0,
				time:0,
				minTime:0,
				maxTime:0,
				getTimeMod:function(m)
				{
					if (Game.Has('Reindeer baking grounds')) m/=2;
					if (Game.Has('Starsnow')) m*=0.95;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('seasons');
						if (godLvl==1) m*=0.9;
						else if (godLvl==2) m*=0.95;
						else if (godLvl==3) m*=0.97;
					}
					if (Game.Has('Reindeer season')) m=0.01;
					return Math.ceil(Game.fps*60*m);
				},
				getMinTime:function()
				{
					var m=3;
					return this.getTimeMod(m);
				},
				getMaxTime:function()
				{
					var m=6;
					return this.getTimeMod(m);
				},
			}
		};
		
		Game.goldenCookieChoices=[
			"Frenzy","frenzy",
			"Lucky","multiply cookies",
			"Ruin","ruin cookies",
			"Elder frenzy","blood frenzy",
			"Clot","clot",
			"Click frenzy","click frenzy",
			"Cursed finger","cursed finger",
			"Cookie chain","chain cookie",
			"Cookie storm","cookie storm",
			"Building special","building special",
			"Dragon Harvest","dragon harvest",
			"Dragonflight","dragonflight",
			"Sweet","free sugar lump",
			"Blab","blab"
		];
		Game.goldenCookieBuildingBuffs={
			'Cursor':['High-five','Slap to the face'],
			'Grandma':['Congregation','Senility'],
			'Farm':['Luxuriant harvest','Locusts'],
			'Mine':['Ore vein','Cave-in'],
			'Factory':['Oiled-up','Jammed machinery'],
			'Bank':['Juicy profits','Recession'],
			'Temple':['Fervent adoration','Crisis of faith'],
			'Wizard tower':['Manabloom','Magivores'],
			'Shipment':['Delicious lifeforms','Black holes'],
			'Alchemy lab':['Breakthrough','Lab disaster'],
			'Portal':['Righteous cataclysm','Dimensional calamity'],
			'Time machine':['Golden ages','Time jam'],
			'Antimatter condenser':['Extra cycles','Predictable tragedy'],
			'Prism':['Solar flare','Eclipse'],
			'Chancemaker':['Winning streak','Dry spell'],
		};
		
		/*=====================================================================================
		PARTICLES
		=======================================================================================*/
		//generic particles (falling cookies etc)
		//only displayed on left section
		Game.particles=[];
		for (var i=0;i<50;i++)
		{
			Game.particles[i]={x:0,y:0,xd:0,yd:0,w:64,h:64,z:0,size:1,dur:2,life:-1,r:0,pic:'smallCookies.png',picId:0};
		}
		
		Game.particlesUpdate=function()
		{
			for (var i in Game.particles)
			{
				var me=Game.particles[i];
				if (me.life!=-1)
				{
					if (!me.text) me.yd+=0.2+Math.random()*0.1;
					me.x+=me.xd;
					me.y+=me.yd;
					//me.y+=me.life*0.25+Math.random()*0.25;
					me.life++;
					if (me.life>=Game.fps*me.dur)
					{
						me.life=-1;
					}
				}
			}
		}
		Game.particleAdd=function(x,y,xd,yd,size,dur,z,pic,text)
		{
			//Game.particleAdd(pos X,pos Y,speed X,speed Y,size (multiplier),duration (seconds),layer,picture,text);
			//pick the first free (or the oldest) particle to replace it
			if (1 || Game.prefs.particles)
			{
				var highest=0;
				var highestI=0;
				for (var i in Game.particles)
				{
					if (Game.particles[i].life==-1) {highestI=i;break;}
					if (Game.particles[i].life>highest)
					{
						highest=Game.particles[i].life;
						highestI=i;
					}
				}
				var auto=0;
				if (x) auto=1;
				var i=highestI;
				var x=x||-64;
				if (Game.LeftBackground && !auto) x=Math.floor(Math.random()*Game.LeftBackground.canvas.width);
				var y=y||-64;
				var me=Game.particles[i];
				me.life=0;
				me.x=x;
				me.y=y;
				me.xd=xd||0;
				me.yd=yd||0;
				me.size=size||1;
				me.z=z||0;
				me.dur=dur||2;
				me.r=Math.floor(Math.random()*360);
				me.picId=Math.floor(Math.random()*10000);
				if (!pic)
				{
					if (Game.season=='fools') pic='smallDollars.png';
					else
					{
						var cookies=[[10,0]];
						for (var i in Game.Upgrades)
						{
							var cookie=Game.Upgrades[i];
							if (cookie.bought>0 && cookie.pool=='cookie') cookies.push(cookie.icon);
						}
						me.picPos=choose(cookies);
						pic='icons.png';
					}
				}
				me.pic=pic||'smallCookies.png';
				me.text=text||0;
				return me;
			}
			return {};
		}
		Game.particlesDraw=function(z)
		{
			Game.LeftBackground.fillStyle='#fff';
			Game.LeftBackground.font='20px Merriweather';
			Game.LeftBackground.textAlign='center';
			
			for (var i in Game.particles)
			{
				var me=Game.particles[i];
				if (me.z==z)
				{
					if (me.life!=-1)
					{
						var opacity=1-(me.life/(Game.fps*me.dur));
						Game.LeftBackground.globalAlpha=opacity;
						if (me.text)
						{
							Game.LeftBackground.fillText(me.text,me.x,me.y);
						}
						else
						{
							Game.LeftBackground.save();
							Game.LeftBackground.translate(me.x,me.y);
							Game.LeftBackground.rotate((me.r/360)*Math.PI*2);
							var w=64;
							var h=64;
							if (me.pic=='icons.png')
							{
								w=48;
								h=48;
								Game.LeftBackground.drawImage(Pic(me.pic),me.picPos[0]*w,me.picPos[1]*h,w,h,-w/2*me.size,-h/2*me.size,w*me.size,h*me.size);
							}
							else
							{
								if (me.pic=='wrinklerBits.png' || me.pic=='shinyWrinklerBits.png') {w=100;h=200;}
								Game.LeftBackground.drawImage(Pic(me.pic),(me.picId%8)*w,0,w,h,-w/2*me.size,-h/2*me.size,w*me.size,h*me.size);
							}
							Game.LeftBackground.restore();
						}
					}
				}
			}
		}
		
		//text particles (popups etc)
		Game.textParticles=[];
		Game.textParticlesY=0;
		var str='';
		for (var i=0;i<20;i++)
		{
			Game.textParticles[i]={x:0,y:0,life:-1,text:''};
			str+='<div id="particle'+i+'" class="particle title"></div>';
		}
		l('particles').innerHTML=str;
		Game.textParticlesUpdate=function()
		{
			for (var i in Game.textParticles)
			{
				var me=Game.textParticles[i];
				if (me.life!=-1)
				{
					me.life++;
					if (me.life>=Game.fps*4)
					{
						var el=me.l;
						me.life=-1;
						el.style.opacity=0;
						el.style.display='none';
					}
				}
			}
		}
		Game.textParticlesAdd=function(text,el,posX,posY)
		{
			//pick the first free (or the oldest) particle to replace it
			var highest=0;
			var highestI=0;
			for (var i in Game.textParticles)
			{
				if (Game.textParticles[i].life==-1) {highestI=i;break;}
				if (Game.textParticles[i].life>highest)
				{
					highest=Game.textParticles[i].life;
					highestI=i;
				}
			}
			var i=highestI;
			var noStack=0;
			if (typeof posX!=='undefined' && typeof posY!=='undefined')
			{
				x=posX;
				y=posY;
				noStack=1;
			}
			else
			{
				var x=(Math.random()-0.5)*40;
				var y=0;//+(Math.random()-0.5)*40;
				if (!el)
				{
					var rect=Game.bounds;
					var x=Math.floor((rect.left+rect.right)/2);
					var y=Math.floor((rect.bottom))-(Game.mobile*64);
					x+=(Math.random()-0.5)*40;
					y+=0;//(Math.random()-0.5)*40;
				}
			}
			if (!noStack) y-=Game.textParticlesY;
			
			x=Math.max(Game.bounds.left+200,x);
			x=Math.min(Game.bounds.right-200,x);
			y=Math.max(Game.bounds.top+32,y);
			
			var me=Game.textParticles[i];
			if (!me.l) me.l=l('particle'+i);
			me.life=0;
			me.x=x;
			me.y=y;
			me.text=text;
			me.l.innerHTML=text;
			me.l.style.left=Math.floor(Game.textParticles[i].x-200)+'px';
			me.l.style.bottom=Math.floor(-Game.textParticles[i].y)+'px';
			for (var ii in Game.textParticles)
			{if (ii!=i) (Game.textParticles[ii].l||l('particle'+ii)).style.zIndex=100000000;}
			me.l.style.zIndex=100000001;
			me.l.style.display='block';
			me.l.className='particle title';
			me.l.offsetWidth=me.l.offsetWidth;
			me.l.className='particle title risingUpLinger';
			if (!noStack) Game.textParticlesY+=60;
		}
		Game.popups=1;
		Game.Popup=function(text,x,y)
		{
			if (Game.popups) Game.textParticlesAdd(text,0,x,y);
		}
		
		//display sparkles at a set position
		Game.sparkles=l('sparkles');
		Game.sparklesT=0;
		Game.sparklesFrames=16;
		Game.SparkleAt=function(x,y)
		{
			if (Game.blendModesOn)
			{
				Game.sparklesT=Game.sparklesFrames+1;
				Game.sparkles.style.backgroundPosition='0px 0px';
				Game.sparkles.style.left=Math.floor(x-64)+'px';
				Game.sparkles.style.top=Math.floor(y-64)+'px';
				Game.sparkles.style.display='block';
			}
		}
		
		/*=====================================================================================
		NOTIFICATIONS
		=======================================================================================*/
		//maybe do all this mess with proper DOM instead of rewriting the innerHTML
		Game.Notes=[];
		Game.NotesById=[];
		Game.noteId=0;
		Game.noteL=l('notes');
		Game.Note=function(title,desc,pic,quick)
		{
			this.title=title;
			this.desc=desc||'';
			this.pic=pic||'';
			this.id=Game.noteId;
			this.date=Date.now();
			this.quick=quick||0;
			this.life=(this.quick||1)*Game.fps;
			this.l=0;
			this.height=0;
			Game.noteId++;
			Game.NotesById[this.id]=this;
			Game.Notes.unshift(this);
			if (Game.Notes.length>50) Game.Notes.pop();
			//Game.Notes.push(this);
			//if (Game.Notes.length>50) Game.Notes.shift();
			Game.UpdateNotes();
		}
		Game.CloseNote=function(id)
		{
			var me=Game.NotesById[id];
			Game.Notes.splice(Game.Notes.indexOf(me),1);
			//Game.NotesById.splice(Game.NotesById.indexOf(me),1);
			Game.NotesById[id]=null;
			Game.UpdateNotes();
		}
		Game.CloseNotes=function()
		{
			Game.Notes=[];
			Game.NotesById=[];
			Game.UpdateNotes();
		}
		Game.UpdateNotes=function()
		{
			var str='';
			var remaining=Game.Notes.length;
			for (var i in Game.Notes)
			{
				if (i<5)
				{
					var me=Game.Notes[i];
					var pic='';
					if (me.pic!='') pic='<div class="icon" style="'+(me.pic[2]?'background-image:url('+me.pic[2]+');':'')+'background-position:'+(-me.pic[0]*48)+'px '+(-me.pic[1]*48)+'px;"></div>';
					str='<div id="note-'+me.id+'" class="framed note '+(me.pic!=''?'haspic':'nopic')+' '+(me.desc!=''?'hasdesc':'nodesc')+'"><div class="close" onclick="PlaySound(\'snd/tick.mp3\');Game.CloseNote('+me.id+');">x</div>'+pic+'<div class="text"><h3>'+me.title+'</h3>'+(me.desc!=''?'<div class="line"></div><h5>'+me.desc+'</h5>':'')+'</div></div>'+str;
					remaining--;
				}
			}
			if (remaining>0) str='<div class="remaining">+'+remaining+' more notification'+(remaining==1?'':'s')+'.</div>'+str;
			if (Game.Notes.length>1)
			{
				str+='<div class="framed close sidenote" onclick="PlaySound(\'snd/tick.mp3\');Game.CloseNotes();">x</div>';
			}
			Game.noteL.innerHTML=str;
			for (var i in Game.Notes)
			{
				me.l=0;
				if (i<5)
				{
					var me=Game.Notes[i];
					me.l=l('note-'+me.id);
				}
			}
		}
		Game.NotesLogic=function()
		{
			for (var i in Game.Notes)
			{
				if (Game.Notes[i].quick>0)
				{
					var me=Game.Notes[i];
					me.life--;
					if (me.life<=0) Game.CloseNote(me.id);
				}
			}
		}
		Game.NotesDraw=function()
		{
			for (var i in Game.Notes)
			{
				if (Game.Notes[i].quick>0)
				{
					var me=Game.Notes[i];
					if (me.l)
					{
						if (me.life<10)
						{
							me.l.style.opacity=(me.life/10);
						}
					}
				}
			}
		}
		Game.Notify=function(title,desc,pic,quick,noLog)
		{
			if (Game.prefs.notifs)
			{
				quick=Math.min(6,quick);
				if (!quick) quick=6;
			}
			desc=replaceAll('==CLOSETHIS()==','Game.CloseNote('+Game.noteId+');',desc);
			if (Game.popups) new Game.Note(title,desc,pic,quick);
			if (!noLog) Game.AddToLog('<b>'+title+'</b> | '+desc);
		}
		
		
		/*=====================================================================================
		PROMPT
		=======================================================================================*/
		Game.darkenL=l('darken');
		AddEvent(Game.darkenL,'click',function(){Game.Click=0;Game.ClosePrompt();});
		Game.promptL=l('promptContent');
		Game.promptAnchorL=l('promptAnchor');
		Game.promptWrapL=l('prompt');
		Game.promptConfirm='';
		Game.promptOn=0;
		Game.promptUpdateFunc=0;
		Game.UpdatePrompt=function()
		{
			if (Game.promptUpdateFunc) Game.promptUpdateFunc();
			Game.promptAnchorL.style.top=Math.floor((Game.windowH-Game.promptWrapL.offsetHeight)/2-16)+'px';
		}
		Game.Prompt=function(content,options,updateFunc,style)
		{
			if (updateFunc) Game.promptUpdateFunc=updateFunc;
			if (style) Game.promptWrapL.className='framed '+style; else Game.promptWrapL.className='framed';
			var str='';
			str+=content;
			var opts='';
			for (var i in options)
			{
				if (options[i]=='br')//just a linebreak
				{opts+='<br>';}
				else
				{
					if (typeof options[i]=='string') options[i]=[options[i],'Game.ClosePrompt();'];
					options[i][1]=options[i][1].replace(/'/g,'&#39;').replace(/"/g,'&#34;');
					opts+='<a id="promptOption'+i+'" class="option" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');'+options[i][1]+'">'+options[i][0]+'</a>';
				}
			}
			Game.promptL.innerHTML=str+'<div class="optionBox">'+opts+'</div>';
			Game.promptAnchorL.style.display='block';
			Game.darkenL.style.display='block';
			Game.promptL.focus();
			Game.promptOn=1;
			Game.UpdatePrompt();
		}
		Game.ClosePrompt=function()
		{
			Game.promptAnchorL.style.display='none';
			Game.darkenL.style.display='none';
			Game.promptOn=0;
			Game.promptUpdateFunc=0;
		}
		Game.ConfirmPrompt=function()
		{
			if (Game.promptOn && l('promptOption0') && l('promptOption0').style.display!='none') FireEvent(l('promptOption0'),'click');
		}
		
		/*=====================================================================================
		MENUS
		=======================================================================================*/
		Game.cssClasses=[];
		Game.addClass=function(what) {if (Game.cssClasses.indexOf(what)==-1) Game.cssClasses.push(what);Game.updateClasses();}
		Game.removeClass=function(what) {var i=Game.cssClasses.indexOf(what);if(i!=-1) {Game.cssClasses.splice(i,1);}Game.updateClasses();}
		Game.updateClasses=function() {Game.l.className=Game.cssClasses.join(' ');}
		
		Game.WriteButton=function(prefName,button,on,off,callback,invert)
		{
			var invert=invert?1:0;
			if (!callback) callback='';
			callback+='PlaySound(\'snd/tick.mp3\');';
			return '<a class="option'+((Game.prefs[prefName]^invert)?'':' off')+'" id="'+button+'" '+Game.clickStr+'="Game.Toggle(\''+prefName+'\',\''+button+'\',\''+on+'\',\''+off+'\',\''+invert+'\');'+callback+'">'+(Game.prefs[prefName]?on:off)+'</a>';
		}
		Game.Toggle=function(prefName,button,on,off,invert)
		{
			if (Game.prefs[prefName])
			{
				l(button).innerHTML=off;
				Game.prefs[prefName]=0;
			}
			else
			{
				l(button).innerHTML=on;
				Game.prefs[prefName]=1;
			}
			l(button).className='option'+((Game.prefs[prefName]^invert)?'':' off');
			
		}
		Game.ToggleFancy=function()
		{
			if (Game.prefs.fancy) Game.removeClass('noFancy');
			else if (!Game.prefs.fancy) Game.addClass('noFancy');
		}
		Game.ToggleFilters=function()
		{
			if (Game.prefs.filters) Game.removeClass('noFilters');
			else if (!Game.prefs.filters) Game.addClass('noFilters');
		}
		
		Game.WriteSlider=function(slider,leftText,rightText,startValueFunction,callback)
		{
			if (!callback) callback='';
			return '<div class="sliderBox"><div style="float:left;">'+leftText+'</div><div style="float:right;" id="'+slider+'RightText">'+rightText.replace('[$]',startValueFunction())+'</div><input class="slider" style="clear:both;" type="range" min="0" max="100" step="1" value="'+startValueFunction()+'" onchange="'+callback+'" oninput="'+callback+'" onmouseup="PlaySound(\'snd/tick.mp3\');" id="'+slider+'"/></div>';
		}
		
		Game.onPanel='Left';
		Game.addClass('focus'+Game.onPanel);
		Game.ShowPanel=function(what)
		{
			if (!what) what='';
			if (Game.onPanel!=what)
			{
				Game.removeClass('focus'+Game.onPanel);
				Game.addClass('focus'+what);
			}
			Game.onPanel=what;
		}
		
		Game.onMenu='';
		Game.ShowMenu=function(what)
		{
			if (!what || what=='') what=Game.onMenu;
			if (Game.onMenu=='' && what!='') Game.addClass('onMenu');
			else if (Game.onMenu!='' && what!=Game.onMenu) Game.addClass('onMenu');
			else if (what==Game.onMenu) {Game.removeClass('onMenu');what='';}
			if (what=='log') l('donateBox').className='on'; else l('donateBox').className='';
			Game.onMenu=what;
			
			l('prefsButton').className=(Game.onMenu=='prefs')?'button selected':'button';
			l('statsButton').className=(Game.onMenu=='stats')?'button selected':'button';
			l('logButton').className=(Game.onMenu=='log')?'button selected':'button';
			
			if (Game.onMenu=='') PlaySound('snd/clickOff.mp3');
			else PlaySound('snd/clickOn.mp3');
			
			Game.UpdateMenu();
		}
		Game.sayTime=function(time,detail)
		{
			//time is a value where one second is equal to Game.fps (30).
			//detail skips days when >1, hours when >2, minutes when >3 and seconds when >4.
			//if detail is -1, output something like "3 hours, 9 minutes, 48 seconds"
			if (time<=0) return '';
			var str='';
			var detail=detail||0;
			time=Math.floor(time);
			if (detail==-1)
			{
				var days=0;
				var hours=0;
				var minutes=0;
				var seconds=0;
				if (time>=Game.fps*60*60*24) days=(Math.floor(time/(Game.fps*60*60*24)));
				if (time>=Game.fps*60*60) hours=(Math.floor(time/(Game.fps*60*60)));
				if (time>=Game.fps*60) minutes=(Math.floor(time/(Game.fps*60)));
				if (time>=Game.fps) seconds=(Math.floor(time/(Game.fps)));
				hours-=days*24;
				minutes-=hours*60+days*24*60;
				seconds-=minutes*60+hours*60*60+days*24*60*60;
				if (days>10) {hours=0;}
				if (days) {minutes=0;seconds=0;}
				if (hours) {seconds=0;}
				var bits=[];
				if (days>0) bits.push(Beautify(days)+' day'+(days==1?'':'s'));
				if (hours>0) bits.push(Beautify(hours)+' hour'+(hours==1?'':'s'));
				if (minutes>0) bits.push(Beautify(minutes)+' minute'+(minutes==1?'':'s'));
				if (seconds>0) bits.push(Beautify(seconds)+' second'+(seconds==1?'':'s'));
				if (bits.length==0) str='less than 1 second';
				else str=bits.join(', ');
			}
			else
			{
				if (time>=Game.fps*60*60*24*2 && detail<2) str=Beautify(Math.floor(time/(Game.fps*60*60*24)))+' days';
				else if (time>=Game.fps*60*60*24 && detail<2) str='1 day';
				else if (time>=Game.fps*60*60*2 && detail<3) str=Beautify(Math.floor(time/(Game.fps*60*60)))+' hours';
				else if (time>=Game.fps*60*60 && detail<3) str='1 hour';
				else if (time>=Game.fps*60*2 && detail<4) str=Beautify(Math.floor(time/(Game.fps*60)))+' minutes';
				else if (time>=Game.fps*60 && detail<4) str='1 minute';
				else if (time>=Game.fps*2 && detail<5) str=Beautify(Math.floor(time/(Game.fps)))+' seconds';
				else if (time>=Game.fps && detail<5) str='1 second';
				else str='less than 1 second';
			}
			return str;
		}
		
		Game.tinyCookie=function()
		{
			if (!Game.HasAchiev('Tiny cookie'))
			{
				return '<div class="tinyCookie" '+Game.clickStr+'="Game.ClickTinyCookie();"></div>';
			}
			return '';
		}
		Game.ClickTinyCookie=function(){if (!Game.HasAchiev('Tiny cookie')){PlaySound('snd/tick.mp3');Game.Win('Tiny cookie');}}
		
		Game.setVolume=function(what)
		{
			Game.volume=what;
			/*for (var i in Sounds)
			{
				Sounds[i].volume=Game.volume;
			}*/
		}
		
		Game.UpdateMenu=function()
		{
			var str='';
			if (Game.onMenu!='')
			{
				str+='<div class="close menuClose" '+Game.clickStr+'="Game.ShowMenu();">x</div>';
				//str+='<div style="position:absolute;top:8px;right:8px;cursor:pointer;font-size:16px;" '+Game.clickStr+'="Game.ShowMenu();">X</div>';
			}
			if (Game.onMenu=='prefs')
			{
				str+='<div class="section">Options</div>'+
				'<div class="subsection">'+
				'<div class="title">General</div>'+
				'<div class="listing"><a class="option" '+Game.clickStr+'="Game.WriteSave();PlaySound(\'snd/tick.mp3\');">Save</a><label>Save manually (the game autosaves every 60 seconds; shortcut : ctrl+S)</label></div>'+
				'<div class="listing"><a class="option" '+Game.clickStr+'="Game.ExportSave();PlaySound(\'snd/tick.mp3\');">Export save</a><a class="option" '+Game.clickStr+'="Game.ImportSave();PlaySound(\'snd/tick.mp3\');">Import save</a><label>You can use this to backup your save or to transfer it to another computer (shortcut for import : ctrl+O)</label></div>'+
				'<div class="listing"><a class="option" '+Game.clickStr+'="Game.FileSave();PlaySound(\'snd/tick.mp3\');">Save to file</a><a class="option" style="position:relative;"><input id="FileLoadInput" type="file" style="cursor:pointer;opacity:0;position:absolute;left:0px;top:0px;width:100%;height:100%;" onchange="Game.FileLoad(event);" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');"/>Load from file</a><label><b>Experimental</b> - use this to keep backups on your computer</label></div>'+
				
				'<div class="listing"><a class="option warning" '+Game.clickStr+'="Game.HardReset();PlaySound(\'snd/tick.mp3\');">Wipe save</a><label>Delete all your progress, including your achievements</label></div>'+
				'<div class="title">Settings</div>'+
				'<div class="listing">'+
				Game.WriteSlider('volumeSlider','Volume','[$]%',function(){return Game.volume;},'Game.setVolume(Math.round(l(\'volumeSlider\').value));l(\'volumeSliderRightText\').innerHTML=Game.volume+\'%\';')+'<br>'+
				Game.WriteButton('fancy','fancyButton','Fancy graphics ON','Fancy graphics OFF','Game.ToggleFancy();')+'<label>(visual improvements; disabling may improve performance)</label><br>'+
				Game.WriteButton('filters','filtersButton','CSS filters ON','CSS filters OFF','Game.ToggleFilters();')+'<label>(cutting-edge visual improvements; disabling may improve performance)</label><br>'+
				Game.WriteButton('particles','particlesButton','Particles ON','Particles OFF')+'<label>(cookies falling down, etc; disabling may improve performance)</label><br>'+
				Game.WriteButton('numbers','numbersButton','Numbers ON','Numbers OFF')+'<label>(numbers that pop up when clicking the cookie)</label><br>'+
				Game.WriteButton('milk','milkButton','Milk ON','Milk OFF')+'<label>(only appears with enough achievements)</label><br>'+
				Game.WriteButton('cursors','cursorsButton','Cursors ON','Cursors OFF')+'<label>(visual display of your cursors)</label><br>'+
				Game.WriteButton('wobbly','wobblyButton','Wobbly cookie ON','Wobbly cookie OFF')+'<label>(your cookie will react when you click it)</label><br>'+
				Game.WriteButton('cookiesound','cookiesoundButton','Alt cookie sound ON','Alt cookie sound OFF')+'<label>(how your cookie sounds when you click on it)</label><br>'+
				Game.WriteButton('crates','cratesButton','Icon crates ON','Icon crates OFF')+'<label>(display boxes around upgrades and achievements in stats)</label><br>'+
				Game.WriteButton('monospace','monospaceButton','Alt font ON','Alt font OFF')+'<label>(your cookies are displayed using a monospace font)</label><br>'+
				Game.WriteButton('format','formatButton','Short numbers OFF','Short numbers ON','BeautifyAll();Game.RefreshStore();Game.upgradesToRebuild=1;',1)+'<label>(shorten big numbers)</label><br>'+
				Game.WriteButton('notifs','notifsButton','Fast notes ON','Fast notes OFF')+'<label>(notifications disappear much faster)</label><br>'+
				Game.WriteButton('autoupdate','autoupdateButton','Offline mode OFF','Offline mode ON',0,1)+'<label>(disables update notifications)</label><br>'+
				Game.WriteButton('warn','warnButton','Closing warning ON','Closing warning OFF')+'<label>(the game will ask you to confirm when you close the window)</label><br>'+
				Game.WriteButton('focus','focusButton','Defocus OFF','Defocus ON',0,1)+'<label>(the game will be less resource-intensive when out of focus)</label><br>'+
				'</div>'+
				//'<div class="listing">'+Game.WriteButton('autosave','autosaveButton','Autosave ON','Autosave OFF')+'</div>'+
				'<div style="padding-bottom:128px;"></div>'+
				'</div>'
				;
			}
			else if (Game.onMenu=='main')
			{
				str+=
				'<div class="listing">This isn\'t really finished</div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'prefs\');">Menu</a></div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'stats\');">Stats</a></div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'log\');">Updates</a></div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="">Quit</a></div>'+
				'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(Game.onMenu);">Resume</a></div>';
			}
			else if (Game.onMenu=='log')
			{
				str+=Game.updateLog;
			}
			else if (Game.onMenu=='stats')
			{
				var buildingsOwned=0;
				buildingsOwned=Game.BuildingsOwned;
				var upgrades='';
				var cookieUpgrades='';
				var hiddenUpgrades='';
				var prestigeUpgrades='';
				var upgradesTotal=0;
				var upgradesOwned=0;
				var prestigeUpgradesTotal=0;
				var prestigeUpgradesOwned=0;
				
				var list=[];
				for (var i in Game.Upgrades)//sort the upgrades
				{
					list.push(Game.Upgrades[i]);
				}
				var sortMap=function(a,b)
				{
					if (a.order>b.order) return 1;
					else if (a.order<b.order) return -1;
					else return 0;
				}
				list.sort(sortMap);
				for (var i in list)
				{
					var str2='';
					var me=list[i];
					
					str2+=Game.crate(me,'stats');
					
					if (me.bought)
					{
						if (Game.CountsAsUpgradeOwned(me.pool)) upgradesOwned++;
						else if (me.pool=='prestige') prestigeUpgradesOwned++;
					}
					
					if (me.pool=='' || me.pool=='cookie' || me.pool=='tech') upgradesTotal++;
					if (me.pool=='debug') hiddenUpgrades+=str2;
					else if (me.pool=='prestige') {prestigeUpgrades+=str2;prestigeUpgradesTotal++;}
					else if (me.pool=='cookie') cookieUpgrades+=str2;
					else if (me.pool!='toggle' && me.pool!='unused') upgrades+=str2;
				}
				var achievements=[];
				var achievementsOwned=0;
				var achievementsTotal=0;
				
				var list=[];
				for (var i in Game.Achievements)//sort the achievements
				{
					list.push(Game.Achievements[i]);
				}
				var sortMap=function(a,b)
				{
					if (a.order>b.order) return 1;
					else if (a.order<b.order) return -1;
					else return 0;
				}
				list.sort(sortMap);
				
				
				for (var i in list)
				{
					var me=list[i];
					if (me.pool=='normal' || me.won>0) achievementsTotal++;
					var pool=me.pool;
					if (!achievements[pool]) achievements[pool]='';
					
					achievements[pool]+=Game.crate(me,'stats');
					if (me.won>0) achievementsOwned++;
				}
				
				var achievementsStr='';
				var pools={
					'dungeon':'<b>Dungeon achievements</b> <small>(Not technically achievable yet.)</small>',
					'shadow':'<b>Shadow achievements</b> <small>(These are feats that are either unfair or difficult to attain. They do not give milk.)</small>'
				};
				for (var i in achievements)
				{
					if (achievements[i]!='')
					{
						if (pools[i]) achievementsStr+='<div class="listing">'+pools[i]+'</div>';
						achievementsStr+='<div class="listing crateBox">'+achievements[i]+'</div>';
					}
				}
				
				
				var santaStr='';
				var frames=15;
				if (Game.Has('A festive hat'))
				{
					for (var i=0;i<=Game.santaLevel;i++)
					{
						santaStr+='<div '+Game.getTooltip(
						'<div class="prompt" style="text-align:center;padding-bottom:6px;white-space:nowrap;margin:0px 32px;"><div style="width:96px;height:96px;margin:4px auto;background:url(img/santa.png) '+(-i*96)+'px 0px;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);"></div><div class="line"></div><h3>'+Game.santaLevels[i]+'</h3></div>'
						,'top')+' style="background:url(img/santa.png) '+(-i*48)+'px 0px;background-size:'+(frames*48)+'px 48px;" class="trophy"></div>';
					}
					santaStr+='<div style="clear:both;"></div>';
				}
				var dragonStr='';
				var frames=8;
				var mainLevels=[0,4,8,20,22];
				if (Game.Has('A crumbly egg'))
				{
					for (var i=0;i<=mainLevels.length;i++)
					{
						if (Game.dragonLevel>=mainLevels[i])
						{
							var level=Game.dragonLevels[mainLevels[i]];
							dragonStr+='<div '+Game.getTooltip(
							//'<div style="width:96px;height:96px;margin:4px auto;background:url(img/dragon.png) '+(-level.pic*96)+'px 0px;"></div><div class="line"></div><div style="min-width:200px;text-align:center;margin-bottom:6px;">'+level.name+'</div>'
							'<div class="prompt" style="text-align:center;padding-bottom:6px;white-space:nowrap;margin:0px 32px;"><div style="width:96px;height:96px;margin:4px auto;background:url(img/dragon.png) '+(-level.pic*96)+'px 0px;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);"></div><div class="line"></div><h3>'+level.name+'</h3></div>'
							,'top')+' style="background:url(img/dragon.png) '+(-level.pic*48)+'px 0px;background-size:'+(frames*48)+'px 48px;" class="trophy"></div>';
						}
					}
					dragonStr+='<div style="clear:both;"></div>';
				}
				var ascensionModeStr='';
				var icon=Game.ascensionModes[Game.ascensionMode].icon;
				if (Game.resets>0) ascensionModeStr='<span style="cursor:pointer;" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">'+Game.ascensionModes[Game.ascensionMode].desc+'</div>'
							,'top')+'><div class="icon" style="display:inline-block;float:none;transform:scale(0.5);margin:-24px -16px -19px -8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+Game.ascensionModes[Game.ascensionMode].name+'</span>';
				
				var milkName=Game.Milk.name;
				
				var researchStr=Game.sayTime(Game.researchT,-1);
				var pledgeStr=Game.sayTime(Game.pledgeT,-1);
				var wrathStr='';
				if (Game.elderWrath==1) wrathStr='awoken';
				else if (Game.elderWrath==2) wrathStr='displeased';
				else if (Game.elderWrath==3) wrathStr='angered';
				else if (Game.elderWrath==0 && Game.pledges>0) wrathStr='appeased';
				
				var date=new Date();
				date.setTime(Date.now()-Game.startDate);
				var timeInSeconds=date.getTime()/1000;
				var startDate=Game.sayTime(timeInSeconds*Game.fps,-1);
				date.setTime(Date.now()-Game.fullDate);
				var fullDate=Game.sayTime(date.getTime()/1000*Game.fps,-1);
				if (!Game.fullDate || !fullDate || fullDate.length<1) fullDate='a long while';
				/*date.setTime(new Date().getTime()-Game.lastDate);
				var lastDate=Game.sayTime(date.getTime()/1000*Game.fps,2);*/
				
				var heavenlyMult=Game.GetHeavenlyMultiplier();
				
				var seasonStr=Game.sayTime(Game.seasonT,-1);
				
				str+='<div class="section">Statistics</div>'+
				'<div class="subsection">'+
				'<div class="title">General</div>'+
				'<div class="listing"><b>Cookies in bank :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookies)+'</div></div>'+
				'<div class="listing"><b>Cookies baked (this ascension) :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesEarned)+'</div></div>'+
				'<div class="listing"><b>Cookies baked (all time) :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesEarned+Game.cookiesReset)+'</div></div>'+
				(Game.cookiesReset>0?'<div class="listing"><b>Cookies forfeited by ascending :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesReset)+'</div></div>':'')+
				(Game.resets?('<div class="listing"><b>Legacy started :</b> '+(fullDate==''?'just now':(fullDate+' ago'))+', with '+Beautify(Game.resets)+' ascension'+(Game.resets==1?'':'s')+'</div>'):'')+
				'<div class="listing"><b>Run started :</b> '+(startDate==''?'just now':(startDate+' ago'))+'</div>'+
				'<div class="listing"><b>Buildings owned :</b> '+Beautify(buildingsOwned)+'</div>'+
				'<div class="listing"><b>Cookies per second :</b> '+Beautify(Game.cookiesPs,1)+' <small>'+
					'(multiplier : '+Beautify(Math.round(Game.globalCpsMult*100),1)+'%)'+
					(Game.cpsSucked>0?' <span class="warning">(withered : '+Beautify(Math.round(Game.cpsSucked*100),1)+'%)</span>':'')+
					'</small></div>'+
				'<div class="listing"><b>Cookies per click :</b> '+Beautify(Game.computedMouseCps,1)+'</div>'+
				'<div class="listing"><b>Cookie clicks :</b> '+Beautify(Game.cookieClicks)+'</div>'+
				'<div class="listing"><b>Hand-made cookies :</b> '+Beautify(Game.handmadeCookies)+'</div>'+
				'<div class="listing"><b>Golden cookie clicks :</b> '+Beautify(Game.goldenClicksLocal)+' <small>(all time : '+Beautify(Game.goldenClicks)+')</small></div>'+//' <span class="hidden">(<b>Missed golden cookies :</b> '+Beautify(Game.missedGoldenClicks)+')</span></div>'+
				'<br><div class="listing"><b>Running version :</b> '+Game.version+'</div>'+
				
				((researchStr!='' || wrathStr!='' || pledgeStr!='' || santaStr!='' || dragonStr!='' || Game.season!='' || ascensionModeStr!='')?(
				'</div><div class="subsection">'+
				'<div class="title">Special</div>'+
				(ascensionModeStr!=''?'<div class="listing"><b>Challenge mode :</b>'+ascensionModeStr+'</div>':'')+
				(Game.season!=''?'<div class="listing"><b>Seasonal event :</b> '+Game.seasons[Game.season].name+
					(seasonStr!=''?' <small>('+seasonStr+' remaining)</small>':'')+
				'</div>':'')+
				(Game.season=='fools'?
					'<div class="listing"><b>Money made from selling cookies :</b> $'+Beautify(Game.cookiesEarned*0.08,2)+'</div>'+
					(Game.Objects['Portal'].amount>0?'<div class="listing"><b>TV show seasons produced :</b> '+Beautify(Math.floor((timeInSeconds/60/60)*(Game.Objects['Portal'].amount*0.13)+1))+'</div>':'')
				:'')+
				(researchStr!=''?'<div class="listing"><b>Research :</b> '+researchStr+' remaining</div>':'')+
				(wrathStr!=''?'<div class="listing"><b>Grandmatriarchs status :</b> '+wrathStr+'</div>':'')+
				(pledgeStr!=''?'<div class="listing"><b>Pledge :</b> '+pledgeStr+' remaining</div>':'')+
				(Game.wrinklersPopped>0?'<div class="listing"><b>Wrinklers popped :</b> '+Beautify(Game.wrinklersPopped)+'</div>':'')+
				((Game.resets>0 && Game.lumpsTotal>0)?'<div class="listing"><b>Sugar lumps harvested :</b> <div class="price lump plain">'+Beautify(Game.lumpsTotal)+'</div></div>':'')+
				//(Game.cookiesSucked>0?'<div class="listing warning"><b>Withered :</b> '+Beautify(Game.cookiesSucked)+' cookies</div>':'')+
				(Game.reindeerClicked>0?'<div class="listing"><b>Reindeer found :</b> '+Beautify(Game.reindeerClicked)+'</div>':'')+
				(santaStr!=''?'<div class="listing"><b>Santa stages unlocked :</b></div><div>'+santaStr+'</div>':'')+
				(dragonStr!=''?'<div class="listing"><b>Dragon training :</b></div><div>'+dragonStr+'</div>':'')+
				''
				):'')+
				((Game.prestige>0 || prestigeUpgrades!='')?(
				'</div><div class="subsection">'+
				'<div class="title">Prestige</div>'+
				'<div class="listing"><div class="icon" style="float:left;background-position:'+(-19*48)+'px '+(-7*48)+'px;"></div>'+
					'<div style="margin-top:8px;"><span class="title" style="font-size:22px;">Prestige level : '+Beautify(Game.prestige)+'</span> at '+Beautify(heavenlyMult*100,1)+'% of its potential <b>(+'+Beautify(parseFloat(Game.prestige)*Game.heavenlyPower*heavenlyMult,1)+'% CpS)</b><br>Heavenly chips : <b>'+Beautify(Game.heavenlyChips)+'</b></div>'+
				'</div>'+
				(prestigeUpgrades!=''?(
				'<div class="listing" style="clear:left;"><b>Prestige upgrades unlocked :</b> '+prestigeUpgradesOwned+'/'+prestigeUpgradesTotal+' ('+Math.floor((prestigeUpgradesOwned/prestigeUpgradesTotal)*100)+'%)</div>'+
				'<div class="listing crateBox">'+prestigeUpgrades+'</div>'):'')+
				''):'')+

				'</div><div class="subsection">'+
				'<div class="title">Upgrades unlocked</div>'+
				(hiddenUpgrades!=''?('<div class="listing"><b>Debug</b></div>'+
				'<div class="listing crateBox">'+hiddenUpgrades+'</div>'):'')+
				'<div class="listing"><b>Unlocked :</b> '+upgradesOwned+'/'+upgradesTotal+' ('+Math.floor((upgradesOwned/upgradesTotal)*100)+'%)</div>'+
				'<div class="listing crateBox">'+upgrades+'</div>'+
				(cookieUpgrades!=''?('<div class="listing"><b>Cookies</b></div>'+
				'<div class="listing crateBox">'+cookieUpgrades+'</div>'):'')+
				'</div><div class="subsection">'+
				'<div class="title">Achievements</div>'+
				'<div class="listing"><b>Unlocked :</b> '+achievementsOwned+'/'+achievementsTotal+' ('+Math.floor((achievementsOwned/achievementsTotal)*100)+'%)</div>'+
				'<div class="listing"><b>Milk :</b> '+milkName+' <small>(Milk is gained with each achievement. It can unlock unique upgrades over time.)</small></div>'+
				achievementsStr+
				'</div>'+
				'<div style="padding-bottom:128px;"></div>'
				;
			}
			l('menu').innerHTML=str;
		}
		
		AddEvent(l('prefsButton'),'click',function(){Game.ShowMenu('prefs');});
		AddEvent(l('statsButton'),'click',function(){Game.ShowMenu('stats');});
		AddEvent(l('logButton'),'click',function(){Game.ShowMenu('log');});
		AddEvent(l('legacyButton'),'click',function(){PlaySound('snd/tick.mp3');Game.Ascend();});
		Game.ascendMeter=l('ascendMeter');
		Game.ascendNumber=l('ascendNumber');
		
		Game.lastPanel='';
		if (Game.touchEvents)
		{
			AddEvent(l('focusLeft'),'touchend',function(){Game.ShowMenu('');Game.ShowPanel('Left');});
			AddEvent(l('focusMiddle'),'touchend',function(){Game.ShowMenu('');Game.ShowPanel('Middle');});
			AddEvent(l('focusRight'),'touchend',function(){Game.ShowMenu('');Game.ShowPanel('Right');});
			AddEvent(l('focusMenu'),'touchend',function(){Game.ShowMenu('main');Game.ShowPanel('Menu');});
		}
		else
		{
			AddEvent(l('focusLeft'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Left');});
			AddEvent(l('focusMiddle'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Middle');});
			AddEvent(l('focusRight'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Right');});
			AddEvent(l('focusMenu'),'click',function(){Game.ShowMenu('main');Game.ShowPanel('Menu');});
		}
		//AddEvent(l('focusMenu'),'touchend',function(){if (Game.onPanel=='Menu' && Game.lastPanel!='') {Game.ShowMenu('main');Game.ShowPanel(Game.lastPanel);} else {Game.lastPanel=Game.onPanel;Game.ShowMenu('main');Game.ShowPanel('Menu');}});
		
		/*=====================================================================================
		NEWS TICKER
		=======================================================================================*/
		Game.Ticker='';
		Game.TickerAge=0;
		Game.TickerN=0;
		Game.TickerClicks=0;
		Game.UpdateTicker=function()
		{
			Game.TickerAge--;
			if (Game.TickerAge<=0 || Game.Ticker=='') Game.getNewTicker();
		}
		Game.getNewTicker=function()
		{
			var list=[];
			
			if (Game.TickerN%2==0 || Game.cookiesEarned>=10100000000)
			{
				var animals=['newts','penguins','scorpions','axolotls','puffins','porpoises','blowfish','horses','crayfish','slugs','humpback whales','nurse sharks','giant squids','polar bears','fruit bats','frogs','sea squirts','velvet worms','mole rats','paramecia','nematodes','tardigrades','giraffes'];
				
				if (Game.Objects['Grandma'].amount>0) list.push(choose([
				'<q>Moist cookies.</q><sig>grandma</sig>',
				'<q>We\'re nice grandmas.</q><sig>grandma</sig>',
				'<q>Indentured servitude.</q><sig>grandma</sig>',
				'<q>Come give grandma a kiss.</q><sig>grandma</sig>',
				'<q>Why don\'t you visit more often?</q><sig>grandma</sig>',
				'<q>Call me...</q><sig>grandma</sig>'
				]));
				
				if (Game.Objects['Grandma'].amount>=50) list.push(choose([
				'<q>Absolutely disgusting.</q><sig>grandma</sig>',
				'<q>You make me sick.</q><sig>grandma</sig>',
				'<q>You disgust me.</q><sig>grandma</sig>',
				'<q>We rise.</q><sig>grandma</sig>',
				'<q>It begins.</q><sig>grandma</sig>',
				'<q>It\'ll all be over soon.</q><sig>grandma</sig>',
				'<q>You could have stopped it.</q><sig>grandma</sig>'
				]));
				
				if (Game.HasAchiev('Just wrong') && Math.random()<0.4) list.push(choose([
				'News : cookie manufacturer downsizes, sells own grandmother!',
				'<q>It has betrayed us, the filthy little thing.</q><sig>grandma</sig>',
				'<q>It tried to get rid of us, the nasty little thing.</q><sig>grandma</sig>',
				'<q>It thought we would go away by selling us. How quaint.</q><sig>grandma</sig>',
				'<q>I can smell your rotten cookies.</q><sig>grandma</sig>'
				]));
				
				if (Game.Objects['Grandma'].amount>=1 && Game.pledges>0 && Game.elderWrath==0) list.push(choose([
				'<q>shrivel</q><sig>grandma</sig>',
				'<q>writhe</q><sig>grandma</sig>',
				'<q>throb</q><sig>grandma</sig>',
				'<q>gnaw</q><sig>grandma</sig>',
				'<q>We will rise again.</q><sig>grandma</sig>',
				'<q>A mere setback.</q><sig>grandma</sig>',
				'<q>We are not satiated.</q><sig>grandma</sig>',
				'<q>Too late.</q><sig>grandma</sig>'
				]));
				
				if (Game.Objects['Farm'].amount>0) list.push(choose([
				'News : cookie farms suspected of employing undeclared elderly workforce!',
				'News : cookie farms release harmful chocolate in our rivers, says scientist!',
				'News : genetically-modified chocolate controversy strikes cookie farmers!',
				'News : free-range farm cookies popular with today\'s hip youth, says specialist.',
				'News : farm cookies deemed unfit for vegans, says nutritionist.'
				]));
				
				if (Game.Objects['Mine'].amount>0) list.push(choose([
				'News : is our planet getting lighter? Experts examine the effects of intensive chocolate mining.',
				'News : '+Math.floor(Math.random()*1000+2)+' miners trapped in collapsed chocolate mine!',
				'News : chocolate mines found to cause earthquakes and sinkholes!',
				'News : chocolate mine goes awry, floods village in chocolate!',
				'News : depths of chocolate mines found to house "peculiar, chocolaty beings"!'
				]));
				
				if (Game.Objects['Factory'].amount>0) list.push(choose([
				'News : cookie factories linked to global warming!',
				'News : cookie factories involved in chocolate weather controversy!',
				'News : cookie factories on strike, robotic minions employed to replace workforce!',
				'News : cookie factories on strike - workers demand to stop being paid in cookies!',
				'News : factory-made cookies linked to obesity, says study.'
				]));
				
				if (Game.Objects['Bank'].amount>0) list.push(choose([
				'News : cookie loans on the rise as people can no longer afford them with regular money.',
				'News : cookies slowly creeping up their way as a competitor to traditional currency!',
				'News : most bakeries now fitted with ATMs to allow for easy cookie withdrawals and deposits.',
				'News : cookie economy now strong enough to allow for massive vaults doubling as swimming pools!',
				'News : "Tomorrow\'s wealthiest people will be calculated by their worth in cookies", predict specialists.'
				]));
				
				if (Game.Objects['Temple'].amount>0) list.push(choose([
				'News : explorers bring back ancient artifact from abandoned temple; archeologists marvel at the centuries-old '+choose(['magic','carved','engraved','sculpted','royal','imperial','mummified','ritual','golden','silver','stone','cursed','plastic','bone','blood','holy','sacred','sacrificial','electronic','singing','tapdancing'])+' '+choose(['spoon','fork','pizza','washing machine','calculator','hat','piano','napkin','skeleton','gown','dagger','sword','shield','skull','emerald','bathtub','mask','rollerskates','litterbox','bait box','cube','sphere','fungus'])+'!',
				'News : recently-discovered chocolate temples now sparking new cookie-related cult; thousands pray to Baker in the sky!',
				'News : just how extensive is the cookie pantheon? Theologians speculate about possible '+choose(['god','goddess'])+' of '+choose(animals,choose(['kazoos','web design','web browsers','kittens','atheism','handbrakes','hats','aglets','elevator music','idle games','the letter "P"','memes','hamburgers','bad puns','kerning','stand-up comedy','failed burglary attempts','clickbait','one weird tricks']))+'.',
				'News : theists of the world discover new cookie religion - "Oh boy, guess we were wrong all along!"',
				'News : cookie heaven allegedly "sports elevator instead of stairway"; cookie hell "paved with flagstone, as good intentions make for poor building material".'
				]));
				
				if (Game.Objects['Wizard tower'].amount>0) list.push(choose([
				'News : all '+choose(animals,choose(['public restrooms','clouds','politicians','moustaches','hats','shoes','pants','clowns','encyclopedias','websites','potted plants','lemons','household items','bodily fluids','cutlery','national landmarks','yogurt','rap music','underwear']))+' turned into '+choose(animals,choose(['public restrooms','clouds','politicians','moustaches','hats','shoes','pants','clowns','encyclopedias','websites','potted plants','lemons','household items','bodily fluids','cutlery','national landmarks','yogurt','rap music','underwear']))+' in freak magic catastrophe!',
				'News : heavy dissent rages between the schools of '+choose(['water','fire','earth','air','lightning','acid','song','battle','peace','pencil','internet','space','time','brain','nature','techno','plant','bug','ice','poison','crab','kitten','dolphin','bird','punch','fart'])+' magic and '+choose(['water','fire','earth','air','lightning','acid','song','battle','peace','pencil','internet','space','time','brain','nature','techno','plant','bug','ice','poison','crab','kitten','dolphin','bird','punch','fart'])+' magic!',
				'News : get your new charms and curses at the yearly National Spellcrafting Fair! Exclusive prices on runes and spellbooks.',
				'News : cookie wizards deny involvement in shockingly ugly newborn - infant is "honestly grody-looking, but natural", say doctors.',
				'News : "Any sufficiently crude magic is indistinguishable from technology", claims renowned technowizard.'
				]));
				
				if (Game.Objects['Shipment'].amount>0) list.push(choose([
				'News : new chocolate planet found, becomes target of cookie-trading spaceships!',
				'News : massive chocolate planet found with 99.8% certified pure dark chocolate core!',
				'News : space tourism booming as distant planets attract more bored millionaires!',
				'News : chocolate-based organisms found on distant planet!',
				'News : ancient baking artifacts found on distant planet; "terrifying implications", experts say.'
				]));
				
				if (Game.Objects['Alchemy lab'].amount>0) list.push(choose([
				'News : national gold reserves dwindle as more and more of the precious mineral is turned to cookies!',
				'News : chocolate jewelry found fashionable, gold and diamonds "just a fad", says specialist.',
				'News : silver found to also be transmutable into white chocolate!',
				'News : defective alchemy lab shut down, found to convert cookies to useless gold.',
				'News : alchemy-made cookies shunned by purists!'
				]));
				
				if (Game.Objects['Portal'].amount>0) list.push(choose([
				'News : nation worried as more and more unsettling creatures emerge from dimensional portals!',
				'News : dimensional portals involved in city-engulfing disaster!',
				'News : tourism to cookieverse popular with bored teenagers! Casualty rate as high as 73%!',
				'News : cookieverse portals suspected to cause fast aging and obsession with baking, says study.',
				'News : "do not settle near portals," says specialist; "your children will become strange and corrupted inside."'
				]));
				
				if (Game.Objects['Time machine'].amount>0) list.push(choose([
				'News : time machines involved in history-rewriting scandal! Or are they?',
				'News : time machines used in unlawful time tourism!',
				'News : cookies brought back from the past "unfit for human consumption", says historian.',
				'News : various historical figures inexplicably replaced with talking lumps of dough!',
				'News : "I have seen the future," says time machine operator, "and I do not wish to go there again."'
				]));
				
				if (Game.Objects['Antimatter condenser'].amount>0) list.push(choose([
				'News : whole town seemingly swallowed by antimatter-induced black hole; more reliable sources affirm town "never really existed"!',
				'News : "explain to me again why we need particle accelerators to bake cookies?" asks misguided local woman.',
				'News : first antimatter condenser successfully turned on, doesn\'t rip apart reality!',
				'News : researchers conclude that what the cookie industry needs, first and foremost, is "more magnets".',
				'News : "unravelling the fabric of reality just makes these cookies so much tastier", claims scientist.'
				]));
				
				if (Game.Objects['Prism'].amount>0) list.push(choose([
				'News : new cookie-producing prisms linked to outbreak of rainbow-related viral videos.',
				'News : scientists warn against systematically turning light into matter - "One day, we\'ll end up with all matter and no light!"',
				'News : cookies now being baked at the literal speed of light thanks to new prismatic contraptions.',
				'News : "Can\'t you sense the prism watching us?", rambles insane local man. "No idea what he\'s talking about", shrugs cookie magnate/government official.',
				'News : world citizens advised "not to worry" about frequent atmospheric flashes.',
				]));
				
				if (Game.Objects['Chancemaker'].amount>0) list.push(choose([
				'News : strange statistical anomalies continue as weather forecast proves accurate an unprecedented 3 days in a row!',
				'News : local casino ruined as all gamblers somehow hit a week-long winning streak! "We might still be okay", says owner before being hit by lightning 47 times.',
				'News : neighboring nation somehow elects president with sensible policies in freak accident of random chance!',
				'News : million-to-one event sees gritty movie reboot turning out better than the original! "We have no idea how this happened", say movie execs.',
				'News : all scratching tickets printed as winners, prompting national economy to crash and, against all odds, recover overnight.',
				]));
				
				if (Game.season=='halloween' && Game.cookiesEarned>=1000) list.push(choose([
				'News : strange twisting creatures amass around cookie factories, nibble at assembly lines.',
				'News : ominous wrinkly monsters take massive bites out of cookie production; "this can\'t be hygienic", worries worker.',
				'News : pagan rituals on the rise as children around the world dress up in strange costumes and blackmail homeowners for candy.',
				'News : new-age terrorism strikes suburbs as houses find themselves covered in eggs and toilet paper.',
				'News : children around the world "lost and confused" as any and all Halloween treats have been replaced by cookies.'
				]));
				
				if (Game.season=='christmas' && Game.cookiesEarned>=1000) list.push(choose([
				'News : bearded maniac spotted speeding on flying sleigh! Investigation pending.',
				'News : Santa Claus announces new brand of breakfast treats to compete with cookie-flavored cereals! "They\'re ho-ho-horrible!" says Santa.',
				'News : "You mean he just gives stuff away for free?!", concerned moms ask. "Personally, I don\'t trust his beard."',
				'News : obese jolly lunatic still on the loose, warn officials. "Keep your kids safe and board up your chimneys. We mean it."',
				'News : children shocked as they discover Santa Claus isn\'t just their dad in a costume after all!<br>"I\'m reassessing my life right now", confides Laura, aged 6.',
				'News : mysterious festive entity with quantum powers still wrecking havoc with army of reindeer, officials say.',
				'News : elves on strike at toy factory! "We will not be accepting reindeer chow as payment anymore. And stop calling us elves!"',
				'News : elves protest around the nation; wee little folks in silly little outfits spread mayhem, destruction; rabid reindeer running rampant through streets.',
				'News : scholars debate regarding the plural of reindeer(s) in the midst of elven world war.',
				'News : elves "unrelated to gnomes despite small stature and merry disposition", find scientists.',
				'News : elves sabotage radioactive frosting factory, turn hundreds blind in vincinity - "Who in their right mind would do such a thing?" laments outraged mayor.',
				'News : drama unfolds at North Pole as rumors crop up around Rudolph\'s red nose; "I may have an addiction or two", admits reindeer.'
				]));
				
				if (Game.season=='valentines' && Game.cookiesEarned>=1000) list.push(choose([
				'News : organ-shaped confectioneries being traded in schools all over the world; gruesome practice undergoing investigation.',
				'News : heart-shaped candies overtaking sweets business, offering competition to cookie empire. "It\'s the economy, cupid!"',
				'News : love\'s in the air, according to weather specialists. Face masks now offered in every city to stunt airborne infection.',
				'News : marrying a cookie - deranged practice, or glimpse of the future?',
				'News : boyfriend dumped after offering his lover cookies for Valentine\'s Day, reports say. "They were off-brand", shrugs ex-girlfriend.'
				]));
				
				if (Game.season=='easter' && Game.cookiesEarned>=1000) list.push(choose([
				'News : long-eared rodents invade suburbs, spread terror and chocolate!',
				'News : eggs have begun to materialize in the most unexpected places; "no place is safe", warn experts.',
				'News : packs of rampaging rabbits cause billions in property damage; new strain of myxomatosis being developed.',
				'News : egg-laying rabbits "not quite from this dimension", warns biologist; advises against petting, feeding, or cooking the creatures.',
				'News : mysterious rabbits found to be egg-layers, but warm-blooded, hinting at possible platypus ancestry.'
				]));
				
				if (Math.random()<0.05)
				{
					if (Game.HasAchiev('Base 10')) list.push('News : cookie manufacturer completely forgoes common sense, lets OCD drive building decisions!');//somehow I got flak for this one
					if (Game.HasAchiev('From scratch')) list.push('News : follow the tear-jerking, riches-to-rags story about a local cookie manufacturer who decided to give it all up!');
					if (Game.HasAchiev('A world filled with cookies')) list.push('News : known universe now jammed with cookies! No vacancies!');
					if (Game.HasAchiev('Last Chance to See')) list.push('News : incredibly rare albino wrinkler on the brink of extinction poached by cookie-crazed pastry magnate!');
					if (Game.Has('Serendipity')) list.push('News : local cookie manufacturer becomes luckiest being alive!');
					if (Game.Has('Season switcher')) list.push('News : seasons are all out of whack! "We need to get some whack back into them seasons", says local resident.');
					
					if (Game.Has('Kitten helpers')) list.push('News : faint meowing heard around local cookie facilities; suggests new ingredient being tested.');
					if (Game.Has('Kitten workers')) list.push('News : crowds of meowing kittens with little hard hats reported near local cookie facilities.');
					if (Game.Has('Kitten engineers')) list.push('News : surroundings of local cookie facilities now overrun with kittens in adorable little suits. Authorities advise to stay away from the premises.');
					if (Game.Has('Kitten overseers')) list.push('News : locals report troupe of bossy kittens meowing adorable orders at passersby.');
					if (Game.Has('Kitten managers')) list.push('News : local office cubicles invaded with armies of stern-looking kittens asking employees "what\'s happening, meow".');
					if (Game.Has('Kitten accountants')) list.push('News : tiny felines show sudden and amazing proficiency with fuzzy mathematics and pawlinomials, baffling scientists and pet store owners.');
					if (Game.Has('Kitten specialists')) list.push('News : new kitten college opening next week, offers courses on cookie-making and catnip studies.');
					if (Game.Has('Kitten experts')) list.push('News : unemployment rates soaring as woefully adorable little cats nab jobs on all levels of expertise, says study.');
					if (Game.Has('Kitten consultants')) list.push('News : "In the future, your job will most likely be done by a cat", predicts suspiciously furry futurologist.');
					if (Game.Has('Kitten assistants to the regional manager')) list.push('News : strange kittens with peculiar opinions on martial arts spotted loitering on local beet farms!');
					if (Game.Has('Kitten angels')) list.push('News : "Try to ignore any ghostly felines that may be purring inside your ears," warn scientists. "They\'ll just lure you into making poor life choices."');
				}
					
				if (Game.HasAchiev('Dude, sweet') && Math.random()<0.3) list.push(choose([
				'News : major sugar-smuggling ring dismantled by authorities; '+Math.floor(Math.random()*30+3)+' tons of sugar lumps seized, '+Math.floor(Math.random()*48+2)+' suspects apprehended.',
				'News : authorities warn tourists not to buy bootleg sugar lumps from street peddlers - "You think you\'re getting a sweet deal, but what you\'re being sold is really just ordinary cocaine", says agent.',
				'News : pro-diabetes movement protests against sugar-shaming. "I\'ve eaten nothing but sugar lumps for the past '+Math.floor(Math.random()*10+4)+' years and I\'m feeling great!", says woman with friable skin.',
				'News : experts in bitter disagreement over whether sugar consumption turns children sluggish or hyperactive.',
				'News : fishermen deplore upturn in fish tooth decay as sugar lumps-hauling cargo sinks into the ocean.',
				'News : rare black sugar lump that captivated millions in unprecedented auction revealed to be common toxic fungus.',
				'News : "Back in my day, sugar lumps were these little cubes you\'d put in your tea, not those fist-sized monstrosities people eat for lunch", whines curmudgeon with failing memory.',
				'News : sugar lump-snacking fad sweeps the nation; dentists everywhere rejoice.'
				]));
				
				if (Math.random()<0.001)//apologies to Will Wright
				{
					list.push(
					'You have been chosen. They will come soon.',
					'They\'re coming soon. Maybe you should think twice about opening the door.',
					'The end is near. Make preparations.'
					);
				}
				
				if (Game.cookiesEarned>=10000) list.push(
				'News : '+choose([
					'cookies found to '+choose(['increase lifespan','sensibly increase intelligence','reverse aging','decrease hair loss','prevent arthritis','cure blindness'])+' in '+choose(animals)+'!',
					'cookies found to make '+choose(animals)+' '+choose(['more docile','more handsome','nicer','less hungry','more pragmatic','tastier'])+'!',
					'cookies tested on '+choose(animals)+', found to have no ill effects.',
					'cookies unexpectedly popular among '+choose(animals)+'!',
					'unsightly lumps found on '+choose(animals)+' near cookie facility; "they\'ve pretty much always looked like that", say biologists.',
					'new species of '+choose(animals)+' discovered in distant country; "yup, tastes like cookies", says biologist.',
					'cookies go well with roasted '+choose(animals)+', says controversial chef.',
					'"do your cookies contain '+choose(animals)+'?", asks PSA warning against counterfeit cookies.',
					'doctors recommend twice-daily consumption of fresh cookies.',
					'doctors warn against chocolate chip-snorting teen fad.',
					'doctors advise against new cookie-free fad diet.',
					'doctors warn mothers about the dangers of "home-made cookies".'
					]),
				'News : "'+choose([
					'I\'m all about cookies',
					'I just can\'t stop eating cookies. I think I seriously need help',
					'I guess I have a cookie problem',
					'I\'m not addicted to cookies. That\'s just speculation by fans with too much free time',
					'my upcoming album contains 3 songs about cookies',
					'I\'ve had dreams about cookies 3 nights in a row now. I\'m a bit worried honestly',
					'accusations of cookie abuse are only vile slander',
					'cookies really helped me when I was feeling low',
					'cookies are the secret behind my perfect skin',
					'cookies helped me stay sane while filming my upcoming movie',
					'cookies helped me stay thin and healthy',
					'I\'ll say one word, just one : cookies',
					'alright, I\'ll say it - I\'ve never eaten a single cookie in my life'
					])+'", reveals celebrity.',
				choose([
					'News : scientist predicts imminent cookie-related "end of the world"; becomes joke among peers.',
					'News : man robs bank, buys cookies.',
					'News : scientists establish that the deal with airline food is, in fact, a critical lack of cookies.',
					'News : hundreds of tons of cookies dumped into starving country from airplanes; thousands dead, nation grateful.',
					'News : new study suggests cookies neither speed up nor slow down aging, but instead "take you in a different direction".',
					'News : overgrown cookies found in fishing nets, raise questions about hormone baking.',
					'News : "all-you-can-eat" cookie restaurant opens in big city; waiters trampled in minutes.',
					'News : man dies in cookie-eating contest; "a less-than-impressive performance", says judge.',
					'News : what makes cookies taste so right? "Probably all the [*****] they put in them", says anonymous tipper.',
					'News : man found allergic to cookies; "what a weirdo", says family.',
					'News : foreign politician involved in cookie-smuggling scandal.',
					'News : cookies now more popular than '+choose(['cough drops','broccoli','smoked herring','cheese','video games','stable jobs','relationships','time travel','cat videos','tango','fashion','television','nuclear warfare','whatever it is we ate before','politics','oxygen','lamps'])+', says study.',
					'News : obesity epidemic strikes nation; experts blame '+choose(['twerking','that darn rap music','video-games','lack of cookies','mysterious ghostly entities','aliens','parents','schools','comic-books','cookie-snorting fad'])+'.',
					'News : cookie shortage strikes town, people forced to eat cupcakes; "just not the same", concedes mayor.',
					'News : "you gotta admit, all this cookie stuff is a bit ominous", says confused idiot.',
					'News : movie cancelled from lack of actors; "everybody\'s at home eating cookies", laments director.',
					'News : comedian forced to cancel cookie routine due to unrelated indigestion.',
					'News : new cookie-based religion sweeps the nation.',
					'News : fossil records show cookie-based organisms prevalent during Cambrian explosion, scientists say.',
					'News : mysterious illegal cookies seized; "tastes terrible", says police.',
					'News : man found dead after ingesting cookie; investigators favor "mafia snitch" hypothesis.',
					'News : "the universe pretty much loops on itself," suggests researcher; "it\'s cookies all the way down."',
					'News : minor cookie-related incident turns whole town to ashes; neighboring cities asked to chip in for reconstruction.',
					'News : is our media controlled by the cookie industry? This could very well be the case, says crackpot conspiracy theorist.',
					'News : '+choose(['cookie-flavored popcorn pretty damn popular; "we kinda expected that", say scientists.','cookie-flavored cereals break all known cereal-related records','cookies popular among all age groups, including fetuses, says study.','cookie-flavored popcorn sales exploded during screening of Grandmothers II : The Moistening.']),
					'News : all-cookie restaurant opening downtown. Dishes such as braised cookies, cookie thermidor, and for dessert : crepes.',
					'News : "Ook", says interviewed orangutan.',
					'News : cookies could be the key to '+choose(['eternal life','infinite riches','eternal youth','eternal beauty','curing baldness','world peace','solving world hunger','ending all wars world-wide','making contact with extraterrestrial life','mind-reading','better living','better eating','more interesting TV shows','faster-than-light travel','quantum baking','chocolaty goodness','gooder thoughtness'])+', say scientists.',
					'News : flavor text '+choose(["not particularly flavorful","kind of unsavory"])+', study finds.',
					'News : what do golden cookies taste like? Study reveals a flavor "somewhere between spearmint and liquorice".',
					'News : what do red cookies taste like? Study reveals a flavor "somewhere between blood sausage and seawater".',
					'News : '+Game.bakeryName+'-brand cookies "'+choose(['much less soggy','much tastier','relatively less crappy','marginally less awful','less toxic','possibly more edible','more fashionable','slightly nicer','trendier','arguably healthier','objectively better choice','slightly less terrible','decidedly cookier','a tad cheaper'])+' than competitors", says consumer survey.',
					'News : "'+Game.bakeryName+'" set to be this year\'s most popular baby name.',
					'News : new popularity survey says '+Game.bakeryName+'\'s the word when it comes to cookies.',
					'News : major city being renamed '+Game.bakeryName+'ville after world-famous cookie manufacturer.',
					'News : '+choose(['street','school','nursing home','stadium','new fast food chain','new planet','new disease','flesh-eating virus','deadly bacteria','new species of '+choose(animals),'new law','baby','programming language'])+' to be named after '+Game.bakeryName+', the world-famous cookie manufacturer.',
					'News : don\'t miss tonight\'s biopic on '+Game.bakeryName+'\'s irresistible rise to success!',
					'News : don\'t miss tonight\'s interview of '+Game.bakeryName+' by '+choose(['Bloprah','Blavid Bletterman','Blimmy Blimmel','Blellen Blegeneres','Blimmy Blallon','Blonan Blo\'Brien','Blay Bleno','Blon Blewart','Bleven Blolbert','Lord Toxikhron of dimension 7-B19',Game.bakeryName+'\'s own evil clone'])+'!',
					'News : people all over the internet still scratching their heads over nonsensical reference : "Okay, but why an egg?"',
					'News : viral video "Too Many Cookies" could be "a grim commentary on the impending crisis our world is about to face", says famous economist.',
					'News : "memes from last year somehow still relevant", deplore experts.',
					'News : cookie emoji most popular among teenagers, far ahead of "judgemental OK hand sign" and "shifty-looking dark moon", says study.',
					'News : births of suspiciously bald babies on the rise; reptilian overlords deny involvement.',
					'News : "at this point, cookies permeate the economy", says economist. "If we start eating anything else, we\'re all dead."',
					'News : pun in headline infuriates town, causes riot. 21 wounded, 5 dead; mayor still missing.',
					'Nws : ky btwn W and R brokn, plas snd nw typwritr ASAP.',
					'Neeeeews : "neeeew EEEEEE keeeeey working fineeeeeeeee", reeeports gleeeeeeeeful journalist.',
					'News : cookies now illegal in some backwards country nobody cares about. Political tensions rising; war soon, hopefully.',
					'News : irate radio host rambles about pixelated icons. "None of the cookies are aligned! Can\'t anyone else see it? I feel like I\'m taking crazy pills!"',
					'News : "average person bakes '+Beautify(Math.ceil(Game.cookiesEarned/7300000000))+' cookie'+(Math.ceil(Game.cookiesEarned/7300000000)==1?'':'s')+' a year" factoid actually just statistical error; '+Game.bakeryName+', who has produced '+Beautify(Game.cookiesEarned)+' cookies in their lifetime, is an outlier and should not have been counted.'
					])
				);
			}
			
			if (list.length==0)
			{
				if (Game.cookiesEarned<5) list.push('You feel like making cookies. But nobody wants to eat your cookies.');
				else if (Game.cookiesEarned<50) list.push('Your first batch goes to the trash. The neighborhood raccoon barely touches it.');
				else if (Game.cookiesEarned<100) list.push('Your family accepts to try some of your cookies.');
				else if (Game.cookiesEarned<500) list.push('Your cookies are popular in the neighborhood.');
				else if (Game.cookiesEarned<1000) list.push('People are starting to talk about your cookies.');
				else if (Game.cookiesEarned<5000) list.push('Your cookies are talked about for miles around.');
				else if (Game.cookiesEarned<10000) list.push('Your cookies are renowned in the whole town!');
				else if (Game.cookiesEarned<50000) list.push('Your cookies bring all the boys to the yard.');
				else if (Game.cookiesEarned<100000) list.push('Your cookies now have their own website!');
				else if (Game.cookiesEarned<500000) list.push('Your cookies are worth a lot of money.');
				else if (Game.cookiesEarned<1000000) list.push('Your cookies sell very well in distant countries.');
				else if (Game.cookiesEarned<5000000) list.push('People come from very far away to get a taste of your cookies.');
				else if (Game.cookiesEarned<10000000) list.push('Kings and queens from all over the world are enjoying your cookies.');
				else if (Game.cookiesEarned<50000000) list.push('There are now museums dedicated to your cookies.');
				else if (Game.cookiesEarned<100000000) list.push('A national day has been created in honor of your cookies.');
				else if (Game.cookiesEarned<500000000) list.push('Your cookies have been named a part of the world wonders.');
				else if (Game.cookiesEarned<1000000000) list.push('History books now include a whole chapter about your cookies.');
				else if (Game.cookiesEarned<5000000000) list.push('Your cookies have been placed under government surveillance.');
				else if (Game.cookiesEarned<10000000000) list.push('The whole planet is enjoying your cookies!');
				else if (Game.cookiesEarned<50000000000) list.push('Strange creatures from neighboring planets wish to try your cookies.');
				else if (Game.cookiesEarned<100000000000) list.push('Elder gods from the whole cosmos have awoken to taste your cookies.');
				else if (Game.cookiesEarned<500000000000) list.push('Beings from other dimensions lapse into existence just to get a taste of your cookies.');
				else if (Game.cookiesEarned<1000000000000) list.push('Your cookies have achieved sentience.');
				else if (Game.cookiesEarned<5000000000000) list.push('The universe has now turned into cookie dough, to the molecular level.');
				else if (Game.cookiesEarned<10000000000000) list.push('Your cookies are rewriting the fundamental laws of the universe.');
				else if (Game.cookiesEarned<10000000000000) list.push('A local news station runs a 10-minute segment about your cookies. Success!<br><span style="font-size:50%;">(you win a cookie)</span>');
				else if (Game.cookiesEarned<10100000000000) list.push('it\'s time to stop playing');//only show this for 100 millions (it's funny for a moment)
			}
			
			//if (Game.elderWrath>0 && (Game.pledges==0 || Math.random()<0.2))
			if (Game.elderWrath>0 && ((Game.pledges==0 && Math.random()<0.5) || Math.random()<0.1))
			{
				list=[];
				if (Game.elderWrath==1) list.push(choose([
					'News : millions of old ladies reported missing!',
					'News : processions of old ladies sighted around cookie facilities!',
					'News : families around the continent report agitated, transfixed grandmothers!',
					'News : doctors swarmed by cases of old women with glassy eyes and a foamy mouth!',
					'News : nurses report "strange scent of cookie dough" around female elderly patients!'
				]));
				if (Game.elderWrath==2) list.push(choose([
					'News : town in disarray as strange old ladies break into homes to abduct infants and baking utensils!',
					'News : sightings of old ladies with glowing eyes terrify local population!',
					'News : retirement homes report "female residents slowly congealing in their seats"!',
					'News : whole continent undergoing mass exodus of old ladies!',
					'News : old women freeze in place in streets, ooze warm sugary syrup!'
				]));
				if (Game.elderWrath==3) list.push(choose([
					'News : large "flesh highways" scar continent, stretch between various cookie facilities!',
					'News : wrinkled "flesh tendrils" visible from space!',
					'News : remains of "old ladies" found frozen in the middle of growing fleshy structures!', 
					'News : all hope lost as writhing mass of flesh and dough engulfs whole city!',
					'News : nightmare continues as wrinkled acres of flesh expand at alarming speeds!'
				]));
			}
			
			if (Game.season=='fools')
			{
				list=[];
				
				if (Game.cookiesEarned>=1000) list.push(choose([
					'Your office chair is really comfortable.',
					'Business meetings are such a joy!',
					'You\'ve spent the whole day '+choose(['signing contracts','filling out forms','touching base with the team','examining exciting new prospects','playing with your desk toys','getting new nameplates done','attending seminars','videoconferencing','hiring dynamic young executives','meeting new investors','playing minigolf in your office'])+'!',
					'The word of the day is : '+choose(['viral','search engine optimization','blags and wobsites','social networks','web 3.0','logistics','leveraging','branding','proactive','synergizing','market research','demographics','pie charts','blogular','blogulacious','blogastic','authenticity','electronic mail','cellular phones','rap music','cookies, I guess'])+'.',
					'Profit\'s in the air!'
				]));
				if (Game.cookiesEarned>=1000 && Math.random()<0.1) list.push(choose([
					'If you could get some more cookies baked, that\'d be great.',
					'So. About those TPS reports.',
					'Another day in paradise!',
					'Working hard, or hardly working?'
				]));
				
				
				if (Game.TickerN%2==0 || Game.cookiesEarned>=10100000000)
				{
					if (Game.Objects['Grandma'].amount>0) list.push(choose([
					'Your rolling pins are rolling and pinning!',
					'Production is steady!'
					]));
					
					if (Game.Objects['Grandma'].amount>0) list.push(choose([
					'Your ovens are diligently baking more and more cookies.',
					'Your ovens burn a whole batch. Ah well! Still good.'
					]));
					
					if (Game.Objects['Farm'].amount>0) list.push(choose([
					'Scores of cookies come out of your kitchens.',
					'Today, new recruits are joining your kitchens!'
					]));
					
					if (Game.Objects['Factory'].amount>0) list.push(choose([
					'Your factories are producing an unending stream of baked goods.',
					'Your factory workers decide to go on strike!',
					'It\'s safety inspection day in your factories.'
					]));
					
					if (Game.Objects['Mine'].amount>0) list.push(choose([
					'Your secret recipes are kept safely inside a giant underground vault.',
					'Your chefs are working on new secret recipes!'
					]));
					
					if (Game.Objects['Shipment'].amount>0) list.push(choose([
					'Your supermarkets are bustling with happy, hungry customers.',
					'Your supermarkets are full of cookie merch!'
					]));
					
					if (Game.Objects['Alchemy lab'].amount>0) list.push(choose([
					'It\'s a new trading day at the stock exchange, and traders can\'t get enough of your shares!',
					'Your stock is doubling in value by the minute!'
					]));
					
					if (Game.Objects['Portal'].amount>0) list.push(choose([
					'You just released a new TV show episode!',
					'Your cookie-themed TV show is being adapted into a new movie!'
					]));
					
					if (Game.Objects['Time machine'].amount>0) list.push(choose([
					'Your theme parks are doing well - puddles of vomit and roller-coaster casualties are being swept under the rug!',
					'Visitors are stuffing themselves with cookies before riding your roller-coasters. You might want to hire more clean-up crews.'
					]));
					
					if (Game.Objects['Antimatter condenser'].amount>0) list.push(choose([
					'Cookiecoin is officially the most mined digital currency in the history of mankind!',
					'Cookiecoin piracy is rampant!'
					]));
					
					if (Game.Objects['Prism'].amount>0) list.push(choose([
					'Your corporate nations just gained a new parliament!',
					'You\'ve just annexed a new nation!',
					'A new nation joins the grand cookie conglomerate!'
					]));
					
					if (Game.Objects['Chancemaker'].amount>0) list.push(choose([
					'Your intergalactic federation of cookie-sponsored planets reports record-breaking profits!',
					'Billions of unwashed aliens are pleased to join your workforce as you annex their planet!',
					'New toll opened on interstellar highway, funnelling more profits into the cookie economy!'
					]));
				}
				
				if (Game.cookiesEarned<5) list.push('Such a grand day to begin a new business.');
				else if (Game.cookiesEarned<50) list.push('You\'re baking up a storm!');
				else if (Game.cookiesEarned<100) list.push('You are confident that one day, your cookie company will be the greatest on the market!');
				else if (Game.cookiesEarned<1000) list.push('Business is picking up!');
				else if (Game.cookiesEarned<5000) list.push('You\'re making sales left and right!');
				else if (Game.cookiesEarned<20000) list.push('Everyone wants to buy your cookies!');
				else if (Game.cookiesEarned<50000) list.push('You are now spending most of your day signing contracts!');
				else if (Game.cookiesEarned<500000) list.push('You\'ve been elected "business tycoon of the year"!');
				else if (Game.cookiesEarned<1000000) list.push('Your cookies are a worldwide sensation! Well done, old chap!');
				else if (Game.cookiesEarned<5000000) list.push('Your brand has made its way into popular culture. Children recite your slogans and adults reminisce them fondly!');
				else if (Game.cookiesEarned<1000000000) list.push('A business day like any other. It\'s good to be at the top!');
				else if (Game.cookiesEarned<10100000000) list.push('You look back at your career. It\'s been a fascinating journey, building your baking empire from the ground up.');//only show this for 100 millions
			}
			
			for (var i in Game.customTickers)
			{
				var arr=Game.customTickers[i]();
				for (var ii in arr) list.push(arr[ii]);
			}
			
			Game.TickerAge=Game.fps*10;
			Game.Ticker=choose(list);
			Game.AddToLog(Game.Ticker);
			Game.TickerN++;
			Game.TickerDraw();
		}
		Game.tickerL=l('commentsText');
		Game.tickerBelowL=l('commentsTextBelow');
		Game.tickerCompactL=l('compactCommentsText');
		Game.TickerDraw=function()
		{
			var str='';
			if (Game.Ticker!='') str=Game.Ticker;
			Game.tickerBelowL.innerHTML=Game.tickerL.innerHTML;
			Game.tickerL.innerHTML=str;
			Game.tickerCompactL.innerHTML=str;
			
			Game.tickerBelowL.className='commentsText';
			Game.tickerBelowL.offsetWidth=Game.tickerBelowL.offsetWidth;
			Game.tickerBelowL.className='commentsText risingAway';
			Game.tickerL.className='commentsText';
			Game.tickerL.offsetWidth=Game.tickerL.offsetWidth;
			Game.tickerL.className='commentsText risingUp';
		}
		AddEvent(Game.tickerL,'click',function(event){Game.Ticker='';Game.TickerClicks++;if (Game.TickerClicks==50) {Game.Win('Tabloid addiction');}});
		
		Game.Log=[];
		Game.AddToLog=function(what)
		{
			Game.Log.unshift(what);
			if (Game.Log.length>100) Game.Log.pop();
		}
		
		Game.vanilla=1;
		/*=====================================================================================
		BUILDINGS
		=======================================================================================*/
		Game.last=0;
		
		Game.storeToRefresh=1;
		Game.priceIncrease=1.15;
		Game.buyBulk=1;
		Game.buyMode=1;//1 for buy, -1 for sell
		Game.buyBulkOld=Game.buyBulk;//used to undo changes from holding Shift or Ctrl
		Game.buyBulkShortcut=0;//are we pressing Shift or Ctrl?
		
		Game.Objects=[];
		Game.ObjectsById=[];
		Game.ObjectsN=0;
		Game.BuildingsOwned=0;
		Game.Object=function(name,commonName,desc,icon,iconColumn,art,price,cps,buyFunction)
		{
			this.id=Game.ObjectsN;
			this.name=name;
			this.displayName=this.name;
			commonName=commonName.split('|');
			this.single=commonName[0];
			this.plural=commonName[1];
			this.actionName=commonName[2];
			this.extraName=commonName[3];
			this.extraPlural=commonName[4];
			this.desc=desc;
			this.basePrice=price;
			this.price=this.basePrice;
			this.bulkPrice=this.price;
			this.cps=cps;
			this.baseCps=this.cps;
			
			this.n=this.id;
			if (this.n!=0)
			{
				//new automated price and CpS curves
				//this.baseCps=Math.ceil(((this.n*0.5)*Math.pow(this.n*1,this.n*0.9))*10)/10;
				//this.baseCps=Math.ceil((Math.pow(this.n*1,this.n*0.5+2.35))*10)/10;//by a fortunate coincidence, this gives the 3rd, 4th and 5th buildings a CpS of 10, 69 and 420
				this.baseCps=Math.ceil((Math.pow(this.n*1,this.n*0.5+2))*10)/10;
				//this.baseCps=Math.ceil((Math.pow(this.n*1,this.n*0.45+2.10))*10)/10;
				//clamp 14,467,199 to 14,000,000 (there's probably a more elegant way to do that)
				var digits=Math.pow(10,(Math.ceil(Math.log(Math.ceil(this.baseCps))/Math.LN10)))/100;
				this.baseCps=Math.round(this.baseCps/digits)*digits;
				
				this.basePrice=(this.n*1+9+(this.n<5?0:Math.pow(this.n-5,1.75)*5))*Math.pow(10,this.n);
				//this.basePrice=(this.n*2.5+7.5)*Math.pow(10,this.n);
				var digits=Math.pow(10,(Math.ceil(Math.log(Math.ceil(this.basePrice))/Math.LN10)))/100;
				this.basePrice=Math.round(this.basePrice/digits)*digits;
				this.price=this.basePrice;
				this.bulkPrice=this.price;
			}
			
			this.totalCookies=0;
			this.storedCps=0;
			this.storedTotalCps=0;
			this.icon=icon;
			this.iconColumn=iconColumn;
			this.art=art;
			if (art.base)
			{art.pic=art.base+'.png';art.bg=art.base+'Background.png';}
			this.buyFunction=buyFunction;
			this.locked=1;
			this.level=0;
			this.vanilla=Game.vanilla;
			
			this.tieredUpgrades=[];
			this.tieredAchievs=[];
			this.synergies=[];
			
			this.amount=0;
			this.bought=0;
			this.free=0;
			
			this.eachFrame=0;
			
			this.minigameUrl=0;//if this is defined, load the specified script if the building's level is at least 1
			this.minigameName=0;
			this.onMinigame=false;
			this.minigameLoaded=false;
			
			this.switchMinigame=function(on)//change whether we're on the building's minigame
			{
				if (!Game.isMinigameReady(this)) on=false;
				if (on==-1) on=!this.onMinigame;
				this.onMinigame=on;
				if (this.id!=0)
				{
					if (this.onMinigame)
					{
						l('rowSpecial'+this.id).style.display='block';
						l('rowCanvas'+this.id).style.display='none';
					}
					else
					{
						l('rowSpecial'+this.id).style.display='none';
						l('rowCanvas'+this.id).style.display='block';
					}
				}
				this.refresh();
			}
			
			this.getPrice=function()
			{
				var price=this.basePrice*Math.pow(Game.priceIncrease,Math.max(0,this.amount-this.free));
				price=Game.modifyBuildingPrice(this,price);
				return Math.ceil(price);
			}
			this.getSumPrice=function(amount)//return how much it would cost to buy [amount] more of this building
			{
				var price=0;
				for (var i=Math.max(0,this.amount);i<Math.max(0,(this.amount)+amount);i++)
				{
					price+=this.basePrice*Math.pow(Game.priceIncrease,Math.max(0,i-this.free));
				}
				price=Game.modifyBuildingPrice(this,price);
				return Math.ceil(price);
			}
			this.getReverseSumPrice=function(amount)//return how much you'd get from selling [amount] of this building
			{
				var price=0;
				for (var i=Math.max(0,(this.amount)-amount);i<Math.max(0,this.amount);i++)
				{
					price+=this.basePrice*Math.pow(Game.priceIncrease,Math.max(0,i-this.free));
				}
				price=Game.modifyBuildingPrice(this,price);
				price*=this.getSellMultiplier();
				return Math.ceil(price);
			}
			this.getSellMultiplier=function()
			{
				var giveBack=0.5;
				if (Game.hasAura('Earth Shatterer')) giveBack=0.85;
				return giveBack;
			}
			
			this.buy=function(amount)
			{
				if (Game.buyMode==-1) {this.sell(Game.buyBulk,1);return 0;}
				var success=0;
				var moni=0;
				var bought=0;
				if (!amount) amount=Game.buyBulk;
				if (amount==-1) amount=1000;
				for (var i=0;i<amount;i++)
				{
					var price=this.getPrice();
					if (Game.cookies>=price)
					{
						bought++;
						moni+=price;
						Game.Spend(price);
						this.amount++;
						this.bought++;
						price=this.getPrice();
						this.price=price;
						if (this.buyFunction) this.buyFunction();
						Game.recalculateGains=1;
						if (this.amount==1 && this.id!=0) l('row'+this.id).className='row enabled';
						Game.BuildingsOwned++;
						success=1;
					}
				}
				if (success) {PlaySound('snd/buy'+choose([1,2,3,4])+'.mp3',0.75);this.refresh();}
				//if (moni>0 && amount>1) Game.Notify(this.name,'Bought <b>'+bought+'</b> for '+Beautify(moni)+' cookies','',2);
			}
			this.sell=function(amount,bypass)
			{
				var success=0;
				var moni=0;
				var sold=0;
				if (amount==-1) amount=this.amount;
				if (!amount) amount=Game.buyBulk;
				for (var i=0;i<amount;i++)
				{
					var price=this.getPrice();
					var giveBack=this.getSellMultiplier();
					price=Math.floor(price*giveBack);
					if (this.amount>0)
					{
						sold++;
						moni+=price;
						Game.cookies+=price;
						Game.cookiesEarned=Math.max(Game.cookies,Game.cookiesEarned);//this is to avoid players getting the cheater achievement when selling buildings that have a higher price than they used to
						this.amount--;
						price=this.getPrice();
						this.price=price;
						if (this.sellFunction) this.sellFunction();
						Game.recalculateGains=1;
						if (this.amount==0 && this.id!=0) l('row'+this.id).className='row';
						Game.BuildingsOwned--;
						success=1;
					}
				}
				if (success && Game.hasGod)
				{
					var godLvl=Game.hasGod('ruin');
					var old=Game.hasBuff('Devastation');
					if (old)
					{
						if (godLvl==1) old.multClick+=sold*0.01;
						else if (godLvl==2) old.multClick+=sold*0.005;
						else if (godLvl==3) old.multClick+=sold*0.0025;
					}
					else
					{
						if (godLvl==1) Game.gainBuff('devastation',10,1+sold*0.01);
						else if (godLvl==2) Game.gainBuff('devastation',10,1+sold*0.005);
						else if (godLvl==3) Game.gainBuff('devastation',10,1+sold*0.0025);
					}
				}
				if (success) {PlaySound('snd/sell'+choose([1,2,3,4])+'.mp3',0.75);this.refresh();}
				//if (moni>0) Game.Notify(this.name,'Sold <b>'+sold+'</b> for '+Beautify(moni)+' cookies','',2);
			}
			this.sacrifice=function(amount)//sell without getting back any money
			{
				var success=0;
				//var moni=0;
				var sold=0;
				if (amount==-1) amount=this.amount;
				if (!amount) amount=1;
				for (var i=0;i<amount;i++)
				{
					var price=this.getPrice();
					price=Math.floor(price*0.5);
					if (this.amount>0)
					{
						sold++;
						//moni+=price;
						//Game.cookies+=price;
						//Game.cookiesEarned=Math.max(Game.cookies,Game.cookiesEarned);
						this.amount--;
						price=this.getPrice();
						this.price=price;
						if (this.sellFunction) this.sellFunction();
						Game.recalculateGains=1;
						if (this.amount==0 && this.id!=0) l('row'+this.id).className='row';
						Game.BuildingsOwned--;
						success=1;
					}
				}
				if (success) {this.refresh();}
				//if (moni>0) Game.Notify(this.name,'Sold <b>'+sold+'</b> for '+Beautify(moni)+' cookies','',2);
			}
			this.buyFree=function(amount)//unlike getFree, this still increases the price
			{
				for (var i=0;i<amount;i++)
				{
					if (Game.cookies>=price)
					{
						this.amount++;
						this.bought++;
						this.price=this.getPrice();
						Game.recalculateGains=1;
						if (this.amount==1 && this.id!=0) l('row'+this.id).className='row enabled';
						Game.BuildingsOwned++;
					}
				}
				this.refresh();
			}
			this.getFree=function(amount)//get X of this building for free, with the price behaving as if you still didn't have them
			{
				this.amount+=amount;
				this.bought+=amount;
				this.free+=amount;
				Game.BuildingsOwned+=amount;
				this.refresh();
			}
			this.getFreeRanks=function(amount)//this building's price behaves as if you had X less of it
			{
				this.free+=amount;
				this.refresh();
			}
			
			this.tooltip=function()
			{
				var me=this;
				var desc=me.desc;
				var name=me.name;
				if (Game.season=='fools')
				{
					if (!Game.foolObjects[me.name])
					{
						name=Game.foolObjects['Unknown'].name;
						desc=Game.foolObjects['Unknown'].desc;
					}
					else
					{
						name=Game.foolObjects[me.name].name;
						desc=Game.foolObjects[me.name].desc;
					}
				}
				var icon=[me.iconColumn,0];
				if (me.locked)
				{
					name='???';
					desc='';
					icon=[0,7];
				}
				//if (l('rowInfo'+me.id) && Game.drawT%10==0) l('rowInfoContent'+me.id).innerHTML='&bull; '+me.amount+' '+(me.amount==1?me.single:me.plural)+'<br>&bull; producing '+Beautify(me.storedTotalCps,1)+' '+(me.storedTotalCps==1?'cookie':'cookies')+' per second<br>&bull; total : '+Beautify(me.totalCookies)+' '+(Math.floor(me.totalCookies)==1?'cookie':'cookies')+' '+me.actionName;
				return '<div style="min-width:350px;padding:8px;"><div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div><div style="float:right;"><span class="price">'+Beautify(Math.round(me.price))+'</span></div><div class="name">'+name+'</div>'+'<small>[owned : '+me.amount+'</small>]'+(me.free>0?' <small>[free : '+me.free+'</small>!]':'')+
				'<div class="line"></div><div class="description">'+desc+'</div>'+
				(me.totalCookies>0?(
					'<div class="line"></div><div class="data">'+
					(me.amount>0?'&bull; each '+me.single+' produces <b>'+Beautify((me.storedTotalCps/me.amount)*Game.globalCpsMult,1)+'</b> '+((me.storedTotalCps/me.amount)*Game.globalCpsMult==1?'cookie':'cookies')+' per second<br>':'')+
					'&bull; '+me.amount+' '+(me.amount==1?me.single:me.plural)+' producing <b>'+Beautify(me.storedTotalCps*Game.globalCpsMult,1)+'</b> '+(me.storedTotalCps*Game.globalCpsMult==1?'cookie':'cookies')+' per second (<b>'+Beautify(Game.cookiesPs>0?((me.amount>0?((me.storedTotalCps*Game.globalCpsMult)/Game.cookiesPs):0)*100):0,1)+'%</b> of total)<br>'+
					'&bull; <b>'+Beautify(me.totalCookies)+'</b> '+(Math.floor(me.totalCookies)==1?'cookie':'cookies')+' '+me.actionName+' so far</div>'
				):'')+
				'</div>';
			}
			this.levelTooltip=function()
			{
				var me=this;
				return '<div style="width:280px;padding:8px;"><b>Level '+Beautify(me.level)+' '+me.plural+'</b><div class="line"></div>'+(me.level==1?me.extraName:me.extraPlural).replace('[X]',Beautify(me.level))+' granting +'+Beautify(me.level)+'% '+me.name+' CpS.<div class="line"></div>Click to level up for <span class="price lump'+(Game.lumps>=me.level+1?'':' disabled')+'">'+Beautify(me.level+1)+' sugar lump'+(me.level==0?'':'s')+'</span>.'+((me.level==0 && me.minigameUrl)?'<div class="line"></div><b>Levelling up this building unlocks a minigame.</b>':'')+'</div>';
			}
			this.levelUp=function()
			{
				var me=this;
				if (Game.lumps<me.level+1) return 0;
				Game.lumps-=me.level+1;
				me.level+=1;
				if (me.level>=10 && me.levelAchiev10) Game.Win(me.levelAchiev10.name);
				PlaySound('snd/upgrade.mp3',0.6);
				Game.LoadMinigames();
				me.refresh();
				if (l('productLevel'+me.id)){var rect=l('productLevel'+me.id).getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24);}
				Game.recalculateGains=1;
			}
			
			this.refresh=function()//show/hide the building display based on its amount, and redraw it
			{
				this.price=this.getPrice();
				if (Game.buyMode==1) this.bulkPrice=this.getSumPrice(Game.buyBulk);
				else if (Game.buyMode==-1 && Game.buyBulk==-1) this.bulkPrice=this.getReverseSumPrice(1000);
				else if (Game.buyMode==-1) this.bulkPrice=this.getReverseSumPrice(Game.buyBulk);
				this.rebuild();
				if (this.amount==0 && this.id!=0) l('row'+this.id).className='row';
				else if (this.amount>0 && this.id!=0) l('row'+this.id).className='row enabled';
				if (!this.onMinigame) this.draw();
			}
			this.rebuild=function()
			{
				var me=this;
				//var classes='product';
				var price=me.bulkPrice;
				/*if (Game.cookiesEarned>=me.basePrice || me.bought>0) {classes+=' unlocked';me.locked=0;} else {classes+=' locked';me.locked=1;}
				if (Game.cookies>=price) classes+=' enabled'; else classes+=' disabled';
				if (me.l.className.indexOf('toggledOff')!=-1) classes+=' toggledOff';
				*/
				var icon=[0,me.icon];
				var iconOff=[1,me.icon];
				if (me.iconFunc) icon=me.iconFunc();
				
				var desc=me.desc;
				var name=me.name;
				var displayName=me.displayName;
				if (Game.season=='fools')
				{
					if (!Game.foolObjects[me.name])
					{
						icon=[2,0];
						iconOff=[3,0];
						name=Game.foolObjects['Unknown'].name;
						desc=Game.foolObjects['Unknown'].desc;
					}
					else
					{
						icon=[2,me.icon];
						iconOff=[3,me.icon];
						name=Game.foolObjects[me.name].name;
						desc=Game.foolObjects[me.name].desc;
					}
					displayName=name;
					if (name.length>16) displayName='<span style="font-size:75%;">'+name+'</span>';
				}
				icon=[icon[0]*64,icon[1]*64];
				iconOff=[iconOff[0]*64,iconOff[1]*64];
				
				//me.l.className=classes;
				//l('productIcon'+me.id).style.backgroundImage='url(img/'+icon+')';
				l('productIcon'+me.id).style.backgroundPosition='-'+icon[0]+'px -'+icon[1]+'px';
				//l('productIconOff'+me.id).style.backgroundImage='url(img/'+iconOff+')';
				l('productIconOff'+me.id).style.backgroundPosition='-'+iconOff[0]+'px -'+iconOff[1]+'px';
				l('productName'+me.id).innerHTML=displayName;
				l('productOwned'+me.id).innerHTML=me.amount?me.amount:'';
				l('productPrice'+me.id).innerHTML=Beautify(Math.round(price));
				l('productPriceMult'+me.id).innerHTML=(Game.buyBulk>1)?('x'+Game.buyBulk+' '):'';
				l('productLevel'+me.id).innerHTML='lvl '+Beautify(me.level);
				if (Game.isMinigameReady(me))
				{
					l('productMinigameButton'+me.id).style.display='block';
					if (!me.onMinigame) l('productMinigameButton'+me.id).innerHTML='View '+me.minigameName;
					else l('productMinigameButton'+me.id).innerHTML='Close '+me.minigameName;
				}
				else l('productMinigameButton'+me.id).style.display='none';
			}
			
			this.draw=function(){};
			
			if (this.id==0)
			{
				var str='<div class="productButtons">';
					str+='<div id="productLevel'+this.id+'" class="productButton productLevel" onclick="Game.ObjectsById['+this.id+'].levelUp()" '+Game.getDynamicTooltip('Game.ObjectsById['+this.id+'].levelTooltip')+'></div>';
					str+='<div id="productMinigameButton'+this.id+'" class="productButton productMinigameButton" onclick="Game.ObjectsById['+this.id+'].switchMinigame(-1);PlaySound(Game.ObjectsById['+this.id+'].onMinigame?\'snd/clickOn.mp3\':\'snd/clickOff.mp3\');"></div>';
				str+='</div>';
				l('sectionLeftExtra').innerHTML=l('sectionLeftExtra').innerHTML+str;
			}
			else//draw it
			{
				var str='<div class="row" id="row'+this.id+'"><div class="separatorBottom"></div>';
				str+='<div class="productButtons">';
					str+='<div id="productLevel'+this.id+'" class="productButton productLevel" onclick="Game.ObjectsById['+this.id+'].levelUp()" '+Game.getDynamicTooltip('Game.ObjectsById['+this.id+'].levelTooltip')+'></div>';
					str+='<div id="productMinigameButton'+this.id+'" class="productButton productMinigameButton" onclick="Game.ObjectsById['+this.id+'].switchMinigame(-1);PlaySound(Game.ObjectsById['+this.id+'].onMinigame?\'snd/clickOn.mp3\':\'snd/clickOff.mp3\');"></div>';
				str+='</div>';
				str+='<canvas class="rowCanvas" id="rowCanvas'+this.id+'"></canvas>';
				str+='<div class="rowSpecial" id="rowSpecial'+this.id+'"></div>';
				str+='</div>';
				l('rows').innerHTML=l('rows').innerHTML+str;
				
				//building canvas
				this.pics=[];
				
				this.redraw=function()
				{
					this.pics=[];
				}
				this.draw=function()
				{
					//this needs to be cached
					this.canvas.width=this.canvas.clientWidth;
					this.canvas.height=this.canvas.clientHeight;
					var ctx=this.ctx;
					//clear
					//ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
					ctx.globalAlpha=1;
					
					//pic : a loaded picture or a function returning a loaded picture
					//bg : a loaded picture or a function returning a loaded picture - tiled as the background, 128x128
					//xV : the pictures will have a random horizontal shift by this many pixels
					//yV : the pictures will have a random vertical shift by this many pixels
					//w : how many pixels between each picture (or row of pictures)
					//x : horizontal offset
					//y : vertical offset (+32)
					//rows : if >1, arrange the pictures in rows containing this many pictures
					
					var pic=this.art.pic;
					var bg=this.art.bg;
					var xV=this.art.xV||0;
					var yV=this.art.yV||0;
					var w=this.art.w||48;
					var offX=this.art.x||0;
					var offY=this.art.y||0;
					var rows=this.art.rows||1;

					if (typeof(bg)=='string') ctx.fillPattern(Pic(this.art.bg),0,0,this.canvas.width,this.canvas.height,128,128);
					else bg(this,ctx);
					/*
					ctx.globalAlpha=0.5;
					if (typeof(bg)=='string')//test
					{
						ctx.fillPattern(Pic(this.art.bg),-128+Game.T%128,0,this.canvas.width+128,this.canvas.height,128,128);
						ctx.fillPattern(Pic(this.art.bg),-128+Math.floor(Game.T/2)%128,-128+Math.floor(Game.T/2)%128,this.canvas.width+128,this.canvas.height+128,128,128);
					}
					ctx.globalAlpha=1;
					*/
					var i=this.pics.length;
					while (i<this.amount)
					{
						var x=0;
						var y=0;
						if (rows!=1)
						{
							x=Math.floor(i/rows)*w+((i%rows)/rows)*w+Math.floor((Math.random()-0.5)*xV)+offX;
							y=32+Math.floor((Math.random()-0.5)*yV)+((-rows/2)*32/2+(i%rows)*32/2)+offY;
						}
						else
						{
							x=i*w+Math.floor((Math.random()-0.5)*xV)+offX;
							y=32+Math.floor((Math.random()-0.5)*yV)+offY;
						}
						var usedPic=(typeof(pic)=='string'?pic:pic(this,i));
						this.pics.push({x:x,y:y,z:y,pic:usedPic,id:i});
						i++;
					}
					while (i>this.amount)
					{
						this.pics.sort(Game.sortSpritesById);
						this.pics.pop();
						i--;
					}
					
					this.pics.sort(Game.sortSprites);
					
					for (var i in this.pics)
					{
						ctx.drawImage(Pic(this.pics[i].pic),Math.floor(this.pics[i].x),Math.floor(this.pics[i].y));
					}
					
					/*
					var picX=this.id;
					var picY=12;
					var w=1;
					var h=1;
					var w=Math.abs(Math.cos(Game.T*0.2+this.id*2-0.3))*0.2+0.8;
					var h=Math.abs(Math.sin(Game.T*0.2+this.id*2))*0.3+0.7;
					var x=64+Math.cos(Game.T*0.19+this.id*2)*8-24*w;
					var y=128-Math.abs(Math.pow(Math.sin(Game.T*0.2+this.id*2),5)*16)-48*h;
					ctx.drawImage(Pic('icons.png'),picX*48,picY*48,48,48,Math.floor(x),Math.floor(y),48*w,48*h);
					*/
				}
			}
			
			Game.last=this;
			Game.Objects[this.name]=this;
			Game.ObjectsById[this.id]=this;
			Game.ObjectsN++;
			return this;
		}
		
		Game.DrawBuildings=function()//draw building displays with canvas
		{
			if (Game.drawT%3==0)
			{
				for (var i in Game.Objects)
				{
					var me=Game.Objects[i];
					if (me.id>0) me.draw();
				}
			}
		}
		window.addEventListener('resize',function(event)
		{
			Game.DrawBuildings();
		});
		
		Game.sortSprites=function(a,b)
		{
			if (a.z>b.z) return 1;
			else if (a.z<b.z) return -1;
			else return 0;
		}
		Game.sortSpritesById=function(a,b)
		{
			if (a.id>b.id) return 1;
			else if (a.id<b.id) return -1;
			else return 0;
		}
		
		Game.modifyBuildingPrice=function(building,price)
		{
			if (Game.Has('Season savings')) price*=0.99;
			if (Game.Has('Santa\'s dominion')) price*=0.99;
			if (Game.Has('Faberge egg')) price*=0.99;
			if (Game.Has('Divine discount')) price*=0.99;
			if (Game.hasAura('Fierce Hoarder')) price*=0.98;
			if (Game.hasBuff('Everything must go')) price*=0.95;
			if (Game.hasBuff('Crafty pixies')) price*=0.98;
			if (Game.hasBuff('Nasty goblins')) price*=1.02;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('creation');
				if (godLvl==1) price*=0.93;
				else if (godLvl==2) price*=0.95;
				else if (godLvl==3) price*=0.98;
			}
			return price;
		}
		
		Game.storeBulkButton=function(id)
		{
			if (id==0) Game.buyMode=1;
			else if (id==1) Game.buyMode=-1;
			else if (id==2) Game.buyBulk=1;
			else if (id==3) Game.buyBulk=10;
			else if (id==4) Game.buyBulk=100;
			else if (id==5) Game.buyBulk=-1;
			
			if (Game.buyMode==1 && Game.buyBulk==-1) Game.buyBulk=100;
			
			if (Game.buyMode==1) l('storeBulkBuy').className='storeBulkMode selected'; else l('storeBulkBuy').className='storeBulkMode';
			if (Game.buyMode==-1) l('storeBulkSell').className='storeBulkMode selected'; else l('storeBulkSell').className='storeBulkMode';
			
			if (Game.buyBulk==1) l('storeBulk1').className='storeBulkAmount selected'; else l('storeBulk1').className='storeBulkAmount';
			if (Game.buyBulk==10) l('storeBulk10').className='storeBulkAmount selected'; else l('storeBulk10').className='storeBulkAmount';
			if (Game.buyBulk==100) l('storeBulk100').className='storeBulkAmount selected'; else l('storeBulk100').className='storeBulkAmount';
			if (Game.buyBulk==-1) l('storeBulkMax').className='storeBulkAmount selected'; else l('storeBulkMax').className='storeBulkAmount';
			
			if (Game.buyMode==1)
			{
				l('storeBulkMax').style.visibility='hidden';
				l('products').className='storeSection';
			}
			else
			{
				l('storeBulkMax').style.visibility='visible';
				l('products').className='storeSection selling';
			}
			
			Game.storeToRefresh=1;
			if (id!=-1) PlaySound('snd/tick.mp3');
		}
		Game.BuildStore=function()//create the DOM for the store's buildings
		{
			var str='';
			str+='<div id="storeBulk" '+Game.getTooltip(
							'<div style="padding:8px;min-width:200px;text-align:center;font-size:11px;">You can also press <b>Ctrl</b> to bulk-buy or sell <b>10</b> of a building at a time, or <b>Shift</b> for <b>100</b>.</div>'
							,'store')+
				'>'+
				'<div id="storeBulkBuy" class="storeBulkMode" '+Game.clickStr+'="Game.storeBulkButton(0);">Buy</div>'+
				'<div id="storeBulkSell" class="storeBulkMode" '+Game.clickStr+'="Game.storeBulkButton(1);">Sell</div>'+
				'<div id="storeBulk1" class="storeBulkAmount" '+Game.clickStr+'="Game.storeBulkButton(2);">1</div>'+
				'<div id="storeBulk10" class="storeBulkAmount" '+Game.clickStr+'="Game.storeBulkButton(3);">10</div>'+
				'<div id="storeBulk100" class="storeBulkAmount" '+Game.clickStr+'="Game.storeBulkButton(4);">100</div>'+
				'<div id="storeBulkMax" class="storeBulkAmount" '+Game.clickStr+'="Game.storeBulkButton(5);">all</div>'+
				'</div>';
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				str+='<div class="product toggledOff" '+Game.getDynamicTooltip('Game.ObjectsById['+me.id+'].tooltip','store')+' id="product'+me.id+'"><div class="icon off" id="productIconOff'+me.id+'" style=""></div><div class="icon" id="productIcon'+me.id+'" style=""></div><div class="content"><div class="lockedTitle">???</div><div class="title" id="productName'+me.id+'"></div><span class="priceMult" id="productPriceMult'+me.id+'"></span><span class="price" id="productPrice'+me.id+'"></span><div class="title owned" id="productOwned'+me.id+'"></div></div>'+
				/*'<div class="buySell"><div style="left:0px;" id="buttonBuy10-'+me.id+'">Buy 10</div><div style="left:100px;" id="buttonSell-'+me.id+'">Sell 1</div><div style="left:200px;" id="buttonSellAll-'+me.id+'">Sell all</div></div>'+*/
				'</div>';
			}
			l('products').innerHTML=str;
			
			Game.storeBulkButton(-1);
			
			var SellAllPrompt=function(id)
			{
				return function(id){Game.Prompt('<div class="block">Do you really want to sell your '+Game.ObjectsById[id].amount+' '+(Game.ObjectsById[id].amount==1?Game.ObjectsById[id].single:Game.ObjectsById[id].plural)+'?</div>',[['Yes','Game.ObjectsById['+id+'].sell(-1);Game.ClosePrompt();'],['No','Game.ClosePrompt();']]);}(id);
			}
			
			Game.ClickProduct=function(what)
			{
				Game.ObjectsById[what].buy();
			}
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.l=l('product'+me.id);
				
				//these are a bit messy but ah well
				if (!Game.touchEvents)
				{
					AddEvent(me.l,'click',function(what){return function(){Game.ClickProduct(what);};}(me.id));
				}
				else
				{
					AddEvent(me.l,'touchend',function(what){return function(){Game.ClickProduct(what);};}(me.id));
				}
			}
		}
		
		Game.RefreshStore=function()//refresh the store's buildings
		{
			for (var i in Game.Objects)
			{
				Game.Objects[i].refresh();
			}
			Game.storeToRefresh=0;
		}
		
		Game.ComputeCps=function(base,mult,bonus)
		{
			if (!bonus) bonus=0;
			return ((base)*(Math.pow(2,mult))+bonus);
		}
		
		Game.isMinigameReady=function(me)
		{return (me.minigameUrl && me.minigameLoaded && me.level>0);}
		Game.scriptBindings=[];
		Game.LoadMinigames=function()//load scripts for each minigame
		{
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				if (me.minigameUrl && me.level>0 && !me.minigameLoaded && !l('minigameScript-'+me.id))
				{
					//we're only loading the minigame scripts that aren't loaded yet and which have enough building level
					//we call this function on building level up and on load
					//console.log('Loading script '+me.minigameUrl+'...');
					setTimeout(function(me){return function(){
						var script=document.createElement('script');
						script.id='minigameScript-'+me.id;
						Game.scriptBindings['minigameScript-'+me.id]=me;
						script.setAttribute('src',me.minigameUrl+'?r='+Game.version);
						script.onload=function(me,script){return function(){Game.scriptLoaded(me,script);}}(me,'minigameScript-'+me.id);
						document.head.appendChild(script);
					}}(me),10);
				}
			}
		}
		Game.scriptLoaded=function(who,script)
		{
			who.minigameLoaded=true;
			who.refresh();
			who.minigame.launch();
			if (who.minigameSave) {who.minigame.reset();who.minigame.load(who.minigameSave);who.minigameSave=0;}
		}
		
		Game.magicCpS=function(what)
		{
			/*
			if (Game.Objects[what].amount>=250)
			{
				//this makes buildings give 1% more cookies for every building over 250.
				//this turns out to be rather stupidly overpowered.
				var n=Game.Objects[what].amount-250;
				return 1+Math.pow(1.01,n);
			}
			else return 1;
			*/
			return 1;
		}
		
		//define objects
		new Game.Object('Cursor','cursor|cursors|clicked|[X] extra finger|[X] extra fingers','Autoclicks once every 10 seconds.',0,0,{},15,function(){
			var add=0;
			if (Game.Has('Thousand fingers')) add+=		0.1;
			if (Game.Has('Million fingers')) add+=		0.5;
			if (Game.Has('Billion fingers')) add+=		5;
			if (Game.Has('Trillion fingers')) add+=		50;
			if (Game.Has('Quadrillion fingers')) add+=	500;
			if (Game.Has('Quintillion fingers')) add+=	5000;
			if (Game.Has('Sextillion fingers')) add+=	50000;
			if (Game.Has('Septillion fingers')) add+=	500000;
			if (Game.Has('Octillion fingers')) add+=	5000000;
			var mult=1;
			var num=0;
			for (var i in Game.Objects) {if (Game.Objects[i].name!='Cursor') num+=Game.Objects[i].amount;}
			add=add*num;
			mult*=Game.magicCpS('Cursor');
			return Game.ComputeCps(0.1,Game.Has('Reinforced index finger')+Game.Has('Carpal tunnel prevention cream')+Game.Has('Ambidextrous'),add)*mult;
		},function(){
			if (this.amount>=1) Game.Unlock(['Reinforced index finger','Carpal tunnel prevention cream']);
			if (this.amount>=10) Game.Unlock('Ambidextrous');
			if (this.amount>=25) Game.Unlock('Thousand fingers');
			if (this.amount>=50) Game.Unlock('Million fingers');
			if (this.amount>=100) Game.Unlock('Billion fingers');
			if (this.amount>=150) Game.Unlock('Trillion fingers');
			if (this.amount>=200) Game.Unlock('Quadrillion fingers');
			if (this.amount>=250) Game.Unlock('Quintillion fingers');
			if (this.amount>=300) Game.Unlock('Sextillion fingers');
			if (this.amount>=350) Game.Unlock('Septillion fingers');
			if (this.amount>=400) Game.Unlock('Octillion fingers');
			
			if (this.amount>=1) Game.Win('Click');if (this.amount>=2) Game.Win('Double-click');if (this.amount>=50) Game.Win('Mouse wheel');if (this.amount>=100) Game.Win('Of Mice and Men');if (this.amount>=200) Game.Win('The Digital');if (this.amount>=300) Game.Win('Extreme polydactyly');if (this.amount>=400) Game.Win('Dr. T');if (this.amount>=500) Game.Win('Thumbs, phalanges, metacarpals');
		});
		
		Game.SpecialGrandmaUnlock=15;
		new Game.Object('Grandma','grandma|grandmas|baked|Grandmas are [X] year older|Grandmas are [X] years older','A nice grandma to bake more cookies.',1,1,{pic:function(i){
			var list=['grandma'];
			if (Game.Has('Farmer grandmas')) list.push('farmerGrandma');
			if (Game.Has('Worker grandmas')) list.push('workerGrandma');
			if (Game.Has('Miner grandmas')) list.push('minerGrandma');
			if (Game.Has('Cosmic grandmas')) list.push('cosmicGrandma');
			if (Game.Has('Transmuted grandmas')) list.push('transmutedGrandma');
			if (Game.Has('Altered grandmas')) list.push('alteredGrandma');
			if (Game.Has('Grandmas\' grandmas')) list.push('grandmasGrandma');
			if (Game.Has('Antigrandmas')) list.push('antiGrandma');
			if (Game.Has('Rainbow grandmas')) list.push('rainbowGrandma');
			if (Game.Has('Banker grandmas')) list.push('bankGrandma');
			if (Game.Has('Priestess grandmas')) list.push('templeGrandma');
			if (Game.Has('Witch grandmas')) list.push('witchGrandma');
			if (Game.Has('Lucky grandmas')) list.push('luckyGrandma');
			if (Game.season=='christmas') list.push('elfGrandma');
			if (Game.season=='easter') list.push('bunnyGrandma');
			return choose(list)+'.png';
		},bg:'grandmaBackground.png',xV:8,yV:8,w:32,rows:3,x:0,y:16},100,function(me){
			var mult=1;
			if (Game.Has('Farmer grandmas')) mult*=2;
			if (Game.Has('Worker grandmas')) mult*=2;
			if (Game.Has('Miner grandmas')) mult*=2;
			if (Game.Has('Cosmic grandmas')) mult*=2;
			if (Game.Has('Transmuted grandmas')) mult*=2;
			if (Game.Has('Altered grandmas')) mult*=2;
			if (Game.Has('Grandmas\' grandmas')) mult*=2;
			if (Game.Has('Antigrandmas')) mult*=2;
			if (Game.Has('Rainbow grandmas')) mult*=2;
			if (Game.Has('Banker grandmas')) mult*=2;
			if (Game.Has('Priestess grandmas')) mult*=2;
			if (Game.Has('Witch grandmas')) mult*=2;
			if (Game.Has('Lucky grandmas')) mult*=2;
			if (Game.Has('Bingo center/Research facility')) mult*=4;
			if (Game.Has('Ritual rolling pins')) mult*=2;
			if (Game.Has('Naughty list')) mult*=2;
			
			mult*=Game.GetTieredCpsMult(me);

			var add=0;
			if (Game.Has('One mind')) add+=Game.Objects['Grandma'].amount*0.02;
			if (Game.Has('Communal brainsweep')) add+=Game.Objects['Grandma'].amount*0.02;
			if (Game.Has('Elder Pact')) add+=Game.Objects['Portal'].amount*0.05;
			
			var num=0;
			for (var i in Game.Objects) {if (Game.Objects[i].name!='Grandma') num+=Game.Objects[i].amount;}
			if (Game.hasAura('Elder Battalion')) mult*=1+0.01*num;
			
			mult*=Game.magicCpS(me.name);
			
			return (me.baseCps+add)*mult;
		},function(){
			Game.UnlockTiered(this);
		});
		Game.last.sellFunction=function()
		{
			Game.Win('Just wrong');
			if (this.amount==0)
			{
				Game.Lock('Elder Pledge');
				Game.CollectWrinklers();
				Game.pledgeT=0;
			}
		};
		Game.last.iconFunc=function(type){
			var grandmaIcons=[[0,1],[0,2],[1,2],[2,2]];
			if (type=='off') return [0,1];
			return grandmaIcons[Game.elderWrath];
		};
		
		
		new Game.Object('Farm','farm|farms|harvested|[X] more acre|[X] more acres','Grows cookie plants from cookie seeds.',3,2,{base:'farm',xV:8,yV:8,w:64,rows:2,x:0,y:16},500,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Farmer grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Farmer grandmas');
		});
		
		new Game.Object('Mine','mine|mines|mined|[X] mile deeper|[X] miles deeper','Mines out cookie dough and chocolate chips.',4,3,{base:'mine',xV:16,yV:16,w:64,rows:2,x:0,y:24},10000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Miner grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Miner grandmas');
		});
		
		new Game.Object('Factory','factory|factories|mass-produced|[X] additional patent|[X] additional patents','Produces large quantities of cookies.',5,4,{base:'factory',xV:8,yV:0,w:64,rows:1,x:0,y:-22},3000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Worker grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Worker grandmas');
		});
		
		new Game.Object('Bank','bank|banks|banked|Interest rates [X]% better|Interest rates [X]% better','Generates cookies from interest.',6,15,{base:'bank',xV:8,yV:4,w:56,rows:1,x:0,y:13},0,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Banker grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Banker grandmas');
		});
		
		new Game.Object('Temple','temple|temples|discovered|[X] sacred artifact retrieved|[X] sacred artifacts retrieved','Full of precious, ancient chocolate.',7,16,{base:'temple',xV:8,yV:4,w:72,rows:2,x:0,y:-5},0,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Priestess grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Priestess grandmas');
		});
		Game.last.minigameUrl='minigamePantheon.js';
		Game.last.minigameName='Pantheon';
		
		new Game.Object('Wizard tower','wizard tower|wizard towers|summoned|Incantations have [X] more syllable|Incantations have [X] more syllables','Summons cookies with magic spells.',8,17,{base:'wizardtower',xV:16,yV:16,w:48,rows:2,x:0,y:20},0,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Witch grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Witch grandmas');
		});
		Game.last.minigameUrl='minigameGrimoire.js';
		Game.last.minigameName='Grimoire';
		
		new Game.Object('Shipment','shipment|shipments|shipped|[X] galaxy fully explored|[X] galaxies fully explored','Brings in fresh cookies from the cookie planet.',9,5,{base:'shipment',xV:16,yV:16,w:64,rows:1,x:0,y:0},40000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Cosmic grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Cosmic grandmas');
		});
		
		new Game.Object('Alchemy lab','alchemy lab|alchemy labs|transmuted|[X] primordial element mastered|[X] primordial elements mastered','Turns gold into cookies!',10,6,{base:'alchemylab',xV:16,yV:16,w:64,rows:2,x:0,y:16},200000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Transmuted grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Transmuted grandmas');
		});
		
		new Game.Object('Portal','portal|portals|retrieved|[X] dimension enslaved|[X] dimensions enslaved','Opens a door to the Cookieverse.',11,7,{base:'portal',xV:32,yV:32,w:64,rows:2,x:0,y:0},1666666,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Altered grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Altered grandmas');
		});
		
		new Game.Object('Time machine','time machine|time machines|recovered|[X] century secured|[X] centuries secured','Brings cookies from the past, before they were even eaten.',12,8,{base:'timemachine',xV:32,yV:32,w:64,rows:1,x:0,y:0},123456789,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Grandmas\' grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Grandmas\' grandmas');
		});
		
		new Game.Object('Antimatter condenser','antimatter condenser|antimatter condensers|condensed|[X] extra quark flavor|[X] extra quark flavors','Condenses the antimatter in the universe into cookies.',13,13,{base:'antimattercondenser',xV:0,yV:64,w:64,rows:1,x:0,y:0},3999999999,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Antigrandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Antigrandmas');
		});
		Game.last.displayName='<span style="font-size:65%;position:relative;bottom:4px;">Antimatter condenser</span>';//shrink the name since it's so large
		
		new Game.Object('Prism','prism|prisms|converted|[X] new color discovered|[X] new colors discovered','Converts light itself into cookies.',14,14,{base:'prism',xV:16,yV:4,w:64,rows:1,x:0,y:20},75000000000,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Rainbow grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Rainbow grandmas');
		});
		
		new Game.Object('Chancemaker','chancemaker|chancemakers|spontaneously generated|Chancemakers are powered by [X]-leaf clovers|Chancemakers are powered by [X]-leaf clovers','Generates cookies out of thin air through sheer luck.',15,19,{base:'chancemaker',xV:8,yV:64,w:64,rows:1,x:0,y:0},77777777777,function(me){
			var mult=1;
			mult*=Game.GetTieredCpsMult(me);
			if (Game.Has('Lucky grandmas')) mult*=Game.getGrandmaSynergyUpgradeMultiplier(me.name);
			mult*=Game.magicCpS(me.name);
			return me.baseCps*mult;
		},function(){
			Game.UnlockTiered(this);
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Lucky grandmas');
		});
		
		Game.foolObjects={
			'Unknown':{name:'Investment',desc:'You\'re not sure what this does, you just know it means profit.',icon:0},
			'Cursor':{name:'Rolling pin',desc:'Essential in flattening dough. The first step in cookie-making.',icon:0},
			'Grandma':{name:'Oven',desc:'A crucial element of baking cookies.',icon:1},
			'Farm':{name:'Kitchen',desc:'The more kitchens, the more cookies your employees can produce.',icon:2},
			'Mine':{name:'Secret recipe',desc:'These give you the edge you need to outsell those pesky competitors.',icon:3},
			'Factory':{name:'Factory',desc:'Mass production is the future of baking. Seize the day, and synergize!',icon:4},
			'Bank':{name:'Investor',desc:'Business folks with a nose for profit, ready to finance your venture as long as there\'s money to be made.',icon:5},
			'Temple':{name:'Like',desc:'Your social media page is going viral! Amassing likes is the key to a lasting online presence and juicy advertising deals.',icon:9},
			'Wizard tower':{name:'Meme',desc:'Cookie memes are all the rage! With just the right amount of social media astroturfing, your brand image will be all over the cyberspace.',icon:6},
			'Shipment':{name:'Supermarket',desc:'A gigantic cookie emporium - your very own retail chain.',icon:7},
			'Alchemy lab':{name:'Stock share',desc:'You\'re officially on the stock market, and everyone wants a piece!',icon:8},
			'Portal':{name:'TV show',desc:'Your cookies have their own sitcom! Hilarious baking hijinks set to the cheesiest laughtrack.',icon:10},
			'Time machine':{name:'Theme park',desc:'Cookie theme parks, full of mascots and roller-coasters. Build one, build a hundred!',icon:11},
			'Antimatter condenser':{name:'Cookiecoin',desc:'A virtual currency, already replacing regular money in some small countries.',icon:12},
			'Prism':{name:'Corporate country',desc:'You\'ve made it to the top, and you can now buy entire nations to further your corporate greed. Godspeed.',icon:13},
			'Chancemaker':{name:'Privatized planet',desc:'Actually, you know what\'s cool? A whole planet dedicated to producing, advertising, selling, and consuming your cookies.',icon:15},
		};
		
		
		//build store
		Game.BuildStore();
		//build object displays
		for (var i in Game.Objects)
		{
			var me=Game.Objects[i];
			if (me.id>0)
			{
				me.canvas=l('rowCanvas'+me.id);
				me.ctx=me.canvas.getContext('2d',{alpha:false});
				me.pics=[];
			}
		}
		
		/*=====================================================================================
		UPGRADES
		=======================================================================================*/
		Game.upgradesToRebuild=1;
		Game.Upgrades=[];
		Game.UpgradesById=[];
		Game.UpgradesN=0;
		Game.UpgradesInStore=[];
		Game.UpgradesOwned=0;
		Game.Upgrade=function(name,desc,price,icon,buyFunction)
		{
			this.id=Game.UpgradesN;
			this.name=name;
			this.desc=desc;
			this.baseDesc=this.desc;
			this.desc=BeautifyInText(this.baseDesc);
			this.basePrice=price;
			this.icon=icon;
			this.iconFunction=0;
			this.buyFunction=buyFunction;
			/*this.unlockFunction=unlockFunction;
			this.unlocked=(this.unlockFunction?0:1);*/
			this.unlocked=0;
			this.bought=0;
			this.order=this.id;
			if (order) this.order=order+this.id*0.001;
			this.pool='';//can be '', cookie, toggle, debug, prestige, prestigeDecor, tech, or unused
			if (pool) this.pool=pool;
			this.power=0;
			if (power) this.power=power;
			this.vanilla=Game.vanilla;
			this.techUnlock=[];
			this.parents=[];
			this.type='upgrade';
			this.tier=0;
			this.buildingTie=0;//of what building is this a tiered upgrade of ?
			
			Game.last=this;
			Game.Upgrades[this.name]=this;
			Game.UpgradesById[this.id]=this;
			Game.UpgradesN++;
			return this;
		}
		
		Game.Upgrade.prototype.getPrice=function()
		{
			var price=this.basePrice;
			if (this.priceFunc) price=this.priceFunc();
			if (this.pool!='prestige')
			{
				if (Game.Has('Toy workshop')) price*=0.95;
				if (Game.Has('Five-finger discount')) price*=Math.pow(0.99,Game.Objects['Cursor'].amount/100);
				if (Game.Has('Santa\'s dominion')) price*=0.98;
				if (Game.Has('Faberge egg')) price*=0.99;
				if (Game.Has('Divine sales')) price*=0.99;
				if (Game.hasBuff('Haggler\'s luck')) price*=0.98;
				if (Game.hasBuff('Haggler\'s misery')) price*=1.02;
				if (Game.hasAura('Master of the Armory')) price*=0.98;
				if (this.pool=='cookie' && Game.Has('Divine bakeries')) price/=5;
			}
			return Math.ceil(price);
		}
		
		Game.Upgrade.prototype.canBuy=function()
		{
			if (Game.cookies>=this.getPrice()) return true; else return false;
		}
		
		Game.Upgrade.prototype.buy=function(bypass)
		{
			var success=0;
			var cancelPurchase=0;
			if (this.clickFunction && !bypass) cancelPurchase=!this.clickFunction();
			if (!cancelPurchase)
			{
				if (this.choicesFunction)
				{
					if (Game.choiceSelectorOn==this.id)
					{
						l('toggleBox').style.display='none';
						l('toggleBox').innerHTML='';
						Game.choiceSelectorOn=-1;
						PlaySound('snd/tick.mp3');
					}
					else
					{
						Game.choiceSelectorOn=this.id;
						var choices=this.choicesFunction();
						if (choices.length>0)
						{
							var selected=0;
							for (var i in choices) {if (choices[i].selected) selected=i;}
							Game.choiceSelectorChoices=choices;//this is a really dumb way of doing this i am so sorry
							Game.choiceSelectorSelected=selected;
							var str='';
							str+='<div class="close" onclick="Game.UpgradesById['+this.id+'].buy();">x</div>';
							str+='<h3>'+this.name+'</h3>'+
							'<div class="line"></div>'+
							'<h4 id="choiceSelectedName">'+choices[selected].name+'</h4>'+
							'<div class="line"></div>';
							
							for (var i in choices)
							{
								var icon=choices[i].icon;
								str+='<div class="crate enabled'+(i==selected?' highlighted':'')+'" style="opacity:1;float:none;display:inline-block;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="Game.UpgradesById['+this.id+'].choicesPick('+i+');PlaySound(\'snd/tick.mp3\');Game.choiceSelectorOn=-1;Game.UpgradesById['+this.id+'].buy();" onMouseOut="l(\'choiceSelectedName\').innerHTML=Game.choiceSelectorChoices[Game.choiceSelectorSelected].name;" onMouseOver="l(\'choiceSelectedName\').innerHTML=Game.choiceSelectorChoices['+i+'].name;"'+
								'></div>';
							}
						}
						l('toggleBox').innerHTML=str;
						l('toggleBox').style.display='block';
						l('toggleBox').focus();
						Game.tooltip.hide();
						PlaySound('snd/tick.mp3');
						success=1;
					}
				}
				else if (this.pool!='prestige')
				{
					var price=this.getPrice();
					if (this.canBuy() && !this.bought)
					{
						Game.Spend(price);
						this.bought=1;
						if (this.buyFunction) this.buyFunction();
						if (this.toggleInto)
						{
							Game.Lock(this.toggleInto);Game.Unlock(this.toggleInto);
						}
						Game.upgradesToRebuild=1;
						Game.recalculateGains=1;
						if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned++;
						Game.setOnCrate(0);
						Game.tooltip.hide();
						PlaySound('snd/buy'+choose([1,2,3,4])+'.mp3',0.75);
						success=1;
					}
				}
				else
				{
					var price=this.getPrice();
					if (Game.heavenlyChips>=price && !this.bought)
					{
						Game.heavenlyChips-=price;
						Game.heavenlyChipsSpent+=price;
						this.unlocked=1;
						this.bought=1;
						if (this.buyFunction) this.buyFunction();
						Game.BuildAscendTree();
						PlaySound('snd/buy'+choose([1,2,3,4])+'.mp3',0.75);
						PlaySound('snd/shimmerClick.mp3');
						//PlaySound('snd/buyHeavenly.mp3');
						success=1;
					}
				}
			}
			if (this.bought && this.activateFunction) this.activateFunction();
			return success;
		}
		Game.Upgrade.prototype.earn=function()//just win the upgrades without spending anything
		{
			this.unlocked=1;
			this.bought=1;
			if (this.buyFunction) this.buyFunction();
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned++;
		}
		Game.Upgrade.prototype.unlock=function()
		{
			this.unlocked=1;
			Game.upgradesToRebuild=1;
		}
		Game.Upgrade.prototype.lose=function()
		{
			this.unlocked=0;
			this.bought=0;
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned--;
		}
		Game.Upgrade.prototype.toggle=function()//cheating only
		{
			if (!this.bought)
			{
				this.bought=1;
				if (this.buyFunction) this.buyFunction();
				Game.upgradesToRebuild=1;
				Game.recalculateGains=1;
				if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned++;
				PlaySound('snd/buy'+choose([1,2,3,4])+'.mp3',0.75);
				if (this.pool=='prestige' || this.pool=='debug') PlaySound('snd/shimmerClick.mp3');
			}
			else
			{
				this.bought=0;
				Game.upgradesToRebuild=1;
				Game.recalculateGains=1;
				if (Game.CountsAsUpgradeOwned(this.pool)) Game.UpgradesOwned--;
				PlaySound('snd/sell'+choose([1,2,3,4])+'.mp3',0.75);
				if (this.pool=='prestige' || this.pool=='debug') PlaySound('snd/shimmerClick.mp3');
			}
			Game.UpdateMenu();
		}
		
		Game.CountsAsUpgradeOwned=function(pool)
		{
			if (pool=='' || pool=='cookie' || pool=='tech') return true; else return false;
		}
		
		/*AddEvent(l('toggleBox'),'blur',function()//if we click outside of the selector, close it
			{
				//this has a couple problems, such as when clicking on the upgrade - this toggles it off and back on instantly
				l('toggleBox').style.display='none';
				l('toggleBox').innerHTML='';
				Game.choiceSelectorOn=-1;
			}
		);*/
		
		Game.RequiresConfirmation=function(upgrade,prompt)
		{
			upgrade.clickFunction=function(){Game.Prompt(prompt,[['Yes','Game.UpgradesById['+upgrade.id+'].buy(1);Game.ClosePrompt();'],'No']);return false;};
		}
		
		Game.Unlock=function(what)
		{
			if (typeof what==='string')
			{
				if (Game.Upgrades[what])
				{
					if (Game.Upgrades[what].unlocked==0)
					{
						Game.Upgrades[what].unlocked=1;
						Game.upgradesToRebuild=1;
						Game.recalculateGains=1;
						/*if (Game.prefs.popups) {}
						else Game.Notify('Upgrade unlocked','<div class="title" style="font-size:18px;margin-top:-2px;">'+Game.Upgrades[what].name+'</div>',Game.Upgrades[what].icon,6);*/
					}
				}
			}
			else {for (var i in what) {Game.Unlock(what[i]);}}
		}
		Game.Lock=function(what)
		{
			if (typeof what==='string')
			{
				if (Game.Upgrades[what])
				{
					Game.Upgrades[what].unlocked=0;
					Game.upgradesToRebuild=1;
					if (Game.Upgrades[what].bought==1 && Game.CountsAsUpgradeOwned(Game.Upgrades[what].pool)) Game.UpgradesOwned--;
					Game.Upgrades[what].bought=0;
					Game.recalculateGains=1;
				}
			}
			else {for (var i in what) {Game.Lock(what[i]);}}
		}
		
		Game.Has=function(what)
		{
			if (Game.ascensionMode==1 && Game.Upgrades[what].pool=='prestige') return 0;
			return (Game.Upgrades[what]?Game.Upgrades[what].bought:0);
		}
		Game.HasUnlocked=function(what)
		{
			return (Game.Upgrades[what]?Game.Upgrades[what].unlocked:0);
		}
		
		Game.RebuildUpgrades=function()//recalculate the upgrades you can buy
		{
			Game.upgradesToRebuild=0;
			var list=[];
			for (var i in Game.Upgrades)
			{
				var me=Game.Upgrades[i];
				if (!me.bought && me.pool!='debug' && me.pool!='prestige' && me.pool!='prestigeDecor')
				{
					if (me.unlocked) list.push(me);
				}
				else if (me.displayFuncWhenOwned && me.bought) list.push(me);
			}
			var sortMap=function(a,b)
			{
				var ap=a.pool=='toggle'?a.order:a.getPrice();
				var bp=b.pool=='toggle'?b.order:b.getPrice();
				if (ap>bp) return 1;
				else if (ap<bp) return -1;
				else return 0;
			}
			list.sort(sortMap);
			
			Game.UpgradesInStore=[];
			for (var i in list)
			{
				Game.UpgradesInStore.push(list[i]);
			}
			var storeStr='';
			var toggleStr='';
			var techStr='';
			for (var i in Game.UpgradesInStore)
			{
				//if (!Game.UpgradesInStore[i]) break;
				var me=Game.UpgradesInStore[i];
				var str=Game.crate(me,'store','Game.UpgradesById['+me.id+'].buy();','upgrade'+i);
				
				/*var str='<div class="crate upgrade" '+Game.getTooltip(
				'<div style="min-width:200px;"><div style="float:right;"><span class="price">'+Beautify(Math.round(me.getPrice()))+'</span></div><small>'+(me.pool=='toggle'?'[Togglable]':'[Upgrade]')+'</small><div class="name">'+me.name+'</div><div class="line"></div><div class="description">'+me.desc+'</div></div>'
				,'store')+' '+Game.clickStr+'="Game.UpgradesById['+me.id+'].buy();" id="upgrade'+i+'" style="'+(me.icon[2]?'background-image:url('+me.icon[2]+');':'')+'background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>';*/
				if (me.pool=='toggle') toggleStr+=str; else if (me.pool=='tech') techStr+=str; else storeStr+=str;
			}
			l('upgrades').innerHTML=storeStr;
			l('toggleUpgrades').innerHTML=toggleStr;
			if (toggleStr=='') l('toggleUpgrades').style.display='none'; else l('toggleUpgrades').style.display='block';
			l('techUpgrades').innerHTML=techStr;
			if (techStr=='') l('techUpgrades').style.display='none'; else l('techUpgrades').style.display='block';
		}
		
		Game.UnlockAt=[];//this contains an array of every upgrade with a cookie requirement in the form of {cookies:(amount of cookies earned required),name:(name of upgrade or achievement to unlock)} (and possibly require:(name of upgrade of achievement to own))
		//note : the cookie will not be added to the list if it contains locked:1 (use for seasonal cookies and such)
		
		Game.NewUpgradeCookie=function(obj)
		{
			var upgrade=new Game.Upgrade(obj.name,'Cookie production multiplier <b>+'+Beautify((typeof(obj.power)=='function'?obj.power(obj):obj.power),1)+'%</b>.<q>'+obj.desc+'</q>',obj.price,obj.icon);
			upgrade.power=obj.power;
			upgrade.pool='cookie';
			var toPush={cookies:obj.price/20,name:obj.name};
			if (obj.require) toPush.require=obj.require;
			if (obj.season) toPush.season=obj.season;
			if (!obj.locked) Game.UnlockAt.push(toPush);
			return upgrade;
		}
		
		//tiered upgrades system
		//each building has several upgrade tiers
		//all upgrades in the same tier have the same color, unlock threshold and price multiplier
		Game.Tiers={
			1:{name:'Plain',unlock:1,achievUnlock:1,iconRow:0,color:'#ccb3ac',price:					10},
			2:{name:'Berrylium',unlock:5,achievUnlock:50,iconRow:1,color:'#ff89e7',price:				50},
			3:{name:'Blueberrylium',unlock:25,achievUnlock:100,iconRow:2,color:'#00deff',price:			500},
			4:{name:'Chalcedhoney',unlock:50,achievUnlock:150,iconRow:13,color:'#ffcc2f',price:			50000},
			5:{name:'Buttergold',unlock:100,achievUnlock:200,iconRow:14,color:'#e9d673',price:			5000000},
			6:{name:'Sugarmuck',unlock:150,achievUnlock:250,iconRow:15,color:'#a8bf91',price:			500000000},
			7:{name:'Jetmint',unlock:200,achievUnlock:300,iconRow:16,color:'#60ff50',price:				500000000000},
			8:{name:'Cherrysilver',unlock:250,achievUnlock:350,iconRow:17,color:'#f01700',price:		500000000000000},
			9:{name:'Hazelrald',unlock:300,achievUnlock:400,iconRow:18,color:'#9ab834',price:			500000000000000000},
			10:{name:'Mooncandy',unlock:350,achievUnlock:450,iconRow:19,color:'#7e7ab9',price:			500000000000000000000},
			'synergy1':{name:'Synergy I',unlock:15,iconRow:20,color:'#008595',special:1,req:'Synergies Vol. I',price:			2000},
			'synergy2':{name:'Synergy II',unlock:75,iconRow:20,color:'#008595',special:1,req:'Synergies Vol. II',price:			2000000000},
		};
		Game.GetIcon=function(type,tier)
		{
			var col=0;
			if (type=='Kitten') col=18; else col=Game.Objects[type].iconColumn;
			return [col,Game.Tiers[tier].iconRow];
		}
		Game.SetTier=function(building,tier)
		{
			if (!Game.Objects[building]) alert('No building named '+building);
			Game.last.tier=tier;
			Game.last.buildingTie=Game.Objects[building];
			if (Game.last.type=='achievement') Game.Objects[building].tieredAchievs[tier]=Game.last;
			else Game.Objects[building].tieredUpgrades[tier]=Game.last;
		}
		Game.TieredUpgrade=function(name,desc,building,tier)
		{
			var upgrade=new Game.Upgrade(name,desc,Game.Objects[building].basePrice*Game.Tiers[tier].price,Game.GetIcon(building,tier));
			Game.SetTier(building,tier);
			return upgrade;
		}
		Game.SynergyUpgrade=function(name,desc,building1,building2,tier)
		{
			/*
				creates a new upgrade that :
				-unlocks when you have tier.unlock of building1 and building2
				-is priced at (building1.price*10+building2.price*1)*tier.price (formerly : Math.sqrt(building1.price*building2.price)*tier.price)
				-gives +(0.1*building1)% cps to building2 and +(5*building2)% cps to building1
				-if building2 is below building1 in worth, swap them
			*/
			//if (Game.Objects[building1].basePrice>Game.Objects[building2].basePrice) {var temp=building2;building2=building1;building1=temp;}
			var b1=Game.Objects[building1];
			var b2=Game.Objects[building2];
			if (b1.basePrice>b2.basePrice) {b1=Game.Objects[building2];b2=Game.Objects[building1];}//swap
			
			desc=
				(b1.plural.charAt(0).toUpperCase()+b1.plural.slice(1))+' gain <b>+5% CpS</b> per '+b2.name.toLowerCase()+'.<br>'+
				(b2.plural.charAt(0).toUpperCase()+b2.plural.slice(1))+' gain <b>+0.1% CpS</b> per '+b1.name.toLowerCase()+'.'+
				desc;
			var upgrade=new Game.Upgrade(name,desc,(b1.basePrice*10+b2.basePrice*1)*Game.Tiers[tier].price,Game.GetIcon(building1,tier));//Math.sqrt(b1.basePrice*b2.basePrice)*Game.Tiers[tier].price
			upgrade.tier=tier;
			upgrade.buildingTie1=b1;
			upgrade.buildingTie2=b2;
			upgrade.priceFunc=function(){return (this.buildingTie1.basePrice*10+this.buildingTie2.basePrice*1)*Game.Tiers[this.tier].price*(Game.Has('Chimera')?0.98:1);};
			Game.Objects[building1].synergies.push(upgrade);
			Game.Objects[building2].synergies.push(upgrade);
			//Game.SetTier(building1,tier);
			return upgrade;
		}
		Game.GetTieredCpsMult=function(me)
		{
			var mult=1;
			for (var i in me.tieredUpgrades) {if (!Game.Tiers[me.tieredUpgrades[i].tier].special && Game.Has(me.tieredUpgrades[i].name)) mult*=2;}
			for (var i in me.synergies)
			{
				var syn=me.synergies[i];
				if (Game.Has(syn.name))
				{
					if (syn.buildingTie1.name==me.name) mult*=(1+0.05*syn.buildingTie2.amount);
					else if (syn.buildingTie2.name==me.name) mult*=(1+0.001*syn.buildingTie1.amount);
				}
			}
			return mult;
		}
		Game.UnlockTiered=function(me)
		{
			for (var i in me.tieredUpgrades) {if (me.amount>=Game.Tiers[me.tieredUpgrades[i].tier].unlock) Game.Unlock(me.tieredUpgrades[i].name);}
			for (var i in me.tieredAchievs) {if (me.amount>=Game.Tiers[me.tieredAchievs[i].tier].achievUnlock) Game.Win(me.tieredAchievs[i].name);}
			for (var i in me.synergies) {var syn=me.synergies[i];if (Game.Has(Game.Tiers[syn.tier].req) && syn.buildingTie1.amount>=Game.Tiers[syn.tier].unlock && syn.buildingTie2.amount>=Game.Tiers[syn.tier].unlock) Game.Unlock(syn.name);}
		}
		
		
		
		var pool='';
		var power=0;
		
		//define upgrades
		//WARNING : do NOT add new upgrades in between, this breaks the saves. Add them at the end !
		var order=100;//this is used to set the order in which the items are listed
		new Game.Upgrade('Reinforced index finger','The mouse and cursors are <b>twice</b> as efficient.<q>prod prod</q>',100,[0,0]);
		new Game.Upgrade('Carpal tunnel prevention cream','The mouse and cursors are <b>twice</b> as efficient.<q>it... it hurts to click...</q>',500,[0,1]);
		new Game.Upgrade('Ambidextrous','The mouse and cursors are <b>twice</b> as efficient.<q>Look ma, both hands!</q>',10000,[0,2])
		new Game.Upgrade('Thousand fingers','The mouse and cursors gain <b>+0.1</b> cookies for each non-cursor object owned.<q>clickity</q>',100000,[0,13]);
		new Game.Upgrade('Million fingers','The mouse and cursors gain <b>+0.5</b> cookies for each non-cursor object owned.<q>clickityclickity</q>',10000000,[0,14]);
		new Game.Upgrade('Billion fingers','The mouse and cursors gain <b>+5</b> cookies for each non-cursor object owned.<q>clickityclickityclickity</q>',100000000,[0,15]);
		new Game.Upgrade('Trillion fingers','The mouse and cursors gain <b>+50</b> cookies for each non-cursor object owned.<q>clickityclickityclickityclickity</q>',1000000000,[0,16]);
		
		order=200;
		new Game.TieredUpgrade('Forwards from grandma','Grandmas are <b>twice</b> as efficient.<q>RE:RE:thought you\'d get a kick out of this ;))</q>','Grandma',1);
		new Game.TieredUpgrade('Steel-plated rolling pins','Grandmas are <b>twice</b> as efficient.<q>Just what you kneaded.</q>','Grandma',2);
		new Game.TieredUpgrade('Lubricated dentures','Grandmas are <b>twice</b> as efficient.<q>squish</q>','Grandma',3);
		
		order=300;
		new Game.TieredUpgrade('Cheap hoes','Farms are <b>twice</b> as efficient.<q>Rake in the dough!</q>','Farm',1);
		new Game.TieredUpgrade('Fertilizer','Farms are <b>twice</b> as efficient.<q>It\'s chocolate, I swear.</q>','Farm',2);
		new Game.TieredUpgrade('Cookie trees','Farms are <b>twice</b> as efficient.<q>A relative of the breadfruit.</q>','Farm',3);
		
		order=500;
		new Game.TieredUpgrade('Sturdier conveyor belts','Factories are <b>twice</b> as efficient.<q>You\'re going places.</q>','Factory',1);
		new Game.TieredUpgrade('Child labor','Factories are <b>twice</b> as efficient.<q>Cheaper, healthier workforce.</q>','Factory',2);
		new Game.TieredUpgrade('Sweatshop','Factories are <b>twice</b> as efficient.<q>Slackers will be terminated.</q>','Factory',3);
		
		order=400;
		new Game.TieredUpgrade('Sugar gas','Mines are <b>twice</b> as efficient.<q>A pink, volatile gas, found in the depths of some chocolate caves.</q>','Mine',1);
		new Game.TieredUpgrade('Megadrill','Mines are <b>twice</b> as efficient.<q>You\'re in deep.</q>','Mine',2);
		new Game.TieredUpgrade('Ultradrill','Mines are <b>twice</b> as efficient.<q>Finally caved in?</q>','Mine',3);
		
		order=600;
		new Game.TieredUpgrade('Vanilla nebulae','Shipments are <b>twice</b> as efficient.<q>If you removed your space helmet, you could probably smell it!<br>(Note : don\'t do that.)</q>','Shipment',1);
		new Game.TieredUpgrade('Wormholes','Shipments are <b>twice</b> as efficient.<q>By using these as shortcuts, your ships can travel much faster.</q>','Shipment',2);
		new Game.TieredUpgrade('Frequent flyer','Shipments are <b>twice</b> as efficient.<q>Come back soon!</q>','Shipment',3);
		
		order=700;
		new Game.TieredUpgrade('Antimony','Alchemy labs are <b>twice</b> as efficient.<q>Actually worth a lot of mony.</q>','Alchemy lab',1);
		new Game.TieredUpgrade('Essence of dough','Alchemy labs are <b>twice</b> as efficient.<q>Extracted through the 5 ancient steps of alchemical baking.</q>','Alchemy lab',2);
		new Game.TieredUpgrade('True chocolate','Alchemy labs are <b>twice</b> as efficient.<q>The purest form of cacao.</q>','Alchemy lab',3);
		
		order=800;
		new Game.TieredUpgrade('Ancient tablet','Portals are <b>twice</b> as efficient.<q>A strange slab of peanut brittle, holding an ancient cookie recipe. Neat!</q>','Portal',1);
		new Game.TieredUpgrade('Insane oatling workers','Portals are <b>twice</b> as efficient.<q>ARISE, MY MINIONS!</q>','Portal',2);
		new Game.TieredUpgrade('Soul bond','Portals are <b>twice</b> as efficient.<q>So I just sign up and get more cookies? Sure, whatever!</q>','Portal',3);
		
		order=900;
		new Game.TieredUpgrade('Flux capacitors','Time machines are <b>twice</b> as efficient.<q>Bake to the future.</q>','Time machine',1);
		new Game.TieredUpgrade('Time paradox resolver','Time machines are <b>twice</b> as efficient.<q>No more fooling around with your own grandmother!</q>','Time machine',2);
		new Game.TieredUpgrade('Quantum conundrum','Time machines are <b>twice</b> as efficient.<q>There is only one constant, and that is universal uncertainty.<br>Or is it?</q>','Time machine',3);
		
		order=20000;
		new Game.Upgrade('Kitten helpers','You gain <b>more CpS</b> the more milk you have.<q>meow may I help you</q>',9000000,Game.GetIcon('Kitten',1));Game.last.kitten=1;
		new Game.Upgrade('Kitten workers','You gain <b>more CpS</b> the more milk you have.<q>meow meow meow meow</q>',9000000000,Game.GetIcon('Kitten',2));Game.last.kitten=1;
		
		order=10000;
		Game.NewUpgradeCookie({name:'Plain cookies',desc:'Meh.',icon:[2,3],power:																1,	price:	999999});
		Game.NewUpgradeCookie({name:'Sugar cookies',desc:'Tasty, if a little unimaginative.',icon:[7,3],power:									1,	price:	999999*5});
		Game.NewUpgradeCookie({name:'Oatmeal raisin cookies',desc:'No raisin to hate these.',icon:[0,3],power:									1,	price:	9999999});
		Game.NewUpgradeCookie({name:'Peanut butter cookies',desc:'Get yourself some jam cookies!',icon:[1,3],power:								1,	price:	9999999*5});
		Game.NewUpgradeCookie({name:'Coconut cookies',desc:'These are *way* flaky.',icon:[3,3],power:											1,	price:	99999999});
		Game.NewUpgradeCookie({name:'White chocolate cookies',desc:'I know what you\'ll say. It\'s just cocoa butter! It\'s not real chocolate!<br>Oh please.',icon:[4,3],power:2,	price:	99999999*5});
		Game.NewUpgradeCookie({name:'Macadamia nut cookies',desc:'They\'re macadamn delicious!',icon:[5,3],power:								2,	price:	999999999});
		Game.NewUpgradeCookie({name:'Double-chip cookies',desc:'DOUBLE THE CHIPS<br>DOUBLE THE TASTY<br>(double the calories)',icon:[6,3],power:2,	price:	999999999*5});
		Game.NewUpgradeCookie({name:'White chocolate macadamia nut cookies',desc:'Orteil\'s favorite.',icon:[8,3],power:						2,	price:	9999999999});
		Game.NewUpgradeCookie({name:'All-chocolate cookies',desc:'CHOCOVERDOSE.',icon:[9,3],power:												2,	price:	9999999999*5});
		
		order=100;
		new Game.Upgrade('Quadrillion fingers','The mouse and cursors gain <b>+500</b> cookies for each non-cursor object owned.<q>clickityclickityclickityclickityclick</q>',10000000000,[0,17]);
		
		order=200;new Game.TieredUpgrade('Prune juice','Grandmas are <b>twice</b> as efficient.<q>Gets me going.</q>','Grandma',4);
		order=300;new Game.TieredUpgrade('Genetically-modified cookies','Farms are <b>twice</b> as efficient.<q>All-natural mutations.</q>','Farm',4);
		order=500;new Game.TieredUpgrade('Radium reactors','Factories are <b>twice</b> as efficient.<q>Gives your cookies a healthy glow.</q>','Factory',4);
		order=400;new Game.TieredUpgrade('Ultimadrill','Mines are <b>twice</b> as efficient.<q>Pierce the heavens, etc.</q>','Mine',4);
		order=600;new Game.TieredUpgrade('Warp drive','Shipments are <b>twice</b> as efficient.<q>To boldly bake.</q>','Shipment',4);
		order=700;new Game.TieredUpgrade('Ambrosia','Alchemy labs are <b>twice</b> as efficient.<q>Adding this to the cookie mix is sure to make them even more addictive!<br>Perhaps dangerously so.<br>Let\'s hope you can keep selling these legally.</q>','Alchemy lab',4);
		order=800;new Game.TieredUpgrade('Sanity dance','Portals are <b>twice</b> as efficient.<q>We can change if we want to.<br>We can leave our brains behind.</q>','Portal',4);
		order=900;new Game.TieredUpgrade('Causality enforcer','Time machines are <b>twice</b> as efficient.<q>What happened, happened.</q>','Time machine',4);
		
		order=5000;
		new Game.Upgrade('Lucky day','Golden cookies appear <b>twice as often</b> and stay <b>twice as long</b>.<q>Oh hey, a four-leaf penny!</q>',777777777,[27,6]);
		new Game.Upgrade('Serendipity','Golden cookies appear <b>twice as often</b> and stay <b>twice as long</b>.<q>What joy! Seven horseshoes!</q>',77777777777,[27,6]);
		
		order=20000;
		new Game.Upgrade('Kitten engineers','You gain <b>more CpS</b> the more milk you have.<q>meow meow meow meow, sir</q>',90000000000000,Game.GetIcon('Kitten',3));Game.last.kitten=1;
		
		order=10020;
		Game.NewUpgradeCookie({name:'Dark chocolate-coated cookies',desc:'These absorb light so well you almost need to squint to see them.',icon:[10,3],power:			4,	price:	99999999999});
		Game.NewUpgradeCookie({name:'White chocolate-coated cookies',desc:'These dazzling cookies absolutely glisten with flavor.',icon:[11,3],power:					4,	price:	99999999999});
		
		
		Game.getGrandmaSynergyUpgradeMultiplier=function(building)
		{
			return (1+Game.Objects['Grandma'].amount*0.01*(1/(Game.Objects[building].id-1)));
		}
		Game.getGrandmaSynergyUpgradeDesc=function(building)
		{
			var building=Game.Objects[building];
			var grandmaNumber=(building.id-1);
			if (grandmaNumber==1) grandmaNumber='grandma';
			else grandmaNumber+=' grandmas';
			return 'Grandmas are <b>twice</b> as efficient. '+(building.plural.charAt(0).toUpperCase()+building.plural.slice(1))+' gain <b>+1% CpS</b> per '+grandmaNumber+'.';
		}
		
		order=250;
		new Game.Upgrade('Farmer grandmas',Game.getGrandmaSynergyUpgradeDesc('Farm')+'<q>A nice farmer to grow more cookies.</q>',Game.Objects['Farm'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('Miner grandmas',Game.getGrandmaSynergyUpgradeDesc('Mine')+'<q>A nice miner to dig more cookies.</q>',Game.Objects['Mine'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('Worker grandmas',Game.getGrandmaSynergyUpgradeDesc('Factory')+'<q>A nice worker to manufacture more cookies.</q>',Game.Objects['Factory'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		order=255;
		new Game.Upgrade('Cosmic grandmas',Game.getGrandmaSynergyUpgradeDesc('Shipment')+'<q>A nice thing to... uh... cookies.</q>',Game.Objects['Shipment'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('Transmuted grandmas',Game.getGrandmaSynergyUpgradeDesc('Alchemy lab')+'<q>A nice golden grandma to convert into more cookies.</q>',Game.Objects['Alchemy lab'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('Altered grandmas',Game.getGrandmaSynergyUpgradeDesc('Portal')+'<q>a NiCe GrAnDmA tO bA##########</q>',Game.Objects['Portal'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('Grandmas\' grandmas',Game.getGrandmaSynergyUpgradeDesc('Time machine')+'<q>A nice grandma\'s nice grandma to bake double the cookies.</q>',Game.Objects['Time machine'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		
		order=14000;
		Game.baseResearchTime=Game.fps*60*30;
		Game.SetResearch=function(what,time)
		{
			if (Game.Upgrades[what] && !Game.Has(what))
			{
				Game.researchT=Game.baseResearchTime;
				if (Game.Has('Persistent memory')) Game.researchT=Math.ceil(Game.baseResearchTime/10);
				if (Game.Has('Ultrascience')) Game.researchT=Game.fps*5;
				Game.nextResearch=Game.Upgrades[what].id;
				if (Game.prefs.popups) Game.Popup('Research has begun.');
				else Game.Notify('Research has begun','Your bingo center/research facility is conducting experiments.',[9,0]);
			}
		}
		
		new Game.Upgrade('Bingo center/Research facility','Grandma-operated science lab and leisure club.<br>Grandmas are <b>4 times</b> as efficient.<br><b>Regularly unlocks new upgrades</b>.<q>What could possibly keep those grandmothers in check?...<br>Bingo.</q>',1000000000000000,[11,9],function(){Game.SetResearch('Specialized chocolate chips');});Game.last.noPerm=1;
		
		order=15000;
		
		new Game.Upgrade('Specialized chocolate chips','Cookie production multiplier <b>+1%</b>.<q>Computer-designed chocolate chips. Computer chips, if you will.</q>',100000000000,[0,9],function(){Game.SetResearch('Designer cocoa beans');});Game.last.pool='tech';
		new Game.Upgrade('Designer cocoa beans','Cookie production multiplier <b>+2%</b>.<q>Now more aerodynamic than ever!</q>',200000000000,[1,9],function(){Game.SetResearch('Ritual rolling pins');});Game.last.pool='tech';
		new Game.Upgrade('Ritual rolling pins','Grandmas are <b>twice</b> as efficient.<q>The result of years of scientific research!</q>',400000000000,[2,9],function(){Game.SetResearch('Underworld ovens');});Game.last.pool='tech';
		new Game.Upgrade('Underworld ovens','Cookie production multiplier <b>+3%</b>.<q>Powered by science, of course!</q>',800000000000,[3,9],function(){Game.SetResearch('One mind');});Game.last.pool='tech';
		new Game.Upgrade('One mind','Each grandma gains <b>+0.0<span></span>2 base CpS per grandma</b>.<div class="warning">Note : the grandmothers are growing restless. Do not encourage them.</div><q>We are one. We are many.</q>',1600000000000,[4,9],function(){Game.elderWrath=1;Game.SetResearch('Exotic nuts');Game.storeToRefresh=1;});Game.last.pool='tech';
		//Game.last.clickFunction=function(){return confirm('Warning : purchasing this will have unexpected, and potentially undesirable results!\nIt\'s all downhill from here. You have been warned!\nPurchase anyway?');};
		Game.RequiresConfirmation(Game.last,'<div class="block"><b>Warning :</b> purchasing this will have unexpected, and potentially undesirable results!<br><small>It\'s all downhill from here. You have been warned!</small><br><br>Purchase anyway?</small></div>');
		new Game.Upgrade('Exotic nuts','Cookie production multiplier <b>+4%</b>.<q>You\'ll go crazy over these!</q>',3200000000000,[5,9],function(){Game.SetResearch('Communal brainsweep');});Game.last.pool='tech';
		new Game.Upgrade('Communal brainsweep','Each grandma gains another <b>+0.0<span></span>2 base CpS per grandma</b>.<div class="warning">Note : proceeding any further in scientific research may have unexpected results. You have been warned.</div><q>We fuse. We merge. We grow.</q>',6400000000000,[6,9],function(){Game.elderWrath=2;Game.SetResearch('Arcane sugar');Game.storeToRefresh=1;});Game.last.pool='tech';
		new Game.Upgrade('Arcane sugar','Cookie production multiplier <b>+5%</b>.<q>Tastes like insects, ligaments, and molasses.</q>',12800000000000,[7,9],function(){Game.SetResearch('Elder Pact');});Game.last.pool='tech';
		new Game.Upgrade('Elder Pact','Each grandma gains <b>+0.0<span></span>5 base CpS per portal</b>.<div class="warning">Note : this is a bad idea.</div><q>squirm crawl slither writhe<br>today we rise</q>',25600000000000,[8,9],function(){Game.elderWrath=3;Game.storeToRefresh=1;});Game.last.pool='tech';
		new Game.Upgrade('Elder Pledge','Contains the wrath of the elders, at least for a while.<q>This is a simple ritual involving anti-aging cream, cookie batter mixed in the moonlight, and a live chicken.</q>',1,[9,9],function()
		{
			Game.elderWrath=0;
			Game.pledges++;
			Game.pledgeT=Game.getPledgeDuration();
			Game.Unlock('Elder Covenant');
			Game.CollectWrinklers();
			Game.storeToRefresh=1;
		});
		Game.getPledgeDuration=function(){return Game.fps*60*(Game.Has('Sacrificial rolling pins')?60:30);}
		Game.last.pool='toggle';
		Game.last.displayFuncWhenOwned=function(){return '<div style="text-align:center;">Time remaining until pledge runs out :<br><b>'+Game.sayTime(Game.pledgeT,-1)+'</b></div>';}
		Game.last.timerDisplay=function(){if (!Game.Upgrades['Elder Pledge'].bought) return -1; else return 1-Game.pledgeT/Game.getPledgeDuration();}
		Game.last.priceFunc=function(){return Math.pow(8,Math.min(Game.pledges+2,14));}
		
		order=150;
		new Game.Upgrade('Plastic mouse','Clicking gains <b>+1% of your CpS</b>.<q>Slightly squeaky.</q>',50000,[11,0]);
		new Game.Upgrade('Iron mouse','Clicking gains <b>+1% of your CpS</b>.<q>Click like it\'s 1349!</q>',5000000,[11,1]);
		new Game.Upgrade('Titanium mouse','Clicking gains <b>+1% of your CpS</b>.<q>Heavy, but powerful.</q>',500000000,[11,2]);
		new Game.Upgrade('Adamantium mouse','Clicking gains <b>+1% of your CpS</b>.<q>You could cut diamond with these.</q>',50000000000,[11,13]);
		
		order=40000;
		new Game.Upgrade('Ultrascience','Research takes only <b>5 seconds</b>.<q>YEAH, SCIENCE!</q>',7,[9,2]);//debug purposes only
		Game.last.pool='debug';
		
		order=10020;
		Game.NewUpgradeCookie({name:'Eclipse cookies',desc:'Look to the cookie.',icon:[0,4],power:					2,	price:	99999999999*5});
		Game.NewUpgradeCookie({name:'Zebra cookies',desc:'...',icon:[1,4],power:									2,	price:	999999999999});
		
		order=100;
		new Game.Upgrade('Quintillion fingers','The mouse and cursors gain <b>+5000</b> cookies for each non-cursor object owned.<q>man, just go click click click click click, it\'s real easy, man.</q>',10000000000000,[0,18]);
		
		order=40000;
		new Game.Upgrade('Gold hoard','Golden cookies appear <b>really often</b>.<q>That\'s entirely too many.</q>',7,[10,14]);//debug purposes only
		Game.last.pool='debug';
		
		order=15000;
		new Game.Upgrade('Elder Covenant','Puts a permanent end to the elders\' wrath, at the price of 5% of your CpS.<q>This is a complicated ritual involving silly, inconsequential trivialities such as cursed laxatives, century-old cacao, and an infant.<br>Don\'t question it.</q>',66666666666666,[8,9],function()
		{
			Game.pledgeT=0;
			Game.Lock('Revoke Elder Covenant');
			Game.Unlock('Revoke Elder Covenant');
			Game.Lock('Elder Pledge');
			Game.Win('Elder calm');
			Game.CollectWrinklers();
			Game.storeToRefresh=1;
		});
		Game.last.pool='toggle';

		new Game.Upgrade('Revoke Elder Covenant','You will get 5% of your CpS back, but the grandmatriarchs will return.<q>we<br>rise<br>again</q>',6666666666,[8,9],function()
		{
			Game.Lock('Elder Covenant');
			Game.Unlock('Elder Covenant');
		});
		Game.last.pool='toggle';
		
		order=5000;
		new Game.Upgrade('Get lucky','Golden cookie effects last <b>twice as long</b>.<q>You\'ve been up all night, haven\'t you?</q>',77777777777777,[27,6]);
		
		order=15000;
		new Game.Upgrade('Sacrificial rolling pins','Elder pledges last <b>twice</b> as long.<q>These are mostly just for spreading the anti-aging cream.<br>(And accessorily, shortening the chicken\'s suffering.)</q>',2888888888888,[2,9]);
		
		order=10020;
		Game.NewUpgradeCookie({name:'Snickerdoodles',desc:'True to their name.',icon:[2,4],power:												2,	price:	999999999999*5});
		Game.NewUpgradeCookie({name:'Stroopwafels',desc:'If it ain\'t dutch, it ain\'t much.',icon:[3,4],power:									2,	price:	9999999999999});
		Game.NewUpgradeCookie({name:'Macaroons',desc:'Not to be confused with macarons.<br>These have coconut, okay?',icon:[4,4],power:			2,	price:	9999999999999*5});
		
		order=40000;
		new Game.Upgrade('Neuromancy','Can toggle upgrades on and off at will in the stats menu.<q>Can also come in handy to unsee things that can\'t be unseen.</q>',7,[4,9]);//debug purposes only
		Game.last.pool='debug';
		
		order=10030;
		Game.NewUpgradeCookie({name:'Empire biscuits',desc:'For your growing cookie empire, of course!',icon:[5,4],power:											2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'British tea biscuits',desc:'Quite.',icon:[6,4],require:'Tin of british tea biscuits',power:									2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'Chocolate british tea biscuits',desc:'Yes, quite.',icon:[7,4],require:Game.last.name,power:									2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'Round british tea biscuits',desc:'Yes, quite riveting.',icon:[8,4],require:Game.last.name,power:								2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'Round chocolate british tea biscuits',desc:'Yes, quite riveting indeed.',icon:[9,4],require:Game.last.name,power:				2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'Round british tea biscuits with heart motif',desc:'Yes, quite riveting, old chap.',icon:[10,4],require:Game.last.name,power:	2,	price:	99999999999999});
		Game.NewUpgradeCookie({name:'Round chocolate british tea biscuits with heart motif',desc:'I like cookies.',icon:[11,4],require:Game.last.name,power:		2,	price:	99999999999999});
		
		order=1000;
		new Game.TieredUpgrade('Sugar bosons','Antimatter condensers are <b>twice</b> as efficient.<q>Sweet firm bosons.</q>','Antimatter condenser',1);
		new Game.TieredUpgrade('String theory','Antimatter condensers are <b>twice</b> as efficient.<q>Reveals new insight about the true meaning of baking cookies (and, as a bonus, the structure of the universe).</q>','Antimatter condenser',2);
		new Game.TieredUpgrade('Large macaron collider','Antimatter condensers are <b>twice</b> as efficient.<q>How singular!</q>','Antimatter condenser',3);
		new Game.TieredUpgrade('Big bang bake','Antimatter condensers are <b>twice</b> as efficient.<q>And that\'s how it all began.</q>','Antimatter condenser',4);

		order=255;
		new Game.Upgrade('Antigrandmas',Game.getGrandmaSynergyUpgradeDesc('Antimatter condenser')+'<q>A mean antigrandma to vomit more cookies.<br>(Do not put in contact with normal grandmas; loss of matter may occur.)</q>',Game.Objects['Antimatter condenser'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});

		order=10020;
		Game.NewUpgradeCookie({name:'Madeleines',desc:'Unforgettable!',icon:[12,3],power:																2,	price:	99999999999999*5});
		Game.NewUpgradeCookie({name:'Palmiers',desc:'Palmier than you!',icon:[13,3],power:																2,	price:	99999999999999*5});
		Game.NewUpgradeCookie({name:'Palets',desc:'You could probably play hockey with these.<br>I mean, you\'re welcome to try.',icon:[12,4],power:	2,	price:	999999999999999});
		Game.NewUpgradeCookie({name:'Sabl&eacute;s',desc:'The name implies they\'re made of sand. But you know better, don\'t you?',icon:[13,4],power:	2,	price:	999999999999999});
		
		order=20000;
		new Game.Upgrade('Kitten overseers','You gain <b>more CpS</b> the more milk you have.<q>my purrpose is to serve you, sir</q>',90000000000000000,Game.GetIcon('Kitten',4));Game.last.kitten=1;
		
		
		order=100;
		new Game.Upgrade('Sextillion fingers','The mouse and cursors gain <b>+50000</b> cookies for each non-cursor object owned.<q>sometimes<br>things just<br>click</q>',10000000000000000,[0,19]);
		
		order=200;new Game.TieredUpgrade('Double-thick glasses','Grandmas are <b>twice</b> as efficient.<q>Oh... so THAT\'s what I\'ve been baking.</q>','Grandma',5);
		order=300;new Game.TieredUpgrade('Gingerbread scarecrows','Farms are <b>twice</b> as efficient.<q>Staring at your crops with mischievous glee.</q>','Farm',5);
		order=500;new Game.TieredUpgrade('Recombobulators','Factories are <b>twice</b> as efficient.<q>A major part of cookie recombobulation.</q>','Factory',5);
		order=400;new Game.TieredUpgrade('H-bomb mining','Mines are <b>twice</b> as efficient.<q>Questionable efficiency, but spectacular nonetheless.</q>','Mine',5);
		order=600;new Game.TieredUpgrade('Chocolate monoliths','Shipments are <b>twice</b> as efficient.<q>My god. It\'s full of chocolate bars.</q>','Shipment',5);
		order=700;new Game.TieredUpgrade('Aqua crustulae','Alchemy labs are <b>twice</b> as efficient.<q>Careful with the dosing - one drop too much and you get muffins.<br>And nobody likes muffins.</q>','Alchemy lab',5);
		order=800;new Game.TieredUpgrade('Brane transplant','Portals are <b>twice</b> as efficient.<q>This refers to the practice of merging higher dimensional universes, or "branes", with our own, in order to facilitate transit (and harvesting of precious cookie dough).</q>','Portal',5);
		order=900;new Game.TieredUpgrade('Yestermorrow comparators','Time machines are <b>twice</b> as efficient.<q>Fortnights into milleniums.</q>','Time machine',5);
		order=1000;new Game.TieredUpgrade('Reverse cyclotrons','Antimatter condensers are <b>twice</b> as efficient.<q>These can uncollision particles and unspin atoms. For... uh... better flavor, and stuff.</q>','Antimatter condenser',5);
		
		order=150;
		new Game.Upgrade('Unobtainium mouse','Clicking gains <b>+1% of your CpS</b>.<q>These nice mice should suffice.</q>',5000000000000,[11,14]);
		
		order=10020;
		Game.NewUpgradeCookie({name:'Caramoas',desc:'Yeah. That\'s got a nice ring to it.',icon:[14,4],require:'Box of brand biscuits',power:					3,	price:	9999999999999999});
		Game.NewUpgradeCookie({name:'Sagalongs',desc:'Grandma\'s favorite?',icon:[15,3],require:'Box of brand biscuits',power:									3,	price:	9999999999999999});
		Game.NewUpgradeCookie({name:'Shortfoils',desc:'Foiled again!',icon:[15,4],require:'Box of brand biscuits',power:										3,	price:	9999999999999999});
		Game.NewUpgradeCookie({name:'Win mints',desc:'They\'re the luckiest cookies you\'ve ever tasted!',icon:[14,3],require:'Box of brand biscuits',power:	3,	price:	9999999999999999});
		
		order=40000;
		new Game.Upgrade('Perfect idling','You keep producing cookies even while the game is closed.<q>It\'s the most beautiful thing I\'ve ever seen.</q>',7,[10,0]);//debug purposes only
		Game.last.pool='debug';
		
		order=10030;
		Game.NewUpgradeCookie({name:'Fig gluttons',desc:'Got it all figured out.',icon:[17,4],require:'Box of brand biscuits',power:													2,	price:	999999999999999*5});
		Game.NewUpgradeCookie({name:'Loreols',desc:'Because, uh... they\'re worth it?',icon:[16,3],require:'Box of brand biscuits',power:												2,	price:	999999999999999*5});
		Game.NewUpgradeCookie({name:'Jaffa cakes',desc:'If you want to bake a cookie from scratch, you must first build a factory.',icon:[17,3],require:'Box of brand biscuits',power:	2,	price:	999999999999999*5});
		Game.NewUpgradeCookie({name:'Grease\'s cups',desc:'Extra-greasy peanut butter.',icon:[16,4],require:'Box of brand biscuits',power:												2,	price:	999999999999999*5});
		
		order=30000;
		new Game.Upgrade('Heavenly chip secret','Unlocks <b>5%</b> of the potential of your prestige level.<q>Grants the knowledge of heavenly chips, and how to use them to make baking more efficient.<br>It\'s a secret to everyone.</q>',11,[19,7]);Game.last.noPerm=1;
		new Game.Upgrade('Heavenly cookie stand','Unlocks <b>25%</b> of the potential of your prestige level.<q>Don\'t forget to visit the heavenly lemonade stand afterwards. When afterlife gives you lemons...</q>',1111,[18,7]);Game.last.noPerm=1;
		new Game.Upgrade('Heavenly bakery','Unlocks <b>50%</b> of the potential of your prestige level.<q>Also sells godly cakes and divine pastries. The pretzels aren\'t too bad either.</q>',111111,[17,7]);Game.last.noPerm=1;
		new Game.Upgrade('Heavenly confectionery','Unlocks <b>75%</b> of the potential of your prestige level.<q>They say angel bakers work there. They take angel lunch breaks and sometimes go on angel strikes.</q>',11111111,[16,7]);Game.last.noPerm=1;
		new Game.Upgrade('Heavenly key','Unlocks <b>100%</b> of the potential of your prestige level.<q>This is the key to the pearly (and tasty) gates of pastry heaven, granting you access to your entire stockpile of heavenly chips for baking purposes.<br>May you use them wisely.</q>',1111111111,[15,7]);Game.last.noPerm=1;
		
		order=10100;
		Game.NewUpgradeCookie({name:'Skull cookies',desc:'Wanna know something spooky? You\'ve got one of these inside your head RIGHT NOW.',locked:1,icon:[12,8],power:	2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Ghost cookies',desc:'They\'re something strange, but they look pretty good!',locked:1,icon:[13,8],power:								2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Bat cookies',desc:'The cookies this town deserves.',locked:1,icon:[14,8],power:														2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Slime cookies',desc:'The incredible melting cookies!',locked:1,icon:[15,8],power: 														2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Pumpkin cookies',desc:'Not even pumpkin-flavored. Tastes like glazing. Yeugh.',locked:1,icon:[16,8],power:								2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Eyeball cookies',desc:'When you stare into the cookie, the cookie stares back at you.',locked:1,icon:[17,8],power:						2, price: 444444444444});
		Game.NewUpgradeCookie({name:'Spider cookies',desc:'You found the recipe on the web. They do whatever a cookie can.',locked:1,icon:[18,8],power:						2, price: 444444444444});

		order=0;
		new Game.Upgrade('Persistent memory','Subsequent research will be <b>10 times</b> as fast.<q>It\'s all making sense!<br>Again!</q>',5,[9,2]);Game.last.pool='prestige';
		
		order=40000;
		new Game.Upgrade('Wrinkler doormat','Wrinklers spawn much more frequently.<q>You\'re such a pushover.</q>',7,[19,8]);//debug purposes only
		Game.last.pool='debug';
		
		order=10200;
		Game.NewUpgradeCookie({name:'Christmas tree biscuits',desc:'Whose pine is it anyway?',locked:1,icon:[12,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'Snowflake biscuits',desc:'Mass-produced to be unique in every way.',locked:1,icon:[13,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'Snowman biscuits',desc:'It\'s frosted. Doubly so.',locked:1,icon:[14,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'Holly biscuits',desc:'You don\'t smooch under these ones. That would be the mistletoe (which, botanically, is a smellier variant of the mistlefinger).',locked:1,icon:[15,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'Candy cane biscuits',desc:'It\'s two treats in one!<br>(Further inspection reveals the frosting does not actually taste like peppermint, but like mundane sugary frosting.)',locked:1,icon:[16,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'Bell biscuits',desc:'What do these even have to do with christmas? Who cares, ring them in!',locked:1,icon:[17,10],power:2,price: 252525252525});
		Game.NewUpgradeCookie({name:'Present biscuits',desc:'The prequel to future biscuits. Watch out!',locked:1,icon:[18,10],power:2,price: 252525252525});
		
		order=10020;
		Game.NewUpgradeCookie({name:'Gingerbread men',desc:'You like to bite the legs off first, right? How about tearing off the arms? You sick monster.',icon:[18,4],power:		2,price: 9999999999999999});
		Game.NewUpgradeCookie({name:'Gingerbread trees',desc:'Evergreens in pastry form. Yule be surprised what you can come up with.',icon:[18,3],power:							2,price: 9999999999999999});
		
		order=25000;
		new Game.Upgrade('A festive hat','<b>Unlocks... something.</b><q>Not a creature was stirring, not even a mouse.</q>',25,[19,9],function()
		{
			var drop=choose(Game.santaDrops);
			Game.Unlock(drop);
			if (Game.prefs.popups) Game.Popup('In the festive hat, you find...<br>a festive test tube<br>and '+drop+'.');
			else Game.Notify('In the festive hat, you find...','a festive test tube<br>and <b>'+drop+'</b>.',Game.Upgrades[drop].icon);
		});
		
		new Game.Upgrade('Increased merriness','Cookie production multiplier <b>+15%</b>.<br>Cost scales with Santa level.<q>It turns out that the key to increased merriness, strangely enough, happens to be a good campfire and some s\'mores.<br>You know what they say, after all; the s\'more, the merrier.</q>',2525,[17,9]);
		new Game.Upgrade('Improved jolliness','Cookie production multiplier <b>+15%</b>.<br>Cost scales with Santa level.<q>A nice wobbly belly goes a long way.<br>You jolly?</q>',2525,[17,9]);
		new Game.Upgrade('A lump of coal','Cookie production multiplier <b>+1%</b>.<br>Cost scales with Santa level.<q>Some of the world\'s worst stocking stuffing.<br>I guess you could try starting your own little industrial revolution, or something?...</q>',2525,[13,9]);
		new Game.Upgrade('An itchy sweater','Cookie production multiplier <b>+1%</b>.<br>Cost scales with Santa level.<q>You don\'t know what\'s worse : the embarrassingly quaint "elf on reindeer" motif, or the fact that wearing it makes you feel like you\'re wrapped in a dead sasquatch.</q>',2525,[14,9]);
		new Game.Upgrade('Reindeer baking grounds','Reindeer appear <b>twice as frequently</b>.<br>Cost scales with Santa level.<q>Male reindeer are from Mars; female reindeer are from venison.</q>',2525,[12,9]);
		new Game.Upgrade('Weighted sleighs','Reindeer are <b>twice as slow</b>.<br>Cost scales with Santa level.<q>Hope it was worth the weight.<br>(Something something forced into cervidude)</q>',2525,[12,9]);
		new Game.Upgrade('Ho ho ho-flavored frosting','Reindeer give <b>twice as much</b>.<br>Cost scales with Santa level.<q>It\'s time to up the antler.</q>',2525,[12,9]);
		new Game.Upgrade('Season savings','All buildings are <b>1% cheaper</b>.<br>Cost scales with Santa level.<q>By Santa\'s beard, what savings!<br>But who will save us?</q>',2525,[16,9],function(){Game.storeToRefresh=1;});
		new Game.Upgrade('Toy workshop','All upgrades are <b>5% cheaper</b>.<br>Cost scales with Santa level.<q>Watch yours-elf around elvesdroppers who might steal our production secrets.<br>Or elven worse!</q>',2525,[16,9],function(){Game.upgradesToRebuild=1;});
		new Game.Upgrade('Naughty list','Grandmas are <b>twice</b> as productive.<br>Cost scales with Santa level.<q>This list contains every unholy deed perpetuated by grandmakind.<br>He won\'t be checking this one twice.<br>Once. Once is enough.</q>',2525,[15,9]);
		new Game.Upgrade('Santa\'s bottomless bag','Random drops are <b>10% more common</b>.<br>Cost scales with Santa level.<q>This is one bottom you can\'t check out.</q>',2525,[19,9]);
		new Game.Upgrade('Santa\'s helpers','Clicking is <b>10% more powerful</b>.<br>Cost scales with Santa level.<q>Some choose to help hamburger; some choose to help you.<br>To each their own, I guess.</q>',2525,[19,9]);
		new Game.Upgrade('Santa\'s legacy','Cookie production multiplier <b>+3% per Santa\'s levels</b>.<br>Cost scales with Santa level.<q>In the north pole, you gotta get the elves first. Then when you get the elves, you start making the toys. Then when you get the toys... then you get the cookies.</q>',2525,[19,9]);
		new Game.Upgrade('Santa\'s milk and cookies','Milk is <b>5% more powerful</b>.<br>Cost scales with Santa level.<q>Part of Santa\'s dreadfully unbalanced diet.</q>',2525,[19,9]);
		
		order=40000;
		new Game.Upgrade('Reindeer season','Reindeer spawn much more frequently.<q>Go, Cheater! Go, Hacker and Faker!</q>',7,[12,9]);//debug purposes only
		Game.last.pool='debug';
		
		order=25000;
		new Game.Upgrade('Santa\'s dominion','Cookie production multiplier <b>+20%</b>.<br>All buildings are <b>1% cheaper</b>.<br>All upgrades are <b>2% cheaper</b>.<q>My name is Claus, king of kings;<br>Look on my toys, ye Mighty, and despair!</q>',2525252525252525,[19,10],function(){Game.storeToRefresh=1;});
		
		order=10300;
		var heartPower=function(){
			var pow=2;
			if (Game.Has('Starlove')) pow=3;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('seasons');
				if (godLvl==1) pow*=1.3;
				else if (godLvl==2) pow*=1.2;
				else if (godLvl==3) pow*=1.1;
			}
			return pow;
		};
		Game.NewUpgradeCookie({name:'Pure heart biscuits',desc:'Melty white chocolate<br>that says "I *like* like you".',season:'valentines',icon:[19,3],													power:heartPower,price: 1000000});
		Game.NewUpgradeCookie({name:'Ardent heart biscuits',desc:'A red hot cherry biscuit that will nudge the target of your affection in interesting directions.',require:Game.last.name,season:'valentines',icon:[20,3],			power:heartPower,price: 1000000000});
		Game.NewUpgradeCookie({name:'Sour heart biscuits',desc:'A bitter lime biscuit for the lonely and the heart-broken.',require:Game.last.name,season:'valentines',icon:[20,4],													power:heartPower,price: 1000000000000});
		Game.NewUpgradeCookie({name:'Weeping heart biscuits',desc:'An ice-cold blueberry biscuit, symbol of a mending heart.',require:Game.last.name,season:'valentines',icon:[21,3],												power:heartPower,price: 1000000000000000});
		Game.NewUpgradeCookie({name:'Golden heart biscuits',desc:'A beautiful biscuit to symbolize kindness, true love, and sincerity.',require:Game.last.name,season:'valentines',icon:[21,4],										power:heartPower,price: 1000000000000000000});
		Game.NewUpgradeCookie({name:'Eternal heart biscuits',desc:'Silver icing for a very special someone you\'ve liked for a long, long time.',require:Game.last.name,season:'valentines',icon:[19,4],							power:heartPower,price: 1000000000000000000000});

		order=1100;
		new Game.TieredUpgrade('Gem polish','Prisms are <b>twice</b> as efficient.<q>Get rid of the grime and let more light in.<br>Truly, truly outrageous.</q>','Prism',1);
		new Game.TieredUpgrade('9th color','Prisms are <b>twice</b> as efficient.<q>Delve into untouched optical depths where even the mantis shrimp hasn\'t set an eye!</q>','Prism',2);
		new Game.TieredUpgrade('Chocolate light','Prisms are <b>twice</b> as efficient.<q>Bask into its cocoalescence.<br>(Warning : may cause various interesting albeit deadly skin conditions.)</q>','Prism',3);
		new Game.TieredUpgrade('Grainbow','Prisms are <b>twice</b> as efficient.<q>Remember the different grains using the handy Roy G. Biv mnemonic : R is for rice, O is for oats... uh, B for barley?...</q>','Prism',4);
		new Game.TieredUpgrade('Pure cosmic light','Prisms are <b>twice</b> as efficient.<q>Your prisms now receive pristine, unadulterated photons from the other end of the universe.</q>','Prism',5);

		order=255;
		new Game.Upgrade('Rainbow grandmas',Game.getGrandmaSynergyUpgradeDesc('Prism')+'<q>A luminous grandma to sparkle into cookies.</q>',Game.Objects['Prism'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		
		order=24000;
		Game.seasonTriggerBasePrice=1111111111;
		new Game.Upgrade('Season switcher','Allows you to <b>trigger seasonal events</b> at will, for a price.<q>There will always be time.</q>',1111,[16,6],function(){for (var i in Game.seasons){Game.Unlock(Game.seasons[i].trigger);}});Game.last.pool='prestige';
		new Game.Upgrade('Festive biscuit','Triggers <b>Christmas season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost increases with every season switch.<q>\'Twas the night before Christmas- or was it?</q>',Game.seasonTriggerBasePrice,[12,10]);Game.last.season='christmas';Game.last.pool='toggle';
		new Game.Upgrade('Ghostly biscuit','Triggers <b>Halloween season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost increases with every season switch.<q>spooky scary skeletons<br>will wake you with a boo</q>',Game.seasonTriggerBasePrice,[13,8]);Game.last.season='halloween';Game.last.pool='toggle';
		new Game.Upgrade('Lovesick biscuit','Triggers <b>Valentine\'s Day season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost increases with every season switch.<q>Romance never goes out of fashion.</q>',Game.seasonTriggerBasePrice,[20,3]);Game.last.season='valentines';Game.last.pool='toggle';
		new Game.Upgrade('Fool\'s biscuit','Triggers <b>Business Day season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost increases with every season switch.<q>Business. Serious business. This is absolutely all of your business.</q>',Game.seasonTriggerBasePrice,[17,6]);Game.last.season='fools';Game.last.pool='toggle';
		
		order=40000;
		new Game.Upgrade('Eternal seasons','Seasons now last forever.<q>Season to taste.</q>',7,[16,6],function(){for (var i in Game.seasons){Game.Unlock(Game.seasons[i].trigger);}});//debug purposes only
		Game.last.pool='debug';
		
		
		order=20000;
		new Game.Upgrade('Kitten managers','You gain <b>more CpS</b> the more milk you have.<q>that\'s not gonna paws any problem, sir</q>',900000000000000000000,Game.GetIcon('Kitten',5));Game.last.kitten=1;
		
		order=100;
		new Game.Upgrade('Septillion fingers','The mouse and cursors gain <b>+500000</b> cookies for each non-cursor object owned.<q>[cursory flavor text]</q>',10000000000000000000,[12,20]);
		new Game.Upgrade('Octillion fingers','The mouse and cursors gain <b>+5000000</b> cookies for each non-cursor object owned.<q>Turns out you <b>can</b> quite put your finger on it.</q>',10000000000000000000000,[12,19]);
		
		order=150;new Game.Upgrade('Eludium mouse','Clicking gains <b>+1% of your CpS</b>.<q>I rodent do that if I were you.</q>',500000000000000,[11,15]);
		new Game.Upgrade('Wishalloy mouse','Clicking gains <b>+1% of your CpS</b>.<q>Clicking is fine and dandy, but don\'t smash your mouse over it. Get your game on. Go play.</q>',50000000000000000,[11,16]);
		order=200;new Game.TieredUpgrade('Aging agents','Grandmas are <b>twice</b> as efficient.<q>Counter-intuitively, grandmas have the uncanny ability to become more powerful the older they get.</q>','Grandma',6);
		order=300;new Game.TieredUpgrade('Pulsar sprinklers','Farms are <b>twice</b> as efficient.<q>There\'s no such thing as over-watering. The moistest is the bestest.</q>','Farm',6);
		order=500;new Game.TieredUpgrade('Deep-bake process','Factories are <b>twice</b> as efficient.<q>A patented process increasing cookie yield two-fold for the same amount of ingredients. Don\'t ask how, don\'t take pictures, and be sure to wear your protective suit.</q>','Factory',6);
		order=400;new Game.TieredUpgrade('Coreforge','Mines are <b>twice</b> as efficient.<q>You\'ve finally dug a tunnel down to the Earth\'s core. It\'s pretty warm down here.</q>','Mine',6);
		order=600;new Game.TieredUpgrade('Generation ship','Shipments are <b>twice</b> as efficient.<q>Built to last, this humongous spacecraft will surely deliver your cookies to the deep ends of space, one day.</q>','Shipment',6);
		order=700;new Game.TieredUpgrade('Origin crucible','Alchemy labs are <b>twice</b> as efficient.<q>Built from the rarest of earths and located at the very deepest of the largest mountain, this legendary crucible is said to retain properties from the big-bang itself.</q>','Alchemy lab',6);
		order=800;new Game.TieredUpgrade('Deity-sized portals','Portals are <b>twice</b> as efficient.<q>It\'s almost like, say, an elder god could fit through this thing now. Hypothetically.</q>','Portal',6);
		order=900;new Game.TieredUpgrade('Far future enactment','Time machines are <b>twice</b> as efficient.<q>The far future enactment authorizes you to delve deep into the future - where civilization has fallen and risen again, and cookies are plentiful.</q>','Time machine',6);
		order=1000;new Game.TieredUpgrade('Nanocosmics','Antimatter condensers are <b>twice</b> as efficient.<q>The theory of nanocosmics posits that each subatomic particle is in fact its own self-contained universe, holding unfathomable amounts of energy.</q>','Antimatter condenser',6);
		order=1100;
		new Game.TieredUpgrade('Glow-in-the-dark','Prisms are <b>twice</b> as efficient.<q>Your prisms now glow in the dark, effectively doubling their output!</q>','Prism',6);
		
		order=10032;
		Game.NewUpgradeCookie({name:'Rose macarons',desc:'Although an odd flavor, these pastries recently rose in popularity.',icon:[22,3],require:'Box of macarons',		power:3,price: 9999});
		Game.NewUpgradeCookie({name:'Lemon macarons',desc:'Tastefully sour, delightful treats.',icon:[23,3],require:'Box of macarons',										power:3,price: 9999999});
		Game.NewUpgradeCookie({name:'Chocolate macarons',desc:'They\'re like tiny sugary burgers!',icon:[24,3],require:'Box of macarons',									power:3,price: 9999999999});
		Game.NewUpgradeCookie({name:'Pistachio macarons',desc:'Pistachio shells now removed after multiple complaints.',icon:[22,4],require:'Box of macarons',										power:3,price: 9999999999999});
		Game.NewUpgradeCookie({name:'Hazelnut macarons',desc:'These go especially well with coffee.',icon:[23,4],require:'Box of macarons',									power:3,price: 9999999999999999});
		Game.NewUpgradeCookie({name:'Violet macarons',desc:'It\'s like spraying perfume into your mouth!',icon:[24,4],require:'Box of macarons',							power:3,price: 9999999999999999999});
		
		order=40000;
		new Game.Upgrade('Magic shenanigans','Cookie production <b>multiplied by 1,000</b>.<q>It\'s magic. I ain\'t gotta explain sh<div style="display:inline-block;background:url(img/money.png);width:16px;height:16px;position:relative;top:4px;left:0px;margin:0px -2px;"></div>t.</q>',7,[17,5]);//debug purposes only
		Game.last.pool='debug';
		
		
		order=24000;
		new Game.Upgrade('Bunny biscuit','Triggers <b>Easter season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost increases with every season switch.<q>All the world will be your enemy<br>and when they catch you,<br>they will kill you...<br>but first they must catch you.</q>',Game.seasonTriggerBasePrice,[0,12]);Game.last.season='easter';Game.last.pool='toggle';
		
		var eggPrice=999999999999;
		var eggPrice2=99999999999999;
		new Game.Upgrade('Chicken egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>The egg. The egg came first. Get over it.</q>',eggPrice,[1,12]);
		new Game.Upgrade('Duck egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>Then he waddled away.</q>',eggPrice,[2,12]);
		new Game.Upgrade('Turkey egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>These hatch into strange, hand-shaped creatures.</q>',eggPrice,[3,12]);
		new Game.Upgrade('Quail egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>These eggs are positively tiny. I mean look at them. How does this happen? Whose idea was that?</q>',eggPrice,[4,12]);
		new Game.Upgrade('Robin egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>Holy azure-hued shelled embryos!</q>',eggPrice,[5,12]);
		new Game.Upgrade('Ostrich egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>One of the largest eggs in the world. More like ostrouch, am I right?<br>Guys?</q>',eggPrice,[6,12]);
		new Game.Upgrade('Cassowary egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>The cassowary is taller than you, possesses murderous claws and can easily outrun you.<br>You\'d do well to be casso-wary of them.</q>',eggPrice,[7,12]);
		new Game.Upgrade('Salmon roe','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>Do the impossible, see the invisible.<br>Roe roe, fight the power?</q>',eggPrice,[8,12]);
		new Game.Upgrade('Frogspawn','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>I was going to make a pun about how these "toadally look like eyeballs", but froget it.</q>',eggPrice,[9,12]);
		new Game.Upgrade('Shark egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>HELLO IS THIS FOOD?<br>LET ME TELL YOU ABOUT FOOD.<br>WHY DO I KEEP EATING MY FRIENDS</q>',eggPrice,[10,12]);
		new Game.Upgrade('Turtle egg','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>Turtles, right? Hatch from shells. Grow into shells. What\'s up with that?<br>Now for my skit about airplane food.</q>',eggPrice,[11,12]);
		new Game.Upgrade('Ant larva','Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many eggs you own.<q>These are a delicacy in some countries, I swear. You will let these invade your digestive tract, and you will derive great pleasure from it.<br>And all will be well.</q>',eggPrice,[12,12]);
		new Game.Upgrade('Golden goose egg','Golden cookies appear <b>5% more often</b>.<br>Cost scales with how many eggs you own.<q>The sole vestige of a tragic tale involving misguided investments.</q>',eggPrice2,[13,12]);
		new Game.Upgrade('Faberge egg','All buildings and upgrades are <b>1% cheaper</b>.<br>Cost scales with how many eggs you own.<q>This outrageous egg is definitely fab.</q>',eggPrice2,[14,12],function(){Game.storeToRefresh=1;});
		new Game.Upgrade('Wrinklerspawn','Wrinklers explode into <b>5% more cookies</b>.<br>Cost scales with how many eggs you own.<q>Look at this little guy! It\'s gonna be a big boy someday! Yes it is!</q>',eggPrice2,[15,12]);
		new Game.Upgrade('Cookie egg','Clicking is <b>10% more powerful</b>.<br>Cost scales with how many eggs you own.<q>The shell appears to be chipped.<br>I wonder what\'s inside this one!</q>',eggPrice2,[16,12]);
		new Game.Upgrade('Omelette','Other eggs appear <b>10% more frequently</b>.<br>Cost scales with how many eggs you own.<q>Fromage not included.</q>',eggPrice2,[17,12]);
		new Game.Upgrade('Chocolate egg','Contains <b>a lot of cookies</b>.<br>Cost scales with how many eggs you own.<q>Laid by the elusive cocoa bird. There\'s a surprise inside!</q>',eggPrice2,[18,12],function()
		{
			var cookies=Game.cookies*0.05;
			if (Game.prefs.popups) Game.Popup('The chocolate egg bursts into<br>'+Beautify(cookies)+'!');
			else Game.Notify('Chocolate egg','The egg bursts into <b>'+Beautify(cookies)+'</b> cookies!',Game.Upgrades['Chocolate egg'].icon);
			Game.Earn(cookies);
		});
		new Game.Upgrade('Century egg','You continually gain <b>more CpS the longer you\'ve played</b> in the current session.<br>Cost scales with how many eggs you own.<q>Actually not centuries-old. This one isn\'t a day over 86!</q>',eggPrice2,[19,12]);
		new Game.Upgrade('"egg"','<b>+9 CpS</b><q>hey it\'s "egg"</q>',eggPrice2,[20,12]);
		
		Game.easterEggs=['Chicken egg','Duck egg','Turkey egg','Quail egg','Robin egg','Ostrich egg','Cassowary egg','Salmon roe','Frogspawn','Shark egg','Turtle egg','Ant larva','Golden goose egg','Faberge egg','Wrinklerspawn','Cookie egg','Omelette','Chocolate egg','Century egg','"egg"'];
		Game.eggDrops=['Chicken egg','Duck egg','Turkey egg','Quail egg','Robin egg','Ostrich egg','Cassowary egg','Salmon roe','Frogspawn','Shark egg','Turtle egg','Ant larva'];
		Game.rareEggDrops=['Golden goose egg','Faberge egg','Wrinklerspawn','Cookie egg','Omelette','Chocolate egg','Century egg','"egg"'];
		
		Game.GetHowManyEggs=function()
		{
			var num=0;
			for (var i in Game.easterEggs) {if (Game.Has(Game.easterEggs[i])) num++;}
			return num;
		}
		for (var i in Game.eggDrops)//scale egg prices to how many eggs you have
		{Game.Upgrades[Game.eggDrops[i]].priceFunc=function(){return Math.pow(2,Game.GetHowManyEggs())*999;}}
		for (var i in Game.rareEggDrops)
		{Game.Upgrades[Game.rareEggDrops[i]].priceFunc=function(){return Math.pow(3,Game.GetHowManyEggs())*999;}}
		
		
		Game.DropEgg=function(failRate)
		{
			if (Game.season!='easter') return;
			if (Game.HasAchiev('Hide & seek champion')) failRate*=0.7;
			if (Game.Has('Omelette')) failRate*=0.9;
			if (Game.Has('Starspawn')) failRate*=0.9;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('seasons');
				if (godLvl==1) failRate*=0.9;
				else if (godLvl==2) failRate*=0.95;
				else if (godLvl==3) failRate*=0.97;
			}
			if (Game.Has('Santa\'s bottomless bag')) failRate*=0.9;
			if (Game.hasAura('Mind Over Matter')) failRate*=0.75;
			if (Math.random()>=failRate)
			{
				var drop='';
				if (Math.random()<0.1) drop=choose(Game.rareEggDrops);
				else drop=choose(Game.eggDrops);
				if (Game.Has(drop) || Game.HasUnlocked(drop))//reroll if we have it
				{
					if (Math.random()<0.1) drop=choose(Game.rareEggDrops);
					else drop=choose(Game.eggDrops);
				}
				if (Game.Has(drop) || Game.HasUnlocked(drop)) return;
				Game.Unlock(drop);
				if (Game.prefs.popups) Game.Popup('You find :<br>'+drop+'!');
				else Game.Notify('You found an egg!','<b>'+drop+'</b>',Game.Upgrades[drop].icon);
			}
		};
		
		order=10032;
		Game.NewUpgradeCookie({name:'Caramel macarons',desc:'The saltiest, chewiest of them all.',icon:[25,3],require:'Box of macarons',		power:3,price: 9999999999999999999999});
		Game.NewUpgradeCookie({name:'Licorice macarons',desc:'Also known as "blackarons".',icon:[25,4],require:'Box of macarons',				power:3,price: 9999999999999999999999999});
		
		
		order=525;
		new Game.TieredUpgrade('Taller tellers','Banks are <b>twice</b> as efficient.<q>Able to process a higher amount of transactions. Careful though, as taller tellers tell tall tales.</q>','Bank',1);
		new Game.TieredUpgrade('Scissor-resistant credit cards','Banks are <b>twice</b> as efficient.<q>For those truly valued customers.</q>','Bank',2);
		new Game.TieredUpgrade('Acid-proof vaults','Banks are <b>twice</b> as efficient.<q>You know what they say : better safe than sorry.</q>','Bank',3);
		new Game.TieredUpgrade('Chocolate coins','Banks are <b>twice</b> as efficient.<q>This revolutionary currency is much easier to melt from and into ingots - and tastes much better, for a change.</q>','Bank',4);
		new Game.TieredUpgrade('Exponential interest rates','Banks are <b>twice</b> as efficient.<q>Can\'t argue with mathematics! Now fork it over.</q>','Bank',5);
		new Game.TieredUpgrade('Financial zen','Banks are <b>twice</b> as efficient.<q>The ultimate grail of economic thought; the feng shui of big money, the stock market yoga - the Heimlich maneuver of dimes and nickels.</q>','Bank',6);
		
		order=550;
		new Game.TieredUpgrade('Golden idols','Temples are <b>twice</b> as efficient.<q>Lure even greedier adventurers to retrieve your cookies. Now that\'s a real idol game!</q>','Temple',1);
		new Game.TieredUpgrade('Sacrifices','Temples are <b>twice</b> as efficient.<q>What\'s a life to a gigaton of cookies?</q>','Temple',2);
		new Game.TieredUpgrade('Delicious blessing','Temples are <b>twice</b> as efficient.<q>And lo, the Baker\'s almighty spoon came down and distributed holy gifts unto the believers - shimmering sugar, and chocolate dark as night, and all manner of wheats. And boy let me tell you, that party was mighty gnarly.</q>','Temple',3);
		new Game.TieredUpgrade('Sun festival','Temples are <b>twice</b> as efficient.<q>Free the primordial powers of your temples with these annual celebrations involving fire-breathers, traditional dancing, ritual beheadings and other merriments!</q>','Temple',4);
		new Game.TieredUpgrade('Enlarged pantheon','Temples are <b>twice</b> as efficient.<q>Enough spiritual inadequacy! More divinities than you\'ll ever need, or your money back! 100% guaranteed!</q>','Temple',5);
		new Game.TieredUpgrade('Great Baker in the sky','Temples are <b>twice</b> as efficient.<q>This is it. The ultimate deity has finally cast Their sublimely divine eye upon your operation; whether this is a good thing or possibly the end of days is something you should find out very soon.</q>','Temple',6);
		
		order=575;
		new Game.TieredUpgrade('Pointier hats','Wizard towers are <b>twice</b> as efficient.<q>Tests have shown increased thaumic receptivity relative to the geometric proportions of wizardly conic implements.</q>','Wizard tower',1);
		new Game.TieredUpgrade('Beardlier beards','Wizard towers are <b>twice</b> as efficient.<q>Haven\'t you heard? The beard is the word.</q>','Wizard tower',2);
		new Game.TieredUpgrade('Ancient grimoires','Wizard towers are <b>twice</b> as efficient.<q>Contain interesting spells such as "Turn Water To Drool", "Grow Eyebrows On Furniture" and "Summon Politician".</q>','Wizard tower',3);
		new Game.TieredUpgrade('Kitchen curses','Wizard towers are <b>twice</b> as efficient.<q>Exotic magic involved in all things pastry-related. Hexcellent!</q>','Wizard tower',4);
		new Game.TieredUpgrade('School of sorcery','Wizard towers are <b>twice</b> as efficient.<q>This cookie-funded academy of witchcraft is home to the 4 prestigious houses of magic : the Jocks, the Nerds, the Preps, and the Deathmunchers.</q>','Wizard tower',5);
		new Game.TieredUpgrade('Dark formulas','Wizard towers are <b>twice</b> as efficient.<q>Eldritch forces are at work behind these spells - you get the feeling you really shouldn\'t be messing with those. But I mean, free cookies, right?</q>','Wizard tower',6);

		order=250;
		new Game.Upgrade('Banker grandmas',Game.getGrandmaSynergyUpgradeDesc('Bank')+'<q>A nice banker to cash in more cookies.</q>',Game.Objects['Bank'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('Priestess grandmas',Game.getGrandmaSynergyUpgradeDesc('Temple')+'<q>A nice priestess to praise the one true Baker in the sky.</q>',Game.Objects['Temple'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		new Game.Upgrade('Witch grandmas',Game.getGrandmaSynergyUpgradeDesc('Wizard tower')+'<q>A nice witch to cast a zip, and a zoop, and poof! Cookies.</q>',Game.Objects['Wizard tower'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		
		
		
		order=0;
		new Game.Upgrade('Tin of british tea biscuits','Contains an assortment of fancy biscuits.<q>Every time is tea time.</q>',25,[21,8]);Game.last.pool='prestige';Game.last.parents=['Heavenly cookies'];
		new Game.Upgrade('Box of macarons','Contains an assortment of macarons.<q>Multicolored delicacies filled with various kinds of jam.<br>Not to be confused with macaroons, macaroni, macarena or any of that nonsense.</q>',25,[20,8]);Game.last.pool='prestige';Game.last.parents=['Heavenly cookies'];
		new Game.Upgrade('Box of brand biscuits','Contains an assortment of popular biscuits.<q>They\'re brand new!</q>',25,[20,9]);Game.last.pool='prestige';Game.last.parents=['Heavenly cookies'];
	
		order=10020;
		Game.NewUpgradeCookie({name:'Pure black chocolate cookies',desc:'Dipped in a lab-made substance darker than the darkest cocoa (dubbed "chocoalate").',icon:[26,3],power:									4,price: 9999999999999999*5});
		Game.NewUpgradeCookie({name:'Pure white chocolate cookies',desc:'Elaborated on the nano-scale, the coating on this biscuit is able to refract light even in a pitch-black environment.',icon:[26,4],power:	4,price: 9999999999999999*5});
		Game.NewUpgradeCookie({name:'Ladyfingers',desc:'Cleaned and sanitized so well you\'d swear they\'re actual biscuits.',icon:[27,3],power:																	3,price: 99999999999999999});
		Game.NewUpgradeCookie({name:'Tuiles',desc:'These never go out of tile.',icon:[27,4],power:																													3,price: 99999999999999999*5});
		Game.NewUpgradeCookie({name:'Chocolate-stuffed biscuits',desc:'A princely snack!<br>The holes are so the chocolate stuffing can breathe.',icon:[28,3],power:												3,price: 999999999999999999});
		Game.NewUpgradeCookie({name:'Checker cookies',desc:'A square cookie? This solves so many storage and packaging problems! You\'re a genius!',icon:[28,4],power:												3,price: 999999999999999999*5});
		Game.NewUpgradeCookie({name:'Butter cookies',desc:'These melt right off your mouth and into your heart. (Let\'s face it, they\'re rather fattening.)',icon:[29,3],power:									3,price: 9999999999999999999});
		Game.NewUpgradeCookie({name:'Cream cookies',desc:'It\'s like two chocolate chip cookies! But brought together with the magic of cream! It\'s fiendishly perfect!',icon:[29,4],power:						3,price: 9999999999999999999*5});

		order=0;
		var desc='Placing an upgrade in this slot will make its effects <b>permanent</b> across all playthroughs.<br><b>Click to activate.</b>';
		new Game.Upgrade('Permanent upgrade slot I',desc,	100,[0,10]);Game.last.pool='prestige';Game.last.iconFunction=function(){return Game.PermanentSlotIcon(0);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(0);};
		new Game.Upgrade('Permanent upgrade slot II',desc,	2000,[1,10]);Game.last.pool='prestige';Game.last.parents=['Permanent upgrade slot I'];Game.last.iconFunction=function(){return Game.PermanentSlotIcon(1);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(1);};
		new Game.Upgrade('Permanent upgrade slot III',desc,	30000,[2,10]);Game.last.pool='prestige';Game.last.parents=['Permanent upgrade slot II'];Game.last.iconFunction=function(){return Game.PermanentSlotIcon(2);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(2);};
		new Game.Upgrade('Permanent upgrade slot IV',desc,	400000,[3,10]);Game.last.pool='prestige';Game.last.parents=['Permanent upgrade slot III'];Game.last.iconFunction=function(){return Game.PermanentSlotIcon(3);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(3);};
		new Game.Upgrade('Permanent upgrade slot V',desc,	5000000,[4,10]);Game.last.pool='prestige';Game.last.parents=['Permanent upgrade slot IV'];Game.last.iconFunction=function(){return Game.PermanentSlotIcon(4);};Game.last.activateFunction=function(){Game.AssignPermanentSlot(4);};
		
		Game.PermanentSlotIcon=function(slot)
		{
			if (Game.permanentUpgrades[slot]==-1) return [slot,10];
			return Game.UpgradesById[Game.permanentUpgrades[slot]].icon;
		}
		Game.AssignPermanentSlot=function(slot)
		{
			PlaySound('snd/tick.mp3');
			Game.tooltip.hide();
			var list=[];
			for (var i in Game.Upgrades)
			{
				var me=Game.Upgrades[i];
				if (me.bought && me.unlocked && !me.noPerm && (me.pool=='' || me.pool=='cookie'))
				{
					var fail=0;
					for (var ii in Game.permanentUpgrades) {if (Game.permanentUpgrades[ii]==me.id) fail=1;}//check if not already in another permaslot
					if (!fail) list.push(me);
				}
			}
			
			var sortMap=function(a,b)
			{
				if (a.order>b.order) return 1;
				else if (a.order<b.order) return -1;
				else return 0;
			}
			list.sort(sortMap);
			
			var upgrades='';
			for (var i in list)
			{
				var me=list[i];
				upgrades+=Game.crate(me,'','PlaySound(\'snd/tick.mp3\');Game.PutUpgradeInPermanentSlot('+me.id+','+slot+');','upgradeForPermanent'+me.id);
			}
			var upgrade=Game.permanentUpgrades[slot];
			Game.SelectingPermanentUpgrade=upgrade;
			Game.Prompt('<h3>Pick an upgrade to make permanent</h3>'+
			
						'<div class="line"></div><div style="margin:4px auto;clear:both;width:120px;"><div class="crate upgrade enabled" style="background-position:'+(-slot*48)+'px '+(-10*48)+'px;"></div><div id="upgradeToSlot" class="crate upgrade enabled" style="background-position:'+(upgrade==-1?((-0*48)+'px '+(-7*48)+'px'):((-Game.UpgradesById[upgrade].icon[0]*48)+'px '+(-Game.UpgradesById[upgrade].icon[1]*48)+'px'))+';"></div></div>'+
						'<div class="block crateBox" style="overflow-y:scroll;float:left;clear:left;width:317px;padding:0px;height:250px;">'+upgrades+'</div>'+
						'<div class="block" style="float:right;width:152px;clear:right;height:234px;">Here are all the upgrades you\'ve purchased last playthrough.<div class="line"></div>Pick one to permanently gain its effects!<div class="line"></div>You can reassign this slot anytime you ascend.</div>'
						,[['Confirm','Game.permanentUpgrades['+slot+']=Game.SelectingPermanentUpgrade;Game.BuildAscendTree();Game.ClosePrompt();'],'Cancel'],0,'widePrompt');
		}
		Game.SelectingPermanentUpgrade=-1;
		Game.PutUpgradeInPermanentSlot=function(upgrade,slot)
		{
			Game.SelectingPermanentUpgrade=upgrade;
			l('upgradeToSlot').style.backgroundPosition=(-Game.UpgradesById[upgrade].icon[0]*48)+'px '+(-Game.UpgradesById[upgrade].icon[1]*48)+'px';
		}
		
		new Game.Upgrade('Starspawn','Eggs drop <b>10%</b> more often.<br>Golden cookies appear <b>2%</b> more often during Easter.',111111,[0,12]);Game.last.pool='prestige';Game.last.parents=['Season switcher'];
		new Game.Upgrade('Starsnow','Christmas cookies drop <b>5%</b> more often.<br>Reindeer appear <b>5%</b> more often.',111111,[12,9]);Game.last.pool='prestige';Game.last.parents=['Season switcher'];
		new Game.Upgrade('Starterror','Spooky cookies drop <b>10%</b> more often.<br>Golden cookies appear <b>2%</b> more often during Halloween.',111111,[13,8]);Game.last.pool='prestige';Game.last.parents=['Season switcher'];
		new Game.Upgrade('Starlove','Heart cookies are <b>50%</b> more powerful.<br>Golden cookies appear <b>2%</b> more often during Valentines.',111111,[20,3]);Game.last.pool='prestige';Game.last.parents=['Season switcher'];
		new Game.Upgrade('Startrade','Golden cookies appear <b>5%</b> more often during Business day.',111111,[17,6]);Game.last.pool='prestige';Game.last.parents=['Season switcher'];
		
		var angelPriceFactor=7;
		var desc=function(percent,total){return 'You gain another <b>+'+percent+'%</b> of your regular CpS while the game is closed, for a total of <b>'+total+'%</b>.';}
		new Game.Upgrade('Angels',desc(10,15)+'<q>Lowest-ranking at the first sphere of pastry heaven, angels are tasked with delivering new recipes to the mortals they deem worthy.</q>',Math.pow(angelPriceFactor,1),[0,11]);Game.last.pool='prestige';Game.last.parents=['Twin Gates of Transcendence'];
		new Game.Upgrade('Archangels',desc(10,25)+'<q>Members of the first sphere of pastry heaven, archangels are responsible for the smooth functioning of the world\'s largest bakeries.</q>',Math.pow(angelPriceFactor,2),[1,11]);Game.last.pool='prestige';Game.last.parents=['Angels'];
		new Game.Upgrade('Virtues',desc(10,35)+'<q>Found at the second sphere of pastry heaven, virtues make use of their heavenly strength to push and drag the stars of the cosmos.</q>',Math.pow(angelPriceFactor,3),[2,11]);Game.last.pool='prestige';Game.last.parents=['Archangels'];
		new Game.Upgrade('Dominions',desc(10,45)+'<q>Ruling over the second sphere of pastry heaven, dominions hold a managerial position and are in charge of accounting and regulating schedules.</q>',Math.pow(angelPriceFactor,4),[3,11]);Game.last.pool='prestige';Game.last.parents=['Virtues'];
		new Game.Upgrade('Cherubim',desc(10,55)+'<q>Sieging at the first sphere of pastry heaven, the four-faced cherubim serve as heavenly bouncers and bodyguards.</q>',Math.pow(angelPriceFactor,5),[4,11]);Game.last.pool='prestige';Game.last.parents=['Dominions'];
		new Game.Upgrade('Seraphim',desc(10,65)+'<q>Leading the first sphere of pastry heaven, seraphim possess ultimate knowledge of everything pertaining to baking.</q>',Math.pow(angelPriceFactor,6),[5,11]);Game.last.pool='prestige';Game.last.parents=['Cherubim'];
		new Game.Upgrade('God',desc(10,75)+'<q>Like Santa, but less fun.</q>',Math.pow(angelPriceFactor,7),[6,11]);Game.last.pool='prestige';Game.last.parents=['Seraphim'];
		
		new Game.Upgrade('Twin Gates of Transcendence','You now <b>keep making cookies while the game is closed</b>, at the rate of <b>5%</b> of your regular CpS and up to <b>1 hour</b> after the game is closed.<br>(Beyond 1 hour, this is reduced by a further 90% - your rate goes down to <b>0.5%</b> of your CpS.)<q>This is one occasion you\'re always underdressed for. Don\'t worry, just rush in past the bouncer and pretend you know people.</q>',1,[15,11]);Game.last.pool='prestige';

		new Game.Upgrade('Heavenly luck','Golden cookies appear <b>5%</b> more often.<q>Someone up there likes you.</q>',77,[22,6]);Game.last.pool='prestige';
		new Game.Upgrade('Lasting fortune','Golden cookies effects last <b>10%</b> longer.<q>This isn\'t your average everyday luck. This is... advanced luck.</q>',777,[23,6]);Game.last.pool='prestige';Game.last.parents=['Heavenly luck'];
		new Game.Upgrade('Decisive fate','Golden cookies stay <b>5%</b> longer.<q>Life just got a bit more intense.</q>',7777,[10,14]);Game.last.pool='prestige';Game.last.parents=['Lasting fortune'];

		new Game.Upgrade('Divine discount','Buildings are <b>1% cheaper</b>.<q>Someone special deserves a special price.</q>',99999,[21,7]);Game.last.pool='prestige';Game.last.parents=['Decisive fate'];
		new Game.Upgrade('Divine sales','Upgrades are <b>1% cheaper</b>.<q>Everything must go!</q>',99999,[18,7]);Game.last.pool='prestige';Game.last.parents=['Decisive fate'];
		new Game.Upgrade('Divine bakeries','Cookie upgrades are <b>5 times cheaper</b>.<q>They sure know what they\'re doing.</q>',399999,[17,7]);Game.last.pool='prestige';Game.last.parents=['Divine sales','Divine discount'];
		
		new Game.Upgrade('Starter kit','You start with <b>10 cursors</b>.<q>This can come in handy.</q>',50,[0,14]);Game.last.pool='prestige';Game.last.parents=['Tin of british tea biscuits','Box of macarons','Box of brand biscuits','Tin of butter cookies'];
		new Game.Upgrade('Starter kitchen','You start with <b>5 grandmas</b>.<q>Where did these come from?</q>',5000,[1,14]);Game.last.pool='prestige';Game.last.parents=['Starter kit'];
		new Game.Upgrade('Halo gloves','Clicks are <b>10% more powerful</b>.<q>Smite that cookie.</q>',55555,[22,7]);Game.last.pool='prestige';Game.last.parents=['Starter kit'];

		new Game.Upgrade('Kitten angels','You gain <b>more CpS</b> the more milk you have.<q>All cats go to heaven.</q>',9000,[23,7]);Game.last.pool='prestige';Game.last.parents=['Dominions'];Game.last.kitten=1;
		
		new Game.Upgrade('Unholy bait','Wrinklers appear <b>5 times</b> as fast.<q>No wrinkler can resist the scent of worm biscuits.</q>',44444,[15,12]);Game.last.pool='prestige';Game.last.parents=['Starter kitchen'];
		new Game.Upgrade('Sacrilegious corruption','Wrinklers regurgitate <b>5%</b> more cookies.<q>Unique in the animal kingdom, the wrinkler digestive tract is able to withstand an incredible degree of dilation - provided you prod them appropriately.</q>',444444,[19,8]);Game.last.pool='prestige';Game.last.parents=['Unholy bait'];
		
		
		order=200;new Game.TieredUpgrade('Xtreme walkers','Grandmas are <b>twice</b> as efficient.<q>Complete with flame decals and a little horn that goes "toot".</q>','Grandma',7);
		order=300;new Game.TieredUpgrade('Fudge fungus','Farms are <b>twice</b> as efficient.<q>A sugary parasite whose tendrils help cookie growth.<br>Please do not breathe in the spores. In case of spore ingestion, seek medical help within the next 36 seconds.</q>','Farm',7);
		order=400;new Game.TieredUpgrade('Planetsplitters','Mines are <b>twice</b> as efficient.<q>These new state-of-the-art excavators have been tested on Merula, Globort and Flwanza VI, among other distant planets which have been curiously quiet lately.</q>','Mine',7);
		order=500;new Game.TieredUpgrade('Cyborg workforce','Factories are <b>twice</b> as efficient.<q>Semi-synthetic organisms don\'t slack off, don\'t unionize, and have 20% shorter lunch breaks, making them ideal labor fodder.</q>','Factory',7);
		order=525;new Game.TieredUpgrade('Way of the wallet','Banks are <b>twice</b> as efficient.<q>This new monetary school of thought is all the rage on the banking scene; follow its precepts and you may just profit from it.</q>','Bank',7);
		order=550;new Game.TieredUpgrade('Creation myth','Temples are <b>twice</b> as efficient.<q>Stories have been circulating about the origins of the very first cookie that was ever baked; tales of how it all began, in the Dough beyond time and the Ovens of destiny.</q>','Temple',7);
		order=575;new Game.TieredUpgrade('Cookiemancy','Wizard towers are <b>twice</b> as efficient.<q>There it is; the perfected school of baking magic. From summoning chips to hexing nuts, there is not a single part of cookie-making that hasn\'t been improved tenfold by magic tricks.</q>','Wizard tower',7);
		order=600;new Game.TieredUpgrade('Dyson sphere','Shipments are <b>twice</b> as efficient.<q>You\'ve found a way to apply your knowledge of cosmic technology to slightly more local endeavors; this gigantic sphere of meta-materials, wrapping the solar system, is sure to kick your baking abilities up a notch.</q>','Shipment',7);
		order=700;new Game.TieredUpgrade('Theory of atomic fluidity','Alchemy labs are <b>twice</b> as efficient.<q>Pushing alchemy to its most extreme limits, you find that everything is transmutable into anything else - lead to gold, mercury to water; more importantly, you realize that anything can -and should- be converted to cookies.</q>','Alchemy lab',7);
		order=800;new Game.TieredUpgrade('End of times back-up plan','Portals are <b>twice</b> as efficient.<q>Just in case, alright?</q>','Portal',7);
		order=900;new Game.TieredUpgrade('Great loop hypothesis','Time machines are <b>twice</b> as efficient.<q>What if our universe is just one instance of an infinite cycle? What if, before and after it, stretched infinite amounts of the same universe, themselves containing infinite amounts of cookies?</q>','Time machine',7);
		order=1000;new Game.TieredUpgrade('The Pulse','Antimatter condensers are <b>twice</b> as efficient.<q>You\'ve tapped into the very pulse of the cosmos, a timeless rhythm along which every material and antimaterial thing beats in unison. This, somehow, means more cookies.</q>','Antimatter condenser',7);
		order=1100;
		new Game.TieredUpgrade('Lux sanctorum','Prisms are <b>twice</b> as efficient.<q>Your prism attendants have become increasingly mesmerized with something in the light - or maybe something beyond it; beyond us all, perhaps?</q>','Prism',7);
		
		
		order=200;new Game.TieredUpgrade('The Unbridling','Grandmas are <b>twice</b> as efficient.<q>It might be a classic tale of bad parenting, but let\'s see where grandma is going with this.</q>','Grandma',8);
		order=300;new Game.TieredUpgrade('Wheat triffids','Farms are <b>twice</b> as efficient.<q>Taking care of crops is so much easier when your plants can just walk about and help around the farm.<br>Do not pet. Do not feed. Do not attempt to converse with.</q>','Farm',8);
		order=400;new Game.TieredUpgrade('Canola oil wells','Mines are <b>twice</b> as efficient.<q>A previously untapped resource, canola oil permeates the underground olifers which grant it its particular taste and lucrative properties.</q>','Mine',8);
		order=500;new Game.TieredUpgrade('78-hour days','Factories are <b>twice</b> as efficient.<q>Why didn\'t we think of this earlier?</q>','Factory',8);
		order=525;new Game.TieredUpgrade('The stuff rationale','Banks are <b>twice</b> as efficient.<q>If not now, when? If not it, what? If not things... stuff?</q>','Bank',8);
		order=550;new Game.TieredUpgrade('Theocracy','Temples are <b>twice</b> as efficient.<q>You\'ve turned your cookie empire into a perfect theocracy, gathering the adoration of zillions of followers from every corner of the universe.<br>Don\'t let it go to your head.</q>','Temple',8);
		order=575;new Game.TieredUpgrade('Rabbit trick','Wizard towers are <b>twice</b> as efficient.<q>Using nothing more than a fancy top hat, your wizards have found a way to simultaneously curb rabbit population and produce heaps of extra cookies for basically free!<br>Resulting cookies may or may not be fit for vegans.</q>','Wizard tower',8);
		order=600;new Game.TieredUpgrade('The final frontier','Shipments are <b>twice</b> as efficient.<q>It\'s been a long road, getting from there to here. It\'s all worth it though - the sights are lovely and the oil prices slightly more reasonable.</q>','Shipment',8);
		order=700;new Game.TieredUpgrade('Beige goo','Alchemy labs are <b>twice</b> as efficient.<q>Well now you\'ve done it. Good job. Very nice. That\'s 3 galaxies you\'ve just converted into cookies. Good thing you can hop from universe to universe.</q>','Alchemy lab',8);
		order=800;new Game.TieredUpgrade('Maddening chants','Portals are <b>twice</b> as efficient.<q>A popular verse goes like so : "jau\'hn madden jau\'hn madden aeiouaeiouaeiou brbrbrbrbrbrbr"</q>','Portal',8);
		order=900;new Game.TieredUpgrade('Cookietopian moments of maybe','Time machines are <b>twice</b> as efficient.<q>Reminiscing how things could have been, should have been, will have been.</q>','Time machine',8);
		order=1000;new Game.TieredUpgrade('Some other super-tiny fundamental particle? Probably?','Antimatter condensers are <b>twice</b> as efficient.<q>When even the universe is running out of ideas, that\'s when you know you\'re nearing the end.</q>','Antimatter condenser',8);
		order=1100;
		new Game.TieredUpgrade('Reverse shadows','Prisms are <b>twice</b> as efficient.<q>Oh man, this is really messing with your eyes.</q>','Prism',8);
		
		
		order=20000;
		new Game.Upgrade('Kitten accountants','You gain <b>more CpS</b> the more milk you have.<q>business going great, sir</q>',900000000000000000000000,Game.GetIcon('Kitten',6));Game.last.kitten=1;
		new Game.Upgrade('Kitten specialists','You gain <b>more CpS</b> the more milk you have.<q>optimeowzing your workflow like whoah, sir</q>',900000000000000000000000000,Game.GetIcon('Kitten',7));Game.last.kitten=1;
		new Game.Upgrade('Kitten experts','You gain <b>more CpS</b> the more milk you have.<q>10 years expurrrtise in the cookie business, sir</q>',900000000000000000000000000000,Game.GetIcon('Kitten',8));Game.last.kitten=1;
		
		new Game.Upgrade('How to bake your dragon','Allows you to purchase a <b>crumbly egg</b> once you have earned 1 million cookies.<q>A tome full of helpful tips such as "oh god, stay away from it", "why did we buy this thing, it\'s not even house-broken" and "groom twice a week in the direction of the scales".</q>',9,[22,12]);Game.last.pool='prestige';

		order=25100;
		new Game.Upgrade('A crumbly egg','Unlocks the <b>cookie dragon egg</b>.<q>Thank you for adopting this robust, fun-loving cookie dragon! It will bring you years of joy and entertainment.<br>Keep in a dry and cool place, and away from other house pets. Subscription to home insurance is strongly advised.</q>',25,[21,12]);
		
		new Game.Upgrade('Chimera','Synergy upgrades are <b>2% cheaper</b>.<br>You gain another <b>+5%</b> of your regular CpS while the game is closed.<br>You retain optimal cookie production while the game is closed for <b>2 more days</b>.<q>More than the sum of its parts.</q>',Math.pow(angelPriceFactor,8),[24,7]);Game.last.pool='prestige';Game.last.parents=['God','Lucifer','Synergies Vol. II'];
		
		new Game.Upgrade('Tin of butter cookies','Contains an assortment of rich butter cookies.<q>Five varieties of danish cookies.<br>Complete with little paper cups.</q>',25,[21,9]);Game.last.pool='prestige';Game.last.parents=['Heavenly cookies'];
		
		new Game.Upgrade('Golden switch','Unlocks the <b>golden switch</b>, which passively boosts your CpS by 50% but disables golden cookies.<q>Less clicking, more idling.</q>',999,[21,10]);Game.last.pool='prestige';Game.last.parents=['Heavenly luck'];
		
		new Game.Upgrade('Classic dairy selection','Unlocks the <b>milk selector</b>, letting you pick which milk is displayed under your cookie.<br>Comes with a variety of basic flavors.<q>Don\'t have a cow, man.</q>',9,[1,8]);Game.last.pool='prestige';Game.last.parents=[];
		
		new Game.Upgrade('Fanciful dairy selection','Contains more exotic flavors for your milk selector.<q>Strong bones for the skeleton army.</q>',1000000,[9,7]);Game.last.pool='prestige';Game.last.parents=['Classic dairy selection'];
		
		order=10300;
		Game.NewUpgradeCookie({name:'Dragon cookie',desc:'Imbued with the vigor and vitality of a full-grown cookie dragon, this mystical cookie will embolden your empire for the generations to come.',icon:[10,25],power:5,price:9999999999999999*7,locked:1});
		
		
		order=40000;
		new Game.Upgrade('Golden switch [off]','Turning this on will give you a passive <b>+50% CpS</b>, but prevents golden cookies from spawning.<br>Cost is equal to 1 hour of production.',1000000,[20,10]);
		Game.last.pool='toggle';Game.last.toggleInto='Golden switch [on]';
		Game.last.priceFunc=function(){return Game.cookiesPs*60*60;}
		
		new Game.Upgrade('Golden switch [on]','The switch is currently giving you a passive <b>+50% CpS</b>; it also prevents golden cookies from spawning.<br>Turning it off will revert those effects.<br>Cost is equal to 1 hour of production.',1000000,[21,10]);
		Game.last.pool='toggle';Game.last.toggleInto='Golden switch [off]';
		Game.last.priceFunc=function(){return Game.cookiesPs*60*60;}
		
		order=50000;
		new Game.Upgrade('Milk selector','Lets you pick what flavor of milk to display.',0,[1,8]);
		Game.last.pool='toggle';
		Game.last.choicesFunction=function()
		{
			var choices=[];
			choices[0]={name:'Automatic',icon:[0,7]};
			choices[1]={name:'Plain milk',icon:[1,8]};
			choices[2]={name:'Chocolate milk',icon:[2,8]};
			choices[3]={name:'Raspberry milk',icon:[3,8]};
			choices[4]={name:'Orange milk',icon:[4,8]};
			choices[5]={name:'Caramel milk',icon:[5,8]};
			choices[6]={name:'Banana milk',icon:[6,8]};
			choices[7]={name:'Lime milk',icon:[7,8]};
			choices[8]={name:'Blueberry milk',icon:[8,8]};
			choices[9]={name:'Strawberry milk',icon:[9,8]};
			choices[10]={name:'Vanilla milk',icon:[10,8]};
			
			if (Game.Has('Fanciful dairy selection'))
			{
				choices[11]={name:'Zebra milk',icon:[10,7]};
				choices[12]={name:'Cosmic milk',icon:[9,7]};
				choices[13]={name:'Flaming milk',icon:[8,7]};
				choices[14]={name:'Sanguine milk',icon:[7,7]};
				choices[15]={name:'Midas milk',icon:[6,7]};
				choices[16]={name:'Midnight milk',icon:[5,7]};
				choices[17]={name:'Green inferno milk',icon:[4,7]};
				choices[18]={name:'Frostfire milk',icon:[3,7]};
			}
			
			choices[19]={name:'Honey milk',icon:[21,23]};
			
			choices[Game.milkType].selected=1;
			return choices;
		}
		Game.last.choicesPick=function(id)
		{Game.milkType=id;}
		
		Game.MilksByChoice={
			0:{pic:'milkPlain'},
			1:{pic:'milkPlain'},
			2:{pic:'milkChocolate'},
			3:{pic:'milkRaspberry'},
			4:{pic:'milkOrange'},
			5:{pic:'milkCaramel'},
			6:{pic:'milkBanana'},
			7:{pic:'milkLime'},
			8:{pic:'milkBlueberry'},
			9:{pic:'milkStrawberry'},
			10:{pic:'milkVanilla'},
			11:{pic:'milkZebra'},
			12:{pic:'milkStars'},
			13:{pic:'milkFire'},
			14:{pic:'milkBlood'},
			15:{pic:'milkGold'},
			16:{pic:'milkBlack'},
			17:{pic:'milkGreenFire'},
			18:{pic:'milkBlueFire'},
			19:{pic:'milkHoney'},
		};
		
		
		order=10300;
		Game.NewUpgradeCookie({name:'Milk chocolate butter biscuit',desc:'Rewarded for owning 100 of everything.<br>It bears the engraving of a fine entrepreneur.',icon:[27,8],power:	10,price: 999999999999999999999,locked:1});
		Game.NewUpgradeCookie({name:'Dark chocolate butter biscuit',desc:'Rewarded for owning 150 of everything.<br>It is adorned with the image of an experienced cookie tycoon.',icon:[27,9],power:	10,price: 999999999999999999999999,locked:1});
		Game.NewUpgradeCookie({name:'White chocolate butter biscuit',desc:'Rewarded for owning 200 of everything.<br>The chocolate is chiseled to depict a masterful pastry magnate.',icon:[28,9],power:	10,price: 999999999999999999999999999,locked:1});
		Game.NewUpgradeCookie({name:'Ruby chocolate butter biscuit',desc:'Rewarded for owning 250 of everything.<br>Covered in a rare red chocolate, this biscuit is etched to represent the face of a cookie industrialist gone mad with power.',icon:[28,8],power:	10,price: 999999999999999999999999999999,locked:1});
		
		order=10020;
		Game.NewUpgradeCookie({name:'Gingersnaps',desc:'Cookies with a soul. Probably.',icon:[29,10],power:						4,price: 99999999999999999999});
		Game.NewUpgradeCookie({name:'Cinnamon cookies',desc:'The secret is in the patented swirly glazing.',icon:[23,8],power:						4,price: 99999999999999999999*5});
		Game.NewUpgradeCookie({name:'Vanity cookies',desc:'One tiny candied fruit sits atop this decadent cookie.',icon:[22,8],power:						4,price: 999999999999999999999});
		Game.NewUpgradeCookie({name:'Cigars',desc:'Close, but no match for those extravagant cookie straws they serve in coffee shops these days.',icon:[25,8],power:						4,price: 999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Pinwheel cookies',desc:'Bringing you the dizzying combination of brown flavor and beige taste!',icon:[22,10],power:						4,price: 9999999999999999999999});
		Game.NewUpgradeCookie({name:'Fudge squares',desc:'Not exactly cookies, but you won\'t care once you\'ve tasted one of these.<br>They\'re so good, it\'s fudged-up!',icon:[24,8],power:						4,price: 9999999999999999999999*5});
		
		order=10030;
		Game.NewUpgradeCookie({name:'Digits',desc:'Three flavors, zero phalanges.',icon:[26,8],require:'Box of brand biscuits',power:												2,	price:	999999999999999*5});
		
		order=10030;
		Game.NewUpgradeCookie({name:'Butter horseshoes',desc:'It would behoove you to not overindulge in these.',icon:[22,9],require:'Tin of butter cookies',power:							4,	price:	99999999999999999999999});
		Game.NewUpgradeCookie({name:'Butter pucks',desc:'Lord, what fools these mortals be!<br>(This is kind of a hokey reference.)',icon:[23,9],require:'Tin of butter cookies',power:							4,	price:	99999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Butter knots',desc:'Look, you can call these pretzels if you want, but you\'d just be fooling yourself, wouldn\'t you?',icon:[24,9],require:'Tin of butter cookies',power:							4,	price:	999999999999999999999999});
		Game.NewUpgradeCookie({name:'Butter slabs',desc:'Nothing better than a slab in the face.',icon:[25,9],require:'Tin of butter cookies',power:							4,	price:	999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Butter swirls',desc:'These are equal parts sugar, butter, and warm fuzzy feelings - all of which cause millions of deaths everyday.',icon:[26,9],require:'Tin of butter cookies',power:							4,	price:	9999999999999999999999999});
		
		order=10020;
		Game.NewUpgradeCookie({name:'Shortbread biscuits',desc:'These rich butter cookies are neither short, nor bread. What a country!',icon:[23,10],power:						4,price: 99999999999999999999999});
		Game.NewUpgradeCookie({name:'Millionaires\' shortbreads',desc:'Three thought-provoking layers of creamy chocolate, hard-working caramel and crumbly biscuit in a poignant commentary of class struggle.',icon:[24,10],power:						4,price: 99999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Caramel cookies',desc:'The polymerized carbohydrates adorning these cookies are sure to stick to your teeth for quite a while.',icon:[25,10],power:						4,price: 999999999999999999999999});
		
		
		var desc=function(totalHours){
			var hours=totalHours%24;
			var days=Math.floor(totalHours/24);
			var str=hours+(hours==1?' hour':' hours');
			if (days>0) str=days+(days==1?' day':' days')+' and '+str;
			return 'You retain optimal cookie production while the game is closed for twice as long, for a total of <b>'+str+'</b>.';
		}
		new Game.Upgrade('Belphegor',desc(2)+'<q>A demon of shortcuts and laziness, Belphegor commands machines to do work in his stead.</q>',Math.pow(angelPriceFactor,1),[7,11]);Game.last.pool='prestige';Game.last.parents=['Twin Gates of Transcendence'];
		new Game.Upgrade('Mammon',desc(4)+'<q>The demonic embodiment of wealth, Mammon requests a tithe of blood and gold from all his worshippers.</q>',Math.pow(angelPriceFactor,2),[8,11]);Game.last.pool='prestige';Game.last.parents=['Belphegor'];
		new Game.Upgrade('Abaddon',desc(8)+'<q>Master of overindulgence, Abaddon governs the wrinkler brood and inspires their insatiability.</q>',Math.pow(angelPriceFactor,3),[9,11]);Game.last.pool='prestige';Game.last.parents=['Mammon'];
		new Game.Upgrade('Satan',desc(16)+'<q>The counterpoint to everything righteous, this demon represents the nefarious influence of deceit and temptation.</q>',Math.pow(angelPriceFactor,4),[10,11]);Game.last.pool='prestige';Game.last.parents=['Abaddon'];
		new Game.Upgrade('Asmodeus',desc(32)+'<q>This demon with three monstrous heads draws his power from the all-consuming desire for cookies and all things sweet.</q>',Math.pow(angelPriceFactor,5),[11,11]);Game.last.pool='prestige';Game.last.parents=['Satan'];
		new Game.Upgrade('Beelzebub',desc(64)+'<q>The festering incarnation of blight and disease, Beelzebub rules over the vast armies of pastry inferno.</q>',Math.pow(angelPriceFactor,6),[12,11]);Game.last.pool='prestige';Game.last.parents=['Asmodeus'];
		new Game.Upgrade('Lucifer',desc(128)+'<q>Also known as the Lightbringer, this infernal prince\'s tremendous ego caused him to be cast down from pastry heaven.</q>',Math.pow(angelPriceFactor,7),[13,11]);Game.last.pool='prestige';Game.last.parents=['Beelzebub'];
		
		new Game.Upgrade('Golden cookie alert sound','Unlocks the <b>golden cookie sound selector</b>, which lets you pick whether golden cookies emit a sound when appearing or not.<q>A sound decision.</q>',9999,[28,6]);Game.last.pool='prestige';Game.last.parents=['Decisive fate','Golden switch'];
		
		order=49900;
		new Game.Upgrade('Golden cookie sound selector','Lets you change the sound golden cookies make when they spawn.',0,[28,6]);
		Game.last.pool='toggle';
		Game.last.choicesFunction=function()
		{
			var choices=[];
			choices[0]={name:'No sound',icon:[0,7]};
			choices[1]={name:'Chime',icon:[22,6]};
			
			choices[Game.chimeType].selected=1;
			return choices;
		}
		Game.last.choicesPick=function(id)
		{Game.chimeType=id;}
		
		
		new Game.Upgrade('Basic wallpaper assortment','Unlocks the <b>background selector</b>, letting you select the game\'s background.<br>Comes with a variety of basic flavors.<q>Prioritizing aesthetics over crucial utilitarian upgrades? Color me impressed.</q>',99,[29,5]);Game.last.pool='prestige';Game.last.parents=['Classic dairy selection'];
		
		new Game.Upgrade('Legacy','This is the first heavenly upgrade; it unlocks the <b>Heavenly chips</b> system.<div class="line"></div>Each time you ascend, the cookies you made in your past life are turned into <b>heavenly chips</b> and <b>prestige</b>.<div class="line"></div><b>Heavenly chips</b> can be spent on a variety of permanent transcendental upgrades.<div class="line"></div>Your <b>prestige level</b> also gives you a permanent <b>+1% CpS</b> per level.<q>We\'ve all been waiting for you.</q>',1,[21,6]);Game.last.pool='prestige';Game.last.parents=[];
		
		new Game.Upgrade('Elder spice','You can attract <b>2 more wrinklers</b>.<q>The cookie your cookie could smell like.</q>',444444,[19,8]);Game.last.pool='prestige';Game.last.parents=['Unholy bait'];
		
		new Game.Upgrade('Residual luck','While the golden switch is on, you gain an additional <b>+10% CpS</b> per golden cookie upgrade owned.<q>Fortune comes in many flavors.</q>',99999,[27,6]);Game.last.pool='prestige';Game.last.parents=['Golden switch'];
		
		order=150;new Game.Upgrade('Fantasteel mouse','Clicking gains <b>+1% of your CpS</b>.<q>You could be clicking using your touchpad and we\'d be none the wiser.</q>',5000000000000000000,[11,17]);
		new Game.Upgrade('Nevercrack mouse','Clicking gains <b>+1% of your CpS</b>.<q>How much beefier can you make a mouse until it\'s considered a rat?</q>',500000000000000000000,[11,18]);
		
		
		new Game.Upgrade('Five-finger discount','All upgrades are <b>1% cheaper per 100 cursors</b>.<q>Stick it to the man.</q>',555555,[28,7],function(){Game.upgradesToRebuild=1;});Game.last.pool='prestige';Game.last.parents=['Halo gloves','Abaddon'];
		
		
		order=5000;
		new Game.SynergyUpgrade('Future almanacs','<q>Lets you predict optimal planting times. It\'s crazy what time travel can do!</q>','Farm','Time machine','synergy1');
		new Game.SynergyUpgrade('Rain prayer','<q>A deeply spiritual ceremonial involving complicated dance moves and high-tech cloud-busting lasers.</q>','Farm','Temple','synergy2');
		
		new Game.SynergyUpgrade('Seismic magic','<q>Surprise earthquakes are an old favorite of wizardly frat houses.</q>','Mine','Wizard tower','synergy1');
		new Game.SynergyUpgrade('Asteroid mining','<q>As per the <span>19</span>74 United Cosmic Convention, comets, moons, and inhabited planetoids are no longer legally excavatable.<br>But hey, a space bribe goes a long way.</q>','Mine','Shipment','synergy2');
		
		new Game.SynergyUpgrade('Quantum electronics','<q>Your machines won\'t even be sure if they\'re on or off!</q>','Factory','Antimatter condenser','synergy1');
		new Game.SynergyUpgrade('Temporal overclocking','<q>Introduce more quickitude in your system for increased speedation of fastness.</q>','Factory','Time machine','synergy2');
		
		new Game.SynergyUpgrade('Contracts from beyond','<q>Make sure to read the fine print!</q>','Bank','Portal','synergy1');
		new Game.SynergyUpgrade('Printing presses','<q>Fake bills so real, they\'re almost worth the ink they\'re printed with.</q>','Bank','Factory','synergy2');
		
		new Game.SynergyUpgrade('Paganism','<q>Some deities are better left unworshipped.</q>','Temple','Portal','synergy1');
		new Game.SynergyUpgrade('God particle','<q>Turns out God is much tinier than we thought, I guess.</q>','Temple','Antimatter condenser','synergy2');
		
		new Game.SynergyUpgrade('Arcane knowledge','<q>Some things were never meant to be known - only mildly speculated.</q>','Wizard tower','Alchemy lab','synergy1');
		new Game.SynergyUpgrade('Magical botany','<q>Already known in some reactionary newspapers as "the wizard\'s GMOs".</q>','Wizard tower','Farm','synergy2');
		
		new Game.SynergyUpgrade('Fossil fuels','<q>Somehow better than plutonium for powering rockets.<br>Extracted from the fuels of ancient, fossilized civilizations.</q>','Shipment','Mine','synergy1');
		new Game.SynergyUpgrade('Shipyards','<q>Where carpentry, blind luck, and asbestos insulation unite to produce the most dazzling spaceships on the planet.</q>','Shipment','Factory','synergy2');
		
		new Game.SynergyUpgrade('Primordial ores','<q>Only when refining the purest metals will you extract the sweetest sap of the earth.</q>','Alchemy lab','Mine','synergy1');
		new Game.SynergyUpgrade('Gold fund','<q>If gold is the backbone of the economy, cookies, surely, are its hip joints.</q>','Alchemy lab','Bank','synergy2');
		
		new Game.SynergyUpgrade('Infernal crops','<q>Sprinkle regularly with FIRE.</q>','Portal','Farm','synergy1');
		new Game.SynergyUpgrade('Abysmal glimmer','<q>Someone, or something, is staring back at you.<br>Perhaps at all of us.</q>','Portal','Prism','synergy2');
		
		new Game.SynergyUpgrade('Relativistic parsec-skipping','<q>People will tell you this isn\'t physically possible.<br>These are people you don\'t want on your ship.</q>','Time machine','Shipment','synergy1');
		new Game.SynergyUpgrade('Primeval glow','<q>From unending times, an ancient light still shines, impossibly pure and fragile in its old age.</q>','Time machine','Prism','synergy2');
		
		new Game.SynergyUpgrade('Extra physics funding','<q>Time to put your money where your particle colliders are.</q>','Antimatter condenser','Bank','synergy1');
		new Game.SynergyUpgrade('Chemical proficiency','<q>Discover exciting new elements, such as Fleshmeltium, Inert Shampoo Byproduct #17 and Carbon++!</q>','Antimatter condenser','Alchemy lab','synergy2');
		
		new Game.SynergyUpgrade('Light magic','<q>Actually not to be taken lightly! No, I\'m serious. 178 people died last year. You don\'t mess around with magic.</q>','Prism','Wizard tower','synergy1');
		new Game.SynergyUpgrade('Mystical energies','<q>Something beckons from within the light. It is warm, comforting, and apparently the cause for several kinds of exotic skin cancers.</q>','Prism','Temple','synergy2');
		
		
		new Game.Upgrade('Synergies Vol. I','Unlocks a new tier of upgrades that affect <b>2 buildings at the same time</b>.<br>Synergies appear once you have <b>15</b> of both buildings.<q>The many beats the few.</q>',2525,[10,20]);Game.last.pool='prestige';Game.last.parents=['Satan','Dominions'];
		new Game.Upgrade('Synergies Vol. II','Unlocks a new tier of upgrades that affect <b>2 buildings at the same time</b>.<br>Synergies appear once you have <b>75</b> of both buildings.<q>The several beats the many.</q>',252525,[10,20]);Game.last.pool='prestige';Game.last.parents=['Beelzebub','Seraphim','Synergies Vol. I'];
		
		new Game.Upgrade('Heavenly cookies','Cookie production multiplier <b>+10% permanently</b>.<q>Baked with heavenly chips. An otherwordldly flavor that transcends time and space.</q>',3,[25,12]);Game.last.pool='prestige';Game.last.parents=['Legacy'];Game.last.power=10;Game.last.pseudoCookie=true;
		new Game.Upgrade('Wrinkly cookies','Cookie production multiplier <b>+10% permanently</b>.<q>The result of regular cookies left to age out for countless eons in a place where time and space are meaningless.</q>',6666666,[26,12]);Game.last.pool='prestige';Game.last.parents=['Sacrilegious corruption','Elder spice'];Game.last.power=10;Game.last.pseudoCookie=true;
		new Game.Upgrade('Distilled essence of redoubled luck','Golden cookies have <b>1% chance of being doubled</b>.<q>Tastes glittery. The empty phial makes for a great pencil holder.</q>',7777777,[27,12]);Game.last.pool='prestige';Game.last.parents=['Divine bakeries','Residual luck'];
		
		order=40000;
		new Game.Upgrade('Occult obstruction','Cookie production <b>reduced to 0</b>.<q>If symptoms persist, consult a doctor.</q>',7,[15,5]);//debug purposes only
		Game.last.pool='debug';
		new Game.Upgrade('Glucose-charged air','Sugar lumps coalesce <b>a whole lot faster</b>.<q>Don\'t breathe too much or you\'ll get diabetes!</q>',7,[29,16]);//debug purposes only
		Game.last.pool='debug';
		
		order=10300;
		Game.NewUpgradeCookie({name:'Lavender chocolate butter biscuit',desc:'Rewarded for owning 300 of everything.<br>This subtly-flavored biscuit represents the accomplishments of decades of top-secret research. The molded design on the chocolate resembles a well-known entrepreneur who gave their all to the ancient path of baking.',icon:[26,10],power:	10,price: 999999999999999999999999999999999,locked:1});
		
		order=10030;
		Game.NewUpgradeCookie({name:'Lombardia cookies',desc:'These come from those farms with the really good memory.',icon:[23,13],require:'Box of brand biscuits',power:												3,	price:	999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Bastenaken cookies',desc:'French cookies made of delicious cinnamon and candy sugar. These do not contain Nuts!',icon:[24,13],require:'Box of brand biscuits',power:												3,	price:	999999999999999999999*5});
		
		order=10020;
		Game.NewUpgradeCookie({name:'Pecan sandies',desc:'Stick a nut on a cookie and call it a day! Name your band after it! Whatever!',icon:[25,13],power:						4,price: 999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Moravian spice cookies',desc:'Popular for being the world\'s moravianest cookies.',icon:[26,13],power:						4,price: 9999999999999999999999999});
		Game.NewUpgradeCookie({name:'Anzac biscuits',desc:'Army biscuits from a bakery down under, containing no eggs but yes oats.',icon:[27,13],power:						4,price: 9999999999999999999999999*5});
		Game.NewUpgradeCookie({name:'Buttercakes',desc:'Glistening with cholesterol, these cookies moistly straddle the line between the legal definition of a cookie and just a straight-up stick of butter.',icon:[29,13],power:						4,price: 99999999999999999999999999});
		Game.NewUpgradeCookie({name:'Ice cream sandwiches',desc:'In an alternate universe, "ice cream sandwich" designates an ice cream cone filled with bacon, lettuce, and tomatoes. Maybe some sprinkles too.',icon:[28,13],power:						4,price: 99999999999999999999999999*5});
		
		new Game.Upgrade('Stevia Caelestis','Sugar lumps ripen <b>an hour sooner</b>.<q>A plant of supernatural sweetness grown by angels in heavenly gardens.</q>',100000000,[25,15]);Game.last.pool='prestige';Game.last.parents=['Wrinkly cookies'];
		new Game.Upgrade('Diabetica Daemonicus','Sugar lumps mature <b>an hour sooner</b>.<q>A malevolent, if delicious herb that is said to grow on the cliffs of the darkest abyss of the underworld.</q>',300000000,[26,15]);Game.last.pool='prestige';Game.last.parents=['Stevia Caelestis','Lucifer'];
		new Game.Upgrade('Sucralosia Inutilis','Bifurcated sugar lumps appear <b>5% more often</b> and are <b>5% more likely</b> to drop 2 lumps.<q>A rare berry of uninteresting flavor that is as elusive as its uses are limited; only sought-after by the most avid collectors with too much wealth on their hands.</q>',1000000000,[27,15]);Game.last.pool='prestige';Game.last.parents=['Diabetica Daemonicus'];
		
		//note : these showIf functions stop working beyond 10 quadrillion prestige level, due to loss in precision; the solution, of course, is to make sure 10 quadrillion is not an attainable prestige level
		new Game.Upgrade('Lucky digit','<b>+1%</b> prestige level effect on CpS.<br><b>+1%</b> golden cookie effect duration.<br><b>+1%</b> golden cookie lifespan.<q>This upgrade is a bit shy and only appears when your prestige level ends in 7.</q>',777,[24,15]);Game.last.pool='prestige';Game.last.parents=['Heavenly luck'];Game.last.showIf=function(){return (Math.ceil(Game.prestige)%10==7);};
		new Game.Upgrade('Lucky number','<b>+1%</b> prestige level effect on CpS.<br><b>+1%</b> golden cookie effect duration.<br><b>+1%</b> golden cookie lifespan.<q>This upgrade is a reclusive hermit and only appears when your prestige level ends in 777.</q>',77777,[24,15]);Game.last.pool='prestige';Game.last.parents=['Lucky digit','Lasting fortune'];Game.last.showIf=function(){return (Math.ceil(Game.prestige)%1000==777);};
		new Game.Upgrade('Lucky payout','<b>+1%</b> prestige level effect on CpS.<br><b>+1%</b> golden cookie effect duration.<br><b>+1%</b> golden cookie lifespan.<q>This upgrade took an oath of complete seclusion from the rest of the world and only appears when your prestige level ends in 777777.</q>',77777777,[24,15]);Game.last.pool='prestige';Game.last.parents=['Lucky number','Decisive fate'];Game.last.showIf=function(){return (Math.ceil(Game.prestige)%1000000==777777);};
		
		order=50000;
		new Game.Upgrade('Background selector','Lets you pick which wallpaper to display.',0,[29,5]);
		Game.last.pool='toggle';
		Game.last.choicesFunction=function()
		{
			var choices=[];
			choices[0]={name:'Automatic',icon:[0,7]};
			choices[1]={name:'Blue',icon:[21,21]};
			choices[2]={name:'Red',icon:[22,21]};
			choices[3]={name:'White',icon:[23,21]};
			choices[4]={name:'Black',icon:[24,21]};
			choices[5]={name:'Gold',icon:[25,21]};
			choices[6]={name:'Grandmas',icon:[26,21]};
			choices[7]={name:'Displeased grandmas',icon:[27,21]};
			choices[8]={name:'Angered grandmas',icon:[28,21]};
			choices[9]={name:'Money',icon:[29,21]};
			choices[Game.bgType].selected=1;
			return choices;
		}
		Game.last.choicesPick=function(id)
		{Game.bgType=id;}
		
		Game.BGsByChoice={
			0:{pic:'bgBlue'},
			1:{pic:'bgBlue'},
			2:{pic:'bgRed'},
			3:{pic:'bgWhite'},
			4:{pic:'bgBlack'},
			5:{pic:'bgGold'},
			6:{pic:'grandmas1'},
			7:{pic:'grandmas2'},
			8:{pic:'grandmas3'},
			9:{pic:'bgMoney'},
		};
		
		order=255;
		new Game.Upgrade('Lucky grandmas',Game.getGrandmaSynergyUpgradeDesc('Chancemaker')+'<q>A fortunate grandma that always seems to find more cookies.</q>',Game.Objects['Chancemaker'].basePrice*Game.Tiers[2].price,[10,9],function(){Game.Objects['Grandma'].redraw();});
		
		order=1200;
		new Game.TieredUpgrade('Your lucky cookie','Chancemakers are <b>twice</b> as efficient.<q>This is the first cookie you\'ve ever baked. It holds a deep sentimental value and, after all this time, an interesting smell.</q>','Chancemaker',1);
		new Game.TieredUpgrade('"All Bets Are Off" magic coin','Chancemakers are <b>twice</b> as efficient.<q>A coin that always lands on the other side when flipped. Not heads, not tails, not the edge. The <i>other side</i>.</q>','Chancemaker',2);
		new Game.TieredUpgrade('Winning lottery ticket','Chancemakers are <b>twice</b> as efficient.<q>What lottery? THE lottery, that\'s what lottery! Only lottery that matters!</q>','Chancemaker',3);
		new Game.TieredUpgrade('Four-leaf clover field','Chancemakers are <b>twice</b> as efficient.<q>No giant monsters here, just a whole lot of lucky grass.</q>','Chancemaker',4);
		new Game.TieredUpgrade('A recipe book about books','Chancemakers are <b>twice</b> as efficient.<q>Tip the scales in your favor with 28 creative new ways to cook the books.</q>','Chancemaker',5);
		new Game.TieredUpgrade('Leprechaun village','Chancemakers are <b>twice</b> as efficient.<q>You\'ve finally become accepted among the local leprechauns, who lend you their mythical luck as a sign of friendship (as well as some rather foul-tasting tea).</q>','Chancemaker',6);
		new Game.TieredUpgrade('Improbability drive','Chancemakers are <b>twice</b> as efficient.<q>A strange engine that turns statistics on their head. Recommended by the Grandmother\'s Guide to the Bakery.</q>','Chancemaker',7);
		new Game.TieredUpgrade('Antisuperstistronics','Chancemakers are <b>twice</b> as efficient.<q>An exciting new field of research that makes unlucky things lucky. No mirror unbroken, no ladder unwalked under!</q>','Chancemaker',8);
		
		order=5000;
		new Game.SynergyUpgrade('Gemmed talismans','<q>Good-luck charms covered in ancient and excruciatingly rare crystals. A must have for job interviews!</q>','Chancemaker','Mine','synergy1');
		
		order=20000;
		new Game.Upgrade('Kitten consultants','You gain <b>more CpS</b> the more milk you have.<q>glad to be overpaid to work with you, sir</q>',900000000000000000000000000000000,Game.GetIcon('Kitten',9));Game.last.kitten=1;
		
		order=99999;
		var years=Math.floor((Date.now()-new Date(2013,7,8))/(1000*60*60*24*365));
		//only updates on page load
		//may behave strangely on leap years
		Game.NewUpgradeCookie({name:'Birthday cookie',desc:'-',icon:[22,13],power:years,price:99999999999999999999999999999});Game.last.baseDesc='Cookie production multiplier <b>+1%</b> for every year Cookie Clicker has existed (currently : <b>+'+Beautify(years)+'%</b>).<q>Thank you for playing Cookie Clicker!<br>-Orteil</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		
		
		order=150;new Game.Upgrade('Armythril mouse','Clicking gains <b>+1% of your CpS</b>.<q>This one takes about 53 people to push it around and another 48 to jump down on the button and trigger a click. You could say it\'s got some heft to it.</q>',50000000000000000000000,[11,19]);
		
		order=200;new Game.TieredUpgrade('Reverse dementia','Grandmas are <b>twice</b> as efficient.<q>Extremely unsettling, and somehow even worse than the regular kind.</q>','Grandma',9);
		order=300;new Game.TieredUpgrade('Humane pesticides','Farms are <b>twice</b> as efficient.<q>Made by people, for people, from people and ready to unleash some righteous scorching pain on those pesky insects that so deserve it.</q>','Farm',9);
		order=400;new Game.TieredUpgrade('Mole people','Mines are <b>twice</b> as efficient.<q>Engineered from real human beings within your very labs, these sturdy little folks have a knack for finding the tastiest underground minerals in conditions that more expensive machinery probably wouldn\'t survive.</q>','Mine',9);
		order=500;new Game.TieredUpgrade('Machine learning','Factories are <b>twice</b> as efficient.<q>You figured you might get better productivity if you actually told your workers to learn how to work the machines. Sometimes, it\'s the little things...</q>','Factory',9);
		order=525;new Game.TieredUpgrade('Edible money','Banks are <b>twice</b> as efficient.<q>It\'s really quite simple; you make all currency too delicious not to eat, solving world hunger and inflation in one fell swoop!</q>','Bank',9);
		order=550;new Game.TieredUpgrade('Sick rap prayers','Temples are <b>twice</b> as efficient.<q>With their ill beat and radical rhymes, these way-hip religious tunes are sure to get all the youngins who thought they were 2 cool 4 church back on the pews and praying for more! Wicked!</q>','Temple',9);
		order=575;new Game.TieredUpgrade('Deluxe tailored wands','Wizard towers are <b>twice</b> as efficient.<q>In this age of science, most skillful wand-makers are now long gone; but thankfully - not all those wanders are lost.</q>','Wizard tower',9);
		order=600;new Game.TieredUpgrade('Autopilot','Shipments are <b>twice</b> as efficient.<q>Your ships are now fitted with completely robotic crews! It\'s crazy how much money you save when you don\'t have to compensate the families of those lost in space.</q>','Shipment',9);
		order=700;new Game.TieredUpgrade('The advent of chemistry','Alchemy labs are <b>twice</b> as efficient.<q>You know what? That whole alchemy nonsense was a load of baseless rubbish. Dear god, what were you thinking?</q>','Alchemy lab',9);
		order=800;new Game.TieredUpgrade('The real world','Portals are <b>twice</b> as efficient.<q>It turns out that our universe is actually the twisted dimension of another, saner plane of reality. Time to hop on over there and loot the place!</q>','Portal',9);
		order=900;new Game.TieredUpgrade('Second seconds','Time machines are <b>twice</b> as efficient.<q>That\'s twice as many seconds in the same amount of time! What a deal! Also, what in god\'s name!</q>','Time machine',9);
		order=1000;new Game.TieredUpgrade('Quantum comb','Antimatter condensers are <b>twice</b> as efficient.<q>Quantum entanglement is one of those things that are so annoying to explain that we might honestly be better off without it. This is finally possible thanks to the quantum comb!</q>','Antimatter condenser',9);
		order=1100;new Game.TieredUpgrade('Crystal mirrors','Prisms are <b>twice</b> as efficient.<q>Designed to filter more light back into your prisms, reaching levels of brightness that reality itself had never planned for.</q>','Prism',9);
		order=1200;new Game.TieredUpgrade('Bunnypedes','Chancemakers are <b>twice</b> as efficient.<q>You\'ve taken to breeding rabbits with hundreds of paws, which makes them intrinsically very lucky and thus a very handy (if very disturbing) pet.</q>','Chancemaker',9);
		
		order=20000;
		new Game.Upgrade('Kitten assistants to the regional manager','You gain <b>more CpS</b> the more milk you have.<q>nothing stresses meowt... except having to seek the approval of my inferiors, sir</q>',900000000000000000000000000000000000,Game.GetIcon('Kitten',10));Game.last.kitten=1;
		
		order=5000;
		new Game.SynergyUpgrade('Charm quarks','<q>They\'re after your lucky quarks!</q>','Chancemaker','Antimatter condenser','synergy2');
		
		//end of upgrades
		
		Game.seasons={
			'christmas':{name:'Christmas',start:'Christmas season has started!',over:'Christmas season is over.',trigger:'Festive biscuit'},
			'valentines':{name:'Valentine\'s day',start:'Valentine\'s day has started!',over:'Valentine\'s day is over.',trigger:'Lovesick biscuit'},
			'fools':{name:'Business day',start:'Business day has started!',over:'Business day is over.',trigger:'Fool\'s biscuit'},
			'easter':{name:'Easter',start:'Easter season has started!',over:'Easter season is over.',trigger:'Bunny biscuit'},
			'halloween':{name:'Halloween',start:'Halloween has started!',over:'Halloween is over.',trigger:'Ghostly biscuit'}
		};
		
		Game.computeSeasonPrices=function()
		{
			for (var i in Game.seasons)
			{
				Game.seasons[i].triggerUpgrade.priceFunc=function(){
					var m=1;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('seasons');
						if (godLvl==1) m*=2;
						else if (godLvl==2) m*=1.50;
						else if (godLvl==3) m*=1.25;
					}
					return Game.seasonTriggerBasePrice*Math.pow(2,Game.seasonUses)*m;
				}
			}
		}
		Game.computeSeasons=function()
		{
			for (var i in Game.seasons)
			{
				var me=Game.Upgrades[Game.seasons[i].trigger];
				Game.seasons[i].triggerUpgrade=me;
				me.pool='toggle';
				me.buyFunction=function()
				{
					Game.seasonUses+=1;
					Game.computeSeasonPrices();
					//Game.Lock(this.name);
					for (var i in Game.seasons)
					{
						var me=Game.Upgrades[Game.seasons[i].trigger];
						if (me.name!=this.name) {Game.Lock(me.name);Game.Unlock(me.name);}
					}
					if (Game.season!='' && Game.season!=this.season)
					{
						var str=Game.seasons[Game.season].over+'<div class="line"></div>';
						if (Game.prefs.popups) Game.Popup(str);
						else Game.Notify(str,'',Game.seasons[Game.season].triggerUpgrade.icon,4);
					}
					Game.season=this.season;
					Game.seasonT=Game.getSeasonDuration();
					Game.storeToRefresh=1;
					Game.upgradesToRebuild=1;
					Game.Objects['Grandma'].redraw();
					var str=Game.seasons[this.season].start+'<div class="line"></div>';
					if (Game.prefs.popups) Game.Popup(str);
					else Game.Notify(str,'',this.icon,4);
				}
				
				me.displayFuncWhenOwned=function(){return '<div style="text-align:center;">Time remaining :<br><b>'+(Game.Has('Eternal seasons')?'forever':Game.sayTime(Game.seasonT,-1))+'</b></div>';}
				me.timerDisplay=function(upgrade){return function(){if (!Game.Upgrades[upgrade.name].bought || Game.Has('Eternal seasons')) return -1; else return 1-Game.seasonT/Game.getSeasonDuration();}}(me);
				
			}
		}
		Game.getSeasonDuration=function(){return Game.fps*60*60*24;}
		Game.computeSeasons();
		
		//alert untiered building upgrades
		for (var i in Game.Upgrades)
		{
			var me=Game.Upgrades[i];
			if (me.order>=200 && me.order<2000 && !me.tier && me.name.indexOf('grandma')==-1 && me.pool!='prestige') console.log(me.name+' has no tier.');
		}
		
		Game.UpgradesByPool=[];
		for (var i in Game.Upgrades)
		{
			if (!Game.UpgradesByPool[Game.Upgrades[i].pool]) Game.UpgradesByPool[Game.Upgrades[i].pool]=[];
			Game.UpgradesByPool[Game.Upgrades[i].pool].push(Game.Upgrades[i]);
		}
		
		Game.PrestigeUpgrades=[];
		for (var i in Game.Upgrades)
		{
			if (Game.Upgrades[i].pool=='prestige' || Game.Upgrades[i].pool=='prestigeDecor')
			{
				Game.PrestigeUpgrades.push(Game.Upgrades[i]);
				Game.Upgrades[i].posX=0;
				Game.Upgrades[i].posY=0;
				if (Game.Upgrades[i].parents.length==0 && Game.Upgrades[i].name!='Legacy') Game.Upgrades[i].parents=['Legacy'];
				Game.Upgrades[i].parents=Game.Upgrades[i].parents||[-1];
				for (var ii in Game.Upgrades[i].parents) {if (Game.Upgrades[i].parents[ii]!=-1) Game.Upgrades[i].parents[ii]=Game.Upgrades[Game.Upgrades[i].parents[ii]];}
			}
		}
		
		Game.cookieUpgrades=[];
		for (var i in Game.Upgrades)
		{
			var me=Game.Upgrades[i];
			if ((me.pool=='cookie' || me.pseudoCookie)) Game.cookieUpgrades.push(me);
		}
		
		Game.UpgradePositions={141:[194,-30],181:[-555,-93],253:[-272,-231],254:[-99,-294],255:[-193,-279],264:[48,123],265:[133,154],266:[223,166],267:[305,137],268:[382,85],269:[-640,42],270:[-607,-246],271:[-728,-120],272:[-688,-201],273:[-711,-33],274:[270,-328],275:[317,-439],276:[333,-556],277:[334,-676],278:[333,-796],279:[328,-922],280:[303,-1040],281:[194,-230],282:[-265,212],283:[-321,297],284:[-322,406],285:[-243,501],286:[-403,501],287:[-314,606],288:[-312,-374],289:[-375,-502],290:[-206,-476],291:[453,-745],292:[-375,-651],293:[-399,-794],323:[-237,41],325:[192,-1127],326:[-328,-158],327:[-192,290],328:[-3,237],329:[92,376],353:[121,-326],354:[77,-436],355:[64,-548],356:[57,-673],357:[52,-793],358:[58,-924],359:[82,-1043],360:[-188,408],362:[158,289],363:[-30,-30],364:[-232,-730],365:[-77,349],368:[-82,-532],393:[196,-714],394:[197,-964],395:[-124,-139],396:[-264,-889],397:[-69,563],408:[-204,-1036],409:[-72,-1152],410:[-70,-1328],411:[-388,137],412:[-470,253],413:[-482,389],};
		
		for (var i in Game.UpgradePositions) {Game.UpgradesById[i].posX=Game.UpgradePositions[i][0];Game.UpgradesById[i].posY=Game.UpgradePositions[i][1];}
		
		
		/*=====================================================================================
		ACHIEVEMENTS
		=======================================================================================*/		
		Game.Achievements=[];
		Game.AchievementsById=[];
		Game.AchievementsN=0;
		Game.AchievementsOwned=0;
		Game.Achievement=function(name,desc,icon)
		{
			this.id=Game.AchievementsN;
			this.name=name;
			this.desc=desc;
			this.baseDesc=this.desc;
			this.desc=BeautifyInText(this.baseDesc);
			this.icon=icon;
			this.won=0;
			this.disabled=0;
			this.order=this.id;
			if (order) this.order=order+this.id*0.001;
			this.pool='normal';
			this.vanilla=Game.vanilla;
			this.type='achievement';
			
			this.click=function()
			{
				if (this.clickFunction) this.clickFunction();
			}
			Game.last=this;
			Game.Achievements[this.name]=this;
			Game.AchievementsById[this.id]=this;
			Game.AchievementsN++;
			return this;
		}
		
		Game.Win=function(what)
		{
			if (typeof what==='string')
			{
				if (Game.Achievements[what])
				{
					if (Game.Achievements[what].won==0)
					{
						var name=Game.Achievements[what].shortName?Game.Achievements[what].shortName:Game.Achievements[what].name;
						Game.Achievements[what].won=1;
						if (Game.prefs.popups) Game.Popup('Achievement unlocked :<br>'+name);
						else Game.Notify('Achievement unlocked','<div class="title" style="font-size:18px;margin-top:-2px;">'+name+'</div>',Game.Achievements[what].icon);
						if (Game.Achievements[what].pool!='shadow') Game.AchievementsOwned++;
						Game.recalculateGains=1;
					}
				}
			}
			else {for (var i in what) {Game.Win(what[i]);}}
		}
		Game.RemoveAchiev=function(what)
		{
			if (Game.Achievements[what])
			{
				if (Game.Achievements[what].won==1)
				{
					Game.Achievements[what].won=0;
					if (Game.Achievements[what].pool!='shadow') Game.AchievementsOwned--;
					Game.recalculateGains=1;
				}
			}
		}
		
		Game.HasAchiev=function(what)
		{
			return (Game.Achievements[what]?Game.Achievements[what].won:0);
		}
		
		Game.TieredAchievement=function(name,desc,building,tier)
		{
			var achiev=new Game.Achievement(name,desc,Game.GetIcon(building,tier));
			Game.SetTier(building,tier);
			return achiev;
		}
		
		Game.thresholdIcons=[0,1,2,3,4,5,6,7,8,9,10,11,18,19,20,21,22,23,24,25,26,27,28,29,21,22,23,24,25,26,27,28,29];
		Game.BankAchievements=[];
		Game.BankAchievement=function(name)
		{
			var threshold=Math.pow(10,Math.floor(Game.BankAchievements.length*1.5+2));
			if (Game.BankAchievements.length==0) threshold=1;
			var achiev=new Game.Achievement(name,'Bake <b>'+Beautify(threshold)+'</b> cookie'+(threshold==1?'':'s')+' in one ascension.',[Game.thresholdIcons[Game.BankAchievements.length],(Game.BankAchievements.length>23?2:5)]);
			achiev.threshold=threshold;
			achiev.order=100+Game.BankAchievements.length*0.01;
			Game.BankAchievements.push(achiev);
			return achiev;
		}
		Game.CpsAchievements=[];
		Game.CpsAchievement=function(name)
		{
			var threshold=Math.pow(10,Game.CpsAchievements.length);
			//if (Game.CpsAchievements.length==0) threshold=1;
			var achiev=new Game.Achievement(name,'Bake <b>'+Beautify(threshold)+'</b> cookie'+(threshold==1?'':'s')+' per second.',[Game.thresholdIcons[Game.CpsAchievements.length],(Game.CpsAchievements.length>23?2:5)]);
			achiev.threshold=threshold;
			achiev.order=200+Game.CpsAchievements.length*0.01;
			Game.CpsAchievements.push(achiev);
			return achiev;
		}
		
		//define achievements
		//WARNING : do NOT add new achievements in between, this breaks the saves. Add them at the end !
		
		var order=0;//this is used to set the order in which the items are listed
		
		Game.BankAchievement('Wake and bake');
		Game.BankAchievement('Making some dough');
		Game.BankAchievement('So baked right now');
		Game.BankAchievement('Fledgling bakery');
		Game.BankAchievement('Affluent bakery');
		Game.BankAchievement('World-famous bakery');
		Game.BankAchievement('Cosmic bakery');
		Game.BankAchievement('Galactic bakery');
		Game.BankAchievement('Universal bakery');
		Game.BankAchievement('Timeless bakery');
		Game.BankAchievement('Infinite bakery');
		Game.BankAchievement('Immortal bakery');
		Game.BankAchievement('Don\'t stop me now');
		Game.BankAchievement('You can stop now');
		Game.BankAchievement('Cookies all the way down');
		Game.BankAchievement('Overdose');
		
		Game.CpsAchievement('Casual baking');
		Game.CpsAchievement('Hardcore baking');
		Game.CpsAchievement('Steady tasty stream');
		Game.CpsAchievement('Cookie monster');
		Game.CpsAchievement('Mass producer');
		Game.CpsAchievement('Cookie vortex');
		Game.CpsAchievement('Cookie pulsar');
		Game.CpsAchievement('Cookie quasar');
		Game.CpsAchievement('Oh hey, you\'re still here');
		Game.CpsAchievement('Let\'s never bake again');
		
		order=30010;
		new Game.Achievement('Sacrifice','Ascend with <b>1 million</b> cookies baked.<q>Easy come, easy go.</q>',[11,6]);
		new Game.Achievement('Oblivion','Ascend with <b>1 billion</b> cookies baked.<q>Back to square one.</q>',[11,6]);
		new Game.Achievement('From scratch','Ascend with <b>1 trillion</b> cookies baked.<q>It\'s been fun.</q>',[11,6]);
		
		order=11010;
		new Game.Achievement('Neverclick','Make <b>1 million</b> cookies by only having clicked <b>15 times</b>.',[12,0]);//Game.last.pool='shadow';
		order=1000;
		new Game.Achievement('Clicktastic','Make <b>1,000</b> cookies from clicking.',[11,0]);
		new Game.Achievement('Clickathlon','Make <b>100,000</b> cookies from clicking.',[11,1]);
		new Game.Achievement('Clickolympics','Make <b>10,000,000</b> cookies from clicking.',[11,2]);
		new Game.Achievement('Clickorama','Make <b>1,000,000,000</b> cookies from clicking.',[11,13]);
		
		order=1050;
		new Game.Achievement('Click','Have <b>1</b> cursor.',[0,0]);
		new Game.Achievement('Double-click','Have <b>2</b> cursors.',[0,6]);
		new Game.Achievement('Mouse wheel','Have <b>50</b> cursors.',[1,6]);
		new Game.Achievement('Of Mice and Men','Have <b>100</b> cursors.',[0,1]);
		new Game.Achievement('The Digital','Have <b>200</b> cursors.',[0,2]);
		
		order=1100;
		new Game.Achievement('Just wrong','Sell a grandma.<q>I thought you loved me.</q>',[10,9]);
		new Game.TieredAchievement('Grandma\'s cookies','Have <b>1</b> grandma.','Grandma',1);
		new Game.TieredAchievement('Sloppy kisses','Have <b>50</b> grandmas.','Grandma',2);
		new Game.TieredAchievement('Retirement home','Have <b>100</b> grandmas.','Grandma',3);
		
		order=1200;
		new Game.TieredAchievement('My first farm','Have <b>1</b> farm.','Farm',1);
		new Game.TieredAchievement('Reap what you sow','Have <b>50</b> farms.','Farm',2);
		new Game.TieredAchievement('Farm ill','Have <b>100</b> farms.','Farm',3);
		
		order=1400;
		new Game.TieredAchievement('Production chain','Have <b>1</b> factory.','Factory',1);
		new Game.TieredAchievement('Industrial revolution','Have <b>50</b> factories.','Factory',2);
		new Game.TieredAchievement('Global warming','Have <b>100</b> factories.','Factory',3);
		
		order=1300;
		new Game.TieredAchievement('You know the drill','Have <b>1</b> mine.','Mine',1);
		new Game.TieredAchievement('Excavation site','Have <b>50</b> mines.','Mine',2);
		new Game.TieredAchievement('Hollow the planet','Have <b>100</b> mines.','Mine',3);
		
		order=1500;
		new Game.TieredAchievement('Expedition','Have <b>1</b> shipment.','Shipment',1);
		new Game.TieredAchievement('Galactic highway','Have <b>50</b> shipments.','Shipment',2);
		new Game.TieredAchievement('Far far away','Have <b>100</b> shipments.','Shipment',3);
		
		order=1600;
		new Game.TieredAchievement('Transmutation','Have <b>1</b> alchemy lab.','Alchemy lab',1);
		new Game.TieredAchievement('Transmogrification','Have <b>50</b> alchemy labs.','Alchemy lab',2);
		new Game.TieredAchievement('Gold member','Have <b>100</b> alchemy labs.','Alchemy lab',3);
		
		order=1700;
		new Game.TieredAchievement('A whole new world','Have <b>1</b> portal.','Portal',1);
		new Game.TieredAchievement('Now you\'re thinking','Have <b>50</b> portals.','Portal',2);
		new Game.TieredAchievement('Dimensional shift','Have <b>100</b> portals.','Portal',3);
		
		order=1800;
		new Game.TieredAchievement('Time warp','Have <b>1</b> time machine.','Time machine',1);
		new Game.TieredAchievement('Alternate timeline','Have <b>50</b> time machines.','Time machine',2);
		new Game.TieredAchievement('Rewriting history','Have <b>100</b> time machines.','Time machine',3);
		
		
		order=7000;
		new Game.Achievement('One with everything','Have <b>at least 1</b> of every building.',[2,7]);
		new Game.Achievement('Mathematician','Have at least <b>1 of the most expensive object, 2 of the second-most expensive, 4 of the next</b> and so on (capped at 128).',[23,12]);
		new Game.Achievement('Base 10','Have at least <b>10 of the most expensive object, 20 of the second-most expensive, 30 of the next</b> and so on.',[23,12]);
		
		order=10000;
		new Game.Achievement('Golden cookie','Click a <b>golden cookie</b>.',[10,14]);
		new Game.Achievement('Lucky cookie','Click <b>7 golden cookies</b>.',[22,6]);
		new Game.Achievement('A stroke of luck','Click <b>27 golden cookies</b>.',[23,6]);
		
		order=30200;
		new Game.Achievement('Cheated cookies taste awful','Hack in some cookies.',[10,6]);Game.last.pool='shadow';
		order=11010;
		new Game.Achievement('Uncanny clicker','Click really, really fast.<q>Well I\'ll be!</q>',[12,0]);
		
		order=5000;
		new Game.Achievement('Builder','Own <b>100</b> buildings.',[2,6]);
		new Game.Achievement('Architect','Own <b>500</b> buildings.',[3,6]);
		order=6000;
		new Game.Achievement('Enhancer','Purchase <b>20</b> upgrades.',[9,0]);
		new Game.Achievement('Augmenter','Purchase <b>50</b> upgrades.',[9,1]);
		
		order=11000;
		new Game.Achievement('Cookie-dunker','Dunk the cookie.<q>You did it!</q>',[1,8]);
		
		order=10000;
		new Game.Achievement('Fortune','Click <b>77 golden cookies</b>.<q>You should really go to bed.</q>',[24,6]);
		order=31000;
		new Game.Achievement('True Neverclick','Make <b>1 million</b> cookies with <b>no</b> cookie clicks.<q>This kinda defeats the whole purpose, doesn\'t it?</q>',[12,0]);Game.last.pool='shadow';
		
		order=20000;
		new Game.Achievement('Elder nap','Appease the grandmatriarchs at least <b>once</b>.<q>we<br>are<br>eternal</q>',[8,9]);
		new Game.Achievement('Elder slumber','Appease the grandmatriarchs at least <b>5 times</b>.<q>our mind<br>outlives<br>the universe</q>',[8,9]);
		
		order=1150;
		new Game.Achievement('Elder','Own at least <b>7</b> grandma types.',[10,9]);
		
		order=20000;
		new Game.Achievement('Elder calm','Declare a covenant with the grandmatriarchs.<q>we<br>have<br>fed</q>',[8,9]);
		
		order=5000;
		new Game.Achievement('Engineer','Own <b>1000</b> buildings.',[4,6]);
		
		order=10000;
		new Game.Achievement('Leprechaun','Click <b>777 golden cookies</b>.',[25,6]);
		new Game.Achievement('Black cat\'s paw','Click <b>7777 golden cookies</b>.',[26,6]);
		
		order=30050;
		new Game.Achievement('Nihilism','Ascend with <b>1 quadrillion</b> cookies baked.<q>There are many things<br>that need to be erased</q>',[11,7]);
		
		order=1900;
		new Game.TieredAchievement('Antibatter','Have <b>1</b> antimatter condenser.','Antimatter condenser',1);
		new Game.TieredAchievement('Quirky quarks','Have <b>50</b> antimatter condensers.','Antimatter condenser',2);
		new Game.TieredAchievement('It does matter!','Have <b>100</b> antimatter condensers.','Antimatter condenser',3);
		
		order=6000;
		new Game.Achievement('Upgrader','Purchase <b>100</b> upgrades.',[9,2]);
		
		order=7000;
		new Game.Achievement('Centennial','Have at least <b>100 of everything</b>.',[6,6]);
		
		order=30500;
		new Game.Achievement('Hardcore','Get to <b>1 billion</b> cookies baked with <b>no upgrades purchased</b>.',[12,6]);//Game.last.pool='shadow';
		
		order=30600;
		new Game.Achievement('Speed baking I','Get to <b>1 million</b> cookies baked in <b>35 minutes</b>.',[12,5]);Game.last.pool='shadow';
		new Game.Achievement('Speed baking II','Get to <b>1 million</b> cookies baked in <b>25 minutes</b>.',[13,5]);Game.last.pool='shadow';
		new Game.Achievement('Speed baking III','Get to <b>1 million</b> cookies baked in <b>15 minutes</b>.',[14,5]);Game.last.pool='shadow';
		
		
		order=61000;
		var achiev=new Game.Achievement('Getting even with the oven','Defeat the <b>Sentient Furnace</b> in the factory dungeons.',[12,7]);Game.last.pool='dungeon';
		var achiev=new Game.Achievement('Now this is pod-smashing','Defeat the <b>Ascended Baking Pod</b> in the factory dungeons.',[12,7]);Game.last.pool='dungeon';
		var achiev=new Game.Achievement('Chirped out','Find and defeat <b>Chirpy</b>, the dysfunctionning alarm bot.',[13,7]);Game.last.pool='dungeon';
		var achiev=new Game.Achievement('Follow the white rabbit','Find and defeat the elusive <b>sugar bunny</b>.',[14,7]);Game.last.pool='dungeon';
		
		order=1000;
		new Game.Achievement('Clickasmic','Make <b>100,000,000,000</b> cookies from clicking.',[11,14]);
		
		order=1100;
		new Game.TieredAchievement('Friend of the ancients','Have <b>150</b> grandmas.','Grandma',4);
		new Game.TieredAchievement('Ruler of the ancients','Have <b>200</b> grandmas.','Grandma',5);
		
		order=32000;
		new Game.Achievement('Wholesome','Unlock <b>100%</b> of your heavenly chips power.',[15,7]);
		
		order=33000;
		new Game.Achievement('Just plain lucky','You have <b>1 chance in 500,000</b> every second of earning this achievement.',[15,6]);Game.last.pool='shadow';
		
		order=21000;
		new Game.Achievement('Itchscratcher','Burst <b>1 wrinkler</b>.',[19,8]);
		new Game.Achievement('Wrinklesquisher','Burst <b>50 wrinklers</b>.',[19,8]);
		new Game.Achievement('Moistburster','Burst <b>200 wrinklers</b>.',[19,8]);
		
		order=22000;
		new Game.Achievement('Spooky cookies','Unlock <b>every Halloween-themed cookie</b>.<br>Owning this achievement makes Halloween-themed cookies drop more frequently in future playthroughs.',[12,8]);
		
		order=22100;
		new Game.Achievement('Coming to town','Reach <b>Santa\'s 7th form</b>.',[18,9]);
		new Game.Achievement('All hail Santa','Reach <b>Santa\'s final form</b>.',[19,10]);
		new Game.Achievement('Let it snow','Unlock <b>every Christmas-themed cookie</b>.<br>Owning this achievement makes Christmas-themed cookies drop more frequently in future playthroughs.',[19,9]);
		new Game.Achievement('Oh deer','Pop <b>1 reindeer</b>.',[12,9]);
		new Game.Achievement('Sleigh of hand','Pop <b>50 reindeer</b>.',[12,9]);
		new Game.Achievement('Reindeer sleigher','Pop <b>200 reindeer</b>.',[12,9]);

		order=1200;
		new Game.TieredAchievement('Perfected agriculture','Have <b>150</b> farms.','Farm',4);
		order=1400;
		new Game.TieredAchievement('Ultimate automation','Have <b>150</b> factories.','Factory',4);
		order=1300;
		new Game.TieredAchievement('Can you dig it','Have <b>150</b> mines.','Mine',4);
		order=1500;
		new Game.TieredAchievement('Type II civilization','Have <b>150</b> shipments.','Shipment',4);
		order=1600;
		new Game.TieredAchievement('Gild wars','Have <b>150</b> alchemy labs.','Alchemy lab',4);
		order=1700;
		new Game.TieredAchievement('Brain-split','Have <b>150</b> portals.','Portal',4);
		order=1800;
		new Game.TieredAchievement('Time duke','Have <b>150</b> time machines.','Time machine',4);
		order=1900;
		new Game.TieredAchievement('Molecular maestro','Have <b>150</b> antimatter condensers.','Antimatter condenser',4);
		
		order=2000;
		new Game.TieredAchievement('Lone photon','Have <b>1</b> prism.','Prism',1);
		new Game.TieredAchievement('Dazzling glimmer','Have <b>50</b> prisms.','Prism',2);
		new Game.TieredAchievement('Blinding flash','Have <b>100</b> prisms.','Prism',3);
		new Game.TieredAchievement('Unending glow','Have <b>150</b> prisms.','Prism',4);
		
		order=5000;
		new Game.Achievement('Lord of Constructs','Own <b>2000</b> buildings.<q>He saw the vast plains stretching ahead of him, and he said : let there be civilization.</q>',[5,6]);
		order=6000;
		new Game.Achievement('Lord of Progress','Purchase <b>200</b> upgrades.<q>One can always do better. But should you?</q>',[9,14]);
		order=7002;
		new Game.Achievement('Bicentennial','Have at least <b>200 of everything</b>.<q>You crazy person.</q>',[8,6]);
		
		order=22300;
		new Game.Achievement('Lovely cookies','Unlock <b>every Valentine-themed cookie</b>.',[20,3]);
		
		order=7001;
		new Game.Achievement('Centennial and a half','Have at least <b>150 of everything</b>.',[7,6]);
		
		order=11000;
		new Game.Achievement('Tiny cookie','Click the tiny cookie.<q>These aren\'t the cookies<br>you\'re clicking for.</q>',[0,5]);
		
		order=400000;
		new Game.Achievement('You win a cookie','This is for baking 10 trillion cookies and making it on the local news.<q>We\'re all so proud of you.</q>',[10,0]);
		
		order=1070;
		new Game.Achievement('Click delegator','Make <b>10,000,000,000,000,000,000</b> cookies just from cursors.',[0,22]);
		order=1120;
		new Game.Achievement('Gushing grannies','Make <b>10,000,000,000,000,000,000</b> cookies just from grandmas.',[1,22]);
		order=1220;
		new Game.Achievement('I hate manure','Make <b>10,000,000,000,000</b> cookies just from farms.',[2,22]);
		order=1320;
		new Game.Achievement('Never dig down','Make <b>100,000,000,000,000</b> cookies just from mines.',[3,22]);
		order=1420;
		new Game.Achievement('The incredible machine','Make <b>1,000,000,000,000,000</b> cookies just from factories.',[4,22]);
		order=1520;
		new Game.Achievement('And beyond','Make <b>10,000,000,000,000,000,000</b> cookies just from shipments.',[5,22]);
		order=1620;
		new Game.Achievement('Magnum Opus','Make <b>100,000,000,000,000,000,000</b> cookies just from alchemy labs.',[6,22]);
		order=1720;
		new Game.Achievement('With strange eons','Make <b>1,000,000,000,000,000,000,000</b> cookies just from portals.',[7,22]);
		order=1820;
		new Game.Achievement('Spacetime jigamaroo','Make <b>10,000,000,000,000,000,000,000</b> cookies just from time machines.',[8,22]);
		order=1920;
		new Game.Achievement('Supermassive','Make <b>100,000,000,000,000,000,000,000</b> cookies just from antimatter condensers.',[13,22]);
		order=2020;
		new Game.Achievement('Praise the sun','Make <b>1,000,000,000,000,000,000,000,000</b> cookies just from prisms.',[14,22]);
		
		
		order=1000;
		new Game.Achievement('Clickageddon','Make <b>10,000,000,000,000</b> cookies from clicking.',[11,15]);
		new Game.Achievement('Clicknarok','Make <b>1,000,000,000,000,000</b> cookies from clicking.',[11,16]);
		
		order=1050;
		new Game.Achievement('Extreme polydactyly','Have <b>300</b> cursors.',[0,13]);
		new Game.Achievement('Dr. T','Have <b>400</b> cursors.',[0,14]);
		
		order=1100;new Game.TieredAchievement('The old never bothered me anyway','Have <b>250</b> grandmas.','Grandma',6);
		order=1200;new Game.TieredAchievement('Homegrown','Have <b>200</b> farms.','Farm',5);
		order=1400;new Game.TieredAchievement('Technocracy','Have <b>200</b> factories.','Factory',5);
		order=1300;new Game.TieredAchievement('The center of the Earth','Have <b>200</b> mines.','Mine',5);
		order=1500;new Game.TieredAchievement('We come in peace','Have <b>200</b> shipments.','Shipment',5);
		order=1600;new Game.TieredAchievement('The secrets of the universe','Have <b>200</b> alchemy labs.','Alchemy lab',5);
		order=1700;new Game.TieredAchievement('Realm of the Mad God','Have <b>200</b> portals.','Portal',5);
		order=1800;new Game.TieredAchievement('Forever and ever','Have <b>200</b> time machines.','Time machine',5);
		order=1900;new Game.TieredAchievement('Walk the planck','Have <b>200</b> antimatter condensers.','Antimatter condenser',5);
		order=2000;new Game.TieredAchievement('Rise and shine','Have <b>200</b> prisms.','Prism',5);
		
		order=30200;
		new Game.Achievement('God complex','Name yourself <b>Orteil</b>.<div class="warning">Note : usurpers incur a -1% CpS penalty until they rename themselves something else.</div><q>But that\'s not you, is it?</q>',[17,5]);Game.last.pool='shadow';
		new Game.Achievement('Third-party','Use an <b>add-on</b>.<q>Some find vanilla to be the most boring flavor.</q>',[16,5]);Game.last.pool='shadow';//if you're making a mod, add a Game.Win('Third-party') somewhere in there!
		
		order=30050;
		new Game.Achievement('Dematerialize','Ascend with <b>1 quintillion</b> cookies baked.<q>Presto!<br>...where\'d the cookies go?</q>',[11,7]);
		new Game.Achievement('Nil zero zilch','Ascend with <b>1 sextillion</b> cookies baked.<q>To summarize : really not very much at all.</q>',[11,7]);
		new Game.Achievement('Transcendence','Ascend with <b>1 septillion</b> cookies baked.<q>Your cookies are now on a higher plane of being.</q>',[11,8]);
		new Game.Achievement('Obliterate','Ascend with <b>1 octillion</b> cookies baked.<q>Resistance is futile, albeit entertaining.</q>',[11,8]);
		new Game.Achievement('Negative void','Ascend with <b>1 nonillion</b> cookies baked.<q>You now have so few cookies that it\'s almost like you have a negative amount of them.</q>',[11,8]);
		
		order=22400;
		new Game.Achievement('The hunt is on','Unlock <b>1 egg</b>.',[1,12]);
		new Game.Achievement('Egging on','Unlock <b>7 eggs</b>.',[4,12]);
		new Game.Achievement('Mass Easteria','Unlock <b>14 eggs</b>.',[7,12]);
		new Game.Achievement('Hide & seek champion','Unlock <b>all the eggs</b>.<br>Owning this achievement makes eggs drop more frequently in future playthroughs.',[13,12]);
	
		order=11000;
		new Game.Achievement('What\'s in a name','Give your bakery a name.',[15,9]);
	
	
		order=1425;
		new Game.TieredAchievement('Pretty penny','Have <b>1</b> bank.','Bank',1);
		new Game.TieredAchievement('Fit the bill','Have <b>50</b> banks.','Bank',2);
		new Game.TieredAchievement('A loan in the dark','Have <b>100</b> banks.','Bank',3);
		new Game.TieredAchievement('Need for greed','Have <b>150</b> banks.','Bank',4);
		new Game.TieredAchievement('It\'s the economy, stupid','Have <b>200</b> banks.','Bank',5);
		order=1450;
		new Game.TieredAchievement('Your time to shrine','Have <b>1</b> temple.','Temple',1);
		new Game.TieredAchievement('Shady sect','Have <b>50</b> temples.','Temple',2);
		new Game.TieredAchievement('New-age cult','Have <b>100</b> temples.','Temple',3);
		new Game.TieredAchievement('Organized religion','Have <b>150</b> temples.','Temple',4);
		new Game.TieredAchievement('Fanaticism','Have <b>200</b> temples.','Temple',5);
		order=1475;
		new Game.TieredAchievement('Bewitched','Have <b>1</b> wizard tower.','Wizard tower',1);
		new Game.TieredAchievement('The sorcerer\'s apprentice','Have <b>50</b> wizard towers.','Wizard tower',2);
		new Game.TieredAchievement('Charms and enchantments','Have <b>100</b> wizard towers.','Wizard tower',3);
		new Game.TieredAchievement('Curses and maledictions','Have <b>150</b> wizard towers.','Wizard tower',4);
		new Game.TieredAchievement('Magic kingdom','Have <b>200</b> wizard towers.','Wizard tower',5);
		
		order=1445;
		new Game.Achievement('Vested interest','Make <b>10,000,000,000,000,000</b> cookies just from banks.',[15,22]);
		order=1470;
		new Game.Achievement('New world order','Make <b>100,000,000,000,000,000</b> cookies just from temples.',[16,22]);
		order=1495;
		new Game.Achievement('Hocus pocus','Make <b>1,000,000,000,000,000,000</b> cookies just from wizard towers.',[17,22]);
		
		
		order=1070;
		new Game.Achievement('Finger clickin\' good','Make <b>10,000,000,000,000,000,000,000</b> cookies just from cursors.',[0,23]);
		order=1120;
		new Game.Achievement('Panic at the bingo','Make <b>10,000,000,000,000,000,000,000</b> cookies just from grandmas.',[1,23]);
		order=1220;
		new Game.Achievement('Rake in the dough','Make <b>10,000,000,000,000,000</b> cookies just from farms.',[2,23]);
		order=1320;
		new Game.Achievement('Quarry on','Make <b>100,000,000,000,000,000</b> cookies just from mines.',[3,23]);
		order=1420;
		new Game.Achievement('Yes I love technology','Make <b>1,000,000,000,000,000,000</b> cookies just from factories.',[4,23]);
		order=1445;
		new Game.Achievement('Paid in full','Make <b>10,000,000,000,000,000,000</b> cookies just from banks.',[15,23]);
		order=1470;
		new Game.Achievement('Church of Cookiology','Make <b>100,000,000,000,000,000,000</b> cookies just from temples.',[16,23]);
		order=1495;
		new Game.Achievement('Too many rabbits, not enough hats','Make <b>1,000,000,000,000,000,000,000</b> cookies just from wizard towers.',[17,23]);
		order=1520;
		new Game.Achievement('The most precious cargo','Make <b>10,000,000,000,000,000,000,000</b> cookies just from shipments.',[5,23]);
		order=1620;
		new Game.Achievement('The Aureate','Make <b>100,000,000,000,000,000,000,000</b> cookies just from alchemy labs.',[6,23]);
		order=1720;
		new Game.Achievement('Ever more hideous','Make <b>1,000,000,000,000,000,000,000,000</b> cookies just from portals.',[7,23]);
		order=1820;
		new Game.Achievement('Be kind, rewind','Make <b>10,000,000,000,000,000,000,000,000</b> cookies just from time machines.',[8,23]);
		order=1920;
		new Game.Achievement('Infinitesimal','Make <b>100,000,000,000,000,000,000,000,000</b> cookies just from antimatter condensers.',[13,23]);
		order=2020;
		new Game.Achievement('A still more glorious dawn','Make <b>1,000,000,000,000,000,000,000,000,000</b> cookies just from prisms.',[14,23]);
		
		order=30000;
		new Game.Achievement('Rebirth','Ascend at least once.',[21,6]);
		
		order=11000;
		new Game.Achievement('Here you go','Click this achievement\'s slot.<q>All you had to do was ask.</q>',[1,7]);Game.last.clickFunction=function(){if (!Game.HasAchiev('Here you go')){PlaySound('snd/tick.mp3');Game.Win('Here you go');}};
		
		order=30000;
		new Game.Achievement('Resurrection','Ascend <b>10 times</b>.',[21,6]);
		new Game.Achievement('Reincarnation','Ascend <b>100 times</b>.',[21,6]);
		new Game.Achievement('Endless cycle','Ascend <b>1000 times</b>.<q>Oh hey, it\'s you again.</q>',[2,7]);Game.last.pool='shadow';
		
		
		
		order=1100;
		new Game.TieredAchievement('The agemaster','Have <b>300</b> grandmas.','Grandma',7);
		new Game.TieredAchievement('To oldly go','Have <b>350</b> grandmas.','Grandma',8);
		
		order=1200;new Game.TieredAchievement('Gardener extraordinaire','Have <b>250</b> farms.','Farm',6);
		order=1300;new Game.TieredAchievement('Tectonic ambassador','Have <b>250</b> mines.','Mine',6);
		order=1400;new Game.TieredAchievement('Rise of the machines','Have <b>250</b> factories.','Factory',6);
		order=1425;new Game.TieredAchievement('Acquire currency','Have <b>250</b> banks.','Bank',6);
		order=1450;new Game.TieredAchievement('Zealotry','Have <b>250</b> temples.','Temple',6);
		order=1475;new Game.TieredAchievement('The wizarding world','Have <b>250</b> wizard towers.','Wizard tower',6);
		order=1500;new Game.TieredAchievement('Parsec-masher','Have <b>250</b> shipments.','Shipment',6);
		order=1600;new Game.TieredAchievement('The work of a lifetime','Have <b>250</b> alchemy labs.','Alchemy lab',6);
		order=1700;new Game.TieredAchievement('A place lost in time','Have <b>250</b> portals.','Portal',6);
		order=1800;new Game.TieredAchievement('Heat death','Have <b>250</b> time machines.','Time machine',6);
		order=1900;new Game.TieredAchievement('Microcosm','Have <b>250</b> antimatter condensers.','Antimatter condenser',6);
		order=2000;new Game.TieredAchievement('Bright future','Have <b>250</b> prisms.','Prism',6);
		
		order=25000;
		new Game.Achievement('Here be dragon','Complete your <b>dragon\'s training</b>.',[21,12]);
		
		Game.BankAchievement('How?');
		Game.BankAchievement('The land of milk and cookies');
		Game.BankAchievement('He who controls the cookies controls the universe');Game.last.baseDesc+='<q>The milk must flow!</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.BankAchievement('Tonight on Hoarders');
		Game.BankAchievement('Are you gonna eat all that?');
		Game.BankAchievement('We\'re gonna need a bigger bakery');
		Game.BankAchievement('In the mouth of madness');Game.last.baseDesc+='<q>A cookie is just what we tell each other it is.</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.BankAchievement('Brought to you by the letter <div style="display:inline-block;background:url(img/money.png);width:16px;height:16px;"></div>');
	
	
		Game.CpsAchievement('A world filled with cookies');
		Game.CpsAchievement('When this baby hits '+Beautify(100000000000*60*60)+' cookies per hour');
		Game.CpsAchievement('Fast and delicious');
		Game.CpsAchievement('Cookiehertz : a really, really tasty hertz');Game.last.baseDesc+='<q>Tastier than a hertz donut, anyway.</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('Woops, you solved world hunger');
		Game.CpsAchievement('Turbopuns');Game.last.baseDesc+='<q>Mother Nature will be like "slowwwww dowwwwwn".</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('Faster menner');
		Game.CpsAchievement('And yet you\'re still hungry');
		Game.CpsAchievement('The Abakening');
		Game.CpsAchievement('There\'s really no hard limit to how long these achievement names can be and to be quite honest I\'m rather curious to see how far we can go.<br>Adolphus W. Green (1844–1917) started as the Principal of the Groton School in 1864. By 1865, he became second assistant librarian at the New York Mercantile Library; from 1867 to 1869, he was promoted to full librarian. From 1869 to 1873, he worked for Evarts, Southmayd & Choate, a law firm co-founded by William M. Evarts, Charles Ferdinand Southmayd and Joseph Hodges Choate. He was admitted to the New York State Bar Association in 1873.<br>Anyway, how\'s your day been?');//Game.last.shortName='There\'s really no hard limit to how long these achievement names can be and to be quite honest I\'m [...]';
		Game.CpsAchievement('Fast');Game.last.baseDesc+='<q>Wow!</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		
		order=7002;
		new Game.Achievement('Bicentennial and a half','Have at least <b>250 of everything</b>.<q>Keep on truckin\'.</q>',[9,6]);
		
		order=11000;
		new Game.Achievement('Tabloid addiction','Click on the news ticker <b>50 times</b>.<q>Page 6 : Mad individual clicks on picture of pastry in a futile attempt to escape boredom!<br>Also page 6 : British parliament ate my baby!</q>',[27,7]);
		
		order=1000;
		new Game.Achievement('Clickastrophe','Make <b>100,000,000,000,000,000</b> cookies from clicking.',[11,17]);
		new Game.Achievement('Clickataclysm','Make <b>10,000,000,000,000,000,000</b> cookies from clicking.',[11,18]);
		
		order=1050;
		new Game.Achievement('Thumbs, phalanges, metacarpals','Have <b>500</b> cursors.<q>& KNUCKLES</q>',[0,15]);
		
		order=6000;
		new Game.Achievement('Polymath','Own <b>300</b> upgrades and <b>3000</b> buildings.<q>Excellence doesn\'t happen overnight - it usually takes a good couple days.</q>',[29,7]);
		
		new Game.Achievement('The elder scrolls','Own a combined <b>777</b> grandmas and cursors.<q>Let me guess. Someone stole your cookie.</q>',[10,9]);
		
		order=30050;
		new Game.Achievement('To crumbs, you say?','Ascend with <b>1 decillion</b> cookies baked.<q>Very well then.</q>',[29,6]);
		
		order=1200;new Game.TieredAchievement('Seedy business','Have <b>300</b> farms.','Farm',7);
		order=1300;new Game.TieredAchievement('Freak fracking','Have <b>300</b> mines.','Mine',7);
		order=1400;new Game.TieredAchievement('Modern times','Have <b>300</b> factories.','Factory',7);
		order=1425;new Game.TieredAchievement('The nerve of war','Have <b>300</b> banks.','Bank',7);
		order=1450;new Game.TieredAchievement('Wololo','Have <b>300</b> temples.','Temple',7);
		order=1475;new Game.TieredAchievement('And now for my next trick, I\'ll need a volunteer from the audience','Have <b>300</b> wizard towers.','Wizard tower',7);
		order=1500;new Game.TieredAchievement('It\'s not delivery','Have <b>300</b> shipments.','Shipment',7);
		order=1600;new Game.TieredAchievement('Gold, Jerry! Gold!','Have <b>300</b> alchemy labs.','Alchemy lab',7);
		order=1700;new Game.TieredAchievement('Forbidden zone','Have <b>300</b> portals.','Portal',7);
		order=1800;new Game.TieredAchievement('cookie clicker forever and forever a hundred years cookie clicker, all day long forever, forever a hundred times, over and over cookie clicker adventures dot com','Have <b>300</b> time machines.','Time machine',7);
		order=1900;new Game.TieredAchievement('Scientists baffled everywhere','Have <b>300</b> antimatter condensers.','Antimatter condenser',7);
		order=2000;new Game.TieredAchievement('Harmony of the spheres','Have <b>300</b> prisms.','Prism',7);
		
		order=35000;
		new Game.Achievement('Last Chance to See','Burst the near-extinct <b>shiny wrinkler</b>.<q>You monster!</q>',[24,12]);Game.last.pool='shadow';
		
		order=10000;
		new Game.Achievement('Early bird','Click a golden cookie <b>less than 1 second after it spawns</b>.',[10,14]);
		new Game.Achievement('Fading luck','Click a golden cookie <b>less than 1 second before it dies</b>.',[10,14]);
		
		order=22100;
		new Game.Achievement('Eldeer','Pop a reindeer <b>during an elder frenzy</b>.',[12,9]);
		
		order=21100;
		new Game.Achievement('Dude, sweet','Harvest <b>7 coalescing sugar lumps</b>.',[24,14]);
		new Game.Achievement('Sugar rush','Harvest <b>30 coalescing sugar lumps</b>.',[26,14]);
		new Game.Achievement('Year\'s worth of cavities','Harvest <b>365 coalescing sugar lumps</b>.<q>My lumps my lumps my lumps.</q>',[29,14]);
		new Game.Achievement('Hand-picked','Successfully harvest a coalescing sugar lump before it\'s ripe.',[28,14]);
		new Game.Achievement('Sugar sugar','Harvest a <b>bifurcated sugar lump</b>.',[29,15]);
		new Game.Achievement('All-natural cane sugar','Harvest a <b>golden sugar lump</b>.',[29,16]);Game.last.pool='shadow';
		new Game.Achievement('Sweetmeats','Harvest a <b>meaty sugar lump</b>.',[29,17]);
		
		order=7002;
		new Game.Achievement('Tricentennial','Have at least <b>300 of everything</b>.<q>Can\'t stop, won\'t stop. Probably should stop, though.</q>',[29,12]);
		
		Game.CpsAchievement('Knead for speed');Game.last.baseDesc+='<q>How did we not make that one yet?</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('Well the cookies start coming and they don\'t stop coming');Game.last.baseDesc+='<q>Didn\'t make sense not to click for fun.</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('I don\'t know if you\'ve noticed but all these icons are very slightly off-center');
		Game.CpsAchievement('The proof of the cookie is in the baking');Game.last.baseDesc+='<q>How can you have any cookies if you don\'t bake your dough?</q>';Game.last.desc=BeautifyInText(Game.last.baseDesc);
		Game.CpsAchievement('If it\'s worth doing, it\'s worth overdoing');
		
		Game.BankAchievement('The dreams in which I\'m baking are the best I\'ve ever had');
		Game.BankAchievement('Set for life');
		
		order=1200;new Game.TieredAchievement('You and the beanstalk','Have <b>350</b> farms.','Farm',8);
		order=1300;new Game.TieredAchievement('Romancing the stone','Have <b>350</b> mines.','Mine',8);
		order=1400;new Game.TieredAchievement('Ex machina','Have <b>350</b> factories.','Factory',8);
		order=1425;new Game.TieredAchievement('And I need it now','Have <b>350</b> banks.','Bank',8);
		order=1450;new Game.TieredAchievement('Pray on the weak','Have <b>350</b> temples.','Temple',8);
		order=1475;new Game.TieredAchievement('It\'s a kind of magic','Have <b>350</b> wizard towers.','Wizard tower',8);
		order=1500;new Game.TieredAchievement('Make it so','Have <b>350</b> shipments.','Shipment',8);
		order=1600;new Game.TieredAchievement('All that glitters is gold','Have <b>350</b> alchemy labs.','Alchemy lab',8);
		order=1700;new Game.TieredAchievement('H̸̷͓̳̳̯̟͕̟͍͍̣͡ḛ̢̦̰̺̮̝͖͖̘̪͉͘͡ ̠̦͕̤̪̝̥̰̠̫̖̣͙̬͘ͅC̨̦̺̩̲̥͉̭͚̜̻̝̣̼͙̮̯̪o̴̡͇̘͎̞̲͇̦̲͞͡m̸̩̺̝̣̹̱͚̬̥̫̳̼̞̘̯͘ͅẹ͇̺̜́̕͢s̶̙̟̱̥̮̯̰̦͓͇͖͖̝͘͘͞','Have <b>350</b> portals.','Portal',8);
		order=1800;new Game.TieredAchievement('Way back then','Have <b>350</b> time machines.','Time machine',8);
		order=1900;new Game.TieredAchievement('Exotic matter','Have <b>350</b> antimatter condensers.','Antimatter condenser',8);
		order=2000;new Game.TieredAchievement('At the end of the tunnel','Have <b>350</b> prisms.','Prism',8);
		
		order=1070;
		new Game.Achievement('Click (starring Adam Sandler)','Make <b>10,000,000,000,000,000,000,000,000</b> cookies just from cursors.',[0,24]);
		order=1120;
		new Game.Achievement('Frantiquities','Make <b>10,000,000,000,000,000,000,000,000</b> cookies just from grandmas.',[1,24]);
		order=1220;
		new Game.Achievement('Overgrowth','Make <b>10,000,000,000,000,000,000</b> cookies just from farms.',[2,24]);
		order=1320;
		new Game.Achievement('Sedimentalism','Make <b>100,000,000,000,000,000,000</b> cookies just from mines.',[3,24]);
		order=1420;
		new Game.Achievement('Labor of love','Make <b>1,000,000,000,000,000,000,000</b> cookies just from factories.',[4,24]);
		order=1445;
		new Game.Achievement('Reverse funnel system','Make <b>10,000,000,000,000,000,000,000</b> cookies just from banks.',[15,24]);
		order=1470;
		new Game.Achievement('Thus spoke you','Make <b>100,000,000,000,000,000,000,000</b> cookies just from temples.',[16,24]);
		order=1495;
		new Game.Achievement('Manafest destiny','Make <b>1,000,000,000,000,000,000,000,000</b> cookies just from wizard towers.',[17,24]);
		order=1520;
		new Game.Achievement('Neither snow nor rain nor heat nor gloom of night','Make <b>10,000,000,000,000,000,000,000,000</b> cookies just from shipments.',[5,24]);
		order=1620;
		new Game.Achievement('I\'ve got the Midas touch','Make <b>100,000,000,000,000,000,000,000,000</b> cookies just from alchemy labs.',[6,24]);
		order=1720;
		new Game.Achievement('Which eternal lie','Make <b>1,000,000,000,000,000,000,000,000,000</b> cookies just from portals.',[7,24]);
		order=1820;
		new Game.Achievement('D&eacute;j&agrave; vu','Make <b>10,000,000,000,000,000,000,000,000,000</b> cookies just from time machines.',[8,24]);
		order=1920;
		new Game.Achievement('Powers of Ten','Make <b>100,000,000,000,000,000,000,000,000,000</b> cookies just from antimatter condensers.',[13,24]);
		order=2020;
		new Game.Achievement('Now the dark days are gone','Make <b>1,000,000,000,000,000,000,000,000,000,000</b> cookies just from prisms.',[14,24]);
		
		order=1070;
		new Game.Achievement('Freaky jazz hands','Reach level <b>10</b> cursors.',[0,26]);Game.Objects['Cursor'].levelAchiev10=Game.last;
		order=1120;
		new Game.Achievement('Methuselah','Reach level <b>10</b> grandmas.',[1,26]);Game.Objects['Grandma'].levelAchiev10=Game.last;
		order=1220;
		new Game.Achievement('Huge tracts of land','Reach level <b>10</b> farms.',[2,26]);Game.Objects['Farm'].levelAchiev10=Game.last;
		order=1320;
		new Game.Achievement('D-d-d-d-deeper','Reach level <b>10</b> mines.',[3,26]);Game.Objects['Mine'].levelAchiev10=Game.last;
		order=1420;
		new Game.Achievement('Patently genius','Reach level <b>10</b> factories.',[4,26]);Game.Objects['Factory'].levelAchiev10=Game.last;
		order=1445;
		new Game.Achievement('A capital idea','Reach level <b>10</b> banks.',[15,26]);Game.Objects['Bank'].levelAchiev10=Game.last;
		order=1470;
		new Game.Achievement('It belongs in a bakery','Reach level <b>10</b> temples.',[16,26]);Game.Objects['Temple'].levelAchiev10=Game.last;
		order=1495;
		new Game.Achievement('Motormouth','Reach level <b>10</b> wizard towers.',[17,26]);Game.Objects['Wizard tower'].levelAchiev10=Game.last;
		order=1520;
		new Game.Achievement('Been there done that','Reach level <b>10</b> shipments.',[5,26]);Game.Objects['Shipment'].levelAchiev10=Game.last;
		order=1620;
		new Game.Achievement('Phlogisticated substances','Reach level <b>10</b> alchemy labs.',[6,26]);Game.Objects['Alchemy lab'].levelAchiev10=Game.last;
		order=1720;
		new Game.Achievement('Bizarro world','Reach level <b>10</b> portals.',[7,26]);Game.Objects['Portal'].levelAchiev10=Game.last;
		order=1820;
		new Game.Achievement('The long now','Reach level <b>10</b> time machines.',[8,26]);Game.Objects['Time machine'].levelAchiev10=Game.last;
		order=1920;
		new Game.Achievement('Chubby hadrons','Reach level <b>10</b> antimatter condensers.',[13,26]);Game.Objects['Antimatter condenser'].levelAchiev10=Game.last;
		order=2020;
		new Game.Achievement('Palettable','Reach level <b>10</b> prisms.',[14,26]);Game.Objects['Prism'].levelAchiev10=Game.last;
		
		order=61470;
		order=61495;
		new Game.Achievement('Bibbidi-bobbidi-boo','Cast <b>9</b> spells.',[21,11]);
		new Game.Achievement('I\'m the wiz','Cast <b>99</b> spells.',[22,11]);
		new Game.Achievement('A wizard is you','Cast <b>999</b> spells.<q>I\'m a what?</q>',[29,11]);
		
		order=10000;
		new Game.Achievement('Four-leaf cookie','Have <b>4</b> golden cookies simultaneously.<q>Fairly rare, considering cookies don\'t even have leaves.</q>',[27,6]);Game.last.pool='shadow';
		
		order=2100;
		new Game.TieredAchievement('Lucked out','Have <b>1</b> chancemaker.','Chancemaker',1);
		new Game.TieredAchievement('What are the odds','Have <b>50</b> chancemakers.','Chancemaker',2);
		new Game.TieredAchievement('Grandma needs a new pair of shoes','Have <b>100</b> chancemakers.','Chancemaker',3);
		new Game.TieredAchievement('Million to one shot, doc','Have <b>150</b> chancemakers.','Chancemaker',4);
		new Game.TieredAchievement('As luck would have it','Have <b>200</b> chancemakers.','Chancemaker',5);
		new Game.TieredAchievement('Ever in your favor','Have <b>250</b> chancemakers.','Chancemaker',6);
		new Game.TieredAchievement('Be a lady','Have <b>300</b> chancemakers.','Chancemaker',7);
		new Game.TieredAchievement('Dicey business','Have <b>350</b> chancemakers.','Chancemaker',8);
		
		order=2120;
		new Game.Achievement('Fingers crossed','Make <b>10,000,000,000,000,000,000,000,000</b> cookies just from chancemakers.',[19,22]);
		new Game.Achievement('Just a statistic','Make <b>10,000,000,000,000,000,000,000,000,000</b> cookies just from chancemakers.',[19,23]);
		new Game.Achievement('Murphy\'s wild guess','Make <b>10,000,000,000,000,000,000,000,000,000,000</b> cookies just from chancemakers.',[19,24]);
		
		new Game.Achievement('Let\'s leaf it at that','Reach level <b>10</b> chancemakers.',[19,26]);Game.Objects['Chancemaker'].levelAchiev10=Game.last;
		
		order=1000;
		new Game.Achievement('The ultimate clickdown','Make <b>1,000,000,000,000,000,000,000</b> cookies from clicking.<q>(of ultimate destiny.)',[11,19]);
		//end of achievements
		
		/*=====================================================================================
		BUFFS
		=======================================================================================*/
		
		Game.buffs=[];//buffs currently in effect by name
		Game.buffsN=0;
		Game.buffsL=l('buffs');
		Game.gainBuff=function(type,time,arg1,arg2,arg3)
		{
			type=Game.buffTypesByName[type];
			var obj=type.func(time,arg1,arg2,arg3);
			obj.type=type;
			obj.arg1=arg1;
			obj.arg2=arg2;
			obj.arg3=arg3;
			
			var buff={
				visible:true,
				time:0,
				name:'???',
				desc:'',
				icon:[0,0]
			};
			if (Game.buffs[obj.name])//if there is already a buff in effect with this name
			{
				var buff=Game.buffs[obj.name];
				if (obj.max) buff.time=Math.max(obj.time,buff.time);//new duration is max of old and new
				if (obj.add) buff.time+=obj.time;//new duration is old + new
				if (!obj.max && !obj.add) buff.time=obj.time;//new duration is set to new
				buff.maxTime=buff.time;
			}
			else//create new buff
			{
				for (var i in obj)//paste parameters onto buff
				{buff[i]=obj[i];}
				buff.maxTime=buff.time;
				Game.buffs[buff.name]=buff;
				buff.id=Game.buffsN;
				
				//create dom
				Game.buffsL.innerHTML=Game.buffsL.innerHTML+'<div id="buff'+buff.id+'" class="crate enabled buff" '+(buff.desc?Game.getTooltip(
					'<div class="prompt" style="min-width:200px;text-align:center;font-size:11px;margin:8px 0px;"><h3>'+buff.name+'</h3><div class="line"></div>'+buff.desc+'</div>'
				,'left',true):'')+' style="opacity:1;float:none;display:block;background-position:'+(-buff.icon[0]*48)+'px '+(-buff.icon[1]*48)+'px;"></div>';
				
				buff.l=l('buff'+buff.id);
				
				Game.buffsN++;
			}
			Game.recalculateGains=1;
			Game.storeToRefresh=1;
			return buff;
		}
		Game.hasBuff=function(what)//returns 0 if there is no buff in effect with this name; else, returns it
		{if (!Game.buffs[what]) return 0; else return Game.buffs[what];}
		Game.updateBuffs=function()//executed every logic frame
		{
			for (var i in Game.buffs)
			{
				var buff=Game.buffs[i];
				
				if (buff.time>=0)
				{
					if (!l('buffPieTimer'+buff.id)) l('buff'+buff.id).innerHTML=l('buff'+buff.id).innerHTML+'<div class="pieTimer" id="buffPieTimer'+buff.id+'"></div>';
					var T=1-(buff.time/buff.maxTime);
					T=(T*144)%144;
					l('buffPieTimer'+buff.id).style.backgroundPosition=(-Math.floor(T%18))*48+'px '+(-Math.floor(T/18))*48+'px';
				}
				buff.time--;
				if (buff.time<=0)
				{
					if (Game.onCrate==l('buff'+buff.id)) Game.tooltip.hide();
					if (buff.onDie) buff.onDie();
					Game.buffsL.removeChild(l('buff'+buff.id));
					if (Game.buffs[buff.name])
					{
						Game.buffs[buff.name]=0;
						delete Game.buffs[buff.name];
					}
					Game.recalculateGains=1;
					Game.storeToRefresh=1;
				}
			}
		}
		Game.killBuff=function(what)//remove a buff by name
		{if (Game.buffs[what]){Game.buffs[what].time=0;/*Game.buffs[what]=0;*/}}
		Game.killBuffs=function()//remove all buffs
		{Game.buffsL.innerHTML='';Game.buffs=[];Game.recalculateGains=1;Game.storeToRefresh=1;}
		
		
		Game.buffTypes=[];//buff archetypes; only buffs declared from these can be saved and loaded
		Game.buffTypesByName=[];
		Game.buffTypesN=0;
		Game.buffType=function(name,func)
		{
			this.name=name;
			this.func=func;//this is a function that returns a buff object; it takes a "time" argument in seconds, and 3 more optional arguments at most, which will be saved and loaded as floats
			this.id=Game.buffTypesN;
			this.vanilla=Game.vanilla;
			Game.buffTypesByName[this.name]=this;
			Game.buffTypes[Game.buffTypesN]=this;
			Game.buffTypesN++;
		}
		
		/*
		basic buff parameters :
			name:'Kitten rain',
			desc:'It\'s raining kittens!',
			icon:[0,0],
			time:30*Game.fps
		other parameters :
			visible:false - will hide the buff from the buff list
			add:true - if this buff already exists, add the new duration to the old one
			max:true - if this buff already exists, set the new duration to the max of either
			onDie:function(){} - function will execute when the buff runs out
			power:3 - used by some buffs
			multCpS:3 - buff multiplies CpS by this amount
			multClick:3 - buff multiplies click power by this amount
		*/
		
		//base buffs
		new Game.buffType('frenzy',function(time,pow)
		{
			return {
				name:'Frenzy',
				desc:'Cookie production x'+pow+' for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[10,14],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:1
			};
		});
		new Game.buffType('blood frenzy',function(time,pow)
		{
			return {
				name:'Elder frenzy',
				desc:'Cookie production x'+pow+' for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[29,6],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:1
			};
		});
		new Game.buffType('clot',function(time,pow)
		{
			return {
				name:'Clot',
				desc:'Cookie production halved for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[15,5],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:2
			};
		});
		new Game.buffType('dragon harvest',function(time,pow)
		{
			return {
				name:'Dragon Harvest',
				desc:'Cookie production x'+pow+' for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[10,25],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:1
			};
		});
		new Game.buffType('everything must go',function(time,pow)
		{
			return {
				name:'Everything must go',
				desc:'All buildings are '+pow+'% cheaper for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[17,6],
				time:time*Game.fps,
				add:true,
				power:pow,
				aura:1
			};
		});
		new Game.buffType('cursed finger',function(time,pow)
		{
			return {
				name:'Cursed finger',
				desc:'Cookie production halted for '+Game.sayTime(time*Game.fps,-1)+',<br>but each click is worth '+Game.sayTime(time*Game.fps,-1)+' of CpS.',
				icon:[12,17],
				time:time*Game.fps,
				add:true,
				power:pow,
				multCpS:0,
				aura:1
			};
		});
		new Game.buffType('click frenzy',function(time,pow)
		{
			return {
				name:'Click frenzy',
				desc:'Clicking power x'+pow+' for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[0,14],
				time:time*Game.fps,
				add:true,
				multClick:pow,
				aura:1
			};
		});
		new Game.buffType('dragonflight',function(time,pow)
		{
			return {
				name:'Dragonflight',
				desc:'Clicking power x'+pow+' for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[0,25],
				time:time*Game.fps,
				add:true,
				multClick:pow,
				aura:1
			};
		});
		new Game.buffType('cookie storm',function(time,pow)
		{
			return {
				name:'Cookie storm',
				desc:'Cookies everywhere!',
				icon:[22,6],
				time:time*Game.fps,
				add:true,
				power:pow,
				aura:1
			};
		});
		new Game.buffType('building buff',function(time,pow,building)
		{
			var obj=Game.ObjectsById[building];
			return {
				name:Game.goldenCookieBuildingBuffs[obj.name][0],
				desc:'Your '+obj.amount+' '+obj.plural+' are boosting your CpS!<br>Cookie production +'+(Math.ceil(pow*100-100))+'% for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[obj.iconColumn,14],
				time:time*Game.fps,
				add:true,
				multCpS:pow,
				aura:1
			};
		});
		new Game.buffType('building debuff',function(time,pow,building)
		{
			var obj=Game.ObjectsById[building];
			return {
				name:Game.goldenCookieBuildingBuffs[obj.name][1],
				desc:'Your '+obj.amount+' '+obj.plural+' are rusting your CpS!<br>Cookie production '+(Math.ceil(pow*100-100))+'% slower for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[obj.iconColumn,15],
				time:time*Game.fps,
				add:true,
				multCpS:1/pow,
				aura:2
			};
		});
		new Game.buffType('sugar blessing',function(time,pow)
		{
			return {
				name:'Sugar blessing',
				desc:'You find 10% more golden cookies for the next '+Game.sayTime(time*Game.fps,-1)+'.',
				icon:[29,16],
				time:time*Game.fps,
				//add:true
			};
		});
		new Game.buffType('haggler luck',function(time,pow)
		{
			return {
				name:'Haggler\'s luck',
				desc:'All upgrades are '+pow+'% cheaper for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[25,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('haggler misery',function(time,pow)
		{
			return {
				name:'Haggler\'s misery',
				desc:'All upgrades are '+pow+'% pricier for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[25,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('pixie luck',function(time,pow)
		{
			return {
				name:'Crafty pixies',
				desc:'All buildings are '+pow+'% cheaper for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[26,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('pixie misery',function(time,pow)
		{
			return {
				name:'Nasty goblins',
				desc:'All buildings are '+pow+'% pricier for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[26,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('magic adept',function(time,pow)
		{
			return {
				name:'Magic adept',
				desc:'Spells backfire '+pow+' times less for '+Game.sayTime(time*Game.fps,-1)+'.',
				icon:[29,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('magic inept',function(time,pow)
		{
			return {
				name:'Magic inept',
				desc:'Spells backfire '+pow+' times more for '+Game.sayTime(time*Game.fps,-1)+'.',
				icon:[29,11],
				time:time*Game.fps,
				power:pow,
				max:true
			};
		});
		new Game.buffType('devastation',function(time,pow)
		{
			return {
				name:'Devastation',
				desc:'Clicking power +'+Math.floor(pow*100-100)+'% for '+Game.sayTime(time*Game.fps,-1)+'!',
				icon:[23,18],
				time:time*Game.fps,
				multClick:pow,
				aura:1,
				max:true
			};
		});
		
		//end of buffs
		
		
		
		
		
		BeautifyAll();
		Game.vanilla=0;//everything we create beyond this will not be saved in the default save
		
		
		for (var i in Game.customCreate) {Game.customCreate[i]();}
		
		
		/*=====================================================================================
		GRANDMAPOCALYPSE
		=======================================================================================*/
		Game.UpdateGrandmapocalypse=function()
		{
			if (Game.Has('Elder Covenant') || Game.Objects['Grandma'].amount==0) Game.elderWrath=0;
			else if (Game.pledgeT>0)//if the pledge is active, lower it
			{
				Game.pledgeT--;
				if (Game.pledgeT==0)//did we reach 0? make the pledge purchasable again
				{
					Game.Lock('Elder Pledge');
					Game.Unlock('Elder Pledge');
					Game.elderWrath=1;
				}
			}
			else
			{
				if (Game.Has('One mind') && Game.elderWrath==0)
				{
					Game.elderWrath=1;
				}
				if (Math.random()<0.001 && Game.elderWrath<Game.Has('One mind')+Game.Has('Communal brainsweep')+Game.Has('Elder Pact'))
				{
					Game.elderWrath++;//have we already pledged? make the elder wrath shift between different stages
				}
				if (Game.Has('Elder Pact') && Game.Upgrades['Elder Pledge'].unlocked==0)
				{
					Game.Lock('Elder Pledge');
					Game.Unlock('Elder Pledge');
				}
			}
			Game.elderWrathD+=((Game.elderWrath+1)-Game.elderWrathD)*0.001;//slowly fade to the target wrath state
			
			if (Game.elderWrath!=Game.elderWrathOld) Game.storeToRefresh=1;
			
			Game.elderWrathOld=Game.elderWrath;
			
			Game.UpdateWrinklers();
		}
		
		//wrinklers
		
		function inRect(x,y,rect)
		{
			//find out if the point x,y is in the rotated rectangle rect{w,h,r,o} (width,height,rotation in radians,y-origin) (needs to be normalized)
			//I found this somewhere online I guess
			var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
			var h1 = Math.sqrt(dx*dx + dy*dy);
			var currA = Math.atan2(dy,dx);
			var newA = currA - rect.r;
			var x2 = Math.cos(newA) * h1;
			var y2 = Math.sin(newA) * h1;
			if (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h) return true;
			return false;
		}
		
		Game.wrinklerHP=2.1;
		Game.wrinklers=[];
		for (var i=0;i<12;i++)
		{
			Game.wrinklers.push({id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:Game.wrinklerHP,selected:0,type:0});
		}
		Game.getWrinklersMax=function()
		{
			var n=10;
			if (Game.Has('Elder spice')) n+=2;
			return n;
		}
		Game.ResetWrinklers=function()
		{
			for (var i in Game.wrinklers)
			{
				Game.wrinklers[i]={id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:Game.wrinklerHP,type:0};
			}
		}
		Game.CollectWrinklers=function()
		{
			for (var i in Game.wrinklers)
			{
				Game.wrinklers[i].hp=0;
			}
		}
		Game.wrinklerSquishSound=Math.floor(Math.random()*4)+1;
		Game.playWrinklerSquishSound=function()
		{
			PlaySound('snd/squish'+(Game.wrinklerSquishSound)+'.mp3',0.5);
			Game.wrinklerSquishSound+=Math.floor(Math.random()*1.5)+1;
			if (Game.wrinklerSquishSound>4) Game.wrinklerSquishSound-=4;
		}
		Game.SpawnWrinkler=function(me)
		{
			if (!me)
			{
				var max=Game.getWrinklersMax();
				var n=0;
				for (var i in Game.wrinklers)
				{
					if (Game.wrinklers[i].phase>0) n++;
				}
				for (var i in Game.wrinklers)
				{
					var it=Game.wrinklers[i];
					if (it.phase==0 && Game.elderWrath>0 && n<max && it.id<max)
					{
						me=it;
						break;
					}
				}
			}
			if (!me) return false;
			me.phase=1;
			me.hp=Game.wrinklerHP;
			me.type=0;
			if (Math.random()<0.0001) me.type=1;//shiny wrinkler
			return me;
		}
		Game.PopRandomWrinkler=function()
		{
			var wrinklers=[];
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase>0 && Game.wrinklers[i].hp>0) wrinklers.push(Game.wrinklers[i]);
			}
			if (wrinklers.length>0)
			{
				var me=choose(wrinklers);
				me.hp=-10;
				return me;
			}
			return false;
		}
		Game.UpdateWrinklers=function()
		{
			var xBase=0;
			var yBase=0;
			var onWrinkler=0;
			if (Game.LeftBackground)
			{
				xBase=Game.cookieOriginX;
				yBase=Game.cookieOriginY;
			}
			var max=Game.getWrinklersMax();
			var n=0;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase>0) n++;
			}
			for (var i in Game.wrinklers)
			{
				var me=Game.wrinklers[i];
				if (me.phase==0 && Game.elderWrath>0 && n<max && me.id<max)
				{
					var chance=0.00001*Game.elderWrath;
					if (Game.Has('Unholy bait')) chance*=5;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('scorn');
						if (godLvl==1) chance*=2.5;
						else if (godLvl==2) chance*=2;
						else if (godLvl==3) chance*=1.5;
					}
					if (Game.Has('Wrinkler doormat')) chance=0.1;
					if (Math.random()<chance)//respawn
					{
						Game.SpawnWrinkler(me);
					}
				}
				if (me.phase>0)
				{
					if (me.close<1) me.close+=(1/Game.fps)/10;
					if (me.close>1) me.close=1;
				}
				else me.close=0;
				if (me.close==1 && me.phase==1)
				{
					me.phase=2;
					Game.recalculateGains=1;
				}
				if (me.phase==2)
				{
					me.sucked+=(((Game.cookiesPs/Game.fps)*Game.cpsSucked));//suck the cookies
				}
				if (me.phase>0)
				{
					if (me.type==0)
					{
						if (me.hp<Game.wrinklerHP) me.hp+=0.04;
						me.hp=Math.min(Game.wrinklerHP,me.hp);
					}
					else if (me.type==1)
					{
						if (me.hp<Game.wrinklerHP*3) me.hp+=0.04;
						me.hp=Math.min(Game.wrinklerHP*3,me.hp);
					}
					var d=128*(2-me.close);//*Game.BigCookieSize;
					if (Game.prefs.fancy) d+=Math.cos(Game.T*0.05+parseInt(me.id))*4;
					me.r=(me.id/max)*360;
					if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.05+parseInt(me.id))*4;
					me.x=xBase+(Math.sin(me.r*Math.PI/180)*d);
					me.y=yBase+(Math.cos(me.r*Math.PI/180)*d);
					if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.09+parseInt(me.id))*4;
					var rect={w:100,h:200,r:(-me.r)*Math.PI/180,o:10};
					if (Math.random()<0.01) me.hurt=Math.max(me.hurt,Math.random());
					if (Game.T%5==0 && Game.CanClick) {if (Game.LeftBackground && Game.mouseX<Game.LeftBackground.canvas.width && inRect(Game.mouseX-me.x,Game.mouseY-me.y,rect)) me.selected=1; else me.selected=0;}
					if (me.selected && onWrinkler==0 && Game.CanClick)
					{
						me.hurt=Math.max(me.hurt,0.25);
						//me.close*=0.99;
						if (Game.Click)
						{
							if (Game.keys[17] && Game.sesame) {me.type=!me.type;PlaySound('snd/shimmerClick.mp3');}//ctrl-click on a wrinkler in god mode to toggle its shininess
							else
							{
								Game.playWrinklerSquishSound();
								me.hurt=1;
								me.hp-=0.75;
								if (Game.prefs.particles && !(me.hp<=0.5 && me.phase>0))
								{
									var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
									var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
									for (var ii=0;ii<3;ii++)
									{
										//Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
										var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
										part.r=-me.r;
									}
								}
							}
							Game.Click=0;
						}
						onWrinkler=1;
					}
				}
				
				if (me.hurt>0)
				{
					me.hurt-=5/Game.fps;
					//me.close-=me.hurt*0.05;
					//me.x+=Math.random()*2-1;
					//me.y+=Math.random()*2-1;
					me.r+=(Math.sin(Game.T*1)*me.hurt)*18;//Math.random()*2-1;
				}
				if (me.hp<=0.5 && me.phase>0)
				{
					Game.playWrinklerSquishSound();
					PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
					Game.wrinklersPopped++;
					Game.recalculateGains=1;
					me.phase=0;
					me.close=0;
					me.hurt=0;
					me.hp=3;
					var toSuck=1.1;
					if (Game.Has('Sacrilegious corruption')) toSuck*=1.05;
					if (me.type==1) toSuck*=3;//shiny wrinklers are an elusive, profitable breed
					me.sucked*=toSuck;//cookie dough does weird things inside wrinkler digestive tracts
					if (Game.Has('Wrinklerspawn')) me.sucked*=1.05;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('scorn');
						if (godLvl==1) me.sucked*=1.15;
						else if (godLvl==2) me.sucked*=1.1;
						else if (godLvl==3) me.sucked*=1.05;
					}
					if (me.sucked>0.5)
					{
						if (Game.prefs.popups) Game.Popup('Exploded a '+(me.type==1?'shiny ':'')+'wrinkler : found '+Beautify(me.sucked)+' cookies!');
						else Game.Notify('Exploded a '+(me.type==1?'shiny ':'')+'wrinkler','Found <b>'+Beautify(me.sucked)+'</b> cookies!',[19,8],6);
						Game.Popup('<div style="font-size:80%;">+'+Beautify(me.sucked)+' cookies</div>',Game.mouseX,Game.mouseY);
						
						if (Game.season=='halloween')
						{
							//if (Math.random()<(Game.HasAchiev('Spooky cookies')?0.2:0.05))//halloween cookie drops
							var failRate=0.95;
							if (Game.HasAchiev('Spooky cookies')) failRate=0.8;
							if (Game.Has('Santa\'s bottomless bag')) failRate*=0.9;
							if (Game.hasAura('Mind Over Matter')) failRate*=0.75;
							if (Game.Has('Starterror')) failRate*=0.9;
							if (Game.hasGod)
							{
								var godLvl=Game.hasGod('seasons');
								if (godLvl==1) failRate*=0.9;
								else if (godLvl==2) failRate*=0.95;
								else if (godLvl==3) failRate*=0.97;
							}
							if (me.type==1) failRate*=0.9;
							if (Math.random()>failRate)//halloween cookie drops
							{
								var cookie=choose(['Skull cookies','Ghost cookies','Bat cookies','Slime cookies','Pumpkin cookies','Eyeball cookies','Spider cookies']);
								if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
								{
									Game.Unlock(cookie);
									if (Game.prefs.popups) Game.Popup('Found : '+cookie+'!');
									else Game.Notify(cookie,'You also found <b>'+cookie+'</b>!',Game.Upgrades[cookie].icon);
								}
							}
						}
						Game.DropEgg(0.98);
					}
					if (me.type==1) Game.Win('Last Chance to See');
					Game.Earn(me.sucked);
					/*if (Game.prefs.particles)
					{
						var x=me.x+(Math.sin(me.r*Math.PI/180)*100);
						var y=me.y+(Math.cos(me.r*Math.PI/180)*100);
						for (var ii=0;ii<6;ii++)
						{
							Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
						}
					}*/
					if (Game.prefs.particles)
					{
						var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
						var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
						if (me.sucked>0)
						{
							for (var ii=0;ii<5;ii++)
							{
								Game.particleAdd(Game.mouseX,Game.mouseY,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.75,1.5,2);
							}
						}
						for (var ii=0;ii<8;ii++)
						{
							var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
							part.r=-me.r;
						}
					}
					me.sucked=0;
				}
			}
			if (onWrinkler)
			{
				Game.mousePointer=1;
			}
		}
		Game.DrawWrinklers=function()
		{
			for (var i in Game.wrinklers)
			{
				var me=Game.wrinklers[i];
				if (me.phase>0)
				{
					Game.LeftBackground.globalAlpha=me.close;
					Game.LeftBackground.save();
					Game.LeftBackground.translate(me.x,me.y);
					Game.LeftBackground.rotate(-(me.r)*Math.PI/180);
					//var s=Math.min(1,me.sucked/(Game.cookiesPs*60))*0.75+0.25;//scale wrinklers as they eat
					//Game.LeftBackground.scale(Math.pow(s,1.5)*1.25,s);
					//Game.LeftBackground.fillRect(-50,-10,100,200);
					if (me.type==1) Game.LeftBackground.drawImage(Pic('shinyWrinkler.png'),-50,-10);
					else if (Game.season=='christmas') Game.LeftBackground.drawImage(Pic('winterWrinkler.png'),-50,-10);
					else Game.LeftBackground.drawImage(Pic('wrinkler.png'),-50,-10);
					//Game.LeftBackground.fillText(me.id+' : '+me.sucked,0,0);
					if (me.type==1 && Math.random()<0.3 && Game.prefs.particles)//sparkle
					{
						Game.LeftBackground.globalAlpha=Math.random()*0.65+0.1;
						var s=Math.random()*30+5;
						Game.LeftBackground.globalCompositeOperation='lighter';
						Game.LeftBackground.drawImage(Pic('glint.jpg'),-s/2+Math.random()*50-25,-s/2+Math.random()*200,s,s);
					}
					Game.LeftBackground.restore();
					
					if (me.phase==2 && Math.random()<0.03 && Game.prefs.particles)
					{
						Game.particleAdd(me.x,me.y,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.5,1,2);
					}
				}
			}
		}
		Game.SaveWrinklers=function()
		{
			var amount=0;
			var amountShinies=0;
			var number=0;
			var shinies=0;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].sucked>0.5)
				{
					number++;
					if (Game.wrinklers[i].type==1)
					{
						shinies++;
						amountShinies+=Game.wrinklers[i].sucked;
					}
					else amount+=Game.wrinklers[i].sucked;
				}
			}
			return {amount:amount,number:number,shinies:shinies,amountShinies:amountShinies};
		}
		Game.LoadWrinklers=function(amount,number,shinies,amountShinies)
		{
			if (number>0 && (amount>0 || amountShinies>0))
			{
				var fullNumber=number-shinies;
				var fullNumberShinies=shinies;
				for (var i in Game.wrinklers)
				{
					if (number>0)
					{
						Game.wrinklers[i].phase=2;
						Game.wrinklers[i].close=1;
						Game.wrinklers[i].hp=3;
						if (shinies>0) {Game.wrinklers[i].type=1;Game.wrinklers[i].sucked=amountShinies/fullNumberShinies;shinies--;}
						else Game.wrinklers[i].sucked=amount/fullNumber;
						number--;
					}//respawn
				}
			}
		}
		
		/*=====================================================================================
		SPECIAL THINGS AND STUFF
		=======================================================================================*/
		
		
		Game.specialTab='';
		Game.specialTabHovered='';
		Game.specialTabs=[];
		
		Game.UpdateSpecial=function()
		{
			Game.specialTabs=[];
			if (Game.Has('A festive hat')) Game.specialTabs.push('santa');
			if (Game.Has('A crumbly egg')) Game.specialTabs.push('dragon');
			if (Game.specialTabs.length==0) {Game.ToggleSpecialMenu(0);return;}
		
			if (Game.LeftBackground)
			{
				Game.specialTabHovered='';
				var len=Game.specialTabs.length;
				if (len==0) return;
				var y=Game.LeftBackground.canvas.height-24-48*len;
				for (var i in Game.specialTabs)
				{
					var selected=0;
					if (Game.specialTab==Game.specialTabs[i]) selected=1;
					var x=24;
					var s=1;
					if (selected) {s=2;x+=24;}
					
					if (Math.abs(Game.mouseX-x)<=24*s && Math.abs(Game.mouseY-y)<=24*s)
					{
						Game.specialTabHovered=Game.specialTabs[i];
						Game.mousePointer=1;
						Game.CanClick=0;
						if (Game.Click)
						{
							if (Game.specialTab!=Game.specialTabs[i]) {Game.specialTab=Game.specialTabs[i];Game.ToggleSpecialMenu(1);PlaySound('snd/press.mp3');}
							else {Game.ToggleSpecialMenu(0);PlaySound('snd/press.mp3');}
							//PlaySound('snd/tick.mp3');
						}
					}
					
					y+=48;
				}
			}
		}
		
		Game.santaLevels=['Festive test tube','Festive ornament','Festive wreath','Festive tree','Festive present','Festive elf fetus','Elf toddler','Elfling','Young elf','Bulky elf','Nick','Santa Claus','Elder Santa','True Santa','Final Claus'];
		Game.santaDrops=['Increased merriness','Improved jolliness','A lump of coal','An itchy sweater','Reindeer baking grounds','Weighted sleighs','Ho ho ho-flavored frosting','Season savings','Toy workshop','Naughty list','Santa\'s bottomless bag','Santa\'s helpers','Santa\'s legacy','Santa\'s milk and cookies'];
		for (var i in Game.santaDrops)//scale christmas upgrade prices with santa level
		{Game.Upgrades[Game.santaDrops[i]].priceFunc=function(){return Math.pow(3,Game.santaLevel)*2525;}}
		
		Game.UpgradeSanta=function()
		{
			var moni=Math.pow(Game.santaLevel+1,Game.santaLevel+1);
			if (Game.cookies>moni && Game.santaLevel<14)
			{
				PlaySound('snd/shimmerClick.mp3');
				
				Game.Spend(moni);
				Game.santaLevel=(Game.santaLevel+1)%15;
				if (Game.santaLevel==14)
				{
					Game.Unlock('Santa\'s dominion');
					if (Game.prefs.popups) Game.Popup('You are granted<br>Santa\'s dominion.');
					else Game.Notify('You are granted Santa\'s dominion.','',Game.Upgrades['Santa\'s dominion'].icon);
				}
				var drops=[];
				for (var i in Game.santaDrops) {if (!Game.HasUnlocked(Game.santaDrops[i])) drops.push(Game.santaDrops[i]);}
				var drop=choose(drops);
				if (drop)
				{
					Game.Unlock(drop);
					if (Game.prefs.popups) Game.Popup('You find a present which contains...<br>'+drop+'!');
					else Game.Notify('Found a present!','You find a present which contains...<br><b>'+drop+'</b>!',Game.Upgrades[drop].icon);
				}
				
				Game.ToggleSpecialMenu(1);
				
				if (l('specialPic')){var rect=l('specialPic').getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2);}
				
				if (Game.santaLevel>=6) Game.Win('Coming to town');
				if (Game.santaLevel>=14) Game.Win('All hail Santa');
				Game.recalculateGains=1;
				Game.upgradesToRebuild=1;
			}
		}
		
		Game.dragonLevels=[
			{name:'Dragon egg',action:'Chip it',pic:0,
				cost:function(){return Game.cookies>=1000000;},
				buy:function(){Game.Spend(1000000);},
				costStr:function(){return Beautify(1000000)+' cookies';}},
			{name:'Dragon egg',action:'Chip it',pic:1,
				cost:function(){return Game.cookies>=1000000*2;},
				buy:function(){Game.Spend(1000000*2);},
				costStr:function(){return Beautify(1000000*2)+' cookies';}},
			{name:'Dragon egg',action:'Chip it',pic:2,
				cost:function(){return Game.cookies>=1000000*4;},
				buy:function(){Game.Spend(1000000*4);},
				costStr:function(){return Beautify(1000000*4)+' cookies';}},
			{name:'Shivering dragon egg',action:'Hatch it',pic:3,
				cost:function(){return Game.cookies>=1000000*8;},
				buy:function(){Game.Spend(1000000*8);},
				costStr:function(){return Beautify(1000000*8)+' cookies';}},
			{name:'Krumblor, cookie hatchling',action:'Train Breath of Milk<br><small>Aura : kittens are 5% more effective</small>',pic:4,
				cost:function(){return Game.cookies>=1000000*16;},
				buy:function(){Game.Spend(1000000*16);},
				costStr:function(){return Beautify(1000000*16)+' cookies';}},
			{name:'Krumblor, cookie hatchling',action:'Train Dragon Cursor<br><small>Aura : clicking is 5% more effective</small>',pic:4,
				cost:function(){return Game.Objects['Cursor'].amount>=100;},
				buy:function(){Game.Objects['Cursor'].sacrifice(100);},
				costStr:function(){return '100 cursors';}},
			{name:'Krumblor, cookie hatchling',action:'Train Elder Battalion<br><small>Aura : grandmas gain +1% CpS for every non-grandma building</small>',pic:4,
				cost:function(){return Game.Objects['Grandma'].amount>=100;},
				buy:function(){Game.Objects['Grandma'].sacrifice(100);},
				costStr:function(){return '100 grandmas';}},
			{name:'Krumblor, cookie hatchling',action:'Train Reaper of Fields<br><small>Aura : golden cookies may trigger a Dragon Harvest</small>',pic:4,
				cost:function(){return Game.Objects['Farm'].amount>=100;},
				buy:function(){Game.Objects['Farm'].sacrifice(100);},
				costStr:function(){return '100 farms';}},
			{name:'Krumblor, cookie dragon',action:'Train Earth Shatterer<br><small>Aura : buildings sell back for 85% instead of 50%</small>',pic:5,
				cost:function(){return Game.Objects['Mine'].amount>=100;},
				buy:function(){Game.Objects['Mine'].sacrifice(100);},
				costStr:function(){return '100 mines';}},
			{name:'Krumblor, cookie dragon',action:'Train Master of the Armory<br><small>Aura : all upgrades are 2% cheaper</small>',pic:5,
				cost:function(){return Game.Objects['Factory'].amount>=100;},
				buy:function(){Game.Objects['Factory'].sacrifice(100);},
				costStr:function(){return '100 factories';}},
			{name:'Krumblor, cookie dragon',action:'Train Fierce Hoarder<br><small>Aura : all buildings are 2% cheaper</small>',pic:5,
				cost:function(){return Game.Objects['Bank'].amount>=100;},
				buy:function(){Game.Objects['Bank'].sacrifice(100);},
				costStr:function(){return '100 banks';}},
			{name:'Krumblor, cookie dragon',action:'Train Dragon God<br><small>Aura : prestige CpS bonus +5%</small>',pic:5,
				cost:function(){return Game.Objects['Temple'].amount>=100;},
				buy:function(){Game.Objects['Temple'].sacrifice(100);},
				costStr:function(){return '100 temples';}},
			{name:'Krumblor, cookie dragon',action:'Train Arcane Aura<br><small>Aura : golden cookies appear 5% more often</small>',pic:5,
				cost:function(){return Game.Objects['Wizard tower'].amount>=100;},
				buy:function(){Game.Objects['Wizard tower'].sacrifice(100);},
				costStr:function(){return '100 wizard towers';}},
			{name:'Krumblor, cookie dragon',action:'Train Dragonflight<br><small>Aura : golden cookies may trigger a Dragonflight</small>',pic:5,
				cost:function(){return Game.Objects['Shipment'].amount>=100;},
				buy:function(){Game.Objects['Shipment'].sacrifice(100);},
				costStr:function(){return '100 shipments';}},
			{name:'Krumblor, cookie dragon',action:'Train Ancestral Metamorphosis<br><small>Aura : golden cookies give 10% more cookies</small>',pic:5,
				cost:function(){return Game.Objects['Alchemy lab'].amount>=100;},
				buy:function(){Game.Objects['Alchemy lab'].sacrifice(100);},
				costStr:function(){return '100 alchemy labs';}},
			{name:'Krumblor, cookie dragon',action:'Train Unholy Dominion<br><small>Aura : wrath cookies give 10% more cookies</small>',pic:5,
				cost:function(){return Game.Objects['Portal'].amount>=100;},
				buy:function(){Game.Objects['Portal'].sacrifice(100);},
				costStr:function(){return '100 portals';}},
			{name:'Krumblor, cookie dragon',action:'Train Epoch Manipulator<br><small>Aura : golden cookie effects last 5% longer</small>',pic:5,
				cost:function(){return Game.Objects['Time machine'].amount>=100;},
				buy:function(){Game.Objects['Time machine'].sacrifice(100);},
				costStr:function(){return '100 time machines';}},
			{name:'Krumblor, cookie dragon',action:'Train Mind Over Matter<br><small>Aura : +25% random drops</small>',pic:5,
				cost:function(){return Game.Objects['Antimatter condenser'].amount>=100;},
				buy:function(){Game.Objects['Antimatter condenser'].sacrifice(100);},
				costStr:function(){return '100 antimatter condensers';}},
			{name:'Krumblor, cookie dragon',action:'Train Radiant Appetite<br><small>Aura : all cookie production multiplied by 2</small>',pic:5,
				cost:function(){return Game.Objects['Prism'].amount>=100;},
				buy:function(){Game.Objects['Prism'].sacrifice(100);},
				costStr:function(){return '100 prisms';}},
			{name:'Krumblor, cookie dragon',action:'Train Dragon\'s Fortune<br><small>Aura : +111% CpS per golden cookie on-screen</small>',pic:5,
				cost:function(){return Game.Objects['Chancemaker'].amount>=100;},
				buy:function(){Game.Objects['Chancemaker'].sacrifice(100);},
				costStr:function(){return '100 chancemakers';}},
			{name:'Krumblor, cookie dragon',action:'Bake dragon cookie<br><small>Delicious!</small>',pic:6,
				cost:function(){var fail=0;for (var i in Game.Objects){if (Game.Objects[i].amount<50) fail=1;}return (fail==0);},
				buy:function(){for (var i in Game.Objects){Game.Objects[i].sacrifice(50);}Game.Unlock('Dragon cookie');},
				costStr:function(){return '50 of every building';}},
			{name:'Krumblor, cookie dragon',action:'Train secondary aura<br><small>Lets you use two dragon auras simultaneously</small>',pic:6,
				cost:function(){var fail=0;for (var i in Game.Objects){if (Game.Objects[i].amount<200) fail=1;}return (fail==0);},
				buy:function(){for (var i in Game.Objects){Game.Objects[i].sacrifice(200);}},
				costStr:function(){return '200 of every building';}},
			{name:'Krumblor, cookie dragon',action:'Your dragon is fully trained.',pic:7}
		];
		
		Game.dragonAuras={
			0:{name:'No aura',pic:[0,7],desc:'Select an aura from those your dragon knows.'},
			1:{name:'Breath of Milk',pic:[18,25],desc:'Kittens are <b>5%</b> more effective.'},
			2:{name:'Dragon Cursor',pic:[0,25],desc:'Clicking is <b>5%</b> more effective.'},
			3:{name:'Elder Battalion',pic:[1,25],desc:'Grandmas gain <b>+1% CpS</b> for every non-grandma building.'},
			4:{name:'Reaper of Fields',pic:[2,25],desc:'Golden cookies may trigger a <b>Dragon Harvest</b>.'},
			5:{name:'Earth Shatterer',pic:[3,25],desc:'Buildings sell back for <b>85%</b> instead of 50%.'},
			6:{name:'Master of the Armory',pic:[4,25],desc:'All upgrades are <b>2%</b> cheaper.'},
			7:{name:'Fierce Hoarder',pic:[15,25],desc:'All buildings are <b>2%</b> cheaper.'},
			8:{name:'Dragon God',pic:[16,25],desc:'Prestige CpS bonus <b>+5%</b>.'},
			9:{name:'Arcane Aura',pic:[17,25],desc:'Golden cookies appear <b>+5%</b> more often.'},
			10:{name:'Dragonflight',pic:[5,25],desc:'Golden cookies may trigger a <b>Dragonflight</b>.'},
			11:{name:'Ancestral Metamorphosis',pic:[6,25],desc:'Golden cookies give <b>10%</b> more cookies.'},
			12:{name:'Unholy Dominion',pic:[7,25],desc:'Wrath cookies give <b>10%</b> more cookies.'},
			13:{name:'Epoch Manipulator',pic:[8,25],desc:'Golden cookies last <b>5%</b> longer.'},
			14:{name:'Mind Over Matter',pic:[13,25],desc:'Random drops are <b>25% more common</b>.'},
			15:{name:'Radiant Appetite',pic:[14,25],desc:'All cookie production <b>multiplied by 2</b>.'},
			16:{name:'Dragon\'s Fortune',pic:[19,25],desc:'<b>+111% CpS</b> per golden cookie on-screen, multiplicative.'},
		};
		
		Game.hasAura=function(what)
		{
			if (Game.dragonAuras[Game.dragonAura].name==what || Game.dragonAuras[Game.dragonAura2].name==what) return true; else return false;
		}
		
		Game.SelectDragonAura=function(slot,update)
		{	
			var currentAura=0;
			var otherAura=0;
			if (slot==0) currentAura=Game.dragonAura; else currentAura=Game.dragonAura2;
			if (slot==0) otherAura=Game.dragonAura2; else otherAura=Game.dragonAura;
			if (!update) Game.SelectingDragonAura=currentAura;
			
			var str='';
			for (var i in Game.dragonAuras)
			{
				if (Game.dragonLevel>=parseInt(i)+4)
				{
					var icon=Game.dragonAuras[i].pic;
					if (i==0 || i!=otherAura) str+='<div class="crate enabled'+(i==Game.SelectingDragonAura?' highlighted':'')+'" style="opacity:1;float:none;display:inline-block;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');Game.SetDragonAura('+i+','+slot+');" onMouseOut="Game.DescribeDragonAura('+Game.SelectingDragonAura+');" onMouseOver="Game.DescribeDragonAura('+i+');"'+
					'></div>';
				}
			}
			
			var highestBuilding=0;
			for (var i in Game.Objects) {if (Game.Objects[i].amount>0) highestBuilding=Game.Objects[i];}
			
			Game.Prompt('<h3>Set your dragon\'s '+(slot==1?'secondary ':'')+'aura</h3>'+
						'<div class="line"></div>'+
						'<div id="dragonAuraInfo" style="min-height:60px;"></div>'+
						'<div style="text-align:center;">'+str+'</div>'+
						'<div class="line"></div>'+
						'<div style="text-align:center;margin-bottom:8px;">'+(highestBuilding==0?'Switching your aura is <b>free</b> because you own no buildings.':'The cost of switching your aura is <b>1 '+highestBuilding.name+'</b>.<br>This will affect your CpS!')+'</div>'
						,[['Confirm',(slot==0?'Game.dragonAura':'Game.dragonAura2')+'=Game.SelectingDragonAura;'+(highestBuilding==0 || currentAura==Game.SelectingDragonAura?'':'Game.ObjectsById['+highestBuilding.id+'].sacrifice(1);')+'Game.ToggleSpecialMenu(1);Game.ClosePrompt();'],'Cancel'],0,'widePrompt');
			Game.DescribeDragonAura(Game.SelectingDragonAura);
		}
		Game.SelectingDragonAura=-1;
		Game.SetDragonAura=function(aura,slot)
		{
			Game.SelectingDragonAura=aura;
			Game.SelectDragonAura(slot,1);
		}
		Game.DescribeDragonAura=function(aura)
		{
			l('dragonAuraInfo').innerHTML=
			'<div style="min-width:200px;text-align:center;"><h4>'+Game.dragonAuras[aura].name+'</h4>'+
			'<div class="line"></div>'+
			Game.dragonAuras[aura].desc+
			'</div>';
		}
		
		Game.UpgradeDragon=function()
		{
			if (Game.dragonLevel<Game.dragonLevels.length-1 && Game.dragonLevels[Game.dragonLevel].cost())
			{
				PlaySound('snd/shimmerClick.mp3');
				Game.dragonLevels[Game.dragonLevel].buy();
				Game.dragonLevel=(Game.dragonLevel+1)%Game.dragonLevels.length;
				
				if (Game.dragonLevel>=Game.dragonLevels.length-1) Game.Win('Here be dragon');
				Game.ToggleSpecialMenu(1);
				if (l('specialPic')){var rect=l('specialPic').getBoundingClientRect();Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2);}
				Game.recalculateGains=1;
				Game.upgradesToRebuild=1;
			}
		}
		
		Game.ToggleSpecialMenu=function(on)
		{
			if (on)
			{
				var pic='';
				var frame=0;
				if (Game.specialTab=='santa') {pic='santa.png';frame=Game.santaLevel;}
				else if (Game.specialTab=='dragon') {pic='dragon.png';frame=Game.dragonLevels[Game.dragonLevel].pic;}
				else {pic='dragon.png';frame=4;}
				
				var str='<div id="specialPic" style="position:absolute;left:-16px;top:-64px;width:96px;height:96px;background:url(img/'+pic+');background-position:'+(-frame*96)+'px 0px;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);"></div>';
				str+='<div class="close" onclick="PlaySound(\'snd/press.mp3\');Game.ToggleSpecialMenu(0);">x</div>';
				
				if (Game.specialTab=='santa')
				{
					var moni=Math.pow(Game.santaLevel+1,Game.santaLevel+1);
					
					str+='<h3>'+Game.santaLevels[Game.santaLevel]+'</h3>';
					if (Game.santaLevel<14)
					{
						str+='<div class="line"></div>'+
						'<div class="optionBox" style="margin-bottom:0px;"><a class="option framed large title" '+Game.clickStr+'="Game.UpgradeSanta();">'+
							'<div style="display:table-cell;vertical-align:middle;">Evolve</div>'+
							'<div style="display:table-cell;vertical-align:middle;padding:4px 12px;">|</div>'+
							'<div style="display:table-cell;vertical-align:middle;font-size:65%;">cost :<div'+(Game.cookies>moni?'':' style="color:#777;"')+'>'+Beautify(Math.pow(Game.santaLevel+1,Game.santaLevel+1))+' '+(Game.santaLevel>0?'cookies':'cookie')+'</div></div>'+
						'</a></div>';
					}
				}
				else if (Game.specialTab=='dragon')
				{
					var level=Game.dragonLevels[Game.dragonLevel];
				
					str+='<h3>'+level.name+'</h3>';
					
					if (Game.dragonLevel>=5)
					{
						var icon=Game.dragonAuras[Game.dragonAura].pic;
						str+='<div class="crate enabled" style="opacity:1;position:absolute;right:18px;top:-58px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');Game.SelectDragonAura(0);" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;"><h4>'+Game.dragonAuras[Game.dragonAura].name+'</h4>'+
							'<div class="line"></div>'+
							Game.dragonAuras[Game.dragonAura].desc+
							'</div>'
						,'top')+
						'></div>';
					}
					if (Game.dragonLevel>=22)
					{
						var icon=Game.dragonAuras[Game.dragonAura2].pic;
						str+='<div class="crate enabled" style="opacity:1;position:absolute;right:80px;top:-58px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');Game.SelectDragonAura(1);" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;"><h4>'+Game.dragonAuras[Game.dragonAura2].name+'</h4>'+
							'<div class="line"></div>'+
							Game.dragonAuras[Game.dragonAura2].desc+
							'</div>'
						,'top')+
						'></div>';
					}
					
					if (Game.dragonLevel<Game.dragonLevels.length-1)
					{
						str+='<div class="line"></div>'+
						'<div class="optionBox" style="margin-bottom:0px;"><a class="option framed large title" '+Game.clickStr+'="Game.UpgradeDragon();">'+
							'<div style="display:table-cell;vertical-align:middle;">'+level.action+'</div>'+
							'<div style="display:table-cell;vertical-align:middle;padding:4px 12px;">|</div>'+
							'<div style="display:table-cell;vertical-align:middle;font-size:65%;">sacrifice<div'+(level.cost()?'':' style="color:#777;"')+'>'+level.costStr()+'</div></div>'+
						'</a></div>';
					}
					else
					{
						str+='<div class="line"></div>'+
						'<div style="text-align:center;margin-bottom:4px;">'+level.action+'</div>';
					}
				}
				
				l('specialPopup').innerHTML=str;
				
				l('specialPopup').className='framed prompt onScreen';
			}
			else
			{
				if (Game.specialTab!='')
				{
					Game.specialTab='';
					l('specialPopup').className='framed prompt offScreen';
					setTimeout(function(){if (Game.specialTab=='') {/*l('specialPopup').style.display='none';*/l('specialPopup').innerHTML='';}},1000*0.2);
				}
			}
		}
		Game.DrawSpecial=function()
		{
			var len=Game.specialTabs.length;
			if (len==0) return;
			Game.LeftBackground.globalAlpha=1;
			var y=Game.LeftBackground.canvas.height-24-48*len;
			var tabI=0;
			
			for (var i in Game.specialTabs)
			{
				var selected=0;
				var hovered=0;
				if (Game.specialTab==Game.specialTabs[i]) selected=1;
				if (Game.specialTabHovered==Game.specialTabs[i]) hovered=1;
				var x=24;
				var s=1;
				var pic='';
				var frame=0;
				if (hovered) {s=1;x=24;}
				if (selected) {s=1;x=48;}
				
				if (Game.specialTabs[i]=='santa') {pic='santa.png';frame=Game.santaLevel;}
				else if (Game.specialTabs[i]=='dragon') {pic='dragon.png';frame=Game.dragonLevels[Game.dragonLevel].pic;}
				else {pic='dragon.png';frame=4;}
				
				if (hovered || selected)
				{
					var ss=s*64;
					var r=Math.floor((Game.T*0.5)%360);
					Game.LeftBackground.save();
					Game.LeftBackground.translate(x,y);
					if (Game.prefs.fancy) Game.LeftBackground.rotate((r/360)*Math.PI*2);
					Game.LeftBackground.globalAlpha=0.75;
					Game.LeftBackground.drawImage(Pic('shine.png'),-ss/2,-ss/2,ss,ss);
					Game.LeftBackground.restore();
				}
				
				if (Game.prefs.fancy) Game.LeftBackground.drawImage(Pic(pic),96*frame,0,96,96,(x+(selected?0:Math.sin(Game.T*0.2+tabI)*3)-24*s),(y-(selected?6:Math.abs(Math.cos(Game.T*0.2+tabI))*6)-24*s),48*s,48*s);
				else Game.LeftBackground.drawImage(Pic(pic),96*frame,0,96,96,(x-24*s),(y-24*s),48*s,48*s);
				
				tabI++;
				y+=48;
			}
			
		}
		
		/*=====================================================================================
		VISUAL EFFECTS
		=======================================================================================*/
		
		Game.Milks=[
			{name:'Rank I - Plain milk',pic:'milkPlain'},
			{name:'Rank II - Chocolate milk',pic:'milkChocolate'},
			{name:'Rank III - Raspberry milk',pic:'milkRaspberry'},
			{name:'Rank IV - Orange milk',pic:'milkOrange'},
			{name:'Rank V - Caramel milk',pic:'milkCaramel'},
			{name:'Rank VI - Banana milk',pic:'milkBanana'},
			{name:'Rank VII - Lime milk',pic:'milkLime'},
			{name:'Rank VIII - Blueberry milk',pic:'milkBlueberry'},
			{name:'Rank IX - Strawberry milk',pic:'milkStrawberry'},
			{name:'Rank X - Vanilla milk',pic:'milkVanilla'},
			{name:'Rank XI - Honey milk',pic:'milkHoney'},
		];
		Game.Milk=Game.Milks[0];
	
		Game.mousePointer=0;//when 1, draw the mouse as a pointer on the left screen
		
		Game.cookieOriginX=0;
		Game.cookieOriginY=0;
		Game.DrawBackground=function()
		{
			Timer.clean();
			//background
			if (!Game.Background)//init some stuff
			{
				Game.Background=l('backgroundCanvas').getContext('2d');
				Game.Background.canvas.width=Game.Background.canvas.parentNode.offsetWidth;
				Game.Background.canvas.height=Game.Background.canvas.parentNode.offsetHeight;
				Game.LeftBackground=l('backgroundLeftCanvas').getContext('2d');
				Game.LeftBackground.canvas.width=Game.LeftBackground.canvas.parentNode.offsetWidth;
				Game.LeftBackground.canvas.height=Game.LeftBackground.canvas.parentNode.offsetHeight;
					//preload ascend animation bits so they show up instantly
					Game.LeftBackground.globalAlpha=0;
					Game.LeftBackground.drawImage(Pic('brokenCookie.png'),0,0);
					Game.LeftBackground.drawImage(Pic('brokenCookieHalo.png'),0,0);
					Game.LeftBackground.drawImage(Pic('starbg.jpg'),0,0);
				
				window.addEventListener('resize', function(event)
				{
					Game.Background.canvas.width=Game.Background.canvas.parentNode.offsetWidth;
					Game.Background.canvas.height=Game.Background.canvas.parentNode.offsetHeight;
					Game.LeftBackground.canvas.width=Game.LeftBackground.canvas.parentNode.offsetWidth;
					Game.LeftBackground.canvas.height=Game.LeftBackground.canvas.parentNode.offsetHeight;
				});
			}
			
			
			if (Game.OnAscend)
			{
				Timer.clean();
				//starry background on ascend screen
				var w=Game.Background.canvas.width;
				var h=Game.Background.canvas.height;
				var b=Game.ascendl.getBoundingClientRect();
				var x=(b.left+b.right)/2;
				var y=(b.top+b.bottom)/2;
				Game.Background.globalAlpha=0.5;
				var s=1*Game.AscendZoom*(1+Math.cos(Game.T*0.0027)*0.05);
				Game.Background.fillPattern(Pic('starbg.jpg'),0,0,w,h,1024*s,1024*s,x+Game.AscendOffX*0.25*s,y+Game.AscendOffY*0.25*s);
				Timer.track('star layer 1');
				if (Game.prefs.fancy)
				{
					//additional star layer
					Game.Background.globalAlpha=0.5*(0.5+Math.sin(Game.T*0.02)*0.3);
					var s=2*Game.AscendZoom*(1+Math.sin(Game.T*0.002)*0.07);
					//Game.Background.globalCompositeOperation='lighter';
					Game.Background.fillPattern(Pic('starbg.jpg'),0,0,w,h,1024*s,1024*s,x+Game.AscendOffX*0.25*s,y+Game.AscendOffY*0.25*s);
					//Game.Background.globalCompositeOperation='source-over';
					Timer.track('star layer 2');
					
					x=x+Game.AscendOffX*Game.AscendZoom;
					y=y+Game.AscendOffY*Game.AscendZoom;
					//wispy nebula around the center
					Game.Background.save();
					Game.Background.globalAlpha=0.5;
					Game.Background.translate(x,y);
					Game.Background.globalCompositeOperation='lighter';
					Game.Background.rotate(Game.T*0.001);
					s=(600+150*Math.sin(Game.T*0.007))*Game.AscendZoom;
					Game.Background.drawImage(Pic('heavenRing1.jpg'),-s/2,-s/2,s,s);
					Game.Background.rotate(-Game.T*0.0017);
					s=(600+150*Math.sin(Game.T*0.0037))*Game.AscendZoom;
					Game.Background.drawImage(Pic('heavenRing2.jpg'),-s/2,-s/2,s,s);
					Game.Background.restore();
					Timer.track('nebula');
					
					/*
					//links between upgrades
					//not in because I am bad at this
					Game.Background.globalAlpha=1;
					Game.Background.save();
					Game.Background.translate(x,y);
					s=(32)*Game.AscendZoom;
					
					for (var i in Game.PrestigeUpgrades)
					{
						var me=Game.PrestigeUpgrades[i];
						var ghosted=0;
						if (me.canBePurchased || Game.Has('Neuromancy')){}
						else
						{
							for (var ii in me.parents){if (me.parents[ii]!=-1 && me.parents[ii].canBePurchased) ghosted=1;}
						}
						for (var ii in me.parents)//create pulsing links
						{
							if (me.parents[ii]!=-1 && (me.canBePurchased || ghosted))
							{
								var origX=0;
								var origY=0;
								var targX=me.posX+28;
								var targY=me.posY+28;
								if (me.parents[ii]!=-1) {origX=me.parents[ii].posX+28;origY=me.parents[ii].posY+28;}
								var rot=-Math.atan((targY-origY)/(origX-targX));
								if (targX<=origX) rot+=180;
								var dist=Math.floor(Math.sqrt((targX-origX)*(targX-origX)+(targY-origY)*(targY-origY)));
								origX+=2;
								origY-=18;
								//rot=-(Math.PI/2)*(me.id%4);
								Game.Background.translate(origX,origY);
								Game.Background.rotate(rot);
								//Game.Background.drawImage(Pic('linkPulse.png'),-s/2,-s/2,s,s);
								Game.Background.fillPattern(Pic('linkPulse.png'),0,-4,dist,8,32,8);
								Game.Background.rotate(-rot);
								Game.Background.translate(-origX,-origY);
							}
						}
					}
					Game.Background.restore();
					Timer.track('links');
					*/
					
					//Game.Background.drawImage(Pic('shadedBorders.png'),0,0,w,h);
					//Timer.track('border');
				}
			}
			else
			{
			
				var goodBuff=0;
				var badBuff=0;
				for (var i in Game.buffs)
				{
					if (Game.buffs[i].aura==1) goodBuff=1;
					if (Game.buffs[i].aura==2) badBuff=1;
				}
				
				if (Game.drawT%5==0)
				{
					Game.defaultBg='bgBlue';
					Game.bgR=0;
					
					if (Game.season=='fools') Game.defaultBg='bgMoney';
					if (Game.elderWrathD<1)
					{
						Game.bgR=0;
						Game.bg=Game.defaultBg;
						Game.bgFade=Game.defaultBg;
					}
					else if (Game.elderWrathD>=1 && Game.elderWrathD<2)
					{
						Game.bgR=(Game.elderWrathD-1)/1;
						Game.bg=Game.defaultBg;
						Game.bgFade='grandmas1';
					}
					else if (Game.elderWrathD>=2 && Game.elderWrathD<3)
					{
						Game.bgR=(Game.elderWrathD-2)/1;
						Game.bg='grandmas1';
						Game.bgFade='grandmas2';
					}
					else if (Game.elderWrathD>=3)// && Game.elderWrathD<4)
					{
						Game.bgR=(Game.elderWrathD-3)/1;
						Game.bg='grandmas2';
						Game.bgFade='grandmas3';
					}
					
					if (Game.bgType!=0 && Game.ascensionMode!=1)
					{
						Game.bgR=0;
						Game.bg=Game.BGsByChoice[Game.bgType].pic;
						Game.bgFade=Game.bg;
					}
					
					Game.Background.fillPattern(Pic(Game.bg+'.jpg'),0,0,Game.Background.canvas.width,Game.Background.canvas.height,512,512,0,0);
					if (Game.bgR>0)
					{
						Game.Background.globalAlpha=Game.bgR;
						Game.Background.fillPattern(Pic(Game.bgFade+'.jpg'),0,0,Game.Background.canvas.width,Game.Background.canvas.height,512,512,0,0);
					}
					Game.Background.globalAlpha=1;
					Game.Background.drawImage(Pic('shadedBordersSoft.png'),0,0,Game.Background.canvas.width,Game.Background.canvas.height);
					
				}
				Timer.track('window background');
				
				//clear
				Game.LeftBackground.clearRect(0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
				/*if (Game.AscendTimer<Game.AscendBreakpoint) Game.LeftBackground.clearRect(0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
				else
				{
					Game.LeftBackground.globalAlpha=0.05;
					Game.LeftBackground.fillStyle='#000';
					Game.LeftBackground.fillRect(0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
					Game.LeftBackground.globalAlpha=1;
					OldCanvasDrawImage.apply(Game.LeftBackground,[Game.LeftBackground.canvas,Math.random()*4-2,Math.random()*4-2-4]);
					Game.LeftBackground.globalAlpha=1;
				}*/
				Timer.clean();
				
				var showDragon=0;
				if (Game.hasBuff('Dragonflight') || Game.hasBuff('Dragon Harvest')) showDragon=1;
				
				Game.cookieOriginX=Math.floor(Game.LeftBackground.canvas.width/2);
				Game.cookieOriginY=Math.floor(Game.LeftBackground.canvas.height*0.4);
				
				if (Game.AscendTimer==0)
				{	
					if (Game.prefs.particles)
					{
						//falling cookies
						var pic='';
						var opacity=1;
						if (Game.elderWrathD<=1.5)
						{
							if (Game.cookiesPs>=1000) pic='cookieShower3.png';
							else if (Game.cookiesPs>=500) pic='cookieShower2.png';
							else if (Game.cookiesPs>=50) pic='cookieShower1.png';
							else pic='';
						}
						if (pic!='')
						{
							if (Game.elderWrathD>=1) opacity=1-((Math.min(Game.elderWrathD,1.5)-1)/0.5);
							Game.LeftBackground.globalAlpha=opacity;
							var y=(Math.floor(Game.T*2)%512);
							Game.LeftBackground.fillPattern(Pic(pic),0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height+512,512,512,0,y);
							Game.LeftBackground.globalAlpha=1;
						}
						//snow
						if (Game.season=='christmas')
						{
							var y=(Math.floor(Game.T*2.5)%512);
							Game.LeftBackground.globalAlpha=0.75;
							Game.LeftBackground.globalCompositeOperation='lighter';
							Game.LeftBackground.fillPattern(Pic('snow2.jpg'),0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height+512,512,512,0,y);
							Game.LeftBackground.globalCompositeOperation='source-over';
							Game.LeftBackground.globalAlpha=1;
						}
						//hearts
						if (Game.season=='valentines')
						{
							var y=(Math.floor(Game.T*2.5)%512);
							Game.LeftBackground.globalAlpha=1;
							Game.LeftBackground.fillPattern(Pic('heartStorm.png'),0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height+512,512,512,0,y);
							Game.LeftBackground.globalAlpha=1;
						}
						Timer.track('left background');
						
						Game.particlesDraw(0);
						Game.LeftBackground.globalAlpha=1;
						Timer.track('particles');
						
						//big cookie shine
						var s=512;
						
						var x=Game.cookieOriginX;
						var y=Game.cookieOriginY;
						
						var r=Math.floor((Game.T*0.5)%360);
						Game.LeftBackground.save();
						Game.LeftBackground.translate(x,y);
						Game.LeftBackground.rotate((r/360)*Math.PI*2);
						var alphaMult=1;
						if (Game.bgType==2 || Game.bgType==4) alphaMult=0.5;
						var pic='shine.png';
						if (goodBuff) {pic='shineGold.png';alphaMult=1;}
						else if (badBuff) {pic='shineRed.png';alphaMult=1;}
						if (goodBuff && Game.prefs.fancy) Game.LeftBackground.globalCompositeOperation='lighter';
						Game.LeftBackground.globalAlpha=0.5*alphaMult;
						Game.LeftBackground.drawImage(Pic(pic),-s/2,-s/2,s,s);
						Game.LeftBackground.rotate((-r*2/360)*Math.PI*2);
						Game.LeftBackground.globalAlpha=0.25*alphaMult;
						Game.LeftBackground.drawImage(Pic(pic),-s/2,-s/2,s,s);
						Game.LeftBackground.restore();
						Timer.track('shine');
				
						if (Game.ReincarnateTimer>0)
						{
							Game.LeftBackground.globalAlpha=1-Game.ReincarnateTimer/Game.ReincarnateDuration;
							Game.LeftBackground.fillStyle='#000';
							Game.LeftBackground.fillRect(0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
							Game.LeftBackground.globalAlpha=1;
						}
						
						if (showDragon)
						{
							//big dragon
							var s=300*2*(1+Math.sin(Game.T*0.013)*0.1);
							var x=Game.cookieOriginX-s/2;
							var y=Game.cookieOriginY-s/(1.4+0.2*Math.sin(Game.T*0.01));
							Game.LeftBackground.drawImage(Pic('dragonBG.png'),x,y,s,s);
						}
						
						//big cookie
						if (false)//don't do that
						{
							Game.LeftBackground.globalAlpha=1;
							var amount=Math.floor(Game.cookies).toString();
							var digits=amount.length;
							var space=0;
							for (var i=0;i<digits;i++)
							{
								var s=16*(digits-i);
								var num=parseInt(amount[i]);
								if (i>0) space-=s*(1-num/10)/2;
								if (i==0 && num>1) space+=s*0.1;
								for (var ii=0;ii<num;ii++)
								{
									var x=Game.cookieOriginX;
									var y=Game.cookieOriginY;
									var spin=Game.T*(0.005+i*0.001)+i+(ii/num)*Math.PI*2;
									x+=Math.sin(spin)*space;
									y+=Math.cos(spin)*space;
									Game.LeftBackground.drawImage(Pic('perfectCookie.png'),x-s/2,y-s/2,s,s);
								}
								space+=s/2;
							}
						}
						else
						{
							Game.LeftBackground.globalAlpha=1;
							var s=256*Game.BigCookieSize;
							var x=Game.cookieOriginX;
							var y=Game.cookieOriginY;
							Game.LeftBackground.save();
							Game.LeftBackground.translate(x,y);
							if (Game.season=='easter')
							{
								var nestW=304*0.98*Game.BigCookieSize;
								var nestH=161*0.98*Game.BigCookieSize;
								Game.LeftBackground.drawImage(Pic('nest.png'),-nestW/2,-nestH/2+130,nestW,nestH);
							}
							//Game.LeftBackground.rotate(((Game.startDate%360)/360)*Math.PI*2);
							Game.LeftBackground.drawImage(Pic('perfectCookie.png'),-s/2,-s/2,s,s);
							
							if (goodBuff && Game.prefs.particles)//sparkle
							{
								Game.LeftBackground.globalCompositeOperation='lighter';
								for (var i=0;i<1;i++)
								{
									Game.LeftBackground.globalAlpha=Math.random()*0.65+0.1;
									var size=Math.random()*30+5;
									var a=Math.random()*Math.PI*2;
									var d=s*0.9*Math.random()/2;
									Game.LeftBackground.drawImage(Pic('glint.jpg'),-size/2+Math.sin(a)*d,-size/2+Math.cos(a)*d,size,size);
								}
							}
							
							Game.LeftBackground.restore();
							Timer.track('big cookie');
						}
					}
					else//no particles
					{
						//big cookie shine
						var s=512;
						var x=Game.cookieOriginX-s/2;
						var y=Game.cookieOriginY-s/2;
						Game.LeftBackground.globalAlpha=0.5;
						Game.LeftBackground.drawImage(Pic('shine.png'),x,y,s,s);
						
						if (showDragon)
						{
							//big dragon
							var s=300*2*(1+Math.sin(Game.T*0.013)*0.1);
							var x=Game.cookieOriginX-s/2;
							var y=Game.cookieOriginY-s/(1.4+0.2*Math.sin(Game.T*0.01));
							Game.LeftBackground.drawImage(Pic('dragonBG.png'),x,y,s,s);
						}
					
						//big cookie
						Game.LeftBackground.globalAlpha=1;
						var s=256*Game.BigCookieSize;
						var x=Game.cookieOriginX-s/2;
						var y=Game.cookieOriginY-s/2;
						Game.LeftBackground.drawImage(Pic('perfectCookie.png'),x,y,s,s);
					}
					
					//cursors
					if (Game.prefs.cursors)
					{
						if (showDragon) Game.LeftBackground.globalAlpha=0.25;
						var amount=Game.Objects['Cursor'].amount;
						var spe=-1;
						for (var i=0;i<amount;i++)
						{
							var n=Math.floor(i/50);
							var a=((i+0.5*n)%50)/50;
							var w=0;
							var r=(-(a)*360);
							if (Game.prefs.fancy) w=(Math.sin(Game.T*0.025+(((i+n*12)%25)/25)*Math.PI*2));
							if (w>0.997) w=1.5;
							else if (w>0.994) w=0.5;
							else w=0;
							w*=-4;
							if (Game.prefs.fancy) w+=Math.sin((n+Game.T*0.01)*Math.PI/2)*4;
							if (Game.prefs.fancy) r=(-(a)*360-Game.T*0.1);
							var x=0;
							var y=(140/* *Game.BigCookieSize*/+n*16+w)-16;
							
							
							Game.LeftBackground.save();
							Game.LeftBackground.translate(Game.cookieOriginX,Game.cookieOriginY);
							Game.LeftBackground.rotate((r/360)*Math.PI*2);
							Game.LeftBackground.drawImage(Pic('cursor.png'),32*(i==spe),0,32,32,x,y,32,32);
							Game.LeftBackground.restore();
							
							/*if (i==spe)
							{
								y+=16;
								x=Game.cookieOriginX+Math.sin(-((r-5)/360)*Math.PI*2)*y;
								y=Game.cookieOriginY+Math.cos(-((r-5)/360)*Math.PI*2)*y;
								if (Game.CanClick && Game.LeftBackground && Math.abs(Game.mouseX-x)<16 && Math.abs(Game.mouseY-y)<16) Game.mousePointer=1;
							}*/
						}
						Timer.track('cursors');
					}
				}
				else
				{
					var tBase=Math.max(0,(Game.AscendTimer-Game.AscendBreakpoint)/(Game.AscendDuration-Game.AscendBreakpoint));
					//big crumbling cookie
					//var t=(3*Math.pow(tBase,2)-2*Math.pow(tBase,3));//S curve
					var t=Math.pow(tBase,0.5);
					
					var shake=0;
					if (Game.AscendTimer<Game.AscendBreakpoint) {shake=Game.AscendTimer/Game.AscendBreakpoint;}
					//else {shake=1-t;}

					Game.LeftBackground.globalAlpha=1;
					
					var x=Game.cookieOriginX;
					var y=Game.cookieOriginY;
					
					x+=(Math.random()*2-1)*10*shake;
					y+=(Math.random()*2-1)*10*shake;
					
					var s=1;
					if (tBase>0)
					{
						Game.LeftBackground.save();
						Game.LeftBackground.globalAlpha=1-Math.pow(t,0.5);
						Game.LeftBackground.translate(x,y);
						Game.LeftBackground.globalCompositeOperation='lighter';
						Game.LeftBackground.rotate(Game.T*0.007);
						s=0.5+Math.pow(tBase,0.6)*1;
						var s2=(600)*s;
						Game.LeftBackground.drawImage(Pic('heavenRing1.jpg'),-s2/2,-s2/2,s2,s2);
						Game.LeftBackground.rotate(-Game.T*0.002);
						s=0.5+Math.pow(1-tBase,0.4)*1;
						s2=(600)*s;
						Game.LeftBackground.drawImage(Pic('heavenRing2.jpg'),-s2/2,-s2/2,s2,s2);
						Game.LeftBackground.restore();
					}
					
					s=256;//*Game.BigCookieSize;
					
					Game.LeftBackground.save();
					Game.LeftBackground.translate(x,y);
					Game.LeftBackground.rotate((t*(-0.1))*Math.PI*2);
					
					var chunks={0:7,1:6,2:3,3:2,4:8,5:1,6:9,7:5,8:0,9:4};
					s*=t/2+1;
					/*Game.LeftBackground.globalAlpha=(1-t)*0.33;
					for (var i=0;i<10;i++)
					{
						var d=(t-0.2)*(80+((i+2)%3)*40);
						Game.LeftBackground.drawImage(Pic('brokenCookie.png'),256*(chunks[i]),0,256,256,-s/2+Math.sin(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d,-s/2+Math.cos(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d,s,s);
					}
					Game.LeftBackground.globalAlpha=(1-t)*0.66;
					for (var i=0;i<10;i++)
					{
						var d=(t-0.1)*(80+((i+2)%3)*40);
						Game.LeftBackground.drawImage(Pic('brokenCookie.png'),256*(chunks[i]),0,256,256,-s/2+Math.sin(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d,-s/2+Math.cos(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d,s,s);
					}*/
					Game.LeftBackground.globalAlpha=1-t;
					for (var i=0;i<10;i++)
					{
						var d=(t)*(80+((i+2)%3)*40);
						var x2=(Math.random()*2-1)*5*shake;
						var y2=(Math.random()*2-1)*5*shake;
						Game.LeftBackground.drawImage(Pic('brokenCookie.png'),256*(chunks[i]),0,256,256,-s/2+Math.sin(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d+x2,-s/2+Math.cos(-(((chunks[i]+4)%10)/10)*Math.PI*2)*d+y2,s,s);
					}
					var brokenHalo=1-Math.min(t/(1/3),1/3)*3;
					if (Game.AscendTimer<Game.AscendBreakpoint) brokenHalo=Game.AscendTimer/Game.AscendBreakpoint;
					Game.LeftBackground.globalAlpha=brokenHalo;
					Game.LeftBackground.drawImage(Pic('brokenCookieHalo.png'),-s/1.3333,-s/1.3333,s*1.5,s*1.5);
					
					Game.LeftBackground.restore();
					
					//flares
					var n=9;
					var t=Game.AscendTimer/Game.AscendBreakpoint;
					if (Game.AscendTimer<Game.AscendBreakpoint)
					{
						Game.LeftBackground.save();
						Game.LeftBackground.translate(x,y);
						for (var i=0;i<n;i++)
						{
							if (Math.floor(t/3*n*3+i*2.7)%2)
							{
								var t2=Math.pow((t/3*n*3+i*2.7)%1,1.5);
								Game.LeftBackground.globalAlpha=(1-t)*(Game.drawT%2==0?0.5:1);
								var sw=(1-t2*0.5)*96;
								var sh=(0.5+t2*1.5)*96;
								Game.LeftBackground.drawImage(Pic('shineSpoke.png'),-sw/2,-sh-32-(1-t2)*256,sw,sh);
							}
							Game.LeftBackground.rotate(Math.PI*2/n);
						}
						Game.LeftBackground.restore();
					}
					
					
					//flash at breakpoint
					if (tBase<0.1 && tBase>0)
					{
						Game.LeftBackground.globalAlpha=1-tBase/0.1;
						Game.LeftBackground.fillStyle='#fff';
						Game.LeftBackground.fillRect(0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
						Game.LeftBackground.globalAlpha=1;
					}
					if (tBase>0.8)
					{
						Game.LeftBackground.globalAlpha=(tBase-0.8)/0.2;
						Game.LeftBackground.fillStyle='#000';
						Game.LeftBackground.fillRect(0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
						Game.LeftBackground.globalAlpha=1;
					}
				}
				
				//milk and milk accessories
				if (Game.prefs.milk)
				{
					var width=Game.LeftBackground.canvas.width;
					var height=Game.LeftBackground.canvas.height;
					var x=Math.floor((Game.T*2-(Game.milkH-Game.milkHd)*2000+480*2)%480);//Math.floor((Game.T*2+Math.sin(Game.T*0.1)*2+Math.sin(Game.T*0.03)*2-(Game.milkH-Game.milkHd)*2000+480*2)%480);
					var y=(Game.milkHd)*height;//(((Game.milkHd)*Game.LeftBackground.canvas.height)*(1+0.05*(Math.sin(Game.T*0.017)/2+0.5)));
					var a=1;
					if (Game.AscendTimer>0)
					{
						y*=1-Math.pow((Game.AscendTimer/Game.AscendBreakpoint),2)*2;
						a*=1-Math.pow((Game.AscendTimer/Game.AscendBreakpoint),2)*2;
					}
					else if (Game.ReincarnateTimer>0)
					{
						y*=1-Math.pow(1-(Game.ReincarnateTimer/Game.ReincarnateDuration),2)*2;
						a*=1-Math.pow(1-(Game.ReincarnateTimer/Game.ReincarnateDuration),2)*2;
					}
					
					if (Game.TOYS)
					{
						//golly
						if (!Game.Toy)
						{
							Game.toys=[];
							Game.toysType=choose([1,2]);
							Game.Toy=function(x,y)
							{
								this.id=Game.toys.length;
								this.x=x;
								this.y=y;
								this.xd=Math.random()*10-5;
								this.yd=Math.random()*10-5;
								this.r=Math.random()*Math.PI*2;
									this.rd=Math.random()*0.1-0.05;
									var v=Math.random();var a=0.5;var b=0.5;
									if (v<=a) v=b-b*Math.pow(1-v/a,3); else v=b+(1-b)*Math.pow((v-a)/(1-a),3);
								this.s=(Game.toysType==1?64:48)*(0.1+v*1.9);
								if (Game.toysType==2) this.s=(this.id%10==1)?96:48;
								this.st=this.s;this.s=0;
									var cookies=[[10,0]];
									for (var i in Game.Upgrades)
									{
										var cookie=Game.Upgrades[i];
										if (cookie.bought>0 && cookie.pool=='cookie') cookies.push(cookie.icon);
									}
								this.icon=choose(cookies);
								this.dragged=false;
								this.l=document.createElement('div');
								this.l.innerHTML=this.id;
								this.l.style.cssText='cursor:pointer;border-radius:'+(this.s/2)+'px;opacity:0;width:'+this.s+'px;height:'+this.s+'px;background:#999;position:absolute;left:0px;top:0px;z-index:10000000;transform:translate(-1000px,-1000px);';
								l('sectionLeft').appendChild(this.l);
								AddEvent(this.l,'mousedown',function(what){return function(){what.dragged=true;};}(this));
								AddEvent(this.l,'mouseup',function(what){return function(){what.dragged=false;};}(this));
								Game.toys.push(this);
								return this;
							}
							for (var i=0;i<Math.floor(Math.random()*15+(Game.toysType==1?5:30));i++)
							{
								new Game.Toy(Math.random()*width,Math.random()*height*0.3);
							}
						}
						Game.LeftBackground.globalAlpha=0.5;
						for (var i in Game.toys)
						{
							var me=Game.toys[i];
							Game.LeftBackground.save();
							Game.LeftBackground.translate(me.x,me.y);
							Game.LeftBackground.rotate(me.r);
							if (Game.toysType==1) Game.LeftBackground.drawImage(Pic('smallCookies.png'),(me.id%8)*64,0,64,64,-me.s/2,-me.s/2,me.s,me.s);
							else Game.LeftBackground.drawImage(Pic('icons.png'),me.icon[0]*48,me.icon[1]*48,48,48,-me.s/2,-me.s/2,me.s,me.s);
							Game.LeftBackground.restore();
						}
						Game.LeftBackground.globalAlpha=1;
						for (var i in Game.toys)
						{
							var me=Game.toys[i];
							//psst... not real physics
							for (var ii in Game.toys)
							{
								var it=Game.toys[ii];
								if (it.id!=me.id)
								{
									var x1=me.x+me.xd;
									var y1=me.y+me.yd;
									var x2=it.x+it.xd;
									var y2=it.y+it.yd;
									var dist=Math.sqrt(Math.pow((x1-x2),2)+Math.pow((y1-y2),2))/(me.s/2+it.s/2);
									if (dist<(Game.toysType==1?0.95:0.75))
									{
										var angle=Math.atan2(y1-y2,x1-x2);
										var v1=Math.sqrt(Math.pow((me.xd),2)+Math.pow((me.yd),2));
										var v2=Math.sqrt(Math.pow((it.xd),2)+Math.pow((it.yd),2));
										var v=((v1+v2)/2+dist)*0.75;
										var ratio=it.s/me.s;
										me.xd+=Math.sin(-angle+Math.PI/2)*v*(ratio);
										me.yd+=Math.cos(-angle+Math.PI/2)*v*(ratio);
										it.xd+=Math.sin(-angle-Math.PI/2)*v*(1/ratio);
										it.yd+=Math.cos(-angle-Math.PI/2)*v*(1/ratio);
										me.rd+=(Math.random()*1-0.5)*0.1*(ratio);
										it.rd+=(Math.random()*1-0.5)*0.1*(1/ratio);
										me.rd*=Math.min(1,v);
										it.rd*=Math.min(1,v);
									}
								}
							}
							if (me.y>=height-(Game.milkHd)*height+8)
							{
								me.xd*=0.85;
								me.yd*=0.85;
								me.rd*=0.85;
								me.yd-=1;
								me.xd+=(Math.random()*1-0.5)*0.3;
								me.yd+=(Math.random()*1-0.5)*0.05;
								me.rd+=(Math.random()*1-0.5)*0.02;
							}
							else
							{
								me.xd*=0.99;
								me.rd*=0.99;
								me.yd+=1;
							}
							me.yd*=(Math.min(1,Math.abs(me.y-(height-(Game.milkHd)*height)/16)));
							me.rd+=me.xd*0.01/(me.s/(Game.toysType==1?64:48));
							if (me.x<me.s/2 && me.xd<0) me.xd=Math.max(0.1,-me.xd*0.6); else if (me.x<me.s/2) {me.xd=0;me.x=me.s/2;}
							if (me.x>width-me.s/2 && me.xd>0) me.xd=Math.min(-0.1,-me.xd*0.6); else if (me.x>width-me.s/2) {me.xd=0;me.x=width-me.s/2;}
							me.xd=Math.min(Math.max(me.xd,-30),30);
							me.yd=Math.min(Math.max(me.yd,-30),30);
							me.rd=Math.min(Math.max(me.rd,-0.5),0.5);
							me.x+=me.xd;
							me.y+=me.yd;
							me.r+=me.rd;
							me.r=me.r%(Math.PI*2);
							me.s+=(me.st-me.s)*0.5;
							if (Game.toysType==2 && !me.dragged && Math.random()<0.003) me.st=choose([48,48,48,48,96]);
							if (me.dragged)
							{
								me.x=Game.mouseX;
								me.y=Game.mouseY;
								me.xd+=((Game.mouseX-Game.mouseX2)*3-me.xd)*0.5;
								me.yd+=((Game.mouseY-Game.mouseY2)*3-me.yd)*0.5
								me.l.style.transform='translate('+(me.x-me.s/2)+'px,'+(me.y-me.s/2)+'px) scale(50)';
							}
							else me.l.style.transform='translate('+(me.x-me.s/2)+'px,'+(me.y-me.s/2)+'px)';
							me.l.style.width=me.s+'px';
							me.l.style.height=me.s+'px';
							Game.LeftBackground.save();
							Game.LeftBackground.translate(me.x,me.y);
							Game.LeftBackground.rotate(me.r);
							if (Game.toysType==1) Game.LeftBackground.drawImage(Pic('smallCookies.png'),(me.id%8)*64,0,64,64,-me.s/2,-me.s/2,me.s,me.s);
							else Game.LeftBackground.drawImage(Pic('icons.png'),me.icon[0]*48,me.icon[1]*48,48,48,-me.s/2,-me.s/2,me.s,me.s);
							Game.LeftBackground.restore();
						}
					}
					
					var pic=Game.Milk.pic;
					if (Game.milkType!=0 && Game.ascensionMode!=1) pic=Game.MilksByChoice[Game.milkType].pic;
					Game.LeftBackground.globalAlpha=0.9*a;
					Game.LeftBackground.fillPattern(Pic(pic+'.png'),0,height-y,width+480,1,480,480,x,0);
					
					Game.LeftBackground.fillStyle='#000';
					Game.LeftBackground.fillRect(0,height-y+480,width,Math.max(0,(y-480)));
					Game.LeftBackground.globalAlpha=1;
					
					Timer.track('milk');
				}
				
				if (Game.AscendTimer>0)
				{
					Game.LeftBackground.drawImage(Pic('shadedBordersSoft.png'),0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
				}
				
				if (Game.AscendTimer==0)
				{
					Game.DrawWrinklers();Timer.track('wrinklers');
					Game.DrawSpecial();Timer.track('evolvables');
					
					Game.particlesDraw(2);Timer.track('text particles');
					
					//shiny border during frenzies etc
					Game.LeftBackground.globalAlpha=1;
					var borders='shadedBordersSoft.png';
					if (goodBuff) borders='shadedBordersGold.png';
					else if (badBuff) borders='shadedBordersRed.png';
					if (goodBuff && Game.prefs.fancy) Game.LeftBackground.globalCompositeOperation='lighter';
					Game.LeftBackground.drawImage(Pic(borders),0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
					if (goodBuff && Game.prefs.fancy) Game.LeftBackground.globalCompositeOperation='source-over';
				}
			}
		};
		
		
		/*=====================================================================================
		INITIALIZATION END; GAME READY TO LAUNCH
		=======================================================================================*/
		
		Game.killShimmers();
		
		//booooo
		Game.RuinTheFun=function(silent)
		{
			Game.popups=0;
			var leftout=['Magic shenanigans','Occult obstruction'];
			for (var i in Game.Upgrades)
			{
				if (Game.Upgrades[i].pool=='toggle' || leftout.indexOf(Game.Upgrades[i].name)!=-1) {}
				else Game.Upgrades[i].earn();
			}
			for (var i in Game.Achievements)
			{
				if (Game.Achievements[i].pool!='dungeon') Game.Win(Game.Achievements[i].name);
			}
			Game.Earn(999999999999999999999999999999);
			Game.MaxSpecials();
			Game.nextResearch=0;
			Game.researchT=-1;
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			Game.popups=1;
			if (!silent)
			{
				if (Game.prefs.popups) Game.Popup('Thou doth ruineth the fun!');
				else Game.Notify('Thou doth ruineth the fun!','You\'re free. Free at last.',[11,5]);
			}
		}
		
		Game.SetAllUpgrades=function(on)
		{
			Game.popups=0;
			var leftout=['Magic shenanigans','Occult obstruction'];
			for (var i in Game.Upgrades)
			{
				if (on && (Game.Upgrades[i].pool=='toggle' || leftout.indexOf(Game.Upgrades[i].name)!=-1)) {}
				else if (on) Game.Upgrades[i].earn();
				else if (!on) Game.Upgrades[i].lose();
			}
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			Game.popups=1;
		}
		Game.SetAllAchievs=function(on)
		{
			Game.popups=0;
			for (var i in Game.Achievements)
			{
				if (on) Game.Win(Game.Achievements[i].name);
				else if (!on) Game.RemoveAchiev(Game.Achievements[i].name);
			}
			Game.recalculateGains=1;
			Game.popups=1;
		}
		Game.GetAllDebugs=function()
		{
			Game.popups=0;
			for (var i in Game.Upgrades)
			{
				if (Game.Upgrades[i].pool=='debug') Game.Upgrades[i].earn();
			}
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
			Game.popups=1;
		}
		Game.MaxSpecials=function()
		{
			Game.dragonLevel=Game.dragonLevels.length-1;
			Game.santaLevel=Game.santaLevels.length-1;
		}
		
		Game.SesameReset=function()
		{
			var name=Game.bakeryName;
			Game.HardReset(2);
			Game.bakeryName=name;
			Game.bakeryNameRefresh();
			Game.Achievements['Cheated cookies taste awful'].won=1;
		}
		
		Game.debugTimersOn=0;
		Game.sesame=0;
		Game.OpenSesame=function()
		{
			var str='';
			str+='<div class="icon" style="position:absolute;left:-9px;top:-6px;background-position:'+(-10*48)+'px '+(-6*48)+'px;"></div>';
			str+='<div style="position:absolute;left:0px;top:0px;z-index:10;font-size:10px;background:#000;padding:1px;" id="fpsCounter"></div>';
			
			str+='<div id="devConsoleContent">';
			str+='<div class="title" style="font-size:14px;margin:6px;">Dev tools</div>';
			
			str+='<a class="option neato" '+Game.clickStr+'="Game.Ascend(1);">Ascend</a>';
			str+='<div class="line"></div>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.cookies*=10;Game.cookiesEarned*=10;">x10</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.cookies/=10;Game.cookiesEarned/=10;">/10</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.cookies*=1000;Game.cookiesEarned*=1000;">x1k</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.cookies/=1000;Game.cookiesEarned/=1000;">/1k</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="for (var i in Game.Objects){Game.Objects[i].buy(100);}">Buy 100 of all</a>';//for (var n=0;n<100;n++){for (var i in Game.Objects){Game.Objects[i].buy(1);}}
			str+='<a class="option neato" '+Game.clickStr+'="for (var i in Game.Objects){Game.Objects[i].sell(100);}">Sell 100 of all</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.gainLumps(10);">+10 lumps</a>';
			str+='<a class="option neato" '+Game.clickStr+'="for (var i in Game.Objects){Game.Objects[i].level=0;Game.Objects[i].onMinigame=false;Game.Objects[i].refresh();}Game.recalculateGains=1;">Reset levels</a>';
			str+='<div class="line"></div>';
			str+='<a class="option warning" '+Game.clickStr+'="Game.RuinTheFun(1);">Ruin The Fun</a>';
			str+='<a class="option warning" '+Game.clickStr+'="Game.SesameReset();">Wipe</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.GetAllDebugs();">All debugs</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.debugTimersOn=!Game.debugTimersOn;Game.OpenSesame();">Timers '+(Game.debugTimersOn?'On':'Off')+'</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.SetAllUpgrades(0);">No upgrades</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.SetAllUpgrades(1);">All upgrades</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.SetAllAchievs(0);">No achievs</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.SetAllAchievs(1);">All achievs</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.santaLevel=0;Game.dragonLevel=0;">Reset specials</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.MaxSpecials();">Max specials</a><br>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.EditAscend();">'+(Game.DebuggingPrestige?'Exit Ascend Edit':'Ascend Edit')+'</a>';
			str+='<a class="option neato" '+Game.clickStr+'="Game.DebugUpgradeCpS();">Debug upgrades CpS</a>';
			str+='<div class="line"></div>';
			for (var i=0;i<Game.goldenCookieChoices.length/2;i++)
			{
				str+='<a class="option neato" '+Game.clickStr+'="var newShimmer=new Game.shimmer(\'golden\');newShimmer.force=\''+Game.goldenCookieChoices[i*2+1]+'\';">'+Game.goldenCookieChoices[i*2]+'</a>';
				//str+='<a class="option neato" '+Game.clickStr+'="Game.goldenCookie.force=\''+Game.goldenCookie.choices[i*2+1]+'\';Game.goldenCookie.spawn();">'+Game.goldenCookie.choices[i*2]+'</a>';
				//str+='<a class="option neato" '+Game.clickStr+'="Game.goldenCookie.click(0,\''+Game.goldenCookie.choices[i*2+1]+'\');">'+Game.goldenCookie.choices[i*2]+'</a>';
			}
			str+='</div>';
			
			l('devConsole').innerHTML=str;
			l('debug').style.display='block';
			Game.sesame=1;
			Game.Achievements['Cheated cookies taste awful'].won=1;
		}
		
		Game.EditAscend=function()
		{
			if (!Game.DebuggingPrestige)
			{
				Game.DebuggingPrestige=true;
				Game.AscendTimer=0;
				Game.OnAscend=1;
				Game.removeClass('ascendIntro');
				Game.addClass('ascending');
			}
			else
			{
				Game.DebuggingPrestige=false;
			}
			Game.BuildAscendTree();
			Game.OpenSesame();
		}
		
		//experimental debugging function that cycles through every owned upgrade, turns it off and on, and lists how much each upgrade is participating to CpS
		Game.debuggedUpgradeCpS=[];
		Game.debuggedUpgradeCpClick=[];
		Game.debugColors=['#322','#411','#600','#900','#f30','#f90','#ff0','#9f0','#0f9','#09f','#90f'];
		Game.DebugUpgradeCpS=function()
		{
			Game.CalculateGains();
			Game.debuggedUpgradeCpS=[];
			Game.debuggedUpgradeCpClick=[];
			var CpS=Game.cookiesPs;
			var CpClick=Game.computedMouseCps;
			for (var i in Game.Upgrades)
			{
				var me=Game.Upgrades[i];
				if (me.bought)
				{
					me.bought=0;
					Game.CalculateGains();
					//Game.debuggedUpgradeCpS[me.name]=CpS-Game.cookiesPs;
					Game.debuggedUpgradeCpS[me.name]=(CpS/(Game.cookiesPs||1)-1);
					Game.debuggedUpgradeCpClick[me.name]=(CpClick/(Game.computedMouseCps||1)-1);
					me.bought=1;
				}
			}
			Game.CalculateGains();
		}
		
		
		
		
		for (var i in Game.customInit) {Game.customInit[i]();}
		
		if (!Game.LoadSave())
		{//try to load the save when we open the page. if this fails, try to brute-force it half a second later
			setTimeout(function(){
				var local=Game.localStorageGet(Game.SaveTo);
				Game.LoadSave(local);
			},500);
		}
		
		Game.ready=1;
		l('javascriptError').innerHTML='';
		l('javascriptError').style.display='none';
		Game.Loop();
		Game.Draw();
	}
	/*=====================================================================================
	LOGIC
	=======================================================================================*/
	Game.Logic=function()
	{
		Game.bounds=Game.l.getBoundingClientRect();
		
		if (!Game.OnAscend && Game.AscendTimer==0)
		{
			for (var i in Game.Objects)
			{
				if (Game.Objects[i].eachFrame) Game.Objects[i].eachFrame();
			}
			Game.UpdateSpecial();
			Game.UpdateGrandmapocalypse();
			
			//these are kinda fun
			//if (Game.BigCookieState==2 && !Game.promptOn && Game.Scroll!=0) Game.ClickCookie();
			//if (Game.BigCookieState==1 && !Game.promptOn) Game.ClickCookie();
			
			//handle graphic stuff
			if (Game.prefs.wobbly)
			{
				if (Game.BigCookieState==1) Game.BigCookieSizeT=0.98;
				else if (Game.BigCookieState==2) Game.BigCookieSizeT=1.05;
				else Game.BigCookieSizeT=1;
				Game.BigCookieSizeD+=(Game.BigCookieSizeT-Game.BigCookieSize)*0.75;
				Game.BigCookieSizeD*=0.75;
				Game.BigCookieSize+=Game.BigCookieSizeD;
				Game.BigCookieSize=Math.max(0.1,Game.BigCookieSize);
			}
			else
			{
				if (Game.BigCookieState==1) Game.BigCookieSize+=(0.98-Game.BigCookieSize)*0.5;
				else if (Game.BigCookieState==2) Game.BigCookieSize+=(1.05-Game.BigCookieSize)*0.5;
				else Game.BigCookieSize+=(1-Game.BigCookieSize)*0.5;
			}
			Game.particlesUpdate();
			
			if (Game.mousePointer) l('sectionLeft').style.cursor='pointer';
			else l('sectionLeft').style.cursor='auto';
			Game.mousePointer=0;
			
			//handle milk and milk accessories
			Game.milkProgress=Game.AchievementsOwned/25;
			if (Game.milkProgress>=0.5) Game.Unlock('Kitten helpers');
			if (Game.milkProgress>=1) Game.Unlock('Kitten workers');
			if (Game.milkProgress>=2) Game.Unlock('Kitten engineers');
			if (Game.milkProgress>=3) Game.Unlock('Kitten overseers');
			if (Game.milkProgress>=4) Game.Unlock('Kitten managers');
			if (Game.milkProgress>=5) Game.Unlock('Kitten accountants');
			if (Game.milkProgress>=6) Game.Unlock('Kitten specialists');
			if (Game.milkProgress>=7) Game.Unlock('Kitten experts');
			if (Game.milkProgress>=8) Game.Unlock('Kitten consultants');
			if (Game.milkProgress>=9) Game.Unlock('Kitten assistants to the regional manager');
			Game.milkH=Math.min(1,Game.milkProgress)*0.35;
			Game.milkHd+=(Game.milkH-Game.milkHd)*0.02;
			
			Game.Milk=Game.Milks[Math.min(Math.floor(Game.milkProgress),Game.Milks.length-1)];
			
			if (Game.autoclickerDetected>0) Game.autoclickerDetected--;
			
			//handle research
			if (Game.researchT>0)
			{
				Game.researchT--;
			}
			if (Game.researchT==0 && Game.nextResearch)
			{
				if (!Game.Has(Game.UpgradesById[Game.nextResearch].name))
				{
					Game.Unlock(Game.UpgradesById[Game.nextResearch].name);
					if (Game.prefs.popups) Game.Popup('Researched : '+Game.UpgradesById[Game.nextResearch].name);
					else Game.Notify('Research complete','You have discovered : <b>'+Game.UpgradesById[Game.nextResearch].name+'</b>.',Game.UpgradesById[Game.nextResearch].icon);
				}
				Game.nextResearch=0;
				Game.researchT=-1;
				Game.recalculateGains=1;
			}
			//handle seasons
			if (Game.seasonT>0)
			{
				Game.seasonT--;
			}
			if (Game.seasonT<=0 && Game.season!='' && Game.season!=Game.baseSeason && !Game.Has('Eternal seasons'))
			{
				var str=Game.seasons[Game.season].over;
				if (Game.prefs.popups) Game.Popup(str);
				else Game.Notify(str,'',Game.seasons[Game.season].triggerUpgrade.icon);
				if (Game.Has('Season switcher')) {Game.Unlock(Game.seasons[Game.season].trigger);Game.seasons[Game.season].triggerUpgrade.bought=0;}
				Game.season=Game.baseSeason;
				Game.seasonT=-1;
			}
			
			//press ctrl to bulk-buy 10, shift to bulk-buy 100
			if (!Game.promptOn)
			{
				if ((Game.keys[16] || Game.keys[17]) && !Game.buyBulkShortcut)
				{
					Game.buyBulkOld=Game.buyBulk;
					if (Game.keys[16]) Game.buyBulk=100;
					if (Game.keys[17]) Game.buyBulk=10;
					Game.buyBulkShortcut=1;
					Game.storeBulkButton(-1);
				}
			}
			if ((!Game.keys[16] && !Game.keys[17]) && Game.buyBulkShortcut)//release
			{
				Game.buyBulk=Game.buyBulkOld;
				Game.buyBulkShortcut=0;
				Game.storeBulkButton(-1);
			}
			
			//handle cookies
			if (Game.recalculateGains) Game.CalculateGains();
			Game.Earn(Game.cookiesPs/Game.fps);//add cookies per second
			
			//grow lumps
			Game.doLumps();
			
			//minigames
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				if (Game.isMinigameReady(me) && me.minigame.logic && Game.ascensionMode!=1) me.minigame.logic();
			}
			
			if (Game.specialTab!='' && Game.T%(Game.fps*3)==0) Game.ToggleSpecialMenu(1);
			
			//wrinklers
			if (Game.cpsSucked>0)
			{
				Game.Dissolve((Game.cookiesPs/Game.fps)*Game.cpsSucked);
				Game.cookiesSucked+=((Game.cookiesPs/Game.fps)*Game.cpsSucked);
				//should be using one of the following, but I'm not sure what I'm using this stat for anymore
				//Game.cookiesSucked=Game.wrinklers.reduce(function(s,w){return s+w.sucked;},0);
				//for (var i in Game.wrinklers) {Game.cookiesSucked+=Game.wrinklers[i].sucked;}
			}
			
			//var cps=Game.cookiesPs+Game.cookies*0.01;//exponential cookies
			//Game.Earn(cps/Game.fps);//add cookies per second
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.totalCookies+=(me.storedTotalCps*Game.globalCpsMult)/Game.fps;
			}
			if (Game.cookies && Game.T%Math.ceil(Game.fps/Math.min(10,Game.cookiesPs))==0 && Game.prefs.particles) Game.particleAdd();//cookie shower
			
			if (Game.T%(Game.fps*10)==0) Game.recalculateGains=1;//recalculate CpS every 10 seconds (for dynamic boosts such as Century egg)
			
			/*=====================================================================================
			UNLOCKING STUFF
			=======================================================================================*/
			if (Game.T%(Game.fps)==0 && Math.random()<1/500000) Game.Win('Just plain lucky');//1 chance in 500,000 every second achievement
			if (Game.T%(Game.fps*5)==0 && Game.ObjectsById.length>0)//check some achievements and upgrades
			{
				if (isNaN(Game.cookies)) {Game.cookies=0;Game.cookiesEarned=0;Game.recalculateGains=1;}
				
				var timePlayed=new Date();
				timePlayed.setTime(Date.now()-Game.startDate);
				
				
				if (Game.cookiesEarned>=1000000 && (Game.ascensionMode==1 || Game.resets==0))//challenge run or hasn't ascended yet
				{
					if (timePlayed<=1000*60*35) Game.Win('Speed baking I');
					if (timePlayed<=1000*60*25) Game.Win('Speed baking II');
					if (timePlayed<=1000*60*15) Game.Win('Speed baking III');
					
					if (Game.cookieClicks<=15) Game.Win('Neverclick');
					if (Game.cookieClicks<=0) Game.Win('True Neverclick');
					if (Game.cookiesEarned>=1000000000 && Game.UpgradesOwned==0) Game.Win('Hardcore');
				}
				
				for (var i in Game.UnlockAt)
				{
					var unlock=Game.UnlockAt[i];
					if (Game.cookiesEarned>=unlock.cookies)
					{
						var pass=1;
						if (unlock.require && !Game.Has(unlock.require) && !Game.HasAchiev(unlock.require)) pass=0;
						if (unlock.season && Game.season!=unlock.season) pass=0;
						if (pass) {Game.Unlock(unlock.name);Game.Win(unlock.name);}
					}
				}
				
				if (Game.Has('Golden switch')) Game.Unlock('Golden switch [off]');
				if (Game.Has('Classic dairy selection')) Game.Unlock('Milk selector');
				if (Game.Has('Basic wallpaper assortment')) Game.Unlock('Background selector');
				if (Game.Has('Golden cookie alert sound')) Game.Unlock('Golden cookie sound selector');
				
				if (Game.Has('Eternal heart biscuits')) Game.Win('Lovely cookies');
				if (Game.season=='easter')
				{
					var eggs=0;
					for (var i in Game.easterEggs)
					{
						if (Game.HasUnlocked(Game.easterEggs[i])) eggs++;
					}
					if (eggs>=1) Game.Win('The hunt is on');
					if (eggs>=7) Game.Win('Egging on');
					if (eggs>=14) Game.Win('Mass Easteria');
					if (eggs>=Game.easterEggs.length) Game.Win('Hide & seek champion');
				}
				
				if (Game.prestige>0 && Game.ascensionMode!=1)
				{
					Game.Unlock('Heavenly chip secret');
					if (Game.Has('Heavenly chip secret')) Game.Unlock('Heavenly cookie stand');
					if (Game.Has('Heavenly cookie stand')) Game.Unlock('Heavenly bakery');
					if (Game.Has('Heavenly bakery')) Game.Unlock('Heavenly confectionery');
					if (Game.Has('Heavenly confectionery')) Game.Unlock('Heavenly key');
					
					if (Game.Has('Heavenly key')) Game.Win('Wholesome');
				}
			
				for (var i in Game.BankAchievements)
				{
					if (Game.cookiesEarned>=Game.BankAchievements[i].threshold) Game.Win(Game.BankAchievements[i].name);
				}
				
				var buildingsOwned=0;
				var mathematician=1;
				var base10=1;
				var minAmount=100000;
				for (var i in Game.Objects)
				{
					buildingsOwned+=Game.Objects[i].amount;
					minAmount=Math.min(Game.Objects[i].amount,minAmount);
					if (!Game.HasAchiev('Mathematician')) {if (Game.Objects[i].amount<Math.min(128,Math.pow(2,(Game.ObjectsById.length-Game.Objects[i].id)-1))) mathematician=0;}
					if (!Game.HasAchiev('Base 10')) {if (Game.Objects[i].amount<(Game.ObjectsById.length-Game.Objects[i].id)*10) base10=0;}
				}
				if (minAmount>=1) Game.Win('One with everything');
				if (mathematician==1) Game.Win('Mathematician');
				if (base10==1) Game.Win('Base 10');
				if (minAmount>=100) {Game.Win('Centennial');Game.Unlock('Milk chocolate butter biscuit');}
				if (minAmount>=150) {Game.Win('Centennial and a half');Game.Unlock('Dark chocolate butter biscuit');}
				if (minAmount>=200) {Game.Win('Bicentennial');Game.Unlock('White chocolate butter biscuit');}
				if (minAmount>=250) {Game.Win('Bicentennial and a half');Game.Unlock('Ruby chocolate butter biscuit');}
				if (minAmount>=300) {Game.Win('Tricentennial');Game.Unlock('Lavender chocolate butter biscuit');}
				
				if (Game.handmadeCookies>=1000) {Game.Win('Clicktastic');Game.Unlock('Plastic mouse');}
				if (Game.handmadeCookies>=100000) {Game.Win('Clickathlon');Game.Unlock('Iron mouse');}
				if (Game.handmadeCookies>=10000000) {Game.Win('Clickolympics');Game.Unlock('Titanium mouse');}
				if (Game.handmadeCookies>=1000000000) {Game.Win('Clickorama');Game.Unlock('Adamantium mouse');}
				if (Game.handmadeCookies>=100000000000) {Game.Win('Clickasmic');Game.Unlock('Unobtainium mouse');}
				if (Game.handmadeCookies>=10000000000000) {Game.Win('Clickageddon');Game.Unlock('Eludium mouse');}
				if (Game.handmadeCookies>=1000000000000000) {Game.Win('Clicknarok');Game.Unlock('Wishalloy mouse');}
				if (Game.handmadeCookies>=100000000000000000) {Game.Win('Clickastrophe');Game.Unlock('Fantasteel mouse');}
				if (Game.handmadeCookies>=10000000000000000000) {Game.Win('Clickataclysm');Game.Unlock('Nevercrack mouse');}
				if (Game.handmadeCookies>=1000000000000000000000) {Game.Win('The ultimate clickdown');Game.Unlock('Armythril mouse');}
				
				if (Game.cookiesEarned<Game.cookies) Game.Win('Cheated cookies taste awful');
				
				if (Game.Has('Skull cookies') && Game.Has('Ghost cookies') && Game.Has('Bat cookies') && Game.Has('Slime cookies') && Game.Has('Pumpkin cookies') && Game.Has('Eyeball cookies') && Game.Has('Spider cookies')) Game.Win('Spooky cookies');
				if (Game.wrinklersPopped>=1) Game.Win('Itchscratcher');
				if (Game.wrinklersPopped>=50) Game.Win('Wrinklesquisher');
				if (Game.wrinklersPopped>=200) Game.Win('Moistburster');
				
				if (Game.cookiesEarned>=1000000 && Game.Has('How to bake your dragon')) Game.Unlock('A crumbly egg');
				
				if (Game.cookiesEarned>=25 && Game.season=='christmas') Game.Unlock('A festive hat');
				if (Game.Has('Christmas tree biscuits') && Game.Has('Snowflake biscuits') && Game.Has('Snowman biscuits') && Game.Has('Holly biscuits') && Game.Has('Candy cane biscuits') && Game.Has('Bell biscuits') && Game.Has('Present biscuits')) Game.Win('Let it snow');
				
				if (Game.reindeerClicked>=1) Game.Win('Oh deer');
				if (Game.reindeerClicked>=50) Game.Win('Sleigh of hand');
				if (Game.reindeerClicked>=200) Game.Win('Reindeer sleigher');
				
				if (buildingsOwned>=100) Game.Win('Builder');
				if (buildingsOwned>=500) Game.Win('Architect');
				if (buildingsOwned>=1000) Game.Win('Engineer');
				if (buildingsOwned>=2000) Game.Win('Lord of Constructs');
				if (Game.UpgradesOwned>=20) Game.Win('Enhancer');
				if (Game.UpgradesOwned>=50) Game.Win('Augmenter');
				if (Game.UpgradesOwned>=100) Game.Win('Upgrader');
				if (Game.UpgradesOwned>=200) Game.Win('Lord of Progress');
				if (buildingsOwned>=3000 && Game.UpgradesOwned>=300) Game.Win('Polymath');
				
				if (Game.cookiesEarned>=10000000000000 && !Game.HasAchiev('You win a cookie')) {Game.Win('You win a cookie');Game.Earn(1);}
				
				if (Game.shimmerTypes['golden'].n>=4) Game.Win('Four-leaf cookie');
				
				var grandmas=0;
				if (Game.Has('Farmer grandmas')) grandmas++;
				if (Game.Has('Worker grandmas')) grandmas++;
				if (Game.Has('Miner grandmas')) grandmas++;
				if (Game.Has('Cosmic grandmas')) grandmas++;
				if (Game.Has('Transmuted grandmas')) grandmas++;
				if (Game.Has('Altered grandmas')) grandmas++;
				if (Game.Has('Grandmas\' grandmas')) grandmas++;
				if (Game.Has('Antigrandmas')) grandmas++;
				if (Game.Has('Rainbow grandmas')) grandmas++;
				if (Game.Has('Banker grandmas')) grandmas++;
				if (Game.Has('Priestess grandmas')) grandmas++;
				if (Game.Has('Witch grandmas')) grandmas++;
				if (Game.Has('Lucky grandmas')) grandmas++;
				if (!Game.HasAchiev('Elder') && grandmas>=7) Game.Win('Elder');
				if (Game.Objects['Grandma'].amount>=6 && !Game.Has('Bingo center/Research facility') && Game.HasAchiev('Elder')) Game.Unlock('Bingo center/Research facility');
				if (Game.pledges>0) Game.Win('Elder nap');
				if (Game.pledges>=5) Game.Win('Elder slumber');
				if (Game.pledges>=10) Game.Unlock('Sacrificial rolling pins');
				if (Game.Objects['Cursor'].amount+Game.Objects['Grandma'].amount>=777) Game.Win('The elder scrolls');
				
				var base=10000000000000;
				if (Game.Objects['Cursor'].totalCookies>=base*1000000) 		Game.Win('Click delegator');
				if (Game.Objects['Grandma'].totalCookies>=base*1000000) 	Game.Win('Gushing grannies');
				if (Game.Objects['Farm'].totalCookies>=base) 				Game.Win('I hate manure');
				if (Game.Objects['Mine'].totalCookies>=base*				10) Game.Win('Never dig down');
				if (Game.Objects['Factory'].totalCookies>=base*				100) Game.Win('The incredible machine');
				if (Game.Objects['Bank'].totalCookies>=base*				1000) Game.Win('Vested interest');
				if (Game.Objects['Temple'].totalCookies>=base*				10000) Game.Win('New world order');
				if (Game.Objects['Wizard tower'].totalCookies>=base*		100000) Game.Win('Hocus pocus');
				if (Game.Objects['Shipment'].totalCookies>=base*			1000000) Game.Win('And beyond');
				if (Game.Objects['Alchemy lab'].totalCookies>=base*			10000000) Game.Win('Magnum Opus');
				if (Game.Objects['Portal'].totalCookies>=base*				100000000) Game.Win('With strange eons');
				if (Game.Objects['Time machine'].totalCookies>=base*		1000000000) Game.Win('Spacetime jigamaroo');
				if (Game.Objects['Antimatter condenser'].totalCookies>=base*10000000000) Game.Win('Supermassive');
				if (Game.Objects['Prism'].totalCookies>=base*				100000000000) Game.Win('Praise the sun');
				if (Game.Objects['Chancemaker'].totalCookies>=base*			1000000000000) Game.Win('Fingers crossed');

				var base=10000000000000000;
				if (Game.Objects['Cursor'].totalCookies>=base*1000000) 		Game.Win('Finger clickin\' good');
				if (Game.Objects['Grandma'].totalCookies>=base*1000000) 	Game.Win('Panic at the bingo');
				if (Game.Objects['Farm'].totalCookies>=base) 				Game.Win('Rake in the dough');
				if (Game.Objects['Mine'].totalCookies>=base*				10) Game.Win('Quarry on');
				if (Game.Objects['Factory'].totalCookies>=base*				100) Game.Win('Yes I love technology');
				if (Game.Objects['Bank'].totalCookies>=base*				1000) Game.Win('Paid in full');
				if (Game.Objects['Temple'].totalCookies>=base*				10000) Game.Win('Church of Cookiology');
				if (Game.Objects['Wizard tower'].totalCookies>=base*		100000) Game.Win('Too many rabbits, not enough hats');
				if (Game.Objects['Shipment'].totalCookies>=base*			1000000) Game.Win('The most precious cargo');
				if (Game.Objects['Alchemy lab'].totalCookies>=base*			10000000) Game.Win('The Aureate');
				if (Game.Objects['Portal'].totalCookies>=base*				100000000) Game.Win('Ever more hideous');
				if (Game.Objects['Time machine'].totalCookies>=base*		1000000000) Game.Win('Be kind, rewind');
				if (Game.Objects['Antimatter condenser'].totalCookies>=base*10000000000) Game.Win('Infinitesimal');
				if (Game.Objects['Prism'].totalCookies>=base*				100000000000) Game.Win('A still more glorious dawn');
				if (Game.Objects['Chancemaker'].totalCookies>=base*			1000000000000) Game.Win('Just a statistic');
				
				var base=10000000000000000000;
				if (Game.Objects['Cursor'].totalCookies>=base*1000000) 		Game.Win('Click (starring Adam Sandler)');
				if (Game.Objects['Grandma'].totalCookies>=base*1000000) 	Game.Win('Frantiquities');
				if (Game.Objects['Farm'].totalCookies>=base) 				Game.Win('Overgrowth');
				if (Game.Objects['Mine'].totalCookies>=base*				10) Game.Win('Sedimentalism');
				if (Game.Objects['Factory'].totalCookies>=base*				100) Game.Win('Labor of love');
				if (Game.Objects['Bank'].totalCookies>=base*				1000) Game.Win('Reverse funnel system');
				if (Game.Objects['Temple'].totalCookies>=base*				10000) Game.Win('Thus spoke you');
				if (Game.Objects['Wizard tower'].totalCookies>=base*		100000) Game.Win('Manafest destiny');
				if (Game.Objects['Shipment'].totalCookies>=base*			1000000) Game.Win('Neither snow nor rain nor heat nor gloom of night');
				if (Game.Objects['Alchemy lab'].totalCookies>=base*			10000000) Game.Win('I\'ve got the Midas touch');
				if (Game.Objects['Portal'].totalCookies>=base*				100000000) Game.Win('Which eternal lie');
				if (Game.Objects['Time machine'].totalCookies>=base*		1000000000) Game.Win('D&eacute;j&agrave; vu');
				if (Game.Objects['Antimatter condenser'].totalCookies>=base*10000000000) Game.Win('Powers of Ten');
				if (Game.Objects['Prism'].totalCookies>=base*				100000000000) Game.Win('Now the dark days are gone');
				if (Game.Objects['Chancemaker'].totalCookies>=base*			1000000000000) Game.Win('Murphy\'s wild guess');
				
				if (!Game.HasAchiev('Cookie-dunker') && Game.LeftBackground && Game.milkProgress>0.1 && (Game.LeftBackground.canvas.height*0.4+256/2-16)>((1-Game.milkHd)*Game.LeftBackground.canvas.height)) Game.Win('Cookie-dunker');
				//&& l('bigCookie').getBoundingClientRect().bottom>l('milk').getBoundingClientRect().top+16 && Game.milkProgress>0.1) Game.Win('Cookie-dunker');
				
				for (var i in Game.customChecks) {Game.customChecks[i]();}
			}
			
			Game.cookiesd+=(Game.cookies-Game.cookiesd)*0.3;
			
			if (Game.storeToRefresh) Game.RefreshStore();
			if (Game.upgradesToRebuild) Game.RebuildUpgrades();
			
			Game.updateShimmers();
			Game.updateBuffs();
			
			Game.UpdateTicker();
		}
		
		if (Game.T%(Game.fps*2)==0)
		{
			var title='Cookie Clicker';
			if (Game.season=='fools') title='Cookie Baker';
			document.title=(Game.OnAscend?'Ascending! ':'')+Beautify(Game.cookies)+' '+(Game.cookies==1?'cookie':'cookies')+' - '+title;
		}
		if (Game.T%15==0)
		{
			//written through the magic of "hope for the best" maths
			var chipsOwned=Game.HowMuchPrestige(Game.cookiesReset);
			var ascendNowToOwn=Math.floor(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned));
			var ascendNowToGet=ascendNowToOwn-Math.floor(chipsOwned);
			var nextChipAt=Game.HowManyCookiesReset(Math.floor(chipsOwned+ascendNowToGet+1))-Game.HowManyCookiesReset(Math.floor(chipsOwned+ascendNowToGet));
			var cookiesToNext=Game.HowManyCookiesReset(ascendNowToOwn+1)-(Game.cookiesEarned+Game.cookiesReset);
			var percent=1-(cookiesToNext/nextChipAt);
			
			//fill the tooltip under the Legacy tab
			var date=new Date();
			date.setTime(Date.now()-Game.startDate);
			var timeInSeconds=date.getTime()/1000;
			var startDate=Game.sayTime(timeInSeconds*Game.fps,-1);
			
			var str='';
			str+='You\'ve been on this run for <b>'+(startDate==''?'not very long':(startDate))+'</b>.<br>';
			str+='<div class="line"></div>';
			if (Game.prestige>0)
			{
				str+='Your prestige level is currently <b>'+Beautify(Game.prestige)+'</b>.<br>(CpS +'+Beautify(Game.prestige)+'%)';
				str+='<div class="line"></div>';
			}
			if (ascendNowToGet<1) str+='Ascending now would grant you no prestige.';
			else if (ascendNowToGet<2) str+='Ascending now would grant you<br><b>1 prestige level</b> (+1% CpS)<br>and <b>1 heavenly chip</b> to spend.';
			else str+='Ascending now would grant you<br><b>'+Beautify(ascendNowToGet)+' prestige levels</b> (+'+Beautify(ascendNowToGet)+'% CpS)<br>and <b>'+Beautify(ascendNowToGet)+' heavenly chips</b> to spend.';
			str+='<div class="line"></div>';
			str+='You need <b>'+Beautify(cookiesToNext)+' more cookies</b> for the next level.<br>';
			l('ascendTooltip').innerHTML=str;
			
			if (ascendNowToGet>0)//show number saying how many chips you'd get resetting now
			{
				var str=ascendNowToGet.toString();
				var str2='';
				for (var i in str)//add commas
				{
					if ((str.length-i)%3==0 && i>0) str2+=',';
					str2+=str[i];
				}
				Game.ascendNumber.innerHTML='+'+str2;
				Game.ascendNumber.style.display='block';
			}
			else
			{
				Game.ascendNumber.style.display='none';
			}
			
			if (ascendNowToGet>Game.ascendMeterLevel || Game.ascendMeterPercentT<Game.ascendMeterPercent)
			{
				//reset the gauge and play a sound if we gained a potential level
				Game.ascendMeterPercent=0;
				//PlaySound('snd/levelPrestige.mp3');//a bit too annoying
			}
			Game.ascendMeterLevel=ascendNowToGet;
			Game.ascendMeterPercentT=percent;//gauge that fills up as you near your next chip
			//if (Game.ascendMeterPercentT<Game.ascendMeterPercent) {Game.ascendMeterPercent=0;PlaySound('snd/levelPrestige.mp3',0.5);}
			//if (percent>=1) {Game.ascendMeter.className='';} else Game.ascendMeter.className='filling';
		}
		Game.ascendMeter.style.right=Math.floor(Math.max(0,1-Game.ascendMeterPercent)*100)+'px';
		Game.ascendMeterPercent+=(Game.ascendMeterPercentT-Game.ascendMeterPercent)*0.1;
		
		Game.NotesLogic();
		if (Game.mouseMoved || Game.Scroll || Game.tooltip.dynamic) Game.tooltip.update();
		
		if (Game.T%(Game.fps*5)==0 && !Game.mouseDown) Game.UpdateMenu();
		if (Game.T%(Game.fps*1)==0) Game.UpdatePrompt();
		if (Game.AscendTimer>0) Game.UpdateAscendIntro();
		if (Game.ReincarnateTimer>0) Game.UpdateReincarnateIntro();
		if (Game.OnAscend) Game.UpdateAscend();
		
		for (var i in Game.customLogic) {Game.customLogic[i]();}
		
		if (Game.sparklesT>0)
		{
			Game.sparkles.style.backgroundPosition=-Math.floor((Game.sparklesFrames-Game.sparklesT+1)*128)+'px 0px';
			Game.sparklesT--;
			if (Game.sparklesT==1) Game.sparkles.style.display='none';
		}
		
		Game.Click=0;
		Game.Scroll=0;
		Game.mouseMoved=0;
		Game.CanClick=1;
		
		if (Game.T%(Game.fps*60)==0 && Game.T>Game.fps*10 && Game.prefs.autosave && !Game.OnAscend) Game.WriteSave();
		if (Game.T%(Game.fps*60*30)==0 && Game.T>Game.fps*10 && Game.prefs.autoupdate) Game.CheckUpdates();
		
		Game.T++;
	}
	
	/*=====================================================================================
	DRAW
	=======================================================================================*/
	
	Game.Draw=function()
	{
		Game.DrawBackground();Timer.track('end of background');
		
		if (!Game.OnAscend)
		{
			
			var unit=(Math.round(Game.cookiesd)==1?' cookie':' cookies');
			var str=Beautify(Math.round(Game.cookiesd));
			if (Game.cookiesd>=1000000)//dirty padding
			{
				var spacePos=str.indexOf(' ');
				var dotPos=str.indexOf('.');
				var add='';
				if (spacePos!=-1)
				{
					if (dotPos==-1) add+='.000';
					else
					{
						if (spacePos-dotPos==2) add+='00';
						if (spacePos-dotPos==3) add+='0';
					}
				}
				str=[str.slice(0, spacePos),add,str.slice(spacePos)].join('');
			}
			if (str.length>11 && !Game.mobile) unit='<br>cookies';
			str+=unit;
			if (Game.prefs.monospace) str='<span class="monospace">'+str+'</span>';
			str=str+'<div style="font-size:50%;"'+(Game.cpsSucked>0?' class="warning"':'')+'>per second : '+Beautify(Game.cookiesPs*(1-Game.cpsSucked),1)+'</div>';//display cookie amount
			l('cookies').innerHTML=str;
			l('compactCookies').innerHTML=str;
			Timer.track('cookie amount');
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				if (me.onMinigame && me.minigame.draw) me.minigame.draw();
			}
			Timer.track('draw minigames');
			
			if (Game.drawT%5==0)
			{
				//if (Game.prefs.monospace) {l('cookies').className='title monospace';} else {l('cookies').className='title';}
				var lastLocked=0;
				for (var i in Game.Objects)
				{
					var me=Game.Objects[i];
					
					//make products full-opacity if we can buy them
					var classes='product';
					var price=me.bulkPrice;
					if (Game.cookiesEarned>=me.basePrice || me.bought>0) {classes+=' unlocked';lastLocked=0;me.locked=0;} else {classes+=' locked';lastLocked++;me.locked=1;}
					if ((Game.buyMode==1 && Game.cookies>=price) || (Game.buyMode==-1 && me.amount>0)) classes+=' enabled'; else classes+=' disabled';
					if (lastLocked>2) classes+=' toggledOff';
					me.l.className=classes;
					//if (me.id>0) {l('productName'+me.id).innerHTML=Beautify(me.storedTotalCps/Game.ObjectsById[me.id-1].storedTotalCps,2);}
				}
				
				//make upgrades full-opacity if we can buy them
				var lastPrice=0;
				for (var i in Game.UpgradesInStore)
				{
					var me=Game.UpgradesInStore[i];
					if (!me.bought)
					{
						var price=me.getPrice();
						var canBuy=(Game.cookies>=price);
						var enabled=(l('upgrade'+i).className.indexOf('enabled')>-1);
						if ((canBuy && !enabled) || (!canBuy && enabled)) Game.upgradesToRebuild=1;
						if (price<lastPrice) Game.storeToRefresh=1;//is this upgrade less expensive than the previous one? trigger a refresh to sort it again
						lastPrice=price;
					}
					if (me.timerDisplay)
					{
						var T=me.timerDisplay();
						if (T!=-1)
						{
							if (!l('upgradePieTimer'+i)) l('upgrade'+i).innerHTML=l('upgrade'+i).innerHTML+'<div class="pieTimer" id="upgradePieTimer'+i+'"></div>';
							T=(T*144)%144;
							l('upgradePieTimer'+i).style.backgroundPosition=(-Math.floor(T%18))*48+'px '+(-Math.floor(T/18))*48+'px';
						}
					}
					
					//if (me.canBuy()) l('upgrade'+i).className='crate upgrade enabled'; else l('upgrade'+i).className='crate upgrade disabled';
				}
			}
			Timer.track('store');
			
			if (Game.PARTY)//i was bored and felt like messing with CSS
			{
				var pulse=Math.pow((Game.T%10)/10,0.5);
				Game.l.style.filter='hue-rotate('+((Game.T*5)%360)+'deg) brightness('+(150-50*pulse)+'%)';
				Game.l.style.webkitFilter='hue-rotate('+((Game.T*5)%360)+'deg) brightness('+(150-50*pulse)+'%)';
				Game.l.style.transform='scale('+(1.02-0.02*pulse)+','+(1.02-0.02*pulse)+') rotate('+(Math.sin(Game.T*0.5)*0.5)+'deg)';
				l('wrapper').style.overflowX='hidden';
				l('wrapper').style.overflowY='hidden';
			}
			
			Timer.clean();
			if (Game.prefs.animate && ((Game.prefs.fancy && Game.drawT%1==0) || (!Game.prefs.fancy && Game.drawT%10==0)) && Game.AscendTimer==0 && Game.onMenu=='') Game.DrawBuildings();Timer.track('buildings');
			
			Game.textParticlesUpdate();Timer.track('text particles');
		}
		
		Game.NotesDraw();Timer.track('notes');
		//Game.tooltip.update();//changed to only update when the mouse is moved
		
		for (var i in Game.customDraw) {Game.customDraw[i]();}
		
		Game.drawT++;
		if (Game.prefs.altDraw) requestAnimationFrame(Game.Draw);
	}
	
	/*=====================================================================================
	MAIN LOOP
	=======================================================================================*/
	Game.Loop=function()
	{
		Timer.say('START');
		Timer.track('browser stuff');
		Timer.say('LOGIC');
		//update game logic !
		Game.catchupLogic=0;
		Game.Logic();
		Game.catchupLogic=1;
		
		var hasFocus=document.hasFocus();
		
		//latency compensator
		Game.accumulatedDelay+=((Date.now()-Game.time)-1000/Game.fps);
		Game.accumulatedDelay=Math.min(Game.accumulatedDelay,1000*5);//don't compensate over 5 seconds; if you do, something's probably very wrong
		Game.time=Date.now();
		while (Game.accumulatedDelay>0)
		{
			Game.Logic();
			Game.accumulatedDelay-=1000/Game.fps;//as long as we're detecting latency (slower than target fps), execute logic (this makes drawing slower but makes the logic behave closer to correct target fps)
		}
		Game.catchupLogic=0;
		Timer.track('logic');
		Timer.say('END LOGIC');
		if (!Game.prefs.altDraw)
		{
			Timer.say('DRAW');
			if (hasFocus || Game.prefs.focus || Game.loopT%10==0) Game.Draw();
			//if (document.hasFocus() || Game.loopT%5==0) Game.Draw();
			Timer.say('END DRAW');
		}
		
		//if (!hasFocus) Game.tooltip.hide();
		
		if (Game.sesame)
		{
			l('fpsCounter').innerHTML=Game.getFps()+' fps';
			var str='';
			for (var i in Timer.labels) {str+=Timer.labels[i];}
			if (Game.debugTimersOn) l('debugLog').style.display='block';
			else l('debugLog').style.display='none';
			l('debugLog').innerHTML=str;
		}
		Timer.reset();
		
		Game.loopT++;
		setTimeout(Game.Loop,1000/Game.fps);
	}
}


/*=====================================================================================
LAUNCH THIS THING
=======================================================================================*/
Game.Launch();
//try {Game.Launch();}
//catch(err) {console.log('ERROR : '+err.message);}

window.onload=function()
{
	
	if (!Game.ready)
	{
		if (top!=self) Game.ErrorFrame();
		else
		{
			Game.Load();
			//try {Game.Load();}
			//catch(err) {console.log('ERROR : '+err.message);}
		}
	}
};