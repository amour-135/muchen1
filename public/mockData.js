const mockStats = {
    totalRecords: 420,
    categoryStats: [
        { name: '功能建议', value: 120 },
        { name: '问题反馈', value: 95 },
        { name: '使用技巧', value: 80 },
        { name: '案例分享', value: 65 },
        { name: '其他', value: 60 }
    ],
    sentimentStats: [
        { name: '积极', value: 200 },
        { name: '中性', value: 150 },
        { name: '消极', value: 70 }
    ],
    topAuthors: [
        { name: '用户A', count: 35 },
        { name: '用户B', count: 28 },
        { name: '用户C', count: 25 },
        { name: '用户D', count: 22 },
        { name: '用户E', count: 18 }
    ],
    trendData: [
        { date: '06-01', count: 50 },
        { date: '06-05', count: 65 },
        { date: '06-10', count: 80 },
        { date: '06-15', count: 95 },
        { date: '06-20', count: 110 },
        { date: '06-25', count: 125 },
        { date: '06-30', count: 140 }
    ]
};

window.mockStats = mockStats;