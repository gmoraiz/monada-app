import { Injectable } from '@angular/core';
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { AppAvailability } from "@ionic-native/app-availability";
import { Platform } from "ionic-angular";

@Injectable()
export class HelperProvider {

  constructor(public photoViewer: PhotoViewer, public platform: Platform, public appAvailability: AppAvailability){
  }

  openPhoto(image){
    this.photoViewer.show(image);
  }

  openLink(link: string){
    window.open(link, "_system");
  }

  emailReport(subject: string){
    window.open('mailto:denuncia@monadaweb.com?subject='+subject, '_system');
  }

  checkApp(name: string): Promise<any>{
    return new Promise((resolve, reject) =>{
      if (this.platform.is('ios')){
        switch(name){
          case 'twitter':
            name = 'com.twitter.android';
            break;
          case 'facebook':
            name = 'com.facebook.katana';
            break;
        }
        resolve(this.isAppAvaiable(name));
      }else if (this.platform.is('android')){
        switch(name){
          case 'twitter':
            name = 'twitter://';
            break;
          case 'facebook':
            name = 'fb://';
            break;
        }
        resolve(this.isAppAvaiable(name));
      }else{
        resolve(null);
      }
    })
  }

  private isAppAvaiable(name){
    return this.appAvailability.check(name).then(
      (yes: boolean) => true,
      (no: boolean) => false
    );
  }
  

}
