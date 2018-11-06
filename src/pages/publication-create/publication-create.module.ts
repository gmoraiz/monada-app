import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PublicationCreatePage } from './publication-create';
import { DirectivesModule } from "../../directives/directives.module";
import { PipesModule } from "../../pipes/pipes.module";
@NgModule({
  declarations: [
    PublicationCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(PublicationCreatePage),
    DirectivesModule,
    PipesModule
  ],
})
export class PublicationCreatePageModule {}
