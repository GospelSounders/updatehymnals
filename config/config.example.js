'use strict';
const Confidence = require('confidence');
const Dotenv = require('dotenv');


Dotenv.config({ silent: false });

const criteria = {
    env: process.env.NODE_ENV
};

const config = {
	"kcsserver":{
		0:"",
		1:""
	},
	"gatewayendpoints":
	{
		"alive":
		{
			0:"",
			1:"",
		},
		"update":
		{
			0:"",
			1:"",
		}
	},
	"AppSKey":"",
	"NwkSKey":"",
	"intervals":{
		"gatewayalive":3600000,		//one hour
		"checkupdates":3600000,		//one hour
		"restartservice":180000,		//3 minutes
	}
}


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
