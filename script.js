const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a';
const apiUrl = 'https://v3.football.api-sports.io';

// Lista sportów do analizy
const sports = ['football', 'basketball', 'hockey', 'baseball'];

// Funkcja do pobierania danych o meczach dla wszystkich sportów
async function fetchAllSportsData(date) {
    const allSportsData = {};

    for (const sport of sports) {
        try {
            console.log(`Pobieranie danych dla ${sport}...`);
            const response = await fetch(`${apiUrl}/fixtures?date=${date}`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': apiKey
                }
            });

            if (!response.ok) {
                console.error(`Błąd podczas pobierania danych dla ${sport}: ${response.status}`);
                continue;
            }

            const data = await response.json();
            console.log(`Dane dla ${sport}:`, data); // Logowanie odpowiedzi API
            allSportsData[sport] = data.response || [];
        } catch (error) {
            console.error(`Błąd podczas analizy dla ${sport}:`, error);
        }
    }

    return allSportsData;
}

// Funkcja do analizy meczu
async function analyzeMatch(match) {
    const homeTeam = match.teams.home.name || 'Nieznana drużyna';
    const awayTeam = match.teams.away.name || 'Nieznana drużyna';

    // Pobierz dodatkowe dane
    const homeStats = await fetchTeamStatistics(match.teams.home.id, match.league.id, match.season);
    const awayStats = await fetchTeamStatistics(match.teams.away.id, match.league.id, match.season);
    const odds = await fetchOdds(match.fixture.id);
    const headToHead = await fetchHeadToHead(match.teams.home.id, match.teams.away.id);

    let prediction = "Brak wystarczających danych";

    if (odds.length >= 3) {
        const homeOdds = parseFloat(odds[0].odd);
        const drawOdds = parseFloat(odds[1].odd);
        const awayOdds = parseFloat(odds[2].odd);

        prediction = homeOdds < awayOdds && homeOdds < drawOdds 
            ? `Typ: Wygrana ${homeTeam} (kurs ${homeOdds})` 
            : awayOdds < homeOdds && awayOdds < drawOdds 
                ? `Typ: Wygrana ${awayTeam} (kurs ${awayOdds})` 
                : `Typ: Remis (kurs ${drawOdds})`;
    }

    return `
        <h3>${homeTeam} vs ${awayTeam}</h3>
        <p>Forma gospodarzy: ${homeStats?.form || 'Brak danych'}</p>
        <p>Forma gości: ${awayStats?.form || 'Brak danych'}</p>
        <p>Rywalizacja historyczna: ${
            headToHead.length > 0 
                ? `Ostatni mecz zakończył się wynikiem ${headToHead[0].score.fulltime.home} - ${headToHead[0].score.fulltime.away}` 
                : "Brak danych"
        }</p>
        <p>${prediction}</p>
        <hr>`;
}

// Funkcja do pobierania statystyk drużyn
async function fetchTeamStatistics(teamId, leagueId, season) {
    try {
        const response = await fetch(`${apiUrl}/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
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

// Funkcja do pobierania kursów bukmacherskich
async function fetchOdds(fixtureId) {
    try {
        const response = await fetch(`${apiUrl}/odds?fixture=${fixtureId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas pobierania kursów dla meczu (${fixtureId}): ${response.status}`);
        }

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Błąd podczas pobierania kursów:', error);
        return [];
    }
}

// Funkcja do pobierania rywalizacji historycznych
async function fetchHeadToHead(homeTeamId, awayTeamId) {
    try {
        const response = await fetch(`${apiUrl}/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas pobierania rywalizacji historycznych (${homeTeamId} vs ${awayTeamId}): ${response.status}`);
        }

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Błąd podczas pobierania rywalizacji historycznych:', error);
        return [];
    }
}

// Funkcja do wyświetlania wyników dla wszystkich sportów
function displayAllSportsResults(sportsData) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Wyczyszczenie poprzednich wyników

    for (const [sport, matches] of Object.entries(sportsData)) {
        const sportDiv = document.createElement('div');
        sportDiv.innerHTML = `<h2>${sport.toUpperCase()}</h2>`;

        if (matches.length === 0) {
            sportDiv.innerHTML += `<p>Brak danych dla tego sportu.</p>`;
        } else {
            matches.forEach(async match => {
                sportDiv.innerHTML += await analyzeMatch(match);
            });
        }

        resultsDiv.appendChild(sportDiv);
    }
}

// Główna funkcja analizy
async function analyzeAllSports() {
    const date = document.getElementById('date').value;

    if (!date) {
        alert('Proszę wybrać datę.');
        return;
    }

    try {
        // Pobranie danych dla wszystkich sportów
        const allSportsData = await fetchAllSportsData(date);

        // Wyświetlenie wyników
        displayAllSportsResults(allSportsData);

    } catch (error) {
        console.error('Błąd podczas analizy:', error);
        alert('Wystąpił problem podczas analizy danych.');
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("analyzeButton").addEventListener("click", analyzeAllSports);
});
