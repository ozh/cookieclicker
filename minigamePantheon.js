var M={};
M.parent=Game.Objects['Temple'];
M.parent.minigame=M;
M.launch=function()
{
	var M=this;
	M.name=M.parent.minigameName;
	M.init=function(div)
	{
		//populate div with html and initialize values
		
		M.gods={
			'asceticism':{
				name:'Holobore, Spirit of Asceticism',
				icon:[21,18],
				desc1:'<span class="green">'+loc("+%1% base CpS.",15)+'</span>',
				desc2:'<span class="green">'+loc("+%1% base CpS.",10)+'</span>',
				desc3:'<span class="green">'+loc("+%1% base CpS.",5)+'</span>',
				descAfter:'<span class="red">'+loc("If a golden cookie is clicked, this spirit is unslotted and all worship swaps will be used up.")+'</span>',
				quote:'An immortal life spent focusing on the inner self, away from the distractions of material wealth.',
			},
			'decadence':{
				name:'Vomitrax, Spirit of Decadence',
				icon:[22,18],
				desc1:'<span class="green">'+loc("Golden and wrath cookie effect duration +%1%.",7)+'</span> <span class="red">'+loc("Buildings grant -%1% CpS.",7)+'</span>',
				desc2:'<span class="green">'+loc("Golden and wrath cookie effect duration +%1%.",5)+'</span> <span class="red">'+loc("Buildings grant -%1% CpS.",5)+'</span>',
				desc3:'<span class="green">'+loc("Golden and wrath cookie effect duration +%1%.",2)+'</span> <span class="red">'+loc("Buildings grant -%1% CpS.",2)+'</span>',
				quote:'This sleazy spirit revels in the lust for quick easy gain and contempt for the value of steady work.',
			},
			'ruin':{
				name:'Godzamok, Spirit of Ruin',
				icon:[23,18],
				descBefore:'<span class="green">'+loc("Selling buildings triggers a buff boosted by how many buildings were sold.")+'</span>',
				desc1:'<span class="green">'+loc("Buff boosts clicks by +%1% for every building sold for %2 seconds.",[1,10])+'</span>',
				desc2:'<span class="green">'+loc("Buff boosts clicks by +%1% for every building sold for %2 seconds.",[0.5,10])+'</span>',
				desc3:'<span class="green">'+loc("Buff boosts clicks by +%1% for every building sold for %2 seconds.",[0.25,10])+'</span>',
				quote:'The embodiment of natural disasters. An impenetrable motive drives the devastation caused by this spirit.',
			},
			'ages':{
				name:'Cyclius, Spirit of Ages',
				icon:[24,18],
				activeDescFunc:function()
				{
					var godLvl=Game.hasGod('ages');
					var mult=1;
					if (godLvl==1) mult*=0.15*Math.sin((Date.now()/1000/(60*60*3))*Math.PI*2);
					else if (godLvl==2) mult*=0.15*Math.sin((Date.now()/1000/(60*60*12))*Math.PI*2);
					else if (godLvl==3) mult*=0.15*Math.sin((Date.now()/1000/(60*60*24))*Math.PI*2);
					return loc("Current bonus:")+' '+(mult<0?'-':'+')+Beautify(Math.abs(mult)*100,2)+'%';
				},
				descBefore:loc("CpS bonus fluctuating between %1 and %2 over time.",['<span class="green">+15%</span>','<span class="red">-15%</span>']),
				desc1:loc("Effect cycles over %1 hours.",3),
				desc2:loc("Effect cycles over %1 hours.",12),
				desc3:loc("Effect cycles over %1 hours.",24),
				quote:'This spirit knows about everything you\'ll ever do, and enjoys dispensing a harsh judgment.',
			},
			'seasons':{
				name:'Selebrak, Spirit of Festivities',
				icon:[25,18],
				descBefore:'<span class="green">'+loc("Some seasonal effects are boosted.")+'</span>',
				desc1:'<span class="green">'+loc("Large boost.")+'</span> <span class="red">'+loc("Switching seasons is %1% pricier.",100)+'</span>',
				desc2:'<span class="green">'+loc("Medium boost.")+'</span> <span class="red">'+loc("Switching seasons is %1% pricier.",50)+'</span>',
				desc3:'<span class="green">'+loc("Small boost.")+'</span> <span class="red">'+loc("Switching seasons is %1% pricier.",25)+'</span>',
				quote:'This is the spirit of merry getaways and regretful Monday mornings.',
			},
			'creation':{
				name:'Dotjeiess, Spirit of Creation',
				icon:[26,18],
				desc1:'<span class="green">'+loc("All buildings are <b>%1% cheaper</b>.",7)+'</span> <span class="red">'+loc("Heavenly chips have %1% less effect.",30)+'</span>',
				desc2:'<span class="green">'+loc("All buildings are <b>%1% cheaper</b>.",5)+'</span> <span class="red">'+loc("Heavenly chips have %1% less effect.",20)+'</span>',
				desc3:'<span class="green">'+loc("All buildings are <b>%1% cheaper</b>.",2)+'</span> <span class="red">'+loc("Heavenly chips have %1% less effect.",10)+'</span>',
				quote:'All things that be and ever will be were scripted long ago by this spirit\'s inscrutable tendrils.',
			},
			'labor':{
				name:'Muridal, Spirit of Labor',
				icon:[27,18],
				desc1:'<span class="green">'+loc("Clicking is <b>%1%</b> more powerful.",15)+'</span> <span class="red">'+loc("Buildings produce %1% less.",3)+'</span>',
				desc2:'<span class="green">'+loc("Clicking is <b>%1%</b> more powerful.",10)+'</span> <span class="red">'+loc("Buildings produce %1% less.",2)+'</span>',
				desc3:'<span class="green">'+loc("Clicking is <b>%1%</b> more powerful.",5)+'</span> <span class="red">'+loc("Buildings produce %1% less.",1)+'</span>',
				quote:'This spirit enjoys a good cheese after a day of hard work.',
			},
			'industry':{
				name:'Jeremy, Spirit of Industry',
				icon:[28,18],
				desc1:'<span class="green">'+loc("Buildings produce %1% more.",10)+'</span> <span class="red">'+loc("Golden and wrath cookies appear %1% less.",10)+'</span>',
				desc2:'<span class="green">'+loc("Buildings produce %1% more.",6)+'</span> <span class="red">'+loc("Golden and wrath cookies appear %1% less.",6)+'</span>',
				desc3:'<span class="green">'+loc("Buildings produce %1% more.",3)+'</span> <span class="red">'+loc("Golden and wrath cookies appear %1% less.",3)+'</span>',
				quote:'While this spirit has many regrets, helping you rule the world through constant industrialization is not one of them.',
			},
			'mother':{
				name:'Mokalsium, Mother Spirit',
				icon:[29,18],
				desc1:'<span class="green">'+loc("Milk is <b>%1% more powerful</b>.",10)+'</span> <span class="red">'+loc("Golden and wrath cookies appear %1% less.",15)+'</span>',
				desc2:'<span class="green">'+loc("Milk is <b>%1% more powerful</b>.",5)+'</span> <span class="red">'+loc("Golden and wrath cookies appear %1% less.",10)+'</span>',
				desc3:'<span class="green">'+loc("Milk is <b>%1% more powerful</b>.",3)+'</span> <span class="red">'+loc("Golden and wrath cookies appear %1% less.",5)+'</span>',
				quote:'A caring spirit said to contain itself, inwards infinitely.',
			},
			'scorn':{
				name:'Skruuia, Spirit of Scorn',
				icon:[21,19],
				descBefore:'<span class="red">'+loc("All golden cookies are wrath cookies with a greater chance of a negative effect.")+'</span>',
				desc1:'<span class="green">'+loc("Wrinklers appear %1% faster and digest %2% more cookies.",[150,15])+'</span>',
				desc2:'<span class="green">'+loc("Wrinklers appear %1% faster and digest %2% more cookies.",[100,10])+'</span>',
				desc3:'<span class="green">'+loc("Wrinklers appear %1% faster and digest %2% more cookies.",[50,5])+'</span>',
				quote:'This spirit enjoys poking foul beasts and watching them squirm, but has no love for its own family.',
			},
			'order':{
				name:'Rigidel, Spirit of Order',
				icon:[22,19],
				activeDescFunc:function()
				{
					if (Game.BuildingsOwned%10==0) return loc("Buildings owned:")+' '+Beautify(Game.BuildingsOwned)+'<br>'+loc("Effect is active.");
					else return loc("Buildings owned:")+' '+Beautify(Game.BuildingsOwned)+'<br>'+loc("Effect is inactive.");
				},
				desc1:'<span class="green">'+loc("Sugar lumps ripen <b>%1</b> sooner.",Game.sayTime(60*60*Game.fps))+'</span>',
				desc2:'<span class="green">'+loc("Sugar lumps ripen <b>%1</b> sooner.",Game.sayTime(60*40*Game.fps))+'</span>',
				desc3:'<span class="green">'+loc("Sugar lumps ripen <b>%1</b> sooner.",Game.sayTime(60*20*Game.fps))+'</span>',
				descAfter:'<span class="red">'+loc("Effect is only active when your total amount of buildings ends with 0.")+'</span>',
				quote:'You will find that life gets just a little bit sweeter if you can motivate this spirit with tidy numbers and properly-filled tax returns.',
			},
		};
		M.godsById=[];var n=0;
		for (var i in M.gods){var it=M.gods[i];it.id=n;it.name=loc(FindLocStringByPart('GOD '+(it.id+1)+' NAME'));it.quote=loc(FindLocStringByPart('GOD '+(it.id+1)+' QUOTE'));it.slot=-1;M.godsById[n]=it;n++;}
		
		
		M.slot=[];
		M.slot[0]=-1;//diamond socket
		M.slot[1]=-1;//ruby socket
		M.slot[2]=-1;//jade socket
		
		M.slotNames=[
			'Diamond','Ruby','Jade'
		];
		
		M.swaps=3;//swaps left
		M.swapT=Date.now();//the last time we swapped
		
		M.lastSwapT=0;//frames since last swap
		
		M.godTooltip=function(id)
		{
			return function(){
				var me=M.godsById[id];
				me.icon=me.icon||[0,0];
				var str='<div style="padding:8px 4px;min-width:350px;" id="tooltipGod">'+
				'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>'+
				'<div class="name">'+me.name+'</div>'+
				'<div class="line"></div><div class="description"><div style="margin:6px 0px;font-weight:bold;">'+loc("Effects:")+'</div>'+
					(me.descBefore?('<div class="templeEffect">'+me.descBefore+'</div>'):'')+
					(me.desc1?('<div class="templeEffect templeEffect1"><div class="usesIcon shadowFilter templeGem templeGem1"></div>'+me.desc1+'</div>'):'')+
					(me.desc2?('<div class="templeEffect templeEffect2"><div class="usesIcon shadowFilter templeGem templeGem2"></div>'+me.desc2+'</div>'):'')+
					(me.desc3?('<div class="templeEffect templeEffect3"><div class="usesIcon shadowFilter templeGem templeGem3"></div>'+me.desc3+'</div>'):'')+
					(me.descAfter?('<div class="templeEffect">'+me.descAfter+'</div>'):'')+
					(me.quote?('<q>'+me.quote+'</q>'):'')+
				'</div></div>';
				return str;
			};
		}
		
		M.slotTooltip=function(id)
		{
			return function(){
				if (M.slot[id]!=-1)
				{
					var me=M.godsById[M.slot[id]];
					var slot=me.slot;
					if (Game.hasAura('Supreme Intellect')) slot=Math.max(0,slot-1);
					me.icon=me.icon||[0,0];
				}
				var str='<div style="padding:8px 4px;min-width:350px;" id="tooltipPantheonSlot">'+
				(M.slot[id]!=-1?(
					'<div class="name templeEffect" style="margin-bottom:12px;"><div class="usesIcon shadowFilter templeGem templeGem'+(parseInt(id)+1)+'"></div>'+loc(M.slotNames[id]+" slot")+'</div>'+
					'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>'+
					'<div class="name">'+me.name+'</div>'+
					'<div class="line"></div><div class="description"><div style="margin:6px 0px;font-weight:bold;">'+loc("Effects:")+'</div>'+
						(me.activeDescFunc?('<div class="templeEffect templeEffectOn" style="padding:8px 4px;text-align:center;">'+me.activeDescFunc()+'</div>'):'')+
						(me.descBefore?('<div class="templeEffect">'+me.descBefore+'</div>'):'')+
						(me.desc1?('<div class="templeEffect templeEffect1'+(slot==0?' templeEffectOn':'')+'"><div class="usesIcon shadowFilter templeGem templeGem1"></div>'+me.desc1+'</div>'):'')+
						(me.desc2?('<div class="templeEffect templeEffect2'+(slot==1?' templeEffectOn':'')+'"><div class="usesIcon shadowFilter templeGem templeGem2"></div>'+me.desc2+'</div>'):'')+
						(me.desc3?('<div class="templeEffect templeEffect3'+(slot==2?' templeEffectOn':'')+'"><div class="usesIcon shadowFilter templeGem templeGem3"></div>'+me.desc3+'</div>'):'')+
						(me.descAfter?('<div class="templeEffect">'+me.descAfter+'</div>'):'')+
						(me.quote?('<q>'+me.quote+'</q>'):'')+
					'</div>'
				):
				('<div class="name templeEffect"><div class="usesIcon shadowFilter templeGem templeGem'+(parseInt(id)+1)+'"></div>'+loc(M.slotNames[id]+" slot")+' ('+loc("empty")+')</div><div class="line"></div><div class="description">'+
				((M.slotHovered==id && M.dragging)?loc("Release to assign %1 to this slot.",'<b>'+M.dragging.name+'</b>'):loc("Drag a spirit onto this slot to assign it."))+
				'</div>')
				)+
				'</div>';
				return str;
			};
		}
		
		M.useSwap=function(n)
		{
			M.swapT=Date.now();
			M.swaps-=n;
			if (M.swaps<0) M.swaps=0;
		}
		
		M.slotGod=function(god,slot)
		{
			if (slot==god.slot) return false;
			if (slot!=-1 && M.slot[slot]!=-1)
			{
				M.godsById[M.slot[slot]].slot=god.slot;//swap
				M.slot[god.slot]=M.slot[slot];
			}
			else if (god.slot!=-1) M.slot[god.slot]=-1;
			if (slot!=-1) M.slot[slot]=god.id;
			god.slot=slot;
			Game.recalculateGains=true;
		}
		
		M.dragging=false;
		M.dragGod=function(what)
		{
			M.dragging=what;
			var div=l('templeGod'+what.id);
			var box=div.getBounds();
			var box2=l('templeDrag').getBounds();
			div.className='ready templeGod titleFont templeDragged';
			l('templeDrag').appendChild(div);
			var x=box.left-box2.left;
			var y=box.top-box2.top;
			div.style.transform='translate('+(x)+'px,'+(y)+'px)';
			l('templeGodPlaceholder'+M.dragging.id).style.display='inline-block';
			PlaySound('snd/tick.mp3');
		}
		M.dropGod=function()
		{
			if (!M.dragging) return;
			var div=l('templeGod'+M.dragging.id);
			div.className='ready templeGod titleFont';
			div.style.transform='none';
			if (M.slotHovered!=-1 && (M.swaps==0 || M.dragging.slot==M.slotHovered))//dropping on a slot but no swaps left, or slot is the same as the original
			{
				if (M.dragging.slot!=-1) l('templeSlot'+M.dragging.slot).appendChild(div);
				else l('templeGodPlaceholder'+(M.dragging.id)).parentNode.insertBefore(div,l('templeGodPlaceholder'+(M.dragging.id)));
				PlaySound('snd/sell1.mp3',0.75);
			}
			else if (M.slotHovered!=-1)//dropping on a slot
			{
				M.useSwap(1);
				M.lastSwapT=0;
				
				var prev=M.slot[M.slotHovered];//id of the god already in the slot
				if (prev!=-1)
				{
					prev=M.godsById[prev];
					var prevDiv=l('templeGod'+prev.id);
					if (M.dragging.slot!=-1)//swap with god's previous slot
					{
						l('templeSlot'+M.dragging.slot).appendChild(prevDiv);
					}
					else//swap back to roster
					{
						var other=l('templeGodPlaceholder'+(prev.id));
						other.parentNode.insertBefore(prevDiv,other);
					}
				}
				l('templeSlot'+M.slotHovered).appendChild(div);
				M.slotGod(M.dragging,M.slotHovered);
				
				PlaySound('snd/tick.mp3');
				PlaySound('snd/spirit.mp3',0.5);
				
				var rect=div.getBounds();
				Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2-24+32-TopBarOffset);
			}
			else//dropping back to roster
			{
				var other=l('templeGodPlaceholder'+(M.dragging.id));
				other.parentNode.insertBefore(div,other);
				other.style.display='none';
				M.slotGod(M.dragging,-1);
				PlaySound('snd/sell1.mp3',0.75);
			}
			M.dragging=false;
		}
		
		M.slotHovered=-1;
		M.hoverSlot=function(what)
		{
			M.slotHovered=what;
			if (M.dragging)
			{
				if (M.slotHovered==-1) l('templeGodPlaceholder'+M.dragging.id).style.display='inline-block';
				else l('templeGodPlaceholder'+M.dragging.id).style.display='none';
				PlaySound('snd/clickb'+Math.floor(Math.random()*7+1)+'.mp3',0.75);
			}
		}
		
		//external
		Game.hasGod=function(what)
		{
			var god=M.gods[what];
			for (var i=0;i<3;i++)
			{
				if (M.slot[i]==god.id)
				{
					if (Game.hasAura('Supreme Intellect')) return Math.max(1,i);
					else return (i+1);
				}
			}
			return false;
		}
		Game.forceUnslotGod=function(god)
		{
			var god=M.gods[god];
			if (god.slot==-1) return false;
			var div=l('templeGod'+god.id);
			var other=l('templeGodPlaceholder'+(god.id));
			other.parentNode.insertBefore(div,other);
			other.style.display='none';
			M.slotGod(god,-1);
			return true;
		}
		Game.useSwap=M.useSwap;
		
		M.dragonBoostTooltip=function()
		{
			return '<div style="width:280px;padding:8px;text-align:center;" id="tooltipDragonBoost"><b>'+loc("Supreme Intellect")+'</b><div class="line"></div>'+loc("The jade slot behaves as a ruby slot and the ruby slot behaves as a diamond slot.")+'</div>';
		}
		
		var str='';
		str+='<style>'+
		'#templeBG{background:url('+Game.resPath+'img/shadedBorders.png),url('+Game.resPath+'img/BGpantheon.jpg);background-size:100% 100%,auto;position:absolute;left:0px;right:0px;top:0px;bottom:16px;}'+
		'#templeContent{position:relative;box-sizing:border-box;padding:4px 24px;text-align:center;}'+
		'#templeGods{text-align:center;width:100%;padding:8px;box-sizing:border-box;}'+
		'.templeIcon{pointer-events:none;margin:12px 6px 0px 6px;width:48px;height:48px;opacity:0.8;position:relative;}'+
		'.templeSlot .templeIcon{margin:2px 6px 0px 6px;}'+
		'.templeGod{box-shadow:4px 4px 4px #000;cursor:pointer;position:relative;color:#f33;opacity:0.8;text-shadow:0px 0px 4px #000,0px 0px 6px #000;font-weight:bold;font-size:12px;display:inline-block;width:60px;height:74px;background:url('+Game.resPath+'img/spellBG.png);}'+
		'.templeGod.ready{color:rgba(255,255,255,0.8);opacity:1;}'+
		'.templeGod.ready:hover{color:#fff;}'+
		'.templeGod:hover,.templeDragged{box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}'+
		'.templeGod:active{top:1px;}'+
		'.templeGod.ready .templeIcon{opacity:1;}'+
		'.templeGod:hover{background-position:0px -74px;} .templeGod:active{background-position:0px 74px;}'+
		'.templeGod1{background-position:-60px 0px;} .templeGod1:hover{background-position:-60px -74px;} .templeGod1:active{background-position:-60px 74px;}'+
		'.templeGod2{background-position:-120px 0px;} .templeGod2:hover{background-position:-120px -74px;} .templeGod2:active{background-position:-120px 74px;}'+
		'.templeGod3{background-position:-180px 0px;} .templeGod3:hover{background-position:-180px -74px;} .templeGod3:active{background-position:-180px 74px;}'+
		
		'.templeGod:hover .templeIcon{top:-1px;}'+
		'.templeGod.ready:hover .templeIcon{animation-name:bounce;animation-iteration-count:infinite;animation-duration:0.8s;}'+
		'.noFancy .templeGod.ready:hover .templeIcon{animation:none;}'+
		
		'.templeGem{z-index:100;width:24px;height:24px;}'+
		'.templeEffect{font-weight:bold;font-size:11px;position:relative;margin:0px -12px;padding:4px;padding-left:28px;}'+
		'.description .templeEffect{border-top:1px solid rgba(255,255,255,0.15);background:linear-gradient(to top,rgba(255,255,255,0.1),rgba(255,255,255,0));}'+
		'.templeEffect .templeGem{position:absolute;left:0px;top:0px;}'+
		'.templeEffectOn{text-shadow:0px 0px 6px currentColor;color:#fff;}'+
		'.templeGod .templeGem{position:absolute;left:18px;bottom:8px;pointer-events:none;}'+
		'.templeGem1{background-position:-1104px -720px;}'+
		'.templeGem2{background-position:-1128px -720px;}'+
		'.templeGem3{background-position:-1104px -744px;}'+
		
		'.templeSlot .templeGod,.templeSlot .templeGod:hover,.templeSlot .templeGod:active{background:none;}'+
		
		'.templeSlotDrag{position:absolute;left:0px;top:0px;right:0px;bottom:0px;background:#999;opacity:0;cursor:pointer;}'+
		
		'#templeDrag{position:absolute;left:0px;top:0px;z-index:1000000000000;}'+
		'.templeGod{transition:transform 0.1s;}'+
		'#templeDrag .templeGod{position:absolute;left:0px;top:0px;}'+
		'.templeDragged{pointer-events:none;}'+
		
		'.templeGodPlaceholder{background:red;opacity:0;display:none;width:60px;height:74px;}'+
		
		'#templeSlots{margin:4px auto;text-align:center;}'+
		'#templeSlot0{top:-4px;}'+
		'#templeSlot1{top:0px;}'+
		'#templeSlot2{top:4px;}'+
		
		'#templeInfo{position:relative;display:inline-block;margin:8px auto 0px auto;padding:8px 16px;padding-left:32px;text-align:center;font-size:11px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;background:rgba(0,0,0,0.75);border-radius:16px;}'+
		'</style>';
		str+='<div id="templeBG"></div>';
		str+='<div id="templeContent">';
			str+='<div id="templeDrag"></div>';
			str+='<div id="templeSlots">';
			for (var i in M.slot)
			{
				var me=M.slot[i];
				str+='<div class="ready templeGod templeGod'+(i%4)+' templeSlot titleFont" id="templeSlot'+i+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.slotTooltip('+i+')','this')+'><div class="usesIcon shadowFilter templeGem templeGem'+(parseInt(i)+1)+'"></div></div>';
			}
			str+='</div>';
			str+='<div id="templeInfo"><div '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.refillTooltip','this')+' id="templeLumpRefill" class="usesIcon shadowFilter lumpRefill" style="left:-6px;top:-10px;background-position:'+(-29*48)+'px '+(-14*48)+'px;"></div><div id="templeSwaps" '+Game.getTooltip('<div style="padding:8px;width:350px;font-size:11px;text-align:center;">'+loc("Each time you slot a spirit, you use up one worship swap.<div class=\"line\"></div>If you have 2 swaps left, the next one will refill after %1.<br>If you have 1 swap left, the next one will refill after %2.<br>If you have 0 swaps left, you will get one after %3.<div class=\"line\"></div>Unslotting a spirit costs no swaps.",[Game.sayTime(60*60*1*Game.fps),Game.sayTime(60*60*4*Game.fps),Game.sayTime(60*60*16*Game.fps)])+'</div>')+'>-</div></div>';
			str+='<div id="templeGods">';
			for (var i in M.gods)
			{
				var me=M.gods[i];
				var icon=me.icon||[0,0];
				str+='<div class="ready templeGod templeGod'+(me.id%4)+' titleFont" id="templeGod'+me.id+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.godTooltip('+me.id+')','this')+'><div class="usesIcon shadowFilter templeIcon" style="background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div><div class="templeSlotDrag" id="templeGodDrag'+me.id+'"></div></div>';
				str+='<div class="templeGodPlaceholder" id="templeGodPlaceholder'+me.id+'"></div>';
			}//<div class="usesIcon shadowFilter templeGem templeGem'+(me.id%3+1)+'"></div>
			str+='</div>';
		str+='</div>';
		div.innerHTML=str;
		M.swapsL=l('templeSwaps');
		M.lumpRefill=l('templeLumpRefill');
		
		for (var i in M.gods)
		{
			var me=M.gods[i];
			AddEvent(l('templeGodDrag'+me.id),'mousedown',function(what){return function(e){if (e.button==0){M.dragGod(what);}}}(me));
			AddEvent(l('templeGodDrag'+me.id),'mouseup',function(what){return function(e){if (e.button==0){M.dropGod(what);}}}(me));
		}
		for (var i in M.slot)
		{
			var me=M.slot[i];
			AddEvent(l('templeSlot'+i),'mouseover',function(what){return function(){M.hoverSlot(what);}}(i));
			AddEvent(l('templeSlot'+i),'mouseout',function(what){return function(e){if (e.button==0){M.hoverSlot(-1);}}}(i));
		}
		
		AddEvent(document,'mouseup',M.dropGod);
		
		
		M.refillTooltip=function(){
			return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;" id="tooltipRefill">'+loc("Click to refill all your worship swaps for %1.",'<span class="price lump">'+loc("%1 sugar lump",LBeautify(1))+'</span>')+
				(Game.canRefillLump()?'<br><small>('+loc("can be done once every %1",Game.sayTime(Game.getLumpRefillMax(),-1))+')</small>':('<br><small class="red">('+loc("usable again in %1",Game.sayTime(Game.getLumpRefillRemaining()+Game.fps,-1))+')</small>'))+
			'</div>';
		};
		AddEvent(M.lumpRefill,'click',function(){
			if (M.swaps<3)
			{Game.refillLump(1,function(){
				M.swaps=3;
				M.swapT=Date.now();
				PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			});}
		});
		
		//M.parent.switchMinigame(1);
	}
	M.save=function()
	{
		//output cannot use ",", ";" or "|"
		var str='';
		for (var i in M.slot)
		{str+=parseFloat(M.slot[i])+'/';}
		str=str.slice(0,-1);
		str+=' '+parseFloat(M.swaps)+' '+parseFloat(M.swapT);
		str+=' '+parseInt(M.parent.onMinigame?'1':'0');
		return str;
	}
	M.load=function(str)
	{
		//interpret str; called after .init
		//note: not actually called in the Game's load; see "minigameSave" in main.js
		if (!str) return false;
		var i=0;
		var spl=str.split(' ');
			var bit=spl[i++].split('/')||[];
			for (var ii in M.slot)
			{
				if (parseFloat(bit[ii])!=-1)
				{
					var god=M.godsById[parseFloat(bit[ii])];
					M.slotGod(god,ii);
					l('templeSlot'+god.slot).appendChild(l('templeGod'+god.id));
				}
			}
		M.swaps=parseFloat(spl[i++]||3);
		M.swapT=parseFloat(spl[i++]||Date.now());
		var on=parseInt(spl[i++]||0);if (on && Game.ascensionMode!=1) M.parent.switchMinigame(1);
	}
	M.reset=function()
	{
		M.swaps=3;
		M.swapT=Date.now();
		for (var i in M.slot) {M.slot[i]=-1;}
		for (var i in M.gods)
		{
			var me=M.gods[i];
			me.slot=-1;
			var other=l('templeGodPlaceholder'+(me.id));
			other.parentNode.insertBefore(l('templeGod'+me.id),other);
			other.style.display='none';
		}
	}
	M.logic=function()
	{
		//run each frame
		var t=1000*60*60;
		if (M.swaps==0) t=1000*60*60*16;
		else if (M.swaps==1) t=1000*60*60*4;
		var t2=M.swapT+t-Date.now();
		if (t2<=0 && M.swaps<3) {M.swaps++;M.swapT=Date.now();}
		M.lastSwapT++;
	}
	M.draw=function()
	{
		//run each draw frame
		if (M.dragging)
		{
			var box=l('templeDrag').getBounds();
			var x=Game.mouseX-box.left-60/2;
			var y=Game.mouseY-box.top-32+TopBarOffset;
			if (M.slotHovered!=-1)//snap to slots
			{
				var box2=l('templeSlot'+M.slotHovered).getBounds();
				x=box2.left-box.left;
				y=box2.top-box.top;
			}
			l('templeGod'+M.dragging.id).style.transform='translate('+(x)+'px,'+(y)+'px)';
		}
		var t=1000*60*60;
		if (M.swaps==0) t=1000*60*60*16;
		else if (M.swaps==1) t=1000*60*60*4;
		var t2=M.swapT+t-Date.now();
		if (Game.drawT%5==0) M.swapsL.innerHTML=loc("Worship swaps: %1",'<span class="titleFont" style="color:'+(M.swaps>0?'#fff':'#c00')+';">'+M.swaps+'/'+(3)+'</span>')+((M.swaps<3)?' ('+loc("next in %1",Game.sayTime((t2/1000+1)*Game.fps,-1))+')':'');
	}
	M.init(l('rowSpecial'+M.parent.id));
}
var M=0;