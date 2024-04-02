import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[RestrictNumber]'
})
export class RestrictNumberDirective {

  constructor(public ref : ElementRef) { }

  @HostListener('input',['$event']) onInput(event){
    this.ref.nativeElement.value = event.target.value.replace(/[^a-zA-Z ]/g,'');
  }
}
