/// <reference types="@angular/localize" />

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { loadTranslations } from '@angular/localize';
import { Preferences } from '@capacitor/preferences';

const languages = ['en', 'de'];

async function chooseLanguage() {
  const { value } = await Preferences.get({ key: 'language' });
  const wanted = value ?? navigator.language.slice(0, 2);
  return languages.includes(wanted) ? wanted : 'en';
}

async function loadLanguage(language: string) {
  if (language === 'en') {
    return language;
  }
  try {
    const file = await fetch(`assets/i18n/${language}.json`);
    loadTranslations((await file.json()).translations);
    // German plural rules; only English is built in.
    registerLocaleData(localeDe);
    return language;
  } catch {
    return 'en';
  }
}

async function start() {
  const language = await loadLanguage(await chooseLanguage());
  $localize.locale = language;
  document.documentElement.lang = language;
  await import('./main');
}

start();
