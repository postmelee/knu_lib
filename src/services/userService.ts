import { api } from '../api/instances';
import { User } from '../api/types/user';
import type { SmartCardResponse, SmartCard } from '../api/types/auth';
import { getStoredSession, padStudentId, updateStoredSession } from './authService';

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
 * API 호출 공통 헬퍼
 */
async function callSmartCardApi(id: string, password: string): Promise<SmartCard> {
  const paddedId = padStudentId(id);

  const { data } = await api.get<SmartCardResponse>(
    '/Account/RequestClickerSmartCardInformation',
    {
      params: {
        l_user_id: paddedId,
        l_user_pass: password,
      },
    },
  );

  return mapSmartCard(data);
}

/**
 * SmartCard 전체 동기화 (앱 시작 시 1회)
 * — 이름/학번/소속 등 프로필 변경사항을 세션에 반영
 */
export async function fetchSmartCard(): Promise<SmartCard> {
  const session = await getStoredSession();
  if (!session) {
    throw new Error('No stored session. Please login first.');
  }

  const smartCard = await callSmartCardApi(
    session.credentials.id,
    session.credentials.password,
  );

  // 프로필 전체를 세션에 저장 (앱 시작 시 1회만 호출되므로 적절)
  await updateStoredSession(smartCard);

  return smartCard;
}

/**
 * QR ID만 조회 (QR 새로고침용)
 * — AsyncStorage 쓰기 없이 qrId만 반환
 */
export async function fetchQrId(): Promise<string> {
  const session = await getStoredSession();
  if (!session) {
    throw new Error('No stored session. Please login first.');
  }

  const smartCard = await callSmartCardApi(
    session.credentials.id,
    session.credentials.password,
  );

  return smartCard.qrId;
}

export const fetchUserProfile = async (userId: string): Promise<User> => {
  // Mock implementation for UI testing
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      id: userId,
      name: '이태규',
      studentId: '202002502',
      department: '소프트웨어응용학부',
      college: '소프트웨어전공',
    }), 1000);
  });
};
