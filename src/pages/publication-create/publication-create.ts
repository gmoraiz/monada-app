import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, normalizeURL, Platform, Content, AlertController, ModalController, ActionSheetController, ViewController, PopoverController, Events } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { TwitterConnect } from '@ionic-native/twitter-connect';
import { StorageProvider } from "../../providers/storage/storage";
import { ConnTwitterProvider } from "../../providers/conn-twitter/conn-twitter";
import { ImagePicker } from '@ionic-native/image-picker';
import { ConstantProvider } from "../../providers/constant/constant";
import { Camera } from "@ionic-native/camera";
import { ConnProvider } from "../../providers/conn/conn";
import { trigger, style, animate, transition } from '@angular/animations';
import { AlertInputOptions } from "ionic-angular/components/alert/alert-options";
import { LoadProvider } from "../../providers/load/load";
import { HelperProvider } from "../../providers/helper/helper";

@IonicPage()
@Component({
  selector: 'page-publication-create',
  templateUrl: 'publication-create.html',
  animations: [
    trigger(
      'linkSearchAnimation', [
        transition(':enter', [
          style({transform: 'translateY(100%)', opacity: 0}),
          animate('200ms', style({transform: 'translateY(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateY(0)', opacity: 1}),
          animate('200ms', style({transform: 'translateY(100%)', opacity: 0}))
        ])
      ]
    )
  ]
})
export class PublicationCreatePage {
  @ViewChild('description') description;
  @ViewChild(Content) content: Content;
  editMode: boolean = false;
  searchLink:string = "";
  linkOpen:boolean = false;
  searchingLink:boolean = false;
  action:string = null;
  publication: any = {
    title: "",
    description: "",
    link: {},
    images: [],
    categories: [], 
    folder: {}
  };
  categories: Array<any> = [];

  constructor(public navCtrl: NavController, public params: NavParams, public facebook: Facebook,
  public twitter: TwitterConnect, public toast: ToastController, public storage: StorageProvider,
  public connTwitter: ConnTwitterProvider, public constant: ConstantProvider, public modal: ModalController,
  public camera: Camera, public plt: Platform, public conn: ConnProvider, public alert: AlertController,
  public actionSheet: ActionSheetController, public load: LoadProvider, public viewCtrl: ViewController,
  public helper: HelperProvider, public popover: PopoverController, public imagePicker: ImagePicker,
  public events: Events, public platform: Platform){
    this.storage.getCategories().then(categories => this.categories = categories);
    this.conn.categories().then(res =>{
      this.categories = res.json().data;
      this.storage.setCategories(this.categories);
    }).catch(err => {
      console.log("Error in categories load", err);
    });
    if(params.get('editMode')){
      this.editMode = true;
      this.buildPublicationToEdit();
    }
    let backAction =  platform.registerBackButtonAction(() => {
      console.log("BackButton PublicationCreatePage");
      this.dismiss();
      backAction();
    }, 2);
  }

  ionViewDidLoad(){
    setTimeout(() => {
      this.description.setFocus();
    },500)
  }

  store(){
    if(!this.validated()) return false;
    if(this.publication.images.length){
      this.load.withMessage("Suas imagens estão sendo salvas");
      this.initUploadImage().then(res => {
        this.load.dismiss();
        switch(res){
          case 'SUCCESS':
            this.initStore();
            break;
          case 'ERROR_UPLOAD':
            this.toast.create({message: "Houve um erro no envio de uma das imagens.", duration: 4000, position: 'bottom'}).present();
            break;
          case 'ERROR_PROMISE':
            this.toast.create({message: "Houve um erro ao prepararmos as imagens para o envio.", duration: 4000, position: 'bottom'}).present();
            break;
        }
      }).catch(err => {
        console.log(err);
        this.load.dismiss();
      });
    }else{
      this.initStore();
    }
  }

  edit(){
    if(!this.validated()) return false;
    if(this.publication.images.filter(x => x.nameToUpload).length){
      this.load.withMessage("Suas novas imagens estão sendo salvas");
      this.initUploadImage().then(res => {
        this.load.dismiss();
        switch(res){
          case 'SUCCESS':
            this.initEdit();
            break;
          case 'ERROR_UPLOAD':
            this.toast.create({message: "Houve um erro no envio de uma das imagens.", duration: 4000, position: 'bottom'}).present();
            break;
          case 'ERROR_PROMISE':
            this.toast.create({message: "Houve um erro ao prepararmos as imagens para o envio.", duration: 4000, position: 'bottom'}).present();
            break;
        }
      }).catch(err => {
        console.log(err);
        this.load.dismiss();
      });
    }else{
      this.initEdit();
    }
  }

  initEdit(){
    this.load.withMessage("Editando");
    this.conn.updatePublication(this.serialize()).then(res => {
      this.load.dismiss();
      if(res.json().data){
        this.action = 'edit';
        this.toast.create({message: "Publicação atualizada com sucesso", duration: 3000, position: 'bottom'}).present();
      }else{
        this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
      }
    }).catch(err => {
        console.log("Error in update publication data", err);
        this.load.dismiss();
    });
  }

  initStore(){
    this.load.withMessage("Publicando");
    this.conn.storePublication(this.serialize()).then(res => {
      this.load.dismiss();
      if(res.json().data.id){
        this.publication.id = res.json().data.id;
        this.publication.urlToShare = res.json().data.link;
        this.events.publish('UserPage/publication/create');
        this.alertPublicationShare();
      }else{
        this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
      }
    }).catch(err => {
        console.log("Error in store publication data", err);
        this.load.dismiss();
    });
  }

  shareFacebook(){
    return new Promise((resolve, reject) => {
      this.facebook.showDialog({
        method:'share',
        href: this.publication.urlToShare
      }).then(res => {
        console.log("Share facebook", res);
        resolve(true);
      }).catch(err => {
        // this.helper.checkApp('facebook').then(res => {
        //   if(res === false){
        //     this.toast.create({message: "É necessário que o aplicativo do facebook esteja instalado no seu dispositivo", duration: 6000, position: 'bottom', closeButtonText:"Ok", showCloseButton: true}).present();
        //   }
        // });
        console.log("Share facebook error", err);
        resolve(true);
      });
    })
  }

  private loginTwitter(): Promise<boolean>{
    return new Promise ((resolve, reject) => {
      this.twitter.login().then(resLogin => {
        this.twitter.showUser().then(resUser => {
          console.log('showUserTwitter', resUser);
        }).catch(resUser => {
          let twitter = Object.assign(resLogin);
          twitter.name = resUser.name;
          twitter.image = resUser.profile_image_url;
          this.storage.setTwitter(twitter).then(res => {
            this.connTwitter.setAuth().then(() => {
              resolve(true);
            }).catch(() => resolve(false));
          }).catch(err => {
            resolve(false);
            console.log("Ocorreu um erro ao salvarmos os dados do seu twitter", err);
          })
          console.log('showUserTwitterError', resUser);
        });
        console.log('loginTwitter', resLogin);
      }).catch(err => {
        resolve(false);
        console.log('loginTwitterError', err)
      });
    });
  }

  initShareTwitter(){
    if(this.connTwitter.isAuth()){
      this.shareTwitter();
    }else{
      this.loginTwitter().then(logged => {
        if(logged){
          this.shareTwitter();
        }else{
          this.helper.checkApp('twitter').then(res => {
            if(res === false){
              this.toast.create({message: "É necessário que o aplicativo do facebook esteja instalado no seu dispositivo", duration: 6000, position: 'bottom', closeButtonText:"Ok", showCloseButton: true}).present();
            }else{
              this.toast.create({message: "Houve um erro ao procedermos com a autenticação no twitter", duration: 3000, position: 'bottom'}).present();
            }
          });
        }
      });
    }
  }

  shareTwitter(){
    let status = "";
    if(this.publication.description != "" && this.publication.title != ""){
      status = this.publication.title + " — " + this.publication.description;
    }else{
      status = this.publication.title || this.publication.description;
    }
    status = status.slice(0,(280 - this.publication.urlToShare.length)) +" "+ this.publication.urlToShare;
    this.connTwitter.tweet(status).then(res => {
      if(res.status == 200){
        this.success();
      }else{
        this.toast.create({message: "Não foi possível compartilhar a sua publicação no twitter!", duration: 6000, position: 'bottom', closeButtonText:"Ok", showCloseButton: true}).present();
      }
      console.log(res);
    }).catch(err => {
      this.toast.create({message: "Não foi possível compartilhar a sua publicação no twitter!", duration: 6000, position: 'bottom', closeButtonText:"Ok", showCloseButton: true}).present();
      console.log("Erro in send tweet", err);
    });
  }

  loginFacebook(){
    this.facebook.getLoginStatus().then(res => {
      console.log('getLoginStatus', res);
      if(res.status !== "unknown"){
        this.facebook.logout().then(res => {
          console.log("Logout", res);
          if(res){
            this.login();
          }
        }).catch(err => console.log("Logout error", err));
      }else{
        this.login();
      }
    })
  }

  login(){
    this.facebook.login(['manage_pages']).then(res => {
      console.log('login', res);
      this.facebook.getAccessToken().then(res => {
        console.log('getAccessToken', res);
      }).catch(err => {
        console.log(err);
      });
    }).catch(err => {
      console.log(err);
    })
  }

  getMetatag(){
    if(this.searchLink){
      if(this.validSearchLink()){
        this.searchingLink = true;
        this.conn.linkMetatag(this.searchLink).then(res => {
          this.setLinkOpen(false);
          this.content.resize();
          this.searchingLink = false;
          this.publication.link = res.json().data;
          console.log(this.publication.link);
        }).catch(err => {
          this.searchingLink = false;
          console.log("Error in get Metatag link", err);
        })
      }else{
        this.toast.create({message: "O link inserido é inválido", duration: 3000, position: 'bottom'}).present();
      }
    }
  }

  folderOptions(){
    const actionSheet = this.actionSheet.create({
      title: 'O que você deseja fazer?',
      buttons: [
        {
          text: 'Selecionar outra pasta',
          handler: () => {
            this.openFolders();
          }
        },{
          text: 'Desvincular pasta',
          role: 'destructive',
          handler: () => {
            this.publication.folder = {};
          }
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel folder options');
          }
        }
      ]
    });
    actionSheet.present();
  }

  titleValidatorSize(ev: any = {}){
    switch(ev.type){
      case "keypress":
        if(this.publication.title.length >= 100){
          ev.preventDefault();
        }
        break;
      case "paste":
        let text = ev.clipboardData.getData('text/plain');
        let actualSize = 100 - this.publication.title.length;
        if(text.length > actualSize){
          this.toast.create({message: "O texto copiado excede o limite de 100 caracteres do título, portanto foi interrompido.", duration: 3000, position: 'bottom'}).present();
          ev.preventDefault();
        }
        break;
      default:
    }
  }

  openFolders(){
    let modal = this.modal.create('UserFolderPage', {selectMode: true});
    modal.present();
    modal.onDidDismiss(data => {
      if(data.folder != null){
        this.publication.folder = data.folder;
      }
    });
  }

  getGallery(){
    if(this.imageLimit()) return false;
    if(!this.publication.link.url){
      this.imagePicker.getPictures({
        maximumImagesCount: 5 - this.publication.images.length,
        quality: 50,
      }).then(results => {
        for (var i = 0; i < results.length; i++) {
          this.publication.images.push({nameToUpload: this.plt.is('ios') ? normalizeURL(results[i]) : results[i]});
        }
      }, (err) => {
        console.log("Error in get photo gallery", err);
      }).catch(err => console.log("Error promise getPictures gallery", err));
    }else{
      this.alertPhotoWithLink();
    }
  }

  getCamera(){
    if(this.imageLimit()) return false;
    if(!this.publication.link.url){
      this.camera.getPicture(this.constant.cameraOptions()).then((imageData) => {
        this.publication.images.push({nameToUpload: this.plt.is('ios') ? normalizeURL(imageData) : imageData});
      }, (err) => {
        console.log("Error in get photo", err);
      });
    }else{
      this.alertPhotoWithLink();
    }
  }

  closeLink(){
    this.searchLink = "";
    this.publication.link = {};
    this.content.resize();
  }

  setLinkOpen(x: boolean = true){
    if(x && this.publication.images.length){
      this.alertLinkWithPhoto();
    }else{
      this.linkOpen = x;
      setTimeout(() => {
        this.content.resize();
      },250);
    }
  }

  removeImage(image){
    this.publication.images = this.publication.images.filter(x => x !== image);
  }

  removeCategory(category){
    this.publication.categories = this.publication.categories.filter(x => x !== category);
  }

  dismiss(){
    this.viewCtrl.dismiss({publication: this.publication, action: this.action});
  }

  delete(){
    let alert = this.alert.create({
      title: 'Você tem certeza desta ação?',
      message: "A publicação será permanentemente removida do sistema",
    });
    alert.addButton('Cancelar');
    alert.addButton({
      text:'Confirmar',
      handler: data => {
        this.load.withMessage("Aguarde");
        this.conn.deletePublication(this.publication.id).then(res => {
          this.load.dismiss();
          this.toast.create({message: res.json().msg, duration: 3000, position: 'bottom'}).present();
          if(res.json().data){
            this.events.publish('UserPage/publication/delete', this.publication.id);
            this.action = 'delete';
            this.dismiss();
          }else{
            this.dismiss();
          }
        }).catch(err => {
            console.log("Error in delete publication data", err);
            this.load.dismiss();
            this.dismiss();
        });
      }
    });
    alert.present();
  }

  private initUploadImage(){
    return new Promise ((resolve, reject) => {
      let promises: Array<Promise<any>> = [];
      this.publication.images.filter(x => x.nameToUpload).forEach((image, i) => {
        console.log("Image "+(i+1)+" to insert", image);
        promises.push(
          this.conn.setPublicationImage(image.nameToUpload).then(res => {
            let imageRes = JSON.parse(res.response).data;
            if(imageRes){
              console.log("Image "+(i+1)+" success", imageRes);
              image.success = true;
              image.name    = imageRes.name;
              image.id      = imageRes.imageId;
            }else{
              console.log("Image "+(i+1)+" fail", imageRes);
              image.success = false;
            }
          }).catch(err => {
            image.success = false;
            console.log("Error in store Image "+(i+1), err);
          })
        );
      });
      Promise.all(promises).then(res => {
        console.log("Success promise in store all images", this.publication.images);
        if(this.publication.images.filter(x => x.success == false).length){
          resolve("ERROR_UPLOAD");
        }else{
          resolve("SUCCESS");
        }
      }).catch(err => {
        console.log("Error promise in store all images", err);
        resolve("ERROR_PROMISE");
      });
    });
  }

  private serialize(){
    let data = Object.assign({
      title: this.publication.title,
      description: this.publication.description,
      folderId: this.publication.folder.id,
      category: this.publication.categories.map(x => x.id),
      link: this.publication.link.url,
      images: this.publication.images.map(x => x.id)
    });
    if(this.publication.id){
      data.id = this.publication.id;
    }
    return data;
  }

  private validated(){
    if((this.publication.title == null || this.publication.title == "") &&
       (this.publication.description == null || this.publication.description == "") &&
       !this.publication.images.length && !this.publication.link.url){
      this.toast.create({message: "Para publicar, é necessário pelo menos uma imagem, um link, ou o corpo do texto", duration: 4000, position: 'bottom'}).present();
      return false;
    }
    if((this.publication.title == null || this.publication.title == "") &&
       (this.publication.description == null || this.publication.description == "") && 
       !this.publication.images.length && !this.publication.link.url){
      this.toast.create({message: "Você não pode publicar somente o título. Insira o corpo do texto, um link ou uma imagem", duration: 4000, position: 'bottom'}).present();
      return false;
    }
    return true;
  }

  private imageLimit(){
    if(this.publication.images.length == 5){
      this.toast.create({message: "Você atingiu o limite de 5 imagens", duration: 3000, position: 'bottom'}).present();
      return true;
    }
    return false;
  }

  private openCategory(){
    let checkCount = () => {
      let countChecked = alert.data.inputs.filter((option: AlertInputOptions) => {
        return option.checked;
      }).length;
      alert.data.inputs.forEach((option : AlertInputOptions) => {
        option.disabled = !option.checked && countChecked == 3; 
      });
    }
    let handler = (data: AlertInputOptions) => {
      checkCount();
    }
    let alert = this.alert.create({title: "Categorias", subTitle:"Com elas sua postagem será mais facilmente encontrada. Poderás inserir até três."});
    this.categories.forEach((e,i) => {
      alert.addInput({
        type:'checkbox',
        label:e.name,
        value:e,
        checked: this.publication.categories.findIndex(x => x.id == e.id) == -1 ? false : true,
        handler: handler
      });
    });
    alert.addButton('Cancelar');
    alert.addButton({
      text:'Confirmar',
      handler: data => {
        this.publication.categories = data;
        console.log(data);
      }
    });
    checkCount();
    alert.present();
  }

  private alertPublicationShare(){
    let alert = this.alert.create({title: "Publicação finalizada", subTitle:"Você pode estar compartilhando sua postagem em alguma das redes sociais abaixo"});
      alert.addInput({
        type:'checkbox',
        label:'Facebook',
        value:'facebook',
        checked: true
      });
      alert.addInput({
        type:'checkbox',
        label:'Twitter',
        value:'twitter',
        checked: true
      });
    alert.addButton({
      text:'Encerrar',
      handler: data => {
        this.success();
        this.action = 'create';
        this.dismiss();
      }
    });
    alert.addButton({
      text:'Compartilhar',
      handler: data => {
        if(data.find(x => x === 'twitter') && data.find(x => x === 'facebook')){
          this.shareFacebook().then(res => {
            this.initShareTwitter();
          })
        }else if(data.find(x => x === 'twitter')){
          this.initShareTwitter();
        }else if(data.find(x => x === 'facebook')){
          this.shareFacebook().then(res => {
            this.success();
          });
        }else{
           this.success();
        }
        this.action = 'create';
        this.dismiss();
        console.log(data);
      }
    });
    alert.present();
  }

  private success(){
    this.toast.create({message: "Publicação efetuada!", duration: 3000, position: 'bottom'}).present();
  }

  private alertPhotoWithLink(){
    let alert = this.alert.create({
      title: 'Um tipo de mídia somente é permitido',
      message: "Para prosseguir com a função de fotos, é necessário que você retire o link já inserido.",
      buttons: ['Tudo bem!']
    });
    alert.present();
  }

  private alertLinkWithPhoto(){
    let alert = this.alert.create({
      title: 'Um tipo de mídia somente é permitido',
      message: "Para prosseguir com a função de link, é necessário que você retire as imagens já inseridas.",
      buttons: ['Tudo bem!']
    });
    alert.present();
  }

  private validSearchLink(){
    return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(this.searchLink);
  }

  private buildPublicationToEdit(){
    this.publication = this.params.get('publication');
  }

}
