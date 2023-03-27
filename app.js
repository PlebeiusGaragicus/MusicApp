import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
// const io = new Server(httpServer);

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Add this to parse JSON request bodies

app.use(express.static(path.join(process.cwd(), 'public')));

// In-memory storage for song requests
const songRequests = [];

// API route to fetch song requests
app.get('/api/songs', (req, res) => {
    res.json(songRequests);
});

// API route to add a new song request
app.post('/api/songs', (req, res) => {
    const { songTitle, tipAmount } = req.body;

    console.log(songTitle, tipAmount)

    songRequests.push({ songTitle, tipAmount });
    res.status(201).json({ message: 'Song request added successfully' });
    // if (songTitle && typeof tipAmount === 'number') {
    //     songRequests.push({ songTitle, tipAmount });
    //     res.status(201).json({ message: 'Song request added successfully' });
    // } else {
    //     res.status(400).json({ message: 'Invalid request data' });
    // }
});

// Get available songs from songs.csv
app.get('/api/available-songs', (req, res) => {
    // const songsPath = path.join(process.cwd(), 'public', 'songs.csv');
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


// Set up a connection event handler
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for the song request event from clients
    socket.on('songRequestForm', async (songTitle, tipAmount) => {
        try {
            // Your logic to save the new song request to the database

            // Fetch the updated list of song requests after saving the new request
            const updatedSongRequests = await fetchUpdatedSongRequests();

            // Emit the updated list of song requests to all connected clients
            io.emit('updateSongRequests', updatedSongRequests);
        } catch (error) {
            console.error('Error processing song request:', error);
        }
    });

    // Set up a disconnect event handler
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
});


app.listen(port, '192.168.86.21', () => {
    console.log(`Server is running on http://192.168.86.21:${port}`);
});

io.listen(3000);



// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });



// app.listen(port, '0.0.0.0', () => {
//     console.log(`Server is running on http://0.0.0.0:${port}`);
// });



// app.get('/socket.io-client/dist/socket.io.js', (req, res) => {
//     res.sendFile(path.join(__dirname, '../node_modules/socket.io-client/dist/socket.io.js'));
// });


// io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Listen for song request event from clients
//     socket.on('songRequest', async (songTitle, tipAmount) => {
//         // Your logic to save the new song request to the database

//         // Fetch the updated list of song requests after saving the new request
//         const updatedSongRequests = await fetchUpdatedSongRequests();

//         // Emit the updated list of song requests to all connected clients
//         io.emit('updateSongRequests', updatedSongRequests);
//     });

//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
// });