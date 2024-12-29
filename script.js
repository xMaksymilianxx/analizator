const apiKey = 'ac0417c6e0dcfa236b146b9585892c9a';
const apiUrl = 'https://v3.football.api-sports.io';

// GitHub Configuration
const githubToken = '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'; // Your Personal Access Token
const repoOwner = 'xMaksymilianxx'; // Your GitHub username
const repoName = 'analizator'; // Your repository name
const branch = 'main'; // Branch name

// Fetch fixtures for a specific date
async function fetchFixtures(date) {
    try {
        const response = await fetch(`${apiUrl}/fixtures?date=${date}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching fixtures (${response.status}): ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return [];
    }
}

// Fetch team statistics
async function fetchTeamStatistics(teamId, leagueId, season) {
    try {
        const response = await fetch(`${apiUrl}/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching team statistics (${teamId}): ${response.status}`);
        }

        const data = await response.json();
        return data.response || {};
    } catch (error) {
        console.error('Error fetching team statistics:', error);
        return {};
    }
}

// Fetch odds for a fixture
async function fetchOdds(fixtureId) {
    try {
        const response = await fetch(`${apiUrl}/odds?fixture=${fixtureId}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching odds for fixture (${fixtureId}): ${response.status}`);
        }

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Error fetching odds:', error);
        return [];
    }
}

// Fetch head-to-head comparisons
async function fetchHeadToHead(homeTeamId, awayTeamId) {
    try {
        const response = await fetch(`${apiUrl}/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching head-to-head data (${homeTeamId} vs ${awayTeamId}): ${response.status}`);
        }

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('Error fetching head-to-head data:', error);
        return [];
    }
}

// Analyze a single match
async function analyzeMatch(match) {
    const homeTeam = match.teams.home.name || 'Unknown Team';
    const awayTeam = match.teams.away.name || 'Unknown Team';

    // Fetch additional data
    const homeStats = await fetchTeamStatistics(match.teams.home.id, match.league.id, match.league.season);
    const awayStats = await fetchTeamStatistics(match.teams.away.id, match.league.id, match.league.season);
    const odds = await fetchOdds(match.fixture.id);
    const headToHead = await fetchHeadToHead(match.teams.home.id, match.teams.away.id);

    // Analyze data
    let prediction = "Insufficient data";
    
    if (odds.length >= 3 && homeStats && awayStats) {
        const homeOdds = parseFloat(odds[0].odd);
        const drawOdds = parseFloat(odds[1].odd);
        const awayOdds = parseFloat(odds[2].odd);

        prediction = homeOdds < awayOdds && homeOdds < drawOdds 
            ? `Prediction: Win ${homeTeam}` 
            : awayOdds < homeOdds && awayOdds < drawOdds 
                ? `Prediction: Win ${awayTeam}` 
                : `Prediction: Draw`;

        prediction += `<br>Home Team Form: ${homeStats.form || "No Data"}`;
        prediction += `<br>Away Team Form: ${awayStats.form || "No Data"}`;
        
        if (headToHead.length > 0) {
            prediction += `<br>Last H2H Result: ${headToHead[0].teams.home.name} ${headToHead[0].goals.home} - ${headToHead[0].goals.away} ${headToHead[0].teams.away.name}`;
        }
    }

    return { homeTeam, awayTeam, prediction };
}

// Save results to JSON file and upload to GitHub
async function saveAndUploadResults(results) {
    const fileContent = JSON.stringify(results, null, 2);

    // Save locally as JSON file
    const blob = new Blob([fileContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analysis_${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    // Upload to GitHub
    try {
        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/analysis_${new Date().toISOString().split("T")[0]}.json`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Added analysis results for ${new Date().toISOString()}`,
                content: btoa(unescape(encodeURIComponent(fileContent))),
                branch
            })
        });

        if (response.ok) {
            console.log('Results successfully uploaded to GitHub.');
        } else {
            console.error('Error uploading results to GitHub:', await response.text());
        }
    } catch (error) {
        console.error('Error uploading results to GitHub:', error);
    }
}

// Display results and save them
async function displayResults(date) {
    const matches = await fetchFixtures(date);

    if (matches.length === 0) {
        alert('No matches available for the selected date.');
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

    saveAndUploadResults(analysisResults); // Save and upload results to GitHub
}

// Main function for analysis
async function analyze() {
    const date = document.getElementById('date').value;

    if (!date) {
        alert('Please select a date.');
        return;
    }

    displayResults(date);
}

// Initialize event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("analyzeButton").addEventListener("click", analyze);
});
