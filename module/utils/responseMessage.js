// responseMessage.js
module.exports = {
    NULL_VALUE: "필요한 값이 없습니다.",
    OUT_OF_VALUE: "파라미터 값이 잘못 되었습니다.",
    BODY_VALUE_ERROR: "Body 타입이 잘못 되었습니다.",
    INTERNAL_SERVER_ERROR: "서버 내부 오류",
    DUPLICATE_VALUE_ERROR: "파라미터 값 중복",
    SIGN_UP_SUCCESS: "회원가입 성공",
    SIGN_IN_SUCCESS: "로그인 성공",

    NO_INDEX : "존재하지 않는 인덱스 값",
    NO_STORE : "존재하지 않는 가게",
    NO_REGISTERED_STORE : "아직 펀딩에 등록하지 않은 가게입니다",
    NO_NOTIFICATION : "해당하는 알림이 없습니다.",

    STORE_FUND_INSERT_FAILED: "가게 펀드 정보 입력 실패",
    STORE_FUND_INSERT_SUCCESS: "가게 펀드 정보 입력 성공",
    STORE_FUND_SELECT_SUCCESS: "가게 펀드 정보 조회 성공",
    STORE_FUND_NO_STORE: "존재하지 않는 가게 펀드 정보",
    
    // MYPAGE_FUNDLIST_INSERT_FAILED: "내 펀드 정보 입력 실패",
    MYPAGE_FUNDLIST_SELECT_SUCCESS: "내 투자 내역 조회 성공",
    MYPAGE_FUNDLIST_SELECT_FAIL: "내 투자 내역 조회 실패",
    
    MISS_MATCH_PASSWORD : "비밀번호가 일치하지 않습니다",

    WIFI_CHECK_SUCCESS: "와이파이 SSID 일치",
    WIFI_CHECK_FAIL : "와이파이 SSID 일치하지 않음",
    
    DB_ERROR: "데이터베이스 에러",
    
	EMPTY_TOKEN: "헤더에 토큰이 없음",
	EXPIRED_TOKEN: "유효기간이 지난 토큰",
    INVALID_TOKEN: "잘못된 토큰",

    DUPLICATE_FUNDING : "이미 투자한 가게입니다",
    FUNDING_SUCCESS : "투자에 성공했습니다",

    CARD_CREATE_SUCCESS : "카드 생성 성공",
    CARD_USER_NO : "카드 정보를 등록하지 않은 사용자입니다",

    FUND_RATE_READ_SUCCESS : "최대 이율 조회 성공",

    USER_MONEY_LESS_THAN_FUNDING_MONEY : "펀디토 머니 부족",

    X_CREATE_SUCCESS: (x) => `${x} 작성 성공`,
    X_CREATE_FAIL: (x) => `${x} 작성 실패`,
    X_READ_ALL_SUCCESS: (x) => `${x} 전체 조회 성공`,
    X_READ_ALL_FAIL: (x) => `${x} 전체 조회 성공`,
    X_READ_SUCCESS: (x) => `${x} 조회 성공`,
    X_READ_FAIL: (x) => `${x} 조회 성공`,
    X_UPDATE_SUCCESS: (x) => `${x} 수정 성공`,
    X_UPDATE_FAIL: (x) => `${x} 수정 실패`,
    X_DELETE_SUCCESS: (x) => `${x} 삭제 성공`,
    X_DELETE_FAIL: (x) => `${x} 삭제 실패`,  
    NO_X: (x) => `존재하지 않는 ${x} 입니다.`,
    ALREADY_X: (x) => `존재하는 ${x} 입니다.`
}