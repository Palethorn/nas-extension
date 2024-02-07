import { Injectable } from '@angular/core';
import { Logger } from 'nas-logger';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  static readonly STORAGE_API_CHROME = 0;
  static readonly STORAGE_API_BROWSER = 1;

  logger: Logger;
  storageApi: number = StorageService.STORAGE_API_BROWSER;

  constructor() {
    this.logger = new Logger('StorageService', true);

    if(undefined != chrome.storage) {
      this.storageApi = StorageService.STORAGE_API_CHROME;
    }
  }

  get(getSuccess: CallableFunction, key: string) {
    if(StorageService.STORAGE_API_CHROME == this.storageApi) {
      chrome.storage.local.get([key]).then((result) => {
        getSuccess(result['key']);
      });
    }

    var value = localStorage.getItem(key);
    if(value) {
      value = JSON.parse(value);
    }

    getSuccess(value);
  }

  set(setSuccess: CallableFunction, key: string, value: any) {
    if(StorageService.STORAGE_API_CHROME == this.storageApi) {
      chrome.storage.local.set({ key: value }).then(() => {
        setSuccess();
      });
    }

    localStorage.setItem(key, JSON.stringify(value));
    setSuccess(value);
  }

  remove(removeSuccess: CallableFunction, key: string) {
    if(StorageService.STORAGE_API_CHROME == this.storageApi) {
      chrome.storage.local.remove(key).then(() => {
        removeSuccess();
      })
    }

    localStorage.removeItem(key);
    removeSuccess();
  }
}
