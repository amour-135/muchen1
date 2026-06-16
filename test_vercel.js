async function testVercel() {
    try {
        const url = 'https://muchen1-94cr-9ta4qh6w2-amour-135s-projects.vercel.app/api/stats';
        console.log('Testing:', url);
        
        const response = await fetch(url);
        console.log('Status:', response.status);
        
        const result = await response.json();
        console.log('Success:', result.success);
        
        if (result.data) {
            console.log('Total Posts:', result.data.totalPosts);
            console.log('Categories:', result.data.categoryStats?.length);
            console.log('Sentiments:', result.data.sentimentStats?.length);
            console.log('Top Authors:', result.data.topAuthors?.length);
        }
        
        if (result.error) {
            console.error('Error:', result.error);
        }
        
    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testVercel();
