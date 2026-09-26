// ══════════════════════════════════════════════════════
//  WOMEN'S ONLY PROPHETIC GATHERING - Central Data Store
// ══════════════════════════════════════════════════════

export const EVENT_DATA = {
  name: "WOMEN'S ONLY PROPHETIC GATHERING",
  shortName: "Prophetic Gathering",
  tagline: "The Prophetic Wife",
  theme: "The Prophetic Wife",
  subTheme: "A powerful one-day encounter for every woman. To receive, to be restored, and to walk in prophetic grace.",
  date: "26th September, 2026",
  time: "2:00 PM",
  venue: "Overcomers Nation Church, Tesano",
  dressCode: "Elegant / Modest",
  entry: "Free | Women Only",
  targetAudience: ["Women of All Ages", "Mothers", "Young Women & Girls", "Seekers of Prophetic Grace"],
  focusAreas: ["Prophetic Declaration", "Healing & Restoration", "Divine Empowerment", "Women in Ministry"],
  featuring: ["Word Ministration", "Prophetic Impartation", "Worship & Praise", "Prayer"],
  enquiries: ["0546363971"],
  org: {
    name: "Covered Women Network",
    fullName: "Covered Women Network (EOM)",
    tagline: "The Prophetic Wife",
    partners: ["Ebenezer Okronipa Ministries", "Overcomers Nation Church"],
  },
};

// Social / Livestream Links - same channels as EOM
export const SOCIAL_LINKS = [
  {
    id: 1,
    platform: "Facebook",
    handle: "Rev. Dr. Ebenezer Okronipa",
    url: "https://www.facebook.com/EbenezerOkronipa",
    color: "#1877F2",
    isLivestream: true,
    description: "Follow us and watch the Live Stream here",
  },
  {
    id: 2,
    platform: "YouTube",
    handle: "@revdrebenezerokronipa",
    url: "https://youtube.com/@revdrebenezerokronipa?si=4eJbG0oabTvyVhrH",
    color: "#FF0000",
    isLivestream: false,
    description: "Subscribe for messages and livestream archives",
  },
  {
    id: 3,
    platform: "Instagram",
    handle: "@rev.dr.ebenezer_okronipa",
    url: "https://www.instagram.com/rev.dr.ebenezer_okronipa",
    color: "#E1306C",
    isLivestream: false,
    description: "Follow for updates, photos and daily clips",
  },
  {
    id: 4,
    platform: "TikTok",
    handle: "@rev.dr.ebenezerokronipa",
    url: "https://www.tiktok.com/@rev.dr.ebenezerokronipa?_r=1&_t=ZS-97utVLUStN2",
    color: "#010101",
    isLivestream: false,
    description: "Follow us for clips and spiritual highlights",
  },
];

export const GOOGLE_SHEET_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SHEET_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzRV5pKJ3E_dAE5MI2JrJOtgAM_ihZWhxp0cKM1VLyRGYNedMuOP4hCdzMZYnWRMSpR/exec";

// ── localStorage key ────────────────────────────────────────────────────────
export const STORAGE_KEY = "womens_prophetic_gathering_registrations";

// ── Local helpers ────────────────────────────────────────────────────────────
export const getRegistrations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const MASTER_GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxrwGVmGE6FDpOFDxG3_3nnVbmb-X0pO5jGoC5B0-yBH3b946ETM_v_LzFadyJvtjBj/exec";

export const saveRegistration = (reg) => {
  const existing = getRegistrations();
  const newReg = {
    ...reg,
    id: "WPG-" + Math.floor(100000 + Math.random() * 900000),
    action: "womensRegister",
    registeredAt: new Date().toISOString(),
    synced: false,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newReg]));

  const payloadStr = JSON.stringify(newReg);

  // 1. Sync to dedicated Women's Google Sheet
  if (GOOGLE_SHEET_SCRIPT_URL) {
    fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: payloadStr,
    })
      .then(() => {
        try {
          const current = getRegistrations();
          const updated = current.map(r =>
            r.id === newReg.id ? { ...r, synced: true } : r
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
      })
      .catch(err => console.error("Google Sheet sync failed:", err));
  }

  // 2. Dual-sync to Master Admin Google Sheet
  if (MASTER_GOOGLE_SHEET_SCRIPT_URL && MASTER_GOOGLE_SHEET_SCRIPT_URL !== GOOGLE_SHEET_SCRIPT_URL) {
    fetch(MASTER_GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: payloadStr,
    }).catch(err => console.error("Master Google Sheet sync failed:", err));
  }

  return newReg;
};

export const fetchRemoteRegistrations = async (username, password) => {
  if (!GOOGLE_SHEET_SCRIPT_URL) {
    if (username === "admin" || username === "2500") {
      return { source: "local", data: getRegistrations() };
    }
    return { source: "error", error: "Invalid admin credentials." };
  }
  try {
    const authUser = (username === "2500" || username === "admin") ? username : "admin";
    const authPass = password || "admin123";
    const url = `${GOOGLE_SHEET_SCRIPT_URL}?username=${encodeURIComponent(authUser)}&password=${encodeURIComponent(authPass)}`;
    const res = await fetch(url, { method: "GET" });
    const json = await res.json();
    if (json.status === "SUCCESS" && Array.isArray(json.registrations)) {
      return { source: "remote", data: json.registrations };
    }
    return { source: "error", error: json.message || "Authentication failed" };
  } catch (err) {
    console.error("Database Fetch Error:", err);
    return { source: "error", error: "Database connection failed." };
  }
};

export const deleteLocalRegistration = (id) => {
  const existing = getRegistrations();
  const toDelete = existing.find(r => r.id === id);
  const updated = existing.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Also cascade delete from attendance storage so deleted registrants do not linger in attendance
  try {
    const existingAtt = getAttendance();
    const regName = toDelete ? (toDelete.fullName || toDelete.name || '').trim().toLowerCase() : '';
    const updatedAtt = existingAtt.filter(a => {
      if (a.registrationId && a.registrationId === id) return false;
      if (regName && (a.name || '').trim().toLowerCase() === regName) return false;
      return true;
    });
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updatedAtt));
  } catch (_) {}

  // Remote delete from Google Sheet if configured
  if (GOOGLE_SHEET_SCRIPT_URL) {
    const regName = toDelete ? (toDelete.fullName || toDelete.name || '') : '';
    fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteRegistration", id, name: regName }),
    }).catch(() => {});
  }

  return updated;
};

export const exportToCSV = (registrations) => {
  if (!registrations.length) return "";
  const headers = Object.keys(registrations[0]);
  const rows = registrations.map(r =>
    headers.map(h => `"${(r[h] || "").toString().replace(/"/g, '""')}"`).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
};

// ══════════════════════════════════════════════════════
//  ATTENDANCE & CHECK-IN STORE
// ══════════════════════════════════════════════════════

export const ATTENDANCE_STORAGE_KEY = "womens_prophetic_gathering_attendance";

export const getAttendance = () => {
  try {
    const data = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const overwriteAttendanceFromRemote = (records) => {
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
  } catch (_) {}
};

/**
 * Mark a woman attendee present / walk-in for the gathering.
 * Mimics Faith Convention markAttendance.
 */
export const markAttendance = ({ registrationId, name, phone, sessionDate = "26th September, 2026", isWalkin = false }) => {
  const existing = getAttendance();

  // Prevent duplicate marking
  const trimmedName = (name || '').trim().toLowerCase();
  const alreadyMarked = existing.find(a =>
    (a.sessionDate === sessionDate) && (
      (registrationId && a.registrationId === registrationId) ||
      (!registrationId && a.name.toLowerCase() === trimmedName)
    )
  );

  if (alreadyMarked) {
    return { duplicate: true, record: alreadyMarked };
  }

  const record = {
    id: "WATT-" + Math.floor(100000 + Math.random() * 900000),
    registrationId: registrationId || null,
    name: name ? name.trim() : "Unknown",
    phone: phone || "",
    sessionDate,
    isWalkin,
    checkedInAt: new Date().toISOString(),
    synced: false,
  };

  const updated = [...existing, record];
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));

  const payload = { action: "attendance", ...record };
  const payloadStr = JSON.stringify(payload);

  // 1. Sync to dedicated Women's Google Sheet
  if (GOOGLE_SHEET_SCRIPT_URL) {
    fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: payloadStr,
    })
      .then(() => {
        try {
          const current = getAttendance();
          const synced = current.map(a => a.id === record.id ? { ...a, synced: true } : a);
          localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(synced));
        } catch (_) {}
      })
      .catch(err => console.error("Women's Attendance sync failed:", err));
  }

  // 2. Dual-sync to Master Church Sheet
  if (MASTER_GOOGLE_SHEET_SCRIPT_URL && MASTER_GOOGLE_SHEET_SCRIPT_URL !== GOOGLE_SHEET_SCRIPT_URL) {
    fetch(MASTER_GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "womensAttendance", ...record }),
    }).catch(err => console.error("Master attendance sync failed:", err));
  }

  return { duplicate: false, record };
};

/**
 * Fetch all attendance records from Google Sheet
 */
export const fetchAttendanceFromSheet = async (username, password) => {
  if (!GOOGLE_SHEET_SCRIPT_URL) {
    return { source: "local", data: getAttendance() };
  }
  try {
    const authUser = (username === "2500" || username === "admin") ? username : "admin";
    const authPass = password || "admin123";
    const url = `${GOOGLE_SHEET_SCRIPT_URL}?action=getAttendance&username=${encodeURIComponent(authUser)}&password=${encodeURIComponent(authPass)}`;
    const res = await fetch(url, { method: "GET" });
    const json = await res.json();
    if (json.status === "SUCCESS" && Array.isArray(json.attendance)) {
      return { source: "remote", data: json.attendance };
    }
    return { source: "local", data: getAttendance() };
  } catch (err) {
    console.error("Attendance fetch error:", err);
    return { source: "local", data: getAttendance() };
  }
};

/**
 * Export attendance records to CSV
 */
export const exportAttendanceToCSV = (records) => {
  if (!records.length) return "";
  const headers = ["id", "registrationId", "name", "phone", "sessionDate", "isWalkin", "checkedInAt"];
  const rows = records.map(r =>
    headers.map(h => `"${(r[h] !== undefined ? String(r[h]) : "").replace(/"/g, '""')}"`).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
};

/**
 * Delete single attendance record locally and remotely
 */
export const deleteAttendanceRecord = (id) => {
  const existing = getAttendance();
  const updated = existing.filter(a => a.id !== id);
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));

  if (GOOGLE_SHEET_SCRIPT_URL) {
    fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteAttendance", id }),
    }).catch(() => {});
  }
  if (MASTER_GOOGLE_SHEET_SCRIPT_URL && MASTER_GOOGLE_SHEET_SCRIPT_URL !== GOOGLE_SHEET_SCRIPT_URL) {
    fetch(MASTER_GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteAttendance", id, username: "2500" }),
    }).catch(() => {});
  }
  return updated;
};

/**
 * Quick walk-in registration on site at the door
 */
export const saveWalkinRegistration = ({ fullName, phone = "", email = "", memberStatus = "Visitor", location = "", prayerRequest = "" }) => {
  const regRecord = saveRegistration({
    fullName,
    phone,
    email,
    attendanceMode: "In-Person",
    memberStatus,
    location,
    prayerRequest,
    isWalkin: true,
  });

  const attResult = markAttendance({
    registrationId: regRecord.id,
    name: fullName,
    phone,
    isWalkin: true,
  });

  return { registration: regRecord, attendance: attResult.record };
};

