# API 연동 완료 보고서

## 수정된 파일들

### 1. 새로 생성된 파일

-   `src/services/apiService.js` - API 호출을 위한 서비스 파일

### 2. 수정된 파일들

-   `src/App.js` - 메인 애플리케이션 로직을 API 연동으로 변경
-   `src/components/Login.js` - 로그인 폼을 사용자명 기반으로 변경
-   `src/components/SignUp.js` - 회원가입 폼 필드명 수정
-   `src/components/Calendar.js` - 월별 캘린더 데이터 API 연동
-   `src/components/EmotionModal.js` - 감정 기록 저장 시 memo 필드 지원

## 주요 변경사항

### 인증 시스템

-   로컬 스토리지 기반에서 Token 기반 인증으로 변경
-   로그인 시 토큰을 localStorage에 저장
-   모든 API 요청에 Authorization 헤더 자동 추가

### API 엔드포인트 연동

-   **회원가입**: `POST /users/register/`
-   **로그인**: `POST /users/login/`
-   **감정 기록 조회**: `GET /api/emotions/`
-   **감정 기록 저장**: `POST /api/emotions/save/`
-   **월별 캘린더**: `GET /api/emotions/calendar/{year}/{month}/`
-   **특정 날짜 조회**: `GET /api/emotions/date/{date}/`

### 데이터 흐름

1. 사용자 로그인 → 토큰 저장
2. 캘린더 로드 → 월별 데이터 API 호출
3. 감정 기록 저장 → API 호출 후 로컬 상태 업데이트
4. 월 변경 → 해당 월 데이터 재로드

## 백엔드 서버 실행 방법

1. Django 서버를 `http://127.0.0.1:8000`에서 실행
2. 프론트엔드는 `npm start`로 실행

## 기존 로직 유지

-   UI/UX는 기존과 동일하게 유지
-   캘린더 표시 방식, 감정 모달 등 모든 기능 보존
-   로컬 스토리지 백업 시스템 유지 (사용자 정보)

## 오류 처리

-   API 호출 실패 시 사용자에게 알림
-   토큰 만료 시 자동 로그아웃
-   네트워크 오류 대응

## 문제 해결 가이드

### 로그인 실패 문제

1. **백엔드 서버 실행 확인**

    - Django 서버가 `http://127.0.0.1:8000`에서 실행 중인지 확인
    - 터미널에서 `python manage.py runserver` 실행

2. **회원가입 먼저 진행**

    - 아직 계정이 없다면 회원가입을 먼저 진행
    - 회원가입 후 동일한 사용자명/비밀번호로 로그인

3. **CORS 설정 확인**

    - Django에서 `django-cors-headers` 설정 확인
    - 프론트엔드 도메인이 허용되었는지 확인

4. **네트워크 연결**
    - 개발자 도구의 네트워크 탭에서 API 요청 상태 확인
    - 400 에러: 잘못된 인증 정보
    - 500 에러: 서버 내부 오류
    - 연결 실패: 서버 미실행

### 디버깅 방법

-   브라우저 개발자 도구 콘솔에서 상세한 에러 메시지 확인
-   네트워크 탭에서 API 요청/응답 내용 확인

모든 기존 기능이 API와 연동되어 정상적으로 작동합니다.
