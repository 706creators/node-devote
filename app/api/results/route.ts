import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // 获取所有投票记录
      const votesResult = await client.query(`
        SELECT voter_name, nominee_name
        FROM votes
        ORDER BY created_at ASC
      `);

      // 获取基础统计
      const statsResult = await client.query(`
        SELECT 
          nominee_name,
          COUNT(*) as vote_count,
          ARRAY_AGG(voter_name ORDER BY created_at) as voters
        FROM votes
        GROUP BY nominee_name
        ORDER BY vote_count DESC, nominee_name ASC
      `);

      // 计算加权得分
      const voteRecords = votesResult.rows;
      
      // 初始化数据结构
      const receivedVotes: Record<string, number> = {};
      const userToTargets: Record<string, string[]> = {};
      const allUsers = new Set<string>();

      // 统计每个人被投票数 & 每人投给谁
      voteRecords.forEach(({ voter_name, nominee_name }) => {
        receivedVotes[nominee_name] = (receivedVotes[nominee_name] || 0) + 1;
        
        if (!userToTargets[voter_name]) {
          userToTargets[voter_name] = [];
        }
        userToTargets[voter_name].push(nominee_name);
        
        allUsers.add(voter_name);
        allUsers.add(nominee_name);
      });

      // 权重函数（log 衰减）
      const getWeight = (voteCount: number): number => {
        return Math.log(1 + voteCount);
      };

      // 计算每个用户的权重
      const weights: Record<string, number> = {};
      Array.from(allUsers).forEach(user => {
        weights[user] = getWeight(receivedVotes[user] || 0);
      });

      // 计算最终加权得分
      const scores: Record<string, number> = {};
      
      Array.from(allUsers).forEach(voter => {
        const targets = userToTargets[voter] || [];
        if (targets.length === 0) return;
        
        const voterWeight = weights[voter] || 0;
        const weightPerVote = voterWeight / targets.length;
        
        targets.forEach(target => {
          scores[target] = (scores[target] || 0) + weightPerVote;
        });
      });

      // 为每个候选人添加score字段
      const resultsWithScore = statsResult.rows.map(row => ({
        ...row,
        score: Math.round((scores[row.nominee_name] || 0) * 1000) / 1000, // 保留3位小数
        weight: Math.round((weights[row.nominee_name] || 0) * 1000) / 1000, // 保留3位小数
        received: parseInt(row.vote_count)
      }));

      // 按加权得分排序
      resultsWithScore.sort((a, b) => b.score - a.score);

      return NextResponse.json({
        success: true,
        results: resultsWithScore,
        totalVotes: voteRecords.length
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('查询投票结果错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}