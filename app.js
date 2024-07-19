const getMtaRealtimeFeed = require('./getMtaRealtimeFeed');

const stopNames = {
    'M10N': 'Central Ave (Northbound)',
    'M10S': 'Central Ave (Southbound)',
    'M09N': 'Knickerbocker Ave (Northbound)',
    'M09S': 'Knickerbocker Ave (Southbound)'
};

// Define the offsets in seconds
const northboundOffset = 120;
const southboundOffset = 150;

const feedname = 'bdfm'

main(feedname);
setInterval(main, 10000, feedname);

async function main (feedname) {
    const feed = await getMtaRealtimeFeed(feedname);
    // writeJSON(feed);
    checkForApproachingTrains(feed);
}

function checkForApproachingTrains(entities) {
    entities.forEach(entity => {
        if (entity.tripUpdate && entity.tripUpdate.trip.routeId === "M") {
            const stopTimeUpdates = entity.tripUpdate.stopTimeUpdate;
            if (stopTimeUpdates) {
                stopTimeUpdates.forEach((stopTimeUpdate, index) => {
                    const stopId = stopTimeUpdate.stopId;
                    const nextStopTimeUpdate = stopTimeUpdates[index + 1];
                    
                    if (isTargetStation(stopId) && nextStopTimeUpdate && isTargetStation(nextStopTimeUpdate.stopId)) {
                        notifyApproachingTrain(entity.tripUpdate.trip, stopTimeUpdate, nextStopTimeUpdate);
                    }
                });
            }
        }
    });
}

function isTargetStation(stopId) {
    if (stopNames[stopId]) {
        return true
    } else return false
}

function notifyApproachingTrain(trip, currentStopTimeUpdate, nextStopTimeUpdate) {
    const nextStopId = nextStopTimeUpdate.stopId;
    const offset = nextStopId.endsWith('N') ? northboundOffset : southboundOffset;

    const arrivalTimeAtNextStop = new Date(nextStopTimeUpdate.arrival.time.low * 1000);
    const timeNow = new Date();
    const timeUntilCrossing = (arrivalTimeAtNextStop.getTime() + offset * 1000 - timeNow.getTime()) / 1000;

    const minutes = Math.floor(timeUntilCrossing / 60);
    const seconds = Math.floor(timeUntilCrossing % 60);

    console.log(`Train approaching:
        Trip ID: ${trip.tripId}
        Current Stop: ${stopNames[currentStopTimeUpdate.stopId]} (${currentStopTimeUpdate.stopId})
        Next Stop: ${stopNames[nextStopTimeUpdate.stopId]} (${nextStopTimeUpdate.stopId})
        Arrival Time at Current Stop: ${new Date(currentStopTimeUpdate.arrival.time.low * 1000).toLocaleString('en-US', { timeZone: 'America/New_York', hour12: true })}
        Arrival Time at Next Stop: ${arrivalTimeAtNextStop.toLocaleString('en-US', { timeZone: 'America/New_York', hour12: true })}
        Time until crossing window: ${minutes} minutes and ${seconds} seconds
    `);
}