const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a';
const apiUrl = 'https://v3.football.api-sports.io';

// Funkcja do pobierania lig
async function fetchLeagues() {
    try {
        const response = await fetch(`${apiUrl}/leagues`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
            }
        });
        const data = await response.json();
        const leagueSelect = document.getElementById('league');
        data.response.forEach(league => {
            const option = document.createElement('option');
            option.value = league.league.id;
            option.textContent = `${league.league.name} (${league.country.name})`;
            leagueSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Błąd podczas pobierania lig:', error);
        alert('Nie udało się załadować lig.');
    }
}

// Funkcja do analizy danych
async function analyzeData() {
    const date = document.getElementById('date').value;
    const leagueId = document.getElementById('league').value;

    if (!date || !leagueId) {
        alert('Proszę wybrać datę i ligę.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/fixtures?date=${date}&league=${leagueId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
            }
        });
        const data = await response.json();
        displayResults(data.response);
        
        console.log('Analiza zakończona sukcesem.');
        
    } catch (error) {
        console.error('Błąd podczas analizy:', error);
        alert('Nie udało się przeprowadzić analizy.');
        
        // Obsługa błędów (opcjonalnie)
        alert('Spróbuj ponownie później.');
        
      }
}

// Funkcja do wyświetlania wyników
function displayResults(fixtures) {
    const resultsDiv = document.getElementById('results');
    
     resultsDiv.innerHTML="";
     
     fixtures.forEach(fixture=>{
       resultsDiv.innerHTML+=`<p>${fixture?.team_home?.name}</p>`;
     })
 }

document.addEventListener('DOMContentLoaded', () => {
   fetchLeagues();
   document.getElementById("analyzeButton").addEventListener("click",analyzeData)
});
