import express from 'express';
import cors from 'cors';
import convertTextGridToJSON from './utils/textGridToJSON/index.js';

const app = express();
app.use(cors());

app.post('/tgtojson', async (req, res) => {
    try {
        const json = await convertTextGridToJSON();
        // Getting only phones from the JSON
        const phones = json.data.tiers.find(tier => tier.name === 'phones').intervals.map(interval => interval.text);
        console.log(phones);
        res.status(200).json(phones);
    } catch (error) {
        res.status(500).json({ code: 500, error: 'Internal Server Error', message: error });
    }
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
