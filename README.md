# Jordan Scrapes Amazon for Private Label Products

This projects attempts to search Amazon for potential private label products. It's really not great yet.

## Getting Started

Clone the repository and run `npm i`. 

If you wish to use store your database in a mongo database you will need to rename `.sample.env` to `.env` and replace the credentials with the correct ones. Then you'll need to change the `saveToDatabase` to `true`.

After that, you just need to run `npm start` and it'll scrape the categories and email the results to you. If you want to run it in ubuntu, you can simple run `npm run start:ubuntu`.

[Explanation of goals of this project](https://javascriptwebscrapingguy.com/continued-jordan-scrapes-amazon-for-private-label-potential-products/)

### Options

The following options are adjustable at the top of the `src/index.ts` file.

```
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

// This is to maybe try and limit just getting stuck in one category
const howManyDetailUrls = 5;

// Max count per starter product
const countPerStarterProduct = 100;

// Save to a database
const saveToDatabase = false;
```


### Prerequisites

Tested on Node v10.15.0 and NPM v6.4.1.

### Installing

After installing [NodeJS](https://nodejs.org/en/) you should be able to just run the following in the terminal.

```
npm i
```

### Unit Testing

`npm test`

## Built With

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Scraping library
* [NodeJS](https://nodejs.org/en/) - NodeJS

## Authors

* **Jordan Hansen** - *Initial work* - [Jordan Hansen](https://github.com/aarmora)


## License

This project is licensed under the ISC License
