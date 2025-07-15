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
      // 获取投票统计结果
      const result = await client.query(`
        SELECT 
          nominee_name,
          COUNT(*) as vote_count,
          ARRAY_AGG(voter_name ORDER BY created_at) as voters
        FROM votes
        GROUP BY nominee_name
        ORDER BY vote_count DESC, nominee_name ASC
      `);

      return NextResponse.json({
        success: true,
        results: result.rows,
        totalVotes: result.rows.reduce((sum, row) => sum + parseInt(row.vote_count), 0)
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