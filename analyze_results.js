const fs = require('fs');
const path = require('path');

function analyzeResults() {
    const resultsFilePath = path.join(__dirname, 'analysis_results.json');
    const realResultsFilePath = path.join(__dirname, 'real_results.json'); // Rzeczywiste wyniki meczów

    if (!fs.existsSync(resultsFilePath) || !fs.existsSync(realResultsFilePath)) {
        console.error('Brak danych do analizy.');
        return;
    }

    const predictedResults = JSON.parse(fs.readFileSync(resultsFilePath, 'utf-8'));
    const realResults = JSON.parse(fs.readFileSync(realResultsFilePath, 'utf-8'));

    let correctPredictions = 0;
    let totalPredictions = predictedResults.length;

    predictedResults.forEach(prediction => {
        const realMatch = realResults.find(match => match.id === prediction.id);
        if (realMatch && prediction.predictedWinner === realMatch.actualWinner) {
            correctPredictions++;
        }
    });

    console.log(`Poprawne przewidywania: ${correctPredictions}/${totalPredictions}`);
    
    // Generowanie nowych reguł na podstawie błędnych przewidywań
    if (correctPredictions / totalPredictions < 0.7) {
        console.log('Algorytm wymaga poprawy.');
        const improvements = generateImprovements(predictedResults, realResults);
        fs.writeFileSync(path.join(__dirname, 'improvements.json'), JSON.stringify(improvements, null, 2));
    }
}

function generateImprovements(predictedResults, realResults) {
    // Przykładowa logika generowania poprawek do algorytmu
    return predictedResults.map(prediction => {
        const realMatch = realResults.find(match => match.id === prediction.id);
        if (realMatch && prediction.predictedWinner !== realMatch.actualWinner) {
            return {
                matchId: prediction.id,
                suggestedChange: `Zmień strategię dla meczu ${prediction.homeTeam} vs ${prediction.awayTeam}`
            };
        }
        return null;
    }).filter(Boolean);
}

analyzeResults();
