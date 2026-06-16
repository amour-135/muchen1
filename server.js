const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let databaseModule, excelReaderModule;
try {
    databaseModule = require('./utils/database');
    excelReaderModule = require('./utils/excelReader');
} catch (error) {
    console.log('Database module not available:', error.message);
}

app.get('/api/data', async (req, res) => {
    try {
        if (!databaseModule) {
            return res.status(500).json({ success: false, error: 'Database not configured' });
        }
        const { queryData } = databaseModule;
        const conditions = {};
        if (req.query.category) conditions['内容分类'] = req.query.category;
        if (req.query.author) conditions['作者'] = req.query.author;
        if (req.query.sentiment) conditions['用户情绪'] = req.query.sentiment;
        
        const data = await queryData('community_data', conditions);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        if (!databaseModule) {
            return res.status(500).json({ success: false, error: 'Database not configured' });
        }
        const { queryStats } = databaseModule;
        const stats = await queryStats('community_data');
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        if (!databaseModule) {
            return res.status(500).json({ success: false, error: 'Database not configured' });
        }
        const { queryStats } = databaseModule;
        const stats = await queryStats('community_data');
        res.json({ success: true, data: stats.categoryStats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/sentiment', async (req, res) => {
    try {
        if (!databaseModule) {
            return res.status(500).json({ success: false, error: 'Database not configured' });
        }
        const { queryStats } = databaseModule;
        const stats = await queryStats('community_data');
        res.json({ success: true, data: stats.sentimentStats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/authors', async (req, res) => {
    try {
        if (!databaseModule) {
            return res.status(500).json({ success: false, error: 'Database not configured' });
        }
        const { queryStats } = databaseModule;
        const stats = await queryStats('community_data');
        res.json({ success: true, data: stats.topAuthors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/import', async (req, res) => {
    try {
        if (!databaseModule || !excelReaderModule) {
            return res.status(500).json({ success: false, error: 'Database or Excel module not configured' });
        }
        const { readExcelFile } = excelReaderModule;
        const { createTable, insertData, queryStats } = databaseModule;
        
        console.log('Starting data import from Excel...');
        const { headers, data, originalHeaders } = readExcelFile(config.excelPath);
        
        console.log('Excel Headers:', originalHeaders);
        console.log('Total rows:', data.length);
        
        const tableName = 'community_data';
        await createTable(tableName, headers);
        await insertData(tableName, headers, data);
        
        const stats = await queryStats('community_data');
        console.log('Data import completed successfully!');
        
        res.json({ 
            success: true, 
            message: `数据导入成功！共导入 ${data.length} 条记录`,
            data: stats 
        });
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(config.server.port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${config.server.port}`);
    console.log(`Server accessible on local network at http://0.0.0.0:${config.server.port}`);
});