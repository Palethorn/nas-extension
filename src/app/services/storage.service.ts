import { Injectable } from '@angular/core';

type StorageGetCallback<T> = (value: T | undefined) => void;

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  static readonly STORAGE_API_CHROME = 0;
  static readonly STORAGE_API_BROWSER = 1;

  private storageApi: number = StorageService.STORAGE_API_BROWSER;

  constructor() {
    if (typeof chrome !== 'undefined' && chrome.storage !== undefined) {
      this.storageApi = StorageService.STORAGE_API_CHROME;
    }
  }

  get<T>(key: string, getSuccess: StorageGetCallback<T> | null = null): void {
    if (StorageService.STORAGE_API_CHROME === this.storageApi) {
      chrome.storage.local.get([key]).then((result) => {
        getSuccess?.(result[key] as T | undefined);
      });

      return;
    }

    const raw = localStorage.getItem(key);
    const value = raw !== null ? (JSON.parse(raw) as T) : undefined;
    getSuccess?.(value);
  }

  set<T>(key: string, value: T, setSuccess: (() => void) | null = null): void {
    if (StorageService.STORAGE_API_CHROME === this.storageApi) {
      chrome.storage.local.set({ [key]: value }).then(() => setSuccess?.());

      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
    setSuccess?.();
  }

  remove(key: string, removeSuccess: (() => void) | null = null): void {
    if (StorageService.STORAGE_API_CHROME === this.storageApi) {
      chrome.storage.local.remove(key).then(() => removeSuccess?.());

      return;
    }

    localStorage.removeItem(key);
    removeSuccess?.();
  }
}
