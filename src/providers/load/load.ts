import { Injectable } from '@angular/core';
import { Loading, LoadingController } from 'ionic-angular';

@Injectable()
export class LoadProvider {
    loading: Loading;
    constructor(public loadingCtrl: LoadingController) {
    }

    onlyIcon(){
        this.loading = this.loadingCtrl.create({
            spinner: 'hide',
            cssClass: 'transparent',
            content:'<img width="100" height="100" src="assets/loading/onlyicon.gif"/>'
        });
        return this.loading.present();
    }

    withMessage(message){
        this.loading = this.loadingCtrl.create({
            spinner: 'hide',
            cssClass: 'transparent',
            content:'<img width="100" height="100" src="assets/loading/onlyicon.gif"/><span>'+message+'</span>'
        });
        return this.loading.present();
    }

    dismiss(){
        return new Promise((resolve, reject) => {
            if (this.loading) {
                return this.loading.dismiss(resolve(true)).catch(error => {
                    console.log('loading error: ', error);
                });
            } else {
                resolve(true);
            }
        });
    }
}
