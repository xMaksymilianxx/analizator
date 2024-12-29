const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a';
const apiUrl = 'https://v3.football.api-sports.io';

// Funkcja do pobierania danych o meczach dla wybranego sportu i daty
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

// Funkcja do analizy meczu
async function analyzeMatch(match) {
    const homeTeam = match.teams.home.name || 'Nieznana drużyna';
    const awayTeam = match.teams.away.name || 'Nieznana drużyna';

    // Analiza kursów bukmacherskich
    const odds = match.odds?.bookmakers?.[0]?.bets?.[0]?.values || [];
    
   let prediction= "Brak wystarczających danych"
   if(odds.length>=3){
   const homeOdds=parseFloat(odds[0].odd)
   const drawOdds=parseFloat(odds[1].odd)
   const awayOdds=parseFloat(odds[2].odd)
   
   prediction=homeOdds<awayOdds && homeOdds<drawOdds ?`Typ Wygrana ${homeTeam}` :awayOdds<homeOdds && awayOdds<drawOdds ? `Typ wygrana ${awayTeam}`:`Typ Remis`
   }

   return `
   <h3>${homeTeam} vs ${awayTeam}</h3>
   <p>${prediction}</p> 
   `
}

// Funkcja do wyświetlania wyników
async function displayResults(date) {
const matches= await fetchFixtures(date)

const resultsDiv=document.getElementById("results")
resultsDiv.innerHTML=""
matches.forEach(async match=>{
resultsDiv.innerHTML+=await analyzeMatch(match)
})
}

// Główna funkcja analizy
async function analyze() {
const date=document.getElementById("date").value

if(!date){
alert("Proszę wybrać datę")
return
}
displayResults(date)
}

// Inicjalizacja po załadowaniu strony
document.addEventListener("DOMContentLoaded",()=>{
document.getElementById("analyzeButton").addEventListener("click",analyze)
})
