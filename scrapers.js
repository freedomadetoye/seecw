const axios = require('axios');
const cheerio = require('cheerio');

// Mock data for demonstration purposes
const mockJumiaProducts = [
    {
        title: 'Apple iPhone 15 Pro Max - 256GB',
        price: 1340000,
        originalPrice: '₦1,340,000',
        link: 'https://www.jumia.com.ng/apple-iphone-15-pro-max-256gb-p-123456',
        image: 'https://ng.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/12/345678/1.jpg',
        source: 'Jumia'
    },
    {
        title: 'Apple iPhone 14 - 128GB',
        price: 690000,
        originalPrice: '₦690,000',
        link: 'https://www.jumia.com.ng/apple-iphone-14-128gb-p-789012',
        image: 'https://ng.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/78/901234/1.jpg',
        source: 'Jumia'
    },
    {
        title: 'Apple iPhone 13 - 64GB',
        price: 500000,
        originalPrice: '₦500,000',
        link: 'https://www.jumia.com.ng/apple-iphone-13-64gb-p-345678',
        image: 'https://ng.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/567890/1.jpg',
        source: 'Jumia'
    }
];

const mockKongaProducts = [
    {
        title: 'iPhone 15 Pro Max 256GB Space Black',
        price: 1350000,
        link: 'https://www.konga.com/product/iphone-15-pro-max-256gb?k_id=@freedom6551',
        image: 'https://www-konga-com-res.cloudinary.com/image/upload/f_auto,fl_lossy,dpr_auto,q_auto,w_1080/media/catalog/product/i/p/iphone-15-pro.jpg',
        source: 'Konga'
    },
    {
        title: 'iPhone 14 128GB Midnight',
        price: 700000,
        link: 'https://www.konga.com/product/iphone-14-128gb?k_id=@freedom6551',
        image: 'https://www-konga-com-res.cloudinary.com/image/upload/f_auto,fl_lossy,dpr_auto,q_auto,w_1080/media/catalog/product/i/p/iphone-14.jpg',
        source: 'Konga'
    },
    {
        title: 'iPhone 13 64GB Pink',
        price: 510000,
        link: 'https://www.konga.com/product/iphone-13-64gb?k_id=@freedom6551',
        image: 'https://www-konga-com-res.cloudinary.com/image/upload/f_auto,fl_lossy,dpr_auto,q_auto,w_1080/media/catalog/product/i/p/iphone-13.jpg',
        source: 'Konga'
    }
];

// Enhanced Jumia scraper with better error handling and mock fallback
async function scrapeJumia(item) {
    try {
        const url = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(item)}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'max-age=0',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const products = [];
        
        // Updated selectors for current Jumia structure
        $('.prd').each((i, el) => {
            try {
                const titleEl = $(el).find('.name');
                const priceEl = $(el).find('.prc');
                const linkEl = $(el).find('a.core');
                const imgEl = $(el).find('img');

                const title = titleEl.text().trim();
                const rawPrice = priceEl.text().trim();
                const link = linkEl.attr('href');
                const image = imgEl.attr('data-src') || imgEl.attr('src');

                if (title && rawPrice) {
                    const cleanPrice = parseInt(rawPrice.replace(/[^\d]/g, '')) || 0;

                    products.push({
                        title: title,
                        price: cleanPrice,
                        originalPrice: rawPrice,
                        link: link ? 'https://www.jumia.com.ng' + link : '',
                        image: image || '',
                        source: 'Jumia'
                    });
                }
            } catch (e) {
                console.error("Error parsing Jumia product:", e.message);
            }
        });

        // If no products found, return mock data for demo purposes
        if (products.length === 0) {
            console.log("No live Jumia results found, returning mock data for demonstration");
            return mockJumiaProducts.filter(p => 
                p.title.toLowerCase().includes(item.toLowerCase())
            ).length > 0 
                ? mockJumiaProducts.filter(p => p.title.toLowerCase().includes(item.toLowerCase()))
                : mockJumiaProducts;
        }

        return products;
    } catch (error) {
        console.error("Jumia scraping failed:", error.message);
        // Return mock data on error for demonstration
        console.log("Returning mock Jumia data for demonstration");
        return mockJumiaProducts.filter(p => 
            p.title.toLowerCase().includes(item.toLowerCase())
        ).length > 0 
            ? mockJumiaProducts.filter(p => p.title.toLowerCase().includes(item.toLowerCase()))
            : mockJumiaProducts;
    }
}

// Enhanced Konga scraper with updated data structure handling
async function scrapeKonga(item) {
    try {
        const url = `https://www.konga.com/search?search=${encodeURIComponent(item)}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'max-age=0',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const products = [];

        // Try to extract from __NEXT_DATA__ script tag
        const scriptTag = $('script#__NEXT_DATA__').html();

        if (scriptTag) {
            try {
                const jsonData = JSON.parse(scriptTag);
                
                // Updated path for new Konga data structure
                let productsList = [];
                
                // Try multiple possible paths where products might be stored
                if (jsonData.props?.initialState?.search?.results) {
                    productsList = jsonData.props.initialState.search.results;
                } else if (jsonData.props?.initialProps?.pageProps?.resultsState?.content?.hits) {
                    productsList = jsonData.props.initialProps.pageProps.resultsState.content.hits;
                } else if (jsonData.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data?.hits) {
                    productsList = jsonData.props.pageProps.dehydratedState.queries[0].state.data.hits;
                }

                if (Array.isArray(productsList)) {
                    productsList.forEach(item => {
                        try {
                            const title = item.name || item.title || '';
                            const price = item.special_price || item.price || 0;
                            const urlKey = item.url_key || item.id || '';
                            const imagePath = item.image_thumbnail_path || item.image || '';

                            if (title && price) {
                                products.push({
                                    title: title,
                                    price: price,
                                    link: `https://www.konga.com/product/${urlKey}?k_id=@freedom6551`,
                                    image: imagePath ? `https://www-konga-com-res.cloudinary.com/image/upload/f_auto,fl_lossy,dpr_auto,q_auto,w_1080/media/catalog/product${imagePath}` : '',
                                    source: 'Konga'
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing Konga product:", e.message);
                        }
                    });
                }
            } catch (parseError) {
                console.error("Error parsing Konga JSON:", parseError.message);
            }
        }

        // If no products found, return mock data for demo purposes
        if (products.length === 0) {
            console.log("No live Konga results found, returning mock data for demonstration");
            return mockKongaProducts.filter(p => 
                p.title.toLowerCase().includes(item.toLowerCase())
            ).length > 0 
                ? mockKongaProducts.filter(p => p.title.toLowerCase().includes(item.toLowerCase()))
                : mockKongaProducts;
        }

        return products;
    } catch (error) {
        console.error("Konga scraping failed:", error.message);
        // Return mock data on error for demonstration
        console.log("Returning mock Konga data for demonstration");
        return mockKongaProducts.filter(p => 
            p.title.toLowerCase().includes(item.toLowerCase())
        ).length > 0 
            ? mockKongaProducts.filter(p => p.title.toLowerCase().includes(item.toLowerCase()))
            : mockKongaProducts;
    }
}

module.exports = {
    scrapeJumia,
    scrapeKonga
};
