import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function POST(request: NextRequest) {
  try {
    const { name, text } = await request.json();

    // 验证输入
    if (!name?.trim() || !text?.trim()) {
      return NextResponse.json(
        { error: '名字和投票提名都不能为空' },
        { status: 400 }
      );
    }

    const voterName = name.trim();
    const nominees = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (nominees.length === 0) {
      return NextResponse.json(
        { error: '至少需要一个有效的投票提名' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 删除该投票者之前的所有投票记录
      await client.query(
        'DELETE FROM votes WHERE voter_name = $1',
        [voterName]
      );

      // 插入新的投票记录
      for (const nominee of nominees) {
        await client.query(
          'INSERT INTO votes (voter_name, nominee_name) VALUES ($1, $2)',
          [voterName, nominee]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: `成功提交 ${nominees.length} 个投票`,
        votes: nominees.length
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('投票提交错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}