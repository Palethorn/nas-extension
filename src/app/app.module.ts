import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { PlayerComponent } from './player/player.component';
import { LoaderComponent } from './loader/loader.component';
import { SettingsComponent } from './settings/settings.component';
import { PlayerControlsComponent } from './player-controls/player-controls.component';
import { NotificationComponent } from './notification/notification.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    LoaderComponent,
    SettingsComponent,
    PlayerControlsComponent,
    NotificationComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
