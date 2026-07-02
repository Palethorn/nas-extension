import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';

@Component({
  selector: 'app-player',
  imports: [PlayerControlsComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
})
export class PlayerComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoElementContainer') videoElementContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.resizeVideoContainer();
  }

  resizeVideoContainer(): void {
    this.videoElement.nativeElement.style.width =
      this.videoElementContainer.nativeElement.style.width;
    this.videoElement.nativeElement.style.height =
      this.videoElementContainer.nativeElement.style.height;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeVideoContainer();
  }
}
