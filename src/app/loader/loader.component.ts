import { Component } from '@angular/core';
import { StateControllerService } from '../services/state-controller.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  constructor(
    stateControllerService: StateControllerService
  ) {
    stateControllerService.registerTransitions('loader', [
      {
        from: 'collapsed', to: 'visible', object: this, handle: null
      },
      {
        from: 'visible', to: 'collapsed', object: this, handle: null
      }
    ], 'collapsed');
  }
}
