// Twój klucz API
const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a';
// Adres API
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

        if (!response.ok) {
            throw new Error(`Błąd podczas pobierania lig: ${response.status}`);
        }

        const data = await response.json();
        const leagueSelect = document.getElementById('league');

        // Dodanie lig do rozwijanego menu
        data.response.forEach(league => {
            const option = document.createElement('option');
            option.value = league.league.id;
            option.textContent = `${league.league.name} (${league.country.name})`;
            leagueSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Błąd podczas pobierania lig:', error);
        alert('Nie udało się załadować lig. Sprawdź konsolę.');
    }
}

// Funkcja do analizy danych
async function analyzeData() {
    const date = document.getElementById('date').value; // Pobranie wybranej daty
    const leagueId = document.getElementById('league').value; // Pobranie wybranej ligi

    if (!date || !leagueId) {
        alert('Proszę wybrać datę i ligę.');
        return;
    }

    try {
        // Wysłanie żądania do API-Football
        const response = await fetch(`${apiUrl}/fixtures?date=${date}&league=${leagueId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Błąd podczas analizy: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dane z API:', data);

        if (data.response && data.response.length > 0) {
            displayResults(data.response); // Wyświetlenie wyników
        } else {
            alert('Brak danych dla wybranej daty i ligi.');
            document.getElementById('results').innerHTML = '<p>Brak wyników do wyświetlenia.</p>';
        }
    } catch (error) {
        console.error('Błąd podczas analizy:', error);
        alert(`Wystąpił problem podczas analizy: ${error.message}`);
    }
}

// Funkcja do wyświetlania wyników
function displayResults(fixtures) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Wyczyszczenie poprzednich wyników

    fixtures.forEach(fixture => {
        resultsDiv.innerHTML += `
            <div>
                <h3>${fixture.teams.home.name} vs ${fixture.teams.away.name}</h3>
                <p>Data: ${new Date(fixture.fixture.date).toLocaleString()}</p>
                <p>Stadion: ${fixture.fixture.venue.name || 'Nieznany'}</p>
                <hr>
            </div>
        `;
    });
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    fetchLeagues(); // Pobranie listy lig przy ładowaniu strony
    document.getElementById("analyzeButton").addEventListener("click", analyzeData); // Obsługa kliknięcia przycisku "Przeprowadź analizę"
});
