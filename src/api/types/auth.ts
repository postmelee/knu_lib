/**
 * 로그인 요청 모델
 * Swift 참조: DBModel.User (id, password)
 */
export interface LoginCredentials {
  id: string;
  password: string;
}

/**
 * 스마트카드 응답 모델
 * Swift 참조: ApiModel.SmartCard
 * 서버 응답 필드명은 CodingKeys 기준
 */
export interface SmartCardResponse {
  libtechAccountName: string;
  libtechAccountUserid: string;
  libtechAccountUseridQr: string;
  libtechAccountDepart: string;
  libtechAccountUniv: string;
}

/**
 * 앱 내부에서 사용하는 정규화된 스마트카드 모델
 */
export interface SmartCard {
  name: string;
  id: string;
  qrId: string;
  department: string;
  college: string;
}

/**
 * 로컬에 저장할 인증 세션 정보
 */
export interface AuthSession {
  credentials: LoginCredentials;
  smartCard: SmartCard;
}
