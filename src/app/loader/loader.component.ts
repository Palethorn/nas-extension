import { Component, inject } from '@angular/core';
import { StateControllerService } from '../services/state-controller.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent {
  private readonly stateControllerService = inject(StateControllerService);

  constructor() {
    this.stateControllerService.registerTransitions(
      'loader',
      [
        { from: 'collapsed', to: 'visible', object: this, handle: null },
        { from: 'visible', to: 'collapsed', object: this, handle: null },
      ],
      'collapsed'
    );
  }
}
