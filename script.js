const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a';
const apiUrl = 'https://v3.football.api-sports.io';

// Funkcja do pobierania danych o meczach dla wybranego dnia
async function fetchFixtures(date) {
    try {
        const response = await fetch(`${apiUrl}/fixtures?date=${date}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas pobierania danych o meczach (${response.status}): ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Błąd podczas pobierania danych o meczach:', error);
        return [];
    }
}

// Funkcja do pobierania statystyk drużyny
async function fetchTeamStatistics(teamId, leagueId, season) {
    try {
        const response = await fetch(`${apiUrl}/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas pobierania statystyk drużyny (${teamId}): ${response.status}`);
        }

        const data = await response.json();
        return data.response || {};
    } catch (error) {
        console.error('Błąd podczas pobierania statystyk drużyny:', error);
        return {};
    }
}

// Funkcja do analizy meczu
async function analyzeMatch(match) {
    const homeTeam = match.teams.home.name || 'Nieznana drużyna';
    const awayTeam = match.teams.away.name || 'Nieznana drużyna';

    // Pobierz dodatkowe dane
    const homeStats = await fetchTeamStatistics(match.teams.home.id, match.league.id, match.league.season);
    const awayStats = await fetchTeamStatistics(match.teams.away.id, match.league.id, match.league.season);

    // Analiza danych
    let prediction = "Brak wystarczających danych";

    if (homeStats && awayStats) {
        prediction = `
            Forma gospodarzy: ${homeStats.form || "Brak danych"}<br>
            Forma gości: ${awayStats.form || "Brak danych"}<br>
            Gospodarze - Bramki zdobyte: ${homeStats.goals.for.total.total || 0}, Bramki stracone: ${homeStats.goals.against.total.total || 0}<br>
            Goście - Bramki zdobyte: ${awayStats.goals.for.total.total || 0}, Bramki stracone: ${awayStats.goals.against.total.total || 0}
        `;
    }

    return `
      <h3>${homeTeam} vs ${awayTeam}</h3>
      <p>${prediction}</p>
      <hr>
    `;
}

// Funkcja do wyświetlania wyników
async function displayResults(date) {
    const matches = await fetchFixtures(date);

    if (matches.length === 0) {
        alert('Brak dostępnych meczów dla wybranej daty.');
        return;
    }

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    for (const match of matches) {
        resultsDiv.innerHTML += await analyzeMatch(match);
    }
}

// Główna funkcja analizy
async function analyze() {
    const date = document.getElementById('date').value;

    if (!date) {
        alert('Proszę wybrać datę.');
        return;
    }

    displayResults(date);
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("analyzeButton").addEventListener("click", analyze);
});
