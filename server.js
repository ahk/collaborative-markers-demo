const fs = require('fs');
const express = require('express'); 

const app = express()
const port = 3000;

const circlesFileName = 'circles.json';

async function readFileAsync(file) {
    const wrapPromise = new Promise((resolve, reject) => {
        fs.readFile(file, (error, data) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(data);
            }
        });
    });

    return wrapPromise;
} 

async function writeFileAsync(file, data) {
    const wrapPromise = new Promise((resolve, reject) => {
        fs.writeFile(file, JSON.stringify(data), (error) => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });

    return wrapPromise;
}

async function loadCircles() {
    let circles = null;

    try {
        json = await readFileAsync(circlesFileName);
        circles = JSON.parse(json);
    }
    catch (error) {
        console.log(`Couldn't read saved circle data: ${error}`)
    }

    if (circles) {
        console.log('Using saved circle data.')
        return circles;
    }
    else {
        console.log('Initializing circle data.')
        return [];
    }
}

async function saveCircles(circles) {
    return await writeFileAsync(circlesFileName, circles);
}

async function addCircle(lngLat, circles) {
    circles.push(lngLat);
    return await saveCircles(circles);
}

// Express server API
async function startServer() {
    // Load our saved state
    const circles = await loadCircles();

    // Support JSON request bodies in POST
    app.use(express.json())

    // Serve static files from '/static'
    app.use(express.static('static'));

    // Serve list of circles to client
    app.get('/circles', function (req, res, next) {
        res.json(circles);
    });

    // Add circles from the client
    app.post('/circles', function (req, res, next) {
        const lngLat = req.body;

        console.log(`Got circle: ${JSON.stringify(lngLat)}`)
        addCircle(lngLat, circles);

        res.sendStatus(200);
    });

    app.listen(port, () => console.log(`Markers demo started on port ${port}`))
}

startServer();
