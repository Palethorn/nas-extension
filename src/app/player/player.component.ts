import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { StateControllerService } from '../services/state-controller.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})

export class PlayerComponent {
  @ViewChild('videoElement')
  videoElement!: ElementRef;

  @ViewChild('videoElementContainer')
  videoElementContainer!: ElementRef;

  @ViewChild('playerControlsParent')
  playerControlsParent!: ElementRef;

  metadataId!: string;
  timeoutId!: any;

  constructor(
    public stateControllerService: StateControllerService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.resizeVideoContainer();
  }

  resizeVideoContainer() {
    this.videoElement.nativeElement.style.width = this.videoElementContainer.nativeElement.style.width;
    this.videoElement.nativeElement.style.height = this.videoElementContainer.nativeElement.style.height;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
      this.resizeVideoContainer();
  }
}
