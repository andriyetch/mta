async function getMtaRealtimeFeed(feedname) {
    const protobuf = require('protobufjs');
    const axios = require('axios');
    
    const availableFeeds = ['ace', 'bdfm', 'g', 'jz', 'nqrw', 'l', '1234567', 'si'];

    try {
        // Load protocol buffers and FeedMessage
        const root = await protobuf.load("gtfs-realtime.proto");
        const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
        
        if (!availableFeeds.includes(feedname)) throw new Error("Invalid feed name. Please select one of the available feeds:\n\n" + availableFeeds + "\n\n");

        const baseApiUrl = `https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs`;
        const fullUrl = (feedname === '1234567') ? baseApiUrl : baseApiUrl + `-${feedname}`

        const axiosConfig = {
            method: 'GET',
            url: fullUrl,
            responseType: 'arraybuffer',
        };

        // Fetch feed data
        const response = await axios(axiosConfig); 
        if (response.status === 200) {
            const feed = FeedMessage.decode(new Uint8Array(response.data));
            return feed.entity
        } else {
            throw new Error("Error fetching GTFS-realtime feed: " + response.status);
        }

    } catch (error) {
        console.error("Error fetching or decoding GTFS-realtime feed:", error);
    }
}

module.exports = getMtaRealtimeFeed;