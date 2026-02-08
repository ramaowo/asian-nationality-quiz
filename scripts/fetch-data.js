const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ENDPOINT_URL = 'https://query.wikidata.org/sparql';

// Optimized Query:
// - Removed GROUP BY/COUNT sorting (too slow)
// - Added FILTER(?sitelinks > 10) to ensure some popularity
const SPARQL_QUERY = `
SELECT DISTINCT ?item ?itemLabel ?image ?citizenshipLabel WHERE {
  ?item wdt:P31 wd:Q5;                 # Human
        wdt:P106 ?occupation;          # Occupation
        wdt:P18 ?image;                # Image
        wdt:P27 ?citizenship;          # Citizenship
        wikibase:sitelinks ?sitelinks. # Sitelinks count (property)

  # Filter Occupations (Actor, Singer, Model, Idol)
  VALUES ?occupation { wd:Q33999 wd:Q177220 wd:Q4610556 wd:Q129996 }

  # Filter Citizenships
  VALUES ?citizenship { wd:Q17 wd:Q884 wd:Q148 wd:Q865 wd:Q869 wd:Q881 wd:Q928 wd:Q668 }

  # Popularity Filter (at least 10 sitelinks)
  FILTER(?sitelinks > 10)

  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
LIMIT 150
`;

async function fetchData() {
    console.log("Fetching data from Wikidata (Optimized)...");
    try {
        const response = await axios.get(ENDPOINT_URL, {
            params: {
                query: SPARQL_QUERY,
                format: 'json'
            },
            headers: {
                'User-Agent': 'AsianNationalityQuizBot/1.0 (opensource)'
            }
        });

        const results = response.data.results.bindings.map(entry => ({
            name: entry.itemLabel.value,
            nationality: entry.citizenshipLabel.value,
            image: entry.image.value
        }));

        console.log(`Fetched ${results.length} celebrities.`);

        const outputPath = path.join(__dirname, '..', 'quiz-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(`Saved data to ${outputPath}`);

    } catch (error) {
        console.error("Error fetching data:", error.response ? error.response.data : error.message);
    }
}

fetchData();
