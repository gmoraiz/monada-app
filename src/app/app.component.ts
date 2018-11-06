import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Globalization } from '@ionic-native/globalization';
import { HeaderColor } from '@ionic-native/header-color';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { StorageProvider } from '../providers/storage/storage';

import { defaultLanguage, availableLanguages, sysOptions } from '../i18n.constants';
import { PushProvider } from '../providers/push/push';

@Component({
  templateUrl: 'app.html'
})
export class MyApp{
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, headerColor: HeaderColor,
  private translate: TranslateService, private globalization: Globalization, storage: StorageProvider,
  public localNotification: LocalNotifications, push: PushProvider){
    platform.ready().then(() => {
      //this.rootPage = 'TutorialPage';
      storage.getToken().then(token => {
        if(token){
          this.rootPage = 'TabsPage';
        }else{
          storage.getNotFirstAccess().then(isNot =>{
            this.rootPage = isNot ? 'LoginPage' : 'FirstAccessPage';
          })
        }
      })
      headerColor.tint('#29221A');
      statusBar.backgroundColorByHexString('#29221A');
      this.setI18n();
      splashScreen.hide();
    })
  }

  openHome(){
    this.rootPage = 'TabsPage';
  }

  private setI18n(){
    this.translate.setDefaultLang(defaultLanguage);
    if((<any>window).cordova){
      this.globalization.getPreferredLanguage().then(result => {
        var language = this.getSuitableLanguage(result.value);
        this.translate.use(language);
        sysOptions.systemLanguage = language;
      });
    }else{
      let browserLanguage = this.translate.getBrowserLang() || defaultLanguage;
      var language = this.getSuitableLanguage(browserLanguage);
      this.translate.use(language);
      sysOptions.systemLanguage = language;
    }
  }

  private getSuitableLanguage(language){
    language = language.substring(0, 2).toLowerCase();
    return availableLanguages.some(x => x.code == language) ? language : defaultLanguage;
  }
}

