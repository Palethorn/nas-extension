import { Component, inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { StateControllerService } from '../services/state-controller.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  protected readonly notificationService = inject(NotificationService);
  private readonly stateControllerService = inject(StateControllerService);

  close(): void {
    this.stateControllerService.transition('notification', 'collapsed');
  }
}
