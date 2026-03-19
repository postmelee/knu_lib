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
  const result = await rangeKNUBeacon(KNULIB_BEACON_UUID, SCAN_TIMEOUT_MS);
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
    
    const state = await ble.state();
    if (state !== State.PoweredOn) {
      reject(new BeaconError('블루투스를 켜주세요.'));
      return;
    }

    const permitted = await requestAndroidBLEPermissions();
    if (!permitted) {
      reject(new BeaconError('블루투스 및 위치 권한이 필요합니다.'));
      return;
    }

    const discoveredMinors = new Set<number>();
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ble.stopDeviceScan();
        reject(new BeaconError('주변에서 도서관 비콘을 찾지 못했습니다.\n열람실 안에서 다시 시도해주세요.'));
      }
    }, SCAN_TIMEOUT_MS);

    ble.startDeviceScan(null, null, (error, device) => {
      if (resolved) return;
      if (error) {
        resolved = true;
        clearTimeout(timeout);
        ble.stopDeviceScan();
        reject(new BeaconError(`BLE 스캔 오류: ${error.message}`));
        return;
      }

      if (!device?.manufacturerData) return;

      const beacon = parseIBeacon(device.manufacturerData);
      if (!beacon) return;
      
      if (beacon.uuid.toLowerCase() !== KNULIB_BEACON_UUID) return;
      
      if (discoveredMinors.has(beacon.minor)) return;
      discoveredMinors.add(beacon.minor);

      resolved = true;
      clearTimeout(timeout);
      ble.stopDeviceScan();
      resolve({ major: beacon.major, minor: beacon.minor, rssi: device.rssi ?? 0 });
    });
  });
}
