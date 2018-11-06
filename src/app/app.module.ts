import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Globalization } from '@ionic-native/globalization';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HeaderColor } from '@ionic-native/header-color';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Clipboard } from '@ionic-native/clipboard';
import { HttpModule, XHRBackend, RequestOptions, Http } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { Push } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AppVersion } from '@ionic-native/app-version';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Camera } from '@ionic-native/camera';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Facebook } from '@ionic-native/facebook';
import { TwitterConnect } from '@ionic-native/twitter-connect';
import { TwitterService } from 'ng2-twitter';
import { ImagePicker } from '@ionic-native/image-picker';
import { AppAvailability } from "@ionic-native/app-availability";
//import { Network } from '@ionic-native/network';

import { MyApp } from './app.component';

import { ConstantProvider } from '../providers/constant/constant';
import { ConnProvider } from '../providers/conn/conn';
import { PushProvider } from '../providers/push/push';
import { LoadProvider } from '../providers/load/load';
import { HttpInterceptor } from '../interceptor/http';
// import { NetworkInterceptor } from '../interceptor/network';
import { StorageProvider } from '../providers/storage/storage';
// import { NotifyPublicationProvider } from '../providers/notify-publication/notify-publication';
import { HelperProvider } from '../providers/helper/helper';
import { ConnTwitterProvider } from "../providers/conn-twitter/conn-twitter";


export function httpInterceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, storage: StorageProvider, constant: ConstantProvider){
  return new HttpInterceptor(xhrBackend, requestOptions, storage, constant);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [MyApp],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    HttpModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp, {
      platforms: {
        ios: {
          backButtonText: 'Voltar'
        }
      },
      scrollAssist: false,
      autoFocusAssist: true,
      scrollPadding:false
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp],
  providers: [
    {
      provide: Http, 
      useFactory: httpInterceptorFactory, 
      deps: [XHRBackend, RequestOptions, StorageProvider, ConstantProvider]
    },
    StatusBar,
    SplashScreen,
    Globalization,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HeaderColor,
    PhotoViewer,
    SocialSharing,
    Clipboard,
    ConstantProvider,
    ConnProvider,
    PushProvider,
    LoadProvider,
    StorageProvider,
    AppVersion,
    Push,
    LocalNotifications,
    Camera,
    FileTransfer,
    HelperProvider,
    Facebook,
    TwitterConnect,
    TwitterService,
    ConnTwitterProvider,
    ImagePicker,
    AppAvailability
  ]
})
export class AppModule {}