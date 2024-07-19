## For anyone who randomly comes across this repo the file you're probably looking for is the `getMtaRealtimeFeed.js`. This function does the following: 

* hits the the [NYC Subway Realtime Feeds API](https://api.mta.info/#/subwayRealTimeFeeds)
* converts the API data from GTFS to JSON format in the most barebones way I could manage (does not use the many npm packages with deprecated inflight dependency that has a memory leak)
* the function takes in a parameter `feedname` which tells it which route from the above link to use. List of valid feednames is in the function itself.

### Another function you may be interested in is in `getStopInfo.js`. 

* this returns detailed info about each subway stop, including their GTFS IDs so you can associate this data with the data returned by `getMtaRealtimeFeed.js`
* simply retrieves json from https://data.ny.gov/resource/5f5g-n3cz.json so it should stay up to date

### Rest of the logic in this repo is for a personal project, disregard:

1. clone repo
2. `npm install`
3. In app.js set any values you want for `northboundOffset`, `southboundOffset`, or `repeatInterval` (near the top of the file)
4. run `node app`

It will output in console (for now) a list in chronological order of the next trains to cross the area as shown below

![image](https://github.com/user-attachments/assets/bc03fc41-1e99-4f39-8101-7df7710b8879)
