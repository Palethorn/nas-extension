import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AudioTrack, Quality } from 'nas-player';
import { StateControllerService } from '../services/state-controller.service';
import { Header } from '../models/header';
import { StreamInfo } from '../models/stream-info';
import { StorageService } from '../services/storage.service';
import { HttpClient } from '@angular/common/http';
import { Logger } from 'nas-logger';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  @Input() qualities!: Quality[];
  @Input() selectedQuality!: Quality;
  @Input() audioTracks!: AudioTrack[];
  @Input() currentAutoQuality!: Quality;
  @Input() selectedAudioTrack!: AudioTrack;

  @Output() streamLoad: EventEmitter<string> = new EventEmitter();
  @Output() speedChange: EventEmitter<number> = new EventEmitter();
  @Output() qualityChange: EventEmitter<Quality> = new EventEmitter();
  @Output() licenseUrlChange: EventEmitter<string> = new EventEmitter();
  @Output() subtitleUrlChange: EventEmitter<string> = new EventEmitter();
  @Output() streamingUrlChange: EventEmitter<string> = new EventEmitter();
  @Output() audioTrackChange: EventEmitter<AudioTrack> = new EventEmitter();
  @Output() licenseUrlHeadersChange: EventEmitter<Array<Header>> = new EventEmitter();
  @Output() streamingUrlHeadersChange: EventEmitter<Array<Header>> = new EventEmitter();

  hrefUrl: string = '';
  licenseUrl: string = '';
  m3uPlaylist: string = '';
  subtitleUrl: string = '';
  streamingUrl: string = '';
  selectedSpeed: number = 1;
  currentStreamName: string = '';
  m3uItems: Array<StreamInfo> = [];
  savedStreams: Array<StreamInfo> = [];
  licenseUrlHeaders: Array<Header> = [];
  streamingUrlHeaders: Array<Header> = [];
  settingsSection: string = 'source-settings';
  logger:Logger = new Logger('SettingsComponent');

  speeds: any = [
    .25,
    .5,
    .75,
    1,
    1.25,
    1.5,
    1.75,
    2
  ];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private notificationService: NotificationService,
    public stateControllerService: StateControllerService,
  ) {
    var urls = window.location.href.split("#");
    this.hrefUrl = urls[1];

    if(this.hrefUrl.indexOf('.m3u8') == -1 && this.hrefUrl.indexOf('.m3u') > -1) {
      this.m3uPlaylist = this.hrefUrl;
      this.loadM3UPlaylist();
      this.stateControllerService.transition('settings', 'visible');
      this.settingsSection = 'm3u-source-settings';
    } else {
      this.streamingUrl = this.hrefUrl;
      this.streamingUrlChange.emit(this.streamingUrl);
    }

    this.storageService.get((res: any) => {
      if(res) {
        this.savedStreams = res;
      }
    }, 'saved_streams');
  }

  ngAfterViewInit() {
    if(this.hrefUrl.indexOf('.m3u8') == -1 && this.hrefUrl.indexOf('.m3u') > -1) {
    } else {
      this.loadStream();
    }
  }

  toggleSettings() {
      this.stateControllerService.transition('settings', 'collapsed');
  }

  loadStream() {
    this.licenseUrlChange?.emit(this.licenseUrl);
    this.subtitleUrlChange.emit(this.subtitleUrl);
    this.streamingUrlChange?.emit(this.streamingUrl);
    this.licenseUrlHeadersChange.emit(this.licenseUrlHeaders);
    this.streamingUrlHeadersChange.emit(this.streamingUrlHeaders);

    this.streamLoad.emit(this.streamingUrl);
  }

  showSection(section: string) {
    this.settingsSection = section;
  }

  addStreamingUrlHeader() {
    this.streamingUrlHeaders.push({
      name: '',
      value: ''
    });

    this.streamingUrlHeadersChange.emit(this.streamingUrlHeaders);
  }

  removeStreamingUrlHeader(index: any) {
    this.streamingUrlHeaders.splice(index, 1);
    this.streamingUrlHeadersChange.emit(this.streamingUrlHeaders);
  }

  addLicenseUrlHeader() {
    this.licenseUrlHeaders.push({
      name: '',
      value: ''
    });

    this.licenseUrlHeadersChange.emit(this.licenseUrlHeaders);
  }

  removeLicenseUrlHeader(index: any) {
    this.licenseUrlHeaders.splice(index, 1);
    this.licenseUrlHeadersChange.emit(this.licenseUrlHeaders);
  }

  saveCurrentStream() {
    if(!this.currentStreamName) {
      this.notificationService.show('Stream Save Error', 'You need to provide a stream name.');
      return;
    }

    var streamInfo: StreamInfo = {
      name: this.currentStreamName,
      streamingUrl: this.streamingUrl,
      licenseUrl: this.licenseUrl,
      subtitleUrl: this.subtitleUrl,
      licenseUrlHeaders: this.licenseUrlHeaders,
      streamingUrlHeaders: this.streamingUrlHeaders,
    }

    this.savedStreams.push(streamInfo);

    this.storageService.set(() => {

    }, 'saved_streams', this.savedStreams);
  }

  removeSavedStream(i:number) {
    if(confirm('Are you sure?')) {
      this.savedStreams.splice(i, 1);
    }

    this.storageService.set(() => {

    }, 'saved_streams', this.savedStreams);
  }

  playSavedStream(streamInfo: StreamInfo) {
    this.licenseUrl = streamInfo.licenseUrl;
    this.currentStreamName = streamInfo.name;
    this.subtitleUrl = streamInfo.subtitleUrl;
    this.streamingUrl = streamInfo.streamingUrl;
    this.streamingUrlHeaders = streamInfo.streamingUrlHeaders;
    this.licenseUrlHeaders = streamInfo.licenseUrlHeaders;
    this.loadStream();
  }

  loadM3UPlaylist() {
    this.stateControllerService.transition('loader', 'visible');
    this.logger.d(this.m3uPlaylist);
    this.m3uItems = [];

    this.http.request('GET', this.m3uPlaylist, { responseType:'text' }).subscribe((response) => {
      var lines = response.split("\n");

      for(var i = 0; i < lines.length; i++) {
          var line = lines[i];

          if('' == line) {
              continue;
          }

          if('#EXTM3U' == line) {
              continue;
          }

          if(0 == line.indexOf('#EXTINF')) {
              if(0 == lines[i + 1].indexOf('http')) {
                  var info = line.split(',');

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
} 
