import React, { useState, useEffect } from 'react';

const Countdown = ({ expireDate }) => {
  const [daysDiff, setDaysDiff] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // 解析日期字符串 (格式: YYYYMMDD)
  const parseDate = (dateStr) => {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // 月份从0开始
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  };

  // 计算天数差
  const calculateDaysDiff = (expire) => {
    // 获取当前日期并格式化为 YYYYMMDD 字符串
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1
    const day = String(now.getDate()).padStart(2, '0');
    const currentDateStr = `${year}${month}${day}`;

    const currentDateObj = parseDate(currentDateStr);
    const expireDateObj = parseDate(expire);

    // 计算时间差（毫秒）
    const timeDiff = expireDateObj.getTime() - currentDateObj.getTime();

    // 转换为天数
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const diff = calculateDaysDiff(expireDate);
      setDaysDiff(diff);
      setIsExpired(diff <= 0);
    };

    // 初始计算
    updateCountdown();

    // 每天更新一次（可选：如果需要实时更新）
    const interval = setInterval(updateCountdown, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [expireDate]);

  const displayText = isExpired ? '可以观看了' : `倒计时: ${daysDiff} 天`;
  const badgeClass = isExpired ? 'normal' : (daysDiff <= 7 ? 'red' : 'orange');

  return (
    <span 
      className={`countdown-badge ${badgeClass}`}
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'white',
        backgroundColor: badgeClass === 'red' ? 'var(--sl-color-red)' : 
                        badgeClass === 'orange' ? 'var(--sl-color-orange)' : 
                        'var(--sl-color-green)'
      }}
    >
      {displayText}
    </span>
  );
};

export default Countdown;
