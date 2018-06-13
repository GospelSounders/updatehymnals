#!/bin/bash

main()
{
	#handling updates
	./updates.sh &
	node bin/app.js
}

#Entry point
main
