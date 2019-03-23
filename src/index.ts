import puppeteer, { Browser } from 'puppeteer';
import { scrapeCategoriesForProducts, getFromDetailsPage, getProductsFromResultsPage, IResultsPageData } from './scrapes';
import { categories } from './categories';

// The max amount of reviews we want any competitor to have
const competitorMaxReviews = 500;

// How many are we okay with being over competitorMaxReviews
const maxOfCompetitorMaxReviews = 3;

// What we want our minimum price to be
const minimumPrice = 25;

// How many of that minimum price will stop us from being interested in this page
const maxOfMinimumPrice = 3;

// With this to false, we'll return all pages but we'll have a count of high number of reviews and prices below minimum
const strict = true;

(async () => {
    let browser: Browser = await setUpBrowser();

    let starterProductUrls = await scrapeCategoriesForProducts(browser, categories);
    let keepers: any[] = [];

    // Going to pick a random one to start
    const randomIndex = Math.floor(Math.random() * Math.floor(starterProductUrls.length));
    let productUrls = [starterProductUrls[randomIndex]];

    for (let i = 0; i < productUrls.length; i++) {
        console.log('productUrls length and current index', productUrls.length, i, productUrls[i]);

        let detailsResults;
        try {
            detailsResults = await getFromDetailsPage(browser, productUrls[i]);
        }
        catch (e) {
            console.log('Error in getFromDetailsPage', e);
            // There aren't any details results so let's just carry on.
            continue;
        }
        productUrls = productUrls.concat(detailsResults.productUrls);

        console.log('search term', detailsResults.searchTerm);

        let results: IResultsPageData;
        try {
            results = await getProductsFromResultsPage(browser, detailsResults.searchTerm, competitorMaxReviews, minimumPrice);
        }
        catch (e) {
            console.log('error getting results, let\'s continue', e);
            continue;
        }
        console.log('results productUrls.length, lowPriceCount, exceededMaxNumberOfReviewsCount', results.productUrls.length, results.lowPriceCount, results.exceededMaxNumberOfReviewsCount);

        // Check strictness. If we're strict, we're only going to add the url to our array. Otherwise we'll add the things that contribute to factors
        if (strict && (results.lowPriceCount < maxOfMinimumPrice && results.exceededMaxNumberOfReviewsCount < maxOfCompetitorMaxReviews)) {
            keepers.push(results.url);
            console.log('added a keeper in strict mode', keepers);
        }
        else if (!strict) {
            keepers.push({ url: results.url, lowPriceCount: results.lowPriceCount, exceededMaxNumberOfReviewsCount: results.exceededMaxNumberOfReviewsCount });
            console.log('added a keeper in not strict mode', keepers);
        }
    }


})();



async function setUpBrowser() {
    let browser: Browser;
    let ubuntu = false;
    let headless = false;
    if (process.argv[2] === 'ubuntu' || process.argv[3] === 'ubuntu') {
        ubuntu = true;
    }
    if (process.argv[2] === 'headless' || process.argv[3] === 'headless') {
        headless = true;
    }
    if (ubuntu) {
        browser = await puppeteer.launch({
            headless: true, ignoreHTTPSErrors: true, args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
            ]
        });
    }
    else {
        browser = await puppeteer.launch({ headless: headless, args: [`--window-size=${1800},${1200}`] });
    }

    return Promise.resolve(browser);
}