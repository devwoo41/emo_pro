# Emodia API Specification

## Overview

Emodia는 감정 기반 소셜 플랫폼을 위한 REST API입니다.

## Base URL

```
Development: http://localhost:8000/api/
Production: https://api.emodia.com/api/
```

## Authentication

-   JWT 토큰 기반 인증
-   Authorization Header: `Bearer <token>`

## Common Response Format

```json
{
  "success": boolean,
  "message": string,
  "data": object|array,
  "errors": object
}
```

## HTTP Status Codes

-   `200` OK - 성공
-   `201` Created - 생성 성공
-   `400` Bad Request - 잘못된 요청
-   `401` Unauthorized - 인증 필요
-   `403` Forbidden - 권한 없음
-   `404` Not Found - 리소스 없음
-   `500` Internal Server Error - 서버 오류

---

## 1. Authentication & Users

### 1.1 User Registration

```
POST /auth/register/
```

**Request Body:**

```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "password_confirm": "string",
    "profile": {
        "nickname": "string",
        "bio": "string"
    }
}
```

**Response (201):**

```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "username": "string",
            "email": "string",
            "profile": {
                "nickname": "string",
                "bio": "string",
                "avatar": null,
                "created_at": "2025-09-25T10:00:00Z"
            }
        },
        "tokens": {
            "access": "string",
            "refresh": "string"
        }
    }
}
```

### 1.2 User Login

```
POST /auth/login/
```

**Request Body:**

```json
{
    "email": "string",
    "password": "string"
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "username": "string",
            "email": "string",
            "profile": {
                "nickname": "string",
                "bio": "string",
                "avatar": "string",
                "emotion_streak": 0,
                "total_posts": 0
            }
        },
        "tokens": {
            "access": "string",
            "refresh": "string"
        }
    }
}
```

### 1.3 Token Refresh

```
POST /auth/refresh/
```

**Request Body:**

```json
{
    "refresh": "string"
}
```

### 1.4 User Profile

```
GET /users/profile/
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "username": "string",
        "email": "string",
        "profile": {
            "nickname": "string",
            "bio": "string",
            "avatar": "string",
            "emotion_streak": 5,
            "total_posts": 23,
            "created_at": "2025-09-25T10:00:00Z"
        }
    }
}
```

### 1.5 Update Profile

```
PUT /users/profile/
```

**Request Body:**

```json
{
    "nickname": "string",
    "bio": "string",
    "avatar": "file"
}
```

---

## 2. Emotions & Posts

### 2.1 Get Emotion Categories

```
GET /emotions/categories/
```

**Response (200):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "happy",
            "display_name": "행복",
            "color": "#FFD700",
            "icon": "😊"
        },
        {
            "id": 2,
            "name": "sad",
            "display_name": "슬픔",
            "color": "#4169E1",
            "icon": "😢"
        }
    ]
}
```

### 2.2 Create Emotion Post

```
POST /emotions/posts/
```

**Request Body:**

```json
{
    "emotion_type": 1,
    "content": "string",
    "intensity": 5,
    "is_anonymous": false,
    "location": {
        "latitude": 37.5665,
        "longitude": 126.978,
        "address": "서울시 중구"
    },
    "tags": ["tag1", "tag2"]
}
```

**Response (201):**

```json
{
    "success": true,
    "message": "Post created successfully",
    "data": {
        "id": 1,
        "emotion_type": {
            "id": 1,
            "name": "happy",
            "display_name": "행복",
            "color": "#FFD700"
        },
        "content": "string",
        "intensity": 5,
        "is_anonymous": false,
        "author": {
            "id": 1,
            "nickname": "string",
            "avatar": "string"
        },
        "location": {
            "address": "서울시 중구"
        },
        "tags": ["tag1", "tag2"],
        "likes_count": 0,
        "comments_count": 0,
        "created_at": "2025-09-25T10:00:00Z"
    }
}
```

### 2.3 Get Posts Feed

```
GET /emotions/posts/
```

**Query Parameters:**

-   `page`: 페이지 번호 (default: 1)
-   `limit`: 페이지당 개수 (default: 20)
-   `emotion_type`: 감정 타입 필터
-   `location`: 위치 기반 필터 (lat,lng,radius)
-   `sort`: 정렬 방식 (recent, popular, nearby)

**Response (200):**

```json
{
    "success": true,
    "data": {
        "posts": [
            {
                "id": 1,
                "emotion_type": {
                    "id": 1,
                    "name": "happy",
                    "display_name": "행복",
                    "color": "#FFD700"
                },
                "content": "string",
                "intensity": 5,
                "is_anonymous": false,
                "author": {
                    "id": 1,
                    "nickname": "string",
                    "avatar": "string"
                },
                "location": {
                    "address": "서울시 중구"
                },
                "tags": ["tag1", "tag2"],
                "likes_count": 5,
                "comments_count": 3,
                "is_liked": false,
                "created_at": "2025-09-25T10:00:00Z"
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 10,
            "total_count": 200,
            "has_next": true,
            "has_previous": false
        }
    }
}
```

### 2.4 Get Post Detail

```
GET /emotions/posts/{post_id}/
```

**Response (200):**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "emotion_type": {
            "id": 1,
            "name": "happy",
            "display_name": "행복",
            "color": "#FFD700"
        },
        "content": "string",
        "intensity": 5,
        "is_anonymous": false,
        "author": {
            "id": 1,
            "nickname": "string",
            "avatar": "string"
        },
        "location": {
            "latitude": 37.5665,
            "longitude": 126.978,
            "address": "서울시 중구"
        },
        "tags": ["tag1", "tag2"],
        "likes_count": 5,
        "comments_count": 3,
        "is_liked": false,
        "created_at": "2025-09-25T10:00:00Z",
        "comments": [
            {
                "id": 1,
                "author": {
                    "id": 2,
                    "nickname": "string",
                    "avatar": "string"
                },
                "content": "string",
                "created_at": "2025-09-25T10:05:00Z"
            }
        ]
    }
}
```

### 2.5 Like/Unlike Post

```
POST /emotions/posts/{post_id}/like/
DELETE /emotions/posts/{post_id}/like/
```

**Response (200):**

```json
{
    "success": true,
    "message": "Post liked/unliked successfully",
    "data": {
        "is_liked": true,
        "likes_count": 6
    }
}
```

### 2.6 Add Comment

```
POST /emotions/posts/{post_id}/comments/
```

**Request Body:**

```json
{
    "content": "string"
}
```

**Response (201):**

```json
{
    "success": true,
    "message": "Comment added successfully",
    "data": {
        "id": 1,
        "author": {
            "id": 1,
            "nickname": "string",
            "avatar": "string"
        },
        "content": "string",
        "created_at": "2025-09-25T10:05:00Z"
    }
}
```

---

## 3. Analytics & Statistics

### 3.1 User Emotion Statistics

```
GET /analytics/user/emotions/
```

**Query Parameters:**

-   `period`: 기간 (week, month, year)

**Response (200):**

```json
{
    "success": true,
    "data": {
        "emotion_distribution": [
            {
                "emotion_type": "happy",
                "count": 15,
                "percentage": 35.7
            },
            {
                "emotion_type": "sad",
                "count": 8,
                "percentage": 19.0
            }
        ],
        "intensity_average": 6.2,
        "total_posts": 42,
        "streak_days": 7,
        "mood_trend": [
            {
                "date": "2025-09-18",
                "average_intensity": 6.5,
                "post_count": 3
            }
        ]
    }
}
```

### 3.2 Community Statistics

```
GET /analytics/community/
```

**Response (200):**

```json
{
    "success": true,
    "data": {
        "global_mood": {
            "dominant_emotion": "happy",
            "average_intensity": 5.8,
            "total_posts_today": 1234
        },
        "trending_emotions": [
            {
                "emotion_type": "excited",
                "growth_rate": 25.5,
                "post_count": 89
            }
        ],
        "active_locations": [
            {
                "address": "서울시 강남구",
                "post_count": 45,
                "dominant_emotion": "happy"
            }
        ]
    }
}
```

---

## 4. Search & Discovery

### 4.1 Search Posts

```
GET /search/posts/
```

**Query Parameters:**

-   `q`: 검색어
-   `emotion_type`: 감정 타입 필터
-   `location`: 위치 필터
-   `date_from`: 시작 날짜
-   `date_to`: 종료 날짜

**Response (200):**

```json
{
  "success": true,
  "data": {
    "posts": [...],
    "total_count": 25,
    "search_suggestions": ["related", "terms"]
  }
}
```

### 4.2 Trending Tags

```
GET /search/trending-tags/
```

**Response (200):**

```json
{
    "success": true,
    "data": [
        {
            "tag": "힐링",
            "count": 156,
            "growth_rate": 12.5
        }
    ]
}
```

---

## 5. Error Responses

### Validation Error (400)

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["This field is required."],
        "password": ["Password too short."]
    }
}
```

### Authentication Error (401)

```json
{
    "success": false,
    "message": "Authentication required",
    "errors": {
        "detail": "Invalid token"
    }
}
```

### Not Found Error (404)

```json
{
    "success": false,
    "message": "Resource not found",
    "errors": {
        "detail": "Post not found"
    }
}
```

---

## Frontend Integration Guidelines

### 1. State Management

-   사용자 인증 상태 관리
-   감정 포스트 피드 상태
-   실시간 알림 상태

### 2. Required Pages/Components

-   **Authentication**: 로그인, 회원가입
-   **Feed**: 메인 피드, 감정별 필터
-   **Post Creation**: 감정 선택, 내용 입력, 위치 설정
-   **Profile**: 사용자 프로필, 통계
-   **Analytics**: 개인/커뮤니티 감정 분석
-   **Search**: 포스트 검색, 태그 탐색

### 3. Real-time Features

-   WebSocket 연결: `/ws/notifications/`
-   실시간 좋아요/댓글 알림
-   새 포스트 알림

### 4. Offline Support

-   포스트 작성 시 오프라인 저장
-   네트워크 재연결 시 동기화

### 5. Progressive Web App

-   위치 기반 서비스
-   푸시 알림
-   카메라 액세스 (프로필 사진)
