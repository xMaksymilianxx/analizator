const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a'; // Twój klucz API
const apiUrl = 'https://v3.football.api-sports.io';

// Funkcja do pobierania danych o meczach dla wybranego dnia i sportu
async function fetchFixtures(date, sport) {
    try {
        const endpoint = `${apiUrl}/fixtures?date=${date}&sport=${sport}`; // Dodano obsługę różnych sportów
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey // Nagłówek wymagany przez API-Football
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas pobierania danych (${response.status}): ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        alert('Wystąpił problem z pobieraniem danych. Sprawdź konsolę przeglądarki.');
        return [];
    }
}

// Funkcja do analizy meczu
async function analyzeMatch(match) {
    const homeTeam = match.teams?.home?.name || 'Nieznana drużyna';
    const awayTeam = match.teams?.away?.name || 'Nieznana drużyna';

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
async function displayResults(date, sport) {
    const matches = await fetchFixtures(date, sport);

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<p>Brak dostępnych meczów dla wybranej daty i sportu.</p>';
        return;
    }

    for (const match of matches) {
        resultsDiv.innerHTML += await analyzeMatch(match);
    }
}

// Główna funkcja analizy
async function analyze() {
    const date = document.getElementById('date').value;
    const sport = document.getElementById('sport').value;

    if (!date || !sport) {
        alert('Proszę wybrać datę i sport.');
        return;
    }

    displayResults(date, sport);
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("analyzeButton").addEventListener("click", analyze);
});
