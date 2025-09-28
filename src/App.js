// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Calendar from './components/Calendar';
import EmotionModal from './components/EmotionModal';
import { authAPI, emotionAPI, tokenUtils, testConnection } from './services/apiService';

function App() {
    const [currentView, setCurrentView] = useState('login');
    const [currentUser, setCurrentUser] = useState(null);
    const [emotionRecords, setEmotionRecords] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const init = async () => {
            const url = new URL(window.location.href);
            const access = url.searchParams.get('access');
            const refresh = url.searchParams.get('refresh');
            const userId = url.searchParams.get('user_id');

            if (access && refresh) {
                localStorage.setItem('access', access);
                localStorage.setItem('refresh', refresh);
                localStorage.setItem('user_id', userId);

                const user = { id: Number(userId), username: `kakao_${userId}` };
                localStorage.setItem('currentUser', JSON.stringify(user));
                setCurrentUser(user);

                url.searchParams.delete('access');
                url.searchParams.delete('refresh');
                url.searchParams.delete('user_id');
                window.history.replaceState({}, '', url.toString());

                setCurrentView('calendar');
                await loadEmotionRecords();
                return;
            }

            try {
                const ok = await testConnection();
                if (!ok) {
                    authAPI.logout();
                    localStorage.removeItem('currentUser');
                    setCurrentUser(null);
                    setCurrentView('login');
                    return;
                }
            } catch {
                authAPI.logout();
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
                setCurrentView('login');
                return;
            }

            if (tokenUtils.isAuthenticated()) {
                const saved = localStorage.getItem('currentUser');
                if (saved) {
                    try {
                        const user = JSON.parse(saved);
                        if (user && user.username) {
                            setCurrentUser(user);
                            setCurrentView('calendar');
                            await loadEmotionRecords();
                            return;
                        }
                    } catch {}
                }
                authAPI.logout();
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
                setCurrentView('login');
            } else {
                setCurrentUser(null);
                setCurrentView('login');
            }
        };

        init();
    }, []);

    const loadEmotionRecords = async () => {
        try {
            const emotions = await emotionAPI.getEmotions();
            const map = {};
            emotions.forEach((e) => {
                map[e.date] = e;
            });
            setEmotionRecords(map);
        } catch (err) {
            console.error('감정 기록 로드 실패:', err);
        }
    };

    const handleSignUp = async (userData) => {
        try {
            await authAPI.register(userData);
            alert(`환영합니다, ${userData.username}님! 회원가입이 완료되었습니다. 로그인해주세요.`);
            setCurrentView('login');
        } catch (error) {
            console.error('회원가입 실패:', error);
            const msg = error.message?.includes('{')
                ? '회원가입에 실패했습니다. 입력 정보를 확인해주세요.'
                : error.message || '회원가입에 실패했습니다.';
            alert(msg);
        }
    };

    const handleLogin = async (loginData) => {
        try {
            const res = await authAPI.login(loginData);
            if (!res || !res.access) throw new Error('서버에서 유효하지 않은 응답을 받았습니다.');

            const user = { id: res.user_id ?? null, username: loginData.username };
            localStorage.setItem('currentUser', JSON.stringify(user));
            setCurrentUser(user);
            setCurrentView('calendar');
            await loadEmotionRecords();
            alert(`환영합니다, ${user.username}님!`);
        } catch (error) {
            console.error('로그인 실패:', error);
            setCurrentUser(null);
            setCurrentView('login');
            localStorage.removeItem('currentUser');

            if (
                String(error.message).includes('fetch') ||
                String(error.message).includes('서버에 연결할 수 없습니다')
            ) {
                alert('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            } else if (String(error.message).includes('400')) {
                alert('아이디 또는 비밀번호가 올바르지 않습니다.');
            } else {
                alert(`로그인에 실패했습니다: ${error.message}`);
            }
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setEmotionRecords({});
        setCurrentView('login');
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    // ✅ sports까지 저장하도록 수정
    const handleSaveEmotion = async (record) => {
        try {
            const dateKey = record.date.toISOString().split('T')[0];
            const payload = {
                date: dateKey,
                emotion: record.emotion,
                memo: record.comment || record.memo || '',
                sports: record.sports || null, // 운동 번호 포함
            };
            const saved = await emotionAPI.saveEmotion(payload);
            setEmotionRecords((prev) => ({ ...prev, [dateKey]: saved }));
            alert('감정 기록이 저장되었습니다!');
        } catch (error) {
            console.error('감정 기록 저장 실패:', error);
            alert('감정 기록 저장에 실패했습니다.');
        }
    };

    const getExistingRecord = () => {
        if (!selectedDate) return null;
        const key = selectedDate.toISOString().split('T')[0];
        return emotionRecords[key] || null;
    };

    return (
        <div className="App">
            {currentView === 'login' && (
                <Login onLogin={handleLogin} onSwitchToSignUp={() => setCurrentView('signup')} />
            )}

            {currentView === 'signup' && (
                <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setCurrentView('login')} />
            )}

            {currentView === 'calendar' && (
                <div className="calendar-view">
                    <div className="app-header">
                        <h1>감정 캘린더</h1>
                        <button onClick={handleLogout} className="logout-button">
                            로그아웃
                        </button>
                    </div>

                    <Calendar
                        onDateSelect={handleDateSelect}
                        emotionRecords={emotionRecords}
                        currentUser={currentUser}
                    />

                    <EmotionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveEmotion}
                        selectedDate={selectedDate}
                        existingRecord={getExistingRecord()}
                    />
                </div>
            )}

            {currentView === 'kakao' && (
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <h2>카카오 로그인 처리 중...</h2>
                </div>
            )}
        </div>
    );
}

export default App;
