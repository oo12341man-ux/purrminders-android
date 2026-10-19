package com.purrminders.cats;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.app.NotificationManagerCompat;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Done / Paid buttons on a notification: handled right here, without opening the app.
 * The notification disappears, any later follow-up for the same thing is cancelled,
 * and the tick is saved in a small queue that Purrminders reads the next time it runs.
 */
public class PurrActionReceiver extends BroadcastReceiver {
    static final String KEY_ID = "LocalNotificationId";
    static final String KEY_ACTION = "LocalNotificationUserAction";
    static final String KEY_OBJ = "LocalNotficationObject";

    @Override
    public void onReceive(Context context, Intent intent) {
        int id = intent.getIntExtra(KEY_ID, Integer.MIN_VALUE);
        String action = intent.getStringExtra(KEY_ACTION);
        String obj = intent.getStringExtra(KEY_OBJ);
        if (id == Integer.MIN_VALUE || action == null) return;
        try { NotificationManagerCompat.from(context).cancel(id); } catch (Exception e) { }
        JSONObject extra = null;
        try {
            if (obj != null) extra = new JSONObject(obj).optJSONObject("extra");
        } catch (Exception e) { }
        // follow-ups for the same thing (e.g. "reminder again" 30 minutes later) are no longer needed
        if (extra != null) {
            JSONArray cancel = extra.optJSONArray("cancel");
            if (cancel != null) for (int i = 0; i < cancel.length(); i++) cancelLater(context, cancel.optInt(i));
        }
        try {
            JSONObject q = new JSONObject();
            q.put("id", id);
            q.put("action", action);
            q.put("at", System.currentTimeMillis());
            q.put("extra", extra != null ? extra : JSONObject.NULL);
            // the same storage the app reads through Capacitor Preferences
            SharedPreferences sp = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            sp.edit().putString("purr_act_" + System.currentTimeMillis() + "_" + id, q.toString()).apply();
        } catch (Exception e) { }
    }

    private static void cancelLater(Context context, int nid) {
        try { NotificationManagerCompat.from(context).cancel(nid); } catch (Exception e) { }
        try {
            Intent i = new Intent(context, com.capacitorjs.plugins.localnotifications.TimedNotificationPublisher.class);
            int flags = 0;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) flags = PendingIntent.FLAG_MUTABLE;
            PendingIntent pi = PendingIntent.getBroadcast(context, nid, i, flags);
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (pi != null && am != null) am.cancel(pi);
        } catch (Exception e) { }
    }
}
