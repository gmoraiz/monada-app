import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ConstantProvider } from '../constant/constant';
import { Observable } from "rxjs";
import { ToastController } from "ionic-angular";
import 'rxjs/add/operator/map'; 
import 'rxjs/add/operator/toPromise';
import { StorageProvider } from "../storage/storage";
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

@Injectable()
export class ConnProvider {
  private options: any;

  constructor(public http: Http, private constant: ConstantProvider, public storage: StorageProvider,
  private toastCtrl: ToastController, public fileTransfer: FileTransfer){}

//------- AUTH -------------------------
  login(data: object): any{
    return this.http.post('auth/login', data).catch(this.error(this)).toPromise();
  }

  register(data: object): any{
    return this.http.post('auth/register', data).catch(this.error(this)).toPromise();
  }

  logout(): any{
    return this.http.post('auth/logout', {}).catch(this.error(this)).toPromise();
  }

  resetPassword(email: string): any{
    return this.http.post('auth/password', {'email': email}).catch(this.error(this)).toPromise();
  }

//------- USER -------------------------

  me(): any{
    return this.http.get('user/me').catch(this.error(this)).toPromise();
  }

  follow(data: object): any{
    return this.http.post('user/follow', data).catch(this.error(this)).toPromise();
  }
  
  unfollow(userId: object): any{
    return this.http.delete('user/unfollow/'+userId).catch(this.error(this)).toPromise();
  }

  authorToFeed(): any{
    return this.http.get('user/author-to-feed').catch(this.error(this)).toPromise();
  }

  following(offset = 0): any{
    return this.http.get('user/following/'+offset).catch(this.error(this)).toPromise();
  }

  clearUnreadNotification(action: string, actionId:number = 0): any{
    return this.http.delete('user/clear-unread-notification/'+action+'/'+actionId).catch(this.error(this)).toPromise();
  }

  like(data: object): any{
    return this.http.post('user/like', data).catch(this.error(this)).toPromise();
  }

  unlike(publicationId: number): any{
    return this.http.delete('user/unlike/'+publicationId).catch(this.error(this)).toPromise();
  }

  save(data: object): any{
    return this.http.post('user/save', data).catch(this.error(this)).toPromise();
  }

  unsave(publicationId: number): any{
    return this.http.delete('user/unsave/'+publicationId).catch(this.error(this)).toPromise();
  }

  block(data: object): any{
    return this.http.post('user/block', data).catch(this.error(this)).toPromise();
  }

  unblock(userId: number): any{
    return this.http.delete('user/unblock/'+userId).catch(this.error(this)).toPromise();
  }

  mute(userId: number): any{
    return this.http.put('user/mute/'+userId, {}).catch(this.error(this)).toPromise();
  }

  unmute(userId: number): any{
    return this.http.put('user/unmute/'+userId, {}).catch(this.error(this)).toPromise();
  }

  profile(userId: number): any{
    return this.http.get('user/profile/'+userId).catch(this.error(this)).toPromise();
  }

  liked(offset = 0): any{
    return this.http.get('user/liked/'+offset).catch(this.error(this)).toPromise();
  }

  saved(offset = 0): any{
    return this.http.get('user/saved/'+offset).catch(this.error(this)).toPromise();
  }

  setUserImage(filePath: string, data: any = {}): Promise<any>{
    return this.uploadFile(filePath, 'user/store-image', data);
  }

  checkUsername(username: string): any{
    return this.http.get('user/check-username/'+username).catch(this.error(this)).toPromise();
  }

  checkEmail(email: string): any{
    return this.http.get('user/check-email/'+email).catch(this.error(this)).toPromise();
  }

  checkInvite(invite: string): any{
    return this.http.get('user/check-invite/'+invite).catch(this.error(this)).toPromise();
  }

  updateUser(data: any): any{
    return this.http.put('user/update', data).catch(this.error(this)).toPromise();
  }

  updateUserPassword(data: any): any{
    return this.http.put('user/update-password', data).catch(this.error(this)).toPromise();
  }

  notifications(offset = 0): any{
    return this.http.get('user/notifications/' + offset).catch(this.error(this)).toPromise();
  }

  readNotifications(): any{
    return this.http.put('user/read-notifications', {}).catch(this.error(this)).toPromise();
  }

  userList(filter: any, offset = 0): any{
    return this.http.get('user/list/'+offset+this.params(filter)).catch(this.error(this)).toPromise();
  }

  solicitInvite(): any{
    return this.http.post('user/solicit-invite', {}).catch(this.error(this)).toPromise();
  }

  storeContact(data: any): any{
    return this.http.post('user/contact', data).catch(this.error(this)).toPromise();
  }

  feed(offset = 0, last = 0): any{
    return this.http.get('user/feed/'+offset+"/"+last).catch(this.error(this)).toPromise();
  }

  storeFcm(fcm: string): any{
    return this.http.put('user/store-fcm', {fcm: fcm}).catch(this.error(this)).toPromise();
  }

//------- AUTHOR -------------------------
  authorSearch(filter, offset = 0): any{
    return this.http.get('author/search/'+filter+'/'+offset, this.options).catch(this.error(this)).toPromise();
  }

  authorSuggestion(offset = 0): any{
    return this.http.get('author/suggestion/'+offset).catch(this.error(this)).toPromise();
  }

  authorPublication(id, offset = 0, last = 0): any{
    return this.http.get('author/'+id+'/publication/'+offset+"/"+last).catch(this.error(this)).toPromise();
  }

  authorPublicationInFolder(id, folder, offset = 0): any{
    return this.http.get('author/'+id+'/folder/'+folder+'/publication/'+offset).catch(this.error(this)).toPromise();
  }

  authorFolder(id): any{
    return this.http.get('author/'+id+'/folder').catch(this.error(this)).toPromise();
  }

  storeAuthor(data: any): any{
    return this.http.post('author/store', data).catch(this.error(this)).toPromise();
  }

//------- PUBLICATION -------------------------

  storePublication(data: any): any{
    return this.http.post('publication/store', data).catch(this.error(this)).toPromise();
  }

  updatePublication(data: any): any{
    return this.http.put('publication/update', data).catch(this.error(this)).toPromise();
  }

  deletePublication(id:number = 0): any{
    return this.http.delete('publication/delete/'+id).catch(this.error(this)).toPromise();
  }

  setPublicationImage(filePath: string, data: any = {}): Promise<any>{
    return this.uploadFile(filePath, 'publication/store-image', data);
  }

  showPublication(id = 0, offset = 0): any{
    return this.http.get('publication/show/'+id+"/"+offset).catch(this.error(this)).toPromise();
  }

  highlights(offset = 0): any{
    return this.http.get('publication/highlights/'+offset).catch(this.error(this)).toPromise();
  }

  search(filter: any, offset = 0): any{
    return this.http.get('publication/search/'+offset+this.params(filter)).catch(this.error(this)).toPromise();
  }

  categories(): any{
    return this.http.get('publication/categories').catch(this.error(this)).toPromise();
  }

  linkMetatag(link: string): any{
    return this.http.get('publication/link-metatag?link='+link).catch(this.error(this)).toPromise();
  }

  blockPublication(data: object): any{
    return this.http.post('publication/block', data).catch(this.error(this)).toPromise();
  }

  unblockPublication(publicationId: number): any{
    return this.http.delete('publication/unblock/'+publicationId).catch(this.error(this)).toPromise();
  }
  
  //------- FOLDER -------------------------
  
  showFolder(id:number = 0): any{
    return this.http.get('folder/show/'+id).catch(this.error(this)).toPromise();
  }

  storeFolder(data: any): any{
    return this.http.post('folder/store', data).catch(this.error(this)).toPromise();
  }

  updateFolder(data: any): any{
    return this.http.put('folder/update', data).catch(this.error(this)).toPromise();
  }

  deleteFolder(id:number = 0): any{
    return this.http.delete('folder/delete/'+id).catch(this.error(this)).toPromise();
  }

  setFolderImage(filePath: string, data: any = {}): Promise<any>{
    return this.uploadFile(filePath, 'folder/store-image', data);
  }

//------- FILE CONN ---------------------

  private uploadFile(filePath: string, uri: string, data: any = {}): any{
    console.log("uploadFile filePath", filePath);
    var fileTransfer: FileTransferObject = this.fileTransfer.create();
    return this.storage.getToken().then(token => {
      let options: FileUploadOptions = {
        fileKey: 'monadaImage',
        headers: { 'Authorization': token },
        params: data,
        chunkedMode:false
      }
      console.log("fileTransfer options", options);
      return fileTransfer.upload(filePath, this.constant.API + uri, options);
    });
  }

//------- HELPER'S FUNCTIONS ---------------------

  private params(data: object){
    let params = "?";
    Object.keys(data).forEach((key) => {
      console.log(key);
     if(data[key] !== null && data[key] !== ""){
      if(Array.isArray(data[key])){
        data[key].forEach((e, i) => {
          params+= "&"+key+"[]="+e;
        })
      }else{
        params+= "&"+key+"="+data[key];
      }
     }
    });
    return params;
  }
//------- ERROR FUNCTION -------------------------

  private error(self: this){
    return (err) => {
      switch(err.status){
        case 422:
          err = {
            validationServer: JSON.parse(err._body)
          };
          break;
        case 404:
          this.toastCtrl.create({message: "O endpoint fornecido é inválido", duration: 3000, position: 'bottom'}).present();
          break;
        case 401:
          this.toastCtrl.create({message: "Sua sessão é inválida. Em 5 segundos serás redirecionado para a tela de login", duration: 5000, position: 'bottom'}).present();
          this.storage.setToken("");
          setTimeout(() => window.location.reload(), 5000);
          break;
        case 0:
          this.toastCtrl.create({message: "Você possui conexão com a internet? Não foi possível prosseguirmos com a requisição.", duration: 4000, position: 'bottom'}).present();
          break;
        default:
          this.toastCtrl.create({message: "Ocorreu um erro não identificado de código " + err.status, duration: 3000, position: 'bottom'}).present();
      }
      return Observable.throw(err);
    };
  }

}

