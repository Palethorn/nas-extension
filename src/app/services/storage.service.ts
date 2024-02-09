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
      console.log('STORAGE_API_CHROME');
      this.storageApi = StorageService.STORAGE_API_CHROME;
    }
  }

  get(key: string, getSuccess: CallableFunction|null = null) {
    if(StorageService.STORAGE_API_CHROME == this.storageApi) {
      chrome.storage.local.get([key]).then((result) => {
        if(null != getSuccess) {
          getSuccess(result[key]);
        }
      });

      return;
    }

    var value = localStorage.getItem(key);
    
    if(value) {
      value = JSON.parse(value);
    }

    if(null != getSuccess) {
      getSuccess(value);
    }
  }

  set(key: string, value: any, setSuccess: CallableFunction|null = null) {
    if(StorageService.STORAGE_API_CHROME == this.storageApi) {
      let obj: any = {};
      obj[key] = value;

      chrome.storage.local.set(obj).then(() => {
        if(null != setSuccess) {
          setSuccess();
        }
      });

      return;
    }

    localStorage.setItem(key, JSON.stringify(value));

    if(null != setSuccess) {
      setSuccess();
    }
  }

  remove(key: string, removeSuccess: CallableFunction|null = null) {
    if(StorageService.STORAGE_API_CHROME == this.storageApi) {
      chrome.storage.local.remove(key).then(() => {
        if(null != removeSuccess) {
          removeSuccess();
        }
      });

      return;
    }

    localStorage.removeItem(key);

    if(null != removeSuccess) {
      removeSuccess();
    }
  }
}
