const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let databaseModule, excelReaderModule;
let lastExcelModifiedTime = 0;
let isSyncing = false;

try {
    if (config.dbType === 'supabase') {
        databaseModule = require('./utils/supabase');
    } else {
        databaseModule = require('./utils/database');
    }
    excelReaderModule = require('./utils/excelReader');
} catch (error) {
    console.log('Module loading error:', error.message);
}

async function syncFromExcel() {
    if (isSyncing) {
        console.log('Sync already in progress, skipping...');
        return;
    }
    
    if (!databaseModule || !excelReaderModule) {
        console.log('Database or Excel module not configured, skipping sync');
        return;
    }
    
    isSyncing = true;
    try {
        console.log('\n=== Auto Sync Triggered ===');
        
        const { readExcelFile } = excelReaderModule;
        const { getClient, insertData, queryStats } = databaseModule;
        
        const { headers, data } = readExcelFile(config.excelPath);
        console.log(`Read ${data.length} rows from Excel`);
        
        const sb = getClient();
        const { error: deleteError } = await sb.from('community_data').delete().neq('id', 0);
        if (deleteError) {
            console.error('Error deleting old data:', deleteError);
            throw deleteError;
        }
        console.log('Old data cleared');
        
        await insertData('community_data', headers, data);
        
        const stats = await queryStats('community_data');
        console.log(`Sync completed! Total: ${stats.totalPosts} posts, ${stats.categoryStats.length} categories, ${stats.sentimentStats.length} sentiments`);
        
    } catch (error) {
        console.error('Auto sync failed:', error.message);
    } finally {
        isSyncing = false;
    }
}

function startFileWatcher() {
    if (!excelReaderModule) {
        console.log('Excel module not available, skipping file watcher');
        return;
    }
    
    const excelFilePath = path.resolve(config.excelPath);
    
    if (!fs.existsSync(excelFilePath)) {
        console.log(`Excel file not found: ${excelFilePath}`);
        return;
    }
    
    try {
        const stat = fs.statSync(excelFilePath);
        lastExcelModifiedTime = stat.mtime.getTime();
        console.log(`Watching Excel file: ${excelFilePath}`);
        console.log(`Initial modified time: ${new Date(lastExcelModifiedTime).toLocaleString()}`);
    } catch (error) {
        console.error('Error getting file stats:', error);
        return;
    }
    
    fs.watch(excelFilePath, (eventType, filename) => {
        if (eventType === 'change') {
            console.log(`\nExcel file changed: ${filename}`);
            
            fs.stat(excelFilePath, (err, stat) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }
                
                const newModifiedTime = stat.mtime.getTime();
                if (newModifiedTime > lastExcelModifiedTime) {
                    lastExcelModifiedTime = newModifiedTime;
                    console.log(`File modification detected at: ${new Date(newModifiedTime).toLocaleString()}`);
                    
                    setTimeout(() => {
                        syncFromExcel();
                    }, 2000);
                }
            });
        }
    });
    
    setInterval(() => {
        fs.stat(excelFilePath, (err, stat) => {
            if (err) return;
            
            const newModifiedTime = stat.mtime.getTime();
            if (newModifiedTime > lastExcelModifiedTime) {
                lastExcelModifiedTime = newModifiedTime;
                console.log(`Periodic check: File modified, triggering sync...`);
                syncFromExcel();
            }
        });
    }, 60000);
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
        if (!databaseModule) {
            return res.status(500).json({ success: false, error: 'Database not configured' });
        }
        
        if (!excelReaderModule) {
            return res.status(500).json({ 
                success: false, 
                error: 'Excel module not available. This feature is only available when running locally.' 
            });
        }
        
        const { readExcelFile } = excelReaderModule;
        const { getClient, insertData, queryStats } = databaseModule;
        
        console.log('Starting data import from Excel...');
        const { headers, data, originalHeaders } = readExcelFile(config.excelPath);
        
        console.log('Excel Headers:', originalHeaders);
        console.log('Total rows:', data.length);
        
        const sb = getClient();
        const { error: deleteError } = await sb.from('community_data').delete().neq('id', 0);
        if (deleteError) {
            console.error('Error deleting old data:', deleteError);
            throw deleteError;
        }
        
        await insertData('community_data', headers, data);
        
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

app.get('/api/sync-status', (req, res) => {
    res.json({
        success: true,
        data: {
            isSyncing,
            lastModifiedTime: new Date(lastExcelModifiedTime).toLocaleString(),
            excelPath: config.excelPath,
            environment: process.env.VERCEL ? 'Vercel Serverless' : 'Local'
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
    app.listen(config.server.port, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${config.server.port}`);
        console.log(`Server accessible on local network at http://0.0.0.0:${config.server.port}`);
        
        if (config.dbType === 'supabase' && !process.env.VERCEL) {
            startFileWatcher();
        }
    });
}

module.exports = app;
