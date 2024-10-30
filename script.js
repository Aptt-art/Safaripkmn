let currentZoneIndex = 0;
let capturedCount = 0;
let score = 0;
const maxPokemons = 6;
let playerName = "Ash";
const scores = [];
let audioMuted = false;
let audioVolume = 0.5; // Valeur initiale du volume
let pokeballs = 10; // Nombre initial de Pokéballs

// Sélecteurs
const zoneElement = document.getElementById('currentZone');
const pokemonListElement = document.getElementById('pokemonList');
const capturedCountElement = document.getElementById('capturedCount');
const scoreElement = document.getElementById('score');
const pokeballCountElement = document.getElementById('pokeballCount');
const captureSound = document.getElementById('captureSound');
const victorySound = document.getElementById('victorySound');
const scoreBody = document.getElementById('scoreBody');
const playerNameElement = document.getElementById('playerName');
const resultElement = document.getElementById('result');

// Volume 
captureSound.volume = audioVolume;
victorySound.volume = audioVolume;

fetch('zones.json')
    .then(response => response.json())
    .then(data => {
        const zones = data.zones;
        const zoneNames = Object.keys(zones);

        function updatePokemonList() {
            const currentZone = zoneNames[currentZoneIndex];
            zoneElement.textContent = currentZone;
            pokeballCountElement.textContent = `Pokéballs restantes: ${pokeballs}`; // Met à jour le compteur de Pokéballs
            
            // Met à jour l'image de fond
            document.body.style.backgroundImage = zones[currentZone].background;

            pokemonListElement.innerHTML = '';

            zones[currentZone].pokemons.forEach(pokemon => {
                const pokemonItem = document.createElement('div');
                pokemonItem.className = 'pokemon-item';

                const img = document.createElement('img');
                img.src = pokemon.img;
                img.alt = pokemon.name;
                img.width = 70;

                const text = document.createElement('span');
                text.textContent = pokemon.name; // Affichage du nom du Pokémon

                pokemonItem.appendChild(img);
                pokemonItem.appendChild(text);
                pokemonItem.onclick = () => capturePokemon(pokemon.name);
                pokemonListElement.appendChild(pokemonItem);
            });
        }

        function capturePokemon(pokemon) {
            if (capturedCount < maxPokemons && pokeballs > 0) {
                pokeballs--; // Utilise une Pokéball
                pokeballCountElement.textContent = `Pokéballs restantes: ${pokeballs}`; // Met à jour le compteur de Pokéballs
                
                const currentZone = zoneNames[currentZoneIndex];
                const captureRate = zones[currentZone].captureRate; // Récupère le taux de capture de la zone
                
                // Joue le son de capture dès le clic
                if (!audioMuted) {
                    captureSound.currentTime = 0; // Réinitialiser le son à zéro pour le rejouer
                    captureSound.play();
                }

                const success = Math.random() < captureRate;

                // Durée du son de capture
                const captureDuration = captureSound.duration;

                // Démarrer la musique de victoire 1,5 seconde avant la fin de la musique de capture
                const victoryStartTime = captureDuration - 1.5;

                setTimeout(() => {
                    if (success) {
                        // Joue la musique de victoire seulement si la capture est réussie
                        if (!audioMuted) {
                            victorySound.currentTime = 0; // Réinitialiser le son de victoire
                            victorySound.play();
                        }
                        capturedCount++;
                        score += 10;
                        capturedCountElement.textContent = capturedCount;
                        scoreElement.textContent = score;
                        resultElement.textContent = `Tu as capturé ${pokemon} !`;
                        addScore(playerName, score);
                    } else {
                        resultElement.textContent = `Tu as échoué à capturer ${pokemon}.`;
                    }
                }, 5000); // Délai 5 secondes (le temps que le son de capture se passe)
            } else if (pokeballs === 0) {
                resultElement.textContent = "Tu n'as plus de Pokéballs !";
            } else {
                resultElement.textContent = "Tu as atteint le maximum de 6 Pokémons capturés !";
            }
        }

        function addScore(name, score) {
            scores.push({ name, score });
            scores.sort((a, b) => b.score - a.score);
            if (scores.length > 5) {
                scores.pop();
            }
            updateScoreBoard();
        }

        function updateScoreBoard() {
            scoreBody.innerHTML = '';
            scores.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${entry.name}</td><td>${entry.score}</td>`;
                scoreBody.appendChild(row);
            });
        }

        function resetScores() {
            scores.length = 0;
            updateScoreBoard();
            alert("Scores réinitialisés !");
        }

        function changePlayerName() {
            const newName = prompt("Entrez le nouveau nom du joueur :", playerName);
            if (newName && newName.trim()) {
                playerName = newName.trim();
                playerNameElement.textContent = `Joueur: ${playerName}`;
            }
        }

        function muteAudio() {
            audioMuted = !audioMuted;
            captureSound.muted = audioMuted;
            victorySound.muted = audioMuted;
            document.getElementById('muteButton').textContent = audioMuted ? "Réactiver le son" : "Couper le son";
        }

        function volumeUp() {
            if (audioVolume < 1) {
                audioVolume += 0.1;
                captureSound.volume = audioVolume.toFixed(1);
                victorySound.volume = audioVolume.toFixed(1);
            }
        }

        function volumeDown() {
            if (audioVolume > 0) {
                audioVolume -= 0.1;
                captureSound.volume = audioVolume.toFixed(1);
                victorySound.volume = audioVolume.toFixed(1);
            }
        }

        document.getElementById('prevZone').onclick = () => {
            currentZoneIndex = (currentZoneIndex - 1 + zoneNames.length) % zoneNames.length;
            updatePokemonList();
        };

        document.getElementById('nextZone').onclick = () => {
            currentZoneIndex = (currentZoneIndex + 1) % zoneNames.length;
            updatePokemonList();
        };

        document.getElementById('resetScores').onclick = resetScores;
        document.getElementById('changePlayer').onclick = changePlayerName;
        document.getElementById('muteButton').onclick = muteAudio;
        document.getElementById('volumeUpButton').onclick = volumeUp;
        document.getElementById('volumeDownButton').onclick = volumeDown;

        updatePokemonList();
    })
    .catch(error => console.error("Erreur lors de la récupération des zones:", error));

