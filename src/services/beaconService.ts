/**
 * BLE Beacon Scanner Service
 *
 * Platform-specific iBeacon detection through the local native Expo module:
 * - iOS: CoreLocation CLLocationManager
 * - Android: BluetoothLeScanner + native iBeacon parsing
 *
 * Both paths return { major, minor, rssi } for server-side authentication.
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { BeaconError } from '../utils/errors';

// ── Constants ──────────────────────────────────────────────
const KNULIB_BEACON_UUID = process.env.EXPO_PUBLIC_BEACON_UUID || '24ddf411-8cf1-440c-87cd-e368daf9c93e';
const SCAN_TIMEOUT_MS = 20_000; // Increased to 20 seconds

// ── Types ─────────────────────────────────────────────────
export interface BeaconScanResult {
  major: number;
  minor: number;
  rssi: number;
}

// ── Main Entry Point ──────────────────────────────────────
export async function scanForKNUBeacon(): Promise<BeaconScanResult> {
  const permitted = await prepareBeaconScanPermissions();
  if (!permitted) {
    throw new BeaconError('블루투스 및 위치 권한이 필요합니다.');
  }

  return scanWithNativeRanging();
}

export async function prepareBeaconScanPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  return requestAndroidBeaconPermissions();
}

// ══════════════════════════════════════════════════════════
//  Native Beacon Ranging
// ══════════════════════════════════════════════════════════

async function scanWithNativeRanging(): Promise<BeaconScanResult> {
  const { rangeKNUBeacon } = require('../../modules/beacon-ranging');
  try {
    const result = await rangeKNUBeacon(KNULIB_BEACON_UUID, SCAN_TIMEOUT_MS);
    return {
      major: result.major,
      minor: result.minor,
      rssi: result.rssi,
    };
  } catch (error: any) {
    throw new BeaconError(error?.message || '비콘 인증에 실패했습니다.');
  }
}

// ══════════════════════════════════════════════════════════
//  Android Permissions
// ══════════════════════════════════════════════════════════

async function requestAndroidBeaconPermissions(): Promise<boolean> {
  const permissions = Number(Platform.Version) >= 31
    ? [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  // 1. 이미 승인되었는지 확인
  const checks = await Promise.all(permissions.map(p => PermissionsAndroid.check(p)));
  if (checks.every(isGranted => isGranted)) return true;

  // 2. 권한이 없을 경우, 시스템 팝업을 띄우기 전에 이유를 설명하는 Alert 제공 (Android 권장 UX)
  return new Promise((resolve) => {
    Alert.alert(
      '필수 권한 안내',
      '도서관 열람실의 비콘을 스캔하여 좌석을 인증하기 위해 블루투스 및 위치 권한이 필요합니다.',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: '권한 허용하기',
          onPress: async () => {
            const result = await PermissionsAndroid.requestMultiple(permissions);
            const allGranted = Object.values(result).every(
              res => res === PermissionsAndroid.RESULTS.GRANTED
            );
            resolve(allGranted);
          },
        },
      ],
      { cancelable: false }
    );
  });
}
