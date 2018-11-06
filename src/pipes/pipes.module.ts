import { NgModule } from '@angular/core';
import { LinkPipe } from './link/link';
import { PublicationDatePipe } from './publication-date/publication-date';
import { LinkifyPipe } from './linkify/linkify';
@NgModule({
	declarations: [LinkPipe, PublicationDatePipe,
    LinkifyPipe],
	imports: [],
	exports: [LinkPipe, PublicationDatePipe,
    LinkifyPipe]
})
export class PipesModule {}
