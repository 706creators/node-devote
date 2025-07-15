"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface VoteResult {
  nominee_name: string;
  vote_count: string;
  voters: string[];
  score: number;
  weight: number;
  received: number;
}

interface ResultsData {
  success: boolean;
  results: VoteResult[];
  totalVotes: number;
}

export default function ResultsPage() {
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'score' | 'votes'>('score');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setResultsData(data);
      } else {
        setError('加载排行榜失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return index + 1;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-yellow-600';
      case 1: return 'from-gray-300 to-gray-500';
      case 2: return 'from-amber-600 to-amber-800';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  // 根据显示模式排序结果
  const getSortedResults = () => {
    if (!resultsData?.results) return [];
    
    const results = [...resultsData.results];
    
    if (viewMode === 'score') {
      // 按score降序排列（API已经排好序了）
      return results;
    } else {
      // 按原始票数降序排列
      return results.sort((a, b) => b.received - a.received);
    }
  };

  if (isLoading) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载排行榜中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">加载失败</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={loadResults}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              重新加载
            </button>
            <Link
              href="/"
              className="block w-full py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              返回投票
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sortedResults = getSortedResults();

  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-center gap-2">
            🏆 投票排行榜
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            基于信任图谱的投票统计结果
          </p>
        </div>

        {/* 视图切换 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('score')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'score'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🧮 加权得分排行
            </button>
            <button
              onClick={() => setViewMode('votes')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'votes'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📊 基础票数排行
            </button>
          </div>
        </div>

        {/* 算法说明 */}
        {viewMode === 'score' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🧩 加权算法说明
            </h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p>• 每个用户的投票权重 = log(1 + 获得票数)</p>
              <p>• 最终得分 = Σ(投票者权重 ÷ 投票者的投票数量)</p>
              <p>• 引入权重衰减，一方面引导用户在有限的信任额度内做出更谨慎、真实的选择，
                   另一方面防止早期用户或高票者垄断影响力，让新参与者也有机会被看见 </p>
            </div>
          </div>
        )}

        {/* 统计信息 */}
        {resultsData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {resultsData.totalVotes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                总投票数
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {resultsData.results.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                被提名人数
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((resultsData.totalVotes / resultsData.results.length) * 100) / 100}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                平均票数
              </div>
            </div>
          </div>
        )}

        {/* 排行榜 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {viewMode === 'score' ? '加权得分排名' : '基础票数排名'}
            </h2>
          </div>
          
          {sortedResults.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedResults.map((result, index) => (
                <div
                  key={result.nominee_name}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    {/* 排名 */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(index)} text-white font-bold text-lg shadow-md`}>
                      {getRankIcon(index)}
                    </div>
                    
                    {/* 被提名者信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {result.nominee_name}
                        </h3>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {viewMode === 'score' ? result.score : result.received}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {viewMode === 'score' ? '加权得分' : '票数'}
                          </div>
                        </div>
                      </div>
                      
                      {/* 详细信息 */}
                      <div className="mt-2 space-y-2">
                        {viewMode === 'score' && (
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              原始票数: <span className="font-medium">{result.received}</span>
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              投票权重: <span className="font-medium">{result.weight}</span>
                            </span>
                          </div>
                        )}
                        
                        {/* 投票者列表 */}
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            投票者:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.voters.map((voter, voterIndex) => (
                              <span
                                key={voterIndex}
                                className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                              >
                                {voter}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                暂无投票数据
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                还没有人提交投票，快去投票吧！
              </p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={loadResults}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新数据
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回投票
          </Link>
        </div>
      </div>
    </div>
  );
}