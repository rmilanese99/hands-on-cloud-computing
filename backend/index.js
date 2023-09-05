import dotenv from 'dotenv';
import express from 'express';
import fortune from 'fortune-messages';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
        message: fortune()
    }));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
