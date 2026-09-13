import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { RequestPage } from './request.page';

export const unsavedChanges:
  CanDeactivateFn<RequestPage> = async (page) => {
  const alerts = inject(AlertController);

  if (!page.requestForm().dirty()) {
    return true;
  }

  const alert = await alerts.create({
    header: $localize`:@@leave.header:Leave this request?`,
    message: $localize`:@@leave.message:What you have typed
      in will be lost.`,
    buttons: [
      { text: $localize`:@@leave.keep:Keep editing`,
        role: 'cancel' },
      { text: $localize`:@@leave.discard:Discard`,
        role: 'destructive' },
    ],
  });

  await alert.present();
  const { role } = await alert.onDidDismiss();
  return role === 'destructive';
};
