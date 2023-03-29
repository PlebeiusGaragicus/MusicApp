import config from './config.js';


async function fetchSongRequests() {
    const response = await fetch('/api/songs');
    const songRequests = await response.json();

    // Sort the song requests by tip amount (descending order)
    songRequests.sort((a, b) => parseFloat(b.tipAmount) - parseFloat(a.tipAmount));

    const tableBody = document.getElementById('songRequestTable').querySelector('tbody');
    tableBody.innerHTML = '';

    songRequests.forEach(({ songTitle, tipAmount }) => {
        const row = document.createElement('tr');

        const titleCell = document.createElement('td');
        titleCell.textContent = songTitle;
        row.appendChild(titleCell);

        const tipAmountCell = document.createElement('td');
        tipAmountCell.textContent = `$${parseFloat(tipAmount).toFixed(2)}`;
        row.appendChild(tipAmountCell);

        tableBody.appendChild(row);
    });
}


async function fetchAvailableSongs() {
    const songs = await fetch('/api/available-songs');
    const ans = await songs.json()

    console.log(ans)
    return ans
}




document.addEventListener('DOMContentLoaded', () => {
    // const socket = new WebSocket('ws://localhost:3000');
    const socket = new WebSocket(config.WEBSOCKET_URL);

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
    });

    socket.addEventListener('message', (event) => {
        console.log(`Message from server: ${event.data}`);
        const data = JSON.parse(event.data);
        if (data.type === 'newSong') {
            console.log("adding a new song because the server told me to")
            const { songTitle, tipAmount } = data;
            console.log(`Received new song from the server: ${songTitle}`);

            const tableBody = document.getElementById('songRequestTable').querySelector('tbody');
            const row = document.createElement('tr');

            const titleCell = document.createElement('td');
            titleCell.textContent = songTitle;
            row.appendChild(titleCell);

            const tipAmountCell = document.createElement('td');
            tipAmountCell.textContent = `$${parseFloat(tipAmount).toFixed(2)}`;
            row.appendChild(tipAmountCell);

            row.dataset.tipAmount = tipAmount;

            tableBody.appendChild(row);

            // Sort the rows by tipAmount
            sortTableByTipAmount(tableBody);
        }
    });

    socket.addEventListener('close', () => {
        console.log('Disconnected from WebSocket server');
    });
});


function sortTableByTipAmount(tableBody) {
    const rows = Array.from(tableBody.querySelectorAll('tr')).sort((a, b) => {
        return parseFloat(b.dataset.tipAmount) - parseFloat(a.dataset.tipAmount);
    });

    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
}



// async IIFE (Immediately Invoked Function Expression) to call fetchAvailableSongs()
//  and populate the dropdown when the page loads:
(async function () {
    const songs = await fetchAvailableSongs();
    populateAvailableSongs(songs);
})();


fetchSongRequests();