"""
Detox E2E Test Configuration

End-to-end testing configuration for React Native app using Detox.
Tests complete user flows including onboarding, broker connection,
formula subscription, and trade execution.
"""

module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/AutoTradingApp.app',
      build: 'xcodebuild -workspace ios/AutoTradingApp.xcworkspace -scheme AutoTradingApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      device: {
        type: 'iPhone 14',
        os: 'iOS 16.0',
      },
    },
    'ios.sim.release': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/AutoTradingApp.app',
      build: 'xcodebuild -workspace ios/AutoTradingApp.xcworkspace -scheme AutoTradingApp -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
      device: {
        type: 'iPhone 14',
        os: 'iOS 16.0',
      },
    },
    'android.emu.debug': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      device: {
        avdName: 'Pixel_4_API_30',
      },
    },
    'android.emu.release': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      device: {
        avdName: 'Pixel_4_API_30',
      },
    },
  },
  testTimeout: 120000,
  retries: 2,
  artifacts: {
    rootDir: './e2e/artifacts',
    pathBuilder: './e2e/path-builder.js',
    plugins: {
      instruments: 'all',
      log: 'all',
      screenshot: 'all',
      video: 'all',
    },
  },
};
