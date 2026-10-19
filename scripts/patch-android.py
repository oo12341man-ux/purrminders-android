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
# Done / Paid buttons work without opening the app (see android-src/PurrActionReceiver.java)
if 'PurrActionReceiver' not in s:
    s, nr = re.subn(r'(</application>)', '    <receiver android:name=".PurrActionReceiver" android:exported="false" />\n    \\1', s, 1)
    if not nr: sys.exit('could not add the Done-button receiver to the manifest')
open(man, 'w').write(s)
jdir = 'android/app/src/main/java/com/purrminders/cats'
if not os.path.isdir(jdir): sys.exit('app java folder not found: ' + jdir)
shutil.copy('android-src/PurrActionReceiver.java', jdir)
ln = None
for root, _, files in os.walk('node_modules/@capacitor/local-notifications/android'):
    for f in files:
        if f.startswith('LocalNotificationManager.'): ln = os.path.join(root, f)
if not ln: sys.exit('notification plugin source not found')
print('notification buttons: patching', ln)
j = open(ln).read()
if 'PurrActionReceiver' not in j:
    j, nl = re.subn(r'PendingIntent actionPendingIntent = PendingIntent\.getActivity\(',
        'if (!"snooze".equals(notificationAction.getId())) { actionIntent.setComponent(new android.content.ComponentName(context.getPackageName(), "com.purrminders.cats.PurrActionReceiver")); actionIntent.setFlags(0); }\n'
        '                PendingIntent actionPendingIntent = !"snooze".equals(notificationAction.getId()) ? PendingIntent.getBroadcast(context, localNotification.getId() + notificationAction.getId().hashCode(), actionIntent, flags) : PendingIntent.getActivity(', j, 1)
    if not nl:
        for i, line in enumerate(j.splitlines()):
            if 'PendingIntent' in line or 'action' in line.lower(): print(i, line)
        sys.exit('could not patch notification buttons in ' + ln)
    open(ln, 'w').write(j)
res = 'android/app/src/main/res'
for d in os.listdir('android-res'):
    for f in os.listdir(os.path.join('android-res', d)):
        os.makedirs(os.path.join(res, d), exist_ok=True)
        shutil.copy(os.path.join('android-res', d, f), os.path.join(res, d, f))
g = 'android/app/build.gradle'
s = open(g).read()
s, n1 = re.subn(r'versionCode(\s*=?\s*)\d+', lambda m: 'versionCode%s%d' % (m.group(1), run), s)
s, n2 = re.subn(r'versionName(\s*=?\s*)"[^"]*"', lambda m: 'versionName%s"1.0.%d"' % (m.group(1), run), s)
if not (n1 and n2): sys.exit('could not set the app version in build.gradle')
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
    s, n3 = re.subn(r'(buildTypes\s*\{\s*release\s*\{)', r'\1\n            signingConfig = signingConfigs.release', s, 1)
    if not n3: sys.exit('could not add release signing to build.gradle')
open(g, 'w').write(s)
print('patched: permissions, icons, sounds, Done-button receiver, version 1.0.%d, signing' % run)
