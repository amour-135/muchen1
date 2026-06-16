module.exports = {
    excelPath: process.env.EXCEL_PATH || "C:\\Users\\Lenovo\\Desktop\\内训\\影刀社区数据.xlsx",
    mysql: {
        host: process.env.MYSQL_HOST || "localhost",
        port: parseInt(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "!@#123QWEasd",
        database: process.env.MYSQL_DATABASE || "yingdao_community"
    },
    supabase: {
        url: process.env.SUPABASE_URL || "https://nufczinldozwykzgfxia.supabase.co",
        key: process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZmN6aW5sZG96d3lremdmeGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTIxNjcyMSwiZXhwIjoyMDk2NzkyNzIxfQ.q87J7Vpo1TWvU8P4-9QW-8uTuKyWSSEhflk5xE0rPGo"
    },
    server: {
        port: parseInt(process.env.PORT) || 3000
    },
    dbType: process.env.DB_TYPE || "supabase"
};