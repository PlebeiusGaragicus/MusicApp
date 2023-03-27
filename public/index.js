// import io from 'socket.io-client';

const socket = io();

socket.on('updateSongRequests', (updatedSongRequests) => {
    // Update the song requests table with the updated list
    // displaySongRequests(updatedSongRequests);
    console.log("A NEW SONG WAS REQUESTED!!", updatedSongRequests)
});

const songRequestForm = document.getElementById("songRequestForm");
const songList = document.getElementById("songList");


// function displaySongRequests(songRequest) {
//     // const songRequestsTable = document.getElementById('songRequestsTable');
//     const songRequestsTable = document.getElementById('songRequestTable');

//     const { songTitle, tipAmount } = songRequest;

//     // Create a new table row and table data elements
//     const row = document.createElement('tr');
//     const songTitleCell = document.createElement('td');
//     const tipAmountCell = document.createElement('td');

//     // Set the text content of the table data elements
//     songTitleCell.textContent = songTitle;
//     tipAmountCell.textContent = tipAmount;

//     // Append the table data elements to the table row
//     row.appendChild(songTitleCell);
//     row.appendChild(tipAmountCell);

//     // Append the table row to the table body
//     songRequestsTable.appendChild(row);
// }


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

// async function submitSongRequest(songTitle, tipAmount) {
//     // Emit the songRequest event to the server with the songTitle and tipAmount
//     socket.emit('songRequest', songTitle, tipAmount);
// }


async function submitSongRequest(songTitle, tipAmount) {
    const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songTitle, tipAmount }),
    });

    if (response.ok) {
        fetchSongRequests();

        socket.emit('songRequest', songTitle, tipAmount);
    } else {
        console.error('Failed to submit song request');
    }
}



songRequestForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const songTitle = document.getElementById('songTitle').value.trim();
    const tipAmount = parseFloat(document.getElementById('tipAmount').value).toFixed(2);

    if (songTitle === "Select a song:") {
        alert("Please select a song")
        return
    }

    if (songTitle && tipAmount) {
        await submitSongRequest(songTitle, tipAmount);

        // Clear input fields after submitting the form
        document.getElementById('songTitle').value = '';
        document.getElementById('tipAmount').value = '';
    }
});


// THIS IS FOR A DROP DOWN AKA 'SELECT'
function populateAvailableSongs(songs) {
    const songSelect = document.getElementById('songTitle');

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

// async IIFE (Immediately Invoked Function Expression) to call fetchAvailableSongs()
//  and populate the dropdown when the page loads:
(async function () {
    const songs = await fetchAvailableSongs();
    populateAvailableSongs(songs);
})();

fetchSongRequests();




// populateAvailableSongs();





// async function submitSongRequest(songTitle, tipAmount) {
//     const response = await fetch('/api/songs', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ songTitle, tipAmount }),
//     });

//     if (response.ok) {
//         fetchSongRequests();
//     } else {
//         console.error('Failed to submit song request');
//     }
// }



// THIS IS FOR AN INPUT BOX
// function populateAvailableSongs(songs) {
//     const songDatalist = document.getElementById('availableSongs');

//     songs.forEach((song) => {
//         const option = document.createElement('option');
//         option.value = song;
//         songDatalist.appendChild(option);
//     });
// }