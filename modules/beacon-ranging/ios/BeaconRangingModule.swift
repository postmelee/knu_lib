import ExpoModulesCore
import CoreLocation

// A separate NSObject subclass is required because Expo Module cannot inherit from NSObject.
class BeaconDelegate: NSObject, CLLocationManagerDelegate {
    var onBeaconFound: (([String: Any]) -> Void)?
    var onError: ((String, String) -> Void)?
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        // Handle authorization changes if needed
    }
    
    func locationManager(_ manager: CLLocationManager, didRange beacons: [CLBeacon], satisfying constraint: CLBeaconIdentityConstraint) {
        // We no longer filter out .unknown proximity.
        // CoreLocation often returns .unknown for the first few packets or weak signals.
        // For authentication purposes, ANY detection of the correct UUID/Major/Minor is sufficient.
        guard let beacon = beacons.first else { return }
        
        onBeaconFound?([
            "major": beacon.major.intValue,
            "minor": beacon.minor.intValue,
            "rssi": beacon.rssi,
            "proximity": proximityString(beacon.proximity),
            "accuracy": beacon.accuracy
        ])
    }
    
    func locationManager(_ manager: CLLocationManager, didFailRangingFor constraint: CLBeaconIdentityConstraint, error: Error) {
        onError?("RANGING_ERROR", "비콘 탐색 실패: \(error.localizedDescription)")
    }
    
    private func proximityString(_ proximity: CLProximity) -> String {
        switch proximity {
        case .immediate: return "immediate"
        case .near: return "near"
        case .far: return "far"
        case .unknown: return "unknown"
        @unknown default: return "unknown"
        }
    }
}

public class BeaconRangingModule: Module {
    private let locationManager = CLLocationManager()
    private let beaconDelegate = BeaconDelegate()
    private var beaconConstraint: CLBeaconIdentityConstraint?
    private var pendingPromise: Promise?
    private var timeoutTimer: Timer?
    
    public func definition() -> ModuleDefinition {
        Name("BeaconRanging")
        
        AsyncFunction("rangeKNUBeacon") { (uuidString: String, timeoutMs: Int, promise: Promise) in
            self.startRanging(uuidString: uuidString, timeoutMs: timeoutMs, promise: promise)
        }
        
        AsyncFunction("stopRanging") { (promise: Promise) in
            self.stopRanging()
            promise.resolve(nil)
        }
    }
    
    private func startRanging(uuidString: String, timeoutMs: Int, promise: Promise) {
        guard let uuid = UUID(uuidString: uuidString) else {
            promise.reject("INVALID_UUID", "Invalid beacon UUID: \(uuidString)")
            return
        }
        
        // If there's already a scan running, reject the old promise
        if let existingPromise = self.pendingPromise {
            existingPromise.reject("CANCELLED", "새로운 스캔이 시작되어 기존 스캔이 취소되었습니다.")
            stopRanging()
        }
        
        self.pendingPromise = promise
        
        // Setup location manager delegate
        locationManager.delegate = beaconDelegate
        locationManager.requestWhenInUseAuthorization()
        
        // Let the delegate handle the callback
        beaconDelegate.onBeaconFound = { [weak self] result in
            self?.stopRanging()
            self?.pendingPromise?.resolve(result)
            self?.pendingPromise = nil
        }
        
        beaconDelegate.onError = { [weak self] code, message in
            self?.stopRanging()
            self?.pendingPromise?.reject(code, message)
            self?.pendingPromise = nil
        }
        
        let constraint = CLBeaconIdentityConstraint(uuid: uuid)
        self.beaconConstraint = constraint
        
        locationManager.startRangingBeacons(satisfying: constraint)
        
        let timeoutSec = Double(timeoutMs) / 1000.0
        DispatchQueue.main.async {
            self.timeoutTimer = Timer.scheduledTimer(withTimeInterval: timeoutSec, repeats: false) { [weak self] _ in
                self?.handleTimeout()
            }
        }
    }
    
    private func stopRanging() {
        if let constraint = beaconConstraint {
            locationManager.stopRangingBeacons(satisfying: constraint)
        }
        DispatchQueue.main.async {
            self.timeoutTimer?.invalidate()
            self.timeoutTimer = nil
        }
        beaconConstraint = nil
        beaconDelegate.onBeaconFound = nil
        beaconDelegate.onError = nil
    }
    
    private func handleTimeout() {
        stopRanging()
        if let promise = pendingPromise {
            promise.reject("TIMEOUT", "주변에서 도서관 비콘을 찾지 못했습니다.\n열람실 안에서 다시 시도해주세요.")
            pendingPromise = nil
        }
    }
}

