const { queryStats } = require('./utils/supabase');

async function test() {
    try {
        console.log('Testing queryStats...');
        const stats = await queryStats('community_data');
        console.log('Success!');
        console.log('Total:', stats.totalPosts);
        console.log('Categories:', stats.categoryStats.length);
        console.log('Sentiments:', stats.sentimentStats.length);
        console.log('Top Authors:', stats.topAuthors.length);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
