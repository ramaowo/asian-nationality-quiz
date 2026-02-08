# Asian Celebrity Nationality Quiz

A simple web app that tests your knowledge of Asian celebrities' nationalities.

## Features
- Fetches real data from **Wikidata** (linked to Wikipedia).
- Includes popular actors, singers, and models from:
  - South Korea, Japan, China, Taiwan, Thailand, Vietnam, Philippines, India.
- Randomized quiz format.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Fetch Data:**
   The app needs a data file to run. Run the fetch script to download the latest list of celebrities from Wikidata:
   ```bash
   node scripts/fetch-data.js
   ```
   *Note: This generates `quiz-data.json`.*

3. **Run the App:**
   Since this is a static site, you can just open `index.html` in a browser, or use a local server:
   ```bash
   npx serve .
   ```

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS.
- **Data:** Wikidata (SPARQL), Node.js (for fetching).

## License
MIT
