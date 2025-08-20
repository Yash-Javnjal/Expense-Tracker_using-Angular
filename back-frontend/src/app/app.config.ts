// src/app/app.config.ts
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

export const appConfig = {
  providers: [
    importProvidersFrom(RouterModule.forRoot([])), // add your routes here
    provideHttpClient()
  ]
};
