// Reference to Realtime Database
const leaderboardRef = db.ref('leaderboard');

// Function to submit score
function submitScore() {
    if (playerName) {
        leaderboardRef.child(playerName).set({
            name: playerName,
            totalPorkFreed: totalPorkFreed,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
            console.log('Score submitted!');
            updateLeaderboard();
        })
        .catch((error) => {
            console.error('Error submitting score: ', error);
        });
    }
}

// Function to update leaderboard display
function updateLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';

    leaderboardRef.orderByChild('totalPorkFreed').limitToLast(10).once('value')
        .then((snapshot) => {
            const players = [];
            snapshot.forEach((childSnapshot) => {
                players.push(childSnapshot.val());
            });
            totalPlayers = players.length;
            updateUI();

            // Sort players by totalPorkFreed in descending order
            players.sort((a, b) => b.totalPorkFreed - a.totalPorkFreed);

            let rank = 1;
            players.forEach((player) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${rank}</td>
                    <td>${player.name}</td>
                    <td>$${player.totalPorkFreed}</td>
                `;
                leaderboardBody.appendChild(tr);
                rank++;
            });
        })
        .catch((error) => {
            console.error('Error fetching leaderboard: ', error);
        });
}

// Load leaderboard on page load
updateLeaderboard();