import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { typography, type TypographyPreset } from '@/styles/typography';

export interface TextProps extends RNTextProps {
  /** TDS 타이포그래피 프리셋 (예: 't5Bold', 't6Medium') */
  preset?: TypographyPreset;
  /** 색상 shortcut */
  color?: string;
}

export function Text({ style, preset, color, ...props }: TextProps) {
  const flattenedStyle = (StyleSheet.flatten(style) || {}) as TextStyle;

  // 프리셋이 있으면 TDS 토큰 적용
  if (preset) {
    const token = typography[preset];
    const { fontWeight: _fw, ...restFlat } = flattenedStyle;

    return (
      <RNText
        style={[
          {
            fontSize: token.fontSize,
            lineHeight: token.lineHeight,
            fontFamily: token.fontFamily,
          },
          restFlat,
          color ? { color } : undefined,
        ]}
        {...props}
      />
    );
  }

  // 프리셋 없이 사용 시 기존 fontWeight → fontFamily 매핑
  let fontFamily = 'Pretendard-Regular';

  const fw = flattenedStyle.fontWeight;
  if (fw === '500') fontFamily = 'Pretendard-Medium';
  else if (fw === '600') fontFamily = 'Pretendard-SemiBold';
  else if (fw === 'bold' || fw === '700' || fw === '800' || fw === '900') fontFamily = 'Pretendard-Bold';

  const { fontWeight, ...restStyle } = flattenedStyle;

  return (
    <RNText
      style={[restStyle, { fontFamily }, color ? { color } : undefined]}
      {...props}
    />
  );
}
