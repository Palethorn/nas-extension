import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { AudioTrack, DashTech, HlsTech, Player, Quality, TechInterface } from 'nas-player';
import { Logger } from 'nas-logger';
import { Range } from '../lib/range';
import { StateControllerService } from '../services/state-controller.service';
import { Header } from '../models/header';
import { NotificationService } from '../services/notification.service';
import { StorageService } from '../services/storage.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-player-controls',
  imports: [SettingsComponent],
  templateUrl: './player-controls.component.html',
  styleUrl: './player-controls.component.css',
})
export class PlayerControlsComponent implements AfterViewInit, OnDestroy {
  @Input() parent!: HTMLDivElement;
  @Input() videoElement!: HTMLVideoElement;

  @ViewChild('settings') settings!: ElementRef;
  @ViewChild('progress') progress!: ElementRef<HTMLDivElement>;
  @ViewChild('volume') volume!: ElementRef<HTMLDivElement>;

  player: Player;
  volumeBar!: Range;
  progressBar!: Range;
  tech!: TechInterface;
  seekLock = false;
  fullscreen = false;
  icon = 'play_arrow';
  duration = '00:00:00';
  currentTime = '00:00:00';
  volumeIcon = 'volume_up';
  showNativePlayerControls = false;
  alwaysShowFullPlayerControls = false;

  selectedAudioTrack: AudioTrack = {
    lang: 'Default',
    name: 'Default',
    index: 0,
  };

  selectedQuality: Quality = {
    index: 0,
    bitrate: 0,
    bitrateStr: '0k',
    width: 0,
    height: 0,
  };

  currentAutoQuality: Quality = {
    index: 0,
    bitrate: 0,
    bitrateStr: '0k',
    width: 0,
    height: 0,
  };

  streamingUrl!: string;
  licenseUrl!: string;
  subtitleUrl!: string;
  streamingUrlHeaders: Record<string, string> = {};
  licenseUrlHeaders: Record<string, string> = {};

  qualities: Quality[] = [
    {
      index: 0,
      bitrate: 0,
      bitrateStr: '0k',
      width: 0,
      height: 0,
    },
  ];

  audioTracks: AudioTrack[] = [this.selectedAudioTrack];

  readonly stateControllerService = inject(StateControllerService);
  private readonly notificationService = inject(NotificationService);
  private readonly storageService = inject(StorageService);
  private readonly logger = new Logger('PlayerControlsComponent');

  constructor() {
    this.stateControllerService.setDebug(false);

    this.stateControllerService.registerTransitions(
      'settings',
      [
        {
          from: 'collapsed',
          to: 'visible',
          object: this,
          handle: () => {
            document.removeEventListener('keydown', this.keyEvents);
          },
        },
        {
          from: 'visible',
          to: 'collapsed',
          object: this,
          handle: () => {
            document.addEventListener('keydown', this.keyEvents);
          },
        },
      ],
      'collapsed'
    );

    this.stateControllerService.registerTransitions(
      'controls',
      [
        {
          from: 'collapsed',
          to: 'visible',
          object: this,
          handle: () => {
            document.body.style.cursor = 'initial';
          },
        },
        {
          from: 'visible',
          to: 'collapsed',
          object: this,
          delay: 2500,
          handle: () => {
            if (!this.stateControllerService.getIsLocked('controls')) {
              document.body.style.cursor = 'none';
            }
          },
        },
      ],
      'collapsed'
    );

    this.player = new Player();
  }

  ngAfterViewInit(): void {
    this.resizeProgressBar();

    this.progressBar = new Range(
      this.progress.nativeElement,
      (value: number) => {
        if (isNaN(value)) {
          return;
        }

        this.player.seek(value);
      },
      null,
      0,
      this.player.getDuration(),
      0,
      'horizontal',
      'controls-item controls-padding'
    );

    this.volumeBar = new Range(
      this.volume.nativeElement,
      (value: number) => {
        if (isNaN(value)) {
          return;
        }

        this.setVolume(value);
      },
      null,
      0,
      0.99,
      0.99,
      'horizontal',
      'controls-item controls-padding'
    );

    window.addEventListener(
      'mousemove',
      () => {
        this.displayControls();
      },
      false
    );

    const elems = document.querySelectorAll('.controls-item');

    for (const elem of Array.from(elems)) {
      elem.addEventListener('click', this.animateControlItem.bind(elem));
    }

    document.addEventListener('keydown', this.keyEvents);

    this.storageService.get<number>('player-volume', (volume) => {
      if (volume !== undefined) {
        this.volumeBar.setValue(volume);
      }

      this.storageService.get<boolean>('player-muted', (muted) => {
        if (muted === undefined) {
          return;
        }

        if (muted) {
          this.player.mute();
        }

        this.setVolumeIcon();
      });
    });
  }

  keyEvents = (e: KeyboardEvent): void => {
    if ('KeyF' === e.code) {
      this.toggleFullscreen();
    }

    if ('KeyM' === e.code) {
      this.toggleMute();
    }

    if ('Space' === e.code) {
      this.playPause();
    }

    if ('ArrowRight' === e.code) {
      this.progressBar.setValue(this.progressBar.getValue() + 5, true);
    }

    if ('ArrowLeft' === e.code) {
      this.progressBar.setValue(this.progressBar.getValue() - 5, true);
    }

    if ('ArrowUp' === e.code) {
      this.volumeBar.setValue(this.volumeBar.getValue() + 0.1, true);
    }

    if ('ArrowDown' === e.code) {
      this.volumeBar.setValue(this.volumeBar.getValue() - 0.1, true);
    }

    if ('KeyS' === e.code) {
      if ('collapsed' === this.stateControllerService.getState('settings')) {
        this.stateControllerService.transition('settings', 'visible');
      } else {
        this.stateControllerService.transition('settings', 'collapsed');
      }
    }
  };

  animateControlItem(e: Event): void {
    (e.target as HTMLElement).style.background = 'click_animation .250s';
  }

  loadStream(): void {
    if (!this.streamingUrl) {
      this.notificationService.show('Player Error', 'Please enter streaming URL');
      this.stateControllerService.transition('settings', 'visible');
      this.stateControllerService.transition('loader', 'collapsed');
      return;
    }

    this.stateControllerService.transition('settings', 'collapsed');
    this.player.destroy();
    this.player = new Player();

    try {
      this.guessTech(this.streamingUrl);
    } catch (err) {
      this.logger.e(err);
      this.notificationService.show(
        'Player Error',
        'Unsupported stream URL. Please provide a .mpd (MPEG-DASH) or .m3u8 (HLS) URL.'
      );
      this.stateControllerService.transition('settings', 'visible');
      this.stateControllerService.transition('loader', 'collapsed');
      return;
    }

    this.attachPlayerEventHandlers();

    let licenseUrlHeaders: Record<string, string> | null = null;
    let streamingUrlHeaders: Record<string, string> | null = null;

    if (Object.keys(this.streamingUrlHeaders).length !== 0) {
      streamingUrlHeaders = this.streamingUrlHeaders;
    }

    if (Object.keys(this.licenseUrlHeaders).length !== 0) {
      licenseUrlHeaders = this.licenseUrlHeaders;
    }

    this.player.init(
      this.tech,
      this.videoElement,
      this.streamingUrl,
      true,
      false,
      streamingUrlHeaders,
      {
        'com.widevine.alpha': {
          serverURL: this.licenseUrl,
          httpRequestHeaders: licenseUrlHeaders,
          priority: 0,
        },
      },
      () => {
        this.notificationService.show('Player Error', 'Please enter license URL');
        this.stateControllerService.transition('settings', 'visible');
        this.stateControllerService.transition('loader', 'collapsed');
      }
    );

    if (this.subtitleUrl) {
      this.player.loadSubtitles(this.subtitleUrl);
    }
  }

  loadSubtitle(subtitleUrl: string): void {
    this.player.loadSubtitles(subtitleUrl);
  }

  displayControls(): void {
    this.stateControllerService.transition('controls', 'visible');
    this.stateControllerService.transition('controls', 'collapsed');
  }

  freezeControls = (): void => {
    this.stateControllerService.lock('controls', 'visible');
  };

  unfreezeControls = (): void => {
    this.stateControllerService.unlock('controls');
    this.stateControllerService.transition('controls', 'collapsed');
  };

  playPause(): void {
    if (this.player.videoElement.paused) {
      this.icon = 'pause';
      this.player.play();
    } else {
      this.icon = 'play_arrow';
      this.player.pause();
    }
  }

  subtitleDelay(e: Event): void {
    const delay = (e.target as HTMLInputElement).value;

    if (delay && this.player.getSubtitlesUrl() && '' !== this.player.getSubtitlesUrl()) {
      this.player.loadSubtitles(this.player.getSubtitlesUrl() + '&delay=' + delay);
    }
  }

  selectAudioTrack(audioTrack: AudioTrack): void {
    this.selectedAudioTrack = audioTrack;
    this.player.setAudioTrack(audioTrack.index);
  }

  selectQuality(quality: Quality): void {
    this.selectedQuality = quality;
    this.player.setQuality(quality.index);
  }

  selectSpeed(speed: number): void {
    if (speed < 0) {
      this.notificationService.show('Playback rate', 'Playback rate cannot be negative');
      return;
    }

    this.player.setPlaybackRate(speed);
  }

  toggleFullscreen(): void {
    if (!this.fullscreen) {
      this.parent.requestFullscreen();
      this.fullscreen = true;
    } else {
      document.exitFullscreen();
      this.fullscreen = false;
    }
  }

  toggleSettings(): void {
    if ('visible' === this.stateControllerService.getState('settings')) {
      this.stateControllerService.transition('settings', 'collapsed');
    } else {
      this.stateControllerService.transition('settings', 'visible');
    }
  }

  guessTech(url: string): void {
    if ('undefined' === typeof url) {
      this.logger.e('URL is undefined');
      return;
    }

    if (url.indexOf('.mpd') > -1) {
      this.logger.d('Selecting DASH tech...');
      this.tech = new DashTech();
    } else if (url.indexOf('.m3u8') > -1) {
      this.logger.d('Selecting HLS tech...');
      this.tech = new HlsTech();
    }

    if (null == this.tech) {
      throw new Error('Url ' + url + ' not recognized.');
    }
  }

  attachPlayerEventHandlers(): void {
    this.player.addEventHandler('playing', () => {
      this.logger.d('play');
      this.stateControllerService.transition('loader', 'collapsed');
      this.icon = 'pause';

      this.audioTracks = this.player.getAudioTracks();
      this.selectedAudioTrack = this.audioTracks[0];
      this.qualities = this.player.getQualities();

      this.updateCurrentAutoQuality().then(() => {
        this.selectedQuality = this.qualities[0];
      });

      const duration = this.player.getDuration();

      if (Number.isFinite(duration)) {
        this.duration = this.formatTimeFromSeconds(this.player.getDuration());
      }
    });

    this.player.addEventHandler('seeking', () => {
      this.logger.d('seeking');
      this.stateControllerService.transition('loader', 'visible');
    });

    this.player.addEventHandler('waiting', () => {
      this.logger.d('waiting');
      this.stateControllerService.transition('loader', 'visible');
    });

    this.player.addEventHandler('error', (e: { message?: string }) => {
      this.logger.e(e);
      this.notificationService.show(
        'Player error',
        e.message || 'An unknown playback error occurred.'
      );
    });

    this.player.addEventHandler('hlsError', (e: { details?: string }) => {
      this.logger.e(e.details);
      this.notificationService.show('Player error', e.details || 'A streaming error occurred.');
    });

    this.player.addEventHandler('streamInitialized', () => {
      // Intentionally empty: reserved for stream-initialized handling.
    });

    this.player.addEventHandler('timeupdate', () => {
      this.currentTime = this.formatTimeFromSeconds(this.player.getCurrentTime());

      if (this.progressBar) {
        this.progressBar.setMaxValue(this.player.getDuration());
      }

      if (this.player.getCurrentTime) {
        this.progressBar.setValue(this.player.getCurrentTime());
      }

      this.updateCurrentAutoQuality();
    });
  }

  async updateCurrentAutoQuality(): Promise<void> {
    const currentQuality = this.player.getCurrentQuality();

    for (const q in this.qualities) {
      if (this.qualities[q].index === currentQuality.index) {
        this.currentAutoQuality = this.qualities[q];
        return;
      }
    }
  }

  formatTimeFromSeconds(val: number): string {
    const hours = Math.floor(val / 3600);

    let minutes = Math.floor(val / 60);
    minutes = minutes < 60 ? minutes : Math.floor(val / 60) - hours * 60;

    let seconds = val < 60 ? val : val - (hours * 3600 + minutes * 60);
    seconds = Math.floor(seconds);

    return (
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0') +
      ':' +
      seconds.toString().padStart(2, '0')
    );
  }

  resizeProgressBar(): void {
    this.progress.nativeElement.style.width = window.innerWidth - 445 + 'px';
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeProgressBar();
  }

  changeStreamingUrl(streamingUrl: string): void {
    this.streamingUrl = streamingUrl;
  }

  changeLicenseUrl(licenseUrl: string): void {
    this.licenseUrl = licenseUrl;
  }

  changeStreamingUrlHeaders(streamingUrlHeaders: Header[]): void {
    this.streamingUrlHeaders = {};

    for (const header of streamingUrlHeaders) {
      if ('' !== header.name && '' !== header.value) {
        this.streamingUrlHeaders[header.name] = header.value;
      }
    }
  }

  changeLicenseUrlHeaders(licenseUrlHeaders: Header[]): void {
    this.licenseUrlHeaders = {};

    for (const header of licenseUrlHeaders) {
      if ('' !== header.name && '' !== header.value) {
        this.licenseUrlHeaders[header.name] = header.value;
      }
    }
  }

  toggleMute(): void {
    if (this.player.isMuted()) {
      this.player.unmute();
      this.storageService.set('player-muted', false);
    } else {
      this.player.mute();
      this.storageService.set('player-muted', true);
    }

    this.setVolumeIcon();
  }

  setVolume(volume: number): void {
    this.player.setVolume(volume);
    this.setVolumeIcon();
    this.storageService.set('player-volume', volume);
  }

  setVolumeIcon(): void {
    if (this.player.isMuted()) {
      this.volumeIcon = 'volume_off';
      return;
    }

    if (this.player.getVolume() === 0) {
      this.volumeIcon = 'volume_mute';
    } else if (this.player.getVolume() > 0 && this.player.getVolume() <= 0.5) {
      this.volumeIcon = 'volume_down';
    } else if (this.player.getVolume() > 0.5) {
      this.volumeIcon = 'volume_up';
    }
  }

  changeAlwaysShowFullPlayerControls(val: boolean): void {
    this.alwaysShowFullPlayerControls = val;
  }

  changeShowNativePlayerControls(val: boolean): void {
    this.showNativePlayerControls = val;

    if (val) {
      this.stateControllerService.lock('controls', 'collapsed');
      this.videoElement.controls = true;
    } else {
      this.stateControllerService.unlock('controls');
      this.videoElement.controls = false;
    }
  }

  ngOnDestroy(): void {
    const elems = document.querySelectorAll('.controls-item');

    for (const elem of Array.from(elems)) {
      elem.removeEventListener('click', this.animateControlItem);
    }
  }
}
