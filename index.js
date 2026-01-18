const express = require('express');
const { scrapeJumia, scrapeKonga } = require('./scrapers');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend files from the 'public' folder
app.use(express.static('public'));

app.get('/search', async (req, res) => {
    const query = req.query.item;

    try {
        // Run both scrapers simultaneously
        const [jumiaData, kongaData] = await Promise.all([
            scrapeJumia(query),
            scrapeKonga(query)
        ]);

        // Merge the arrays into one list
        const combinedResults = [...jumiaData, ...kongaData];

        res.json({ data: combinedResults });
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});


app.listen(PORT, () => {
    console.log(`SEECW is live at http://localhost:${PORT}`);
});
