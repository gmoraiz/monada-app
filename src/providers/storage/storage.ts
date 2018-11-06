import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageProvider {

  constructor(public storage: Storage){}

  setNotFirstAccess(): void{
    this.storage.set('notFirstAccess', true);
  }

  getNotFirstAccess(): Promise<boolean>{
    return this.storage.get('notFirstAccess').then(is => is).catch(err => err);
  }

  setFcm(fcm: string): void{
    this.storage.set('fcm', fcm);
  }

  getFcm(): Promise<string>{
    return this.storage.get('fcm').then(fcm => fcm).catch(err => err);
  }

  setToken(token: string): void{
    this.storage.set('token', token);
  }
  
  getToken(): Promise<string>{
    return this.storage.get('token').then(token => token).catch(err => err);
  }

  setUser(user: object): void{
    this.storage.set('user', JSON.stringify(user));
  }

  getUser(): Promise<any>{
    return this.storage.get('user').then(user => JSON.parse(user)).catch(err => err);
  }

  setTwitter(twitter: object): Promise<any>{
    return this.storage.set('twitter', JSON.stringify(twitter));
  }

  getTwitter(): Promise<any>{
    return this.storage.get('twitter').then(twitter => JSON.parse(twitter)).catch(err => err);
  }

  setAuthorToFeed(authorToFeed: Array<any>): void{
    authorToFeed.forEach((e,i) => delete e.selected);
    this.storage.set('authorToFeed', JSON.stringify(authorToFeed));
  }

  getAuthorToFeed(): Promise<any>{
    return this.storage.get('authorToFeed').then(authorToFeed => authorToFeed ? JSON.parse(authorToFeed) : []).catch(err => err);
  }

}

