const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeJumia(item) {
    try {
        const url = `https://www.jumia.com.ng/catalog/?q=${item}`;
        const {
            data
        } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

        const $ = cheerio.load(data);
        const products = [];
        
        $('.prd').each((i, el) => {
            const rawPrice = $(el).find('.prc').text(); 
            
            const cleanPrice = parseInt(rawPrice.replace(/[^\d]/g, ''));

            products.push({
                title: $(el).find('.name').text(),
                price: cleanPrice,
                originalPrice: rawPrice,
                link: 'https://www.jumia.com.ng' + $(el).find('.core').attr('href'),
                image: $(el).find('.img').attr('data-src'),
                source: 'Jumia'
            });
        });

        return products;
    } catch (error) {
        console.error("Scraping failed:", error);
        return [];
    }
}

async function scrapeKonga(item) {
    try {
        const url = `https://www.konga.com/search?search=${item}`;
        const {
            data
        } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

        const $ = cheerio.load(data);
        const products = [];

        const scriptTag = $('script#__NEXT_DATA__').html();

        if (scriptTag) {
            const jsonData = JSON.parse(scriptTag);
            const resultsState = jsonData.props.initialProps.pageProps.resultsState;

            if (resultsState && resultsState.content && resultsState.content.hits) {
                resultsState.content.hits.forEach(item => {
                    const rawPrice = item.special_price || item.price;

                    products.push({
                        title: item.name,
                        price: rawPrice,
                        link: `https://www.konga.com/product/${item.url_key}`,
                        image: `https://www-konga-com-res.cloudinary.com/image/upload/f_auto,fl_lossy,dpr_auto,q_auto,w_1080/media/catalog/product${item.image_thumbnail_path}`,
                        source: 'Konga'
                    });
                });
            }
        }
        return products;
    } catch (error) {
        console.error("Konga scraping failed:", error);
        return [];
    }
}

module.exports = {
    scrapeJumia,
    scrapeKonga
};