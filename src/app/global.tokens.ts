import { HttpContextToken } from '@angular/common/http';

export const SKIP_LOADER = new HttpContextToken<boolean>(() => false);
