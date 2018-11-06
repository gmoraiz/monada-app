import { Component, ViewChild, NgZone } from '@angular/core';

import { Tabs,IonicPage, Events, Platform } from "ionic-angular";
import { StorageProvider } from '../../providers/storage/storage';
import { ConnProvider } from "../../providers/conn/conn";
import { PushProvider } from '../../providers/push/push';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tab') tabRef: Tabs;
  private onResumeSubscription: any;

  home           = 'HomePage';
  publications   = 'SearchPage';
  authors        = 'AuthorsPage';
  notifications  = 'NotificationsPage';
  user           = 'UserPage';
  badge: number = 0;
  image: string = null;

  constructor(public storage: StorageProvider, public events: Events, public platform: Platform,
  public conn: ConnProvider, public ngZone: NgZone, public push: PushProvider){
    this.onResumeSubscription = platform.resume.subscribe(() => {
      this.openByClickedDefault();
    });

    this.events.subscribe('updateUserImageTab', image => {
      this.ngZone.run(() => {
        this.setIconUser(image);
        this.image = image;
      });
    });

    this.events.subscribe('updateUserBadgeTab', (reset = false) => {
      this.ngZone.run(() => {
        this.badge = reset ? 0 : (this.badge + 1);
      });
      storage.getUser().then(user => {
        user.badge++;
        storage.setUser(user);
      });
    });

    conn.me().then(res => {
      let user = res.json().data;
      if(user){
        storage.setUser(user);
        this.badge = user.badge;
        this.image = user.image;
      }
    }).catch(err => err);
  } 

  ngAfterViewInit(){
    this.openByClickedDefault();
    this.setIconUser();
  }

  private openByClickedDefault(){
    if(this.push.clickedDefault === true){
      this.tabRef.select(3);
      this.push.clickedDefault = false;
    }
  }

  private setIconUser(image: string = null){
    let tabbar = this.tabRef._tabbar.nativeElement;
    let element = tabbar.childNodes[tabbar.childElementCount-1];
    if(element){
      this.storage.getUser().then(user => {
        this.image = user.image;
        element.removeChild(element.childNodes[1]);
        let img = document.createElement("img");
        img.setAttribute("class", "tab-icon-user");
        img.setAttribute("src", image ? image : this.image);
        img.setAttribute("onError", "src = 'assets/imgs/not-image-user.jpg'");
        element.insertBefore(img, element.childNodes[1]);
      });
    }
  }

  ngOnDestroy(){
    this.onResumeSubscription.unsubscribe();
  }

}
