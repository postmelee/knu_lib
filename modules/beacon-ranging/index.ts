import { requireNativeModule } from 'expo-modules-core';

interface BeaconResult {
  major: number;
  minor: number;
  rssi: number;
  proximity: 'immediate' | 'near' | 'far' | 'unknown';
  accuracy: number;
}

const BeaconRangingModule = requireNativeModule('BeaconRanging');

/**
 * Range for iBeacons matching the given UUID using the platform native module.
 * Returns the first detected beacon's { major, minor, rssi }.
 * Throws on timeout or permission error.
 */
export async function rangeKNUBeacon(uuid: string, timeoutMs: number = 10000): Promise<BeaconResult> {
  return await BeaconRangingModule.rangeKNUBeacon(uuid, timeoutMs);
}

export async function stopRanging(): Promise<void> {
  return await BeaconRangingModule.stopRanging();
}
