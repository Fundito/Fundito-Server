// responseMessage.js
module.exports = {
    NULL_VALUE: "필요한 값이 없습니다.",
    OUT_OF_VALUE: "파라미터 값이 잘못 되었습니다.",
    INTERNAL_SERVER_ERROR: "서버 내부 오류",
    DUPLICATE_VALUE_ERROR: "파라미터 값 중복",
    SIGN_UP_SUCCESS: "회원가입 성공",
<<<<<<< HEAD

    STORE_FUND_INSERT_FAILED: "가게 펀드 정보 입력 실패",
    STORE_FUND_INSERT_SUCCESS: "가게 펀드 정보 입력 성공",
    STORE_FUND_SELECT_SUCCESS: "가게 펀드 정보 조회 성공",
    
    // MYPAGE_FUNDLIST_INSERT_FAILED: "내 펀드 정보 입력 실패",
    MYPAGE_FUNDLIST_SELECT_SUCCESS: "내 투자 내역 조회 성공",
    MYPAGE_FUNDLIST_SELECT_FAIL: "내 투자 내역 조회 실패",

    WIFI_CHECK_SUCCESS: "와이파이 SSID 일치",
    WIFI_CHECK_FAIL : "와이파이 SSID 일치하지 않음",

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
    NO_X: (x) => `존재하는 ${x} 입니다.`,
    ALREADY_X: (x) => `존재하는 ${x} 입니다.`,
=======
    DB_ERROR: "데이터베이스 에러",
    
	EMPTY_TOKEN: "헤더에 토큰이 없음",
	EXPIRED_TOKEN: "유효기간이 지난 토큰",
	INVALID_TOKEN: "잘못된 토큰",
>>>>>>> feature/passport
}