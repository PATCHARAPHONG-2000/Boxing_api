const express = require('express');
const cors = require('cors');
const { readdirSync } = require('fs');
const fetch = require('node-fetch');  // ใช้สำหรับเรียก API
const WebSocket = require('ws'); // เพิ่ม WebSocket
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Import routes dynamically
readdirSync('./routes').forEach((file) => {
    const route = require(`./routes/${file}`);
    app.use(`/api/${file.split('.')[0]}`, route);
    console.log(`Route: /api/${file.split('.')[0]}`);
});

// Default route
app.get('/', (req, res) => {
    res.render('home');
});

// Start Server
const PORT = process.env.PORT || 10000; // เปลี่ยนพอร์ตเป็น 10000
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

const fetchApiData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

wss.on('connection', (ws) => {
    console.log('Client connected');

    // ส่งข้อมูลไปยัง client ทุกๆ 8 วินาที
    const interval = setInterval(async () => {
        try {
            // เรียกข้อมูล API
            const dataScoreweb = await fetchApiData('http://127.0.0.1:10000/api/dataScoreRoutes');
            // const dataScoreapp = await fetchApiData('http://192.168.1.33:10000/api/dataScoreRoutes');
            const dataPersonweb = await fetchApiData('http://127.0.0.1:10000/api/sportPersonRoutes');
            // const dataPersonapp = await fetchApiData('http://192.168.1.33:10000/api/sportPersonRoutes');
            const dataMatchweb = await fetchApiData('http://127.0.0.1:10000/api/matchRoutes');
            const loginweb = await fetchApiData('http://127.0.0.1:10000/api/loginRoutes');
            // const loginapp = await fetchApiData('http://192.168.1.33:10000/api/loginRoutes');

            if (!dataScoreweb || !dataPersonweb || !dataMatchweb || !loginweb ) {
                throw new Error('One or more API responses are invalid.');
            }

            // ส่งข้อมูลทั้งหมดไปยัง client
            ws.send(JSON.stringify({
                dataScore: dataScoreweb,
                dataPerson: dataPersonweb,
                login: loginweb,
                dataMatch: dataMatchweb
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, 5000); // ทุกๆ 8 วินาที

    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});
