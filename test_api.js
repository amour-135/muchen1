const { queryStats } = require('./utils/supabase');

async function test() {
    try {
        console.log('=== Testing API ===\n');
        
        const stats = await queryStats('community_data');
        console.log('Total Posts:', stats.totalPosts);
        console.log('Total Views:', stats.totalViews);
        console.log('Category Stats:', stats.categoryStats.length);
        console.log('Sentiment Stats:', stats.sentimentStats.length);
        console.log('Top Authors:', stats.topAuthors.length);
        console.log('Trend Data:', stats.trendData.length);
        
        console.log('\nSentiment Distribution:');
        stats.sentimentStats.forEach(item => {
            console.log(`  ${item['用户情绪']}: ${item.count}`);
        });
        
        console.log('\nCategory Distribution:');
        stats.categoryStats.forEach(item => {
            console.log(`  ${item['内容分类']}: ${item.count}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();
