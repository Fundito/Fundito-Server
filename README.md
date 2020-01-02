# Fundito
> 나만의 맛집에 투자하라! 외식업 크라우드 펀딩 서비스, Fundito
<br>

## 📂 [API Doc Link](https://github.com/Fundito/Fundito-Server/wiki)
<br>

## ⭐️ 핵심 기능
1. 페이스북 로그인 & 회원가입
2. 가게 정보 등록
3. 가게 크라우드 등록
4. 가게 펀딩
5. 펀딩 금액 회수
6. 알림
<br>

## 👩‍👩‍👧‍👦 Team Member
[백예은](https://github.com/bye0520)
* 펀디토 머니 API 구현
* StoreInfo API 구현
* StoreFund API 구현
* DB 설계 및 구축
* nginx 적용

[조수민](https://github.com/ChoSooMin)
* StoreInfo API 구현
* Funding API 구현
* Card API 구현
* EC2 배포 관리
* nginx 적용

[강영우](https://github.com/rdd9223)
* 페이스북 로그인 & 회원가입 구현
* User API 구현
* Friend API 구현
* DB 설계 및 구축
* JWT 미들웨어 구축

[이소희](https://github.com/dlthgml1997)
* StoreInfo API 구현
* Notification API 구현
* DB 설계 및 구축
* git branch 관리
* 소스 코드 수정 및 최적화
<br>

## 📝 ERD Diagram
<img src="https://github.com/Fundito/Fundito-Server/blob/develop/Fundito%20Server%20ER%20Diagram.png" width = "50%" height = "50%"/>
<br>

## 📕 Server Architecture
<img src="https://github.com/Fundito/Fundito-Server/blob/develop/Server%20Architecture.jpg" width = "60%" height = "60%"/>
<br>

## 📖 Dependency Module
```
{
  "name": "fundito",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "nodemon ./bin/www"
  },
  "dependencies": {
    "assert": "^2.0.0",
    "aws-sdk": "^2.596.0",
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "express-session": "^1.17.0",
    "fb": "^2.0.0",
    "fcm-node": "^1.5.2",
    "firebase": "^7.6.1",
    "firebase-admin": "^8.9.0",
    "hangul-js": "^0.2.6",
    "helmet": "^3.21.2",
    "http-errors": "^1.6.3",
    "jade": "^1.11.0",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.24.0",
    "morgan": "^1.9.1",
    "multer": "^1.4.2",
    "multer-s3": "^2.9.0",
    "node-cron": "^2.0.3",
    "nodemon": "^2.0.2",
    "oauth2": "0.0.1",
    "passport": "^0.4.1",
    "passport-facebook": "^3.0.0",
    "passport-kakao": "^1.0.0",
    "passport-local": "^1.0.0",
    "pbkdf2": "^3.0.17",
    "promise-mysql": "^4.1.1",
    "rand-token": "^0.4.0",
    "random-token": "0.0.8",
    "request": "^2.88.0",
    "request-promise": "^4.2.5"
  }
}

```
