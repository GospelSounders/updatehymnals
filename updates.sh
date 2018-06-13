checktime=60 #1 hour=60minutes	 #time in minutes after which to check for new software

#times in seconds
checktime=$((checktime * 60))

gitpull() {
	git fetch --all
	git reset --hard origin/master
}


while :			#continuously check for internet
do
   {
   		sleep $checktime
   		gitpull
   		yarn install
   }
done