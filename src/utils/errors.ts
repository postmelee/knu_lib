/**
 * 앱 전반에서 발생하는 예외를 세분화하여 처리하기 위한 커스텀 에러 모델
 */

export class NetworkError extends Error {
  constructor(message = '네트워크 연결이 지연되거나 불안정합니다. 인터넷 상태를 확인해주세요.', public originalError?: unknown) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class AuthError extends Error {
  constructor(message = '학번 또는 비밀번호를 다시 확인해주세요.') {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class BeaconError extends Error {
  constructor(message = '비콘 신호를 찾을 수 없습니다. 열람실 내부에 있는지 확인해주세요.') {
    super(message);
    this.name = 'BeaconError';
    Object.setPrototypeOf(this, BeaconError.prototype);
  }
}

export class SeatActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SeatActionError';
    Object.setPrototypeOf(this, SeatActionError.prototype);
  }
}
