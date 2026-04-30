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

export interface BeaconScanPermissionResult {
  granted: boolean;
  message?: string;
  missingPermissions: string[];
  requiresSettings?: boolean;
}

type AndroidBeaconPermission = {
  permission: Parameters<typeof PermissionsAndroid.check>[0];
  label: string;
};

// ── Main Entry Point ──────────────────────────────────────
export async function scanForKNUBeacon(): Promise<BeaconScanResult> {
  const permissionResult = await prepareBeaconScanPermissionResult();
  if (!permissionResult.granted) {
    throw new BeaconError(permissionResult.message || '블루투스 및 위치 권한이 필요합니다.');
  }

  return scanWithNativeRanging();
}

export async function prepareBeaconScanPermissions(): Promise<boolean> {
  const result = await prepareBeaconScanPermissionResult();
  return result.granted;
}

export async function prepareBeaconScanPermissionResult(): Promise<BeaconScanPermissionResult> {
  if (Platform.OS !== 'android') {
    return { granted: true, missingPermissions: [] };
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

function getRequiredAndroidBeaconPermissions(): AndroidBeaconPermission[] {
  return Number(Platform.Version) >= 31
    ? [
        {
          permission: PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          label: '근처 기기 권한(비콘 스캔)',
        },
        {
          permission: PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          label: '근처 기기 권한(블루투스 상태 확인)',
        },
        {
          permission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          label: '위치 권한',
        },
      ]
    : [
        {
          permission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          label: '위치 권한',
        },
      ];
}

function buildPermissionMessage(missingPermissions: string[], requiresSettings: boolean): string {
  const missingText = missingPermissions.join(', ');
  const actionText = requiresSettings
    ? '권한 요청이 차단되어 기기 설정에서 직접 허용해야 합니다.'
    : '권한을 허용한 뒤 다시 시도해주세요.';

  return `비콘 인증에 필요한 권한이 허용되지 않았습니다: ${missingText}. ${actionText}`;
}

async function getMissingAndroidBeaconPermissions(
  requirements: AndroidBeaconPermission[]
): Promise<AndroidBeaconPermission[]> {
  const checks = await Promise.all(
    requirements.map(async requirement => ({
      ...requirement,
      granted: await PermissionsAndroid.check(requirement.permission),
    }))
  );

  return checks.filter(result => !result.granted);
}

async function requestAndroidBeaconPermissions(): Promise<BeaconScanPermissionResult> {
  const requirements = getRequiredAndroidBeaconPermissions();
  const missingBeforeRequest = await getMissingAndroidBeaconPermissions(requirements);

  // 1. 이미 승인되었는지 확인
  if (missingBeforeRequest.length === 0) {
    return { granted: true, missingPermissions: [] };
  }

  const missingBeforeRequestLabels = missingBeforeRequest.map(({ label }) => label);

  // 2. 권한이 없을 경우, 시스템 팝업을 띄우기 전에 이유를 설명하는 Alert 제공 (Android 권장 UX)
  return new Promise((resolve) => {
    Alert.alert(
      '필수 권한 안내',
      `도서관 열람실의 비콘을 스캔하여 좌석을 인증하기 위해 다음 권한이 필요합니다.\n\n${missingBeforeRequestLabels.join('\n')}`,
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => resolve({
            granted: false,
            missingPermissions: missingBeforeRequestLabels,
            message: buildPermissionMessage(missingBeforeRequestLabels, false),
          }),
        },
        {
          text: '권한 허용하기',
          onPress: async () => {
            const requestResult = await PermissionsAndroid.requestMultiple(
              missingBeforeRequest.map(({ permission }) => permission)
            );
            const missingAfterRequest = missingBeforeRequest.filter(
              ({ permission }) => requestResult[permission] !== PermissionsAndroid.RESULTS.GRANTED
            );

            if (missingAfterRequest.length === 0) {
              resolve({ granted: true, missingPermissions: [] });
              return;
            }

            const missingAfterRequestLabels = missingAfterRequest.map(({ label }) => label);
            const requiresSettings = missingAfterRequest.some(
              ({ permission }) => requestResult[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            );

            resolve({
              granted: false,
              missingPermissions: missingAfterRequestLabels,
              requiresSettings,
              message: buildPermissionMessage(missingAfterRequestLabels, requiresSettings),
            });
          },
        },
      ],
      { cancelable: false }
    );
  });
}
