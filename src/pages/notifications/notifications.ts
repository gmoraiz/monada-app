import { Component, NgZone } from '@angular/core';
import { IonicPage, NavParams, Events, ToastController, ModalController, Platform } from 'ionic-angular';
import { ConnProvider } from "../../providers/conn/conn";
import { StorageProvider } from "../../providers/storage/storage";
import { ConstantProvider } from "../../providers/constant/constant";

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {
  notifications: Array<any> = [];
  loadingNotifications: boolean = true;
  offset: number = this.constant.userNotificationsLimit;

  constructor(public navParams: NavParams, public conn: ConnProvider, public modal: ModalController,
  public events: Events, public storage: StorageProvider, public toast: ToastController, public constant: ConstantProvider,
  public ngZone: NgZone, public platform: Platform){
    this.events.subscribe('updateNotificationsPage', () => {
      this.ngZone.run(() => {
        if(this.offset == this.constant.userNotificationsLimit){
          this.conn.notifications().then(res => {
            this.notifications = res.json().data;
          }).catch(err => {
            console.log("Error in update notifications after push", err);
          });
        }else{
          this.toast.create({message: "Você tem novas notificações", duration: 4000, position: 'top', showCloseButton:true, closeButtonText:"Ok"}).present();
        }
      });
    });
    this.conn.notifications().then(res => {
      this.notifications = res.json().data;
      this.setLoadingNotifications(false);
    }).catch(err => {
      console.log("Error in get notifications", err);
      this.setLoadingNotifications(false);
    });
  }

  ionViewWillEnter(){
    //this.events.publish('setActualPageName', this.navCtrl.last().name);
    this.storage.getUser().then(user => {
      if(user.badge){
        this.conn.readNotifications().then(res => {
          this.events.publish('updateUserBadgeTab',true);
          this.storage.getUser().then(user => {
            user.badge = 0;
            this.storage.setUser(user);
          });
        }).catch(err => console.log("Error in read notifications", err));
      }
    });
  }

  openFollowers(){
    this.storage.getUser().then(user => {
      let modal = this.modal.create('UserListPage', {type:this.constant.userListEnum.FOLLOWERS, userId: user.userId});
      modal.present();
    });
  }

  openLiked(publicationId: number){
    this.storage.getUser().then(user => {
      let modal = this.modal.create('UserListPage', {type:this.constant.userListEnum.LIKED, publicationId: publicationId});
      modal.present();
    });
  }

  private setOffset(){
    this.offset+= this.constant.userNotificationsLimit;
  }

  private setLoadingNotifications(x:boolean = true){
    this.loadingNotifications = x;
  }

  doRefresh(refresher){
    this.conn.notifications().then(res => {
      this.notifications = res.json().data;
      if(res.json().data.length){
        this.offset = this.constant.userNotificationsLimit;
      }
      refresher.complete();
    }).catch(err => {
      console.log("Error in refresher notifications", err);
      refresher.complete();
    });
  }
  

  doInfinite(infiniteScroll){
    this.conn.notifications().then(res => {
      this.notifications = this.notifications.concat(res.json().data);
      if(res.json().data.length){
        this.setOffset();
      }
      infiniteScroll.complete();
    }).catch(err => {
      console.log("Error in infinite scroll notifications", err);
      infiniteScroll.complete();
    });
  }

}
