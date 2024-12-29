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

    // Analiza formy drużyn
    const homeForm = match.statistics?.home?.form || 'Brak danych';
    const awayForm = match.statistics?.away?.form || 'Brak danych';

    // Analiza rywalizacji historycznych i motywacji
    const rivalry = analyzeRivalry(match);
    const motivation = analyzeMotivation(match);

    // Analiza kursów bukmacherskich
    const odds = match.odds?.bookmakers?.[0]?.bets?.[0]?.values || [];
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

        prediction += `<br>Potencjalne pułapki bukmacherskie: ${detectBettingTrap(homeOdds, awayOdds)}`;
    }

    return `
        <h3>${homeTeam} vs ${awayTeam}</h3>
        <p>Forma gospodarzy: ${homeForm}</p>
        <p>Forma gości: ${awayForm}</p>
        <p>Rywalizacja historyczna: ${rivalry}</p>
        <p>Motywacja drużyn: ${motivation}</p>
        <p>${prediction}</p>
        <hr>`;
}

// Funkcja do analizy rywalizacji historycznych
function analyzeRivalry(match) {
    // Przykład: Rywalizacja na podstawie poprzednich spotkań
    if (match.headToHead && match.headToHead.length > 0) {
        const lastMatch = match.headToHead[0];
        return `Ostatni mecz zakończył się wynikiem ${lastMatch.score.fulltime.home} - ${lastMatch.score.fulltime.away}`;
    }
    return "Brak danych o rywalizacji historycznej.";
}

// Funkcja do analizy motywacji drużyn
function analyzeMotivation(match) {
    // Przykład: Motywacja na podstawie stawki meczu
    if (match.league.round.includes('Playoff') || match.league.round.includes('Final')) {
        return "Wysoka motywacja (mecz o dużą stawkę)";
    }
    return "Standardowa motywacja.";
}

// Funkcja do wykrywania pułapek bukmacherskich
function detectBettingTrap(homeOdds, awayOdds) {
    if (homeOdds < 1.5 && awayOdds > 5.0) {
        return "Wysokie ryzyko";
    }
    return "Niskie ryzyko";
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
