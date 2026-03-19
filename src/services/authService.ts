import * as SecureStore from 'expo-secure-store';
import { api } from '../api/instances';
import { spongeEncrypt } from '../utils/crypto';
import { AuthError, NetworkError } from '../utils/errors';
import type {
  LoginCredentials,
  SmartCardResponse,
  SmartCard,
  AuthSession,
} from '../api/types/auth';

const AUTH_STORAGE_KEY = 'knu_library.auth_session';

/**
 * 학번을 10자리로 zero-padding
 * Swift 참조: DBModel.User.paddedId
 */
export function padStudentId(id: string, length = 10): string {
  if (id.length >= length) return id;
  return '0'.repeat(length - id.length) + id;
}

/**
 * 서버 응답(SmartCardResponse)을 앱 내부 모델(SmartCard)로 변환
 */
function mapSmartCard(response: SmartCardResponse): SmartCard {
  return {
    name: response.libtechAccountName,
    id: response.libtechAccountUserid,
    qrId: response.libtechAccountUseridQr,
    department: response.libtechAccountDepart,
    college: response.libtechAccountUniv,
    guid: response.libtechAccountPhoneUid,
  };
}

/**
 * 로그인 API 호출
 * 기존 방식 대신 원본 앱의 방식(GetMyinformation?login=true)을 먼저 호출하여 
 * 아이디/비밀번호 유효성을 검증(200 OK vs 302 HTML Redirect)합니다.
 * 성공 시, 기존처럼 프로필용 API를 호출해 Guid와 소속/이름을 매핑합니다.
 */
export async function login(credentials: LoginCredentials): Promise<SmartCard> {
  const encId = encodeURIComponent(spongeEncrypt(credentials.id));
  const encPw = encodeURIComponent(spongeEncrypt(credentials.password));

  // 1. 유효성 검증 API 호출
  // React Native의 Axios(XHR)는 302를 자동 추적합니다.
  // 실패할 경우 302 -> HTML 화면(200)으로 응답이 오므로 이를 감지합니다.
  try {
    const authRes = await api.get(
      `/Clicker/GetMyinformation?userid=${encId}&userpass=${encPw}&l_gubun=&login=true`
    );

    if (typeof authRes.data === 'string' && authRes.data.toLowerCase().includes('<html')) {
      throw new AuthError();
    }

    // 2. 로그인 성공(유효성 통과) 판정 이후, SmartCard 내부 프로필 캐시
    const paddedId = padStudentId(credentials.id);
    const { data } = await api.get<SmartCardResponse>(
      '/Account/RequestClickerSmartCardInformation',
      {
        params: {
          l_user_id: paddedId,
          l_user_pass: credentials.password,
        },
      },
    );

    const smartCard = mapSmartCard(data);

    // 세션 정보를 로컬에 암호화하여 저장
    const session: AuthSession = { credentials, smartCard };
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(session));

    return smartCard;
  } catch (error: any) {
    if (error instanceof AuthError) {
      throw error;
    }
    // Axios 타임아웃, 서버 500 등 네트워크 관련 에러
    throw new NetworkError(undefined, error);
  }
}

/**
 * 저장된 세션 불러오기
 */
export async function getStoredSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * 저장된 세션의 SmartCard 갱신 (userService에서 호출)
 */
export async function updateStoredSession(smartCard: SmartCard): Promise<void> {
  const session = await getStoredSession();
  if (!session) return;
  const updated: AuthSession = { credentials: session.credentials, smartCard };
  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * 로그아웃 (세션 삭제)
 */
export async function logout(): Promise<void> {
  // 실제 서버에 로그아웃 상태 전송 (login=false)
  const session = await getStoredSession();
  if (session) {
    const encId = encodeURIComponent(spongeEncrypt(session.credentials.id));
    const encPw = encodeURIComponent(spongeEncrypt(session.credentials.password));
    try {
      await api.get(
        `/Clicker/GetMyinformation?userid=${encId}&userpass=${encPw}&l_gubun=&login=false`
      );
    } catch {
      // 로그아웃 네트워크 실패 시 무시하고 로컬 세션 삭제 진행
    }
  }

  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}
