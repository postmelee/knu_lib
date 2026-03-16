import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/instances';
import type {
  LoginCredentials,
  SmartCardResponse,
  SmartCard,
  AuthSession,
} from '../api/types/auth';

const AUTH_STORAGE_KEY = '@knu_library/auth_session';

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
  };
}

/**
 * 로그인 API 호출
 * Swift 참조: LibraryWebRepositoryImpl.getUserDetail
 * GET /Account/RequestClickerSmartCardInformation?l_user_id={paddedId}&l_user_pass={password}
 */
export async function login(credentials: LoginCredentials): Promise<SmartCard> {
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

  // 세션 정보를 로컬에 저장
  const session: AuthSession = { credentials, smartCard };
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

  return smartCard;
}

/**
 * 저장된 세션 불러오기
 */
export async function getStoredSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
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
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * 로그아웃 (세션 삭제)
 */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}
