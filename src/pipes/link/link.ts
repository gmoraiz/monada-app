import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'link',
})
export class LinkPipe implements PipeTransform{
 
  constructor(private dom: DomSanitizer){}

  transform(value: string){
    return this.dom.bypassSecurityTrustResourceUrl(value);
  }

}
