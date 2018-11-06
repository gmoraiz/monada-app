import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageProvider } from "../storage/storage";
import { ConstantProvider } from "../constant/constant";
import { TwitterService } from "ng2-twitter";
import 'rxjs/add/operator/map'; 
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ConnTwitterProvider {
  token: string;
  secret: string;
  private twitter_url: string = "https://api.twitter.com/1.1/";
  constructor(public http: HttpClient, public storage: StorageProvider, public constant: ConstantProvider,
  public twitter: TwitterService){
    this.setAuth();
  }

  setAuth(): Promise<any>{
    return this.storage.getTwitter().then(twitter => {
      if(twitter){
        this.token = twitter.token;
        this.secret = twitter.secret;
        console.log("Autorização do connTwitterProvider inserida");
      }else{
        console.log("Autorização do connTwitterProvider vazia");
      }
    }).catch(err => {
      console.log("Erro ao inserir autorização do ConnTwitterProvider", err);
    })
  }

  tweet(status){
      return this.twitter.post(
        this.twitter_url + 'statuses/update.json',
        {
          status: status,
          auto_populate_reply_metadata: true
        },
        {
          consumerKey: this.constant.TWITTER_API_KEY,
          consumerSecret: this.constant.TWITTER_API_SECRET_KEY
        },
        {
          token: this.token,
          tokenSecret: this.secret
        }
      ).toPromise();
  }

  isAuth(): boolean{
    return this.secret && this.token ? true: false;
  }



}
