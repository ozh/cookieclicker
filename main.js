/*
All this code is copyright Orteil, 2013.
	-with some help, advice and fixes by Debugbro and Opti
	-also includes a bunch of snippets found on stackoverflow.com
Spoilers ahead.
http://orteil.dashnet.org
*/

/*=====================================================================================
MISC HELPER FUNCTIONS
=======================================================================================*/
function l(what) {return document.getElementById(what);}
function choose(arr) {return arr[Math.floor(Math.random()*arr.length)];}

//disable sounds coming from soundjay.com (sorry, 
realAudio=Audio;//backup real audio
Audio=function(src){
	if (src.indexOf('soundjay')>-1) {Game.Popup('Sorry, no sounds hotlinked from soundjay.com.');this.play=function(){};}
	else return realAudio(src);
};

if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === needle) {
                return i;
            }
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
function Beautify(what,floats)//turns 9999999 into 9,999,999
{
	var str='';
	if (!isFinite(what)) return 'Infinity';
	if (what.toString().indexOf('e')!=-1) return what.toString();
	what=Math.round(what*10000000)/10000000;//get rid of weird rounding errors
	if (floats>0)
	{
		var floater=what-Math.floor(what);
		floater=Math.round(floater*10000000)/10000000;//get rid of weird rounding errors
		var floatPresent=floater?1:0;
		floater=(floater.toString()+'0000000').slice(2,2+floats);//yes this is hacky (but it works)
		if (parseInt(floater)===0) floatPresent=0;
		str=Beautify(Math.floor(what))+(floatPresent?('.'+floater):'');
	}
	else
	{
		what=Math.floor(what);
		what=(what+'').split('').reverse();
		for (var i in what)
		{
			if (i%3==0 && i>0) str=','+str;
			str=what[i]+str;
		}
	}
	return str;
}


function utf8_to_b64( str ) {
	try{
		return Base64.encode(unescape(encodeURIComponent( str )));
		//return window.btoa(unescape(encodeURIComponent( str )));
	}
	catch(err)
	{
		//Game.Popup('There was a problem while encrypting to base64.<br>('+err+')');
		return '';
	}
}

function b64_to_utf8( str ) {
	try{
		return decodeURIComponent(escape(Base64.decode( str )));
		//return decodeURIComponent(escape(window.atob( str )));
	}
	catch(err)
	{
		//Game.Popup('There was a problem while decrypting from base64.<br>('+err+')');
		return '';
	}
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

//seeded random function, courtesy of http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html
(function(a,b,c,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var e,c=[],d=(typeof a)[0];if(b&&"o"==d)for(e in a)try{c.push(l(a[e],b-1))}catch(f){}return c.length?c:"s"==d?a:a+"\0"}function m(a,b){for(var d,c=a+"",e=0;c.length>e;)b[j&e]=j&(d^=19*b[j&e])+c.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=c.pow(d,e),h=c.pow(2,f),i=2*h,j=d-1;c.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),c.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(c.random(),b)})(this,[],Math,256,6,52);

function bind(scope, fn)
{
	//use : bind(this,function(){this.x++;}) - returns a function where "this" refers to the scoped this
    return function()
	{
        fn.apply(scope,arguments);
    };
}

CanvasRenderingContext2D.prototype.fillPattern=function(img,X,Y,W,H,iW,iH)
{
	//for when built-in patterns aren't enough
	for (var y=0;y<H;y+=iH)
	{
		for (var x=0;x<W;x+=iW)
		{
			this.drawImage(img,X+x,Y+y,iW,iH);
		}
	}
}

function AddEvent(html_element, event_name, event_function) 
{       
   if(html_element.attachEvent) //Internet Explorer
      html_element.attachEvent("on" + event_name, function() {event_function.call(html_element);}); 
   else if(html_element.addEventListener) //Firefox & company
      html_element.addEventListener(event_name, event_function, false); //don't need the 'call' trick because in FF everything already works in the right way          
} 

Loader=function()//asset-loading system
{
	this.loadingN=0;
	this.assets=[];
	this.domain='';
	this.loaded=0;//callback
	this.doneLoading=0;
	this.Load=function(assets)
	{
		for (var i in assets)
		{
			this.loadingN++;
			var img=new Image();
			img.src=this.domain+assets[i];
			img.onload=bind(this,this.onLoad);
			this.assets[assets[i]]=img;
		}
	}
	this.onLoad=function()
	{
		this.loadingN--;
		if (this.doneLoading==0 && this.loadingN<=0 && this.loaded!=0)
		{
			this.doneLoading=1;
			this.loaded();
		}
	}
	this.getProgress=function()
	{
		return (1-this.loadingN/this.assets.length);
	}
}

var debugStr='';
Debug=function(what)
{
	if (!debugStr) debugStr=what;
	else debugStr+='; '+what;
}

/*=====================================================================================
GAME INITIALIZATION
=======================================================================================*/
Game={};

Game.Launch=function()
{
	Game.version=1.0403;
	Game.beta=0;
	Game.mobile=0;
	
	Game.updateLog=
	'<div class="section">Updates</div>'+
	'<div class="subsection">'+
	'<div class="title">Now working on :</div>'+
	'<div class="listing">-technical optimization</div>'+
	'<div class="listing">-prettifying it up</div>'+
	'<div class="listing">-more customization options</div>'+
	
	'</div><div class="subsection">'+
	'<div class="title">What\'s next :</div>'+
	'<div class="listing">-more dungeon stuff!</div>'+
	'<div class="listing">-more buildings and upgrades!</div>'+
	'<div class="listing">-revamping the prestige system!</div>'+
	'<div class="listing"><span class="warning">Note : this game is updated fairly frequently, which often involves rebalancing. Expect to see prices and cookies/second vary wildly from one update to another!</span></div>'+
	
	
	'</div><div class="subsection update small">'+
	'<div class="title">22/12/2013 - merry fixmas</div>'+
	'<div class="listing">-some issues with the christmas upgrades have been fixed</div>'+
	'<div class="listing">-reindeer cookie drops are now more common</div>'+
	'<div class="listing">-reindeers are now reindeer</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">20/12/2013 - Christmas is here</div>'+
	'<div class="listing">-there is now a festive new evolving upgrade in store</div>'+
	'<div class="listing">-reindeer are running amok (catch them if you can!)</div>'+
	'<div class="listing">-added a new option to warn you when you close the window, so you don\'t lose your un-popped wrinklers</div>'+
	'<div class="listing">-also added a separate option for displaying cursors</div>'+
	'<div class="listing">-all the Halloween features are still there (and having the Spooky cookies achievements makes the Halloween cookies drop much more often)</div>'+
	'<div class="listing">-oh yeah, we now have <a href="http://www.redbubble.com/people/dashnet" target="_blank">Cookie Clicker shirts, stickers and hoodies</a>! (they\'re really rad)</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">29/10/2013 - spooky update</div>'+
	'<div class="listing">-the Grandmapocalypse now spawns wrinklers, hideous elderly creatures that damage your CpS when they reach your big cookie. Thankfully, you can click on them to make them explode (you\'ll even gain back the cookies they\'ve swallowed - with interest!).</div>'+
	'<div class="listing">-wrath cookie now 27% spookier</div>'+
	'<div class="listing">-some other stuff</div>'+
	'<div class="listing">-you should totally go check out <a href="http://candybox2.net/" target="_blank">Candy Box 2</a>, the sequel to the game that inspired Cookie Clicker</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - it\'s a secret</div>'+
	'<div class="listing">-added a new heavenly upgrade that gives you 5% of your heavenly chips power for 11 cookies (if you purchased the Heavenly key, you might need to buy it again, sorry)</div>'+
	'<div class="listing">-golden cookie chains should now work properly</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - player-friendly</div>'+
	'<div class="listing">-heavenly upgrades are now way, way cheaper</div>'+
	'<div class="listing">-tier 5 building upgrades are 5 times cheaper</div>'+
	'<div class="listing">-cursors now just plain disappear with Fancy Graphics off, I might add a proper option to toggle only the cursors later</div>'+
	'<div class="listing">-warning : the Cookie Monster add-on seems to be buggy with this update, you might want to wait until its programmer updates it</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/10/2013 - a couple fixes</div>'+
	'<div class="listing">-golden cookies should no longer spawn embarrassingly often</div>'+
	'<div class="listing">-cursors now stop moving if Fancy Graphics is turned off</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">14/10/2013 - going for the gold</div>'+
	'<div class="listing">-golden cookie chains work a bit differently</div>'+
	'<div class="listing">-golden cookie spawns are more random</div>'+
	'<div class="listing">-CpS achievements are no longer affected by golden cookie frenzies</div>'+
	'<div class="listing">-revised cookie-baking achievement requirements</div>'+
	'<div class="listing">-heavenly chips now require upgrades to function at full capacity</div>'+
	'<div class="listing">-added 4 more cookie upgrades, unlocked after reaching certain amounts of Heavenly Chips</div>'+
	'<div class="listing">-speed baking achievements now require you to have no heavenly upgrades; as such, they have been reset for everyone (along with the Hardcore achievement) to better match their initially intended difficulty</div>'+
	'<div class="listing">-made good progress on the mobile port</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/10/2013 - smoothing it out</div>'+
	'<div class="listing">-some visual effects have been completely rewritten and should now run more smoothly (and be less CPU-intensive)</div>'+
	'<div class="listing">-new upgrade tier</div>'+
	'<div class="listing">-new milk tier</div>'+
	'<div class="listing">-cookie chains have different capping mechanics</div>'+
	'<div class="listing">-antimatter condensers are back to their previous price</div>'+
	'<div class="listing">-heavenly chips now give +2% CpS again (they will be extensively reworked in the future)</div>'+
	'<div class="listing">-farms have been buffed a bit (to popular demand)</div>'+
	'<div class="listing">-dungeons still need a bit more work and will be released soon - we want them to be just right! (you can test an unfinished version in <a href="beta" target="_blank">the beta</a>)</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">28/09/2013 - dungeon beta</div>'+
	'<div class="listing">-from now on, big updates will come through a beta stage first (you can <a href="beta" target="_blank">try it here</a>)</div>'+
	'<div class="listing">-first dungeons! (you need 50 factories to unlock them!)</div>'+
	'<div class="listing">-cookie chains can be longer</div>'+
	'<div class="listing">-antimatter condensers are a bit more expensive</div>'+
	'<div class="listing">-heavenly chips now only give +1% cps each (to account for all the cookies made from condensers)</div>'+
	'<div class="listing">-added flavor text on all upgrades</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">15/09/2013 - anticookies</div>'+
	'<div class="listing">-ran out of regular matter to make your cookies? Try our new antimatter condensers!</div>'+
	'<div class="listing">-renamed Hard-reset to "Wipe save" to avoid confusion</div>'+
	'<div class="listing">-reset achievements are now regular achievements and require cookies baked all time, not cookies in bank</div>'+
	'<div class="listing">-heavenly chips have been nerfed a bit (and are now awarded following a geometric progression : 1 trillion for the first, 2 for the second, etc); the prestige system will be extensively reworked in a future update (after dungeons)</div>'+
	'<div class="listing">-golden cookie clicks are no longer reset by soft-resets</div>'+
	'<div class="listing">-you can now see how long you\'ve been playing in the stats</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">08/09/2013 - everlasting cookies</div>'+
	'<div class="listing">-added a prestige system - resetting gives you permanent CpS boosts (the more cookies made before resetting, the bigger the boost!)</div>'+
	'<div class="listing">-save format has been slightly modified to take less space</div>'+
	'<div class="listing">-Leprechaun has been bumped to 777 golden cookies clicked and is now shadow; Fortune is the new 77 golden cookies achievement</div>'+
	'<div class="listing">-clicking frenzy is now x777</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">04/09/2013 - smarter cookie</div>'+
	'<div class="listing">-golden cookies only have 20% chance of giving the same outcome twice in a row now</div>'+
	'<div class="listing">-added a golden cookie upgrade</div>'+
	'<div class="listing">-added an upgrade that makes pledges last twice as long (requires having pledged 10 times)</div>'+
	'<div class="listing">-Quintillion fingers is now twice as efficient</div>'+
	'<div class="listing">-Uncanny clicker was really too unpredictable; it is now a regular achievement and no longer requires a world record, just *pretty fast* clicking</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">02/09/2013 - a better way out</div>'+
	'<div class="listing">-Elder Covenant is even cheaper, and revoking it is cheaper still (also added a new achievement for getting it)</div>'+
	'<div class="listing">-each grandma upgrade now requires 15 of the matching building</div>'+
	'<div class="listing">-the dreaded bottom cursor has been fixed with a new cursor display style</div>'+
	'<div class="listing">-added an option for faster, cheaper graphics</div>'+
	'<div class="listing">-base64 encoding has been redone; this might make saving possible again on some older browsers</div>'+
	'<div class="listing">-shadow achievements now have their own section</div>'+
	'<div class="listing">-raspberry juice is now named raspberry milk, despite raspberry juice being delicious and going unquestionably well with cookies</div>'+
	'<div class="listing">-HOTFIX : cursors now click; fancy graphics button renamed; cookies amount now more visible against cursors</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">01/09/2013 - sorting things out</div>'+
	'<div class="listing">-upgrades and achievements are properly sorted in the stats screen</div>'+
	'<div class="listing">-made Elder Covenant much cheaper and less harmful</div>'+
	'<div class="listing">-importing from the first version has been disabled, as promised</div>'+
	'<div class="listing">-"One mind" now actually asks you to confirm the upgrade</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">31/08/2013 - hotfixes</div>'+
	'<div class="listing">-added a way to permanently stop the grandmapocalypse</div>'+
	'<div class="listing">-Elder Pledge price is now capped</div>'+
	'<div class="listing">-One Mind and other grandma research upgrades are now a little more powerful, if not 100% accurate</div>'+
	'<div class="listing">-"golden" cookie now appears again during grandmapocalypse; Elder Pledge-related achievements are now unlockable</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">31/08/2013 - too many grandmas</div>'+
	'<div class="listing">-the grandmapocalypse is back, along with more grandma types</div>'+
	'<div class="listing">-added some upgrades that boost your clicking power and make it scale with your cps</div>'+
	'<div class="listing">-clicking achievements made harder; Neverclick is now a shadow achievement; Uncanny clicker should now truly be a world record</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">28/08/2013 - over-achiever</div>'+
	'<div class="listing">-added a few more achievements</div>'+
	'<div class="listing">-reworked the "Bake X cookies" achievements so they take longer to achieve</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">27/08/2013 - a bad idea</div>'+
	'<div class="listing">-due to popular demand, retired 5 achievements (the "reset your game" and "cheat" ones); they can still be unlocked, but do not count toward your total anymore. Don\'t worry, there will be many more achievements soon!</div>'+
	'<div class="listing">-made some achievements hidden for added mystery</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">27/08/2013 - a sense of achievement</div>'+
	'<div class="listing">-added achievements (and milk)</div>'+
	'<div class="listing"><i>(this is a big update, please don\'t get too mad if you lose some data!)</i></div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">26/08/2013 - new upgrade tier</div>'+
	'<div class="listing">-added some more upgrades (including a couple golden cookie-related ones)</div>'+
	'<div class="listing">-added clicking stats</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">26/08/2013 - more tweaks</div>'+
	'<div class="listing">-tweaked a couple cursor upgrades</div>'+
	'<div class="listing">-made time machines less powerful</div>'+
	'<div class="listing">-added offline mode option</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">25/08/2013 - tweaks</div>'+
	'<div class="listing">-rebalanced progression curve (mid- and end-game objects cost more and give more)</div>'+
	'<div class="listing">-added some more cookie upgrades</div>'+
	'<div class="listing">-added CpS for cursors</div>'+
	'<div class="listing">-added sell button</div>'+
	'<div class="listing">-made golden cookie more useful</div>'+
	
	'</div><div class="subsection update small">'+
	'<div class="title">24/08/2013 - hotfixes</div>'+
	'<div class="listing">-added import/export feature, which also allows you to retrieve a save game from the old version (will be disabled in a week to prevent too much cheating)</div>'+
	'<div class="listing">-upgrade store now has unlimited slots (just hover over it), due to popular demand</div>'+
	'<div class="listing">-added update log</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">24/08/2013 - big update!</div>'+
	'<div class="listing">-revamped the whole game (new graphics, new game mechanics)</div>'+
	'<div class="listing">-added upgrades</div>'+
	'<div class="listing">-much safer saving</div>'+
	
	'</div><div class="subsection update">'+
	'<div class="title">08/08/2013 - game launch</div>'+
	'<div class="listing">-made the game in a couple hours, for laughs</div>'+
	'<div class="listing">-kinda starting to regret it</div>'+
	'<div class="listing">-ah well</div>'+
	'</div>'
	;
	
	Game.ready=0;
	
	Game.Load=function()
	{
		l('javascriptError').innerHTML='<div style="padding:64px 128px;"><div class="title">Loading...</div></div>';
		
		Game.Loader=new Loader();
		Game.Loader.domain='img/';
		Game.Loader.loaded=Game.Init;
		/*
		What we should load in here :
			-heavy images
			-images that are displayed on and off (flashing backgrounds etc)
			-images used in <canvas> stuff
		*/
		var pics=[
		'perfectCookie.png',
		'goldCookie.png',
		'wrathCookie.png',
		'spookyCookie.png',
		'icons.png',
		'cookieShower1.png',
		'cookieShower2.png',
		'cookieShower3.png',
		'milkWave.png',
		'chocolateMilkWave.png',
		'raspberryWave.png',
		'orangeWave.png',
		'caramelWave.png',
		'grandmas1.jpg',
		'grandmas2.jpg',
		'grandmas3.jpg',
		'bgBlue.jpg',
		'blackGradient.png',
		'shine.png',
		'shadedBorders.png',
		'shadedBordersRed.png',
		'shadedBordersGold.png',
		'smallCookies.png',
		'cursor.png',
		'wrinkler.png',
		'winterWrinkler.png',
		'wrinklerBits.png',
		'grandmaIcon.png',
		'grandmaIconB.png',
		'grandmaIconC.png',
		'grandmaIconD.png',
		'santa.png',
		'frostedReindeer.png',
		'snow2.jpg',
		'winterFrame.png'
		];
		Game.Loader.Load(pics);
		Game.Assets=Game.Loader.assets;
	}
	
	Game.Init=function()
	{
		Game.ready=1;

		/*=====================================================================================
		VARIABLES AND PRESETS
		=======================================================================================*/
		Game.T=0;
		Game.drawT=0;
		Game.fps=30;
		
		Game.season='christmas';//halloween, christmas
		
		if (Game.mobile==1)
		{
			l('wrapper').className='mobile';
			LaunchMobile();
		}
		
		Game.SaveTo='CookieClickerGame';
		if (Game.beta) Game.SaveTo='CookieClickerGameBeta';
		l('versionNumber').innerHTML='v.'+Game.version+(Game.beta?' <span style="color:#ff0;">beta</span>':'');
		l('links').innerHTML=(Game.beta?'<a href="../" target="blank">Live version</a> | ':'<a href="beta" target="blank">Try the beta!</a> | ')+'<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Cookie Clicker Classic</a>';
		//l('links').innerHTML='<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Cookie Clicker Classic</a>';
		
		//latency compensator stuff
		Game.time=new Date().getTime();
		Game.fpsMeasure=new Date().getTime();
		Game.accumulatedDelay=0;
		Game.catchupLogic=0;
		
		Game.cookiesEarned=0;//all cookies earned during gameplay
		Game.cookies=0;//cookies
		Game.cookiesd=0;//cookies display
		Game.cookiesPs=1;//cookies per second (to recalculate with every new purchase)
		Game.cookiesReset=0;//cookies lost to resetting
		Game.frenzy=0;//as long as >0, cookie production is multiplied by frenzyPower
		Game.frenzyPower=1;
		Game.clickFrenzy=0;//as long as >0, mouse clicks get 777x more cookies
		Game.cookieClicks=0;//+1 for each click on the cookie
		Game.goldenClicks=0;//+1 for each golden cookie clicked (all time)
		Game.goldenClicksLocal=0;//+1 for each golden cookie clicked (this game only)
		Game.missedGoldenClicks=0;//+1 for each golden cookie missed
		Game.handmadeCookies=0;//all the cookies made from clicking the cookie
		Game.milkProgress=0;//you gain a little bit for each achievement. Each increment of 1 is a different milk displayed.
		Game.milkH=Game.milkProgress/2;//milk height, between 0 and 1 (although should never go above 0.5)
		Game.milkHd=0;//milk height display
		Game.milkType=-1;//custom milk : 0=plain, 1=chocolate...
		Game.backgroundType=-1;//custom background : 0=blue, 1=red...
		Game.prestige=[];//cool stuff that carries over beyond resets
		Game.resets=0;//reset counter
		
		Game.elderWrath=0;
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
		
		Game.bg='';//background (grandmas and such)
		Game.bgFade='';//fading to background
		Game.bgR=0;//ratio (0 - not faded, 1 - fully faded)
		Game.bgRd=0;//ratio displayed
		
		Game.startDate=parseInt(new Date().getTime());//when we started playing
		Game.fullDate=parseInt(new Date().getTime());//when we started playing (carries over with resets)
		Game.lastDate=parseInt(new Date().getTime());//when we last saved the game (used to compute "cookies made since we closed the game" etc)
		
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
		}
		Game.DefaultPrefs();
		
		window.onbeforeunload=function(event)
		{
			if (Game.prefs.warn)
			{
				if (typeof event=='undefined') event=window.event;
				if (event) event.returnValue='Are you sure you want to close Cookie Clicker?\n(you might have some un-popped wrinklers!)';
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
			if (parseFloat(r[0])>Game.version)
			{
				var str='<b>New version available : v.'+r[0]+'!</b>';
				if (r[1]) str+='<br>Update note : "'+r[1]+'"';
				str+='<br><b>Refresh to get it!</b>';
				l('alert').innerHTML=str;
				l('alert').style.display='block';
			}
		}
		
		/*=====================================================================================
		SAVE
		=======================================================================================*/
		Game.ExportSave=function()
		{
			var save=prompt('Copy this text and keep it somewhere safe!',Game.WriteSave(1));
		}
		Game.ImportSave=function()
		{
			var save=prompt('Please paste in the text that was given to you on save export.','');
			if (save && save!='') Game.LoadSave(save);
			Game.WriteSave();
		}
		
		Game.WriteSave=function(exporting)//guess what we'e using to save the game?
		{
			Game.lastDate=parseInt(new Date().getTime());
			var str='';
			str+=Game.version+'|';
			str+='|';//just in case we need some more stuff here
			str+=//save stats
			parseInt(Game.startDate)+';'+
			parseInt(Game.fullDate)+';'+
			parseInt(Game.lastDate)+
			'|';
			str+=//prefs
			(Game.prefs.particles?'1':'0')+
			(Game.prefs.numbers?'1':'0')+
			(Game.prefs.autosave?'1':'0')+
			(Game.prefs.autoupdate?'1':'0')+
			(Game.prefs.milk?'1':'0')+
			(Game.prefs.fancy?'1':'0')+
			(Game.prefs.warn?'1':'0')+
			(Game.prefs.cursors?'1':'0')+
			'|';
			str+=parseFloat(Game.cookies).toString()+';'+
			parseFloat(Game.cookiesEarned).toString()+';'+
			parseInt(Math.floor(Game.cookieClicks))+';'+
			parseInt(Math.floor(Game.goldenClicks))+';'+
			parseFloat(Game.handmadeCookies).toString()+';'+
			parseInt(Math.floor(Game.missedGoldenClicks))+';'+
			parseInt(Math.floor(Game.backgroundType))+';'+
			parseInt(Math.floor(Game.milkType))+';'+
			parseFloat(Game.cookiesReset).toString()+';'+
			parseInt(Math.floor(Game.elderWrath))+';'+
			parseInt(Math.floor(Game.pledges))+';'+
			parseInt(Math.floor(Game.pledgeT))+';'+
			parseInt(Math.floor(Game.nextResearch))+';'+
			parseInt(Math.floor(Game.researchT))+';'+
			parseInt(Math.floor(Game.resets))+';'+
			parseInt(Math.floor(Game.goldenClicksLocal))+';'+
			parseFloat(Game.cookiesSucked).toString()+';'+
			parseInt(Math.floor(Game.wrinklersPopped))+';'+
			parseInt(Math.floor(Game.santaLevel))+';'+
			parseInt(Math.floor(Game.reindeerClicked))+
			'|';//cookies
			for (var i in Game.Objects)//buildings
			{
				var me=Game.Objects[i];
				str+=me.amount+','+me.bought+','+Math.floor(me.totalCookies)+','+(me.specialUnlocked?1:0)+';';
			}
			str+='|';
			var toCompress=[];
			for (var i in Game.Upgrades)//upgrades
			{
				var me=Game.Upgrades[i];
				toCompress.push(Math.min(me.unlocked,1),Math.min(me.bought,1));
			}
			toCompress=CompressLargeBin(toCompress);
			str+=toCompress;
			str+='|';
			var toCompress=[];
			for (var i in Game.Achievements)//achievements
			{
				var me=Game.Achievements[i];
				toCompress.push(Math.min(me.won));
			}
			toCompress=CompressLargeBin(toCompress);
			str+=toCompress;
			
			
			if (exporting)
			{
				str=escape(utf8_to_b64(str)+'!END!');
				return str;
			}
			else
			{
				//that's right
				//we're using cookies
				//yeah I went there
				var now=new Date();//we storin dis for 5 years, people
				now.setFullYear(now.getFullYear()+5);//mmh stale cookies
				str=utf8_to_b64(str)+'!END!';
				Game.saveData=escape(str);
				if (Game.mobile==1) Game.m.writeSaveRequest();//save on mobile
				else
				{
					str=Game.SaveTo+'='+escape(str)+'; expires='+now.toUTCString()+';';
					document.cookie=str;//aaand save
					if (document.cookie.indexOf(Game.SaveTo)<0) Game.Popup('Error while saving.<br>Export your save instead!');
					else Game.Popup('Game saved');
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
				if (Game.mobile==1) {Game.m.readSaveRequest();return;}//get saved file here
				else {if (document.cookie.indexOf(Game.SaveTo)>=0) str=unescape(document.cookie.split(Game.SaveTo+'=')[1]);}//get cookie here
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
					if (isNaN(version) || str.length<5) {Game.Popup('Oops, looks like the import string is all wrong!');return 0;}
					if (version>=1 && version>Game.version)
					{
						alert('Error : you are attempting to load a save from a future version (v.'+version+'; you are using v.'+Game.version+').');
						return 0;
					}
					else if (version>=1)
					{
						spl=str[2].split(';');//save stats
						Game.startDate=parseInt(spl[0]);
						Game.fullDate=parseInt(spl[1]);
						Game.lastDate=parseInt(spl[2]);
						spl=str[3].split('');//prefs
						Game.prefs.particles=parseInt(spl[0]);
						Game.prefs.numbers=parseInt(spl[1]);
						Game.prefs.autosave=parseInt(spl[2]);
						Game.prefs.autoupdate=spl[3]?parseInt(spl[3]):1;
						Game.prefs.milk=spl[4]?parseInt(spl[4]):1;
						Game.prefs.fancy=parseInt(spl[5]);if (Game.prefs.fancy) Game.removeClass('noFancy'); else if (!Game.prefs.fancy) Game.addClass('noFancy');
						Game.prefs.warn=spl[6]?parseInt(spl[6]):0;
						Game.prefs.cursors=spl[7]?parseInt(spl[7]):0;
						spl=str[4].split(';');//cookies
						Game.cookies=parseFloat(spl[0]);Game.cookiesEarned=parseFloat(spl[1]);
						Game.cookieClicks=spl[2]?parseInt(spl[2]):0;
						Game.goldenClicks=spl[3]?parseInt(spl[3]):0;
						Game.handmadeCookies=spl[4]?parseFloat(spl[4]):0;
						Game.missedGoldenClicks=spl[5]?parseInt(spl[5]):0;
						Game.backgroundType=spl[6]?parseInt(spl[6]):0;
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
						spl=str[5].split(';');//buildings
						Game.BuildingsOwned=0;
						for (var i in Game.ObjectsById)
						{
							var me=Game.ObjectsById[i];
							if (spl[i])
							{
								var mestr=spl[i].toString().split(',');
								me.amount=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);me.totalCookies=parseInt(mestr[2]);me.specialUnlocked=parseInt(mestr[3]);
								Game.BuildingsOwned+=me.amount;
							}
							else
							{
								me.unlocked=0;me.bought=0;me.totalCookies=0;
							}
						}
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
									if (me.bought && me.hide!=3) Game.UpgradesOwned++;
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
								if (me.won && me.hide!=3) Game.AchievementsOwned++;
							}
						}
						else
						{
							if (str[6]) spl=str[6]; else spl=[];//upgrades
							spl=UncompressLargeBin(spl);
							Game.UpgradesOwned=0;
							for (var i in Game.UpgradesById)
							{
								var me=Game.UpgradesById[i];
								if (spl[i*2])
								{
									var mestr=[spl[i*2],spl[i*2+1]];
									me.unlocked=parseInt(mestr[0]);me.bought=parseInt(mestr[1]);
									if (me.bought && me.hide!=3) Game.UpgradesOwned++;
								}
								else
								{
									me.unlocked=0;me.bought=0;
								}
							}
							if (str[7]) spl=str[7]; else spl=[];//achievements
							spl=UncompressLargeBin(spl);
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
								if (me.won && me.hide!=3) Game.AchievementsOwned++;
							}
						}
						
						if (version<1.038)
						{
							Game.Achievements['Hardcore'].won=0;
							Game.Achievements['Speed baking I'].won=0;
							Game.Achievements['Speed baking II'].won=0;
							Game.Achievements['Speed baking III'].won=0;
						}
						
						for (var i in Game.ObjectsById)
						{
							var me=Game.ObjectsById[i];
							if (me.buyFunction) me.buyFunction();
							me.setSpecial(0);
							if (me.special && me.specialUnlocked==1) me.special();
							me.refresh();
						}
						
						Game.ResetWrinklers();
						/*//why was this here ?
						Game.cookiesSucked=0;
						Game.wrinklersPopped=0;
						
						Game.santaLevel=0;
						Game.reindeerClicked=0;
						*/
			
						Game.CalculateGains();
						
						//compute cookies earned while the game was closed
						if (Game.mobile || Game.Has('Perfect idling'))
						{
							var amount=((new Date().getTime()-Game.lastDate)/1000)*Game.cookiesPs;
							if (amount>0)
							{
								Game.Popup('Earned '+Beautify(amount)+' cookie'+(Math.floor(amount)==1?'':'s')+' while you were away');
								Game.Earn(amount);
							}
						}
						
					}
					else//importing old version save
					{
						/*
						Game.startDate=parseInt(new Date().getTime());
						Game.cookies=parseInt(str[1]);
						Game.cookiesEarned=parseInt(str[1]);
						
						for (var i in Game.ObjectsById)
						{
							var me=Game.ObjectsById[i];
							me.amount=0;me.bought=0;me.totalCookies=0;
							me.refresh();
						}
						for (var i in Game.UpgradesById)
						{
							var me=Game.UpgradesById[i];
							me.unlocked=0;me.bought=0;
						}
						
						var moni=0;
						moni+=15*Math.pow(1.1,parseInt(str[2]));
						moni+=100*Math.pow(1.1,parseInt(str[4]));
						moni+=500*Math.pow(1.1,parseInt(str[6]));
						moni+=2000*Math.pow(1.1,parseInt(str[8]));
						moni+=7000*Math.pow(1.1,parseInt(str[10]));
						moni+=50000*Math.pow(1.1,parseInt(str[12]));
						moni+=1000000*Math.pow(1.1,parseInt(str[14]));
						if (parseInt(str[16])) moni+=123456789*Math.pow(1.1,parseInt(str[16]));
						
						alert('Imported old save from version '+version+'; recovered '+Beautify(Game.cookies)+' cookies, and converted buildings back to '+Beautify(moni)+' cookies.');
						
						Game.cookies+=moni;
						Game.cookiesEarned+=moni;
						*/
						alert('Sorry, you can\'t import saves from the old version anymore.');
						return;
					}
					
						
					Game.goldenCookie.reset();
					Game.seasonPopup.reset();
			
					Game.prestige=[];
					
					Game.Upgrades['Elder Pledge'].basePrice=Math.pow(8,Math.min(Game.pledges+2,14));
					
					Game.RebuildUpgrades();
					
					Game.TickerAge=0;
					
					Game.elderWrathD=0;
					Game.frenzy=0;
					Game.frenzyPower=1;
					Game.clickFrenzy=0;
					Game.recalculateGains=1;
					Game.storeToRebuild=1;
					Game.upgradesToRebuild=1;
					Game.Popup('Game loaded');
				}
			}
		}
		
		/*=====================================================================================
		RESET
		=======================================================================================*/
		Game.Reset=function(bypass)
		{
			if (bypass || confirm('Do you REALLY want to start over?\n(your will lose your progress, but you will keep your achievements and your prestige.)'))
			{
				if (!bypass)
				{
					if (Game.cookiesEarned>=1000000) Game.Win('Sacrifice');
					if (Game.cookiesEarned>=1000000000) Game.Win('Oblivion');
					if (Game.cookiesEarned>=1000000000000) Game.Win('From scratch');
					if (Game.cookiesEarned>=1000000000000000) Game.Win('Nihilism');
				}
				
				
				Game.cookiesReset+=Game.cookiesEarned;
				Game.cookies=0;
				Game.cookiesEarned=0;
				Game.cookieClicks=0;
				Game.goldenClicksLocal=0;
				//Game.goldenClicks=0;
				//Game.missedGoldenClicks=0;
				Game.handmadeCookies=0;
				Game.backgroundType=-1;
				Game.milkType=-1;
				Game.frenzy=0;
				Game.frenzyPower=1;
				Game.clickFrenzy=0;
				Game.pledges=0;
				Game.pledgeT=0;
				Game.elderWrath=0;
				Game.nextResearch=0;
				Game.researchT=0;
				
				Game.startDate=parseInt(new Date().getTime());
				Game.lastDate=parseInt(new Date().getTime());
				
				Game.cookiesSucked=0;
				Game.wrinklersPopped=0;
				Game.ResetWrinklers();
				
				Game.santaLevel=0;
				Game.reindeerClicked=0;
				
				Game.resets++;
				Game.Upgrades['Elder Pledge'].basePrice=Math.pow(8,Math.min(Game.pledges+2,14));
				for (var i in Game.ObjectsById)
				{
					var me=Game.ObjectsById[i];
					me.amount=0;me.bought=0;me.totalCookies=0;me.specialUnlocked=0;
					me.setSpecial(0);
					me.refresh();
				}
				for (var i in Game.UpgradesById)
				{
					var me=Game.UpgradesById[i];
					me.unlocked=0;me.bought=0;
				}
				/*
				for (var i in Game.AchievementsById)
				{
					var me=Game.AchievementsById[i];
					me.won=0;
				}*/
				//Game.DefaultPrefs();
				Game.BuildingsOwned=0;
				Game.UpgradesOwned=0;
				Game.RebuildUpgrades();
				Game.TickerAge=0;
				Game.recalculateGains=1;
				Game.storeToRebuild=1;
				Game.upgradesToRebuild=1;
				Game.goldenCookie.reset();
				Game.seasonPopup.reset();
				
				Game.Popup('Game reset');
				
				if (!bypass)
				{
					var prestige=0;
					if (Game.prestige.ready) prestige=Game.prestige['Heavenly chips'];
					Game.prestige=[];
					Game.CalculatePrestige();
					prestige=Game.prestige['Heavenly chips']-prestige;
					if (prestige!=0) Game.Popup('You earn '+prestige+' heavenly chip'+(prestige==1?'':'s')+'!');
				}
			}
		}
		Game.HardReset=function()
		{
			if (confirm('Do you REALLY want to wipe your save?\n(you will lose your progress, your achievements, and your prestige!)'))
			{
				if (confirm('Whoah now, are you really, REALLY sure?\n(don\'t say we didn\'t warn you!)'))
				{
					for (var i in Game.AchievementsById)
					{
						var me=Game.AchievementsById[i];
						me.won=0;
					}
					Game.AchievementsOwned=0;
					Game.goldenClicks=0;
					Game.missedGoldenClicks=0;
					Game.Reset(1);
					Game.resets=0;
					Game.fullDate=parseInt(new Date().getTime());
					Game.cookiesReset=0;
					Game.prestige=[];
					Game.CalculatePrestige();
				}
			}
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
		}
		Game.mouseCps=function()
		{
			var add=0;
			if (Game.Has('Thousand fingers')) add+=0.1;
			if (Game.Has('Million fingers')) add+=0.5;
			if (Game.Has('Billion fingers')) add+=2;
			if (Game.Has('Trillion fingers')) add+=10;
			if (Game.Has('Quadrillion fingers')) add+=20;
			if (Game.Has('Quintillion fingers')) add+=100;
			if (Game.Has('Sextillion fingers')) add+=200;
			var num=0;
			for (var i in Game.Objects) {num+=Game.Objects[i].amount;}
			num-=Game.Objects['Cursor'].amount;
			add=add*num;
			if (Game.Has('Plastic mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Iron mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Titanium mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Adamantium mouse')) add+=Game.cookiesPs*0.01;
			if (Game.Has('Unobtainium mouse')) add+=Game.cookiesPs*0.01;
			var mult=1;
			if (Game.Has('Santa\'s helpers')) mult*=1.1;
			if (Game.clickFrenzy>0) mult*=777;
			return mult*Game.ComputeCps(1,Game.Has('Reinforced index finger'),Game.Has('Carpal tunnel prevention cream')+Game.Has('Ambidextrous'),add);
		}
		Game.computedMouseCps=1;
		Game.globalCpsMult=1;
		Game.lastClick=0;
		Game.autoclickerDetected=0;
		Game.BigCookieState=0;
		Game.BigCookieSize=0;
		Game.ClickCookie=function(event)
		{
			if (event) event.preventDefault();
			if (new Date().getTime()-Game.lastClick<1000/250)
			{
			}
			else
			{
				if (new Date().getTime()-Game.lastClick<1000/15)
				{
					Game.autoclickerDetected+=Game.fps;
					if (Game.autoclickerDetected>=Game.fps*5) Game.Win('Uncanny clicker');
				}
				Game.Earn(Game.computedMouseCps);
				Game.handmadeCookies+=Game.computedMouseCps;
				if (Game.prefs.particles)
				{
					Game.particleAdd();
					Game.particleAdd(Game.mouseX,Game.mouseY,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.2,1,2);
				}
				if (Game.prefs.numbers) Game.particleAdd(Game.mouseX+Math.random()*8-4,Game.mouseY-8+Math.random()*8-4,0,-2,1,4,2,'','+'+Beautify(Game.computedMouseCps,1));
				Game.cookieClicks++;
			}
			Game.lastClick=new Date().getTime();
		}
		Game.mouseX=0;
		Game.mouseY=0;
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
			var el=l('sectionLeft');
			var x=0;
			var y=0;
			while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop))
			{
				x+=el.offsetLeft-el.scrollLeft;
				y+=el.offsetTop-el.scrollTop;
				el=el.offsetParent;
			}
			Game.mouseX=posx-x;//Math.min(Game.w,Math.max(0,posx-x));
			Game.mouseY=posy-y;//Math.min(Game.h,Math.max(0,posy-y));
		}
		var bigCookie=l('bigCookie');
		AddEvent(bigCookie,'click',Game.ClickCookie);
		AddEvent(bigCookie,'mousedown',function(event){Game.BigCookieState=1;if (event) event.preventDefault();});
		AddEvent(bigCookie,'mouseup',function(event){Game.BigCookieState=2;if (event) event.preventDefault();});
		AddEvent(bigCookie,'mouseout',function(event){Game.BigCookieState=0;});
		AddEvent(bigCookie,'mouseover',function(event){Game.BigCookieState=2;});
		AddEvent(document,'mousemove',Game.GetMouseCoords);
		Game.Click=0;
		AddEvent(document,'click',function(event){Game.Click=1;});
		
		Game.HowMuchPrestige=function(cookies)
		{
			var prestige=cookies/1000000000000;
			//prestige=Math.max(0,Math.floor(Math.pow(prestige,0.5)));//old version
			prestige=Math.max(0,Math.floor((-1+Math.pow(1+8*prestige,0.5))/2));//geometric progression
			return prestige;
		}
		Game.CalculatePrestige=function()
		{
			var prestige=Game.HowMuchPrestige(Game.cookiesReset);
			Game.prestige=[];
			Game.prestige['Heavenly chips']=prestige;
			Game.prestige.ready=1;
		}
		/*=====================================================================================
		CPS RECALCULATOR
		=======================================================================================*/
		Game.recalculateGains=1;
		Game.CalculateGains=function()
		{
			Game.cookiesPs=0;
			var mult=1;
			for (var i in Game.Upgrades)
			{
				var me=Game.Upgrades[i];
				if (me.bought>0)
				{
					if (me.type=='cookie' && Game.Has(me.name)) mult+=me.power*0.01;
				}
			}
			mult+=Game.Has('Specialized chocolate chips')*0.01;
			mult+=Game.Has('Designer cocoa beans')*0.02;
			mult+=Game.Has('Underworld ovens')*0.03;
			mult+=Game.Has('Exotic nuts')*0.04;
			mult+=Game.Has('Arcane sugar')*0.05;
			
			if (Game.Has('Increased merriness')) mult+=0.15;
			if (Game.Has('Improved jolliness')) mult+=0.15;
			if (Game.Has('A lump of coal')) mult+=0.01;
			if (Game.Has('An itchy sweater')) mult+=0.01;
			if (Game.Has('Santa\'s dominion')) mult+=0.5;
			
			if (Game.Has('Santa\'s legacy')) mult+=(Game.santaLevel+1)*0.1;
			
			if (!Game.prestige.ready) Game.CalculatePrestige();
			var heavenlyMult=0;
			if (Game.Has('Heavenly chip secret')) heavenlyMult+=0.05;
			if (Game.Has('Heavenly cookie stand')) heavenlyMult+=0.20;
			if (Game.Has('Heavenly bakery')) heavenlyMult+=0.25;
			if (Game.Has('Heavenly confectionery')) heavenlyMult+=0.25;
			if (Game.Has('Heavenly key')) heavenlyMult+=0.25;
			mult+=parseFloat(Game.prestige['Heavenly chips'])*0.02*heavenlyMult;
			
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.storedCps=(typeof(me.cps)=='function'?me.cps():me.cps);
				me.storedTotalCps=me.amount*me.storedCps;
				Game.cookiesPs+=me.storedTotalCps;
			}
			
			var milkMult=Game.Has('Santa\'s milk and cookies')?1.05:1;
			if (Game.Has('Kitten helpers')) mult*=(1+Game.milkProgress*0.05*milkMult);
			if (Game.Has('Kitten workers')) mult*=(1+Game.milkProgress*0.1*milkMult);
			if (Game.Has('Kitten engineers')) mult*=(1+Game.milkProgress*0.2*milkMult);
			if (Game.Has('Kitten overseers')) mult*=(1+Game.milkProgress*0.2*milkMult);
			
			var rawCookiesPs=Game.cookiesPs*mult;
			for (var i=0;i<Game.cpsAchievs.length/2;i++)
			{
				if (rawCookiesPs>=Game.cpsAchievs[i*2+1]) Game.Win(Game.cpsAchievs[i*2]);
			}
			
			if (Game.frenzy>0) mult*=Game.frenzyPower;
			
			var sucked=1;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase==2) sucked-=1/20;
			}
			Game.cpsSucked=(1-sucked);
			
			if (Game.Has('Elder Covenant')) mult*=0.95;
			
			Game.globalCpsMult=mult;
			Game.cookiesPs*=Game.globalCpsMult;			
			
			Game.computedMouseCps=Game.mouseCps();
			
			Game.recalculateGains=0;
		}
		/*=====================================================================================
		GOLDEN COOKIE
		=======================================================================================*/
		Game.goldenCookie={x:0,y:0,life:0,time:0,minTime:0,maxTime:0,dur:13,toDie:1,wrath:0,chain:0,last:''};
		Game.goldenCookie.reset=function()
		{
			this.life=1;//the cookie's current progression through its lifespan
			this.time=0;//the amount of time since the cookie has last been clicked
			this.minTime=this.getMinTime();//the minimum amount of time we must wait for the cookie to spawn
			this.maxTime=this.getMaxTime();//the maximum amount of time we must wait for the cookie to spawn
			this.dur=13;//duration; the cookie's lifespan before it despawns
			this.toDie=1;//should the cookie despawn? (I think that's what it does?)
			this.last='';//what was the last cookie effect?
			this.chain=0;//how far in the chain are we?
		}
		Game.goldenCookie.getMinTime=function()
		{
			var m=5;
			if (Game.Has('Lucky day')) m/=2;
			if (Game.Has('Serendipity')) m/=2;
			if (this.chain>0) m=0.05;
			if (Game.Has('Gold hoard')) m=0.01;
			return Math.ceil(Game.fps*60*m);
		}
		Game.goldenCookie.getMaxTime=function()
		{
			var m=15;
			if (Game.Has('Lucky day')) m/=2;
			if (Game.Has('Serendipity')) m/=2;
			if (this.chain>0) m=0.05;
			if (Game.Has('Gold hoard')) m=0.01;
			return Math.ceil(Game.fps*60*m);
		}
		Game.goldenCookie.spawn=function()
		{
			if (this.time<this.minTime || this.life>0) Game.Win('Cheated cookies taste awful');
			
			var me=l('goldenCookie');
			if ((Game.elderWrath==1 && Math.random()<0.33) || (Game.elderWrath==2 && Math.random()<0.66) || (Game.elderWrath==3))
			{
				this.wrath=1;
				if (Game.season=='halloween') me.style.background='url(img/spookyCookie.png)';
				else me.style.background='url(img/wrathCookie.png)';
			}
			else
			{
				this.wrath=0;
				me.style.background='url(img/goldCookie.png)';
			}
			//fancy visual stuff
			var r=Math.floor(Math.random()*360);
			if (Game.season=='halloween' && this.wrath) r=Math.floor(Math.random()*36-18);
			me.style.transform='rotate('+r+'deg)';
			me.style.mozTransform='rotate('+r+'deg)';
			me.style.webkitTransform='rotate('+r+'deg)';
			me.style.msTransform='rotate('+r+'deg)';
			me.style.oTransform='rotate('+r+'deg)';
			var screen=l('game').getBoundingClientRect();
			this.x=Math.floor(Math.random()*Math.max(0,(screen.right-300)-screen.left-128)+screen.left+64)-64;
			this.y=Math.floor(Math.random()*Math.max(0,screen.bottom-screen.top-128)+screen.top+64)-64;
			me.style.left=this.x+'px';
			me.style.top=this.y+'px';
			me.style.display='block';
			//how long will it stay on-screen?
			var dur=13;
			if (Game.Has('Lucky day')) dur*=2;
			if (Game.Has('Serendipity')) dur*=2;
			if (this.chain>0) dur=Math.max(1,10/this.chain);//this is hilarious
			this.dur=dur;
			this.life=Math.ceil(Game.fps*this.dur);
			this.time=0;
			this.toDie=0;
		}
		Game.goldenCookie.update=function()
		{
			if (this.toDie==0 && this.life<=0 && Math.random()<Math.pow(Math.max(0,(this.time-this.minTime)/(this.maxTime-this.minTime)),5)) this.spawn();
			if (this.life>0)
			{
				this.life--;
				l('goldenCookie').style.opacity=1-Math.pow((this.life/(Game.fps*this.dur))*2-1,4);
				if (this.life==0 || this.toDie==1)
				{
					if (this.life==0) this.chain=0;
					l('goldenCookie').style.display='none';
					if (this.toDie==0) Game.missedGoldenClicks++;
					this.toDie=0;
					this.life=0;
				}
			}
			else this.time++;
		}
		Game.goldenCookie.choose=function()
		{
			var list=[];
			if (this.wrath>0) list.push('clot','multiply cookies','ruin cookies');
			else list.push('frenzy','multiply cookies');
			if (this.wrath>0 && Math.random()<0.3) list.push('blood frenzy','chain cookie');
			else if (Math.random()<0.01 && Game.cookiesEarned>=100000) list.push('chain cookie');
			if (Math.random()<0.1) list.push('click frenzy');
			if (this.last!='' && Math.random()<0.8 && list.indexOf(this.last)!=-1) list.splice(list.indexOf(this.last),1);//80% chance to force a different one
			if (Math.random()<0.0001) list.push('blab');
			var choice=choose(list);
			return choice;
		}
		Game.goldenCookie.click=function()
		{
			var me=Game.goldenCookie;
			if (me.life>0)
			{
				me.toDie=1;
				Game.goldenClicks++;
				Game.goldenClicksLocal++;
				
				if (Game.goldenClicks>=1) Game.Win('Golden cookie');
				if (Game.goldenClicks>=7) Game.Win('Lucky cookie');
				if (Game.goldenClicks>=27) Game.Win('A stroke of luck');
				if (Game.goldenClicks>=77) Game.Win('Fortune');
				if (Game.goldenClicks>=777) Game.Win('Leprechaun');
				if (Game.goldenClicks>=7777) Game.Win('Black cat\'s paw');
				
				//change to goldenClicksLocal later
				if (Game.goldenClicks>=7) Game.Unlock('Lucky day');
				if (Game.goldenClicks>=27) Game.Unlock('Serendipity');
				if (Game.goldenClicks>=77) Game.Unlock('Get lucky');
				
				l('goldenCookie').style.display='none';
				
				var choice=me.choose();
				
				if (me.chain>0) choice='chain cookie';
				me.last=choice;
				
				if (choice!='chain cookie') me.chain=0;
				if (choice=='frenzy')
				{
					var time=77+77*Game.Has('Get lucky');
					Game.frenzy=Game.fps*time;
					Game.frenzyPower=7;
					Game.recalculateGains=1;
					Game.Popup('Frenzy : cookie production x7 for '+time+' seconds!');
				}
				else if (choice=='multiply cookies')
				{
					var moni=Math.min(Game.cookies*0.1,Game.cookiesPs*60*20)+13;//add 10% to cookies owned (+13), or 20 minutes of cookie production - whichever is lowest
					Game.Earn(moni);
					Game.Popup('Lucky! +'+Beautify(moni)+' cookies!');
				}
				else if (choice=='ruin cookies')
				{
					var moni=Math.min(Game.cookies*0.05,Game.cookiesPs*60*10)+13;//lose 5% of cookies owned (-13), or 10 minutes of cookie production - whichever is lowest
					moni=Math.min(Game.cookies,moni);
					Game.Spend(moni);
					Game.Popup('Ruin! Lost '+Beautify(moni)+' cookies!');
				}
				else if (choice=='blood frenzy')
				{
					var time=6+6*Game.Has('Get lucky');
					Game.frenzy=Game.fps*time;//*2;//we shouldn't need *2 but I keep getting reports of it lasting only 3 seconds
					Game.frenzyPower=666;
					Game.recalculateGains=1;
					Game.Popup('Elder frenzy : cookie production x666 for '+time+' seconds!');
				}
				else if (choice=='clot')
				{
					var time=66+66*Game.Has('Get lucky');
					Game.frenzy=Game.fps*time;
					Game.frenzyPower=0.5;
					Game.recalculateGains=1;
					Game.Popup('Clot : cookie production halved for '+time+' seconds!');
				}
				else if (choice=='click frenzy')
				{
					var time=13+13*Game.Has('Get lucky');
					Game.clickFrenzy=Game.fps*time;
					Game.recalculateGains=1;
					Game.Popup('Click frenzy! Clicking power x777 for '+time+' seconds!');
				}
				else if (choice=='chain cookie')
				{
					me.chain++;
					var digit='7';
					if (me.wrath) digit='6';
					var moni='';
					for (var i=0;i<me.chain;i++) {moni+=digit;}
					moni=parseFloat(moni);
					var nextMoni='';
					for (var i=0;i<=me.chain;i++) {nextMoni+=digit;}//there's probably a better way to handle this but ah well
					nextMoni=parseFloat(nextMoni);
					if ((Math.random()<0.01 || nextMoni>=Game.cookies*0.25 || nextMoni>Game.cookiesPs*60*60*6) && me.chain>4)//break the chain if we're above 5 digits AND it's more than 25% of our bank, it grants more than six hours of our CpS, or just a 1% chance each digit
					{
						me.chain=0;
						Game.Popup('Cookie chain : +'+Beautify(moni)+' cookies!<br>Cookie chain over.');
					}
					else Game.Popup('Cookie chain : +'+Beautify(moni)+' cookies!');
					Game.Earn(moni);
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
					'Thanks! That hit the spot!'
					]);
					Game.Popup(str);
				}
				
				me.minTime=me.getMinTime();
				me.maxTime=me.getMaxTime();
			}
		}
		l('goldenCookie').onclick=Game.goldenCookie.click;
		
		/*=====================================================================================
		SEASON POPUP
		=======================================================================================*/
		Game.seasonPopup={x:0,y:0,life:0,time:0,minTime:0,maxTime:0,dur:4,toDie:1,last:'',type:'',bounds:{}};
		Game.seasonPopup.reset=function()
		{
			this.life=1;//the popup's current progression through its lifespan
			this.time=0;//the amount of time since the popup has last been clicked
			this.minTime=this.getMinTime();//the minimum amount of time we must wait for the popup to spawn
			this.maxTime=this.getMaxTime();//the maximum amount of time we must wait for the popup to spawn
			this.dur=4;//duration; the popup's lifespan before it despawns
			this.toDie=1;//should the popup despawn? (I think that's what it does?)
			this.last='';//what was the last popup effect?
			this.type='';//is it a reindeer? what the hell is it? no seriously
			this.bounds=l('game').getBoundingClientRect();
		}
		Game.seasonPopup.getMinTime=function()
		{
			var m=3;
			//time bonuses go here
			if (Game.Has('Reindeer baking grounds')) m/=2;
			if (Game.Has('Reindeer season')) m=0.01;
			return Math.ceil(Game.fps*60*m);
		}
		Game.seasonPopup.getMaxTime=function()
		{
			var m=6;
			//time bonuses go here
			if (Game.Has('Reindeer baking grounds')) m/=2;
			if (Game.Has('Reindeer season')) m=0.01;
			return Math.ceil(Game.fps*60*m);
		}
		Game.seasonPopup.spawn=function()
		{
			if (this.time<this.minTime || this.life>0) Game.Win('Cheated cookies taste awful');
			
			var me=l('seasonPopup');
			
			if (this.type=='reindeer')
			{
				me.style.backgroundImage='url(img/frostedReindeer.png)';
			}
			
			//fancy visual stuff
			this.bounds=l('game').getBoundingClientRect();
			//this.x=Math.floor(Math.random()*Math.max(0,(screen.right-300)-screen.left-128)+screen.left+64)-64;
			//this.y=Math.floor(Math.random()*Math.max(0,screen.bottom-screen.top-128)+screen.top+64)-64;
			this.x=-128;
			this.y=Math.floor(Math.random()*Math.max(0,this.bounds.bottom-this.bounds.top-256)+this.bounds.top+128)-128;
			me.style.left=this.x+'px';
			me.style.top=this.y+'px';
			me.style.display='block';
			//how long will it stay on-screen?
			var dur=4;
			if (Game.Has('Weighted sleighs')) dur*=2;
			this.dur=dur;
			this.life=Math.ceil(Game.fps*this.dur);
			this.time=0;
			this.toDie=0;
		}
		Game.seasonPopup.update=function()
		{
			if (this.toDie==0 && this.life<=0 && Math.random()<Math.pow(Math.max(0,(this.time-this.minTime)/(this.maxTime-this.minTime)),5)) 
			{
				if (Game.season=='christmas')
				{
					this.type='reindeer';
					this.spawn();
				}
			}
			if (this.life>0)
			{
				this.life--;
				var me=l('seasonPopup');
				me.style.opacity=1-Math.pow((this.life/(Game.fps*this.dur))*2-1,12);
				this.x=Math.floor((1-this.life/(Game.fps*this.dur))*(this.bounds.right-this.bounds.left))-128;
				me.style.left=this.x+'px';
				me.style.top=this.y-Math.floor(Math.abs(Math.pow(Math.sin(this.life*0.05),1))*128)+'px';
				if (this.life==0 || Game.seasonPopup.toDie==1)
				{
					if (this.life==0) this.chain=0;
					l('seasonPopup').style.display='none';
					this.toDie=0;
					this.life=0;
				}
			}
			else this.time++;
		}
		Game.seasonPopup.click=function()
		{
			var me=Game.seasonPopup;
			if (me.life>0)
			{
				me.toDie=1;
				if (me.type=='reindeer')
				{
					Game.reindeerClicked++;
					
					var moni=Math.max(25,Game.cookiesPs*60*1);//1 minute of cookie production, or 25 cookies - whichever is highest
					if (Game.Has('Ho ho ho-flavored frosting')) moni*=2;
					Game.Earn(moni);
					
					var failRate=0.8;
					var cookie='';
					if (Game.HasAchiev('Let it snow')) failRate=0.6;
					if (Game.Has('Santa\'s bottomless bag')) failRate*=0.9;
					if (Math.random()>failRate)//christmas cookie drops
					{
						cookie=choose(['Christmas tree biscuits','Snowflake biscuits','Snowman biscuits','Mistletoe biscuits','Candy cane biscuits','Bell biscuits','Present biscuits']);
						if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
						{
							Game.Unlock(cookie);
						}
						else cookie='';
					}
					
					Game.Popup('You found '+choose(['Dasher','Dancer','Prancer','Vixen','Comet','Cupid','Donner','Blitzen','Rudolph'])+'!<br>The reindeer gives you '+Beautify(moni)+' cookies.'+(cookie==''?'':'<br>You are also rewarded with '+cookie+'!'));
				}
				l('seasonPopup').style.display='none';
				me.minTime=me.getMinTime();
				me.maxTime=me.getMaxTime();
			}
		}
		l('seasonPopup').onclick=Game.seasonPopup.click;
		
		
		/*=====================================================================================
		PARTICLES
		=======================================================================================*/		
		//generic particles (falling cookies etc)
		Game.particles=[];
		for (var i=0;i<50;i++)
		{
			Game.particles[i]={x:0,y:0,xd:0,yd:0,z:0,size:1,dur:2,life:-1,r:0,pic:'smallCookies.png',picId:0};
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
				me.pic=pic||'smallCookies.png';
				me.text=text||0;
			}
		}
		Game.particlesDraw=function(z)
		{
			Game.LeftBackground.fillStyle='#fff';
			Game.LeftBackground.font='20px Kavoon';
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
							Game.LeftBackground.drawImage(Game.Assets[me.pic],(me.picId%8)*64,0,64,64,-32*me.size,-32*me.size,64*me.size,64*me.size);
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
			Game.textParticlesY=0;
			for (var i in Game.textParticles)
			{
				var me=Game.textParticles[i];
				if (me.life!=-1)
				{
					Game.textParticlesY+=64;//me.l.clientHeight;
					var y=me.y-(1-Math.pow(1-me.life/(Game.fps*4),10))*50;
					//me.y=me.life*0.25+Math.random()*0.25;
					me.life++;
					var el=me.l;
					el.style.left=Math.floor(-200+me.x)+'px';
					el.style.bottom=Math.floor(-y)+'px';
					el.style.opacity=1-(me.life/(Game.fps*4));
					if (me.life>=Game.fps*4)
					{
						me.life=-1;
						el.style.opacity=0;
						el.style.display='none';
					}
				}
			}
		}
		Game.textParticlesAdd=function(text,el)
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
			var x=(Math.random()-0.5)*40;
			var y=0;//+(Math.random()-0.5)*40;
			if (!el)
			{
				var rect=l('game').getBoundingClientRect();
				var x=Math.floor((rect.left+rect.right)/2);
				var y=Math.floor((rect.bottom))-(Game.mobile*64);
				x+=(Math.random()-0.5)*40;
				y+=0;//(Math.random()-0.5)*40;
			}
			var me=Game.textParticles[i];
			if (!me.l) me.l=l('particle'+i);
			me.life=0;
			me.x=x;
			me.y=y-Game.textParticlesY;
			me.text=text;
			me.l.innerHTML=text;
			me.l.style.left=Math.floor(Game.textParticles[i].x-200)+'px';
			me.l.style.bottom=Math.floor(-Game.textParticles[i].y)+'px';
			me.l.style.display='block';
			Game.textParticlesY+=60;
		}
		Game.Popup=function(text)
		{
			Game.textParticlesAdd(text);
		}
		
		
		Game.veil=1;
		Game.veilOn=function()
		{
			//l('sectionMiddle').style.display='none';
			//l('sectionRight').style.display='none';
			//l('backgroundLayer2').style.background='#000 url(img/darkNoise.png)';
			Game.veil=1;
		}
		Game.veilOff=function()
		{
			//l('sectionMiddle').style.display='block';
			//l('sectionRight').style.display='block';
			//l('backgroundLayer2').style.background='transparent';
			Game.veil=0;
		}
		
		/*=====================================================================================
		MENUS
		=======================================================================================*/
		Game.cssClasses=[];
		Game.addClass=function(what) {if (Game.cssClasses.indexOf(what)==-1) Game.cssClasses.push(what);Game.updateClasses();}
		Game.removeClass=function(what) {var i=Game.cssClasses.indexOf(what);if(i!=-1) {Game.cssClasses.splice(i,1);}Game.updateClasses();}
		Game.updateClasses=function() {l('game').className=Game.cssClasses.join(' ');}
		
		Game.WriteButton=function(prefName,button,on,off,callback)
		{
			return '<a class="option" id="'+button+'" onclick="Game.Toggle(\''+prefName+'\',\''+button+'\',\''+on+'\',\''+off+'\');'+(callback||'')+'">'+(Game.prefs[prefName]?on:off)+'</a>';
		}
		Game.Toggle=function(prefName,button,on,off)
		{
			if (Game.prefs[prefName])
			{
				l(button).innerHTML=off;
				l(button).className='option';
				Game.prefs[prefName]=0;
			}
			else
			{
				l(button).innerHTML=on;
				l(button).className='option enabled';
				Game.prefs[prefName]=1;
			}
		}
		Game.ToggleFancy=function()
		{
			if (Game.prefs.fancy) Game.removeClass('noFancy');
			else if (!Game.prefs.fancy) Game.addClass('noFancy');
		}
		
		Game.WriteSelector=function(prefName,button,list,def,selected,callback)//def is default (which is a reserved keyword)
		{
			var str='';
			var me=0;
			for (var i in list)
			{
				me=Game.Upgrades[list[i]];
				str+='<div id="'+button+'-'+me.id+'" class="crate'+(me.name==selected?' enabled':'')+'" onclick="Game.Select(\''+prefName+'\',\''+button+'\',\''+me.id+'\');'+(callback||'')+'" '+Game.getTooltip(
					'<div style="min-width:200px;"><div class="name" style="text-align:center;">'+me.name+'</div><!--<div class="description">'+me.desc+'</div>--></div>'
					,'bottom-right')+' style="background-position:'+(-me.icon[0]*48+6)+'px '+(-me.icon[1]*48+6)+'px;"></div>';
			}
			str=''+str+'<div style="clear:both;"></div>';
			return str;
		}
		Game.Select=function(prefName,button,value)
		{
			if (l(button+'-'+Game[prefName])) l(button+'-'+Game[prefName]).className='crate';
			if (l(button+'-'+value)) l(button+'-'+value).className='crate enabled';
			Game[prefName]=value;
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
			Game.onMenu=what;
			Game.UpdateMenu();
		}
		Game.sayTime=function(time,detail)
		{
			var str='';
			var detail=detail||0;
			time=Math.floor(time);
			if (time>=Game.fps*60*60*24*2 && detail<2) str=Beautify(time/(Game.fps*60*60*24))+' days';
			else if (time>=Game.fps*60*60*24 && detail<2) str='1 day';
			else if (time>=Game.fps*60*60*2 && detail<3) str=Beautify(time/(Game.fps*60*60))+' hours';
			else if (time>=Game.fps*60*60 && detail<3) str='1 hour';
			else if (time>=Game.fps*60*2 && detail<4) str=Beautify(time/(Game.fps*60))+' minutes';
			else if (time>=Game.fps*60 && detail<4) str='1 minute';
			else if (time>=Game.fps*2 && detail<5) str=Beautify(time/(Game.fps))+' seconds';
			else if (time>=Game.fps && detail<5) str='1 second';
			return str;
		}
		
		Game.UpdateMenu=function()
		{
			var str='';
			if (Game.onMenu!='')
			{
				str+='<div style="position:absolute;top:8px;right:8px;cursor:pointer;font-size:16px;" onclick="Game.ShowMenu();">X</div>';
			}
			if (Game.onMenu=='prefs')
			{
				str+='<div class="section">Menu</div>'+
				'<div class="subsection">'+
				'<div class="title">General</div>'+
				'<div class="listing"><a class="option" onclick="Game.WriteSave();">Save</a><label>Save manually (the game autosaves every 60 seconds)</label></div>'+
				'<div class="listing"><a class="option" onclick="Game.ExportSave();">Export save</a><a class="option" onclick="Game.ImportSave();">Import save</a><label>You can use this to backup your save or to transfer it to another computer</label></div>'+
				//'<div class="listing"><span class="warning" style="font-size:12px;">[Note : importing saves from earlier versions than 1.0 will be disabled beyond September 1st, 2013.]</span></div>'+
				'<div class="listing"><a class="option warning" onclick="Game.Reset();">Reset</a><label>Reset your game (you will keep your achievements)</label></div>'+
				'<div class="listing"><a class="option warning" onclick="Game.HardReset();">Wipe save</a><label>Delete all your progress, including your achievements and prestige</label></div>'+
				'<div class="title">Settings</div>'+
				'<div class="listing">'+
				Game.WriteButton('fancy','fancyButton','Fancy graphics ON','Fancy graphics OFF','Game.ToggleFancy();')+
				Game.WriteButton('particles','particlesButton','Particles ON','Particles OFF')+
				Game.WriteButton('numbers','numbersButton','Numbers ON','Numbers OFF')+
				Game.WriteButton('milk','milkButton','Milk ON','Milk OFF')+
				Game.WriteButton('cursors','cursorsButton','Cursors ON','Cursors OFF')+
				'</div>'+
				'<div class="listing">'+Game.WriteButton('autoupdate','autoupdateButton','Offline mode OFF','Offline mode ON')+'<label>(note : this disables update notifications)</label></div>'+				'<div class="listing">'+Game.WriteButton('warn','warnButton','Closing warning ON','Closing warning OFF')+'<label>(the game will ask you to confirm when you close the window)</label></div>'+
				//'<div class="listing">'+Game.WriteButton('autosave','autosaveButton','Autosave ON','Autosave OFF')+'</div>'+
				(1==2?(
				'<div class="title">Customization</div>'+
				'<div class="listing"><b>Background</b>'+
				Game.WriteSelector('backgroundType','backgroundType',['Blue background','Red background','White background','Black background'],'Blue background',(Game.backgroundType>0?Game.UpgradesById[Game.backgroundType].name:Game.Upgrades['Blue background'].name))+
				'</div>'
				):'')+
				'<div style="padding-bottom:128px;"></div>'+
				'</div>'
				;
			}
			else if (Game.onMenu=='main')
			{
				str+=
				'<div class="listing">This isn\'t really finished</div>'+
				'<div class="listing"><a class="option" onclick="Game.ShowMenu(\'prefs\');">Menu</a></div>'+
				'<div class="listing"><a class="option" onclick="Game.ShowMenu(\'stats\');">Stats</a></div>'+
				'<div class="listing"><a class="option" onclick="Game.ShowMenu(\'log\');">Updates</a></div>'+
				'<div class="listing"><a class="option" onclick="">Quit</a></div>'+
				'<div class="listing"><a class="option" onclick="Game.ShowMenu(Game.onMenu);">Resume</a></div>';
			}
			else if (Game.onMenu=='log')//might want to make this static someday
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
				var upgradesTotal=0;
				var upgradesOwned=0;
				
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
					if (!Game.Has('Neuromancy'))
					{
						if (me.bought>0)
						{
							str2+='<div class="crate upgrade enabled" '+Game.getTooltip(
							'<div style="min-width:200px;"><div style="float:right;"><span class="price">'+Beautify(Math.round(me.basePrice))+'</span></div><small>[Upgrade] [Purchased]</small><div class="name">'+me.name+'</div><div class="description">'+me.desc+'</div></div>'
							,'bottom-right')+' style="background-position:'+(-me.icon[0]*48+6)+'px '+(-me.icon[1]*48+6)+'px;"></div>';
							if (me.hide!=3) upgradesOwned++;
						}
					}
					else
					{
						str2+='<div onclick="Game.UpgradesById['+me.id+'].toggle();" class="crate upgrade'+(me.bought>0?' enabled':'')+'" '+Game.getTooltip(
						'<div style="min-width:200px;"><div style="float:right;"><span class="price">'+Beautify(Math.round(me.basePrice))+'</span></div><small>[Upgrade]'+(me.bought>0?' [Purchased]':'')+'</small><div class="name">'+me.name+'</div><div class="description">'+me.desc+'</div></div>'
						,'bottom-right')+' style="background-position:'+(-me.icon[0]*48+6)+'px '+(-me.icon[1]*48+6)+'px;"></div>';
						if (me.hide!=3) upgradesOwned++;
					}
					if (me.hide!=3) upgradesTotal++;
					if (me.debug) hiddenUpgrades+=str2; else if (me.type=='cookie') cookieUpgrades+=str2; else upgrades+=str2;
				}
				var achievements=[];
				var shadowAchievements='';
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
					if (!me.disabled && me.hide!=3 || me.won>0) achievementsTotal++;
					var category=me.category;
					if (!achievements[category]) achievements[category]='';
					
					if (me.won>0 && me.hide==3)
					{
						shadowAchievements+='<div class="crate achievement enabled" '+Game.getTooltip(
						'<div style="min-width:200px;"><small>[Achievement] [Unlocked]'+(me.hide==3?' [Shadow]':'')+'</small><div class="name">'+me.name+'</div><div class="description">'+me.desc+'</div></div>'
						,'bottom-right')+' style="background-position:'+(-me.icon[0]*48+6)+'px '+(-me.icon[1]*48+6)+'px;"></div>';
						achievementsOwned++;
					}
					else if (me.won>0)
					{
						achievements[category]+='<div class="crate achievement enabled" '+Game.getTooltip(
						'<div style="min-width:200px;"><small>[Achievement] [Unlocked]'+(me.hide==3?' [Shadow]':'')+'</small><div class="name">'+me.name+'</div><div class="description">'+me.desc+'</div></div>'
						,'bottom-right')+' style="background-position:'+(-me.icon[0]*48+6)+'px '+(-me.icon[1]*48+6)+'px;"></div>';
						achievementsOwned++;
					}
					else if (me.hide==0)
					{
						achievements[category]+='<div class="crate achievement" '+Game.getTooltip(
						'<div style="min-width:200px;"><small>[Achievement]</small><div class="name">'+me.name+'</div><div class="description">'+me.desc+'</div></div>'
						,'bottom-right')+' style="background-position:'+(-me.icon[0]*48+6)+'px '+(-me.icon[1]*48+6)+'px;"></div>';
					}
					else if (me.hide==1)
					{
						achievements[category]+='<div class="crate achievement" '+Game.getTooltip(
						'<div style="min-width:200px;"><small>[Achievement]</small><div class="name">'+me.name+'</div><div class="description">???</div></div>'
						,'bottom-right')+' style="background-position:'+(-0*48+6)+'px '+(-7*48+6)+'px;"></div>';
					}
					else if (me.hide==2)
					{
						achievements[category]+='<div class="crate achievement" '+Game.getTooltip(
						'<div style="min-width:200px;"><small>[Achievement]</small><div class="name">???</div><div class="description">???</div></div>'
						,'bottom-right')+' style="background-position:'+(-0*48+6)+'px '+(-7*48+6)+'px;"></div>';
					}
				}
				
				var achievementsStr='';
				var categories={'dungeon':'Dungeon achievements'};
				for (var i in achievements)
				{
					if(achievements[i]!='')
					{
						var cat=i;
						if (categories[i]) achievementsStr+='<div class="listing"><b>'+categories[i]+'</b></div>';
						achievementsStr+='<div class="listing" style="overflow-y:hidden;">'+achievements[i]+'</div>';
					}
				}
				
				var santaStr='';
				if (Game.Has('A festive hat'))
				{
					for (var i=0;i<=Game.santaLevel;i++)
					{
						santaStr+='<div '+Game.getTooltip(
						'<div style="min-width:200px;text-align:center">'+Game.santaLevels[i]+'</div>'
						,'bottom-right')+' style="width:96px;height:96px;margin:2px;float:left;background:url(img/santa.png) '+(-i*96)+'px 0px;"></div>';
					}
					santaStr+='<div style="clear:both;"></div>';
				}
				
				var milkName='plain milk';
				if (Game.milkProgress>=4.5) milkName='caramel milk';
				else if (Game.milkProgress>=3.5) milkName='orange juice';
				else if (Game.milkProgress>=2.5) milkName='raspberry milk';
				else if (Game.milkProgress>=1.5) milkName='chocolate milk';
				
				var researchStr=Game.sayTime(Game.researchT);
				var pledgeStr=Game.sayTime(Game.pledgeT);
				var wrathStr='';
				if (Game.elderWrath==1) wrathStr='awoken';
				else if (Game.elderWrath==2) wrathStr='displeased';
				else if (Game.elderWrath==3) wrathStr='angered';
				else if (Game.elderWrath==0 && Game.pledges>0) wrathStr='appeased';
				
				var date=new Date();
				date.setTime(new Date().getTime()-Game.startDate);
				var startDate=Game.sayTime(date.getTime()/1000*Game.fps,2);
				date.setTime(new Date().getTime()-Game.fullDate);
				var fullDate=Game.sayTime(date.getTime()/1000*Game.fps,2);
				if (!fullDate || fullDate.length<1) fullDate='a long while';
				/*date.setTime(new Date().getTime()-Game.lastDate);
				var lastDate=Game.sayTime(date.getTime()/1000*Game.fps,2);*/
				
				var heavenlyMult=0;
				if (Game.Has('Heavenly chip secret')) heavenlyMult+=5;
				if (Game.Has('Heavenly cookie stand')) heavenlyMult+=20;
				if (Game.Has('Heavenly bakery')) heavenlyMult+=25;
				if (Game.Has('Heavenly confectionery')) heavenlyMult+=25;
				if (Game.Has('Heavenly key')) heavenlyMult+=25;
				
				str+='<div class="section">Statistics</div>'+
				'<div class="subsection">'+
				'<div class="title">General</div>'+
				'<div class="listing"><b>Cookies in bank :</b> <div class="price plain">'+Beautify(Game.cookies)+'</div></div>'+
				'<div class="listing"><b>Cookies baked (this game) :</b> <div class="price plain">'+Beautify(Game.cookiesEarned)+'</div></div>'+
				'<div class="listing"><b>Cookies baked (all time) :</b> <div class="price plain">'+Beautify(Game.cookiesEarned+Game.cookiesReset)+'</div></div>'+
				(Game.cookiesReset>0?'<div class="listing"><b>Cookies forfeited by resetting :</b> <div class="price plain">'+Beautify(Game.cookiesReset)+'</div></div>':'')+
				(Game.resets?('<div class="listing"><b>Legacy started :</b> '+fullDate+' ago, with '+Beautify(Game.resets)+' reset'+(Game.resets==1?'':'s')+'</div>'):'')+
				'<div class="listing"><b>Session started :</b> '+startDate+' ago</div>'+
				'<div class="listing"><b>Buildings owned :</b> '+Beautify(buildingsOwned)+'</div>'+
				'<div class="listing"><b>Cookies per second :</b> '+Beautify(Game.cookiesPs,1)+' <small>'+
					'(multiplier : '+Beautify(Math.round(Game.globalCpsMult*100),1)+'%)'+
					(Game.cpsSucked>0?' <span class="warning">(withered : '+Beautify(Math.round(Game.cpsSucked*100),1)+'%)</span>':'')+
					'</small></div>'+
				'<div class="listing"><b>Cookies per click :</b> '+Beautify(Game.computedMouseCps,1)+'</div>'+
				'<div class="listing"><b>Cookie clicks :</b> '+Beautify(Game.cookieClicks)+'</div>'+
				'<div class="listing"><b>Hand-made cookies :</b> '+Beautify(Game.handmadeCookies)+'</div>'+
				'<div class="listing"><b>Golden cookie clicks :</b> '+Beautify(Game.goldenClicksLocal)+' (all time : '+Beautify(Game.goldenClicks)+')</div>'+//' <span class="hidden">(<b>Missed golden cookies :</b> '+Beautify(Game.missedGoldenClicks)+')</span></div>'+
				'<br><div class="listing"><b>Running version :</b> '+Game.version+'</div>'+
				
				((researchStr!='' || wrathStr!='' || pledgeStr!='' || santaStr!='')?(
				'</div><div class="subsection">'+
				'<div class="title">Special</div>'+
				(researchStr!=''?'<div class="listing"><b>Research :</b> '+researchStr+' remaining</div>':'')+
				(wrathStr!=''?'<div class="listing"><b>Grandmatriarchs status :</b> '+wrathStr+'</div>':'')+
				(pledgeStr!=''?'<div class="listing"><b>Pledge :</b> '+pledgeStr+' remaining</div>':'')+
				(Game.wrinklersPopped>0?'<div class="listing"><b>Wrinklers popped :</b> '+Beautify(Game.wrinklersPopped)+'</div>':'')+
				//(Game.cookiesSucked>0?'<div class="listing warning"><b>Withered :</b> '+Beautify(Game.cookiesSucked)+' cookies</div>':'')+
				(Game.reindeerClicked>0?'<div class="listing"><b>Reindeer found :</b> '+Beautify(Game.reindeerClicked)+'</div>':'')+
				(santaStr!=''?'<div class="listing"><b>Santa stages unlocked :</b></div><div>'+santaStr+'</div>':'')+
				''
				):'')+
				
				(Game.prestige['Heavenly chips']>0?(
				'</div><div class="subsection">'+
				'<div class="title">Prestige</div>'+
				'<div class="listing"><small>(Note : each heavenly chip grants you +2% CpS multiplier. You can gain more chips by resetting with a lot of cookies.)</small></div>'+
				'<div class="listing"><div class="icon" style="background-position:'+(-19*48)+'px '+(-7*48)+'px;"></div> <span style="vertical-align:100%;"><span class="title" style="font-size:22px;">'+Game.prestige['Heavenly chips']+' heavenly chip'+(Game.prestige['Heavenly chips']==1?'':'s')+'</span> at '+heavenlyMult+'% of their potential (+'+Beautify(Game.prestige['Heavenly chips']*2*heavenlyMult/100,1)+'% CpS)</span></div>'):'')+
				
				'</div><div class="subsection">'+
				'<div class="title">Upgrades unlocked</div>'+
				'<div class="listing"><b>Unlocked :</b> '+upgradesOwned+'/'+upgradesTotal+' ('+Math.round((upgradesOwned/upgradesTotal)*100)+'%)</div>'+
				'<div class="listing" style="overflow-y:hidden;">'+upgrades+'</div>'+
				(cookieUpgrades!=''?('<div class="listing"><b>Cookies</b></div>'+
				'<div class="listing" style="overflow-y:hidden;">'+cookieUpgrades+'</div>'):'')+
				(hiddenUpgrades!=''?('<div class="listing"><b>Debug</b></div>'+
				'<div class="listing" style="overflow-y:hidden;">'+hiddenUpgrades+'</div>'):'')+
				'</div><div class="subsection">'+
				'<div class="title">Achievements</div>'+
				'<div class="listing"><b>Unlocked :</b> '+achievementsOwned+'/'+achievementsTotal+' ('+Math.round((achievementsOwned/achievementsTotal)*100)+'%)</div>'+
				'<div class="listing"><b>Milk :</b> '+Math.round(Game.milkProgress*100)+'% ('+milkName+') <small>(Note : you gain milk through achievements. Milk can unlock unique upgrades over time.)</small></div>'+
				achievementsStr+
				(shadowAchievements!=''?(
					'<div class="listing"><b>Shadow achievements</b> <small>(These are feats that are either unfair or difficult to attain. They do not give milk.)</small></div>'+
					'<div class="listing" style="overflow-y:hidden;">'+shadowAchievements+'</div>'
				):'')+
				'</div>'+
				'<div style="padding-bottom:128px;"></div>'
				;
			}
			l('menu').innerHTML=str;
		}
		
		AddEvent(l('prefsButton'),'click',function(){Game.ShowMenu('prefs');});
		AddEvent(l('statsButton'),'click',function(){Game.ShowMenu('stats');});
		AddEvent(l('logButton'),'click',function(){Game.ShowMenu('log');});
		
		Game.lastPanel='';
		AddEvent(l('focusLeft'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Left');});
		AddEvent(l('focusMiddle'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Middle');});
		AddEvent(l('focusRight'),'click',function(){Game.ShowMenu('');Game.ShowPanel('Right');});
		AddEvent(l('focusMenu'),'click',function(){Game.ShowMenu('main');Game.ShowPanel('Menu');});
		//AddEvent(l('focusMenu'),'click',function(){if (Game.onPanel=='Menu' && Game.lastPanel!='') {Game.ShowMenu('main');Game.ShowPanel(Game.lastPanel);} else {Game.lastPanel=Game.onPanel;Game.ShowMenu('main');Game.ShowPanel('Menu');}});
		
		/*=====================================================================================
		TOOLTIP
		=======================================================================================*/
		Game.tooltip={text:'',x:0,y:0,origin:0,on:0};
		Game.tooltip.draw=function(from,text,x,y,origin)
		{
			this.text=text;
			this.x=x;
			this.y=y;
			this.origin=origin;
			var tt=l('tooltip');
			var tta=l('tooltipAnchor');
			tta.style.display='block';
			tt.style.left='auto';
			tt.style.top='auto';
			tt.style.right='auto';
			tt.style.bottom='auto';
			if (this.origin=='left' || 1)
			{
				tt.style.right='8px';
				tt.style.top='8px';
			}
			else if (this.origin=='bottom-right')
			{
				tt.style.right='8px';
				tt.style.top='8px';
			}
			
			tt.innerHTML=unescape(text);
			this.on=1;
		}
		Game.tooltip.update=function()
		{
			var tt=l('tooltip');
			var tta=l('tooltipAnchor');
			tta.style.left=Game.mouseX+'px';
			tta.style.top=Game.mouseY+'px';
		}
		Game.tooltip.hide=function()
		{
			l('tooltipAnchor').style.display='none';
			this.on=0;
		}
		Game.getTooltip=function(text,origin)
		{
			origin=(origin?origin:'middle');
			return 'onMouseOut="Game.tooltip.hide();" onMouseOver="Game.tooltip.draw(this,\''+escape(text)+'\',\''+origin+'\');"';
		}
		
		/*=====================================================================================
		NEWS TICKER
		=======================================================================================*/
		Game.Ticker='';
		Game.TickerAge=0;
		Game.TickerN=0;
		Game.getNewTicker=function()
		{
			var list=[];
			
			if (Game.TickerN%2==0 || Game.cookiesEarned>=10100000000)
			{				
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
				
				if (Game.HasAchiev('Just wrong')) list.push(choose([
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
				
				if (Game.Objects['Factory'].amount>0) list.push(choose([
				'News : cookie factories linked to global warming!',
				'News : cookie factories involved in chocolate weather controversy!',
				'News : cookie factories on strike, robotic minions employed to replace workforce!',
				'News : cookie factories on strike - workers demand to stop being paid in cookies!',
				'News : factory-made cookies linked to obesity, says study.'
				]));
				
				if (Game.Objects['Mine'].amount>0) list.push(choose([
				'News : '+Math.floor(Math.random()*1000+2)+' miners dead in chocolate mine catastrophe!',
				'News : '+Math.floor(Math.random()*1000+2)+' miners trapped in collapsed chocolate mine!',
				'News : chocolate mines found to cause earthquakes and sink holes!',
				'News : chocolate mine goes awry, floods village in chocolate!',
				'News : depths of chocolate mines found to house "peculiar, chocolaty beings"!'
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
				
				if (Game.HasAchiev('Base 10')) list.push('News : cookie manufacturer completely forgoes common sense, lets OCD drive building decisions!');
				if (Game.HasAchiev('From scratch')) list.push('News : follow the tear-jerking, riches-to-rags story about a local cookie manufacturer who decided to give it all up!');
				if (Game.HasAchiev('A world filled with cookies')) list.push('News : known universe now jammed with cookies! No vacancies!');
				if (Game.HasAchiev('Serendipity')) list.push('News : local cookie manufacturer becomes luckiest being alive!');
				
				if (Game.Has('Kitten helpers')) list.push('News : faint meowing heard around local cookie facilities; suggests new ingredient being tested.');
				if (Game.Has('Kitten workers')) list.push('News : crowds of meowing kittens with little hard hats reported near local cookie facilities.');
				if (Game.Has('Kitten engineers')) list.push('News : surroundings of local cookie facilities now overrun with kittens in adorable little suits. Authorities advise to stay away from the premises.');
				if (Game.Has('Kitten overseers')) list.push('News : locals report troupe of bossy kittens meowing adorable orders at passersby.');
				
				var animals=['newts','penguins','scorpions','axolotls','puffins','porpoises','blowfish','horses','crayfish','slugs','humpback whales','nurse sharks','giant squids','polar bears','fruit bats','frogs','sea squirts','velvet worms','mole rats','paramecia','nematodes','tardigrades','giraffes'];
				if (Game.cookiesEarned>=10000) list.push(
				'News : '+choose([
					'cookies found to '+choose(['increase lifespan','sensibly increase intelligence','reverse aging','decrease hair loss','prevent arthritis','cure blindness'])+' in '+choose(animals)+'!',
					'cookies found to make '+choose(animals)+' '+choose(['more docile','more handsome','nicer','less hungry','more pragmatic','tastier'])+'!',
					'cookies tested on '+choose(animals)+', found to have no ill effects.',
					'cookies unexpectedly popular among '+choose(animals)+'!',
					'unsightly lumps found on '+choose(animals)+' near cookie facility; "they\'ve pretty much always looked like that", say biologists.',
					'new species of '+choose(animals)+' discovered in distant country; "yup, tastes like cookies", says biologist.',
					'cookies go well with roasted '+choose(animals)+', says controversial chef.',
					'"do your cookies contain '+choose(animals)+'?", asks PSA warning against counterfeit cookies.'
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
				'News : '+choose(['doctors recommend twice-daily consumption of fresh cookies.','doctors warn against chocolate chip-snorting teen fad.','doctors advise against new cookie-free fad diet.','doctors warn mothers about the dangers of "home-made cookies".']),
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
					'News : cookies could be the key to '+choose(['eternal life','infinite riches','eternal youth','eternal beauty','curing baldness','world peace','solving world hunger','ending all wars world-wide','making contact with extraterrestrial life','mind-reading','better living','better eating','more interesting TV shows','faster-than-light travel','quantum baking','chocolaty goodness','gooder thoughtness'])+', say scientists.',
					'News : flavor text '+choose(["not particularly flavorful","kind of unsavory"])+', study finds.',
					'News : what do golden cookies taste like? Study reveals a flavor "somewhere between spearmint and liquorice".',
					'News : what do red cookies taste like? Study reveals a flavor "somewhere between blood sausage and seawater".'
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
				else if (Game.cookiesEarned<3000) list.push('Your cookies are talked about for miles around.');
				else if (Game.cookiesEarned<6000) list.push('Your cookies are renowned in the whole town!');
				else if (Game.cookiesEarned<10000) list.push('Your cookies bring all the boys to the yard.');
				else if (Game.cookiesEarned<20000) list.push('Your cookies now have their own website!');
				else if (Game.cookiesEarned<30000) list.push('Your cookies are worth a lot of money.');
				else if (Game.cookiesEarned<40000) list.push('Your cookies sell very well in distant countries.');
				else if (Game.cookiesEarned<60000) list.push('People come from very far away to get a taste of your cookies.');
				else if (Game.cookiesEarned<80000) list.push('Kings and queens from all over the world are enjoying your cookies.');
				else if (Game.cookiesEarned<100000) list.push('There are now museums dedicated to your cookies.');
				else if (Game.cookiesEarned<200000) list.push('A national day has been created in honor of your cookies.');
				else if (Game.cookiesEarned<300000) list.push('Your cookies have been named a part of the world wonders.');
				else if (Game.cookiesEarned<450000) list.push('History books now include a whole chapter about your cookies.');
				else if (Game.cookiesEarned<600000) list.push('Your cookies have been placed under government surveillance.');
				else if (Game.cookiesEarned<1000000) list.push('The whole planet is enjoying your cookies!');
				else if (Game.cookiesEarned<5000000) list.push('Strange creatures from neighboring planets wish to try your cookies.');
				else if (Game.cookiesEarned<10000000) list.push('Elder gods from the whole cosmos have awoken to taste your cookies.');
				else if (Game.cookiesEarned<30000000) list.push('Beings from other dimensions lapse into existence just to get a taste of your cookies.');
				else if (Game.cookiesEarned<100000000) list.push('Your cookies have achieved sentience.');
				else if (Game.cookiesEarned<300000000) list.push('The universe has now turned into cookie dough, to the molecular level.');
				else if (Game.cookiesEarned<1000000000) list.push('Your cookies are rewriting the fundamental laws of the universe.');
				else if (Game.cookiesEarned<10000000000) list.push('A local news station runs a 10-minute segment about your cookies. Success!<br><span style="font-size:50%;">(you win a cookie)</span>');
				else if (Game.cookiesEarned<10100000000) list.push('it\'s time to stop playing');//only show this for 100 millions (it's funny for a moment)
			}
			
			if (Game.elderWrath>0 && (Game.pledges==0 || Math.random()<0.5))
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
			
			Game.TickerAge=Game.fps*10;
			Game.Ticker=choose(list);
			Game.TickerN++;
		}
		Game.TickerDraw=function()
		{
			var str='';
			var o=0;
			if (Game.Ticker!='')
			{
				if (Game.TickerAge<Game.fps*1 && 1==2)//too bad this doesn't work well with html tags
				{
					str=Game.Ticker.substring(0,(Game.Ticker+'<').indexOf('<'));
					str=str.substring(0,str.length*Math.min(1,Game.TickerAge/(Game.fps*1)));
				}
				else str=Game.Ticker;
				//o=Math.min(1,Game.TickerAge/(Game.fps*0.5));//*Math.min(1,1-(Game.TickerAge-Game.fps*9.5)/(Game.fps*0.5));
			}
			//l('commentsText').style.opacity=o;
			l('commentsText').innerHTML=debugStr||str;
			l('compactCommentsText').innerHTML=debugStr||str;
			//'<div style="font-size:70%;"><span onclick="Game.Earn(1000);">add 1,000</span> | <span onclick="Game.Earn(1000000);">add 1,000,000</span></div>';
		}
		
		/*=====================================================================================
		BUILDINGS
		=======================================================================================*/
		Game.storeToRebuild=1;
		Game.priceIncrease=1.15;
		
		Game.Objects=[];
		Game.ObjectsById=[];
		Game.ObjectsN=0;
		Game.BuildingsOwned=0;
		Game.Object=function(name,commonName,desc,pic,icon,background,price,cps,drawFunction,buyFunction)
		{
			this.id=Game.ObjectsN;
			this.name=name;
			this.displayName=this.name;
			commonName=commonName.split('|');
			this.single=commonName[0];
			this.plural=commonName[1];
			this.actionName=commonName[2];
			this.desc=desc;
			this.basePrice=price;
			this.price=this.basePrice;
			this.cps=cps;
			this.totalCookies=0;
			this.storedCps=0;
			this.storedTotalCps=0;
			this.pic=pic;
			this.icon=icon;
			this.background=background;
			this.buyFunction=buyFunction;
			this.drawFunction=drawFunction;
			
			this.special=null;//special is a function that should be triggered when the object's special is unlocked, or on load (if it's already unlocked). For example, creating a new dungeon.
			this.onSpecial=0;//are we on this object's special screen (dungeons etc)?
			this.specialUnlocked=0;
			this.specialDrawFunction=null;
			this.drawSpecialButton=null;
			
			this.amount=0;
			this.bought=0;
			
			this.getPrice=function()
			{
				var price=this.basePrice*Math.pow(Game.priceIncrease,this.amount);
				if (Game.Has('Season savings')) price*=0.99;
				if (Game.Has('Santa\'s dominion')) price*=0.99;
				return Math.ceil(price);
			}
			
			this.buy=function()
			{
				var price=this.getPrice();
				if (Game.cookies>=price)
				{
					Game.Spend(price);
					this.amount++;
					this.bought++;
					price=this.getPrice();
					this.price=price;
					if (this.buyFunction) this.buyFunction();
					if (this.drawFunction) this.drawFunction();
					Game.storeToRebuild=1;
					Game.recalculateGains=1;
					if (this.amount==1 && this.id!=0) l('row'+this.id).className='row enabled';
					Game.BuildingsOwned++;
				}
			}
			this.sell=function()
			{
				var price=this.getPrice();
				price=Math.floor(price*0.5);
				if (this.amount>0)
				{
					//Game.Earn(price);
					Game.cookies+=price;
					this.amount--;
					price=this.getPrice();
					this.price=price;
					if (this.sellFunction) this.sellFunction();
					if (this.drawFunction) this.drawFunction();
					Game.storeToRebuild=1;
					Game.recalculateGains=1;
					Game.BuildingsOwned--;
				}
			}
			
			this.setSpecial=function(what)//change whether we're on the special overlay for this object or not
			{
				if (what==1) this.onSpecial=1;
				else this.onSpecial=0;
				if (this.id!=0)
				{
					if (this.onSpecial)
					{
						l('rowSpecial'+this.id).style.display='block';
						if (this.specialDrawFunction) this.specialDrawFunction();
					}
					else
					{
						l('rowSpecial'+this.id).style.display='none';
						if (this.drawFunction) this.drawFunction();
					}
				}
			}
			this.unlockSpecial=function()
			{
				if (this.specialUnlocked==0)
				{
					this.specialUnlocked=1;
					this.setSpecial(0);
					if (this.special) this.special();
					this.refresh();
				}
			}
			
			this.refresh=function()
			{
				this.price=this.getPrice();
				if (this.amount==0 && this.id!=0) l('row'+this.id).className='row';
				else if (this.amount>0 && this.id!=0) l('row'+this.id).className='row enabled';
				if (this.drawFunction && !this.onSpecial) this.drawFunction();
				//else if (this.specialDrawFunction && this.onSpecial) this.specialDrawFunction();
			}
			
			if (this.id!=0)//draw it
			{
				var str='<div class="row" id="row'+this.id+'"><div class="separatorBottom"></div><div class="content"><div id="rowBackground'+this.id+'" class="background" style="background:url(img/'+this.background+'.png) repeat-x;"><div class="backgroundLeft"></div><div class="backgroundRight"></div></div><div class="objects" id="rowObjects'+this.id+'"> </div></div><div class="special" id="rowSpecial'+this.id+'"></div><div class="specialButton" id="rowSpecialButton'+this.id+'"></div><div class="info" id="rowInfo'+this.id+'"><div class="infoContent" id="rowInfoContent'+this.id+'"></div><div><a onclick="Game.ObjectsById['+this.id+'].sell();">Sell 1</a></div></div></div>';
				l('rows').innerHTML=l('rows').innerHTML+str;
			}
			
			Game.Objects[this.name]=this;
			Game.ObjectsById[this.id]=this;
			Game.ObjectsN++;
			return this;
		}
		
		Game.NewDrawFunction=function(pic,xVariance,yVariance,w,shift,heightOffset)
		{
			//pic : either 0 (the default picture will be used), a filename (will be used as override), or a function to determine a filename
			//xVariance : the pictures will have a random horizontal shift by this many pixels
			//yVariance : the pictures will have a random vertical shift by this many pixels
			//w : how many pixels between each picture (or row of pictures)
			//shift : if >1, arrange the pictures in rows containing this many pictures
			//heightOffset : the pictures will be displayed at this height, +32 pixels
			return function()
			{
				if (pic==0 && typeof(pic)!='function') pic=this.pic;
				shift=shift || 1;
				heightOffset=heightOffset || 0;
				var bgW=0;
				var str='';
				var offX=0;
				var offY=0;
				
				if (this.drawSpecialButton && this.specialUnlocked)
				{
					l('rowSpecialButton'+this.id).style.display='block';
					l('rowSpecialButton'+this.id).innerHTML=this.drawSpecialButton();
					str+='<div style="width:128px;height:128px;">'+this.drawSpecialButton()+'</div>';
					l('rowInfo'+this.id).style.paddingLeft=(8+128)+'px';
					offX+=128;
				}

				for (var i=0;i<this.amount;i++)
				{
					if (shift!=1)
					{
						var x=Math.floor(i/shift)*w+((i%shift)/shift)*w+Math.floor((Math.random()-0.5)*xVariance)+offX;
						var y=32+heightOffset+Math.floor((Math.random()-0.5)*yVariance)+((-shift/2)*32/2+(i%shift)*32/2)+offY;
					}
					else
					{
						var x=i*w+Math.floor((Math.random()-0.5)*xVariance)+offX;
						var y=32+heightOffset+Math.floor((Math.random()-0.5)*yVariance)+offY;
					}
					var usedPic=(typeof(pic)=='function'?pic():pic);
					str+='<div class="object" style="background:url(img/'+usedPic+'.png);left:'+x+'px;top:'+y+'px;z-index:'+Math.floor(1000+y)+';"></div>';
					bgW=Math.max(bgW,x+64);
				}
				bgW+=offX;
				l('rowObjects'+this.id).innerHTML=str;
				l('rowBackground'+this.id).style.width=bgW+'px';
			}
		}
		
		Game.RefreshBuildings=function()
		{
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				me.refresh();
			}
			Game.storeToRebuild=1;
		}
		
		Game.RebuildStore=function()//redraw the store from scratch
		{
			Game.RefreshBuildings();
			var str='';
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				str+='<div class="product" '+Game.getTooltip(
				'<div style="min-width:300px;"><div style="float:right;"><span class="price">'+Beautify(Math.round(me.price))+'</span></div><div class="name">'+me.name+'</div>'+'<small>[owned : '+me.amount+'</small>]<div class="description">'+me.desc+'</div></div>'
				,'left')+' id="product'+me.id+'"><div class="icon" id="productIcon'+me.id+'" style="background-image:url(img/'+me.icon+'.png);"></div><div class="content"><div class="title">'+me.displayName+'</div><span class="price">'+Beautify(Math.round(me.price))+'</span>'+(me.amount>0?('<div class="title owned">'+me.amount+'</div>'):'')+'</div></div>';
			}
			l('products').innerHTML=str;
			for (var i in Game.Objects)
			{
				// onclick="Game.ObjectsById['+me.id+'].buy();"
				var me=Game.Objects[i];
				AddEvent(l('product'+me.id),'click',function(what){return function(){Game.ObjectsById[what].buy()};}(me.id));
			}
			Game.storeToRebuild=0;
		}
		
		Game.ComputeCps=function(base,add,mult,bonus)
		{
			if (!bonus) bonus=0;
			return ((base+add)*(Math.pow(2,mult))+bonus);
		}
		
		//define objects
		new Game.Object('Cursor','cursor|cursors|clicked','Autoclicks once every 10 seconds.','cursor','cursoricon','',15,function(){
			var add=0;
			if (Game.Has('Thousand fingers')) add+=0.1;
			if (Game.Has('Million fingers')) add+=0.5;
			if (Game.Has('Billion fingers')) add+=2;
			if (Game.Has('Trillion fingers')) add+=10;
			if (Game.Has('Quadrillion fingers')) add+=20;
			if (Game.Has('Quintillion fingers')) add+=100;
			if (Game.Has('Sextillion fingers')) add+=200;
			var num=0;
			for (var i in Game.Objects) {if (Game.Objects[i].name!='Cursor') num+=Game.Objects[i].amount;}
			add=add*num;
			return Game.ComputeCps(0.1,Game.Has('Reinforced index finger')*0.1,Game.Has('Carpal tunnel prevention cream')+Game.Has('Ambidextrous'),add);
		},function(){//draw function for cursors
			/*
			var str='';
			for (var i=0;i<this.amount;i++)
			{
				//layered
				var n=Math.floor(i/50);
				var a=((i+0.5*n)%50)/50;
				var x=Math.floor(Math.sin(a*Math.PI*2)*(140+n*16))-16;
				var y=Math.floor(Math.cos(a*Math.PI*2)*(140+n*16))-16;
				var r=Math.floor(-(a)*360);
				str+='<div class="cursor" id="cursor'+i+'" style="left:'+x+'px;top:'+y+'px;transform:rotate('+r+'deg);-moz-transform:rotate('+r+'deg);-webkit-transform:rotate('+r+'deg);-ms-transform:rotate('+r+'deg);-o-transform:rotate('+r+'deg);"></div>';

			}
			l('cookieCursors').innerHTML=str;
			*/
			if (!l('rowInfo'+this.id)) l('sectionLeftInfo').innerHTML='<div class="info" id="rowInfo'+this.id+'"><div class="infoContent" id="rowInfoContent'+this.id+'"></div><div><a onclick="Game.ObjectsById['+this.id+'].sell();">Sell 1</a></div></div>';
		},function(){
			if (this.amount>=1) Game.Unlock(['Reinforced index finger','Carpal tunnel prevention cream']);
			if (this.amount>=10) Game.Unlock('Ambidextrous');
			if (this.amount>=20) Game.Unlock('Thousand fingers');
			if (this.amount>=40) Game.Unlock('Million fingers');
			if (this.amount>=80) Game.Unlock('Billion fingers');
			if (this.amount>=120) Game.Unlock('Trillion fingers');
			if (this.amount>=160) Game.Unlock('Quadrillion fingers');
			if (this.amount>=200) Game.Unlock('Quintillion fingers');
			if (this.amount>=240) Game.Unlock('Sextillion fingers');
			
			if (this.amount>=1) Game.Win('Click');if (this.amount>=2) Game.Win('Double-click');if (this.amount>=50) Game.Win('Mouse wheel');if (this.amount>=100) Game.Win('Of Mice and Men');if (this.amount>=200) Game.Win('The Digital');		
		});
		
		Game.SpecialGrandmaUnlock=15;
		new Game.Object('Grandma','grandma|grandmas|baked','A nice grandma to bake more cookies.','grandma','grandmaIcon','grandmaBackground',100,function(){
			var mult=0;
			if (Game.Has('Farmer grandmas')) mult++;
			if (Game.Has('Worker grandmas')) mult++;
			if (Game.Has('Miner grandmas')) mult++;
			if (Game.Has('Cosmic grandmas')) mult++;
			if (Game.Has('Transmuted grandmas')) mult++;
			if (Game.Has('Altered grandmas')) mult++;
			if (Game.Has('Grandmas\' grandmas')) mult++;
			if (Game.Has('Antigrandmas')) mult++;
			if (Game.Has('Bingo center/Research facility')) mult+=2;
			if (Game.Has('Ritual rolling pins')) mult++;
			if (Game.Has('Naughty list')) mult++;
			var add=0;
			if (Game.Has('One mind')) add+=Game.Objects['Grandma'].amount*0.02;
			if (Game.Has('Communal brainsweep')) add+=Game.Objects['Grandma'].amount*0.02;
			if (Game.Has('Elder Pact')) add+=Game.Objects['Portal'].amount*0.05;
			return Game.ComputeCps(0.5,Game.Has('Forwards from grandma')*0.3+add,Game.Has('Steel-plated rolling pins')+Game.Has('Lubricated dentures')+Game.Has('Prune juice')+Game.Has('Double-thick glasses')+mult);
		},Game.NewDrawFunction(function(){
			var list=['grandma'];
			if (Game.Has('Farmer grandmas')) list.push('farmerGrandma');
			if (Game.Has('Worker grandmas')) list.push('workerGrandma');
			if (Game.Has('Miner grandmas')) list.push('minerGrandma');
			if (Game.Has('Cosmic grandmas')) list.push('cosmicGrandma');
			if (Game.Has('Transmuted grandmas')) list.push('transmutedGrandma');
			if (Game.Has('Altered grandmas')) list.push('alteredGrandma');
			if (Game.Has('Grandmas\' grandmas')) list.push('grandmasGrandma');
			if (Game.Has('Antigrandmas')) list.push('antiGrandma');
			if (Game.season=='christmas') list.push('elfGrandma');
			return choose(list);
		},8,8,32,3,16),function(){
			if (this.amount>=1) Game.Unlock(['Forwards from grandma','Steel-plated rolling pins']);if (this.amount>=10) Game.Unlock('Lubricated dentures');if (this.amount>=50) Game.Unlock('Prune juice');if (this.amount>=100) Game.Unlock('Double-thick glasses');
			if (this.amount>=1) Game.Win('Grandma\'s cookies');if (this.amount>=50) Game.Win('Sloppy kisses');if (this.amount>=100) Game.Win('Retirement home');if (this.amount>=150) Game.Win('Friend of the ancients');if (this.amount>=200) Game.Win('Ruler of the ancients');
		});
		Game.Objects['Grandma'].sellFunction=function()
		{
			Game.Win('Just wrong');
			if (this.amount==0)
			{
				Game.Lock('Elder Pledge');
				Game.CollectWrinklers();
				Game.pledgeT=0;
			}
		};
		
		
		
		new Game.Object('Farm','farm|farms|harvested','Grows cookie plants from cookie seeds.','farm','farmIcon','farmBackground',500,function(){
			return Game.ComputeCps(4,Game.Has('Cheap hoes')*1,Game.Has('Fertilizer')+Game.Has('Cookie trees')+Game.Has('Genetically-modified cookies')+Game.Has('Gingerbread scarecrows'));
		},Game.NewDrawFunction(0,16,16,64,2,32),function(){
			if (this.amount>=1) Game.Unlock(['Cheap hoes','Fertilizer']);if (this.amount>=10) Game.Unlock('Cookie trees');if (this.amount>=50) Game.Unlock('Genetically-modified cookies');if (this.amount>=100) Game.Unlock('Gingerbread scarecrows');
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Farmer grandmas');
			if (this.amount>=1) Game.Win('My first farm');if (this.amount>=50) Game.Win('Reap what you sow');if (this.amount>=100) Game.Win('Farm ill');
		});
		
		new Game.Object('Factory','factory|factories|mass-produced','Produces large quantities of cookies.','factory','factoryIcon','factoryBackground',3000,function(){
			return Game.ComputeCps(10,Game.Has('Sturdier conveyor belts')*4,Game.Has('Child labor')+Game.Has('Sweatshop')+Game.Has('Radium reactors')+Game.Has('Recombobulators'));
		},Game.NewDrawFunction(0,32,2,64,1,-22),function(){
			if (this.amount>=1) Game.Unlock(['Sturdier conveyor belts','Child labor']);if (this.amount>=10) Game.Unlock('Sweatshop');if (this.amount>=50) Game.Unlock('Radium reactors');if (this.amount>=100) Game.Unlock('Recombobulators');
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Worker grandmas');
			if (this.amount>=1) Game.Win('Production chain');if (this.amount>=50) Game.Win('Industrial revolution');if (this.amount>=100) Game.Win('Global warming');
		});
		
		new Game.Object('Mine','mine|mines|mined','Mines out cookie dough and chocolate chips.','mine','mineIcon','mineBackground',10000,function(){
			return Game.ComputeCps(40,Game.Has('Sugar gas')*10,Game.Has('Megadrill')+Game.Has('Ultradrill')+Game.Has('Ultimadrill')+Game.Has('H-bomb mining'));
		},Game.NewDrawFunction(0,16,16,64,2,24),function(){
			if (this.amount>=1) Game.Unlock(['Sugar gas','Megadrill']);if (this.amount>=10) Game.Unlock('Ultradrill');if (this.amount>=50) Game.Unlock('Ultimadrill');if (this.amount>=100) Game.Unlock('H-bomb mining');
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Miner grandmas');
			if (this.amount>=1) Game.Win('You know the drill');if (this.amount>=50) Game.Win('Excavation site');if (this.amount>=100) Game.Win('Hollow the planet');
		});
		
		new Game.Object('Shipment','shipment|shipments|shipped','Brings in fresh cookies from the cookie planet.','shipment','shipmentIcon','shipmentBackground',40000,function(){
			return Game.ComputeCps(100,Game.Has('Vanilla nebulae')*30,Game.Has('Wormholes')+Game.Has('Frequent flyer')+Game.Has('Warp drive')+Game.Has('Chocolate monoliths'));
		},Game.NewDrawFunction(0,16,16,64),function(){
			if (this.amount>=1) Game.Unlock(['Vanilla nebulae','Wormholes']);if (this.amount>=10) Game.Unlock('Frequent flyer');if (this.amount>=50) Game.Unlock('Warp drive');if (this.amount>=100) Game.Unlock('Chocolate monoliths');
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Cosmic grandmas');
			if (this.amount>=1) Game.Win('Expedition');if (this.amount>=50) Game.Win('Galactic highway');if (this.amount>=100) Game.Win('Far far away');
		});
		
		new Game.Object('Alchemy lab','alchemy lab|alchemy labs|transmuted','Turns gold into cookies!','alchemylab','alchemylabIcon','alchemylabBackground',200000,function(){
			return Game.ComputeCps(400,Game.Has('Antimony')*100,Game.Has('Essence of dough')+Game.Has('True chocolate')+Game.Has('Ambrosia')+Game.Has('Aqua crustulae'));
		},Game.NewDrawFunction(0,16,16,64,2,16),function(){
			if (this.amount>=1) Game.Unlock(['Antimony','Essence of dough']);if (this.amount>=10) Game.Unlock('True chocolate');if (this.amount>=50) Game.Unlock('Ambrosia');if (this.amount>=100) Game.Unlock('Aqua crustulae');
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Transmuted grandmas');
			if (this.amount>=1) Game.Win('Transmutation');if (this.amount>=50) Game.Win('Transmogrification');if (this.amount>=100) Game.Win('Gold member');
		});
		
		new Game.Object('Portal','portal|portals|retrieved','Opens a door to the Cookieverse.','portal','portalIcon','portalBackground',1666666,function(){
			return Game.ComputeCps(6666,Game.Has('Ancient tablet')*1666,Game.Has('Insane oatling workers')+Game.Has('Soul bond')+Game.Has('Sanity dance')+Game.Has('Brane transplant'));
		},Game.NewDrawFunction(0,32,32,64,2),function(){
			if (this.amount>=1) Game.Unlock(['Ancient tablet','Insane oatling workers']);if (this.amount>=10) Game.Unlock('Soul bond');if (this.amount>=50) Game.Unlock('Sanity dance');if (this.amount>=100) Game.Unlock('Brane transplant');
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Altered grandmas');
			if (this.amount>=1) Game.Win('A whole new world');if (this.amount>=50) Game.Win('Now you\'re thinking');if (this.amount>=100) Game.Win('Dimensional shift');
		});
		new Game.Object('Time machine','time machine|time machines|recovered','Brings cookies from the past, before they were even eaten.','timemachine','timemachineIcon','timemachineBackground',123456789,function(){
			return Game.ComputeCps(98765,Game.Has('Flux capacitors')*9876,Game.Has('Time paradox resolver')+Game.Has('Quantum conundrum')+Game.Has('Causality enforcer')+Game.Has('Yestermorrow comparators'));
		},Game.NewDrawFunction(0,32,32,64,1),function(){
			if (this.amount>=1) Game.Unlock(['Flux capacitors','Time paradox resolver']);if (this.amount>=10) Game.Unlock('Quantum conundrum');if (this.amount>=50) Game.Unlock('Causality enforcer');if (this.amount>=100) Game.Unlock('Yestermorrow comparators');
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Grandmas\' grandmas');
			if (this.amount>=1) Game.Win('Time warp');if (this.amount>=50) Game.Win('Alternate timeline');if (this.amount>=100) Game.Win('Rewriting history');
		});
		new Game.Object('Antimatter condenser','antimatter condenser|antimatter condensers|condensed','Condenses the antimatter in the universe into cookies.','antimattercondenser','antimattercondenserIcon','antimattercondenserBackground',3999999999,function(){
			return Game.ComputeCps(999999,Game.Has('Sugar bosons')*99999,Game.Has('String theory')+Game.Has('Large macaron collider')+Game.Has('Big bang bake')+Game.Has('Reverse cyclotrons'));
		},Game.NewDrawFunction(0,0,64,64,1),function(){
			if (this.amount>=1) Game.Unlock(['Sugar bosons','String theory']);if (this.amount>=10) Game.Unlock('Large macaron collider');if (this.amount>=50) Game.Unlock('Big bang bake');if (this.amount>=100) Game.Unlock('Reverse cyclotrons');
			if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock('Antigrandmas');
			if (this.amount>=1) Game.Win('Antibatter');if (this.amount>=50) Game.Win('Quirky quarks');if (this.amount>=100) Game.Win('It does matter!');
		});
		Game.Objects['Antimatter condenser'].displayName='<span style="font-size:65%;">Antimatter condenser</span>';//shrink the name since it's so large
		
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
			this.basePrice=price;
			this.icon=icon;
			this.buyFunction=buyFunction;
			/*this.unlockFunction=unlockFunction;
			this.unlocked=(this.unlockFunction?0:1);*/
			this.unlocked=0;
			this.bought=0;
			this.hide=0;//0=show, 3=hide (1-2 : I have no idea)
			this.order=this.id;
			if (order) this.order=order+this.id*0.001;
			this.type='';
			if (type) this.type=type;
			this.power=0;
			if (power) this.power=power;
			
			this.getPrice=function()
			{
				var price=this.basePrice;
				if (Game.Has('Toy workshop')) price*=0.95;
				if (Game.Has('Santa\'s dominion')) price*=0.98;
				return Math.ceil(price);
			}
			
			this.buy=function()
			{
				var cancelPurchase=0;
				if (this.clickFunction) cancelPurchase=!this.clickFunction();
				if (!cancelPurchase)
				{
					var price=this.getPrice();
					if (Game.cookies>=price && !this.bought)
					{
						Game.Spend(price);
						this.bought=1;
						if (this.buyFunction) this.buyFunction();
						Game.upgradesToRebuild=1;
						Game.recalculateGains=1;
						if (this.hide!=3) Game.UpgradesOwned++;
					}
				}
			}
			this.earn=function()//just win the upgrades without spending anything
			{
				Game.Upgrades[this.name].unlocked=1;
				this.bought=1;
				if (this.buyFunction) this.buyFunction();
				Game.upgradesToRebuild=1;
				Game.recalculateGains=1;
				if (this.hide!=3) Game.UpgradesOwned++;
			}
			
			this.toggle=function()//cheating only
			{
				if (!this.bought)
				{
					this.bought=1;
					if (this.buyFunction) this.buyFunction();
					Game.upgradesToRebuild=1;
					Game.recalculateGains=1;
					if (this.hide!=3) Game.UpgradesOwned++;
				}
				else
				{
					this.bought=0;
					Game.upgradesToRebuild=1;
					Game.recalculateGains=1;
					if (this.hide!=3) Game.UpgradesOwned--;
				}
				Game.UpdateMenu();
			}
			
			Game.Upgrades[this.name]=this;
			Game.UpgradesById[this.id]=this;
			Game.UpgradesN++;
			return this;
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
					Game.Upgrades[what].bought=0;
					Game.upgradesToRebuild=1;
					if (Game.Upgrades[what].bought==1)
					{
						Game.UpgradesOwned--;
					}
					Game.recalculateGains=1;
				}
			}
			else {for (var i in what) {Game.Lock(what[i]);}}
		}
		
		Game.Has=function(what)
		{
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
				if (!me.bought)
				{
					if (me.unlocked) list.push(me);
				}
			}
			
			var sortMap=function(a,b)
			{
				if (a.basePrice>b.basePrice) return 1;
				else if (a.basePrice<b.basePrice) return -1;
				else return 0;
			}
			list.sort(sortMap);
			
			Game.UpgradesInStore=[];
			for (var i in list)
			{
				Game.UpgradesInStore.push(list[i]);
			}
			var str='';
			for (var i in Game.UpgradesInStore)
			{
				//if (!Game.UpgradesInStore[i]) break;
				var me=Game.UpgradesInStore[i];
				str+='<div class="crate upgrade" '+Game.getTooltip(
				//'<b>'+me.name+'</b>'+me.desc
				'<div style="min-width:200px;"><div style="float:right;"><span class="price">'+Beautify(Math.round(me.getPrice()))+'</span></div><small>[Upgrade]</small><div class="name">'+me.name+'</div><div class="description">'+me.desc+'</div></div>'
				,'bottom-right')+' onclick="Game.UpgradesById['+me.id+'].buy();" id="upgrade'+i+'" style="background-position:'+(-me.icon[0]*48+6)+'px '+(-me.icon[1]*48+6)+'px;"></div>';
			}
			l('upgrades').innerHTML=str;
		}
		
		var tier1=10;
		var tier2=100;
		var tier3=1000;
		var tier4=50000;
		var tier5=1000000;
		
		var type='';
		var power=0;
		
		//define upgrades
		//WARNING : do NOT add new upgrades in between, this breaks the saves. Add them at the end !
		var order=100;//this is used to set the order in which the items are listed
		new Game.Upgrade('Reinforced index finger','The mouse gains <b>+1</b> cookie per click.<br>Cursors gain <b>+0.1</b> base CpS.<q>prod prod</q>',100,[0,0]);
		new Game.Upgrade('Carpal tunnel prevention cream','The mouse and cursors are <b>twice</b> as efficient.<q>it... it hurts to click...</q>',400,[0,0]);
		new Game.Upgrade('Ambidextrous','The mouse and cursors are <b>twice</b> as efficient.<q>Look ma, both hands!</q>',10000,[0,6]);
		new Game.Upgrade('Thousand fingers','The mouse and cursors gain <b>+0.1</b> cookies for each non-cursor object owned.<q>clickity</q>',500000,[0,6]);
		new Game.Upgrade('Million fingers','The mouse and cursors gain <b>+0.5</b> cookies for each non-cursor object owned.<q>clickityclickity</q>',50000000,[1,6]);
		new Game.Upgrade('Billion fingers','The mouse and cursors gain <b>+2</b> cookies for each non-cursor object owned.<q>clickityclickityclickity</q>',500000000,[2,6]);
		new Game.Upgrade('Trillion fingers','The mouse and cursors gain <b>+10</b> cookies for each non-cursor object owned.<q>clickityclickityclickityclickity</q>',5000000000,[3,6]);
		
		order=200;
		new Game.Upgrade('Forwards from grandma','Grandmas gain <b>+0.3</b> base CpS.<q>RE:RE:thought you\'d get a kick out of this ;))</q>',Game.Objects['Grandma'].basePrice*tier1,[1,0]);
		new Game.Upgrade('Steel-plated rolling pins','Grandmas are <b>twice</b> as efficient.<q>Just what you kneaded.</q>',Game.Objects['Grandma'].basePrice*tier2,[1,0]);
		new Game.Upgrade('Lubricated dentures','Grandmas are <b>twice</b> as efficient.<q>squish</q>',Game.Objects['Grandma'].basePrice*tier3,[1,1]);
		
		order=300;
		new Game.Upgrade('Cheap hoes','Farms gain <b>+1</b> base CpS.<q>Rake in the dough!</q>',Game.Objects['Farm'].basePrice*tier1,[2,0]);
		new Game.Upgrade('Fertilizer','Farms are <b>twice</b> as efficient.<q>It\'s chocolate, I swear.</q>',Game.Objects['Farm'].basePrice*tier2,[2,0]);
		new Game.Upgrade('Cookie trees','Farms are <b>twice</b> as efficient.<q>A relative of the breadfruit.</q>',Game.Objects['Farm'].basePrice*tier3,[2,1]);
		
		order=400;
		new Game.Upgrade('Sturdier conveyor belts','Factories gain <b>+4</b> base CpS.<q>You\'re going places.</q>',Game.Objects['Factory'].basePrice*tier1,[4,0]);
		new Game.Upgrade('Child labor','Factories are <b>twice</b> as efficient.<q>Cheaper, healthier workforce.</q>',Game.Objects['Factory'].basePrice*tier2,[4,0]);
		new Game.Upgrade('Sweatshop','Factories are <b>twice</b> as efficient.<q>Slackers will be terminated.</q>',Game.Objects['Factory'].basePrice*tier3,[4,1]);
		
		order=500;
		new Game.Upgrade('Sugar gas','Mines gain <b>+10</b> base CpS.<q>A pink, volatile gas, found in the depths of some chocolate caves.</q>',Game.Objects['Mine'].basePrice*tier1,[3,0]);
		new Game.Upgrade('Megadrill','Mines are <b>twice</b> as efficient.<q>You\'re in deep.</q>',Game.Objects['Mine'].basePrice*tier2,[3,0]);
		new Game.Upgrade('Ultradrill','Mines are <b>twice</b> as efficient.<q>Finally caved in?</q>',Game.Objects['Mine'].basePrice*tier3,[3,1]);
		
		order=600;
		new Game.Upgrade('Vanilla nebulae','Shipments gain <b>+30</b> base CpS.<q>If you removed your space helmet, you could probably smell it!<br>(Note : don\'t do that.)</q>',Game.Objects['Shipment'].basePrice*tier1,[5,0]);
		new Game.Upgrade('Wormholes','Shipments are <b>twice</b> as efficient.<q>By using these as shortcuts, your ships can travel much faster.</q>',Game.Objects['Shipment'].basePrice*tier2,[5,0]);
		new Game.Upgrade('Frequent flyer','Shipments are <b>twice</b> as efficient.<q>Come back soon!</q>',Game.Objects['Shipment'].basePrice*tier3,[5,1]);
		
		order=700;
		new Game.Upgrade('Antimony','Alchemy labs gain <b>+100</b> base CpS.<q>Actually worth a lot of mony.</q>',Game.Objects['Alchemy lab'].basePrice*tier1,[6,0]);
		new Game.Upgrade('Essence of dough','Alchemy labs are <b>twice</b> as efficient.<q>Extracted through the 5 ancient steps of alchemical baking.</q>',Game.Objects['Alchemy lab'].basePrice*tier2,[6,0]);
		new Game.Upgrade('True chocolate','Alchemy labs are <b>twice</b> as efficient.<q>The purest form of cacao.</q>',Game.Objects['Alchemy lab'].basePrice*tier3,[6,1]);
		
		order=800;
		new Game.Upgrade('Ancient tablet','Portals gain <b>+1,666</b> base CpS.<q>A strange slab of peanut brittle, holding an ancient cookie recipe. Neat!</q>',Game.Objects['Portal'].basePrice*tier1,[7,0]);
		new Game.Upgrade('Insane oatling workers','Portals are <b>twice</b> as efficient.<q>ARISE, MY MINIONS!</q>',Game.Objects['Portal'].basePrice*tier2,[7,0]);
		new Game.Upgrade('Soul bond','Portals are <b>twice</b> as efficient.<q>So I just sign up and get more cookies? Sure, whatever!</q>',Game.Objects['Portal'].basePrice*tier3,[7,1]);
		
		order=900;
		new Game.Upgrade('Flux capacitors','Time machines gain <b>+9,876</b> base CpS.<q>Bake to the future.</q>',1234567890,[8,0]);
		new Game.Upgrade('Time paradox resolver','Time machines are <b>twice</b> as efficient.<q>No more fooling around with your own grandmother!</q>',9876543210,[8,0]);
		new Game.Upgrade('Quantum conundrum','Time machines are <b>twice</b> as efficient.<q>There is only one constant, and that is universal uncertainty.<br>Or is it?</q>',98765456789,[8,1]);
		
		order=20000;
		new Game.Upgrade('Kitten helpers','You gain <b>more CpS</b> the more milk you have.<q>meow may I help you</q>',9000000,[1,7]);
		new Game.Upgrade('Kitten workers','You gain <b>more CpS</b> the more milk you have.<q>meow meow meow meow</q>',9000000000,[2,7]);
		
		order=10000;
		type='cookie';power=5;
		new Game.Upgrade('Oatmeal raisin cookies','Cookie production multiplier <b>+5%</b>.<q>No raisin to hate these.</q>',99999999,[0,3]);
		new Game.Upgrade('Peanut butter cookies','Cookie production multiplier <b>+5%</b>.<q>Get yourself some jam cookies!</q>',99999999,[1,3]);
		new Game.Upgrade('Plain cookies','Cookie production multiplier <b>+5%</b>.<q>Meh.</q>',99999999,[2,3]);
		new Game.Upgrade('Coconut cookies','Cookie production multiplier <b>+5%</b>.<q>These are *way* flaky.</q>',999999999,[3,3]);
		new Game.Upgrade('White chocolate cookies','Cookie production multiplier <b>+5%</b>.<q>I know what you\'ll say. It\'s just cocoa butter! It\'s not real chocolate!<br>Oh please.</q>',999999999,[4,3]);
		new Game.Upgrade('Macadamia nut cookies','Cookie production multiplier <b>+5%</b>.<q>They\'re macadamn delicious!</q>',999999999,[5,3]);
		power=10;new Game.Upgrade('Double-chip cookies','Cookie production multiplier <b>+10%</b>.<q>DOUBLE THE CHIPS<br>DOUBLE THE TASTY<br>(double the calories)</q>',99999999999,[6,3]);
		power=5;new Game.Upgrade('Sugar cookies','Cookie production multiplier <b>+5%</b>.<q>Tasty, if a little unimaginative.</q>',99999999,[7,3]);
		power=10;new Game.Upgrade('White chocolate macadamia nut cookies','Cookie production multiplier <b>+10%</b>.<q>Orteil\'s favorite.</q>',99999999999,[8,3]);
		new Game.Upgrade('All-chocolate cookies','Cookie production multiplier <b>+10%</b>.<q>CHOCOVERDOSE.</q>',99999999999,[9,3]);
		type='';power=0;
		
		order=100;
		new Game.Upgrade('Quadrillion fingers','The mouse and cursors gain <b>+20</b> cookies for each non-cursor object owned.<q>clickityclickityclickityclickityclick</q>',50000000000,[3,6]);
		
		order=200;new Game.Upgrade('Prune juice','Grandmas are <b>twice</b> as efficient.<q>Gets me going.</q>',Game.Objects['Grandma'].basePrice*tier4,[1,2]);
		order=300;new Game.Upgrade('Genetically-modified cookies','Farms are <b>twice</b> as efficient.<q>All-natural mutations.</q>',Game.Objects['Farm'].basePrice*tier4,[2,2]);
		order=400;new Game.Upgrade('Radium reactors','Factories are <b>twice</b> as efficient.<q>Gives your cookies a healthy glow.</q>',Game.Objects['Factory'].basePrice*tier4,[4,2]);
		order=500;new Game.Upgrade('Ultimadrill','Mines are <b>twice</b> as efficient.<q>Pierce the heavens, etc.</q>',Game.Objects['Mine'].basePrice*tier4,[3,2]);
		order=600;new Game.Upgrade('Warp drive','Shipments are <b>twice</b> as efficient.<q>To boldly bake.</q>',Game.Objects['Shipment'].basePrice*tier4,[5,2]);
		order=700;new Game.Upgrade('Ambrosia','Alchemy labs are <b>twice</b> as efficient.<q>Adding this to the cookie mix is sure to make them even more addictive!<br>Perhaps dangerously so.<br>Let\'s hope you can keep selling these legally.</q>',Game.Objects['Alchemy lab'].basePrice*tier4,[6,2]);
		order=800;new Game.Upgrade('Sanity dance','Portals are <b>twice</b> as efficient.<q>We can change if we want to.<br>We can leave our brains behind.</q>',Game.Objects['Portal'].basePrice*tier4,[7,2]);
		order=900;new Game.Upgrade('Causality enforcer','Time machines are <b>twice</b> as efficient.<q>What happened, happened.</q>',1234567890000,[8,2]);
		
		order=5000;
		new Game.Upgrade('Lucky day','Golden cookies appear <b>twice as often</b> and stay <b>twice as long</b>.<q>Oh hey, a four-leaf penny!</q>',777777777,[10,1]);
		new Game.Upgrade('Serendipity','Golden cookies appear <b>twice as often</b> and stay <b>twice as long</b>.<q>What joy! Seven horseshoes!</q>',77777777777,[10,1]);
		
		order=20000;
		new Game.Upgrade('Kitten engineers','You gain <b>more CpS</b> the more milk you have.<q>meow meow meow meow, sir</q>',9000000000000,[3,7]);
		
		order=10000;
		type='cookie';power=15;
		new Game.Upgrade('Dark chocolate-coated cookies','Cookie production multiplier <b>+15%</b>.<q>These absorb light so well you almost need to squint to see them.</q>',999999999999,[10,3]);
		new Game.Upgrade('White chocolate-coated cookies','Cookie production multiplier <b>+15%</b>.<q>These dazzling cookies absolutely glisten with flavor.</q>',999999999999,[11,3]);
		type='';power=0;
		
		order=250;
		new Game.Upgrade('Farmer grandmas','Grandmas are <b>twice</b> as efficient.<q>A nice farmer to grow more cookies.</q>',Game.Objects['Farm'].basePrice*tier2,[10,9],function(){Game.Objects['Grandma'].drawFunction();});
		new Game.Upgrade('Worker grandmas','Grandmas are <b>twice</b> as efficient.<q>A nice worker to manufacture more cookies.</q>',Game.Objects['Factory'].basePrice*tier2,[10,9],function(){Game.Objects['Grandma'].drawFunction();});
		new Game.Upgrade('Miner grandmas','Grandmas are <b>twice</b> as efficient.<q>A nice miner to dig more cookies.</q>',Game.Objects['Mine'].basePrice*tier2,[10,9],function(){Game.Objects['Grandma'].drawFunction();});
		new Game.Upgrade('Cosmic grandmas','Grandmas are <b>twice</b> as efficient.<q>A nice thing to... uh... cookies.</q>',Game.Objects['Shipment'].basePrice*tier2,[10,9],function(){Game.Objects['Grandma'].drawFunction();});
		new Game.Upgrade('Transmuted grandmas','Grandmas are <b>twice</b> as efficient.<q>A nice golden grandma to convert into more cookies.</q>',Game.Objects['Alchemy lab'].basePrice*tier2,[10,9],function(){Game.Objects['Grandma'].drawFunction();});
		new Game.Upgrade('Altered grandmas','Grandmas are <b>twice</b> as efficient.<q>a NiCe GrAnDmA tO bA##########</q>',Game.Objects['Portal'].basePrice*tier2,[10,9],function(){Game.Objects['Grandma'].drawFunction();});
		new Game.Upgrade('Grandmas\' grandmas','Grandmas are <b>twice</b> as efficient.<q>A nice grandma\'s nice grandma to bake double the cookies.</q>',Game.Objects['Time machine'].basePrice*tier2,[10,9],function(){Game.Objects['Grandma'].drawFunction();});
		
		order=14000;
		Game.baseResearchTime=Game.fps*60*30;
		Game.SetResearch=function(what,time)
		{
			if (Game.Upgrades[what])
			{
				Game.researchT=Game.baseResearchTime;
				if (Game.Has('Persistent memory')) Game.researchT=Math.ceil(Game.baseResearchTime/10);
				if (Game.Has('Ultrascience')) Game.researchT=Game.fps*5;
				Game.nextResearch=Game.Upgrades[what].id;
				Game.Popup('Research has begun.');
			}
		}
		
		new Game.Upgrade('Bingo center/Research facility','Grandma-operated science lab and leisure club.<br>Grandmas are <b>4 times</b> as efficient.<br><b>Regularly unlocks new upgrades</b>.<q>What could possibly keep those grandmothers in check?...<br>Bingo.</q>',100000000000,[11,9],function(){Game.SetResearch('Specialized chocolate chips');});
		
		order=15000;
		
		new Game.Upgrade('Specialized chocolate chips','[Research]<br>Cookie production multiplier <b>+1%</b>.<q>Computer-designed chocolate chips. Computer chips, if you will.</q>',10000000000,[0,9],function(){Game.SetResearch('Designer cocoa beans');});
		new Game.Upgrade('Designer cocoa beans','[Research]<br>Cookie production multiplier <b>+2%</b>.<q>Now more aerodynamic than ever!</q>',20000000000,[1,9],function(){Game.SetResearch('Ritual rolling pins');});
		new Game.Upgrade('Ritual rolling pins','[Research]<br>Grandmas are <b>twice</b> as efficient.<q>The result of years of scientific research!</q>',40000000000,[2,9],function(){Game.SetResearch('Underworld ovens');});
		new Game.Upgrade('Underworld ovens','[Research]<br>Cookie production multiplier <b>+3%</b>.<q>Powered by science, of course!</q>',80000000000,[3,9],function(){Game.SetResearch('One mind');});
		new Game.Upgrade('One mind','[Research]<br>Each grandma gains <b>+1 base CpS for every 50 grandmas</b>.<div class="warning">Note : the grandmothers are growing restless. Do not encourage them.</div><q>We are one. We are many.</q>',160000000000,[4,9],function(){Game.elderWrath=1;Game.SetResearch('Exotic nuts');});
		Game.Upgrades['One mind'].clickFunction=function(){return confirm('Warning : purchasing this will have unexpected, and potentially undesirable results!\nIt\'s all downhill from here. You have been warned!\nPurchase anyway?');};
		new Game.Upgrade('Exotic nuts','[Research]<br>Cookie production multiplier <b>+4%</b>.<q>You\'ll go crazy over these!</q>',320000000000,[5,9],function(){Game.SetResearch('Communal brainsweep');});
		new Game.Upgrade('Communal brainsweep','[Research]<br>Each grandma gains another <b>+1 base CpS for every 50 grandmas</b>.<div class="warning">Note : proceeding any further in scientific research may have unexpected results. You have been warned.</div><q>We fuse. We merge. We grow.</q>',640000000000,[6,9],function(){Game.elderWrath=2;Game.SetResearch('Arcane sugar');});
		new Game.Upgrade('Arcane sugar','[Research]<br>Cookie production multiplier <b>+5%</b>.<q>Tastes like insects, ligaments, and molasses.</q>',1280000000000,[7,9],function(){Game.SetResearch('Elder Pact');});
		new Game.Upgrade('Elder Pact','[Research]<br>Each grandma gains <b>+1 base CpS for every 20 portals</b>.<div class="warning">Note : this is a bad idea.</div><q>squirm crawl slither writhe<br>today we rise</q>',2560000000000,[8,9],function(){Game.elderWrath=3;});
		new Game.Upgrade('Elder Pledge','[Repeatable]<br>Contains the wrath of the elders, at least for a while.<q>This is a simple ritual involving anti-aging cream, cookie batter mixed in the moonlight, and a live chicken.</q>',1,[9,9],function()
		{
			Game.elderWrath=0;
			Game.pledges++;
			Game.pledgeT=Game.fps*60*(Game.Has('Sacrificial rolling pins')?60:30);
			Game.Upgrades['Elder Pledge'].basePrice=Math.pow(8,Math.min(Game.pledges+2,14));
			Game.Unlock('Elder Covenant');
			Game.CollectWrinklers();
		});
		Game.Upgrades['Elder Pledge'].hide=3;
		
		order=150;
		new Game.Upgrade('Plastic mouse','Clicking gains <b>+1% of your CpS</b>.<q>Slightly squeaky.</q>',50000,[11,0]);
		new Game.Upgrade('Iron mouse','Clicking gains <b>+1% of your CpS</b>.<q>Click like it\'s 1349!</q>',5000000,[11,0]);
		new Game.Upgrade('Titanium mouse','Clicking gains <b>+1% of your CpS</b>.<q>Heavy, but powerful.</q>',500000000,[11,1]);
		new Game.Upgrade('Adamantium mouse','Clicking gains <b>+1% of your CpS</b>.<q>You could cut diamond with these.</q>',50000000000,[11,2]);
		
		order=40000;
		new Game.Upgrade('Ultrascience','Research takes only <b>5 seconds</b>.<q>YEAH, SCIENCE!</q>',7,[9,2]);//debug purposes only
		Game.Upgrades['Ultrascience'].hide=3;Game.Upgrades['Ultrascience'].debug=1;
		
		order=10000;
		type='cookie';power=15;
		new Game.Upgrade('Eclipse cookies','Cookie production multiplier <b>+15%</b>.<q>Look to the cookie.</q>',9999999999999,[0,4]);
		new Game.Upgrade('Zebra cookies','Cookie production multiplier <b>+15%</b>.<q>...</q>',9999999999999,[1,4]);
		type='';power=0;
		
		order=100;
		new Game.Upgrade('Quintillion fingers','The mouse and cursors gain <b>+100</b> cookies for each non-cursor object owned.<q>man, just go click click click click click, it\'s real easy, man.</q>',50000000000000,[3,6]);
		
		order=40000;
		new Game.Upgrade('Gold hoard','Golden cookies appear <b>really often</b>.<q>That\'s entirely too many.</q>',7,[10,1]);//debug purposes only
		Game.Upgrades['Gold hoard'].hide=3;Game.Upgrades['Gold hoard'].debug=1;
		
		order=15000;
		new Game.Upgrade('Elder Covenant','[Switch]<br>Puts a permanent end to the elders\' wrath, at the price of 5% of your CpS.<q>This is a complicated ritual involving silly, inconsequential trivialities such as cursed laxatives, century-old cacao, and an infant.<br>Don\'t question it.</q>',66666666666666,[8,9],function()
		{
			Game.pledgeT=0;
			Game.Lock('Revoke Elder Covenant');
			Game.Unlock('Revoke Elder Covenant');
			Game.Lock('Elder Pledge');
			Game.Win('Elder calm');
			Game.CollectWrinklers();
		});
		Game.Upgrades['Elder Covenant'].hide=3;

		new Game.Upgrade('Revoke Elder Covenant','[Switch]<br>You will get 5% of your CpS back, but the grandmatriarchs will return.<q>we<br>rise<br>again</q>',6666666666,[8,9],function()
		{
			Game.Lock('Elder Covenant');
			Game.Unlock('Elder Covenant');
		});
		Game.Upgrades['Revoke Elder Covenant'].hide=3;
		
		order=5000;
		new Game.Upgrade('Get lucky','Golden cookie effects last <b>twice as long</b>.<q>You\'ve been up all night, haven\'t you?</q>',77777777777777,[10,1]);
		
		order=15000;
		new Game.Upgrade('Sacrificial rolling pins','Elder pledge last <b>twice</b> as long.<q>These are mostly for spreading the anti-aging cream.<br>(and accessorily, shortening the chicken\'s suffering.)</q>',2888888888888,[2,9]);
		
		order=10000;
		type='cookie';power=15;
		new Game.Upgrade('Snickerdoodles','Cookie production multiplier <b>+15%</b>.<q>True to their name.</q>',99999999999999,[2,4]);
		new Game.Upgrade('Stroopwafels','Cookie production multiplier <b>+15%</b>.<q>If it ain\'t dutch, it ain\'t much.</q>',99999999999999,[3,4]);
		new Game.Upgrade('Macaroons','Cookie production multiplier <b>+15%</b>.<q>Not to be confused with macarons.<br>These have coconut, okay?</q>',99999999999999,[4,4]);
		type='';power=0;
		
		order=40000;
		new Game.Upgrade('Neuromancy','Can toggle upgrades on and off at will in the stats menu.<q>Can also come in handy to unsee things that can\'t be unseen.</q>',7,[4,9]);//debug purposes only
		Game.Upgrades['Neuromancy'].hide=3;Game.Upgrades['Neuromancy'].debug=1;
		
		order=10000;
		type='cookie';power=15;
		new Game.Upgrade('Empire biscuits','Cookie production multiplier <b>+15%</b>.<q>For your growing cookie empire, of course!</q>',99999999999999,[5,4]);
		new Game.Upgrade('British tea biscuits','Cookie production multiplier <b>+15%</b>.<q>Quite.</q>',99999999999999,[6,4]);
		new Game.Upgrade('Chocolate british tea biscuits','Cookie production multiplier <b>+15%</b>.<q>Yes, quite.</q>',99999999999999,[7,4]);
		new Game.Upgrade('Round british tea biscuits','Cookie production multiplier <b>+15%</b>.<q>Yes, quite riveting.</q>',99999999999999,[8,4]);
		new Game.Upgrade('Round chocolate british tea biscuits','Cookie production multiplier <b>+15%</b>.<q>Yes, quite riveting indeed.</q>',99999999999999,[9,4]);
		new Game.Upgrade('Round british tea biscuits with heart motif','Cookie production multiplier <b>+15%</b>.<q>Yes, quite riveting indeed, old chap.</q>',99999999999999,[10,4]);
		new Game.Upgrade('Round chocolate british tea biscuits with heart motif','Cookie production multiplier <b>+15%</b>.<q>I like cookies.</q>',99999999999999,[11,4]);
		type='';power=0;
		
		
		order=1000;
		new Game.Upgrade('Sugar bosons','Antimatter condensers gain <b>+99,999</b> base CpS.<q>Sweet firm bosons.</q>',Game.Objects['Antimatter condenser'].basePrice*tier1,[13,0]);
		new Game.Upgrade('String theory','Antimatter condensers are <b>twice</b> as efficient.<q>Reveals new insight about the true meaning of baking cookies (and, as a bonus, the structure of the universe).</q>',Game.Objects['Antimatter condenser'].basePrice*tier2,[13,0]);
		new Game.Upgrade('Large macaron collider','Antimatter condensers are <b>twice</b> as efficient.<q>How singular!</q>',Game.Objects['Antimatter condenser'].basePrice*tier3,[13,1]);
		new Game.Upgrade('Big bang bake','Antimatter condensers are <b>twice</b> as efficient.<q>And that\'s how it all began.</q>',Game.Objects['Antimatter condenser'].basePrice*tier4,[13,2]);

		order=250;
		new Game.Upgrade('Antigrandmas','Grandmas are <b>twice</b> as efficient.<q>A mean antigrandma to vomit more cookies.<br>(Do not put in contact with normal grandmas; loss of matter may occur.)</q>',Game.Objects['Antimatter condenser'].basePrice*tier2,[10,9],function(){Game.Objects['Grandma'].drawFunction();});

		order=10000;
		type='cookie';power=20;
		new Game.Upgrade('Madeleines','Cookie production multiplier <b>+20%</b>.<q>Unforgettable!</q>',199999999999999,[12,3]);
		new Game.Upgrade('Palmiers','Cookie production multiplier <b>+20%</b>.<q>Palmier than you!<br>Yes, I just said that.</q>',199999999999999,[13,3]);
		new Game.Upgrade('Palets','Cookie production multiplier <b>+20%</b>.<q>You could probably play hockey with these.<br>I mean, you\'re welcome to try.</q>',199999999999999,[12,4]);
		new Game.Upgrade('Sabl&eacute;s','Cookie production multiplier <b>+20%</b>.<q>The name implies they\'re made of sand. But you know better, don\'t you?</q>',199999999999999,[13,4]);
		type='';power=0;
		
		order=20000;
		new Game.Upgrade('Kitten overseers','You gain <b>more CpS</b> the more milk you have.<q>my purrpose is to serve you, sir</q>',900000000000000,[8,7]);
		
		
		order=100;
		new Game.Upgrade('Sextillion fingers','The mouse and cursors gain <b>+200</b> cookies for each non-cursor object owned.<q>sometimes<br>things just<br>click</q>',500000000000000,[12,13]);
		
		order=200;new Game.Upgrade('Double-thick glasses','Grandmas are <b>twice</b> as efficient.<q>Oh... so THAT\'s what I\'ve been baking.</q>',Game.Objects['Grandma'].basePrice*tier5,[1,13]);
		order=300;new Game.Upgrade('Gingerbread scarecrows','Farms are <b>twice</b> as efficient.<q>Staring at your crops with mischievous glee.</q>',Game.Objects['Farm'].basePrice*tier5,[2,13]);
		order=400;new Game.Upgrade('Recombobulators','Factories are <b>twice</b> as efficient.<q>A major part of cookie recombobulation.</q>',Game.Objects['Factory'].basePrice*tier5,[4,13]);
		order=500;new Game.Upgrade('H-bomb mining','Mines are <b>twice</b> as efficient.<q>Questionable efficiency, but spectacular nonetheless.</q>',Game.Objects['Mine'].basePrice*tier5,[3,13]);
		order=600;new Game.Upgrade('Chocolate monoliths','Shipments are <b>twice</b> as efficient.<q>My god. It\'s full of chocolate bars.</q>',Game.Objects['Shipment'].basePrice*tier5,[5,13]);
		order=700;new Game.Upgrade('Aqua crustulae','Alchemy labs are <b>twice</b> as efficient.<q>Careful with the dosing - one drop too much and you get muffins.<br>And nobody likes muffins.</q>',Game.Objects['Alchemy lab'].basePrice*tier5,[6,13]);
		order=800;new Game.Upgrade('Brane transplant','Portals are <b>twice</b> as efficient.<q>This refers to the practice of merging higher dimensional universes, or "branes", with our own, in order to facilitate transit (and harvesting of precious cookie dough).</q>',Game.Objects['Portal'].basePrice*tier5,[7,13]);
		order=900;new Game.Upgrade('Yestermorrow comparators','Time machines are <b>twice</b> as efficient.<q>Fortnights into milleniums.</q>',Game.Objects['Time machine'].basePrice*tier5,[8,13]);
		order=1000;new Game.Upgrade('Reverse cyclotrons','Antimatter condensers are <b>twice</b> as efficient.<q>These can uncollision particles and unspin atoms. For... uh... better flavor, and stuff.</q>',Game.Objects['Antimatter condenser'].basePrice*tier5,[13,13]);
		
		order=150;
		new Game.Upgrade('Unobtainium mouse','Clicking gains <b>+1% of your CpS</b>.<q>These nice mice should suffice.</q>',5000000000000,[11,13]);
		
		order=10000;
		type='cookie';power=25;
		new Game.Upgrade('Caramoas','Cookie production multiplier <b>+25%</b>.<q>Yeah. That\'s got a nice ring to it.</q>',999999999999999,[14,4]);
		new Game.Upgrade('Sagalongs','Cookie production multiplier <b>+25%</b>.<q>Grandma\'s favorite?</q>',999999999999999,[15,3]);
		new Game.Upgrade('Shortfoils','Cookie production multiplier <b>+25%</b>.<q>Foiled again!</q>',999999999999999,[15,4]);
		new Game.Upgrade('Win mints','Cookie production multiplier <b>+25%</b>.<q>They\'re the luckiest cookies you\'ve ever tasted!</q>',999999999999999,[14,3]);
		type='';power=0;
		
		order=40000;
		new Game.Upgrade('Perfect idling','You keep producing cookies even while the game is closed.<q>It\'s the most beautiful thing I\'ve ever seen.</q>',7,[10,0]);//debug purposes only
		Game.Upgrades['Perfect idling'].hide=3;Game.Upgrades['Perfect idling'].debug=1;
		
		order=10000;
		type='cookie';power=25;
		new Game.Upgrade('Fig gluttons','Cookie production multiplier <b>+25%</b>.<q>Got it all figured out.</q>',999999999999999,[17,4]);
		new Game.Upgrade('Loreols','Cookie production multiplier <b>+25%</b>.<q>Because, uh... they\'re worth it?</q>',999999999999999,[16,3]);
		new Game.Upgrade('Jaffa cakes','Cookie production multiplier <b>+25%</b>.<q>If you want to bake a cookie from scratch, you must first build a factory.</q>',999999999999999,[17,3]);
		new Game.Upgrade('Grease\'s cups','Cookie production multiplier <b>+25%</b>.<q>Extra-greasy peanut butter.</q>',999999999999999,[16,4]);
		type='';power=0;
		
		order=30000;
		new Game.Upgrade('Heavenly chip secret','Unlocks <b>5%</b> of the potential of your heavenly chips.<q>Grants the knowledge of heavenly chips, and how to use them to make baking more efficient.<br>It\'s a secret to everyone.</q>',11,[19,7]);
		new Game.Upgrade('Heavenly cookie stand','Unlocks <b>25%</b> of the potential of your heavenly chips.<q>Don\'t forget to visit the heavenly lemonade stand afterwards.</q>',1111,[18,7]);
		new Game.Upgrade('Heavenly bakery','Unlocks <b>50%</b> of the potential of your heavenly chips.<q>Also sells godly cakes and divine pastries.</q>',111111,[17,7]);
		new Game.Upgrade('Heavenly confectionery','Unlocks <b>75%</b> of the potential of your heavenly chips.<q>They say angel bakers work there. They take angel lunch breaks and sometimes go on angel strikes.</q>',11111111,[16,7]);
		new Game.Upgrade('Heavenly key','Unlocks <b>100%</b> of the potential of your heavenly chips.<q>This is the key to the pearly (and tasty) gates of pastry heaven, granting you access to your entire stockpile of heavenly chips.<br>May you use them wisely.</q>',1111111111,[15,7]);
		
		order=10100;
		type='cookie';power=20;
		new Game.Upgrade('Skull cookies','Cookie production multiplier <b>+20%</b>.<q>Wanna know something spooky? You\'ve got one of these inside your head RIGHT NOW.</q>',444444444444,[12,8]);
		new Game.Upgrade('Ghost cookies','Cookie production multiplier <b>+20%</b>.<q>They\'re something strange, but they look pretty good!</q>',444444444444,[13,8]);
		new Game.Upgrade('Bat cookies','Cookie production multiplier <b>+20%</b>.<q>The cookies this town deserves.</q>',444444444444,[14,8]);
		new Game.Upgrade('Slime cookies','Cookie production multiplier <b>+20%</b>.<q>The incredible melting cookies!</q>',444444444444,[15,8]);
		new Game.Upgrade('Pumpkin cookies','Cookie production multiplier <b>+20%</b>.<q>Not even pumpkin-flavored. Tastes like glazing. Yeugh.</q>',444444444444,[16,8]);
		new Game.Upgrade('Eyeball cookies','Cookie production multiplier <b>+20%</b>.<q>When you stare into the cookie, the cookie stares back at you.</q>',444444444444,[17,8]);
		new Game.Upgrade('Spider cookies','Cookie production multiplier <b>+20%</b>.<q>You found the recipe on the web. They do whatever a cookie can.</q>',444444444444,[18,8]);
		type='';power=0;
		
		order=14000;
		new Game.Upgrade('Persistent memory','Subsequent research will be <b>10 times</b> as fast.<q>It\'s all making sense!<br>Again!</q>',100000000000,[9,2]);
		
		order=40000;
		new Game.Upgrade('Wrinkler doormat','Wrinklers spawn much more frequently.<q>You\'re such a pushover.</q>',7,[19,8]);//debug purposes only
		Game.Upgrades['Wrinkler doormat'].hide=3;Game.Upgrades['Wrinkler doormat'].debug=1;
		
		order=10200;
		type='cookie';power=20;
		new Game.Upgrade('Christmas tree biscuits','Cookie production multiplier <b>+20%</b>.<q>Whose pine is it anyway?</q>',252525252525,[12,10]);
		new Game.Upgrade('Snowflake biscuits','Cookie production multiplier <b>+20%</b>.<q>Mass-produced to be unique in every way.</q>',252525252525,[13,10]);
		new Game.Upgrade('Snowman biscuits','Cookie production multiplier <b>+20%</b>.<q>It\'s frosted. Doubly so.</q>',252525252525,[14,10]);
		new Game.Upgrade('Mistletoe biscuits','Cookie production multiplier <b>+20%</b>.<q>An acceptable smooching catalyst. Botanically, this is a smellier variant of the mistlefinger.</q>',252525252525,[15,10]);
		new Game.Upgrade('Candy cane biscuits','Cookie production multiplier <b>+20%</b>.<q>It\'s two treats in one!<br>(Further inspection reveals the frosting does not actually taste like peppermint, but like mundane sugary frosting.)</q>',252525252525,[16,10]);
		new Game.Upgrade('Bell biscuits','Cookie production multiplier <b>+20%</b>.<q>What do these even have to do with christmas? Who cares, ring them in!</q>',252525252525,[17,10]);
		new Game.Upgrade('Present biscuits','Cookie production multiplier <b>+20%</b>.<q>The prequel to future biscuits. Watch out!</q>',252525252525,[18,10]);
		type='';power=0;
		
		order=10000;
		type='cookie';power=25;
		new Game.Upgrade('Gingerbread men','Cookie production multiplier <b>+25%</b>.<q>You like to bite the legs off first, right? How about tearing off the arms? You sick monster.</q>',9999999999999999,[18,4]);
		new Game.Upgrade('Gingerbread trees','Cookie production multiplier <b>+25%</b>.<q>Evergreens in pastry form. Yule be surprised what you can come up with.</q>',9999999999999999,[18,3]);
		type='';power=0;
		
		order=25000;
		new Game.Upgrade('A festive hat','<b>Unlocks... something.</b><q>Not a creature was stirring, not even a mouse.</q>',25,[19,9],function()
		{
			var drop=choose(Game.santaDrops);
			Game.Unlock(drop);
			Game.Popup('In the festive hat, you find...<br>a festive test tube<br>and '+drop+'.');
		});
		
		new Game.Upgrade('Increased merriness','Cookie production multiplier <b>+15%</b>.<q>It turns out that the key to increased merriness, strangely enough, happens to be a good campfire and some s\'mores.<br>You know what they say, after all; the s\'more, the merrier.</q>',2525,[17,9]);
		new Game.Upgrade('Improved jolliness','Cookie production multiplier <b>+15%</b>.<q>A nice wobbly belly goes a long way.<br>You jolly?</q>',2525,[17,9]);
		new Game.Upgrade('A lump of coal','Cookie production multiplier <b>+1%</b>.<q>Some of the world\'s worst stocking stuffing.<br>I guess you could try starting your own little industrial revolution, or something?...</q>',2525,[13,9]);
		new Game.Upgrade('An itchy sweater','Cookie production multiplier <b>+1%</b>.<q>You don\'t know what\'s worse : the embarrassingly quaint "elf on reindeer" motif, or the fact that wearing it makes you feel like you\'re wrapped in a dead sasquatch.</q>',2525,[14,9]);
		new Game.Upgrade('Reindeer baking grounds','Reindeer appear <b>twice as frequently</b>.<q>Male reindeer are from Mars; female reindeer are from venison.</q>',2525,[12,9]);
		new Game.Upgrade('Weighted sleighs','Reindeer are <b>twice as slow</b>.<q>Hope it was worth the weight.<br>(Something something forced into cervidude)</q>',2525,[12,9]);
		new Game.Upgrade('Ho ho ho-flavored frosting','Reindeer give <b>twice as much</b>.<q>It\'s time to up the antler.</q>',2525,[12,9]);
		new Game.Upgrade('Season savings','All buildings are <b>1% cheaper</b>.<q>By Santa\'s beard, what savings!<br>But who will save us?</q>',2525,[16,9],function(){Game.RefreshBuildings();});
		new Game.Upgrade('Toy workshop','All upgrades are <b>5% cheaper</b>.<q>Watch yours-elf around elvesdroppers who might steal our production secrets.<br>Or elven worse!</q>',2525,[16,9],function(){Game.upgradesToRebuild=1;});
		new Game.Upgrade('Naughty list','Grandmas are <b>twice</b> as productive.<q>This list contains every unholy deed perpetuated by grandmakind.<br>He won\'t be checking this one twice.<br>Once. Once is enough.</q>',2525,[15,9]);
		new Game.Upgrade('Santa\'s bottomless bag','Random drops are <b>10% more common</b>.<q>This is one bottom you can\'t check out.</q>',2525,[19,9]);
		new Game.Upgrade('Santa\'s helpers','Clicking is <b>10% more powerful</b>.<q>Some choose to help hamburger; some choose to help you.<br>To each their own, I guess.</q>',2525,[19,9]);
		new Game.Upgrade('Santa\'s legacy','Cookie production multiplier <b>+10% per Santa\'s levels</b>.<q>In the north pole, you gotta get the gnomes first. Then when you get the gnomes, you start making the toys. Then when you get the toys... then you get the cookies.</q>',2525,[19,9]);
		new Game.Upgrade('Santa\'s milk and cookies','Milk is <b>5% more powerful</b>.<q>Part of Santa\'s dreadfully unbalanced diet.</q>',2525,[19,9]);
		
		order=40000;
		new Game.Upgrade('Reindeer season','Reindeer spawn much more frequently.<q>Go, Cheater! Go, Hacker and Faker!</q>',7,[12,9]);//debug purposes only
		Game.Upgrades['Reindeer season'].hide=3;Game.Upgrades['Reindeer season'].debug=1;
		
		order=25000;
		new Game.Upgrade('Santa\'s dominion','Cookie production multiplier <b>+50%</b>.<br>All buildings are <b>1% cheaper</b>.<br>All upgrades are <b>2% cheaper</b>.<q>My name is Claus, king of kings;<br>Look on my toys, ye Mighty, and despair!</q>',2525252525252525,[19,10]);
		
		/*
		//I really should release these someday
		new Game.Upgrade('Plain milk','Unlocks <b>plain milk</b>, available in the menu.',120000000000,[4,7]);
		new Game.Upgrade('Chocolate milk','Unlocks <b>chocolate milk</b>, available in the menu.',120000000000,[5,7]);
		new Game.Upgrade('Raspberry milk','Unlocks <b>raspberry milk</b>, available in the menu.',120000000000,[6,7]);
		new Game.Upgrade('Orange juice','Unlocks <b>orange juice</b>, available in the menu.',120000000000,[7,7]);
		new Game.Upgrade('Ain\'t got milk','Unlocks <b>no milk please</b>, available in the menu.',120000000000,[0,7]);
		
		new Game.Upgrade('Blue background','Unlocks the <b>blue background</b>, available in the menu.',120000000000,[0,8]);
		new Game.Upgrade('Red background','Unlocks the <b>red background</b>, available in the menu.',120000000000,[1,8]);
		new Game.Upgrade('White background','Unlocks the <b>white background</b>, available in the menu.',120000000000,[2,8]);
		new Game.Upgrade('Black background','Unlocks the <b>black background</b>, available in the menu.',120000000000,[3,8]);
		*/
		
		//new Game.Upgrade('Golden switch','Unlocks the <b>Golden switch</b>, available in the menu.<br>When active, the Golden switch grants you a passive CpS boost, but prevents golden cookies from spawning.',77777777777,[10,1]);
		
		/*=====================================================================================
		ACHIEVEMENTS
		=======================================================================================*/
		Game.Achievements=[];
		Game.AchievementsById=[];
		Game.AchievementsN=0;
		Game.AchievementsOwned=0;
		Game.Achievement=function(name,desc,icon,hide)
		{
			this.id=Game.AchievementsN;
			this.name=name;
			this.desc=desc;
			this.icon=icon;
			this.won=0;
			this.disabled=0;
			this.hide=hide||0;//hide levels : 0=show, 1=hide description, 2=hide, 3=secret (doesn't count toward achievement total)
			this.order=this.id;
			if (order) this.order=order+this.id*0.001;
			
			this.category='none';
			
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
						Game.Achievements[what].won=1;
						Game.Popup('Achievement unlocked :<br>'+Game.Achievements[what].name+'<br> ');
						if (Game.Achievements[what].hide!=3) Game.AchievementsOwned++;
						Game.recalculateGains=1;
					}
				}
			}
			else {for (var i in what) {Game.Win(what[i]);}}
		}
		
		Game.HasAchiev=function(what)
		{
			return (Game.Achievements[what]?Game.Achievements[what].won:0);
		}
		
		//define achievements
		//WARNING : do NOT add new achievements in between, this breaks the saves. Add them at the end !
		
		var order=100;//this is used to set the order in which the items are listed
		//new Game.Achievement('name','description',[0,0]);
		Game.moneyAchievs=[
		'Wake and bake',				1,
		'Making some dough',			100,
		'So baked right now',			1000,
		'Fledgling bakery',				10000,
		'Affluent bakery',				100000,
		'World-famous bakery',			1000000,
		'Cosmic bakery',				10000000,
		'Galactic bakery',				100000000,
		'Universal bakery', 			1000000000,
		'Timeless bakery', 				10000000000,
		'Infinite bakery', 				100000000000,
		'Immortal bakery', 				1000000000000,
		'You can stop now', 			10000000000000,
		'Cookies all the way down', 	100000000000000,
		'Overdose', 					1000000000000000,
		'How?',							10000000000000000
		];
		for (var i=0;i<Game.moneyAchievs.length/2;i++)
		{
			var pic=[Math.min(10,i),5];
			if (i==15) pic=[11,5];
			new Game.Achievement(Game.moneyAchievs[i*2],'Bake <b>'+Beautify(Game.moneyAchievs[i*2+1])+'</b> cookie'+(Game.moneyAchievs[i*2+1]==1?'':'s')+'.',pic,2);
		}
		
		order=200;
		Game.cpsAchievs=[
		'Casual baking',				1,
		'Hardcore baking',				10,
		'Steady tasty stream',			100,
		'Cookie monster',				1000,
		'Mass producer',				10000,
		'Cookie vortex',				1000000,
		'Cookie pulsar',				10000000,
		'Cookie quasar',				100000000,
		'A world filled with cookies',	10000000000,
		'Let\'s never bake again',		1000000000000
		];
		for (var i=0;i<Game.cpsAchievs.length/2;i++)
		{
			var pic=[i,5];
			new Game.Achievement(Game.cpsAchievs[i*2],'Bake <b>'+Beautify(Game.cpsAchievs[i*2+1])+'</b> cookie'+(Game.cpsAchievs[i*2+1]==1?'':'s')+' per second.',pic,2);
		}
		
		order=30000;
		new Game.Achievement('Sacrifice','Reset your game with <b>1 million</b> cookies baked.<q>Easy come, easy go.</q>',[11,6],2);
		new Game.Achievement('Oblivion','Reset your game with <b>1 billion</b> cookies baked.<q>Back to square one.</q>',[11,6],2);
		new Game.Achievement('From scratch','Reset your game with <b>1 trillion</b> cookies baked.<q>It\'s been fun.</q>',[11,6],2);
		
		order=31000;
		new Game.Achievement('Neverclick','Make <b>1 million</b> cookies by only having clicked <b>15 times</b>.',[12,0],2);
		order=1000;
		new Game.Achievement('Clicktastic','Make <b>1,000</b> cookies from clicking.',[11,0]);
		new Game.Achievement('Clickathlon','Make <b>100,000</b> cookies from clicking.',[11,1]);
		new Game.Achievement('Clickolympics','Make <b>10,000,000</b> cookies from clicking.',[11,1]);
		new Game.Achievement('Clickorama','Make <b>1,000,000,000</b> cookies from clicking.',[11,2]);
		
		order=1050;
		new Game.Achievement('Click','Have <b>1</b> cursor.',[0,0]);
		new Game.Achievement('Double-click','Have <b>2</b> cursors.',[0,6]);
		new Game.Achievement('Mouse wheel','Have <b>50</b> cursors.',[1,6]);
		new Game.Achievement('Of Mice and Men','Have <b>100</b> cursors.',[2,6]);
		new Game.Achievement('The Digital','Have <b>200</b> cursors.',[3,6]);
		
		order=1100;
		new Game.Achievement('Just wrong','Sell a grandma.<q>I thought you loved me.</q>',[10,9],2);
		new Game.Achievement('Grandma\'s cookies','Have <b>1</b> grandma.',[1,0]);
		new Game.Achievement('Sloppy kisses','Have <b>50</b> grandmas.',[1,1]);
		new Game.Achievement('Retirement home','Have <b>100</b> grandmas.',[1,2]);
		
		order=1200;
		new Game.Achievement('My first farm','Have <b>1</b> farm.',[2,0]);
		new Game.Achievement('Reap what you sow','Have <b>50</b> farms.',[2,1]);
		new Game.Achievement('Farm ill','Have <b>100</b> farms.',[2,2]);
		
		order=1300;
		new Game.Achievement('Production chain','Have <b>1</b> factory.',[4,0]);
		new Game.Achievement('Industrial revolution','Have <b>50</b> factories.',[4,1]);
		new Game.Achievement('Global warming','Have <b>100</b> factories.',[4,2]);
		
		order=1400;
		new Game.Achievement('You know the drill','Have <b>1</b> mine.',[3,0]);
		new Game.Achievement('Excavation site','Have <b>50</b> mines.',[3,1]);
		new Game.Achievement('Hollow the planet','Have <b>100</b> mines.',[3,2]);
		
		order=1500;
		new Game.Achievement('Expedition','Have <b>1</b> shipment.',[5,0]);
		new Game.Achievement('Galactic highway','Have <b>50</b> shipments.',[5,1]);
		new Game.Achievement('Far far away','Have <b>100</b> shipments.',[5,2]);
		
		order=1600;
		new Game.Achievement('Transmutation','Have <b>1</b> alchemy lab.',[6,0]);
		new Game.Achievement('Transmogrification','Have <b>50</b> alchemy labs.',[6,1]);
		new Game.Achievement('Gold member','Have <b>100</b> alchemy labs.',[6,2]);
		
		order=1700;
		new Game.Achievement('A whole new world','Have <b>1</b> portal.',[7,0]);
		new Game.Achievement('Now you\'re thinking','Have <b>50</b> portals.',[7,1]);
		new Game.Achievement('Dimensional shift','Have <b>100</b> portals.',[7,2]);
		
		order=1800;
		new Game.Achievement('Time warp','Have <b>1</b> time machine.',[8,0]);
		new Game.Achievement('Alternate timeline','Have <b>50</b> time machines.',[8,1]);
		new Game.Achievement('Rewriting history','Have <b>100</b> time machines.',[8,2]);
		
		order=7000;
		new Game.Achievement('One with everything','Have <b>at least 1</b> of every building.',[4,6],2);
		new Game.Achievement('Mathematician','Have at least <b>1 of the most expensive object, 2 of the second-most expensive, 4 of the next</b> and so on (capped at 128).',[7,6],2);
		new Game.Achievement('Base 10','Have at least <b>10 of the most expensive object, 20 of the second-most expensive, 30 of the next</b> and so on.',[8,6],2);
		
		order=10000;
		new Game.Achievement('Golden cookie','Click a <b>golden cookie</b>.',[10,1],1);
		new Game.Achievement('Lucky cookie','Click <b>7 golden cookies</b>.',[10,1],1);
		new Game.Achievement('A stroke of luck','Click <b>27 golden cookies</b>.',[10,1],1);
		
		order=30200;
		new Game.Achievement('Cheated cookies taste awful','Hack in some cookies.',[10,6],3);
		order=30001;
		new Game.Achievement('Uncanny clicker','Click really, really fast.<q>Well I\'ll be!</q>',[12,0],2);
		
		order=5000;
		new Game.Achievement('Builder','Own <b>100</b> buildings.',[4,6],1);
		new Game.Achievement('Architect','Own <b>400</b> buildings.',[5,6],1);
		order=6000;
		new Game.Achievement('Enhancer','Purchase <b>20</b> upgrades.',[9,0],1);
		new Game.Achievement('Augmenter','Purchase <b>50</b> upgrades.',[9,1],1);
		
		order=11000;
		new Game.Achievement('Cookie-dunker','Dunk the cookie.<q>You did it!</q>',[4,7],2);
		
		order=10000;
		new Game.Achievement('Fortune','Click <b>77 golden cookies</b>.<q>You should really go to bed.</q>',[10,1],1);
		order=31000;
		new Game.Achievement('True Neverclick','Make <b>1 million</b> cookies with <b>no</b> cookie clicks.<q>This kinda defeats the whole purpose, doesn\'t it?</q>',[12,0],3);
		
		order=20000;
		new Game.Achievement('Elder nap','Appease the grandmatriarchs at least <b>once</b>.<q>we<br>are<br>eternal</q>',[8,9],2);
		new Game.Achievement('Elder slumber','Appease the grandmatriarchs at least <b>5 times</b>.<q>our mind<br>outlives<br>the universe</q>',[8,9],2);
		
		order=1150;
		new Game.Achievement('Elder','Own at least <b>7</b> grandma types.',[10,9],2);
		
		order=20000;
		new Game.Achievement('Elder calm','Declare a covenant with the grandmatriarchs.<q>we<br>have<br>fed</q>',[8,9],2);
		
		order=5000;
		new Game.Achievement('Engineer','Own <b>800</b> buildings.',[6,6],1);
		
		order=10000;
		new Game.Achievement('Leprechaun','Click <b>777 golden cookies</b>.',[10,1],1);
		new Game.Achievement('Black cat\'s paw','Click <b>7777 golden cookies</b>.',[10,1],3);
		
		order=30000;
		new Game.Achievement('Nihilism','Reset your game with <b>1 quadrillion</b> cookies baked.<q>There are many things<br>that need to be erased</q>',[11,6],2);
		//new Game.Achievement('Galactus\' Reprimand','Reset your game with <b>1 quintillion</b> coo- okay no I'm yanking your chain
		
		order=1900;
		new Game.Achievement('Antibatter','Have <b>1</b> antimatter condenser.',[13,0]);
		new Game.Achievement('Quirky quarks','Have <b>50</b> antimatter condensers.',[13,1]);
		new Game.Achievement('It does matter!','Have <b>100</b> antimatter condensers.',[13,2]);
		
		order=6000;
		new Game.Achievement('Upgrader','Purchase <b>100</b> upgrades.',[9,2],1);
		
		order=7000;
		new Game.Achievement('Centennial','Have at least <b>100 of everything</b>.',[9,6],2);
		
		order=30500;
		new Game.Achievement('Hardcore','Get to <b>1 billion</b> cookies baked with <b>no upgrades purchased</b>.',[12,6],3);
		
		order=30600;
		new Game.Achievement('Speed baking I','Get to <b>1 million</b> cookies baked in <b>35 minutes</b> (with no heavenly upgrades).',[12,5],3);
		new Game.Achievement('Speed baking II','Get to <b>1 million</b> cookies baked in <b>25 minutes</b> (with no heavenly upgrades).',[13,5],3);
		new Game.Achievement('Speed baking III','Get to <b>1 million</b> cookies baked in <b>15 minutes</b> (with no heavenly upgrades).',[14,5],3);
		
		
		
		order=61000;
		var achiev=new Game.Achievement('Getting even with the oven','Defeat the <b>Sentient Furnace</b> in the factory dungeons.',[12,7],3);achiev.category='dungeon';//make this 2 when dungeons are released
		var achiev=new Game.Achievement('Now this is pod-smashing','Defeat the <b>Ascended Baking Pod</b> in the factory dungeons.',[12,7],3);achiev.category='dungeon';//make this 2 when dungeons are released
		var achiev=new Game.Achievement('Chirped out','Find and defeat <b>Chirpy</b>, the dysfunctionning alarm bot.',[13,7],3);achiev.category='dungeon';
		var achiev=new Game.Achievement('Follow the white rabbit','Find and defeat the elusive <b>sugar bunny</b>.',[14,7],3);achiev.category='dungeon';
		
		order=1000;
		new Game.Achievement('Clickasmic','Make <b>100,000,000,000</b> cookies from clicking.',[11,13]);
		
		order=1100;
		new Game.Achievement('Friend of the ancients','Have <b>150</b> grandmas.',[1,13]);
		new Game.Achievement('Ruler of the ancients','Have <b>200</b> grandmas.',[1,13]);
		
		order=32000;
		new Game.Achievement('Wholesome','Unlock <b>100%</b> of your heavenly chips power.',[15,7],2);
		
		order=33000;
		new Game.Achievement('Just plain lucky','You have <b>1 chance in 500,000</b> every second of earning this achievement.',[15,6],3);
		
		order=21000;
		new Game.Achievement('Itchscratcher','Burst <b>1 wrinkler</b>.',[19,8],2);
		new Game.Achievement('Wrinklesquisher','Burst <b>50 wrinklers</b>.',[19,8],2);
		new Game.Achievement('Moistburster','Burst <b>200 wrinklers</b>.',[19,8],2);
		
		order=22000;
		new Game.Achievement('Spooky cookies','Unlock <b>every Halloween-themed cookie</b>.<br>Owning this achievement makes Halloween-themed cookies drop more frequently in future playthroughs.',[12,8],2);
		
		order=22100;
		new Game.Achievement('Coming to town','Reach <b>Santa\'s 7th form</b>.',[18,9],2);
		new Game.Achievement('All hail Santa','Reach <b>Santa\'s final form</b>.',[19,10],2);
		new Game.Achievement('Let it snow','Unlock <b>every Christmas-themed cookie</b>.',[19,9],2);
		new Game.Achievement('Oh deer','Pop <b>1 reindeer</b>.',[12,9],2);
		new Game.Achievement('Sleigh of hand','Pop <b>50 reindeer</b>.',[12,9],2);
		new Game.Achievement('Reindeer sleigher','Pop <b>200 reindeer</b>.',[12,9],2);

		
		
		Game.RuinTheFun=function()
		{
			for (var i in Game.Upgrades)
			{
				Game.Upgrades[i].earn();
				/*
				Game.Upgrades[i].bought=1;
				if (Game.Upgrades[i].buyFunction) Game.Upgrades[i].buyFunction();
				*/
			}
			for (var i in Game.Achievements)
			{
				Game.Win(Game.Achievements[i].name);
			}
			Game.Earn(999999999999999999);
			Game.upgradesToRebuild=1;
			Game.recalculateGains=1;
		}
		
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
		
		Game.wrinklers=[];
		for (var i=0;i<10;i++)
		{
			Game.wrinklers.push({id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:3});
		}
		Game.ResetWrinklers=function()
		{
			for (var i in Game.wrinklers)
			{
				Game.wrinklers[i]={id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:3};
			}
		}
		Game.CollectWrinklers=function()
		{
			for (var i in Game.wrinklers)
			{
				Game.wrinklers[i].hp=0;
			}
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
			for (var i in Game.wrinklers)
			{
				var me=Game.wrinklers[i];
				if (me.phase==0 && Game.elderWrath>0 && Math.random()<(!Game.Has('Wrinkler doormat')?0.0001:0.1)) {me.phase=1;me.hp=3;}//respawn
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
					var d=128*(2-me.close);
					d+=Math.cos(Game.T*0.05+parseInt(me.id))*4;
					me.r=(me.id/Game.wrinklers.length)*360;
					me.r+=Math.sin(Game.T*0.05+parseInt(me.id))*4;
					me.x=xBase+(Math.sin(me.r*Math.PI/180)*d);
					me.y=yBase+(Math.cos(me.r*Math.PI/180)*d);
					me.r+=Math.sin(Game.T*0.09+parseInt(me.id))*4;
					rect={w:100,h:200,r:(-me.r)*Math.PI/180,o:10};
					if (Math.random()<0.01) me.hurt=Math.max(me.hurt,Math.random());
					if (inRect(Game.mouseX-me.x,Game.mouseY-me.y,rect) && onWrinkler==0)
					{
						me.hurt=Math.max(me.hurt,0.25);
						//me.close*=0.99;
						if (Game.Click)
						{
							me.hurt=1;
							me.hp--;
							var x=me.x+(Math.sin(me.r*Math.PI/180)*100);
							var y=me.y+(Math.cos(me.r*Math.PI/180)*100);
							for (var ii=0;ii<3;ii++)
							{
								Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
							}
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
				if (me.hp<=0 && me.phase>0)
				{
					Game.wrinklersPopped++;
					Game.recalculateGains=1;
					me.phase=0;
					me.close=0;
					me.hurt=0;
					me.hp=3;
					me.sucked*=1.1;//cookie dough does weird things inside wrinkler digestive tracts
					if (me.sucked>0.5)
					{
						Game.Popup('Exploded a wrinkler : found '+Beautify(me.sucked)+' cookies!');
						//if (Math.random()<(Game.HasAchiev('Spooky cookies')?0.2:0.05))//halloween cookie drops
						var failRate=0.95;
						if (Game.HasAchiev('Spooky cookies')) failRate=0.8;
						if (Game.Has('Santa\'s bottomless bag')) failRate*=0.9;
						if (Math.random()>failRate)//halloween cookie drops
						{
							var cookie=choose(['Skull cookies','Ghost cookies','Bat cookies','Slime cookies','Pumpkin cookies','Eyeball cookies','Spider cookies']);
							if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
							{
								Game.Unlock(cookie);
								Game.Popup('Found : '+cookie+'!');
							}
						}
					}
					Game.Earn(me.sucked);
					me.sucked=0;
					var x=me.x+(Math.sin(me.r*Math.PI/180)*100);
					var y=me.y+(Math.cos(me.r*Math.PI/180)*100);
					for (var ii=0;ii<6;ii++)
					{
						Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
					}
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
					//Game.LeftBackground.fillRect(-50,-10,100,200);
					if (Game.season=='christmas') Game.LeftBackground.drawImage(Game.Assets['winterWrinkler.png'],-50,-10);
					else Game.LeftBackground.drawImage(Game.Assets['wrinkler.png'],-50,-10);
					//Game.LeftBackground.fillText(me.id+' : '+me.sucked,0,0);
					Game.LeftBackground.restore();
					if (me.phase==2 && Math.random()<0.1 && Game.prefs.particles)
					{
						Game.particleAdd(me.x,me.y,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.2,1,2);
					}
				}
			}
		}
		
		
		/*=====================================================================================
		SPECIAL THINGS AND STUFF
		=======================================================================================*/
		
		Game.santaLevels=['Festive test tube','Festive ornament','Festive wreath','Festive tree','Festive present','Festive elf fetus','Elf toddler','Elfling','Young elf','Bulky elf','Nick','Santa Claus','Elder Santa','True Santa','Final Claus'];
		Game.santaDrops=['Increased merriness','Improved jolliness','A lump of coal','An itchy sweater','Reindeer baking grounds','Weighted sleighs','Ho ho ho-flavored frosting','Season savings','Toy workshop','Naughty list','Santa\'s bottomless bag','Santa\'s helpers','Santa\'s legacy','Santa\'s milk and cookies'];

		Game.santaTransition=0;
		Game.UpdateSanta=function()
		{
			if (Game.LeftBackground)
			{
				var x=48;
				var y=Game.LeftBackground.canvas.height-48-24;
				if (Math.abs(Game.mouseX-x)<48 && Math.abs(Game.mouseY-y)<48)
				{
					Game.mousePointer=1;
					if (Game.Click)
					{
						var moni=Math.pow(Game.santaLevel+1,Game.santaLevel+1);
						if (Game.cookies>moni && Game.santaLevel<14)
						{
							Game.Spend(moni);
							Game.santaLevel=(Game.santaLevel+1)%15;
							if (Game.santaLevel==14) {Game.Unlock('Santa\'s dominion');Game.Popup('You are granted<br>Santa\'s dominion.');}
							Game.santaTransition=1;
							var drops=[];
							for (var i in Game.santaDrops) {if (!Game.HasUnlocked(Game.santaDrops[i])) drops.push(Game.santaDrops[i]);}
							var drop=choose(drops);
							if (drop) {Game.Unlock(drop);Game.Popup('You find a present which contains...<br>'+drop+'!');}
							
							if (Game.santaLevel>=6) Game.Win('Coming to town');
							if (Game.santaLevel>=14) Game.Win('All hail Santa');
						}
					}
				}
				if (Game.santaTransition>0)
				{
					Game.santaTransition++;
					if (Game.santaTransition>=Game.fps/2) Game.santaTransition=0;
				}
			}
		}
		Game.DrawSanta=function()
		{
			Game.LeftBackground.globalAlpha=1;
			var x=48;
			var y=Game.LeftBackground.canvas.height-48-24;
			var r=Math.sin(Game.T*0.2)*Math.PI*0.02;
			var s=1;
			if (Math.abs(Game.mouseX-x)<48 && Math.abs(Game.mouseY-y)<48)
			{
				Game.LeftBackground.drawImage(Game.Assets['winterFrame.png'],x-48,y-48);
				Game.LeftBackground.textAlign='center';
				var tx=x+48+96;
				if (Game.santaLevel<14)
				{
					var str=[Game.santaLevels[Game.santaLevel],'upgrade for',Beautify(Math.pow(Game.santaLevel+1,Game.santaLevel+1))+' '+(Game.santaLevel>0?'cookies':'cookie')];
					Game.LeftBackground.fillStyle='#200e0a';
					
					Game.LeftBackground.font='16px Kavoon';
					Game.LeftBackground.fillText(str[0],tx-1,y-8+1);
					Game.LeftBackground.font='12px Arial';
					Game.LeftBackground.fillText(str[1],tx-1,y+10+1);
					Game.LeftBackground.fillText(str[2],tx-1,y+24+1);
					
					Game.LeftBackground.fillStyle='#fff';
				
					Game.LeftBackground.font='16px Kavoon';
					Game.LeftBackground.fillText(str[0],tx,y-8);
					Game.LeftBackground.font='12px Arial';
					Game.LeftBackground.fillText(str[1],tx,y+10);
					Game.LeftBackground.fillText(str[2],tx,y+24);
				}
				else
				{
					str=Game.santaLevels[Game.santaLevel];
					Game.LeftBackground.fillStyle='#200e0a';
					
					Game.LeftBackground.font='20px Kavoon';
					Game.LeftBackground.fillText(str,tx-1,y+8+1);
					
					Game.LeftBackground.fillStyle='#fff';
					
					Game.LeftBackground.font='20px Kavoon';
					Game.LeftBackground.fillText(str,tx,y+8);
				}
				s=Math.sin(Game.T*0.15)*0.05+1.05;
				/*if (Math.random()<0.5)
				{
					x+=Math.floor(Math.random()*8-4);
					y+=Math.floor(Math.random()*8-4);
					r+=Math.random()*Math.PI*0.05;
				}*/
			}
			Game.LeftBackground.save();
			Game.LeftBackground.translate(x+Math.cos(Game.T*0.2)*4,y+48);
			Game.LeftBackground.rotate(r);
			Game.LeftBackground.drawImage(Game.Assets['santa.png'],96*Game.santaLevel,0,96,96,-48*s,-96*s,96*s,96*s);
			if (Game.santaTransition>0)
			{
				Game.LeftBackground.globalAlpha=1-Game.santaTransition/(Game.fps/2);
				var s=1+(Game.santaTransition/(Game.fps/2));
				Game.LeftBackground.drawImage(Game.Assets['santa.png'],96*Math.max(0,Game.santaLevel-1),0,96,96,-48*s,-96*s,96*s,96*s);
			}
			Game.LeftBackground.restore();
			//Game.LeftBackground.drawImage(Game.Assets['santa.png'],96*(Math.floor(Game.T/Game.fps)%14),0,96,96,x-48,y-48,96,96);
			
			
		}
		
		/*=====================================================================================
		VISUAL EFFECTS
		=======================================================================================*/
		Game.mousePointer=0;//when 1, draw the mouse as a pointer on the left screen
		
		Game.cookieOriginX=0;
		Game.cookieOriginY=0;
		Game.DrawBackground=function()
		{
			//background
			if (!Game.Background)
			{
				Game.Background=l('backgroundCanvas').getContext('2d');
				Game.Background.canvas.width=Game.Background.canvas.parentNode.offsetWidth;
				Game.Background.canvas.height=Game.Background.canvas.parentNode.offsetHeight;
				Game.LeftBackground=l('backgroundLeftCanvas').getContext('2d');
				Game.LeftBackground.canvas.width=Game.LeftBackground.canvas.parentNode.offsetWidth;
				Game.LeftBackground.canvas.height=Game.LeftBackground.canvas.parentNode.offsetHeight;
				window.addEventListener('resize', function(event)
				{
					Game.Background.canvas.width=Game.Background.canvas.parentNode.offsetWidth;
					Game.Background.canvas.height=Game.Background.canvas.parentNode.offsetHeight;
					Game.LeftBackground.canvas.width=Game.LeftBackground.canvas.parentNode.offsetWidth;
					Game.LeftBackground.canvas.height=Game.LeftBackground.canvas.parentNode.offsetHeight;
				});
			}
			if (Game.drawT%15==0)
			{
				Game.defaultBg='bgBlue';
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
				var s1=512;if (Game.bg==Game.defaultBg) s1=600;
				var s2=512;if (Game.bgFade==Game.defaultBg) s2=600;
				var x=0;
				var y=0;
				Game.Background.fillPattern(Game.Assets[Game.bg+'.jpg'],x,y,Game.Background.canvas.width,Game.Background.canvas.height,s1,s1);
				if (Game.bgR>0)
				{
					Game.Background.globalAlpha=Game.bgR;
					Game.Background.fillPattern(Game.Assets[Game.bgFade+'.jpg'],x,y,Game.Background.canvas.width,Game.Background.canvas.height,s2,s2);
					Game.Background.globalAlpha=1;
				}
				Game.Background.drawImage(Game.Assets['shadedBorders.png'],0,0,Game.Background.canvas.width,Game.Background.canvas.height);
			}
			
			//clear
			Game.LeftBackground.clearRect(0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
			
			
			Game.cookieOriginX=Math.floor(Game.LeftBackground.canvas.width/2);
			Game.cookieOriginY=Math.floor(Game.LeftBackground.canvas.height*0.4);
			
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
					Game.LeftBackground.fillPattern(Game.Assets[pic],0,-512+y,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height+512,512,512);
					Game.LeftBackground.globalAlpha=1;
				}
				//snow
				if (Game.season=='christmas')
				{
					var y=(Math.floor(Game.T*2.5)%512);
					Game.LeftBackground.globalAlpha=0.75;
					Game.LeftBackground.globalCompositeOperation='lighter';
					Game.LeftBackground.fillPattern(Game.Assets['snow2.jpg'],0,-512+y,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height+512,512,512);
					Game.LeftBackground.globalCompositeOperation='source-over';
					Game.LeftBackground.globalAlpha=1;
				}
				
				Game.particlesDraw(0);
				Game.LeftBackground.globalAlpha=1;
				
				//big cookie shine
				var s=512;
				
				var x=Game.cookieOriginX;
				var y=Game.cookieOriginY;
				
				var r=Math.floor((Game.T*0.5)%360);
				Game.LeftBackground.save();
				Game.LeftBackground.translate(x,y);
				Game.LeftBackground.rotate((r/360)*Math.PI*2);
				Game.LeftBackground.globalAlpha=0.5;
				Game.LeftBackground.drawImage(Game.Assets['shine.png'],-s/2,-s/2,s,s);
				Game.LeftBackground.rotate((-r*2/360)*Math.PI*2);
				Game.LeftBackground.globalAlpha=0.25;
				Game.LeftBackground.drawImage(Game.Assets['shine.png'],-s/2,-s/2,s,s);
				Game.LeftBackground.restore();
				//big cookie
				Game.LeftBackground.globalAlpha=1;
				var s=256*Game.BigCookieSize;
				var x=Game.cookieOriginX;
				var y=Game.cookieOriginY;
				Game.LeftBackground.save();
				Game.LeftBackground.translate(x,y);
				//Game.LeftBackground.rotate(((Game.startDate%360)/360)*Math.PI*2);
				Game.LeftBackground.drawImage(Game.Assets['perfectCookie.png'],-s/2,-s/2,s,s);
				Game.LeftBackground.restore();
			}
			else
			{
				//big cookie shine
				var s=512;
				var x=Game.cookieOriginX-s/2;
				var y=Game.cookieOriginY-s/2;
				Game.LeftBackground.globalAlpha=0.5;
				Game.LeftBackground.drawImage(Game.Assets['shine.png'],x,y,s,s);
				//big cookie
				Game.LeftBackground.globalAlpha=1;
				var s=256*Game.BigCookieSize;
				var x=Game.cookieOriginX-s/2;
				var y=Game.cookieOriginY-s/2;
				Game.LeftBackground.drawImage(Game.Assets['perfectCookie.png'],x,y,s,s);
			}
			
			
			
		
			//cursors			
			if (Game.prefs.cursors)
			{
				var amount=Game.Objects['Cursor'].amount;
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
					var y=(140+n*16+w)-16;
					
					Game.LeftBackground.save();
					Game.LeftBackground.translate((Game.LeftBackground.canvas.width/2),(Game.LeftBackground.canvas.height*0.4));
					Game.LeftBackground.rotate((r/360)*Math.PI*2);
					
					Game.LeftBackground.drawImage(Game.Assets['cursor.png'],x,y);
					Game.LeftBackground.restore();
				}
			}
			
			
			//milk and milk accessories
			if (Game.prefs.milk)
			{
				var x=Math.floor((Game.T*2+Math.sin(Game.T*0.1)*2+Math.sin(Game.T*0.03)*2-(Game.milkH-Game.milkHd)*2000+480*2)%480);
				var y=(((Game.milkHd)*Game.LeftBackground.canvas.height)*(1+0.05*(Math.sin(Game.T*0.017)/2+0.5)));
				var m1o=1;
				var m2o=0;
				var m1i=0;
				var m2i=0;
				if (Game.milkProgress<1) {m1o=1;m1i=0;m2i=1;}
				else if (Game.milkProgress<2) {m1o=1-(Game.milkProgress-1);m1i=0;m2i=1;}
				else if (Game.milkProgress<3) {m1o=1-(Game.milkProgress-2);m1i=1;m2i=2;}
				else if (Game.milkProgress<4) {m1o=1-(Game.milkProgress-3);m1i=2;m2i=3;}
				else if (Game.milkProgress<5) {m1o=1-(Game.milkProgress-4);m1i=3;m2i=4;}
				else {m1o=1;m1i=2;m2i=2;}
				var pic1=Game.MilkPics[m1i];
				var pic2=Game.MilkPics[m2i];
				Game.LeftBackground.globalAlpha=m1o*0.9;
				Game.LeftBackground.fillPattern(Game.Assets[pic1+'.png'],-480+x,Game.LeftBackground.canvas.height-y,Game.LeftBackground.canvas.width+480,1,480,480);
				m2o=1-m1o;
				if (m2o>0)
				{
					Game.LeftBackground.globalAlpha=m2o*0.9;
					Game.LeftBackground.fillPattern(Game.Assets[pic2+'.png'],-480+x,Game.LeftBackground.canvas.height-y,Game.LeftBackground.canvas.width+480,1,480,480);
				}
				Game.LeftBackground.globalAlpha=0.9;
				Game.LeftBackground.fillStyle='#000';
				Game.LeftBackground.fillRect(0,Game.LeftBackground.canvas.height-y+480,Game.LeftBackground.canvas.width,Math.max(0,(y-480)));
				Game.LeftBackground.globalAlpha=1;
			}
			
			Game.DrawWrinklers();
			if (Game.Has('A festive hat')) Game.DrawSanta();
			
			Game.particlesDraw(2);
			
			//shiny border during frenzies etc
			Game.LeftBackground.globalAlpha=1;
			var borders='shadedBorders.png';
			if (Game.clickFrenzy>0 || (Game.frenzy>0 && Game.frenzyPower>=1)) borders='shadedBordersGold.png';
			else if (Game.frenzy>0) borders='shadedBordersRed.png';
			Game.LeftBackground.drawImage(Game.Assets[borders],0,0,Game.LeftBackground.canvas.width,Game.LeftBackground.canvas.height);
			
		};
		
		
		/*=====================================================================================
		DUNGEONS
		=======================================================================================*/
		
		LaunchDungeons();
		
		/*=====================================================================================
		INITIALIZATION END; GAME READY TO LAUNCH
		=======================================================================================*/
		
		if (!Game.mobile) Game.LoadSave();
		
		Game.ready=1;
		l('javascriptError').innerHTML='';
		l('javascriptError').style.display='none';
		Game.Loop();
	}
	
	/*=====================================================================================
	LOGIC
	=======================================================================================*/
	Game.Logic=function()
	{
		for (var i in Game.Objects)
		{
			if (Game.Objects[i].EachFrame) Game.Objects[i].EachFrame();
		}
		if (Game.Has('A festive hat')) Game.UpdateSanta();
		Game.UpdateGrandmapocalypse();
		
		
		//handle graphic stuff
		if (Game.BigCookieState==1) Game.BigCookieSize+=(0.98-Game.BigCookieSize)*0.5;
		else if (Game.BigCookieState==2) Game.BigCookieSize+=(1.05-Game.BigCookieSize)*0.5;
		else Game.BigCookieSize+=(1-Game.BigCookieSize)*0.5;
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
		Game.milkH=Math.min(1,Game.milkProgress)*0.35;
		Game.milkHd+=(Game.milkH-Game.milkHd)*0.02;
		
		if (Game.autoclickerDetected>0) Game.autoclickerDetected--;
		
		//handle research
		if (Game.researchT>0)
		{
			Game.researchT--;
		}
		if (Game.researchT==0 && Game.nextResearch)
		{
			Game.Unlock(Game.UpgradesById[Game.nextResearch].name);
			Game.Popup('Researched : '+Game.UpgradesById[Game.nextResearch].name);
			Game.nextResearch=0;
			Game.researchT=-1;
		}
		
		//handle cookies
		if (Game.recalculateGains) Game.CalculateGains();
		Game.Earn(Game.cookiesPs/Game.fps);//add cookies per second
		
		//wrinklers
		if (Game.cpsSucked>0)
		{
			Game.Dissolve((Game.cookiesPs/Game.fps)*Game.cpsSucked);
			Game.cookiesSucked+=((Game.cookiesPs/Game.fps)*Game.cpsSucked);
		}
		
		//var cps=Game.cookiesPs+Game.cookies*0.01;//exponential cookies
		//Game.Earn(cps/Game.fps);//add cookies per second
		
		for (var i in Game.Objects)
		{
			var me=Game.Objects[i];
			me.totalCookies+=me.storedTotalCps/Game.fps;
		}
		if (Game.cookies && Game.T%Math.ceil(Game.fps/Math.min(10,Game.cookiesPs))==0 && Game.prefs.particles) Game.particleAdd();//cookie shower
		if (Game.frenzy>0)
		{
			Game.frenzy--;
			if (Game.frenzy<1) Game.recalculateGains=1;
		}
		if (Game.clickFrenzy>0)
		{
			Game.clickFrenzy--;
			if (Game.clickFrenzy<1) Game.recalculateGains=1;
		}
		if (Game.T%(Game.fps)==0 && Math.random()<1/500000) Game.Win('Just plain lucky');//1 chance in 500,000 every second achievement
		if (Game.T%(Game.fps*5)==0 && Game.ObjectsById.length>0)//check some achievements and upgrades
		{
			//if (Game.Objects['Factory'].amount>=50 && Game.Objects['Factory'].specialUnlocked==0) {Game.Objects['Factory'].unlockSpecial();Game.Popup('You have unlocked the factory dungeons!');}
			
			if (isNaN(Game.cookies)) {Game.cookies=0;Game.cookiesEarned=0;Game.recalculateGains=1;}
			
			var timePlayed=new Date();
			timePlayed.setTime(new Date().getTime()-Game.startDate);
			
			if (Game.cookiesEarned>=1000000 && !Game.Has('Heavenly chip secret'))
			{
				if (timePlayed<=1000*60*35) Game.Win('Speed baking I');
				if (timePlayed<=1000*60*25) Game.Win('Speed baking II');
				if (timePlayed<=1000*60*15) Game.Win('Speed baking III');
			}
			
			if (Game.cookiesEarned>=9999999) Game.Unlock(['Oatmeal raisin cookies','Peanut butter cookies','Plain cookies','Sugar cookies']);
			if (Game.cookiesEarned>=99999999) Game.Unlock(['Coconut cookies','White chocolate cookies','Macadamia nut cookies']);
			if (Game.cookiesEarned>=999999999) Game.Unlock(['Double-chip cookies','White chocolate macadamia nut cookies','All-chocolate cookies']);
			if (Game.cookiesEarned>=9999999999) Game.Unlock(['Dark chocolate-coated cookies','White chocolate-coated cookies']);
			if (Game.cookiesEarned>=99999999999) Game.Unlock(['Eclipse cookies','Zebra cookies']);
			if (Game.cookiesEarned>=999999999999) Game.Unlock(['Snickerdoodles','Stroopwafels','Macaroons']);
			if (Game.cookiesEarned>=999999999999 && Game.Has('Snickerdoodles') && Game.Has('Stroopwafels') && Game.Has('Macaroons'))
			{
				Game.Unlock('Empire biscuits');
				if (Game.Has('Empire biscuits')) Game.Unlock('British tea biscuits');
				if (Game.Has('British tea biscuits')) Game.Unlock('Chocolate british tea biscuits');
				if (Game.Has('Chocolate british tea biscuits')) Game.Unlock('Round british tea biscuits');
				if (Game.Has('Round british tea biscuits')) Game.Unlock('Round chocolate british tea biscuits');
				if (Game.Has('Round chocolate british tea biscuits')) Game.Unlock('Round british tea biscuits with heart motif');
				if (Game.Has('Round british tea biscuits with heart motif')) Game.Unlock('Round chocolate british tea biscuits with heart motif');
			}
			if (Game.cookiesEarned>=9999999999999)
			{
				Game.Unlock(['Madeleines','Palmiers','Palets','Sabl&eacute;s']);
				
				if (Game.prestige['Heavenly chips']>=1) Game.Unlock('Caramoas');
				if (Game.prestige['Heavenly chips']>=2) Game.Unlock('Sagalongs');
				if (Game.prestige['Heavenly chips']>=3) Game.Unlock('Shortfoils');
				if (Game.prestige['Heavenly chips']>=4) Game.Unlock('Win mints');
				
				if (Game.prestige['Heavenly chips']>=10) Game.Unlock('Fig gluttons');
				if (Game.prestige['Heavenly chips']>=100) Game.Unlock('Loreols');
				if (Game.prestige['Heavenly chips']>=500) Game.Unlock('Jaffa cakes');
				if (Game.prestige['Heavenly chips']>=2000) Game.Unlock('Grease\'s cups');
			}
			if (Game.cookiesEarned>=99999999999999)
			{
				Game.Unlock(['Gingerbread men','Gingerbread trees']);
			}
			
			
			
			if (Game.prestige['Heavenly chips']>0)
			{
				Game.Unlock('Heavenly chip secret');
				if (Game.Has('Heavenly chip secret')) Game.Unlock('Heavenly cookie stand');
				if (Game.Has('Heavenly cookie stand')) Game.Unlock('Heavenly bakery');
				if (Game.Has('Heavenly bakery')) Game.Unlock('Heavenly confectionery');
				if (Game.Has('Heavenly confectionery')) Game.Unlock('Heavenly key');
				
				if (Game.Has('Heavenly key')) Game.Win('Wholesome');
			}
		
			for (var i=0;i<Game.moneyAchievs.length/2;i++)
			{
				if (Game.cookiesEarned>=Game.moneyAchievs[i*2+1]) Game.Win(Game.moneyAchievs[i*2]);
			}
			var buildingsOwned=0;
			var oneOfEach=1;
			var mathematician=1;
			var base10=1;
			var centennial=1;
			for (var i in Game.Objects)
			{
				buildingsOwned+=Game.Objects[i].amount;
				if (!Game.HasAchiev('One with everything')) {if (Game.Objects[i].amount==0) oneOfEach=0;}
				if (!Game.HasAchiev('Mathematician')) {if (Game.Objects[i].amount<Math.min(128,Math.pow(2,(Game.ObjectsById.length-Game.Objects[i].id)-1))) mathematician=0;}
				if (!Game.HasAchiev('Base 10')) {if (Game.Objects[i].amount<(Game.ObjectsById.length-Game.Objects[i].id)*10) base10=0;}
				if (!Game.HasAchiev('Centennial')) {if (Game.Objects[i].amount<100) centennial=0;}
			}
			if (oneOfEach==1) Game.Win('One with everything');
			if (mathematician==1) Game.Win('Mathematician');
			if (base10==1) Game.Win('Base 10');
			if (centennial==1) Game.Win('Centennial');
			if (Game.cookiesEarned>=1000000 && Game.cookieClicks<=15) Game.Win('Neverclick');
			if (Game.cookiesEarned>=1000000 && Game.cookieClicks<=0) Game.Win('True Neverclick');
			if (Game.handmadeCookies>=1000) {Game.Win('Clicktastic');Game.Unlock('Plastic mouse');}
			if (Game.handmadeCookies>=100000) {Game.Win('Clickathlon');Game.Unlock('Iron mouse');}
			if (Game.handmadeCookies>=10000000) {Game.Win('Clickolympics');Game.Unlock('Titanium mouse');}
			if (Game.handmadeCookies>=1000000000) {Game.Win('Clickorama');Game.Unlock('Adamantium mouse');}
			if (Game.handmadeCookies>=100000000000) {Game.Win('Clickasmic');Game.Unlock('Unobtainium mouse');}
			if (Game.cookiesEarned<Game.cookies) Game.Win('Cheated cookies taste awful');
			
			if (Game.Has('Skull cookies') && Game.Has('Ghost cookies') && Game.Has('Bat cookies') && Game.Has('Slime cookies') && Game.Has('Pumpkin cookies') && Game.Has('Eyeball cookies') && Game.Has('Spider cookies')) Game.Win('Spooky cookies');
			if (Game.wrinklersPopped>=1) Game.Win('Itchscratcher');
			if (Game.wrinklersPopped>=50) Game.Win('Wrinklesquisher');
			if (Game.wrinklersPopped>=200) Game.Win('Moistburster');
			
			if (Game.cookiesEarned>=25) Game.Unlock('A festive hat');
			if (Game.Has('Christmas tree biscuits') && Game.Has('Snowflake biscuits') && Game.Has('Snowman biscuits') && Game.Has('Mistletoe biscuits') && Game.Has('Candy cane biscuits') && Game.Has('Bell biscuits') && Game.Has('Present biscuits')) Game.Win('Let it snow');
			
			if (Game.reindeerClicked>=1) Game.Win('Oh deer');
			if (Game.reindeerClicked>=50) Game.Win('Sleigh of hand');
			if (Game.reindeerClicked>=200) Game.Win('Reindeer sleigher');
			
			if (buildingsOwned>=100) Game.Win('Builder');
			if (buildingsOwned>=400) Game.Win('Architect');
			if (buildingsOwned>=800) Game.Win('Engineer');
			if (Game.UpgradesOwned>=20) Game.Win('Enhancer');
			if (Game.UpgradesOwned>=50) Game.Win('Augmenter');
			if (Game.UpgradesOwned>=100) Game.Win('Upgrader');
			
			if (Game.UpgradesOwned==0 && Game.cookiesEarned>=1000000000) Game.Win('Hardcore');
			
			if (Game.prestige['Heavenly chips']>=1 && Game.Has('Bingo center/Research facility')) Game.Unlock('Persistent memory');
			
			var grandmas=0;
			if (Game.Has('Farmer grandmas')) grandmas++;
			if (Game.Has('Worker grandmas')) grandmas++;
			if (Game.Has('Miner grandmas')) grandmas++;
			if (Game.Has('Cosmic grandmas')) grandmas++;
			if (Game.Has('Transmuted grandmas')) grandmas++;
			if (Game.Has('Altered grandmas')) grandmas++;
			if (Game.Has('Grandmas\' grandmas')) grandmas++;
			if (Game.Has('Antigrandmas')) grandmas++;
			if (!Game.HasAchiev('Elder') && grandmas>=7) Game.Win('Elder');
			if (Game.Objects['Grandma'].amount>=6 && !Game.Has('Bingo center/Research facility') && Game.HasAchiev('Elder')) Game.Unlock('Bingo center/Research facility');
			if (Game.pledges>0) Game.Win('Elder nap');
			if (Game.pledges>=5) Game.Win('Elder slumber');
			if (Game.pledges>=10) Game.Unlock('Sacrificial rolling pins');
			
			if (!Game.HasAchiev('Cookie-dunker') && Game.LeftBackground && Game.milkProgress>0.1 && (Game.LeftBackground.canvas.height*0.4+256/2-16)>((1-Game.milkHd)*Game.LeftBackground.canvas.height)) Game.Win('Cookie-dunker');
			//&& l('bigCookie').getBoundingClientRect().bottom>l('milk').getBoundingClientRect().top+16 && Game.milkProgress>0.1) Game.Win('Cookie-dunker');
		}
		
		Game.cookiesd+=(Game.cookies-Game.cookiesd)*0.3;
		
		if (Game.storeToRebuild) Game.RebuildStore();
		if (Game.upgradesToRebuild) Game.RebuildUpgrades();
		
		if (Game.T%(Game.fps*2)==0) document.title=Beautify(Game.cookies)+' '+(Game.cookies==1?'cookie':'cookies')+' - Cookie Clicker';
		
		Game.TickerAge--;
		if (Game.TickerAge<=0 || Game.Ticker=='') Game.getNewTicker();
		
		var veilLimit=0;//10;
		if (Game.veil==1 && Game.cookiesEarned>=veilLimit) Game.veilOff();
		else if (Game.veil==0 && Game.cookiesEarned<veilLimit) Game.veilOn();
		
		Game.goldenCookie.update();
		Game.seasonPopup.update();
		
		Game.Click=0;
		
		if (Game.T%(Game.fps*60)==0 && Game.T>Game.fps*10 && Game.prefs.autosave) Game.WriteSave();
		if (Game.T%(Game.fps*60*30)==0 && Game.T>Game.fps*10 && Game.prefs.autoupdate) Game.CheckUpdates();
		
		Game.T++;
	}
	
	/*=====================================================================================
	DRAW
	=======================================================================================*/
	
	Game.MilkPics={0:'milkWave',1:'chocolateMilkWave',2:'raspberryWave',3:'orangeWave',4:'caramelWave'};
	
	Game.Draw=function()
	{
		Game.DrawBackground();
		
		
		
		var unit=(Math.round(Game.cookiesd)==1?' cookie':' cookies');
		if (Math.round(Game.cookiesd).toString().length>11 && !Game.mobile) unit='<br>cookies';
		var str=Beautify(Math.round(Game.cookiesd))+unit+'<div style="font-size:50%;"'+(Game.cpsSucked>0?' class="warning"':'')+'>per second : '+Beautify(Game.cookiesPs*(1-Game.cpsSucked),1)+'</div>';//display cookie amount
		l('cookies').innerHTML=str;
		l('compactCookies').innerHTML=str;
		
		
		Game.TickerDraw();
		Game.tooltip.update();
		
		for (var i in Game.Objects)
		{
			var me=Game.Objects[i];
			
			//make products full-opacity if we can buy them
			if (Game.cookies>=me.getPrice()) l('product'+me.id).className='product enabled'; else l('product'+me.id).className='product disabled';
			
			//update object info
			if (l('rowInfo'+me.id) && Game.T%5==0) l('rowInfoContent'+me.id).innerHTML='&bull; '+me.amount+' '+(me.amount==1?me.single:me.plural)+'<br>&bull; producing '+Beautify(me.storedTotalCps,1)+' '+(me.storedTotalCps==1?'cookie':'cookies')+' per second<br>&bull; total : '+Beautify(me.totalCookies)+' '+(Math.floor(me.totalCookies)==1?'cookie':'cookies')+' '+me.actionName;
		}
		
		//make upgrades full-opacity if we can buy them
		for (var i in Game.UpgradesInStore)
		{
			var me=Game.UpgradesInStore[i];
			if (Game.cookies>=me.getPrice()) l('upgrade'+i).className='crate upgrade enabled'; else l('upgrade'+i).className='crate upgrade disabled';
		}
		if (Game.drawT%30==0)
		{
			var grandmaIcons=['grandmaIcon','grandmaIconB','grandmaIconC','grandmaIconD'];
			l('productIcon'+Game.Objects['Grandma'].id).style.backgroundImage='url(img/'+grandmaIcons[Game.elderWrath]+'.png)';//oh god fix this (should change when the store tabs are updated and when the grandmapocalypse level changes)
		}
		
		if (Math.floor(Game.T%Game.fps)==0) Game.UpdateMenu();
		
		Game.textParticlesUpdate();
		
		Game.drawT++;
	}
	
	/*=====================================================================================
	MAIN LOOP
	=======================================================================================*/
	Game.Loop=function()
	{
		//update game logic !
		Game.catchupLogic=0;
		Game.Logic();
		Game.catchupLogic=1;
		
		//latency compensator
		Game.accumulatedDelay+=((new Date().getTime()-Game.time)-1000/Game.fps);
		Game.accumulatedDelay=Math.min(Game.accumulatedDelay,1000*5);//don't compensate over 5 seconds; if you do, something's probably very wrong
		Game.time=new Date().getTime();
		while (Game.accumulatedDelay>0)
		{
			Game.Logic();
			Game.accumulatedDelay-=1000/Game.fps;//as long as we're detecting latency (slower than target fps), execute logic (this makes drawing slower but makes the logic behave closer to correct target fps)
		}
		Game.catchupLogic=0;
		
		Game.Draw();
		
		setTimeout(Game.Loop,1000/Game.fps);
	}
}


/*=====================================================================================
LAUNCH THIS THING
=======================================================================================*/
Game.Launch();

window.onload=function()
{
	if (!Game.ready) Game.Load();
};
