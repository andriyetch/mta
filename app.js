const getMtaRealtimeFeed = require('./getMtaRealtimeFeed');
const fs = require('fs').promises

const stopNames = { //dont touch
    'M10N': 'Central Ave (Northbound)',
    'M10S': 'Central Ave (Southbound)',
    'M09N': 'Knickerbocker Ave (Northbound)',
    'M09S': 'Knickerbocker Ave (Southbound)'
};

// Define the offsets in seconds for estimating window-crossing time
const northboundOffset = 30;    //towards central ave is northbound
const southboundOffset = 25;    //towards knickerbocker is southbound
const repeatInterval = 10;      //how often (in seconds) to hit the API

const feedname = 'bdfm'         

main(feedname);
setInterval(main, repeatInterval * 1000, feedname);

async function main (feedname) {
    const feed = await getMtaRealtimeFeed(feedname);
    const approachingTrains = checkForApproachingTrains(feed);
    await saveIncomingTrains(approachingTrains);
    readAndLogIncomingTrains();
}

function checkForApproachingTrains(entities) {
    const approachingTrains = [];
    
    entities.forEach(entity => {
        if (entity.tripUpdate && entity.tripUpdate.trip.routeId === "M") {
            const stopTimeUpdates = entity.tripUpdate.stopTimeUpdate;
            if (stopTimeUpdates) {
                stopTimeUpdates.forEach((stopTimeUpdate, index) => {
                    const stopId = stopTimeUpdate.stopId;
                    const nextStopTimeUpdate = stopTimeUpdates[index + 1];
                    
                    if (isTargetStation(stopId) && nextStopTimeUpdate && isTargetStation(nextStopTimeUpdate.stopId)) {
                        const approachingTrain = getApproachingTrainInfo(entity.tripUpdate.trip, stopTimeUpdate, nextStopTimeUpdate);
                        approachingTrains.push(approachingTrain);
                    }
                });
            }
        }
    });

    return approachingTrains;
}

function getApproachingTrainInfo(trip, currentStopTimeUpdate, nextStopTimeUpdate) {
    const nextStopId = nextStopTimeUpdate.stopId;
    const offset = nextStopId.endsWith('N') ? northboundOffset : southboundOffset;

    const arrivalTimeAtNextStop = new Date(nextStopTimeUpdate.arrival.time.low * 1000);
    const windowCrossingTime = new Date(arrivalTimeAtNextStop.getTime() + offset * 1000).getTime();

    return {
        tripId: trip.tripId,
        currentStop: {
            stopId: currentStopTimeUpdate.stopId,
            stopName: stopNames[currentStopTimeUpdate.stopId],
            arrivalTime: currentStopTimeUpdate.arrival.time.low * 1000
        },
        nextStop: {
            stopId: nextStopTimeUpdate.stopId,
            stopName: stopNames[nextStopTimeUpdate.stopId],
            arrivalTime: nextStopTimeUpdate.arrival.time.low * 1000
        },
        windowCrossingTime: windowCrossingTime
    };
}

function isTargetStation(stopId) {
    if (stopNames[stopId]) {
        return true
    } else return false
}

async function saveIncomingTrains(trains) {
    const filePath = './incomingTrains.json';
    await fs.writeFile(filePath, JSON.stringify(trains, null, 2));
}

async function readAndLogIncomingTrains() {
    try {
        const filePath = './incomingTrains.json';
        const data = await fs.readFile(filePath, 'utf8');
        const trains = JSON.parse(data);

        // Sort trains by windowCrossingTime in ascending order (farthest away train first)
        trains.sort((a, b) => b.windowCrossingTime - a.windowCrossingTime);

        // Log each train object
        trains.forEach(train => {
            console.log({
                tripId : train.tripId,
                direction : String(train.currentStop.stopName).includes('Southbound') ? "Southbound" : "Northbound",
                stopInfo : `${train.currentStop.stopName} > ${train.nextStop.stopName}`.replace(/\(.*?\)/g, ""),
                nextStopArrival: new Date(train.nextStop.arrivalTime).toLocaleString('en-US', { 
                    timeZone: 'America/New_York', 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric', 
                    hour12: true 
                }),
                windowCrossingTime: new Date(train.windowCrossingTime).toLocaleString('en-US', { 
                    timeZone: 'America/New_York', 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric', 
                    hour12: true 
                })
            })
        });
    } catch (error) {
        console.error('Error reading or parsing incomingTrains.json:', error);
    }
}