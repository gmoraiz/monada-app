import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AlertController } from 'ionic-angular';
import { LoadProvider } from '../../providers/load/load';
import { ConnProvider } from '../../providers/conn/conn';
import { ToastController } from 'ionic-angular';
import { StorageProvider } from '../../providers/storage/storage';
import { ConstantProvider } from '../../providers/constant/constant';
import { UserValidator } from  '../../validators/user-validator';
import { Clipboard } from "@ionic-native/clipboard";
import { HelperProvider } from '../../providers/helper/helper';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage{
  user: FormGroup;
  hasInvite: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, public alertCtrl: AlertController,
  public load: LoadProvider, public conn: ConnProvider, public toast: ToastController, public storage: StorageProvider,
  public constant: ConstantProvider, public clipboard: Clipboard, public helper: HelperProvider){
    this.user = this.formBuilder.group({
      name:     ['', [Validators.required, Validators.maxLength(40)]],
      username: ['', Validators.compose([Validators.required, Validators.maxLength(20), Validators.pattern('[A-z0-9_]*')]), new UserValidator(conn).checkUsername],
      email:    ['', Validators.compose([Validators.required, Validators.maxLength(191), Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]), new UserValidator(conn).checkEmail],
      invite:   ['', [], new UserValidator(conn).checkInvite],
      password: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(30)]],
      term:     [false, Validators.pattern('true')]
    });
    if(!constant.plt.is('ios')){
      this.user.controls.term.setValue(true);
    }
  }
  
  register(){
    this.load.onlyIcon();
    this.storage.getFcm().then(fcm => {
      this.user.value.fcm = fcm;
      this.conn.register(this.user.value).then(res => {
        this.load.dismiss();
        if(res.json().data){
          this.storage.setUser(res.json().data);
          this.storage.setToken(res.json().data.token);
          this.navCtrl.setRoot('TutorialPage').then(() => {
            const index = this.navCtrl.getActive().index;
            this.navCtrl.remove(0, index);
          });
        }else{
          this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
        }
      }).catch(err => this.load.dismiss())
    });
  }

  openTerm(){
    const alert = this.alertCtrl.create({
      title: 'Termos e condições de uso',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ac ante metus. Phasellus eget eros luctus, cursus turpis nec, porta nibh. Donec rhoncus laoreet mauris, eu vestibulum eros lobortis et. Nulla facilisi. Donec euismod risus eu nunc fringilla condimentum. In auctor, dolor eget faucibus laoreet, eros ipsum convallis quam, eu vehicula ex ligula a nisi. Suspendisse facilisis, mauris eu sodales hendrerit, ligula lectus luctus justo, non tincidunt lacus sapien sit amet nisi. Vestibulum elementum, mauris a consequat pulvinar, velit nisi maximus nibh, non commodo justo quam vitae velit. Phasellus pulvinar, sem non mattis tincidunt, quam sem tempus libero, non ornare ante ante ac mi. Sed vitae ultricies libero. Curabitur eleifend ex eget iaculis egestas. Donec sit amet nulla non erat lobortis iaculis. Etiam tellus mi, hendrerit quis scelerisque quis, ultricies a arcu. Suspendisse potenti. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse potenti. Suspendisse consequat dolor ex, id tempus tortor cursus quis. Phasellus laoreet eu quam quis feugiat. Etiam mauris orci, accumsan sodales erat et, gravida porta urna. Morbi odio lectus, semper quis risus a, accumsan tincidunt ipsum. Suspendisse posuere, lectus non varius venenatis, mi lacus imperdiet mi, in pharetra lacus felis at tellus. Duis sed viverra libero. Etiam nec luctus tortor. Etiam sed sapien a purus finibus posuere. Donec eu faucibus risus. Nullam ornare sapien vitae ex fringilla, et facilisis lectus hendrerit. Cras dapibus luctus fermentum. Ut eu risus mollis, gravida tellus sit amet, malesuada quam. Nulla nec turpis ut mauris blandit finibus. In hac habitasse platea dictumst. Mauris lacinia scelerisque sagittis. Nulla dapibus eleifend nunc ut tempus. Nam vehicula, lectus in facilisis aliquet, enim lacus dignissim arcu, vel condimentum dolor elit eu urna. Proin neque justo, feugiat et erat at, accumsan ornare sapien. Morbi non purus tellus. Praesent eleifend enim vel metus fermentum luctus. Aliquam viverra felis a arcu sodales, a pharetra dui tempus. Nullam facilisis tincidunt orci, nec vehicula nisi lacinia eget. Vivamus aliquam, lectus eget dignissim dignissim, purus tellus hendrerit justo, nec rutrum orci libero et lectus. Sed convallis augue non elit tincidunt ultrices. Morbi semper magna eget lacus iaculis tincidunt. Donec risus metus, pellentesque at facilisis eu, lacinia at nibh. Duis iaculis pulvinar leo, eget fermentum nibh imperdiet sit amet. Praesent mi enim, rhoncus vulputate dolor eget, ultrices scelerisque ipsum. Nam nec odio elementum, pellentesque nisi eu, malesuada diam. In non pretium libero. Sed ipsum elit, scelerisque id sodales nec, dapibus eu mi. Nulla at quam ac justo porttitor porttitor eu eget elit. Fusce nec aliquet turpis, sed tempor arcu. Nunc eu nisi nec ligula mollis sodales eu in felis. Aliquam pulvinar facilisis erat eu efficitur. Praesent metus lacus, bibendum in fringilla non, tristique ac neque. Sed blandit fermentum enim in cursus. Mauris cursus, massa non placerat dictum, ex magna fringilla urna, ut bibendum libero urna et arcu. Pellentesque lobortis pretium finibus. Ut eu lorem eget tellus vulputate posuere vitae nec tortor. Sed enim ligula, semper et luctus sit amet, luctus sit amet risus. Sed faucibus neque nec quam facilisis, vel egestas nisl mollis. Sed id ornare urna. In sollicitudin iaculis risus non hendrerit. Cras eget metus placerat, convallis lacus eget, suscipit lectus.',
      buttons: ['Entendido!']
    });
    alert.present();
  }

  openExplanation(){
    const alert = this.alertCtrl.create({
      title: 'Convite de autor',
      message: 'Com esta chave você pode realizar publicações em nosso sistema. Atualmente, ela é fornecida somente às pessoas atuantes no trabalho informacional noutras redes sociais. És uma destas? Solicite-a no endereço <b>contato@monadaweb.com</b>',
      buttons: ['Entendido!'],
    });
    alert.addButton({
      text: "Copiar Email",
      handler: () => {
        this.clipboard.copy('contato@monadaweb.com');
        this.toast.create({message: 'contato@monadaweb.com foi copiado', duration: 2000, position: 'bottom'}).present();
      }
    });
    alert.present();
  }
  setInvite(x){
    if(!x){
      this.user.controls.invite.setValue("");
    }
    this.hasInvite = x;
  }

  ionViewDidLoad(){
    console.log('ionViewDidLoad RegisterPage');
  }

}
