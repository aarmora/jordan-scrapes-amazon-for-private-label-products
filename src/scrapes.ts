import { Browser, ElementHandle } from "puppeteer";
import { getPropertyBySelector } from 'puppeteer-helpers';


export interface IResultsPageData {
    lowPriceCount: number;
    exceededMaxNumberOfReviewsCount: number;
    productUrls: string[];
    url: string;
};

export async function scrapeCategoriesForProducts(browser: Browser, categories: any[]) {
    const productUrls: string[] = [];

    for (let category of categories) {
        // Top level category page
        const categoryPage = await browser.newPage();

        await categoryPage.goto(category.url);

        // Go to each product
        const products = await categoryPage.$$('.zg-item-immersion');

        for (let product of products) {
            productUrls.push(await getPropertyBySelector(product, '.a-link-normal', 'href'));
        }

        await categoryPage.close();
    }

    return Promise.resolve(productUrls);

}

export async function getFromDetailsPage(browser: Browser, url: string) {
    const page = await browser.newPage();

    await page.goto(url);

    let title: string;
    try {
        title = await getPropertyBySelector(page, '#productTitle', 'innerHTML');
        title = title.trim();
    }
    catch (e) {
        await page.close();
        return Promise.reject(e);
    }

    let brand: string;
    try {
        brand = await getPropertyBySelector(page, '#bylineInfo', 'innerHTML');
    }
    catch (e) {
        await page.close();
        return Promise.reject(e);
    }

    // Remove the brand, split on commas and dashes
    let searchTerm: string;
    try {
        searchTerm = title.replace(brand, '').split(',')[0].split('-')[0];
    }
    catch (e) {
        await page.close();
        return Promise.reject(e);
    }
    
    const extraProductUrls: string[] = [];

    const extraProducts = await page.$$('.a-carousel-viewport li');

    for (let product of extraProducts) {
        const productUrl = await getPropertyBySelector(product, 'a', 'href');

        if (!productUrl.includes('javascript')) {
            extraProductUrls.push(productUrl);
        }
    }

    await page.close();

    return Promise.resolve({ searchTerm: searchTerm, productUrls: extraProductUrls });

}

export async function getProductsFromResultsPage(browser: Browser, searchTerm: string, competitorMaxReviews: number,
    minimumPrice: number): Promise<IResultsPageData> {
    let lowPriceCounter = 0;
    let exceededMaxNumberOfReviewsCounter = 0;
    let productUrls: string[] = [];

    const page = await browser.newPage();
    const baseUrl = `https://www.amazon.com/s?k=${searchTerm}`;
    await page.goto(baseUrl);

    const productsOnPage = await page.$$('.s-result-item');

    for (let productOnPage of productsOnPage) {

        const reviews = await getPropertyBySelector(productOnPage, '.a-size-small span.a-size-base', 'innerHTML');
        if (reviews) {
            const numberOfReviews = parseInt(reviews.replace(',', ''));

            // This page has a competitor with too many reviews. We're done here.
            // TODO: Maybe we relax this so it takes more than one product with a high number of reviews?
            if (numberOfReviews > competitorMaxReviews) {
                exceededMaxNumberOfReviewsCounter++;
            }
        }


        // Let's check prices now
        let price = await getPropertyBySelector(productOnPage, '.a-price-whole', 'innerHTML');
        if (price) {
            price = parseInt(price);

            if (price < minimumPrice) {
                lowPriceCounter++;
            }
        }
        const productUrl = await getPropertyBySelector(productOnPage, '.a-link-normal', 'href');

        productUrls.push(productUrl);
    }

    await page.close();

    return Promise.resolve({ lowPriceCount: lowPriceCounter, exceededMaxNumberOfReviewsCount: exceededMaxNumberOfReviewsCounter, productUrls: productUrls, url: baseUrl });
}

export async function searchProductsOnResultsPage(productsOnPage: ElementHandle[], competitorMaxReviews: number,
    minimumPrice: number) {

    return Promise.resolve()

}