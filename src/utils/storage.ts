import { RombelData, RombelInfo, createInitialRombelData, ALL_ROMBELS, DEFAULT_SCHOOL_LOGO_URL } from '../types';

const STORAGE_PREFIX = 'rapor_km_sd_rombel_';
const AUTH_PREFIX = 'rapor_km_sd_auth_';

export function getRombelStorageKey(rombelId: string): string {
  return `${STORAGE_PREFIX}${rombelId.toUpperCase()}`;
}

export function getRombelAuthKey(rombelId: string): string {
  return `${AUTH_PREFIX}${rombelId.toUpperCase()}`;
}

export function loadRombelData(rombelInfoOrId: RombelInfo | string): RombelData {
  const rombelInfo: RombelInfo =
    typeof rombelInfoOrId === 'string'
      ? findRombelById(rombelInfoOrId) || {
          id: rombelInfoOrId,
          grade: parseInt(rombelInfoOrId.charAt(0), 10) || 1,
          name: `Kelas ${rombelInfoOrId}`,
          phase: 'Fase A',
        }
      : rombelInfoOrId;

  try {
    const key = getRombelStorageKey(rombelInfo.id);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = createInitialRombelData(rombelInfo);
      saveRombelData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as RombelData;
    
    // Ensure all mandatory objects exist to prevent runtime undefined crashes
    if (!parsed.identity) {
      parsed.identity = createInitialRombelData(rombelInfo).identity;
    } else {
      if (parsed.identity.npsn === '20218330' || !parsed.identity.npsn) {
        parsed.identity.npsn = '20219135';
      }
      if (!parsed.identity.logoUrl) {
        parsed.identity.logoUrl = DEFAULT_SCHOOL_LOGO_URL;
      }
    }
    if (!parsed.subjects || parsed.subjects.length === 0) {
      parsed.subjects = createInitialRombelData(rombelInfo).subjects;
    }
    if (!parsed.students) parsed.students = [];
    if (!parsed.grades) parsed.grades = {};
    if (!parsed.descriptions) parsed.descriptions = {};
    if (!parsed.attendance) parsed.attendance = {};
    if (!parsed.notes) parsed.notes = {};
    if (!parsed.extracurriculars) parsed.extracurriculars = {};
    if (!parsed.learningObjectives) parsed.learningObjectives = {};
    if (!parsed.tpAssessments) parsed.tpAssessments = {};
    if (!parsed.tpScores) parsed.tpScores = {};
    if (!parsed.loginUser) {
      parsed.loginUser = {
        username: `guru${rombelInfo.id.toLowerCase()}`,
        passwordHash: '123456',
      };
    }
    return parsed;
  } catch (error) {
    console.error('Error loading rombel data from localStorage:', error);
    return createInitialRombelData(rombelInfo);
  }
}

export function saveRombelData(data: RombelData): { success: boolean; timestamp: string } {
  try {
    const timestamp = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const updatedData: RombelData = {
      ...data,
      lastSavedTime: timestamp,
    };
    const key = getRombelStorageKey(data.rombelId);
    localStorage.setItem(key, JSON.stringify(updatedData));
    return { success: true, timestamp };
  } catch (error) {
    console.error('Error saving rombel data:', error);
    return { success: false, timestamp: '' };
  }
}

export function getRombelAuth(rombelId: string): boolean {
  try {
    const key = getRombelAuthKey(rombelId);
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export const getStoredAuthSession = getRombelAuth;

export function setRombelAuth(rombelId: string, isAuthenticated: boolean): void {
  try {
    const key = getRombelAuthKey(rombelId);
    if (isAuthenticated) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('Error setting auth:', e);
  }
}

export const setStoredAuthSession = setRombelAuth;

export function exportBackupJSON(data: RombelData): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `BACKUP_Rapor_${data.identity.rombel.replace(/\s+/g, '_')}_${timestamp}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function findRombelById(rombelId: string): RombelInfo | undefined {
  return ALL_ROMBELS.find((r) => r.id.toUpperCase() === rombelId.toUpperCase());
}
