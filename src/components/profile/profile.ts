import { Component, Input } from '@angular/core';
import { SocialSharing } from "@ionic-native/social-sharing";
import { ToastController, ActionSheetController, ModalController, Events } from "ionic-angular";
import { Clipboard } from "@ionic-native/clipboard";
import { ConnProvider } from "../../providers/conn/conn";
import { HelperProvider } from "../../providers/helper/helper";
import { ConstantProvider } from "../../providers/constant/constant";


@Component({
  selector: 'profile',
  templateUrl: 'profile.html'
})
export class ProfileComponent{

  @Input('user') user;
  @Input('me') me;

  constructor(public toast: ToastController, public clipboard: Clipboard, public actionSheet: ActionSheetController, public conn: ConnProvider,
  public socialSharing: SocialSharing, public modal: ModalController, public helper: HelperProvider, 
  public constant: ConstantProvider, public events: Events){
  }

  openSocialMedia(link){
    const actionSheet = this.actionSheet.create({
      title: 'O que você deseja fazer?',
      buttons: [
        {
          text: 'Abrir',
          handler: () => {
            window.open(link, "_system",  "location=no");
            console.log('Open social media');
          }
        },{
          text: 'Compartilhar',
          handler: () => {
            this.socialSharing.share("Dê uma olhada nesta rede do " + this.user.name, "Compartilhado via Monada", this.user.image, link).then(() => {
              console.log("Shared with success!!!");
            }).catch(() => {
              console.log("Error on share!!!");
            });
            console.log('Share social media');
          }
        },{
          text: 'Copiar link',
          handler: () => {
            this.clipboard.copy(link);
            this.toast.create({message: 'Copiado com sucesso', duration: 3000, position: 'bottom'}).present();
            console.log('Share social clipped');
          }
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel social media');
          }
        }
      ]
    });
    actionSheet.present();
  }

  followAction(){
    if(!this.user.followAction){
      this.user.followAction = true;
      if(this.user.followed){
        this.conn.unfollow(this.user.userId).then(res => {
          if(res.json().data){
            this.user.followAction = false;
            this.user.followed = false;
          }else{
            this.toast.create({message: res.msg, duration: 3000, position: 'bottom'}).present();
          }
          this.events.publish('authors/changeSearchByProfile', {action: 'unfollow', userId: this.user.userId});
          this.events.publish('home/resetAllPublications', {userId: this.user.userId});
        }).catch(err => this.user.saveAction = false);
      }else{
        this.conn.follow({users: [this.user.userId]}).then(res => {
          if(res.json().data){
            this.user.followAction = false;
            this.user.followed = true;
            this.user.muted = true;
          }else{
            this.toast.create({message: res.msg, duration: 3000, position: 'bottom'}).present();
          }
          this.events.publish('authors/changeSearchByProfile', {action: 'follow', userId: this.user.userId});
          this.events.publish('home/resetAllPublications', {userId: this.user.userId, followed: true});
        }).catch(err => this.user.followAction = false);
      }
    }
  }

  muteAction(){
    if(!this.user.muteAction){
      this.user.muteAction = true;
      if(this.user.muted){
        this.conn.unmute(this.user.userId).then(res => {
          this.user.muteAction = false;
          if(res.json().data){
            this.toast.create({message: "Agora você receberá as notificações de "+this.user.name, duration: 3000, position: 'top'}).present();
            this.user.muted = false;
          }else{
            this.toast.create({message: res.msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => this.user.muteAction = false);
      }else{
        this.conn.mute(this.user.userId).then(res => {
          this.user.muteAction = false;
          if(res.json().data){
            this.toast.create({message: "As notificações de "+this.user.name+" foram canceladas", duration: 3000, position: 'top'}).present();
            this.user.muted = true;
          }else{
            this.toast.create({message: res.msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => this.user.muteAction = false);
      }
    }
  }

  openEdit(){
    let modal = this.modal.create('UserEditPage', this.user);
    modal.present();
    modal.onDidDismiss(data => {
     console.log(data);
   });
  }

  openInvite(){
    let modal = this.modal.create('InvitePage');
    modal.present();
    modal.onDidDismiss(data => {
     console.log(data);
   });
  }

  openFollowers(){
    let modal = this.modal.create('UserListPage', {type:this.constant.userListEnum.FOLLOWERS, userId: this.user.userId, notMe: this.me ? false : true});
    modal.present();
  }

}
