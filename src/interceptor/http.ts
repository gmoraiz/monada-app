import { Observable } from 'rxjs';
import { StorageProvider } from '../providers/storage/storage';
import { ConstantProvider } from '../providers/constant/constant';
import {Http, RequestOptionsArgs, Response, RequestOptions, ConnectionBackend, Headers} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

export class HttpInterceptor extends Http {
  constructor(connectionBackend: ConnectionBackend, requestOptions: RequestOptions, public storage: StorageProvider, public constant: ConstantProvider){
    super(connectionBackend, requestOptions);
  }

  public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return Observable.fromPromise(
      this.getRequestOptionArgs(options)
    ).mergeMap((options) => {
      return super.get(this.constant.API + url, options)
    });
  }

  public post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    if(url.search('http') !== 0){
      return Observable.fromPromise(
        this.getRequestOptionArgs(options)
      ).mergeMap((options) => {
        return super.post(this.constant.API + url, JSON.stringify(body), options);
      })
    }else{
      return super.post(url, body, options);
    }
  }

  public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return Observable.fromPromise(
      this.getRequestOptionArgs(options)
    ).mergeMap((options) => {
      return super.put(this.constant.API + url, JSON.stringify(body), options)
    })
  }

  public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return Observable.fromPromise(
      this.getRequestOptionArgs(options)
    ).mergeMap((options) => {
      return super.delete(this.constant.API + url, options)
    });
  }

  private getRequestOptionArgs(options?: RequestOptionsArgs){
    return this.storage.getToken().then(token => {
      if(options == null){
        options = new RequestOptions();
      }
      if(options.headers == null){
        options.headers = new Headers();
      }
      if(token){
        options.headers.append('Authorization', token);
      }
      options.headers.append('Content-Type', 'application/json');
      return options;
    });
  }
}