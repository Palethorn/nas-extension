import { Component } from '@angular/core';
import { StateControllerService } from './services/state-controller.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nas-player-embed';

  constructor(
    public stateControllerService: StateControllerService
  ) {
  }
}
