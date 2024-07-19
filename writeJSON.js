async function writeJSON (jsonObject, name) {
    return new Promise ((resolve) => {
        const fs = require('fs');
        const filename = `./${name}.json`
        fs.writeFile(filename, JSON.stringify(jsonObject, null, 2), (err) => {
          if (err) throw err;
            console.log(`Successfully wrote ${filename}`.green);
            resolve(filename);
        });
    })
}

module.exports = writeJSON;