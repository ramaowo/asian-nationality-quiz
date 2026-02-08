const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ENDPOINT_URL = 'https://query.wikidata.org/sparql';

// Highly Optimized Query
// - Removed sitelinks sorting (expensive)
// - Simple selection of people with images and citizenship
const SPARQL_QUERY = `
SELECT ?item ?itemLabel ?image ?citizenshipLabel WHERE {
  {
    SELECT ?item WHERE {
      ?item wdt:P31 wd:Q5;                 # Human
            wdt:P106 ?occupation;          # Occupation
            wdt:P18 ?image;                # Image
            wdt:P27 ?citizenship.          # Citizenship
      
      # Filter Occupations (Actor, Singer, Model)
      VALUES ?occupation { wd:Q33999 wd:Q177220 wd:Q4610556 }
      
      # Filter Citizenships (Specific Asian countries)
      VALUES ?citizenship { wd:Q17 wd:Q884 wd:Q148 wd:Q865 wd:Q869 wd:Q881 wd:Q928 wd:Q668 }
    }
    LIMIT 200
  }
  ?item wdt:P18 ?image;
        wdt:P27 ?citizenship;
        rdfs:label ?itemLabel.
  FILTER(LANG(?itemLabel) = "en")
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`;

async function fetchData() {
    console.log("Fetching data from Wikidata (Simple)...");
    try {
        const response = await axios.get(ENDPOINT_URL, {
            params: {
                query: SPARQL_QUERY,
                format: 'json'
            },
            headers: {
                'User-Agent': 'AsianNationalityQuiz/1.0 (mailto:ramaowog@gmail.com)' // User-Agent is required by Wikidata
            },
            timeout: 30000 // 30s timeout
        });

        const rawData = response.data.results.bindings;
        console.log(`Raw results: ${rawData.length}`);

        const results = rawData.map(entry => ({
            name: entry.itemLabel.value,
            nationality: entry.citizenshipLabel ? entry.citizenshipLabel.value : "Unknown",
            image: entry.image.value
        })).filter(item => item.nationality !== "Unknown" && !item.nationality.match(/^Q\d+/)); // Filter out unmapped IDs

        // Deduplicate by name
        const uniqueResults = Array.from(new Map(results.map(item => [item.name, item])).values());

        console.log(`Processed ${uniqueResults.length} unique celebrities.`);

        const outputPath = path.join(__dirname, '..', 'quiz-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(uniqueResults, null, 2));
        console.log(`Saved data to ${outputPath}`);

    } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response) console.error("Response:", error.response.status);
    }
}

fetchData();
