import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { emotionAPI } from '../services/apiService';

const Calendar = ({ onDateSelect, emotionRecords, currentUser, onMonthChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthlyEmotions, setMonthlyEmotions] = useState({});

    const emotions = [
        { id: 'happy', name: '행복', emoji: '😊', color: '#FFD93D' },
        { id: 'sad', name: '우울', emoji: '😢', color: '#4DABF7' },
        { id: 'angry', name: '화남', emoji: '😠', color: '#FF6B6B' },
        { id: 'lonely', name: '외로움', emoji: '😔', color: '#9775FA' },
        { id: 'excited', name: '신남', emoji: '🤗', color: '#51CF66' },
        { id: 'anxious', name: '불안', emoji: '😰', color: '#FFA8A8' },
        { id: 'calm', name: '평온', emoji: '😌', color: '#74C0FC' },
        { id: 'grateful', name: '감사', emoji: '🙏', color: '#FFB366' },
    ];

    // 현재 월의 첫 번째 날과 마지막 날 구하기
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // 캘린더 시작일 (이전 월의 날짜 포함)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    // 캘린더 종료일 (다음 월의 날짜 포함)
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

    // 캘린더에 표시할 모든 날짜 생성
    const calendarDays = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        calendarDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    // 월별 캘린더 데이터 로드
    useEffect(() => {
        const loadMonthlyData = async () => {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const data = await emotionAPI.getCalendarData(year, month);
                setMonthlyEmotions(data.emotions || {});
            } catch (error) {
                console.error('월별 데이터 로드 실패:', error);
                // API 실패 시 emotionRecords 사용
                setMonthlyEmotions({});
            }
        };

        if (currentUser) {
            loadMonthlyData();
        }
    }, [currentDate, currentUser]);

    // 이전/다음 월로 이동
    const goToPreviousMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        setCurrentDate(newDate);
        if (onMonthChange) {
            onMonthChange(newDate);
        }
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        setCurrentDate(newDate);
        if (onMonthChange) {
            onMonthChange(newDate);
        }
    };

    // 날짜 포맷팅
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // 해당 날짜의 감정 기록 가져오기
    const getEmotionForDate = (date) => {
        const dateString = formatDate(date);
        const day = date.getDate().toString();

        // 먼저 monthlyEmotions에서 찾고, 없으면 emotionRecords에서 찾기
        return monthlyEmotions[day] || emotionRecords[dateString];
    };

    // 감정에 따른 이모지와 색상 가져오기
    const getEmotionDisplay = (emotionId) => {
        const emotion = emotions.find((e) => e.id === emotionId);
        return emotion || { emoji: '', color: '#f0f0f0' };
    };

    const today = new Date();
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="user-info">
                    <h2>
                        {currentUser && currentUser.username
                            ? `${currentUser.username}님의 감정 캘린더`
                            : '감정 캘린더'}
                    </h2>
                </div>

                <div className="month-navigation">
                    <button onClick={goToPreviousMonth} className="nav-button">
                        &#8249;
                    </button>
                    <h3>
                        {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
                    </h3>
                    <button onClick={goToNextMonth} className="nav-button">
                        &#8250;
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                <div className="calendar-weekdays">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                        <div key={day} className="weekday">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="calendar-days">
                    {calendarDays.map((date) => {
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const isToday = date.toDateString() === today.toDateString();
                        const emotionRecord = getEmotionForDate(date);
                        const emotionDisplay = emotionRecord ? getEmotionDisplay(emotionRecord.emotion) : null;

                        return (
                            <div
                                key={date.toISOString()}
                                className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${
                                    isToday ? 'today' : ''
                                }`}
                                onClick={() => isCurrentMonth && onDateSelect(date)}
                                style={{
                                    backgroundColor: emotionDisplay ? emotionDisplay.color + '30' : undefined,
                                }}
                            >
                                <span className="day-number">{date.getDate()}</span>
                                {emotionDisplay && (
                                    <div className="emotion-indicator">
                                        <span className="emotion-emoji">{emotionDisplay.emoji}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="emotion-legend">
                <h4>감정 범례</h4>
                <div className="emotion-list">
                    {emotions.map((emotion) => (
                        <div key={emotion.id} className="emotion-item">
                            <span className="emotion-emoji">{emotion.emoji}</span>
                            <span className="emotion-name">{emotion.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
