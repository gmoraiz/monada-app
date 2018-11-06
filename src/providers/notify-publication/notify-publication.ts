// import { LocalNotifications } from '@ionic-native/local-notifications';
// import { Injectable } from '@angular/core';

// declare var cordova;

// @Injectable()
// export class NotifyPublicationProvider {
//   idGroup: number = 0; //ID 0 to GROUP SUMMARY NOTIFICATION
//   notification: any
//   existingNotification: any;

//   constructor(public localNotification: LocalNotifications){}

//   build(notification: any){
//     this.notification = notification;
//     this.verify();
//   }

//   private verify(){
//     cordova.plugins.notification.local.get(this.notification.userId, existingNotification => {
//       if(existingNotification === "OK"){
//         this.insert();
//       }else{
//         this.existingNotification = existingNotification;
//         this.update();
//       }
//     })
//   }

//   private insert(){
//     cordova.plugins.notification.local.schedule([{
//       id: this.idGroup, 
//       summary: "Publicações", 
//       group: this.notification.type, 
//       groupSummary: true,
//       sound: false,
//       priority:2,
//     },{
//       id:    this.notification.userId, 
//       title: this.notification.name,
//       icon:  this.notification.icon,
//       group: this.notification.type,
//       priority:2,
//       text: [{
//         person:  this.notification.person, 
//         message: this.notification.content
//       }]
//     }]);
//   }

//   private update(){
//     let text = this.existingNotification.text;
//     text.push({
//       person:  this.notification.person, 
//       message: this.notification.content
//     });
//     cordova.plugins.notification.local.schedule([{
//       id: this.idGroup, 
//       summary: "Publicações", 
//       group: this.notification.type, 
//       groupSummary: true,
//       sound: false,
//       priority:2,
//     },{
//       id:    this.notification.userId, 
//       title: this.notification.name + " ("+text.length+")",
//       icon:  this.notification.icon,
//       group: this.notification.type,
//       text: text,
//       priority:2
//     }]);
//   }

// }
