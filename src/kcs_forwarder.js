'use strict'
const lora_packet = require('lora-packet');
const config = require('../config/config');
const version = require('../config/version');
const gatewayconfig = require('../config/gatewayconfig');
const request = require('request');
const parser = require('./parser.js');
const shell = require('shelljs');
const Async = require('async');


class kcs_forwarder extends parser
{
	constructor()
	{
		super()
		let self = this;
		self.version = version.get("/version")
	}
	updates()
	{
		let self= this;
		self.checkforupdates(function(err, updated){
			if(err)return;
			if(updated === true)
			{

				console.log(updated)
				// self.updatemodules();
			}
		})
		
	}

	checkforupdates(callback)
	{
		//Just restart and let bash script handle it
		process.exit(20)

	}


	gatewayreports(callback)
	{

		let self = this;
		self.gatewayalive(function(err, result){})
		
	}


	gatewayuptime(callback)
	{
		try
		{
			let cmd = "cat /proc/uptime"
			let child = shell.exec(cmd, {async:true, silent:true});
			let calledback = false;
			let minutes = 0;
			let hours = 0;
			child.stdout.on('data', function(data) {
				let tmp = data.split(" ")[0]
				minutes = parseInt(tmp/60)
				callback(null, minutes)
			});
		}catch(err)
		{
			callback(err, 0)
		}
		
	}

	gatewayalive(callback)
	{
		let self = this;
		let gatewayaliveendpoints = config.get("/gatewayendpoints/alive");
		let gatewayIMEI = gatewayconfig.get("/IMEI");
		let upStr;
		let serverNotFound = []
		let numServers =  Object.keys(gatewayaliveendpoints).length;;
		Async.each(gatewayaliveendpoints, function(url, callback) {
			self.gatewayuptime(function(err, gatewayUptime){
				let scriptUptime = Math.floor(process.uptime()/60)
				let nodeCount = self.nodeMon.countNodes()
				let strUp = self.kcsstringWithCorrectTime(scriptUptime, gatewayUptime,nodeCount)
				upStr = gatewayIMEI+"|"+strUp
			    let sendto = url +gatewayIMEI+"|"+strUp;//PVNZjzLw0vFM6g0000000Qc000000000000000000000";	
			    
			    request(sendto, function (error, response, body) {
			    	try
			    	{
			    		if(body.length > 400)
			    			if(!error)error = {code:"WRONGBODY"}
			    	}catch(err){if(!error)error = {code:"WRONGBODY"} }
			    	try
			    	{
			    		if(response.statusCode !== 200)
			    			serverNotFound.push(true)
			    	}catch(error)
			    	{
			    		serverNotFound.push(true)
			    	}
			    	if(numServers === serverNotFound.length)
			    		if(!error)error = {code:"SERVERMISCONFIGURATION"}
			    	if(error)
			    	{
			    		strUp = self.kcsstringWithCorrectTime(scriptUptime, gatewayUptime,nodeCount, false)
						upStr = gatewayIMEI+"|"+strUp
			    		return callback(error.code)
			    	}//or if both servers have 
			    	

			    	if(body === undefined)return callback();
					if(response.statusCode !== 200)
					{
						console.log(`from kcs: ${response.statusCode} `)
						return callback()
					}else console.log('from kcs:', body);  
					let commands = body.match(/\+CLI(.)*/ig);
					Async.each(commands, function(command, callback_inner) {
						command = command.replace(/\+CLI([.]*)/ig, '$1');

						let cmd = command;
						console.log(cmd)
						let child = shell.exec(cmd, {async:true, silent:true});
						let calledback = false;
						child.stdout.on('data', function(data) {
							// console.log(data)
							if(calledback === false) 
								callback_inner();
						});
					});
					
					callback()

				});

			});
			
		}, function(errcode) {
			self.saveForLater(errcode, upStr, "gateway");
		});
	}

	gatewayupdate(callback)
	{
		let self = this;
		self.updated = true;
		let cmd = "git pull";
		let child = shell.exec(cmd, {async:true, silent:true});
		let calledback = false;
		child.stdout.on('data', function(data) {
			console.log("data:"+data)
			let noupdates = data.match(/up-to-date/);
			if(noupdates !== null)self.updated = false;
		});
		self.diditupdate();
		setTimeout(function(){
			callback();
		},30000)//be done after 30 seconds
	}

	diditupdate()
	{
		let self = this;
		let updated = false;
		setTimeout(function(){
			updated = self.updated;
			if(updated === true)
				self.restartservice(10000, function(){});
		}, 30000)//wait 20 seconds to check for updates...
	}

	restartservice(delay, callback)
	{
		setTimeout(function(){

			let cmd = "systemctl restart kcs_forwarder.service";
			let child = shell.exec(cmd, {async:true, silent:true});
			child.stdout.on('data', function(data) {
				console.log(data)
				callback();
			});
		}, delay)
	}

	roughSizeOfObject( object ) {

	    let objectList = [];
	    let stack = [ object ];
	    let bytes = 0;

	    while ( stack.length ) {
	        let value = stack.pop();

	        if ( typeof value === 'boolean' ) {
	            bytes += 4;
	        }
	        else if ( typeof value === 'string' ) {
	            bytes += value.length * 2;
	        }
	        else if ( typeof value === 'number' ) {
	            bytes += 8;
	        }
	        else if
	        (
	            typeof value === 'object'
	            && objectList.indexOf( value ) === -1
	        )
	        {
	            objectList.push( value );

	            let i
	            for(i in value ) {
	                stack.push( value[ i ] );
	            }
	        }
	    }
	    return bytes;
	}

	kcsstringWithCorrectTime(scriptUptime, gatewayUptime, nodeCount, connectionAvailable = true)
	{
		let self = this;
		let packet_bigEndian = [];
		let packet_smallEndian = [];
		let hexstring = "1c00000001000000fdfffeff090b1400";
		let hexlen = hexstring.length;

		let i;
		for(let i= 0;i<hexlen;i++)
		    packet_smallEndian.push(parseInt("0x"+hexstring[i++]+hexstring[i]));
		  
		let tmp=0;
		let digital1, digital2, analog1, analog2, vbat, temperature, doorstatus;

		while(tmp<hexlen/2)
		{
		    packet_bigEndian.push(packet_smallEndian.pop());
		    tmp++;
		}
		digital1 = packet_bigEndian.pop() + (packet_bigEndian.pop()<<8)+(packet_bigEndian.pop()<<16)+(packet_bigEndian.pop()<<24);
		digital2 = packet_bigEndian.pop() + (packet_bigEndian.pop()<<8)+(packet_bigEndian.pop()<<16)+(packet_bigEndian.pop()<<24);
		analog1 = packet_bigEndian.pop() + (packet_bigEndian.pop()<<8);
		analog2 = packet_bigEndian.pop() + (packet_bigEndian.pop()<<8);
		vbat = packet_bigEndian.pop() + (packet_bigEndian.pop()<<8);
		//console.log("................bat"+vbat)
		temperature = packet_bigEndian.pop() + (packet_bigEndian.pop()<<8);     //-32768
		vbat /= 1000;



		let time = Math.floor(Date.now() / 1000)//timestamp in seconds
		let sizeoftime = self.roughSizeOfObject(time)
		let sizeofdigital1 = self.roughSizeOfObject(digital1)
		let sizeofdigital2 = self.roughSizeOfObject(digital2)
		let sizeofanalog1 = self.roughSizeOfObject(analog1)
		let sizeofanalog2 = self.roughSizeOfObject(analog2)
		let sizeofvbat = self.roughSizeOfObject(vbat)
		let sizeoftemperature = self.roughSizeOfObject(temperature)
		let packet33chars = []


		////

			digital1 = scriptUptime;
			digital2 = gatewayUptime;
			vbat = nodeCount/10+1;
			doorstatus = connectionAvailable === true?0x41:0x43;  //1 for connection, 0 for no connection
		///

		sizeoftime *= 8//in bits
		time = 100*(time-946684800.0)/16

		packet33chars.push((time<<(sizeoftime-4*8))>>(sizeoftime-4*8)>>(3*8))
		packet33chars.push((time<<(sizeoftime-3*8))>>(sizeoftime-3*8)>>(2*8))
		packet33chars.push((time<<(sizeoftime-2*8))>>(sizeoftime-2*8)>>(1*8))
		packet33chars.push((time<<(sizeoftime-(1*8)))>>(sizeoftime-(1*8))>>(0*8))
		//temperature
		sizeoftemperature *= 8//in bits
        analog1 = analog1/96;
        analog1 = self.version     //takes whole numbers;
        temperature = analog1;//send analog 1 inplace of temperature;
		temperature = (temperature+60) * 256
		packet33chars.push((temperature<<(sizeoftemperature-2*8))>>(sizeoftemperature-2*8)>>(1*8))
		packet33chars.push((temperature<<(sizeoftemperature-1*8))>>(sizeoftemperature-1*8)>>(0*8))

		//vbat
		sizeofvbat *= 8//in bits
		vbat = (vbat - 0.2)*1969
		packet33chars.push((vbat<<(sizeofvbat-2*8))>>(sizeofvbat-2*8)>>(1*8))
		packet33chars.push((vbat<<(sizeofvbat-1*8))>>(sizeofvbat-1*8)>>(0*8))

		//switch
		packet33chars.push(0x70)
		//port size
		packet33chars.push(0x19)
		//digital1, pulses
		sizeofdigital1 *= 8//in bits
		packet33chars.push((digital1<<(sizeofdigital1-4*8))>>(sizeofdigital1-4*8)>>(3*8))
		packet33chars.push((digital1<<(sizeofdigital1-3*8))>>(sizeofdigital1-3*8)>>(2*8))
		packet33chars.push((digital1<<(sizeofdigital1-2*8))>>(sizeofdigital1-2*8)>>(1*8))
		packet33chars.push((digital1<<(sizeofdigital1-1*8))>>(sizeofdigital1-1*8)>>(0*8))
		//digital2,, only 2 bytes
		sizeofdigital2 *= 8//in bits
		packet33chars.push((digital2<<(sizeofdigital2-2*8))>>(sizeofdigital2-2*8)>>(1*8))
		packet33chars.push((digital2<<(sizeofdigital2-1*8))>>(sizeofdigital2-1*8)>>(0*8))
		//door status...2nd bit is door status
		packet33chars.push(doorstatus)// or try 1 to make second bit zero
		let singleitem = packet33chars.pop();
		packet33chars.push(singleitem)
		let singleitemsize = self.roughSizeOfObject(singleitem)
		let packetind = self.roughSizeOfObject(packet33chars)/singleitemsize
		for(;packetind<30;packetind++) packet33chars.push(0)
		//filler for pos 30, 31,32
		packet33chars.push(0)
		packet33chars.push(0)
		packet33chars.push(0)
		//if forwarded by gateway
		packet33chars.push(99)
		packetind = self.roughSizeOfObject(packet33chars)/singleitemsize-1

		let packet33charsinverted = []
		for(tmp=0;tmp<=packetind;tmp++)packet33charsinverted.push(packet33chars.pop())
		let packetstr = 0;
		let lastpacketlen = (8*packetind)/6

		let bitindex, byteindex;

		let packetstosend = [];

		byteindex = 0; 
		let byte;
		let bytet0push = 0;
		let tmpi = 0;

		for(tmp=0;tmp<packetind;tmp++)
		{
		    byte = packet33charsinverted.pop()
		    for(bitindex=0;bitindex<8;bitindex++)
		    {
		      let bit =   (byte<<(8*7+bitindex))>>(8*7+bitindex)>>(7-bitindex);
		      if(bit === -1)bit = 1;
		      bytet0push += bit<<(5-tmpi)
		      tmpi++;
		      if(tmpi == 6)
		      {
		        packetstosend.push(bytet0push)
		        bytet0push = 0;
		        
		        tmpi = 0;
		      }
		    }
		}


		packetind = self.roughSizeOfObject(packetstosend)/singleitemsize
		let packetstosendbigEndian = []
		for(tmp= 0; tmp<packetind;tmp++)packetstosendbigEndian.push(packetstosend.pop())
		let c = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
		let strtosend = '';
		for(tmp= 0; tmp<packetind;tmp++)
		{
		    let ind = packetstosendbigEndian.pop();
		    strtosend += c[ind]
		}
	    return strtosend;
	}
}


module.exports = new kcs_forwarder