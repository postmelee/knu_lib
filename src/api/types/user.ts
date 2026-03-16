/**
 * 앱 내부 사용자 모델
 * SmartCard 정보를 기반으로 하되, 기존 프로필 조회용 호환성 유지
 */
export interface User {
  id: string;
  name: string;
  email?: string;
  studentId: string;    // 학번
  department: string;   // 소속1 (학부/학과)
  college: string;      // 소속2 (단과대학)
  qrId?: string;        // QR 식별자
}
