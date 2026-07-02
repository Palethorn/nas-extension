import { Component, inject } from '@angular/core';
import { StateControllerService } from './services/state-controller.service';
import { PlayerComponent } from './player/player.component';
import { LoaderComponent } from './loader/loader.component';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'app-root',
  imports: [PlayerComponent, LoaderComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly title = 'nas-player-embed';

  protected readonly stateControllerService = inject(StateControllerService);
}
