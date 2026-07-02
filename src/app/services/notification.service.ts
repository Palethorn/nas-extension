import { Injectable, inject, signal } from '@angular/core';
import { StateControllerService } from './state-controller.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly stateControllerService = inject(StateControllerService);

  readonly title = signal('Test Title');
  readonly message = signal('Test Message');

  constructor() {
    this.stateControllerService.registerTransitions(
      'notification',
      [
        { from: 'visible', to: 'collapsed' },
        { from: 'collapsed', to: 'visible' },
      ],
      'collapsed'
    );
  }

  show(title: string, message: string): void {
    this.title.set(title);
    this.message.set(message);
    this.stateControllerService.transition('notification', 'visible');
  }
}
