import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, ActionSheetController, ToastController, normalizeURL, Platform, ModalController, Events } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ConstantProvider } from "../../providers/constant/constant";
import { LoadProvider } from "../../providers/load/load";
import { ConnProvider } from "../../providers/conn/conn";
import { HelperProvider } from "../../providers/helper/helper";
import { UserValidator } from  '../../validators/user-validator';

@IonicPage()
@Component({
  selector: 'page-user-edit',
  templateUrl: 'user-edit.html',
})
export class UserEditPage{
  user: any = {};
  userEdit: FormGroup;
  photo: string;
  validationServer: any;
  constructor(public viewCtrl: ViewController, public params: NavParams, public actionSheet: ActionSheetController,
  public camera: Camera, public constant: ConstantProvider, public toast: ToastController, public conn: ConnProvider,
  public plt: Platform, public helper: HelperProvider, public load: LoadProvider, private formBuilder: FormBuilder,
  public modal: ModalController, public events: Events){
    this.user = params.data;
    this.userEdit = this.formBuilder.group({
      name:     ['', [Validators.required, Validators.maxLength(40)]],
      username: ['', Validators.compose([Validators.required, Validators.maxLength(20), Validators.pattern('[A-z0-9_]*')]), new UserValidator(conn).checkUsername],
      email:    ['', Validators.compose([Validators.required, Validators.maxLength(191), Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]), new UserValidator(conn).checkEmail],
      bio:      ['', Validators.maxLength(191)],
      site:     ['', [Validators.maxLength(191), Validators.pattern('^(https?:\/\/)*[a-z0-9-]+(\.[a-z0-9-]+)+(\/[a-z0-9-]+)*\/?$')]],
      gab:      ['', [Validators.maxLength(191), Validators.pattern('[A-z0-9_-]*')]],
      youtube:  ['', [Validators.maxLength(191), Validators.pattern('[A-z0-9._-]*')]],
      facebook: ['', [Validators.maxLength(191), Validators.pattern('[A-z0-9.]*')]],
      instagram:['', [Validators.maxLength(191), Validators.pattern('[A-z0-9_]*')]],
      twitter:  ['', [Validators.maxLength(191), Validators.pattern('[A-z0-9_]*')]],
  });
    this.userEdit.controls.name.setValue(this.user.name);
    this.userEdit.controls.username.setValue(this.user.username);
    this.userEdit.controls.email.setValue(this.user.email);
    if(this.user.authorId){
      this.userEdit.controls.bio.setValue(this.user.bio);
      this.userEdit.controls.site.setValue(this.user.site);
      this.userEdit.controls.gab.setValue(this.user.gab);
      this.userEdit.controls.youtube.setValue(this.user.youtube);
      this.userEdit.controls.facebook.setValue(this.user.facebook);
      this.userEdit.controls.instagram.setValue(this.user.instagram);
      this.userEdit.controls.twitter.setValue(this.user.twitter);
    }
  }

  edit(){
    this.load.withMessage("Alterando os dados");
    this.conn.updateUser(this.userEdit.value).then(res => {
      this.load.dismiss();
      if(this.photo){
        this.load.withMessage("Estamos salvando a sua foto");
        this.conn.setUserImage(this.photo).then(res => {
          let image = JSON.parse(res.response).data;
          if(image){
            this.user.image = image;
            this.events.publish('updateUserImageTab', image);
            this.events.publish('UserPage/user/update');
            this.toast.create({message: "Os seus dados foram atualizados", duration: 3000, position: 'bottom'}).present();
          }else{
            this.toast.create({message: "Houve um erro interno ao tentarmos salvar sua foto", duration: 3000, position: 'bottom'}).present();
          }
          this.load.dismiss();
        }).catch(err => {
          console.log("Error in upload image user", err);
          this.load.dismiss();
        })
      }else{
        if(this.userEdit.value.removeImage){
          this.events.publish('updateUserImageTab', null);
          this.userEdit.value.removeImage = false;
        }
        this.events.publish('UserPage/user/update');
        this.toast.create({message: "Os seus dados foram atualizados", duration: 3000, position: 'bottom'}).present();
      }
    }).catch(err => {
        console.log("Error in update user data", err);
        this.load.dismiss();
    });
  }
  
  optionsPhoto(){
    const actionSheet = this.actionSheet.create({
      title: 'O que você deseja fazer?',
      buttons: [
        {
          text: 'Tirar foto',
          handler: () => {
            this.getPhoto(this.constant.cameraOptions());
          }
        },{
          text: 'Escolher foto existente',
          handler: () => {
            this.getPhoto(this.constant.cameraOptions(false));
          }
        },{
          text: 'Remover foto',
          handler: () => {
            this.user.image = null;
            this.photo = null;
            this.userEdit.value.removeImage = true;
            this.toast.create({message: 'Finalize para que a mudança na foto seja completada', duration: 3000, position: 'bottom'}).present();
          }
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel photo');
          }
        }
      ]
    });
    actionSheet.present();
  }
  
  openEditPassword(){
    let modal = this.modal.create('UserPasswordEditPage');
    modal.present();
  }

  private getPhoto(options: CameraOptions){
    this.camera.getPicture(options).then((imageData) => {
      this.photo = this.plt.is('ios') ? normalizeURL(imageData) : imageData;
    }, (err) => {
      console.log("Error in get photo", err);
    });
  }

  dismiss(){
    this.viewCtrl.dismiss({data:'data'});
  }

}
