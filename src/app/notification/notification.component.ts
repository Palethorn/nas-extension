import { Component } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { StateControllerService } from '../services/state-controller.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  constructor(
    public notificationService: NotificationService,
    public stateControllerService: StateControllerService
  ) {
  }

  close() {
    this.stateControllerService.transition('notification', 'collapsed');
  }
}
