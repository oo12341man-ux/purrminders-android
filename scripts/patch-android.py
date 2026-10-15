"""Adds alarms permissions, icons, version and release signing to the generated Android project."""
import os, re, shutil, sys
run = int(os.environ.get('GITHUB_RUN_NUMBER', '1'))
man = 'android/app/src/main/AndroidManifest.xml'
s = open(man).read()
perms = ['<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
         '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" android:maxSdkVersion="32" />',
         '<uses-permission android:name="android.permission.USE_EXACT_ALARM" />',
         '<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />',
         '<uses-permission android:name="android.permission.WAKE_LOCK" />',
         '<uses-permission android:name="android.permission.VIBRATE" />',
         '<uses-permission android:name="android.permission.CAMERA" />',
         '<uses-permission android:name="android.permission.READ_CALENDAR" />']
add = '\n    '.join(p for p in perms if p.split('"')[1] not in s)
s = s.replace('</manifest>', '    ' + add + '\n</manifest>') if add else s
open(man, 'w').write(s)
res = 'android/app/src/main/res'
for d in os.listdir('android-res'):
    for f in os.listdir(os.path.join('android-res', d)):
        os.makedirs(os.path.join(res, d), exist_ok=True)
        shutil.copy(os.path.join('android-res', d, f), os.path.join(res, d, f))
g = 'android/app/build.gradle'
s = open(g).read()
s = re.sub(r'versionCode \d+', 'versionCode %d' % run, s)
s = re.sub(r'versionName "[^"]*"', 'versionName "1.0.%d"' % run, s)
if 'signingConfigs' not in s:
    sign = '''
    signingConfigs {
        release {
            storeFile file(System.getenv("PURR_KEYSTORE") ?: "missing.jks")
            storePassword System.getenv("PURR_KEYSTORE_PASSWORD")
            keyAlias "purr"
            keyPassword System.getenv("PURR_KEYSTORE_PASSWORD")
        }
    }
'''
    s = s.replace('android {', 'android {' + sign, 1)
    s = re.sub(r'(buildTypes\s*\{\s*release\s*\{)', r'\1\n            signingConfig signingConfigs.release', s, 1)
open(g, 'w').write(s)
print('patched: permissions, icons, version 1.0.%d, signing' % run)
