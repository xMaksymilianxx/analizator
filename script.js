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
function analyzeMatch(match) {
    const homeTeam = match.teams.home.name || 'Nieznana drużyna';
    const awayTeam = match.teams.away.name || 'Nieznana drużyna';

    // Analiza dodatkowych czynników
    const weather = match.weather || 'Brak danych'; // Pogoda
    const homeForm = match.statistics?.home?.form || 'Brak danych'; // Forma gospodarzy
    const awayForm = match.statistics?.away?.form || 'Brak danych'; // Forma gości

    let prediction = "Brak wystarczających danych";

    // Analiza kursów bukmacherskich
    const odds = match.odds?.bookmakers?.[0]?.bets?.[0]?.values || [];
    if (odds.length >= 3) {
        const homeOdds = parseFloat(odds[0].odd);
        const drawOdds = parseFloat(odds[1].odd);
        const awayOdds = parseFloat(odds[2].odd);

        prediction = homeOdds < awayOdds && homeOdds < drawOdds 
            ? `Typ: Wygrana ${homeTeam} (kurs ${homeOdds})` 
            : awayOdds < homeOdds && awayOdds < drawOdds 
                ? `Typ: Wygrana ${awayTeam} (kurs ${awayOdds})` 
                : `Typ: Remis (kurs ${drawOdds})`;

        prediction += `<br>Powtarzalność trendu wykryta na podstawie kursów`;
    }

    return `
        <h3>${homeTeam} vs ${awayTeam}</h3>
        <p>Pogoda: ${weather}</p>
        <p>Forma gospodarzy: ${homeForm}</p>
        <p>Forma gości: ${awayForm}</p>
        <p>${prediction}</p>
        <hr>`;
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
            matches.forEach(match => {
                sportDiv.innerHTML += analyzeMatch(match);
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

        // Zapisanie wyników w pamięci lokalnej przeglądarki
        localStorage.setItem('lastAnalysis', JSON.stringify(allSportsData));
    } catch (error) {
        console.error('Błąd podczas analizy:', error);
        alert('Wystąpił problem podczas analizy danych.');
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("analyzeButton").addEventListener("click", analyzeAllSports);
});
