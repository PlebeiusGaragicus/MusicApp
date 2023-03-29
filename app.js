import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

import http from 'http'
import { WebSocketServer } from 'ws'

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Add this to parse JSON request bodies

app.use(express.static(path.join(process.cwd(), 'public')));

// In-memory storage for song requests
// const songRequests = [];




app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

app.get('/list', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/list.html'));
});





///////////////////////////
const songRequestsFile = 'song_requests.json';

// Load song requests from JSON file
function loadSongRequests() {
    if (fs.existsSync(songRequestsFile)) {
        const fileContents = fs.readFileSync(songRequestsFile, 'utf-8');
        return JSON.parse(fileContents);
    } else {
        return [];
    }
}

// Save song requests to JSON file
function saveSongRequests(requests) {
    fs.writeFileSync(songRequestsFile, JSON.stringify(requests, null, 2));
}

// Get song requests
app.get('/api/songs', (req, res) => {
    res.send(loadSongRequests());
});
// FETCH songs
// app.get('/api/songs', (req, res) => {
//     res.json(songRequests);
// });

// Add a song request
// app.post('/api/songs', (req, res) => {
//     const songRequests = loadSongRequests();
//     const newSong = req.body;
//     songRequests.push(newSong);
//     saveSongRequests(songRequests);
//     res.status(201).send(newSong);
//   });
// // POST songs
// app.post('/api/songs', (req, res) => {
//     const { songTitle, tipAmount } = req.body;

//     console.log(songTitle, tipAmount)

//     //NOTE: I'm not using validation here because it is done on the client side
//     //TODO: Although... I need to combine tips for duplicate songs
//     songRequests.push({ songTitle, tipAmount });
//     res.status(201).json({ message: 'Song request added successfully' });
// });

// Delete a song request
app.delete('/api/songs/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const songRequests = loadSongRequests();

    if (index >= 0 && index < songRequests.length) {
        const removedSong = songRequests.splice(index, 1);
        saveSongRequests(songRequests);
        res.status(200).send(removedSong);

        // Broadcast the deletion event to all connected clients
        const message = JSON.stringify({ type: 'songDeleted' });
        broadcast(message);
    } else {
        res.status(404).send({ error: 'Song request not found' });
    }
});


// FETCH songs from csv
app.get('/api/available-songs', (req, res) => {
    const songsPath = path.join(process.cwd(), 'songs.csv');

    fs.readFile(songsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading songs.csv:', err);
            res.status(500).send('Failed to read available songs');
            return;
        }

        const songs = data.trim().split('\n');
        res.json(songs);
    });
});

app.get('/api/cashtag', (req, res) => {
    const resUrl = `https://cash.app/${process.env.CASH_TAG}`;
    res.json({ url: resUrl });
});


wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`A user sent a message: ${message}`);
        const data = JSON.parse(message);
        if (data.type === 'request') {
            const { songTitle, tipAmount } = data;
            console.log(`Received message: ${songTitle} with tip amount: ${tipAmount}`);

            const songRequests = loadSongRequests(); // Load song requests from server-side storage

            // search for duplicate songs
            let duplicate = false
            for (let i = 0; i < songRequests.length; i++) {
                if (songRequests[i].songTitle === songTitle) {
                    console.log("duplicate song found, adding tip amount to existing song")
                    duplicate = true
                    songRequests[i].tipAmount = (parseFloat(songRequests[i].tipAmount) + parseFloat(tipAmount)).toString()
                    break
                }
            }

            if (!duplicate) {
                songRequests.push({ songTitle, tipAmount }); // we add it to the global song list
                songRequests.sort((a, b) => parseFloat(b.tipAmount) - parseFloat(a.tipAmount)); // sort list
            }

            saveSongRequests(songRequests); // save the new list to the server

            console.log("this is the server's sorted song list:")
            console.log(songRequests)

            broadcast(JSON.stringify({ type: 'newSong', songTitle, tipAmount }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcast(message) {
    console.log("broadcasing to all!")
    wss.clients.forEach((client) => {
        console.log("broadcasting client")
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// WE DON'T USE THESE, APPARENTLY...
// app.listen(port, '192.168.86.21', () => {
//     console.log(`Server is running on http://192.168.86.21:${port}`);
// });

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });

// const host = process.env.IP_ADDRESS
// console.log(host)

// app.listen(port, host, () => {
//     console.log(`Server is running on http://${host}:${port}`);
// });

// app.listen(port, '0.0.0.0', () => {
//     console.log(`Server is running on http://0.0.0.0:${port}`);
// });
