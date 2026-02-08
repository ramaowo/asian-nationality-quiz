class WikiFetcher {
    constructor() {
        this.baseUrl = "https://en.wikipedia.org/w/api.php";
        this.categories = {
            "South Korea": [
                "Category:South Korean male film actors",
                "Category:South Korean female film actors",
                "Category:South Korean idols",
                "Category:South Korean singers",
                "Category:South Korean male television actors",
                "Category:South Korean female television actors"
            ],
            "Japan": [
                "Category:Japanese male film actors",
                "Category:Japanese female film actors",
                "Category:Japanese idols",
                "Category:Japanese models"
            ],
            "China": [
                "Category:Chinese male film actors",
                "Category:Chinese female film actors",
                "Category:Chinese singers",
                "Category:Chinese film actors"
            ],
            "Taiwan": [
                "Category:Taiwanese male film actors",
                "Category:Taiwanese female film actors",
                "Category:Taiwanese singers"
            ],
            "Thailand": [
                "Category:Thai male film actors",
                "Category:Thai female film actors",
                "Category:Thai television actors"
            ],
            "Philippines": [
                "Category:Filipino male film actors",
                "Category:Filipino film actresses",
                "Category:Filipino models"
            ],
            "India": [
                "Category:Indian male film actors",
                "Category:Indian female film actors",
                "Category:Bollywood actors"
            ],
            "Vietnam": [
                "Category:Vietnamese male actors",
                "Category:Vietnamese actresses",
                "Category:Vietnamese singers"
            ]
        };
    }

    async fetchRandomCelebrity(retryCount = 0) {
        if (retryCount > 5) {
            console.error("Too many retries fetching celebrity.");
            return null;
        }

        try {
            const nationalities = Object.keys(this.categories);
            const randomNationality = nationalities[Math.floor(Math.random() * nationalities.length)];
            const categoriesForNationality = this.categories[randomNationality];
            const randomCategory = categoriesForNationality[Math.floor(Math.random() * categoriesForNationality.length)];

            console.log(`Fetching from: ${randomCategory}`);
            const pages = await this._fetchPagesFromCategory(randomCategory);
            
            if (!pages || pages.length === 0) {
                console.warn(`Category "${randomCategory}" empty. Retrying...`);
                return this.fetchRandomCelebrity(retryCount + 1);
            }

            // Pick a random page from the list
            const randomPageMeta = pages[Math.floor(Math.random() * pages.length)];
            const details = await this._fetchPageDetails(randomPageMeta.title);

            // Must have an image to be playable
            if (!details || !details.thumbnail) {
                console.warn(`No image for "${randomPageMeta.title}". Retrying...`);
                return this.fetchRandomCelebrity(retryCount + 1);
            }

            return {
                name: details.title,
                nationality: randomNationality,
                image: details.thumbnail.source,
                summary: details.extract
            };

        } catch (error) {
            console.error("Error in fetchRandomCelebrity:", error);
            return null;
        }
    }

    async _fetchPagesFromCategory(categoryTitle) {
        const params = new URLSearchParams({
            action: "query",
            format: "json",
            list: "categorymembers",
            cmtitle: categoryTitle,
            cmlimit: "100", 
            cmtype: "page",
            origin: "*"
        });

        try {
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            return data.query ? data.query.categorymembers : null;
        } catch(e) { return null; }
    }

    async _fetchPageDetails(pageTitle) {
        const params = new URLSearchParams({
            action: "query",
            format: "json",
            prop: "pageimages|extracts",
            titles: pageTitle,
            pithumbsize: "500",
            piprop: "thumbnail",
            exintro: "true",
            explaintext: "true",
            redirects: "1",
            origin: "*"
        });

        try {
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            if (data.query && data.query.pages) {
                const pageId = Object.keys(data.query.pages)[0];
                return pageId === "-1" ? null : data.query.pages[pageId];
            }
            return null;
        } catch(e) { return null; }
    }
}
