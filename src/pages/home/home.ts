import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, Refresher, ToastController, PopoverController, ModalController, App, Platform, Events, ViewController, Content } from 'ionic-angular';
import { ConnProvider } from '../../providers/conn/conn';
import { ConstantProvider } from '../../providers/constant/constant';
import { StorageProvider } from '../../providers/storage/storage';
import { PushProvider } from '../../providers/push/push';
import { HelperProvider } from '../../providers/helper/helper';
import { SocialSharing } from '@ionic-native/social-sharing';
import { LoadProvider } from "../../providers/load/load";
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  @ViewChild('finalAuthorsScrollbarX') finalAuthorsScrollbarX: any;
  @ViewChild('pageTop') pageTop: Content;
  @ViewChild(Refresher) refresher: Refresher;
  private onResumeSubscription: Subscription;
  
  allAuthors: any = {
    id:0,
    selected:true,
    username: 'all'
  };
  actualAuthor: any = {};
  loadingPublications: boolean = true;
  authors: Array<any> = [];
  publications: Array<any> = [];
  authorsPublications: Array<any> = [];
  user: any = {};

  constructor(public nav: NavController,private ngZone: NgZone, public platform: Platform, public view: ViewController,
  public conn:ConnProvider, public constant: ConstantProvider, public storage: StorageProvider, public push: PushProvider,
  public toast: ToastController, public socialSharing: SocialSharing, public popover: PopoverController, public modal: ModalController,
  public helper: HelperProvider, public load: LoadProvider, public app: App, public events: Events){
    this.storage.getUser().then(user => this.user = user);
    push.feed.subscribe(notification => {
      console.log("Notification in subscribe feed", notification);
      this.updateAuthorAfterNotification(notification);
    });
    this.showPublications(this.allAuthors.id, this.allAuthors.username);
    this.onResumeSubscription = platform.resume.subscribe(() => {
      this.openAuthorByClickedPublication();
    }); 
    this.listeners();
    this.platform.resume.subscribe(() => {
      console.log("Resume actived on view ", this.view.name);
      if(this.view.name == 'HomePage'){
        this.showAuthors();
      }
    });
  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter');
    this.initAuthors();
    this.showAuthors();
  }

  initAuthors(){
    this.storage.getAuthorToFeed().then(authorToFeed => {
      this.setAuthors(authorToFeed);
      this.openAuthorByClickedPublication();
    })
  }

  private openAuthorByClickedPublication(){
    if(this.push.clickedPublication !== null){
      let author = this.authors.find(x => x.authorId == this.push.clickedPublication.authorId);
      if(author){
        this.showPublications(author.authorId, author.username);
      }
      this.push.clickedPublication = null;
    }
  }

  likeAction(publication: any){
    if(!publication.likeAction){
      publication.likeAction = true;
      if(publication.liked){
        this.conn.unlike(publication.id).then(res => {
          if(res.json().data){
            publication.liked = false;
            publication.likeAction = false
            publication.likes--;
          }else{
            this.toast.create({message: res.msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => publication.likeAction = false);
      }else{
        this.conn.like({publicationId: publication.id}).then(res => {
          if(res.json().data){
            publication.liked = true;
            publication.likeAction = false;
            publication.likes++;
          }else{
            this.toast.create({message: res.msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => publication.likeAction = false);
      }
    }
  }

  saveAction(publication: any){
    if(!publication.saveAction){
      publication.saveAction = true;
      if(publication.saved){
        this.conn.unsave(publication.id).then(res => {
          if(res.json().data){
            publication.saved = false;
            publication.saveAction = false;
          }else{
            this.toast.create({message: res.msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => publication.saveAction = false);
      }else{
        this.conn.save({publicationId: publication.id}).then(res => {
          if(res.json().data){
            publication.saved = true;
            publication.saveAction = false;
          }else{
            this.toast.create({message: res.msg, duration: 3000, position: 'bottom'}).present();
          }
        }).catch(err => publication.saveAction = false);
      }
    }
  }

  showAuthors(){
    this.conn.authorToFeed().then(res => { 
      this.authors = res.json().data;
      this.storage.setAuthorToFeed(this.authors);
    }).catch(err => err);
  }

  showPublications(authorId, authorUsername){
    this.setLoadingPublications(false);
    this.setSelectedAuthor(authorId);
    if(authorId !== this.actualAuthor.id){
      this.setActualAuthorUsername(authorUsername);
      this.setActualAuthorId(authorId);
      this.setActualAuthorIndex();
      let authorPublications = this.getAuthorsPublicationsPublication();
      if(this.getActualAuthorBadge() && authorPublications.length){
        this.setPublications(authorPublications);
        this.manuallyDoRefresh();
        this.clearUnreadNotification();
      }else if(!authorPublications.length){
        this.setLoadingPublications();
        this.clearUnreadNotification();
        this.loadPublications().then(res => {
          if(this.actualAuthor.id == authorId){
            this.setPublications(res.json().data);
            this.setLoadingPublications(false);
            if(res.json().data.length){
              this.setAuthorsPublicationsOffset();
            }
          }
        }).catch(err => this.setLoadingPublications(false));
      }else{
        this.setPublications(authorPublications);
      }
    }
  }

  shareApp(){
    this.socialSharing.share("Queres acompanhar autores nótorios, sem desvio de informação? Baixe o Monada na Google Play ou App Store.", "", null, this.constant.SHARE_URL + "download").then(() => {
      console.log("Shared with success!!!");
    }).catch(() => {
      console.log("Error on share!!!");
    });
  }

  clearUnreadNotification(){
    if(this.getActualAuthorBadge()){
      this.conn.clearUnreadNotification(this.constant.actionEnum.PUBLICATION, this.actualAuthor.id).then(res => {
        if(res.json().data){
          this.clearAuthorBadge();
        }
        console.log(res.json().msg);
      }).catch(err => err);
    }
  }

  loadPublications(offset = 0, last = 0): Promise<any>{
    if(this.actualAuthor.id === this.allAuthors.id){
      return this.allPublications(offset, last);
    }else{
      return this.authorPublication(offset, last);
    }
  }

  updateAuthorAfterNotification(notification: any){
    let authorIndex = this.getAuthorIndex(notification.authorId);
    console.log(authorIndex);
    if(authorIndex !== -1){
      let author = this.authors[authorIndex];
      author.badge++;
      author.idLastPublication = notification.publicationId;
      this.ngZone.run(() => {
        this.authors = this.authors.filter(x => x !== author);
        this.authors.unshift(author);
      });
      this.storage.setAuthorToFeed(this.authors);
    }
  }

  openAuthors(){
    this.nav.parent.select(2);
  }

  allPublications(offset = 0, last = 0): Promise<any>{
    return this.conn.feed(offset, last);
  }

  authorPublication(offset = 0, last = 0): Promise<any>{
    return this.conn.authorPublication(this.actualAuthor.id, offset, last);
  }

  openProfile(author: any){
    this.nav.push('ProfilePage', author);
  }

  openSearch(){
    this.nav.push('SearchPage');
  }

  optionsStatus(user, myEvent){
    let popover = this.popover.create('PopoverOptionsStatusPage', user);
    popover.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  openPublicationCreate(){
    let modal = this.modal.create('PublicationCreatePage');
    modal.present();
    modal.onDidDismiss(data => {
      if(data){
        if(data.action = "create"){
          this.manuallyDoRefresh();
          console.log("Publication created", data.publication);
        }
      }
    });
  }

  openContact(){
    let modal = this.modal.create('ContactPage');
    modal.present();
  }

  logout(){
    this.load.withMessage('Aguarde');
    this.conn.logout().then(res => {
      this.load.dismiss();
      this.storage.setToken("");
      this.storage.setUser({});
      this.storage.setAuthorToFeed([]);
      this.storage.setTwitter({});
      this.app.getRootNavs()[0].setRoot('LoginPage');
      // .then(res => {
      //   const index = this.nav.getActive().index;
      //   this.nav.remove(0, index);
      // });
    }).catch(err => this.load.dismiss());
  }

  private listeners(){
    this.events.subscribe('home/resetAllPublications', data => {
      console.log('home/resetAllPublications published', data);
      this.publications = this.publications.filter(x => x.author.userId != data.userId);
      this.authorsPublications[0].publications = this.authorsPublications[0].publications.filter(x => x.author.userId != data.userId);
        this.authorsPublications[0].last = this.authorsPublications[0].publications.length ? this.authorsPublications[0].publications[0].id : 0;
    });
  }

  private setSelectedAuthor(authorId: number){
    if(authorId == this.allAuthors.id){
      this.allAuthors.selected = true;
    }else{
      this.allAuthors.selected = false;
    }
    this.authors.forEach(e => {
      if(e.authorId == authorId){
        e.selected = true;
      }else{
        e.selected = false;
      }
    });
  }

  private setAuthors(authors: Array<any>){
    this.authors = authors;
  }

  private getAuthorIndex(authorId: number){
    return this.authors.findIndex(x => x.authorId == authorId);
  }

  private clearAuthorBadge(){
    let index = this.authors.findIndex(x => x.authorId == this.actualAuthor.id);
    this.authors[index].badge = 0;
    this.storage.setAuthorToFeed(this.authors);
  }

  private getActualAuthorBadge(){
    let author = this.authors.find(x => x.authorId == this.actualAuthor.id);
    return author ? author.badge : 0;
  }

  private getAuthorsPublicationsLast(){
    return this.authorsPublications[this.actualAuthor.index].last;
  }

  private setAuthorsPublicationsLast(){
    this.authorsPublications[this.actualAuthor.index].last = this.publications[0] ? this.publications[0].id : 0;
  }

  private getAuthorsPublicationsOffset(){
    return this.authorsPublications[this.actualAuthor.index].offset;
  }

  private setAuthorsPublicationsOffset(){
    this.authorsPublications[this.actualAuthor.index].offset+= this.constant.searchPublicationsHome;
  }

  private getAuthorsPublicationsPublication(){
    return this.authorsPublications[this.actualAuthor.index].publications;
  }

  private setPublications(publications: Array<any>, append = ""){
    switch(append){
      case "start":
        publications = publications.concat(this.publications);
        break;
      case "end":
        publications = this.publications.concat(publications);
        break;
      default:
    }
    this.publications = publications;
    this.authorsPublications[this.actualAuthor.index].publications = publications;
    this.setAuthorsPublicationsLast();
  }

  private setLoadingPublications(x:boolean = true){
    this.loadingPublications = x;
  }

  private setActualAuthorId(authorId){
    this.actualAuthor.id = authorId;
  }

   private setActualAuthorUsername(authorUsername){
    this.actualAuthor.username = authorUsername;
  }

  private setActualAuthorIndex(){
    let index = this.authorsPublications.findIndex(x => x.authorId == this.actualAuthor.id);
    if(this.authorsPublications.findIndex(x => x.authorId == this.actualAuthor.id) !== -1){
      this.actualAuthor.index = index;
    }else{
      this.actualAuthor.index = this.authorsPublications.push({
        authorId: this.actualAuthor.id,
        offset: 0,
        last:0,
        publications: new Array()
      }) - 1;
    }
  }

  doRefresh(refresher){
    let authorId = this.actualAuthor.id;
    this.showAuthors();
    this.loadPublications(0, this.getAuthorsPublicationsLast()).then(res => {
      if(authorId == this.actualAuthor.id){
        this.setPublications(res.json().data, "start");
      }
      refresher.complete();
    }).catch(err => {
      refresher.complete();
      console.log("Error in load publications in refresh", err);
    });
  }

  manuallyDoRefresh(){
    this.refresher._top = '50px';
    this.refresher.state = 'refreshing';
    this.refresher._beginRefresh();
  }

  doInfinite(infiniteScroll){
    let authorId = this.actualAuthor.id;
    this.loadPublications(this.getAuthorsPublicationsOffset(), 0).then(res => {
      if(authorId == this.actualAuthor.id){
        this.setPublications(res.json().data, "end");
        if(res.json().data.length){
          this.setAuthorsPublicationsOffset();
        }
      }
      infiniteScroll.complete();
    }).catch(err => {
      infiniteScroll.complete();
      console.log("Error in load publications in Infinite Scroll", err);
    });
  }

  ngOnDestroy() {
    this.onResumeSubscription.unsubscribe();
  }

}
