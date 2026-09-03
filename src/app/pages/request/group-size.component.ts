import { Component, input, model } from '@angular/core';
import { IonPicker, IonPickerColumn,
         IonPickerColumnOption } from '@ionic/angular';

@Component({
  selector: 'app-group-size',
  imports: [IonPicker, IonPickerColumn,
            IonPickerColumnOption],
  template: `
    <ion-picker>
      <ion-picker-column
        aria-label="Number of people"
        [value]="value()"
        (ionChange)="take($event.detail.value)">
        @for (size of sizes(); track size) {
          <ion-picker-column-option [value]="size">
            {{ size }}
          </ion-picker-column-option>
        }
      </ion-picker-column>
    </ion-picker>
  `,
})
export class GroupSizeComponent {
  readonly value = model.required<number>();
  readonly sizes = input.required<number[]>();

  take(next: string | number | undefined) {
    if (typeof next === 'number') {
      this.value.set(next);
    }
  }
}
