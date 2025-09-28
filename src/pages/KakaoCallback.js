// src/pages/KakaoCallback.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KakaoCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get('code');

        if (code) {
            // 백엔드로 code 전달 → JWT 받기
            fetch(`http://127.0.0.1:8000/users/kakao/callback/?code=${code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.access) {
                        localStorage.setItem('access', data.access);
                        localStorage.setItem('refresh', data.refresh);
                        localStorage.setItem('user_id', data.user_id);

                        // 메인 페이지로 이동
                        navigate('/');
                    } else {
                        console.error('카카오 로그인 실패:', data);
                        navigate('/login'); // 실패 시 다시 로그인 페이지
                    }
                })
                .catch((err) => {
                    console.error('카카오 로그인 에러:', err);
                    navigate('/login');
                });
        }
    }, [navigate]);

    return <div>카카오 로그인 처리 중...</div>;
};

export default KakaoCallback;
