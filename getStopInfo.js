async function getStopInfo () {
    const axios = require('axios');
    try {
        const response = await axios.get('https://data.ny.gov/resource/5f5g-n3cz.json');
        return response.data
    } catch (error) {
        console.log("Failed fetching stop info")
    }
    return response.data;
}

module.exports = getStopInfo