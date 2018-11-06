import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AlertController } from 'ionic-angular';
import { LoadProvider } from '../../providers/load/load';
import { ConnProvider } from '../../providers/conn/conn';
import { ToastController, ViewController } from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import { ConstantProvider } from '../../providers/constant/constant';
import { UserValidator } from  '../../validators/user-validator';


@IonicPage()
@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html',
})
export class InvitePage {
  user: FormGroup;
  
  constructor(public navCtrl: NavController, private formBuilder: FormBuilder, public alertCtrl: AlertController,
  public load: LoadProvider, public conn: ConnProvider, public toast: ToastController, public storage: StorageProvider,
  public constant: ConstantProvider, public viewCtrl: ViewController){
    this.user = this.formBuilder.group({
      invite:   ['', Validators.required, new UserValidator(conn).checkInvite],
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InvitePage');
  }

  give(){
    this.load.withMessage("Aguarde");
    this.conn.storeAuthor(this.user.value).then((res) => {
      this.load.dismiss();
      if(res.json().data){
        this.storage.getUser().then(user => {
          user.authorId = res.json().data.authorId;
          this.storage.setUser(user);
          let alert = this.alertCtrl.create({
            title: 'Agora tu és um autor no Monada',
            message: "Em 5 segundos atualizaremos a página para a atualização de seus dados."
          });
          //alert.addButton('Cancelar');
          alert.present();
          setTimeout(() => window.location.reload(), 5000);
        });
      }else{
        this.toast.create({message: res.json().msg, duration: 4000, position: 'bottom'}).present();
      }
    }).catch((err) => this.load.dismiss());
  }

  solicitInvite(){
    let alert = this.alertCtrl.create({
      title: 'Seja um autor no Monada',
      message: "Tu já atuas com produção de contéudo na internet? Requisite-nos o acesso no modo autor."
    });
    alert.addButton('Cancelar');
    alert.addButton({
      text: 'Requisitar',
      handler: () => {
        this.load.onlyIcon();
        this.conn.solicitInvite().then((res) => {
          this.load.dismiss();
          if(res.json().data){
            this.toast.create({message: "Muito obrigado!!! Verificaremos sua solicitação.", duration: 4000, position: 'bottom'}).present();
            this.dismiss();
          }
        }).catch((err) => this.load.dismiss());
      }
    });
    alert.present();
  }

  dismiss(action: string = null){
    this.viewCtrl.dismiss({action: action});
  }

}
