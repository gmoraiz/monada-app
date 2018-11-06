import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, NavController, ToastController } from 'ionic-angular';
import { SocialSharing } from "@ionic-native/social-sharing";
import { ConnProvider } from "../../providers/conn/conn";

@IonicPage()
@Component({
  selector: 'page-popover-options-status',
  templateUrl: 'popover-options-status.html',
})
export class PopoverOptionsStatusPage {
  user: any = {}
  constructor(public viewCtrl: ViewController, public navParams: NavParams, public socialSharing: SocialSharing,
  public nav: NavController, public conn: ConnProvider, public toast: ToastController){
    this.user = this.navParams.data;
  }


  shareProfile(){
    this.close();
    this.socialSharing.share("Siga " + this.user.name + " no Monada!", "", null, "https://monadaweb.com/"+this.user.username).then(() => {
      console.log("Shared with success!!!");
    }).catch(() => {
      console.log("Error on share!!!");
    });
  }

   muteProfile(){
      this.close();
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

  openProfile(){
    this.nav.push('ProfilePage', this.user).then(() => {
      this.close();
    });
  }

  close(){
    this.viewCtrl.dismiss();
  }

}
