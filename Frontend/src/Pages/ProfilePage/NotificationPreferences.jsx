import { useState, useEffect } from "react";
import { Switch, message, Spin } from "antd";
import { BellOutlined, SafetyOutlined } from "@ant-design/icons";
import {
  useUpdateNotificationPreferencesMutation,
} from "../redux/api/routesApi";
import { useGetProfileQuery } from "../redux/api/userApi";

const PREF_OPTIONS = [
  {
    key:     "maintenance",
    label:   "Maintenance Reminders",
    desc:    "Alerts when maintenance is due or overdue — by mileage, date, or generator hours",
  },
  {
    key:     "repairOrders",
    label:   "Repair Order Updates",
    desc:    "Notified when a repair order status changes (pending → in-progress → completed)",
  },
  {
    key:     "mpgAlerts",
    label:   "MPG Drop Alerts",
    desc:    "Alert when your fuel economy drops more than 25% below your rolling average",
  },
  {
    key:     "tripReminders",
    label:   "Trip Reminders",
    desc:    '"End trip?" reminder after 24 hours — and prompt to log campgrounds',
  },
  {
    key:     "warrantyExpiry",
    label:   "Warranty Expiration Warnings",
    desc:    "Alerts 30 days before any component warranty expires",
  },
  {
    key:     "generatorService",
    label:   "Generator Service Reminders",
    desc:    "Oil change (100 hrs), air filter (200 hrs), spark plugs (300 hrs)",
  },
];

const DEFAULT_PREFS = {
  maintenance:      true,
  repairOrders:     true,
  mpgAlerts:        true,
  tripReminders:    true,
  warrantyExpiry:   true,
  generatorService: true,
};

const NotificationPreferences = () => {
  const { data: profileData } = useGetProfileQuery();
  const [updatePrefs, { isLoading: saving }] = useUpdateNotificationPreferencesMutation();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [pushGranted, setPushGranted] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  useEffect(() => {
    if (profileData?.user?.notificationPreferences) {
      setPrefs({ ...DEFAULT_PREFS, ...profileData.user.notificationPreferences });
    }
  }, [profileData]);

  const handleToggle = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      await updatePrefs(next).unwrap();
      message.success("Preferences saved");
    } catch {
      message.error("Failed to save preferences");
      setPrefs(prefs); // revert on error
    }
  };

  const requestPushPermission = async () => {
    if (!("Notification" in window)) {
      message.warning("Your browser does not support push notifications");
      return;
    }
    const result = await Notification.requestPermission();
    if (result === "granted") {
      setPushGranted(true);
      message.success("Browser notifications enabled!");
      // Show a test notification
      new Notification("My RV Vault", {
        body: "You'll now receive in-browser alerts for urgent items.",
        icon: "/favicon.ico",
      });
    } else {
      message.info("Permission denied — you can enable this in your browser settings");
    }
  };

  return (
    <div className="space-y-5">

      {/* Browser push permission */}
      <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8F0E8]">
          <BellOutlined className="text-[#3B7D3C]" />
          <h3 className="text-base font-semibold text-[#1A1A1A]">Browser Notifications</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">
              {pushGranted ? "Browser notifications enabled" : "Enable browser notifications"}
            </p>
            <p className="text-xs text-[#5A5A5A] mt-0.5">
              {pushGranted
                ? "You will see native desktop alerts for high-priority items"
                : "Get native desktop alerts even when the tab is in the background"}
            </p>
          </div>
          {pushGranted ? (
            <span className="text-xs font-semibold text-[#3B7D3C] bg-[#E8F0E8] px-3 py-1.5 rounded-full">
              Enabled ✓
            </span>
          ) : (
            <button
              onClick={requestPushPermission}
              className="text-sm font-medium text-white bg-[#3B7D3C] hover:bg-[#2d6130] px-4 py-2 rounded-xl transition-all"
            >
              Enable
            </button>
          )}
        </div>
      </div>

      {/* Per-type toggles */}
      <div className="bg-white border border-[#E8F0E8] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8F0E8]">
          <SafetyOutlined className="text-[#3B7D3C]" />
          <h3 className="text-base font-semibold text-[#1A1A1A]">Notification Types</h3>
          {saving && <Spin size="small" className="ml-auto" />}
        </div>
        <div className="space-y-4">
          {PREF_OPTIONS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A1A1A]">{label}</p>
                <p className="text-xs text-[#5A5A5A] mt-0.5">{desc}</p>
              </div>
              <Switch
                checked={prefs[key] ?? true}
                onChange={(v) => handleToggle(key, v)}
                style={{ backgroundColor: prefs[key] ? "#3B7D3C" : undefined }}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default NotificationPreferences;
