// ══════════════════════════════════════════════════════
//  WOMEN'S ONLY PROPHETIC GATHERING — Central Data Store
// ══════════════════════════════════════════════════════

export const EVENT_DATA = {
  name: "WOMEN'S ONLY PROPHETIC GATHERING",
  shortName: "Prophetic Gathering",
  tagline: "The Prophetic Wife",
  theme: "The Prophetic Wife",
  subTheme: "A powerful one-day encounter for every woman — to receive, to be restored, and to walk in prophetic grace.",
  date: "26th September, 2026",
  time: "2:00 PM",
  venue: "Overcomers Nation Church, Tesano",
  dressCode: "Elegant / Modest",
  entry: "Free — Women Only",
  targetAudience: ["Women of All Ages", "Mothers", "Young Women & Girls", "Seekers of Prophetic Grace"],
  focusAreas: ["Prophetic Declaration", "Healing & Restoration", "Divine Empowerment", "Women in Ministry"],
  featuring: ["Word Ministration", "Prophetic Impartation", "Worship & Praise", "Prayer"],
  enquiries: ["0546363971"],
  org: {
    name: "Ebenezer Okronipa Ministries",
    fullName: "Ebenezer Okronipa Ministries (EOM)",
    tagline: "The Prophetic Wife",
    partners: ["Overcomers Nation Church"],
  },
};

// Social / Livestream Links — same channels as EOM
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

// ── Google Sheets Apps Script Web App URL ──────────────────────────────────
// Paste your NEW dedicated Apps Script Web App URL here after you deploy it.
export const GOOGLE_SHEET_SCRIPT_URL = "";   // ← TODO: fill in after deploying Google Apps Script

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

export const saveRegistration = (reg) => {
  const existing = getRegistrations();
  const newReg = {
    ...reg,
    id: "WPG-" + Math.floor(100000 + Math.random() * 900000),
    registeredAt: new Date().toISOString(),
    synced: false,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newReg]));

  // Background sync to Google Sheet
  if (GOOGLE_SHEET_SCRIPT_URL) {
    fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReg),
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

  return newReg;
};

export const fetchRemoteRegistrations = async (username, password) => {
  if (!GOOGLE_SHEET_SCRIPT_URL) {
    if (username === "admin" && password === "admin123") {
      return { source: "local", data: getRegistrations() };
    }
    return { source: "error", error: "Invalid admin credentials." };
  }
  try {
    const url = `${GOOGLE_SHEET_SCRIPT_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
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
  const updated = existing.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
