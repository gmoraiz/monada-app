import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, ActionSheetController, ToastController, normalizeURL, Platform, ModalController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ConstantProvider } from "../../providers/constant/constant";
import { LoadProvider } from "../../providers/load/load";
import { ConnProvider } from "../../providers/conn/conn";
import { HelperProvider } from "../../providers/helper/helper";

@IonicPage()
@Component({
  selector: 'page-user-folder-create',
  templateUrl: 'user-folder-create.html',
})
export class UserFolderCreatePage{
  folder: any = {
    id: null,
    name: null,
    image: null
  };
  folderForm: FormGroup;
  photo: string;
  validationServer: any;
  editMode: boolean = false;

  constructor(public viewCtrl: ViewController, public params: NavParams, public actionSheet: ActionSheetController,
  public camera: Camera, public constant: ConstantProvider, public toast: ToastController, public conn: ConnProvider,
  public plt: Platform, public helper: HelperProvider, public load: LoadProvider, private formBuilder: FormBuilder,
  public modal: ModalController, public alert: AlertController, public platform: Platform){
    this.folderForm = this.formBuilder.group({
      name:     ['', [Validators.required, Validators.maxLength(40)]]
    });
    if(params.get('editMode')){
      this.editMode = true;
      this.folder = params.get('folder');
      this.folderForm.controls.name.setValue(this.folder.name);
      this.photo = this.folder.image;
    }

    let backAction =  platform.registerBackButtonAction(() => {
      console.log("BackButton UserFolderCreate");
      this.dismiss();
      backAction();
    }, 2);
  }

  store(){
    this.load.withMessage("Criando");
    this.conn.storeFolder(this.folderForm.value).then(res => {
      this.folder.id = res.json().data;
      this.folder.name = this.folderForm.value.name;
      this.load.dismiss();
      if(this.photo){
        this.load.withMessage("Estamos salvando a imagem da sua pasta");
        this.conn.setFolderImage(this.photo, {folderId: this.folder.id}).then(res => {
          let image = JSON.parse(res.response).data;
          if(image){
            this.folder.image = image;
            this.toast.create({message: "Pasta criada com sucesso", duration: 3000, position: 'bottom'}).present();
            this.dismiss('create');
          }else{
            this.toast.create({message: "Houve um erro interno ao tentarmos salvar a imagem da sua pasta", duration: 3000, position: 'bottom'}).present();
          }
          this.load.dismiss();
        }).catch(err => {
          console.log("Error in store image folder", err);
          this.load.dismiss();
        })
      }else{
        this.toast.create({message: "Pasta criada com sucesso", duration: 3000, position: 'bottom'}).present();
        this.dismiss('create');
      }
    }).catch(err => {
        console.log("Error in store folder data", err);
        this.load.dismiss();
    });
  }

  update(){
    this.load.withMessage("Alterando os dados");
    this.folderForm.value.folderId = this.folder.id;
    this.conn.updateFolder(this.folderForm.value).then(res => {
      this.folder.name = this.folderForm.value.name;
      this.load.dismiss();
      if(this.photo){
        this.load.withMessage("Estamos salvando a nova imagem da sua pasta");
        this.conn.setFolderImage(this.photo, {folderId: this.folder.id}).then(res => {
          let image = JSON.parse(res.response).data;
          if(image){
            this.folder.image = image;
            this.toast.create({message: "Pasta atualizada com sucesso", duration: 3000, position: 'bottom'}).present();
          }else{
            this.toast.create({message: "Houve um erro interno ao tentarmos atualizar a imagem da sua pasta", duration: 3000, position: 'bottom'}).present();
          }
          this.load.dismiss();
          this.dismiss('edit');
        }).catch(err => {
          console.log("Error in update image folder", err);
          this.load.dismiss();
        })
      }else{
        if(this.folderForm.value.removeImage){
          this.folderForm.value.removeImage = false;
        }
        this.toast.create({message: "Pasta atualizada com sucesso", duration: 3000, position: 'bottom'}).present();
        this.dismiss('edit');
      }
    }).catch(err => {
        console.log("Error in update folder data", err);
        this.load.dismiss();
    });
  }

  delete(){
    let alert = this.alert.create({
      title: 'Você tem certeza desta ação?',
      message: "As publicações vinculadas a esta pasta permanecerão no sistema",
    });
    alert.addButton('Cancelar');
    alert.addButton({
      text:'Confirmar',
      handler: data => {
        this.load.withMessage("Aguarde");
        this.conn.deleteFolder(this.folder.id).then(res => {
          this.load.dismiss();
          this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          if(res.json().data){
            this.dismiss('delete');
          }
        }).catch(err => {
            console.log("Error in delete folder data", err);
            this.load.dismiss();
        });
      }
    });
    alert.present();
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
            this.photo = null;
            this.folderForm.value.removeImage = true;
            this.toast.create({message: 'Finalize para que a mudança na imagem seja completada', duration: 3000, position: 'bottom'}).present();
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

  private getPhoto(options: CameraOptions){
    this.camera.getPicture(options).then((imageData) => {
      this.photo = this.plt.is('ios') ? normalizeURL(imageData) : imageData;
    }, (err) => {
      console.log("Error in get photo", err);
    });
  }

  dismiss(action: string = null){
    this.viewCtrl.dismiss({action: action, folder: this.folder});
  }

}
