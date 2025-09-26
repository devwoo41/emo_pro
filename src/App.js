import React, { useState, useEffect } from 'react';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Calendar from './components/Calendar';
import EmotionModal from './components/EmotionModal';
import { authAPI, emotionAPI, tokenUtils, testConnection } from './services/apiService';

function App() {
    const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'calendar'
    const [currentUser, setCurrentUser] = useState(null);
    const [emotionRecords, setEmotionRecords] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // 인증 상태 확인 및 데이터 로드
    useEffect(() => {
        const initializeApp = async () => {
            try {
                console.log('앱 초기화 시작...');

                // 서버 연결 상태 확인
                const isServerOnline = await testConnection();
                if (!isServerOnline) {
                    console.warn(
                        '백엔드 서버에 연결할 수 없습니다. http://127.0.0.1:8000 에서 서버가 실행 중인지 확인해주세요.'
                    );
                    authAPI.logout();
                    localStorage.removeItem('currentUser');
                    setCurrentUser(null);
                    setCurrentView('login');
                    return;
                }

                // 토큰 기반 인증 상태 체크
                if (tokenUtils.isAuthenticated()) {
                    const savedUser = localStorage.getItem('currentUser');
                    if (savedUser) {
                        try {
                            const user = JSON.parse(savedUser);
                            if (user && user.username) {
                                setCurrentUser(user);
                                setCurrentView('calendar');
                                await loadEmotionRecords();
                            } else {
                                throw new Error('유효하지 않은 사용자 데이터');
                            }
                        } catch (e) {
                            console.error('사용자 데이터 파싱 실패:', e);
                            authAPI.logout();
                            localStorage.removeItem('currentUser');
                            setCurrentUser(null);
                            setCurrentView('login');
                        }
                    } else {
                        authAPI.logout();
                        setCurrentUser(null);
                        setCurrentView('login');
                    }
                } else {
                    setCurrentUser(null);
                    setCurrentView('login');
                }
            } catch (error) {
                console.error('앱 초기화 실패:', error);
                authAPI.logout();
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
                setCurrentView('login');
            }
        };

        initializeApp();
    }, []);

    // 감정 기록 로드
    const loadEmotionRecords = async () => {
        try {
            const emotions = await emotionAPI.getEmotions();
            const recordsMap = {};
            emotions.forEach((emotion) => {
                recordsMap[emotion.date] = emotion;
            });
            setEmotionRecords(recordsMap);
        } catch (error) {
            console.error('감정 기록 로드 실패:', error);
        }
    };

    // 회원가입 처리
    const handleSignUp = async (userData) => {
        try {
            await authAPI.register(userData);
            alert(`환영합니다, ${userData.username}님! 회원가입이 완료되었습니다. 로그인해주세요.`);
            setCurrentView('login');
        } catch (error) {
            console.error('회원가입 실패:', error);
            const errorMessage = error.message.includes('{')
                ? '회원가입에 실패했습니다. 입력 정보를 확인해주세요.'
                : error.message;
            alert(errorMessage);
        }
    };

    // 로그인 처리 (JWT)
    const handleLogin = async (loginData) => {
        try {
            console.log('로그인 시도:', loginData);
            const response = await authAPI.login(loginData);
            console.log('로그인 응답:', response);

            if (!response || !response.access) {
                throw new Error('서버에서 유효하지 않은 응답을 받았습니다.');
            }

            // access/refresh는 authAPI.login에서 이미 저장됨(setTokens)
            // currentUser에는 유저 정보만 저장
            const user = {
                id: response.user_id ?? null,
                username: loginData.username,
            };

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

            if (error.message.includes('fetch') || error.message.includes('서버에 연결할 수 없습니다')) {
                alert('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            } else if (error.message.includes('400')) {
                alert('아이디 또는 비밀번호가 올바르지 않습니다.');
            } else {
                alert(`로그인에 실패했습니다: ${error.message}`);
            }
        }
    };

    // 로그아웃 처리
    const handleLogout = () => {
        authAPI.logout();
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setEmotionRecords({});
        setCurrentView('login');
    };

    // 날짜 선택 처리
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    // 감정 기록 저장
    const handleSaveEmotion = async (record) => {
        try {
            const dateKey = record.date.toISOString().split('T')[0];
            const emotionData = {
                date: dateKey,
                emotion: record.emotion,
                memo: record.comment || record.memo || '',
            };

            const savedEmotion = await emotionAPI.saveEmotion(emotionData);

            const newRecords = {
                ...emotionRecords,
                [dateKey]: savedEmotion,
            };
            setEmotionRecords(newRecords);

            alert('감정 기록이 저장되었습니다!');
        } catch (error) {
            console.error('감정 기록 저장 실패:', error);
            alert('감정 기록 저장에 실패했습니다.');
        }
    };

    const getExistingRecord = () => {
        if (!selectedDate) return null;
        const dateKey = selectedDate.toISOString().split('T')[0];
        return emotionRecords[dateKey] || null;
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
        </div>
    );
}

export default App;
