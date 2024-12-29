const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a';
const apiUrl = 'https://v3.football.api-sports.io';

// Konfiguracja GitHub
const githubToken = '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'; // Twój Personal Access Token
const repoOwner = 'xMaksymilianxx'; // Twoja nazwa użytkownika GitHub
const repoName = 'analizator'; // Nazwa Twojego repozytorium
const branch = 'main'; // Gałąź, na której zapisywane będą pliki (domyślnie "main")

// Funkcja do pobierania danych o meczach dla wybranego dnia
async function fetchFixtures(date) {
    try {
        const response = await fetch(`${apiUrl}/fixtures?date=${date}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
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

// Funkcja do analizy meczu
async function analyzeMatch(match) {
    const homeTeam = match.teams.home.name || 'Nieznana drużyna';
    const awayTeam = match.teams.away.name || 'Nieznana drużyna';

    // Pobierz dodatkowe dane
    const homeStats = await fetchTeamStatistics(match.teams.home.id, match.league.id, match.league.season);
    const awayStats = await fetchTeamStatistics(match.teams.away.id, match.league.id, match.league.season);
    const odds = await fetchOdds(match.fixture.id);
    const headToHead = await fetchHeadToHead(match.teams.home.id, match.teams.away.id);

    // Analiza danych
    let prediction = "Brak wystarczających danych";
    
    if (odds.length >= 3 && homeStats && awayStats) {
        const homeOdds = parseFloat(odds[0].odd);
        const drawOdds = parseFloat(odds[1].odd);
        const awayOdds = parseFloat(odds[2].odd);

        prediction = homeOdds < awayOdds && homeOdds < drawOdds 
            ? `Typ: Wygrana ${homeTeam}` 
            : awayOdds < homeOdds && awayOdds < drawOdds 
                ? `Typ: Wygrana ${awayTeam}` 
                : `Typ: Remis`;
        
        prediction += `<br>Forma gospodarzy: ${homeStats.form || "Brak danych"}`;
        prediction += `<br>Forma gości: ${awayStats.form || "Brak danych"}`;
        
        if (headToHead.length > 0) {
            prediction += `<br>Ostatni wynik H2H: ${headToHead[0].teams.home.name} ${headToHead[0].goals.home} - ${headToHead[0].goals.away} ${headToHead[0].teams.away.name}`;
        }
    }

    return {
      homeTeam,
      awayTeam,
      prediction,
      league: match.league.name,
      date: match.fixture.date,
    };
}

// Funkcja do zapisywania wyników w pliku JSON i przesyłania na GitHub
async function saveAndUploadResults(results) {
    const fileContent = JSON.stringify(results, null, 2);
    
    // Zapisz wyniki lokalnie jako plik JSON
    const blob = new Blob([fileContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analiza_${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    // Prześlij wyniki na GitHub
    try {
        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/analiza_${new Date().toISOString().split("T")[0]}.json`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Dodano wyniki analizy dla ${new Date().toISOString()}`,
                content: btoa(unescape(encodeURIComponent(fileContent))),
                branch
            })
        });

        if (response.ok) {
            console.log('Wyniki zostały przesłane na GitHub.');
        } else {
            console.error('Błąd podczas przesyłania wyników na GitHub:', await response.text());
        }
    } catch (error) {
        console.error('Błąd podczas przesyłania wyników na GitHub:', error);
    }
}

// Funkcja do wyświetlania wyników i ich zapisywania
async function displayResults(date) {
    const matches = await fetchFixtures(date);

    if (matches.length === 0) {
        alert('Brak dostępnych meczów dla wybranej daty.');
        return;
    }

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    const analysisResults = [];
    
    for (const match of matches) {
        const analysis = await analyzeMatch(match);
        analysisResults.push(analysis);

        resultsDiv.innerHTML += `
          <h3>${analysis.homeTeam} vs ${analysis.awayTeam}</h3>
          <p>${analysis.prediction}</p>
          <hr>
      `;
    }

    saveAndUploadResults(analysisResults); // Zapisz wyniki i prześlij je na GitHub
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
