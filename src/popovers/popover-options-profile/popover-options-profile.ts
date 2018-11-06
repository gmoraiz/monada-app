import { Component } from '@angular/core';
import { NavParams, ViewController, IonicPage, AlertController, ToastController } from 'ionic-angular';
import { SocialSharing } from "@ionic-native/social-sharing";
import { HelperProvider } from '../../providers/helper/helper';
import { ConnProvider } from '../../providers/conn/conn';
import { LoadProvider } from '../../providers/load/load';

@IonicPage()
@Component({
  selector: 'page-popover-options-profile',
  templateUrl: 'popover-options-profile.html',
})
export class PopoverOptionsProfilePage {
  user: any = {}
  constructor(public viewCtrl: ViewController, public navParams: NavParams, public socialSharing: SocialSharing,
    public helper: HelperProvider, public alert: AlertController, public conn: ConnProvider, public load: LoadProvider,
    public toast: ToastController){
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

  block(){
    let alert = this.alert.create({
      title: 'Tens certeza desta ação?',
      message: "As publicações deste usuário não serão mais visíveis em nenhum local do sistema. Caso você o siga, deixará de segui-lo.",
    });
    alert.addButton({
      text:'Cancelar',
      handler: data => {
        this.close();
      }
    });
    alert.addButton({
      text:'Confirmar',
      handler: data => {
        this.load.withMessage("Aguarde");
        this.conn.block({userId: this.user.userId}).then(res => {
          this.load.dismiss();
          if(!res.json().data){
            this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          }
          this.close('block');
        }).catch(err => this.load.dismiss());
      }
    });
    alert.present();
  }

  unblock(){
    this.load.withMessage("Aguarde");
    this.conn.unblock(this.user.userId).then(res => {
      this.load.dismiss();
      if(!res.json().data){
        this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
      }
      this.close('unblock');
    }).catch(err => this.load.dismiss());
  }

  close(action: string = null){
    this.viewCtrl.dismiss({action: action, user: this.user});
  }

}
