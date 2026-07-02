import { AfterViewInit, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AudioTrack, Quality } from 'nas-player';
import { Logger } from 'nas-logger';
import { StateControllerService } from '../services/state-controller.service';
import { Header } from '../models/header';
import { StreamInfo } from '../models/stream-info';
import { StorageService } from '../services/storage.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements AfterViewInit {
  @Input() qualities!: Quality[];
  @Input() selectedQuality!: Quality;
  @Input() audioTracks!: AudioTrack[];
  @Input() currentAutoQuality!: Quality;
  @Input() selectedAudioTrack!: AudioTrack;

  @Output() streamLoad = new EventEmitter<string>();
  @Output() speedChange = new EventEmitter<number>();
  @Output() qualityChange = new EventEmitter<Quality>();
  @Output() licenseUrlChange = new EventEmitter<string>();
  @Output() subtitleUrlChange = new EventEmitter<string>();
  @Output() streamingUrlChange = new EventEmitter<string>();
  @Output() audioTrackChange = new EventEmitter<AudioTrack>();
  @Output() licenseUrlHeadersChange = new EventEmitter<Header[]>();
  @Output() showNativePlayerControlsChange = new EventEmitter<boolean>();
  @Output() streamingUrlHeadersChange = new EventEmitter<Header[]>();
  @Output() alwaysShowFullPlayerControlsChange = new EventEmitter<boolean>();

  hrefUrl = '';
  licenseUrl = '';
  m3uPlaylist = '';
  subtitleUrl = '';
  streamingUrl = '';
  selectedSpeed = 1;
  currentStreamName = '';
  m3uItems: StreamInfo[] = [];
  savedStreams: StreamInfo[] = [];
  licenseUrlHeaders: Header[] = [];
  streamingUrlHeaders: Header[] = [];
  showNativePlayerControls = false;
  settingsSection = 'source-settings';
  alwaysShowFullPlayerControls = false;

  readonly speeds: number[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  private readonly logger = new Logger('SettingsComponent');
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly stateControllerService = inject(StateControllerService);

  constructor() {
    const urls = window.location.href.split('#');
    this.hrefUrl = urls[1] ?? '';

    if (this.hrefUrl.indexOf('.m3u8') === -1 && this.hrefUrl.indexOf('.m3u') > -1) {
      this.m3uPlaylist = this.hrefUrl;
      this.loadM3UPlaylist();
      this.stateControllerService.transition('settings', 'visible');
      this.settingsSection = 'm3u-source-settings';
    } else {
      this.streamingUrl = this.hrefUrl;
      this.streamingUrlChange.emit(this.streamingUrl);
    }

    this.storageService.get<StreamInfo[]>('saved_streams', (res) => {
      if (res) {
        this.savedStreams = res;
      }
    });

    this.storageService.get<boolean>('always-show-full-player-controls', (value) => {
      if (value === undefined) {
        return;
      }

      this.alwaysShowFullPlayerControls = value;
      this.alwaysShowFullPlayerControlsChange.emit(value);
    });

    this.storageService.get<boolean>('show-native-player-controls', (value) => {
      if (value === undefined) {
        return;
      }

      this.showNativePlayerControls = value;
      this.showNativePlayerControlsChange.emit(value);
    });
  }

  ngAfterViewInit(): void {
    const isM3uPlaylist = this.hrefUrl.indexOf('.m3u8') === -1 && this.hrefUrl.indexOf('.m3u') > -1;

    if (!isM3uPlaylist) {
      this.loadStream();
    }
  }

  toggleSettings(): void {
    this.stateControllerService.transition('settings', 'collapsed');
  }

  loadStream(): void {
    this.licenseUrlChange.emit(this.licenseUrl);
    this.subtitleUrlChange.emit(this.subtitleUrl);
    this.streamingUrlChange.emit(this.streamingUrl);
    this.licenseUrlHeadersChange.emit(this.licenseUrlHeaders);
    this.streamingUrlHeadersChange.emit(this.streamingUrlHeaders);
    this.alwaysShowFullPlayerControlsChange.emit(this.alwaysShowFullPlayerControls);
    this.showNativePlayerControlsChange.emit(this.showNativePlayerControls);

    this.streamLoad.emit(this.streamingUrl);
  }

  showSection(section: string): void {
    this.settingsSection = section;
  }

  addStreamingUrlHeader(): void {
    this.streamingUrlHeaders.push({ name: '', value: '' });
    this.streamingUrlHeadersChange.emit(this.streamingUrlHeaders);
  }

  removeStreamingUrlHeader(index: number): void {
    this.streamingUrlHeaders.splice(index, 1);
    this.streamingUrlHeadersChange.emit(this.streamingUrlHeaders);
  }

  addLicenseUrlHeader(): void {
    this.licenseUrlHeaders.push({ name: '', value: '' });
    this.licenseUrlHeadersChange.emit(this.licenseUrlHeaders);
  }

  removeLicenseUrlHeader(index: number): void {
    this.licenseUrlHeaders.splice(index, 1);
    this.licenseUrlHeadersChange.emit(this.licenseUrlHeaders);
  }

  saveCurrentStream(): void {
    if (!this.currentStreamName) {
      this.notificationService.show('Stream Save Error', 'You need to provide a stream name.');
      return;
    }

    const streamInfo: StreamInfo = {
      name: this.currentStreamName,
      streamingUrl: this.streamingUrl,
      licenseUrl: this.licenseUrl,
      subtitleUrl: this.subtitleUrl,
      licenseUrlHeaders: this.licenseUrlHeaders,
      streamingUrlHeaders: this.streamingUrlHeaders,
    };

    this.savedStreams.push(streamInfo);
    this.storageService.set('saved_streams', this.savedStreams);
  }

  removeSavedStream(i: number): void {
    if (confirm('Are you sure?')) {
      this.savedStreams.splice(i, 1);
    }

    this.storageService.set('saved_streams', this.savedStreams);
  }

  playSavedStream(streamInfo: StreamInfo): void {
    this.licenseUrl = streamInfo.licenseUrl;
    this.currentStreamName = streamInfo.name;
    this.subtitleUrl = streamInfo.subtitleUrl;
    this.streamingUrl = streamInfo.streamingUrl;
    this.streamingUrlHeaders = streamInfo.streamingUrlHeaders;
    this.licenseUrlHeaders = streamInfo.licenseUrlHeaders;
    this.loadStream();
  }

  loadM3UPlaylist(): void {
    this.stateControllerService.transition('loader', 'visible');
    this.logger.d(this.m3uPlaylist);
    this.m3uItems = [];

    this.http.request('GET', this.m3uPlaylist, { responseType: 'text' }).subscribe((response) => {
      const lines = response.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if ('' === line) {
          continue;
        }

        if ('#EXTM3U' === line) {
          continue;
        }

        if (0 === line.indexOf('#EXTINF')) {
          if (0 === lines[i + 1].indexOf('http')) {
            const info = line.split(',');

            this.m3uItems.push({
              name: info[1],
              streamingUrl: lines[i + 1],
              licenseUrl: '',
              subtitleUrl: '',
              licenseUrlHeaders: [],
              streamingUrlHeaders: [],
            });
          }
        }
      }

      this.logger.d(this.m3uItems);
      this.stateControllerService.transition('loader', 'collapsed');
    });
  }

  alwaysShowFullPlayerControlsChanged(): void {
    this.alwaysShowFullPlayerControlsChange.emit(this.alwaysShowFullPlayerControls);
    this.storageService.set('always-show-full-player-controls', this.alwaysShowFullPlayerControls);
  }

  showNativePlayerControlsChanged(): void {
    this.showNativePlayerControlsChange.emit(this.showNativePlayerControls);
    this.storageService.set('show-native-player-controls', this.showNativePlayerControls);
  }
}
