// Reference to Firestore
const leaderboardRef = db.collection('leaderboard');

// Function to submit score
function submitScore() {
    if (gameOver) {
        const playerNameInput = document.getElementById('playerName').value.trim();
        if (playerNameInput) {
            playerName = playerNameInput;
            leaderboardRef.add({
                name: playerName,
                score: score,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                console.log('Score submitted!');
                updateLeaderboard();
            })
            .catch((error) => {
                console.error('Error submitting score: ', error);
            });
        } else {
            alert('Please enter your name!');
        }
    } else {
        alert('Finish the game to submit your score!');
    }
}

// Function to update leaderboard display
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    leaderboardRef.orderBy('score', 'desc').limit(10).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const li = document.createElement('li');
                li.textContent = `${data.name}: ${data.score}`;
                leaderboardList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error('Error fetching leaderboard: ', error);
        });
}

// Load leaderboard on page load
updateLeaderboard();