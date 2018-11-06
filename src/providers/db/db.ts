// import { Injectable } from '@angular/core';
// import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
// import { Platform } from 'ionic-angular';

// @Injectable()
// export class DbProvider{
//   db: any;
  
//   constructor(public platform: Platform, public sqlite: SQLite){
//     this.platform.ready().then(() => {
//       this.sqlite.create({name: 'monada', location: 'default'}).then((db: SQLiteObject) => {
//         this.db = db;
//         this.loadTables();
//       }).catch((err) =>{
//         console.log(err);
//       });
//     }).catch((err) =>{
//       console.log(err);
//     });
//   }

//   private loadTables():void{ 
//     this.query('CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, name TEXT, username TEXT, image TEXT)').catch(err => {
//       console.error("It wasn't possible to create table USER", err.tx, err.err); 
//     });
//   }

//   private query(query: string, params: any[] = []): Promise<any>{
//     return new Promise((resolve, reject) => {
//       try{
//         this.db.transaction((tx: any) => {
//           tx.executeSql(query, params, (tx: any, res: any) => resolve({ tx: tx, res: res }), (tx: any, err: any) => reject({ tx: tx, err: err }));
//         }, (err: any) => reject({ err: err }));
//       }catch(err){
//         reject({ err: err });
//       }
//     });
//   }

// }
