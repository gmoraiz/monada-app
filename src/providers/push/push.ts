import { Injectable } from '@angular/core';
import { StorageProvider } from '../storage/storage';
import { AlertController, Platform, Events, App } from "ionic-angular";
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Subject } from "rxjs/Subject";
// import { NotifyPublicationProvider } from '../notify-publication/notify-publication';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ConstantProvider } from "../constant/constant";
import { ConnProvider } from '../conn/conn';

@Injectable()
export class PushProvider {
  page: string = "";
  feed: Subject<any> = new Subject();
  clickedPublication: any = null;
  clickedDefault: boolean = false;
  
  constructor(public storage: StorageProvider, public push: Push, public alert: AlertController,
  public localNotification: LocalNotifications, public plt: Platform, public events: Events, 
  public constant: ConstantProvider, public app: App, public conn: ConnProvider){
    this.plt.ready().then(() => {
      this.pushSetup();
    });
  }

  pushSetup(){
    this.push.hasPermission().then((res: any) => {
      if(res.isEnabled){
        console.log('We have permission to send push notifications');
      }else{
        console.log('We do not have permission to send push notifications');
      }
    }).catch(err => console.log("Cordova não encontrado para verificar permissão de notificação", err));

    const options: PushOptions = {
      android: {
          senderID: this.constant.SENDER_ID
      },
      ios: {
          alert: true,
          badge: true,
          sound: true,
          clearBadge: true
      },
      windows: {}
    };
  
    const pushObject: PushObject = this.push.init(options);

    pushObject.on('notification').subscribe((notification: any) => {
      console.log("Notification Data", notification);
      this.setPage();
      this.incrementBadge(notification.additionalData.type);
      switch(notification.additionalData.type){
        case this.constant.actionEnum.PUBLICATION:
          if(notification.additionalData.foreground)
            this.feed.next(notification.additionalData);
          if(notification.additionalData.dismissed === false){
            this.clickedPublication = {
              'authorId': notification.additionalData.authorId
            };
            console.log("PUBLICATION type NOTIFICATION was CLICKED");
          }
          break;
        case this.constant.actionEnum.SYSTEM:
        case this.constant.actionEnum.LIKE:
        case this.constant.actionEnum.RELATION:
          this.clickedDefault = true;
          break;
        default:
      }
    });
  
    pushObject.on('registration').subscribe((data: any) => {
      this.storage.setFcm(data.registrationId);
      console.log('fcm: ' + data.registrationId);
      this.conn.storeFcm(data.registrationId).then(res => {
        console.log("storeFcm: ", res.json().msg);
      });
    });
  
    pushObject.on('error').subscribe(error => console.error('Erro ao obter o fcm: ' + error));
  }

  private setPage(){
    let page = this.app.getActiveNavs();
    this.page = page[0] && page[0]['root'];
  }

  private incrementBadge(type){
    if(this.page != "NotificationsPage"){
      if(type == this.constant.actionEnum.LIKE || type == this.constant.actionEnum.RELATION || type == this.constant.actionEnum.SYSTEM || type == this.constant.actionEnum.SECURITY || type == this.constant.actionEnum.COMMENT){
        this.events.publish('updateUserBadgeTab');
      }
    }else{
      this.events.publish('updateNotificationsPage');
    }
  }

}


