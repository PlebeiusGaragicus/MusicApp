const songList = document.getElementById("songList");
const tipAmount = document.getElementById("tipAmount");

const payWithCashApp = document.getElementById("payWithCashApp");
const payWithVenmo = document.getElementById("payWithVenmo");


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


// THIS IS FOR A DROP DOWN AKA 'SELECT'
function populateAvailableSongs(songs) {
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


async function fetchAvailableSongs() {
    const songs = await fetch('/api/available-songs');
    const ans = await songs.json()

    console.log(ans)
    return ans
}




document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket('ws://localhost:3000');

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

    payWithCashApp.addEventListener("click", async () => {
        console.log("user is paying with cash app")

        // const songTitle = songList.options[songList.selectedIndex].text;
        const songTitle = document.getElementById('songTitle').value.trim();
        console.log("songTitle", songTitle)

        if (songTitle === "Select a song:") {
            console.log("NO SONG WAS ACTUALLY SELECTED.. BRO!!!")
            return
        }

        const tipAmount = parseFloat(document.getElementById('tipAmount').value).toFixed(2);
        console.log("tipAmount", tipAmount)
        if (tipAmount === "NaN") {
            console.log("NO TIP AMOUNT WAS ACTUALLY SELECTED.. BRO!!!")
            return
        }

        const songRequest = {
            songTitle: songTitle,
            tipAmount: tipAmount
        }

        socket.send(JSON.stringify({ type: 'request', ...songRequest }));

        const cashAppUrl = await fetch('/api/cashtag');
        const { url } = await cashAppUrl.json();
        console.log("url", url)

        const openUrl = `${url}/${tipAmount}`;
        console.log("openUrl", openUrl)

        //TODO: this needs to be tailored to mobile...
        // window.open(openUrl, '_blank');
        window.location.href = url;
    });


    payWithVenmo.addEventListener("click", async () => {
        console.log("user is paying with venmo")
        alert("Venmo is not yet supported. Please pay with Cash App.")
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