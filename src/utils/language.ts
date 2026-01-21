import type { Language } from '@/types';
import { STORAGE_KEY_LANGUAGE } from '@/utils/constants';

const VALID_LANGUAGES: Language[] = ['zh-TW', 'zh-CN', 'en'];

const parseStoredLanguage = (value: string): Language | null => {
  try {
    const parsed = JSON.parse(value);
    const candidate = parsed?.state?.language ?? parsed?.language ?? parsed;
    if (VALID_LANGUAGES.includes(candidate)) {
      return candidate;
    }
  } catch {
    if (VALID_LANGUAGES.includes(value as Language)) {
      return value as Language;
    }
  }
  return null;
};

const getStoredLanguage = (): Language | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (!stored) {
      return null;
    }
    return parseStoredLanguage(stored);
  } catch {
    return null;
  }
};

const getBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') {
    return 'zh-TW';
  }
  const raw = (navigator.languages?.[0] || navigator.language || 'zh-TW').toLowerCase();

  // 非中文 → 英文
  if (!raw.startsWith('zh')) {
    return 'en';
  }

  // BCP 47 中文語言代碼對應：
  // 繁體：zh-TW, zh-HK, zh-MO, zh-Hant, zh-Hant-*
  // 簡體：zh-CN, zh-SG, zh-Hans, zh-Hans-*
  // 純 zh：預設繁體（台灣用戶較多使用此專案）

  // 簡體地區/腳本
  if (raw === 'zh-cn' || raw === 'zh-sg' || raw.includes('hans')) {
    return 'zh-CN';
  }

  // 繁體地區/腳本（含純 zh 預設）
  return 'zh-TW';
};

export const getInitialLanguage = (): Language => getStoredLanguage() ?? getBrowserLanguage();
