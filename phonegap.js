<head><title>Aw noes ! 404 !
</title>
<script type="text/javascript">
//<![CDATA[
try{if (!window.CloudFlare) {var CloudFlare=[{verbose:0,p:0,byc:0,owlid:"cf",bag2:1,mirage2:0,oracle:0,paths:{cloudflare:"/cdn-cgi/nexp/dok7v=02fcfa4f56/"},atok:"ec5a7430fd37e315c91cf9f91346d5f7",petok:"4de9598806cc2932a84c02da74f6b481b6e4d759-1392325356-1800",zone:"dashnet.org",rocket:"0",apps:{"ga_key":{"ua":"UA-29324474-2","ga_bs":"2"},"abetterbrowser":{"ie":"8"}}}];var a=document.createElement("script"),b=document.getElementsByTagName("script")[0];a.async=!0;a.src="//ajax.cloudflare.com/cdn-cgi/nexp/dok7v=221574e73d/cloudflare.min.js";b.parentNode.insertBefore(a,b);}}catch(e){};
//]]>
</script>
<link rel="stylesheet" type="text/css" href="/style.css" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<script type="text/javascript">
/* <![CDATA[ */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-29324474-2']);
_gaq.push(['_trackPageview']);

(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

(function(b){(function(a){"__CF"in b&&"DJS"in b.__CF?b.__CF.DJS.push(a):"addEventListener"in b?b.addEventListener("load",a,!1):b.attachEvent("onload",a)})(function(){"FB"in b&&"Event"in FB&&"subscribe"in FB.Event&&(FB.Event.subscribe("edge.create",function(a){_gaq.push(["_trackSocial","facebook","like",a])}),FB.Event.subscribe("edge.remove",function(a){_gaq.push(["_trackSocial","facebook","unlike",a])}),FB.Event.subscribe("message.send",function(a){_gaq.push(["_trackSocial","facebook","send",a])}));"twttr"in b&&"events"in twttr&&"bind"in twttr.events&&twttr.events.bind("tweet",function(a){if(a){var b;if(a.target&&a.target.nodeName=="IFRAME")a:{if(a=a.target.src){a=a.split("#")[0].match(/[^?=&]+=([^&]*)?/g);b=0;for(var c;c=a[b];++b)if(c.indexOf("url")===0){b=unescape(c.split("=")[1]);break a}}b=void 0}_gaq.push(["_trackSocial","twitter","tweet",b])}})})})(window);
/* ]]> */
</script>
</head>
<body>

<script>

var History=new Array();
var Back=false;

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

function GoBack()
{
Back=true;
if (History.length>1) Show(History[History.length-2]);
}

var Nodes=new Array();

function Node(name,text,links,background)
{
this.name=name;
this.text=text;
this.links=links.split("|");
this.background=background ? background : "";

for (var i in this.links)
{
this.links[i]=this.links[i].split("/");
}

Nodes[this.name]=this;
}

Node.prototype.show=function()
{
var txt="";
if (this.background!="") document.getElementById('bg').style.backgroundImage="url("+this.background+")";
else document.getElementById('bg').style.backgroundImage="none";

if (Back==false) History.push(this.name); else History.pop();
Back=false;
txt+=this.text;
txt+='<div class="choices">';
for (var i in this.links)
{
if (this.links[i][2]=='web') txt+='<a class="choice" href="'+this.links[i][1]+'">'+this.links[i][0]+'</a>';
else if (Nodes[this.links[i][1]]) txt+='<a class="choice" href="javascript:Show(\''+this.links[i][1]+'\')">'+this.links[i][0]+'</a>';
else txt+='<a class="choice" style="opacity:0.5;" href="javascript:Show(\''+this.links[i][1]+'\')">'+this.links[i][0]+'</a>';
}
if (History.length>1) txt+='<br><br><a class="back" href="javascript:GoBack();">< back</a>';
txt+='</div>';

document.getElementById("text").innerHTML=txt;
//document.getElementById("currentNode").innerHTML=this.name;
}

function Show(what)
{
Nodes[what].show();
}


new Node(
"main",
"<span style='font-size:200%;'>404</span><br>aw noes :(<br>you have broken our interwebs !<br>it's okay though, you can still go",
"there/index.php/web|or there/story.php/web"
);


function Input(what)
{
if (Nodes[what]) Nodes[what].show();
}

var Links=new Array();
var NodesN=0;
for (var i in Nodes)
{
for (var i2 in Nodes[i].links)
{Links.push(Nodes[i].links[i2][1]);}
NodesN++;
}

var txt="";
for (var i in Links)
{
if (!Nodes[Links[i]]) txt+=Links[i]+' / ';
}


//document.write('<div style="font-size:8pt;opacity:0.5;">'+(NodesN)+' nodes. Missing : '+txt+'</div>');

</script>

<table class="main"><tr><td id="bg">
<table class="main"><tr><td style="background-color:rgba(0,0,0,0.5);vertical-align:middle;text-align:center;">
<div class="bordercolor" id="bordercolor">
<div id="text" class="text">
</div>
</div>
<div style="position:absolute;bottom:0px;left:0px;opacity:0.5;padding:4px;font-size:8pt;text-align:left;">(c) Orteil 2011<br>proudly hosted by <a href="http://dashnet.org">dashnet.org</a></div>
</td></tr></table>
</td></tr></table>

<script>
Nodes["main"].show();

function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}


var t=0;
function Rainbow()
{
var Col=hsvToRgb((t%100)/100,1,1);
document.getElementById("bordercolor").style.backgroundColor="rgb("+Math.floor(Col[0])+","+Math.floor(Col[1])+","+Math.floor(Col[2])+")";
//document.getElementById("text").innerHTML="rgb("+Math.floor(Col[0])+","+Math.floor(Col[1])+","+Math.floor(Col[2])+")";
t++;
setTimeout("Rainbow();",1000/10);
}

Rainbow();

</script>

</body>