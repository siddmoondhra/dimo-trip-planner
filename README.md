# Trip Planner (Intern Project for DIMO) WORK IN PROGRESS

Link to project: Working on it!

How It's Made:

Tech used: CSS, Typescript, React, Next.js

This project was designed to make use of DIMO's Telemetry API in a web application. It uses the user's location data and data from their car such as fuel level and engine status to map a route to their chosen destination, making recommendations for stops along the way based on the aformentioned data. For example, if fuel is running low, the app can reccomend good spots nearby to refuel based on price, ratings, etc. Currently, only fuel level is available, but I have plans to add more in the future. This project also utilizes of a few of Google's APIs as well, in order to load the map, search for nearby businesses, plot directions onto said map, and more. 

I wanted to use the variety of data DIMO offers through their APIs while gaining experience with React, Typescript, and web development as a whole. For the first few weeks of the internship, I had to gain access to all the API's I would need, and create a roadmap for my project. I got a developer's license from DIMO; they had just revamped the proccess, so it took a while to get. I also gained access to Google's Cloud service so I can later use their APIs. 

The next stage of my project was creating the "base" for the project; figuring out how to host the applicaiton, load the map component, and have a simple authentication flow. DIMO provides a code-based auth flow, so I followed that. This way, when users log in with their DIMO account, I could access their vehicle's location and other data. I used cookies to allow users to only have to authenticate once every two weeks (when their access token from DIMO needed refreshing) and to store the various codes and tokens needed for accessing their vehicle data. 

After this, I worked on the routing a directions component, and was able to make simple routes from point A to B appear on the map. I then enabled the rerouting system, such that users can choose between 3 different routes.

Finally, I began to incorperate the data from DIMO into the app; first the user's location, then their vehicle's fuel level. I'm currently working on adding more points of data and encorperating it into the routing system, so stay tuned. I also worked a bit on the CSS in this stage, but I want to make some more edits to the design before I'm done. 


Optimizations:
Some optimizations I've made to this project so far include the use of cookies to store important points of data, mainly for the authentication flow, and redesigning the map to make it faster to load. The cookies allow users to only have to log in once every so often, and my application can still make the needed API calls using the information. As for the map, I made use of the APIProvider component from Google to make the API call faster, as before I had to make the call seperately and then load the map. There will definitely be more optimiztions as I make some more progress, as I like making sure my code is functional before making major optimizations!


Lessons Learned:
This project has taught me so, so much about web and full-stack development. I've gotten much more comfortable making API calls, using TypeScript/JavaScript, and working with React. I've also gained expeirence using HTML/CSS, and utlizing React components as a whole. The biggest thing I learned from this, however, is understanding how to code "nonlinearly." By this, I mean like certain parts of my code, like fetch() requests and Promises, would take time to complete. This by itself is not hard to understand, but when another function requires a result from that fetch(), and then another, it can get confusing quick. I had only really worked with code that ran everything from top to bottom in order, so this was an exciting yet challenging new appoach for me. Overall, I really enjoyed working on this project, and I feel like a stronger coder as a result. Thanks for reading!

