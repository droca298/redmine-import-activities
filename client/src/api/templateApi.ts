import { apiPostForBlob } from './http';
import { API_ROUTES } from './routes';
import { MESSAGES } from '../messages';
import { Credentials, FavoriteActivity } from '../types';

export async function downloadTemplate(creds: Credentials, favorites: FavoriteActivity[]): Promise<void> {
  const blob = await apiPostForBlob(API_ROUTES.template, creds, { favorites });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = MESSAGES.import.templateFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
