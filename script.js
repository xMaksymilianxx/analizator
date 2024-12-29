const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a'; // Twój klucz API
const apiUrl = 'https://v3.football.api-sports.io';

// Funkcja do pobierania danych o meczach dla wybranego dnia
async function fetchFixtures(date) {
    try {
        const response = await fetch(`${apiUrl}/fixtures?date=${date}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey // Nagłówek wymagany przez API-Football
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas pobierania danych o meczach (${response.status}): ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Błąd podczas pobierania danych o meczach:', error);
        alert('Wystąpił problem z pobieraniem danych. Sprawdź konsolę przeglądarki.');
        return [];
    }
}

// Funkcja do analizy meczu
async function analyzeMatch(match) {
    const homeTeam = match.teams.home.name || 'Nieznana drużyna';
    const awayTeam = match.teams.away.name || 'Nieznana drużyna';

    // Analiza danych
    let prediction = "Brak wystarczających danych";
    if (match.fixture && match.fixture.date) {
        prediction = `
            Data meczu: ${new Date(match.fixture.date).toLocaleString()}<br>
            Status meczu: ${match.fixture.status.long || "Nieznany"}<br>
            Gospodarze: ${homeTeam}<br>
            Goście: ${awayTeam}
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

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<p>Brak dostępnych meczów dla wybranej daty.</p>';
        return;
    }

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
