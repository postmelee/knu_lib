/**
 * BLE Beacon Scanner Service
 *
 * Platform-specific iBeacon detection:
 * - iOS: CoreLocation CLLocationManager (Core Bluetooth blocks iBeacon ads)
 * - Android: react-native-ble-plx raw BLE scan + manual iBeacon parsing
 *
 * Both paths return { major, minor, rssi } for server-side authentication.
 */

import { Platform, PermissionsAndroid } from 'react-native';

// ── Constants ──────────────────────────────────────────────
const KNULIB_BEACON_UUID = '24ddf411-8cf1-440c-87cd-e368daf9c93e';
const SCAN_TIMEOUT_MS = 20_000; // Increased to 20 seconds

// ── Types ─────────────────────────────────────────────────
export interface BeaconScanResult {
  major: number;
  minor: number;
  rssi: number;
}

// ── Main Entry Point ──────────────────────────────────────
export async function scanForKNUBeacon(): Promise<BeaconScanResult> {
  console.log(`[beacon] Starting scan... OS=${Platform.OS}`);
  if (Platform.OS === 'ios') {
    return scanWithCoreLocation();
  } else {
    return scanWithBLE();
  }
}

// ══════════════════════════════════════════════════════════
//  iOS: CoreLocation Beacon Ranging
// ══════════════════════════════════════════════════════════

async function scanWithCoreLocation(): Promise<BeaconScanResult> {
  const { rangeKNUBeacon } = require('../../modules/beacon-ranging');
  console.log('[beacon/ios] Calling rangeKNUBeacon native method');
  const result = await rangeKNUBeacon(KNULIB_BEACON_UUID, SCAN_TIMEOUT_MS);
  console.log('[beacon/ios] ✅ Native method returned:', result);
  return {
    major: result.major,
    minor: result.minor,
    rssi: result.rssi,
  };
}

// ══════════════════════════════════════════════════════════
//  Android: react-native-ble-plx Raw BLE Scan
// ══════════════════════════════════════════════════════════

import { BleManager, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

let manager: BleManager | null = null;
function getManager(): BleManager {
  if (!manager) manager = new BleManager();
  return manager;
}

function parseIBeacon(manufacturerData: string): {
  uuid: string; major: number; minor: number;
} | null {
  const bytes = Buffer.from(manufacturerData, 'base64');
  if (bytes.length < 25) return null;
  if (bytes[0] !== 0x4c || bytes[1] !== 0x00 || bytes[2] !== 0x02 || bytes[3] !== 0x15) return null;

  const uuidBytes = bytes.slice(4, 20);
  const uuid = [
    uuidBytes.slice(0, 4).toString('hex'),
    uuidBytes.slice(4, 6).toString('hex'),
    uuidBytes.slice(6, 8).toString('hex'),
    uuidBytes.slice(8, 10).toString('hex'),
    uuidBytes.slice(10, 16).toString('hex'),
  ].join('-');

  return { uuid, major: bytes.readUInt16BE(20), minor: bytes.readUInt16BE(22) };
}

async function requestAndroidBLEPermissions(): Promise<boolean> {
  if (Number(Platform.Version) >= 31) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return (
      granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
    );
  }
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function scanWithBLE(): Promise<BeaconScanResult> {
  return new Promise(async (resolve, reject) => {
    const ble = getManager();
    console.log('[beacon/android] Checking BLE state...');
    
    const state = await ble.state();
    if (state !== State.PoweredOn) {
      reject(new Error('블루투스를 켜주세요.'));
      return;
    }

    console.log('[beacon/android] Requesting permissions...');
    const permitted = await requestAndroidBLEPermissions();
    if (!permitted) {
      reject(new Error('블루투스 및 위치 권한이 필요합니다.'));
      return;
    }

    const discoveredMinors = new Set<number>();
    let resolved = false;

    console.log(`[beacon/android] Starting device scan (timeout: ${SCAN_TIMEOUT_MS}ms)`);
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ble.stopDeviceScan();
        console.warn('[beacon/android] ⏰ Scan timed out!');
        reject(new Error('주변에서 도서관 비콘을 찾지 못했습니다.\n열람실 안에서 다시 시도해주세요.'));
      }
    }, SCAN_TIMEOUT_MS);

    ble.startDeviceScan(null, null, (error, device) => {
      if (resolved) return;
      if (error) {
        resolved = true;
        clearTimeout(timeout);
        ble.stopDeviceScan();
        console.error('[beacon/android] Scan error:', error);
        reject(new Error(`BLE 스캔 오류: ${error.message}`));
        return;
      }

      if (!device?.manufacturerData) return;

      const beacon = parseIBeacon(device.manufacturerData);
      if (!beacon) return;
      
      console.log(`[beacon/android] Found iBeacon! UUID=${beacon.uuid}, MAJOR=${beacon.major}, MINOR=${beacon.minor}`);
      if (beacon.uuid.toLowerCase() !== KNULIB_BEACON_UUID) return;
      
      if (discoveredMinors.has(beacon.minor)) return;
      discoveredMinors.add(beacon.minor);

      resolved = true;
      clearTimeout(timeout);
      ble.stopDeviceScan();
      console.log('[beacon/android] ✅ Library Beacon matched!');
      resolve({ major: beacon.major, minor: beacon.minor, rssi: device.rssi ?? 0 });
    });
  });
}
