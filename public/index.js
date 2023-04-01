import config from './config.js';


let socket = setupWebSocket();

function setupWebSocket() {
    // TODO: this is noob code - stop that!
    const socket = new WebSocket(config.WEBSOCKET_URL);

    return socket;
}


document.addEventListener('DOMContentLoaded', () => {
    setupWebSocketEventListeners();
    populateAvailableSongsSelect();
    fetchSongRequestsTable();

    setupLinks();
});


window.addEventListener('focus', () => {
    if (socket.readyState === WebSocket.CLOSED) {
        // TODO DEBUG - remove this
        alert("The WebSocket connection was closed! reconnecting...")
        console.log('Reconnecting WebSocket...');
        socket = setupWebSocket();
    }
    setupWebSocketEventListeners();

    fetchSongRequestsTable();
});


function setupLinks() {



    cashAppLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Cash App link clicked: ${link.href}`);
    });
}



function setupWebSocketEventListeners() {

    socket.addEventListener('open', () => {
        console.log('Connected to WebSocket server');
    });

    socket.addEventListener('message', (event) => {
        console.log(`Message from server: ${event.data}`);
        const data = JSON.parse(event.data);
        if (data.type === 'newSong' || data.type === 'songDeleted') { // Add the 'songDeleted' message type
            console.log("Song list updated... fetching a whole new table!");
            fetchSongRequestsTable();
        }
    });

    socket.addEventListener('close', () => {
        console.log('Disconnected from WebSocket server');
    });

    const payWithCashApp = document.getElementById("cashAppLink");
    payWithCashApp.addEventListener("click", async () => {
        console.log("user is paying with cash app")

        const songTitle = document.getElementById('songTitle').value.trim();
        console.log("songTitle", songTitle)

        if (songTitle === "Select a song:") {
            console.log("NO SONG WAS ACTUALLY SELECTED.. BRO!!!")

            payWithCashApp.preventDefault();
            return
        }

        const tipAmount = parseFloat(document.getElementById('tipAmount').value).toFixed(2);
        console.log("tipAmount", tipAmount)
        if (tipAmount === "NaN" || tipAmount === "0.00") {
            alert("Please select a tip amount.")
            console.log("NO TIP AMOUNT WAS ACTUALLY SELECTED.. BRO!!!")

            payWithCashApp.preventDefault();
            return
        }

        payWithCashApp.href = `https://www.google.com`;

        const songRequest = {
            songTitle: songTitle,
            tipAmount: tipAmount
        }

        if (socket.readyState === WebSocket.CLOSED) {
            alert("The WebSocket connection was closed! reconnecting...")
            console.log('Reconnecting WebSocket...');
            socket = setupWebSocket();
        }

        socket.send(JSON.stringify({ type: 'request', ...songRequest }));


        // const cashAppUrl = await fetch('/api/cashtag');
        // const { url } = await cashAppUrl.json();
        // console.log("url", url)

        // const openUrl = `${url}/${tipAmount}`;
        // console.log("openUrl", openUrl)

        // //TODO: this needs to be tailored to mobile...
        // if (config.WEBSOCKET_URL !== "ws://localhost:3000")
        //     openCashApp(openUrl);
        // window.location.href = url;
        // window.open(openUrl, '_blank'); // didn't work on mobile

        // at the end...!
        clearInputs();
    });

    // const payWithVenmo = document.getElementById("payWithVenmo");
    // payWithVenmo.addEventListener("click", async () => {
    //     console.log("user is paying with venmo")
    //     alert("Venmo is not yet supported. Please pay with Cash App.")

    //     // at the end...!
    //     clearInputs();
    // });
};



async function fetchSongRequestsTable() {
    const response = await fetch('/api/songs');
    const songRequests = await response.json();

    // Sort the song requests by tip amount (descending order)
    // TODO: i shouldn't have to do this as the sorting is done in app.js
    // songRequests.sort((a, b) => parseFloat(b.tipAmount) - parseFloat(a.tipAmount));

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


// THIS IS FOR A DROP DOWN AKA 'SELECT'
async function populateAvailableSongsSelect() {

    const available = await fetch('/api/available-songs');
    const songs = await available.json()
    console.log(songs)

    const songSelect = document.getElementById('songTitle');
    console.log("populating song list")

    const firstOption = document.createElement('option');
    firstOption.value = "Select a song:";
    firstOption.textContent = "Select a song:";
    songSelect.appendChild(firstOption);

    songs.forEach((song) => {
        const option = document.createElement('option');
        option.value = song;
        option.textContent = song;
        songSelect.appendChild(option);
    });
}



function clearInputs() {
    document.getElementById('songTitle').value = '';
    document.getElementById('tipAmount').value = '';
}



// THESE HAVE BEEN MOVED INTO THE "WAIT FOR DOM TO LOAD" EVENT LISTENER
// // async IIFE (Immediately Invoked Function Expression) to call fetchAvailableSongs()
// //  and populate the dropdown when the page loads:
// (async function () {
//     const songs = await fetchAvailableSongs();
//     populateAvailableSongsSelect(songs);
// })();


// fetchSongRequestsTable();