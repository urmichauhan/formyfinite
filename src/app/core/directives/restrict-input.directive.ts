import { Directive, HostListener, Input, HostBinding } from '@angular/core';

@Directive({
  selector: 'input[restrictInput]',
  exportAs: 'restrictInput'
})
export class RestrictInputDirective {

  /**
   * These are constants: If you put any of them, they will only be allowed.
   * For exceptions to work: pass ExCEPTIONS in types array variable.
   * 
   * CAPITAL_LETTERS
   * SMALL_LETTERS
   * NUMERIC
   * SPECIAL
   * SPACE
   * EXCEPTIONS
   * OTHERS
   */
  @Input() types: Array<string>;
  @Input() exceptions: Array<number> = [];

  @HostListener('keypress')
  onKeyPress(event: KeyboardEvent) {
    let _e = event.charCode;
    let _type = null;

    // Allow Exceptions first
    if(this.types.some(e => e == 'EXCEPTIONS') && this.exceptions.some(e => e == _e)) {
      return true;
    }

    if(_e > 64 && _e < 91) {
      _type = 'CAPITAL_LETTERS';
    }

    if(_e > 96 && _e < 123) {
      _type = 'SMALL_LETTERS';
    }

    if((_e > 32 && _e < 48) || (_e > 57 && _e < 65) || (_e > 90 && _e < 97) || (_e > 122 && _e < 127)) {
      _type = 'SPECIAL';
    }

    if(_e > 47 && _e < 58) {
      _type = 'NUMERIC';
    }

    if(_e > 95 && _e < 106) {
      _type = 'NUMPAD_NUMERIC';
    }

    if(_e == 32) {
      _type == 'SPACE';
    }

    return this.types.some(e => e == _type) ? true: false;
  }

  constructor() { }

  ngOninit() {
    if (this.types === null || this.types === undefined) {
      throw new TypeError("The input 'types' is required");
      if (this.types.some(e => e == 'EXCEPTIONS') && (this.exceptions === null || this.exceptions === undefined)) {
        throw new TypeError("The input 'exceptions' is required, as you have provided EXCEPTIONS in types");
      }
    }
  }
}
