const LOG_PREFIX = 'github-upload-log-';

function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getTodayLogKey() {
  return `${LOG_PREFIX}${getTodayDateString()}`;
}

export function cleanOldLogs() {
  const todayKey = getTodayLogKey();
  // Safe iteration when removing items
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOG_PREFIX) && key !== todayKey) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function logActivity(message: string) {
  const todayKey = getTodayLogKey();
  const existingLog = localStorage.getItem(todayKey) || '';
  const timestamp = new Date().toLocaleTimeString();
  const newLogEntry = `[${timestamp}] ${message}\n`;
  localStorage.setItem(todayKey, existingLog + newLogEntry);
}

export function getTodayLogContent() {
  const todayKey = getTodayLogKey();
  return localStorage.getItem(todayKey) || 'No activity logged today.';
}

export function downloadLogs() {
  const content = getTodayLogContent();
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `photo-sync-log-${getTodayDateString()}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
