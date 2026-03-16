/**
 * TDS Typography Tokens
 * Toss Design System 기반 타이포그래피 토큰
 *
 * 계층: Typography 1 (가장 큰) → Typography 7 (가장 작은)
 * 가중치: bold / medium / regular
 *
 * Reference: https://tossmini-docs.toss.im/tds-mobile/foundation/typography/
 */

import { TextStyle } from 'react-native';

// ── Token Definitions ──

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  fontFamily: string;
}

// TDS Typography Scale
const SCALE = {
  1: { fontSize: 30, lineHeight: 38 },
  2: { fontSize: 26, lineHeight: 34 },
  3: { fontSize: 22, lineHeight: 30 },
  4: { fontSize: 20, lineHeight: 28 },
  5: { fontSize: 17, lineHeight: 24 },
  6: { fontSize: 15, lineHeight: 22 },
  7: { fontSize: 13, lineHeight: 18 },
  8: { fontSize: 11, lineHeight: 16 },
} as const;

// Weight → Pretendard font 매핑
const WEIGHT_MAP = {
  bold:    { fontWeight: 'bold' as const, fontFamily: 'Pretendard-Bold' },
  medium:  { fontWeight: '500' as const,  fontFamily: 'Pretendard-Medium' },
  regular: { fontWeight: '400' as const,  fontFamily: 'Pretendard-Regular' },
};

function createToken(
  level: keyof typeof SCALE,
  weight: keyof typeof WEIGHT_MAP,
): TypographyToken {
  return {
    ...SCALE[level],
    ...WEIGHT_MAP[weight],
  };
}

// ── Public Tokens ──
// 사용법: typography.t3Bold, typography.t5Medium, typography.t7Regular 등

export const typography = {
  // Typography 1 — 히어로, 매우 큰 제목
  t1Bold:    createToken(1, 'bold'),
  t1Medium:  createToken(1, 'medium'),
  t1Regular: createToken(1, 'regular'),

  // Typography 2 — 대형 제목
  t2Bold:    createToken(2, 'bold'),
  t2Medium:  createToken(2, 'medium'),
  t2Regular: createToken(2, 'regular'),

  // Typography 3 — 섹션 제목, 카드 내 강조 숫자
  t3Bold:    createToken(3, 'bold'),
  t3Medium:  createToken(3, 'medium'),
  t3Regular: createToken(3, 'regular'),

  // Typography 4 — 카드 제목, 사용자 이름
  t4Bold:    createToken(4, 'bold'),
  t4Medium:  createToken(4, 'medium'),
  t4Regular: createToken(4, 'regular'),

  // Typography 5 — 본문 기본, 리스트 아이템 제목
  t5Bold:    createToken(5, 'bold'),
  t5Medium:  createToken(5, 'medium'),
  t5Regular: createToken(5, 'regular'),

  // Typography 6 — 보조 텍스트, 메타 정보
  t6Bold:    createToken(6, 'bold'),
  t6Medium:  createToken(6, 'medium'),
  t6Regular: createToken(6, 'regular'),

  // Typography 7 — 캡션, 뱃지, 작은 레이블
  t7Bold:    createToken(7, 'bold'),
  t7Medium:  createToken(7, 'medium'),
  t7Regular: createToken(7, 'regular'),

  // Typography 8 — 타임스탬프, 초소형 텍스트
  t8Bold:    createToken(8, 'bold'),
  t8Medium:  createToken(8, 'medium'),
  t8Regular: createToken(8, 'regular'),
} as const;

// ── Color Tokens (TDS 기반) ──

export const textColors = {
  primary:    '#191f28', // 기본 텍스트
  secondary:  '#4e5968', // 보조 텍스트
  tertiary:   '#8b95a1', // 3차 텍스트
  disabled:   '#b0b8c1', // 비활성 텍스트
  blue:       '#3182f6', // 강조 파란색
  red:        '#f04452', // 위험/경고
  white:      '#ffffff', // 역상 텍스트
} as const;

export type TypographyPreset = keyof typeof typography;
