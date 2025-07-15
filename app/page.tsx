"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // 验证输入
    if (!name.trim()) {
      setModalType('error');
      setModalMessage('请输入您的名字');
      setShowModal(true);
      return;
    }

    if (!text.trim()) {
      setModalType('error');
      setModalMessage('请输入投票提名');
      setShowModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 这里可以添加实际的API调用
      // const response = await fetch('/api/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, text })
      // });

      // 模拟成功/失败
      const isSuccess = Math.random() > 0.3; // 70% 成功率用于演示

      if (isSuccess) {
        setModalType('success');
        setModalMessage('提交成功！您的投票已记录。');
        setName('');
        setText('');
      } else {
        setModalType('error');
        setModalMessage('提交失败，请稍后重试。');
      }
    } catch (error) {
      setModalType('error');
      setModalMessage('网络错误，请检查连接后重试。');
    } finally {
      setIsSubmitting(false);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/706acc.svg"
          alt="706/acc logo"
          width={107.5}
          height={95}
          priority
        />

        {/* 规则描述区域 */}
        <div className="w-full max-w-md bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            🧩 投票设计
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>这个机制，本质上是一种信任图谱 + 权重扩散模型</p>
            <p>每个人都可以给其他人投票，每个人也会被其他人投票。</p>
            <p>每个人的投票权重 = 获得票数 * 激活函数（对数衰减）。</p>
            <p>最终统计每个用户获得的加权数值：即别人给他的票对方的权重。</p>
          </div>
        </div>

        {/* 输入表单区域 */}
        <div className="w-full max-w-md space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              你的名字
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入与微信昵称一致，区分大小写"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium mb-2">
              投票提名
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入与微信昵称一致，每行一个提名"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-vertical"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '提交中...' : '提交'}
          </button>
        </div>
      </main>

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              {modalType === 'success' ? (
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-center mb-2 text-gray-900 dark:text-gray-100">
              {modalType === 'success' ? '提交成功' : '提交失败'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {modalMessage}
            </p>
            <button
              onClick={closeModal}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
