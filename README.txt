1. How to run the simulator? 
To run the project, use a "node app.js" command in the app's directory — I tested Windows' Command Prompt and Visual Studio's built-in Terminal and were able to run the .js in both.

2. Okay, so it runs… but what now?
The app auto initializes on startup (sets internal refresh values, map dimensions, calculates the circular path, etc.). As such, the map should be visible shortly thereafter
It is quite big (or at least appears so in CMD), so it's recommended to zoom out if possible :)

User may input commands using the terminal:
	- "switch on/off x,y" switch on/off individual tiles at given coordinates (e.g. "switch on 0,1" turn on the tile at x=0, y=1; "switch off 14,3" turns off the tile at x=14, y=3)
	- "init" set up the table, start the refresh loop, and calculate the circular path to be animated (this is there just in case the app were to be expanded, e.g. using different input values for variables)
	- "anim" toggles animation — upon first use, it starts from the preset tile and traverses the circular path one tile per refresh; subsequent command uses pause/unpause this animation
	- "clear" resets all tiles' value to 0
	- "quit" closes the CLI and app

The current implementation of the map refresh makes the display flicker (at least on my machine), so the refresh loop is written so it doesn't override the display if no tiles were changed between the ticks (the loop logic runs regardless at the set interval)

3. Time spent on this wondrous invention
It's quite difficult to gauge accurately, as I fell ill to the point where looking in the general direction of the screen brought along nausea and so had to drop the project for some time and later le-learn many things. 

If I were to estimate, I'd say 12-16 hours in total, though most of that time was not spent coding, per se:
	- learning general Node.js from scratch (twice) was certainly the most time-consuming endeavor (but fun)
	- finding and experimenting w/ different Node modules was somewhere in-between
	- actual implementation took the least amount of time, understandably

Again, my wager could be off by a few hours