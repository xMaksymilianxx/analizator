// Twój klucz API
const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a';
// Adres API
const apiUrl = 'https://v3.football.api-sports.io';

// Lista sportów do analizy
const sports = ['football', 'basketball', 'tennis', 'hockey', 'baseball'];

// Funkcja do pobierania danych dla wszystkich sportów
async function fetchAllSportsData(date) {
    const allSportsData = {};

    for (const sport of sports) {
        try {
            const response = await fetch(`${apiUrl}/fixtures?date=${date}&sport=${sport}`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': apiKey
                }
            });

            if (!response.ok) {
                console.error(`Błąd podczas pobierania danych dla ${sport}: ${response.status}`);
                allSportsData[sport] = { error: `Nie udało się pobrać danych dla ${sport}` };
                continue;
            }

            const data = await response.json();
            allSportsData[sport] = data.response;
        } catch (error) {
            console.error(`Błąd podczas analizy dla ${sport}:`, error);
            allSportsData[sport] = { error: `Wystąpił błąd podczas analizy dla ${sport}` };
        }
    }

    return allSportsData;
}

// Funkcja do wyświetlania wyników dla wszystkich sportów
function displayAllSportsResults(sportsData) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Wyczyszczenie poprzednich wyników

    for (const [sport, data] of Object.entries(sportsData)) {
        const sportDiv = document.createElement('div');
        sportDiv.innerHTML = `<h2>${sport.toUpperCase()}</h2>`;

        if (data.error) {
            sportDiv.innerHTML += `<p>${data.error}</p>`;
        } else if (data.length === 0) {
            sportDiv.innerHTML += `<p>Brak danych dla tego sportu.</p>`;
        } else {
            data.forEach(fixture => {
                sportDiv.innerHTML += `
                    <div>
                        <h3>${fixture.teams?.home?.name || 'Nieznana drużyna'} vs ${fixture.teams?.away?.name || 'Nieznana drużyna'}</h3>
                        <p>Data: ${new Date(fixture.fixture.date).toLocaleString()}</p>
                        <p>Stadion: ${fixture.fixture.venue?.name || 'Nieznany'}</p>
                        <hr>
                    </div>
                `;
            });
        }

        resultsDiv.appendChild(sportDiv);
    }
}

// Funkcja do analizy danych dla wybranej daty
async function analyzeAllSports() {
    const date = document.getElementById('date').value; // Pobranie wybranej daty

    if (!date) {
        alert('Proszę wybrać datę.');
        return;
    }

    try {
        const allSportsData = await fetchAllSportsData(date);
        displayAllSportsResults(allSportsData);
    } catch (error) {
        console.error('Błąd podczas analizy:', error);
        alert('Wystąpił problem podczas analizy danych.');
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("analyzeButton").addEventListener("click", analyzeAllSports); // Obsługa kliknięcia przycisku "Przeprowadź analizę"
});
