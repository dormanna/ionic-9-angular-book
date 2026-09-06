import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.svg',
  styles: `
    :host {
      display: block;
      max-width: 240px;
    }
  `,
})
export class LogoComponent {}
