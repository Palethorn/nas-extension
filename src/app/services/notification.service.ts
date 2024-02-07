import { Injectable } from '@angular/core';
import { StateControllerService } from './state-controller.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public title: string = 'Test Title';
  public message: string = 'Test Message';

  constructor(
    private stateControllerService: StateControllerService
  ) {
    stateControllerService.registerTransitions('notification', [
      { from: 'visible', to: 'collapsed' },
      { from: 'collapsed', to: 'visible' }
    ], 'collapsed');
  }

  show(title: string, message: string) {
    this.title = title;
    this.message = message;
    this.stateControllerService.transition('notification', 'visible');
  }
}
