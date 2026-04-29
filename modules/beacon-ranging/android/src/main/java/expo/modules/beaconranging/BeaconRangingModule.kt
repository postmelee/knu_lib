package expo.modules.beaconranging

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID

private const val APPLE_MANUFACTURER_ID = 0x004C

data class ParsedBeacon(
  val uuid: UUID,
  val major: Int,
  val minor: Int
)

class BeaconRangingModule : Module() {
  private val mainHandler = Handler(Looper.getMainLooper())
  private var scanner: BluetoothLeScanner? = null
  private var scanCallback: ScanCallback? = null
  private var pendingPromise: Promise? = null
  private var timeoutRunnable: Runnable? = null
  private var targetUuid: UUID? = null

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("BeaconRanging")

    AsyncFunction("rangeKNUBeacon") { uuidString: String, timeoutMs: Int, promise: Promise ->
      startRanging(uuidString, timeoutMs, promise)
    }

    AsyncFunction("stopRanging") {
      stopRanging()
    }
  }

  private fun startRanging(uuidString: String, timeoutMs: Int, promise: Promise) {
    val uuid = runCatching { UUID.fromString(uuidString) }.getOrNull()
    if (uuid == null) {
      promise.reject("INVALID_UUID", "Invalid beacon UUID: $uuidString", null)
      return
    }

    if (!hasRequiredPermissions()) {
      promise.reject("PERMISSION_DENIED", "블루투스 및 위치 권한이 필요합니다.", null)
      return
    }

    if (!isLocationEnabled()) {
      promise.reject("LOCATION_DISABLED", "기기 위치 서비스가 꺼져 있습니다. 위치 서비스를 켠 뒤 다시 시도해주세요.", null)
      return
    }

    val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    val adapter = bluetoothManager?.adapter
    if (adapter == null || !adapter.isEnabled) {
      promise.reject("BLUETOOTH_OFF", "블루투스를 켜주세요.", null)
      return
    }

    val bluetoothScanner = adapter.bluetoothLeScanner
    if (bluetoothScanner == null) {
      promise.reject("SCANNER_UNAVAILABLE", "BLE 스캐너를 사용할 수 없습니다.", null)
      return
    }

    if (pendingPromise != null) {
      pendingPromise?.reject("CANCELLED", "새로운 스캔이 시작되어 기존 스캔이 취소되었습니다.", null)
      stopRanging()
    }

    targetUuid = uuid
    pendingPromise = promise
    scanner = bluetoothScanner

    val settingsBuilder = ScanSettings.Builder()
      .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
      .setCallbackType(ScanSettings.CALLBACK_TYPE_ALL_MATCHES)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      settingsBuilder
        .setMatchMode(ScanSettings.MATCH_MODE_AGGRESSIVE)
        .setNumOfMatches(ScanSettings.MATCH_NUM_MAX_ADVERTISEMENT)
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      settingsBuilder.setLegacy(true)
    }

    scanCallback = object : ScanCallback() {
      override fun onScanResult(callbackType: Int, result: ScanResult) {
        handleScanResult(result)
      }

      override fun onBatchScanResults(results: MutableList<ScanResult>) {
        results.forEach(::handleScanResult)
      }

      override fun onScanFailed(errorCode: Int) {
        rejectPending("SCAN_FAILED", "BLE 스캔 오류: ${scanErrorMessage(errorCode)}")
      }
    }

    val timeoutMsSafe = timeoutMs.coerceAtLeast(1000)
    timeoutRunnable = Runnable {
      rejectPending("TIMEOUT", "주변에서 도서관 비콘을 찾지 못했습니다.\n열람실 안에서 다시 시도해주세요.")
    }

    try {
      startNativeScan(bluetoothScanner, settingsBuilder.build())
      mainHandler.postDelayed(timeoutRunnable!!, timeoutMsSafe.toLong())
    } catch (error: SecurityException) {
      rejectPending("PERMISSION_DENIED", "블루투스 및 위치 권한이 필요합니다.")
    } catch (error: Throwable) {
      rejectPending("SCAN_ERROR", "BLE 스캔 오류: ${error.localizedMessage ?: "알 수 없는 오류"}")
    }
  }

  @SuppressLint("MissingPermission")
  private fun startNativeScan(bluetoothScanner: BluetoothLeScanner, settings: ScanSettings) {
    bluetoothScanner.startScan(null, settings, scanCallback)
  }

  private fun handleScanResult(result: ScanResult) {
    val uuid = targetUuid ?: return
    val parsedBeacon = parseIBeacon(result.scanRecord?.getManufacturerSpecificData(APPLE_MANUFACTURER_ID), uuid)
      ?: parseIBeacon(result.scanRecord?.bytes, uuid)
      ?: return

    resolvePending(
      mapOf(
        "major" to parsedBeacon.major,
        "minor" to parsedBeacon.minor,
        "rssi" to result.rssi,
        "proximity" to "unknown",
        "accuracy" to -1.0
      )
    )
  }

  private fun parseIBeacon(bytes: ByteArray?, expectedUuid: UUID): ParsedBeacon? {
    if (bytes == null) return null

    parseIBeaconAt(bytes, 0)?.let {
      if (it.uuid == expectedUuid) return it
    }

    for (offset in 0..(bytes.size - 23)) {
      parseIBeaconAt(bytes, offset)?.let {
        if (it.uuid == expectedUuid) return it
      }
    }

    return null
  }

  private fun parseIBeaconAt(bytes: ByteArray, offset: Int): ParsedBeacon? {
    if (offset < 0 || offset >= bytes.size) return null

    val hasCompanyId = bytes.hasBytesAt(offset, 0x4C, 0x00, 0x02, 0x15)
    val hasBeaconPayload = bytes.hasBytesAt(offset, 0x02, 0x15)

    val uuidStart = when {
      hasCompanyId && bytes.size >= offset + 25 -> offset + 4
      hasBeaconPayload && bytes.size >= offset + 23 -> offset + 2
      else -> return null
    }

    val majorOffset = uuidStart + 16
    val minorOffset = majorOffset + 2
    if (bytes.size < minorOffset + 2) return null

    return ParsedBeacon(
      uuid = uuidFromBytes(bytes, uuidStart),
      major = readUnsignedShort(bytes, majorOffset),
      minor = readUnsignedShort(bytes, minorOffset)
    )
  }

  private fun uuidFromBytes(bytes: ByteArray, offset: Int): UUID {
    var mostSignificantBits = 0L
    var leastSignificantBits = 0L

    for (index in 0 until 8) {
      mostSignificantBits = (mostSignificantBits shl 8) or (bytes[offset + index].toLong() and 0xFF)
    }
    for (index in 8 until 16) {
      leastSignificantBits = (leastSignificantBits shl 8) or (bytes[offset + index].toLong() and 0xFF)
    }

    return UUID(mostSignificantBits, leastSignificantBits)
  }

  private fun readUnsignedShort(bytes: ByteArray, offset: Int): Int {
    return ((bytes[offset].toInt() and 0xFF) shl 8) or (bytes[offset + 1].toInt() and 0xFF)
  }

  private fun ByteArray.hasBytesAt(offset: Int, vararg values: Int): Boolean {
    if (offset < 0 || size < offset + values.size) return false
    return values.indices.all { index -> (this[offset + index].toInt() and 0xFF) == values[index] }
  }

  private fun hasRequiredPermissions(): Boolean {
    val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      listOf(
        Manifest.permission.BLUETOOTH_SCAN,
        Manifest.permission.BLUETOOTH_CONNECT,
        Manifest.permission.ACCESS_FINE_LOCATION
      )
    } else {
      listOf(Manifest.permission.ACCESS_FINE_LOCATION)
    }

    return permissions.all {
      ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
    }
  }

  private fun isLocationEnabled(): Boolean {
    val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return true
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      locationManager.isLocationEnabled
    } else {
      locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
        locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
    }
  }

  private fun scanErrorMessage(errorCode: Int): String {
    return when (errorCode) {
      ScanCallback.SCAN_FAILED_ALREADY_STARTED -> "이미 스캔이 진행 중입니다."
      ScanCallback.SCAN_FAILED_APPLICATION_REGISTRATION_FAILED -> "BLE 스캔 등록에 실패했습니다."
      ScanCallback.SCAN_FAILED_FEATURE_UNSUPPORTED -> "이 기기에서 BLE 스캔 기능을 지원하지 않습니다."
      ScanCallback.SCAN_FAILED_INTERNAL_ERROR -> "Android BLE 내부 오류가 발생했습니다."
      else -> "오류 코드 $errorCode"
    }
  }

  @SuppressLint("MissingPermission")
  private fun stopRanging() {
    timeoutRunnable?.let { mainHandler.removeCallbacks(it) }
    timeoutRunnable = null

    val callback = scanCallback
    val activeScanner = scanner
    if (callback != null && activeScanner != null) {
      runCatching { activeScanner.stopScan(callback) }
    }

    scanCallback = null
    scanner = null
    targetUuid = null
  }

  private fun resolvePending(value: Map<String, Any>) {
    val promise = pendingPromise ?: return
    stopRanging()
    pendingPromise = null
    promise.resolve(value)
  }

  private fun rejectPending(code: String, message: String) {
    val promise = pendingPromise ?: return
    stopRanging()
    pendingPromise = null
    promise.reject(code, message, null)
  }
}
