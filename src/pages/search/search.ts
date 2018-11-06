import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { ConnProvider } from '../../providers/conn/conn';
import { ConstantProvider } from '../../providers/constant/constant';
import { StorageProvider } from '../../providers/storage/storage';
import { PushProvider } from '../../providers/push/push';
import { SocialSharing } from '@ionic-native/social-sharing';
import { trigger, style, animate, transition } from '@angular/animations';

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('500ms', style({transform: 'translateX(100%)', opacity: 0}))
        ])
      ]
    )
  ]
})
export class SearchPage {
  loadingPublications: boolean = true;
  publications: Array<any> = [];
  highlightsData: Array<any> = [];
  searchData: Array<any> = [];
  filter: any = {
    since: new Date().toISOString(),
    until: new Date().toISOString(),
    term: "",
    author: "",
    category: [],
    advancedSearch: false
  };
  actualFilter: any;
  offsetSearch: number = 0;
  offsetHightlights: number = 0;
  actualSegment: string = "highlights";

  constructor(public nav: NavController, public navParams: NavParams,
  public conn:ConnProvider, public constant: ConstantProvider, public storage: StorageProvider,
  public toast: ToastController, public socialSharing: SocialSharing){
    this.conn.highlights().then(res => {
      if(this.actualSegment == "highlights"){
        this.publications = res.json().data;
        if(res.json().data.length){
          this.setHighLightsOffset();
        }
      }
      this.highlightsData = res.json().data;
      this.setLoadingPublications(false);
    }).catch(err => this.setLoadingPublications(false));
  }

  search(){
    if(!this.filter.advancedSearch && this.filter.term === ""){
      this.toast.create({message: "Digite pelo menos um termo para pesquisar", duration: 3000, position: 'top'}).present();
    }else{
      this.setActualFilter();
      this.setLoadingPublications();
      this.conn.search(this.actualFilter).then(res => {
        if(this.actualSegment == "search"){
          this.publications = res.json().data;
        }
        this.searchData = res.json().data;
        if(res.json().data.length){
          this.setSearchOffset();
        }
        this.setLoadingPublications(false);
      }).catch(err => this.setLoadingPublications(false));
    }
  }

  ionViewDidLoad(){
    console.log('ionViewDidLoad SearchPage');
  }

  private setLoadingPublications(x:boolean = true){
    this.loadingPublications = x;
  }

  segmentChanged(){
    if(this.actualSegment === 'highlights'){
      this.publications = this.highlightsData;
    }else{
      this.publications = this.searchData;
    }
  }

  private setActualFilter(){
    this.actualFilter = Object.assign({}, this.filter);
    if(this.actualFilter.advancedSearch){
      this.actualFilter.since = this.actualFilter.since.substring(0, 10);
      this.actualFilter.until = this.actualFilter.until.substring(0, 10);
    }else{
      delete this.actualFilter.since; delete this.actualFilter.until; delete this.actualFilter.author; delete this.actualFilter.category;
    }
    delete this.actualFilter.advancedSearch;
  }

  private setSearchOffset(){
    this.offsetSearch += this.constant.searchPublicationsHome;
  }

  private setHighLightsOffset(){
    this.offsetHightlights += this.constant.searchPublicationsHome;
  }

  doInfinite(infiniteScroll){
    if(this.actualSegment == 'highlights'){
      this.conn.highlights(this.offsetHightlights).then(res => {
        this.publications = this.publications.concat(res.json().data);
        this.highlightsData = this.publications;
        if(res.json().data.length){
          this.setHighLightsOffset();
        }
        infiniteScroll.complete();
      }).catch(err => {
        infiniteScroll.complete();
        console.log("Error in load highlights in Infinite Scroll", err);
      });
    }else{
      this.conn.search(this.actualFilter, this.offsetSearch).then(res => {
        this.publications = this.publications.concat(res.json().data);
        this.searchData = this.publications;
        if(res.json().data.length){
          this.setSearchOffset();
        }
        infiniteScroll.complete();
      }).catch(err => {
        infiniteScroll.complete();
        console.log("Error in load search publications in Infinite Scroll", err);
      });
    }
  }

}
