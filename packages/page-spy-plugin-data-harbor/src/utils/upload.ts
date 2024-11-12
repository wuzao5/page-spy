import { psLog } from '@huolala-tech/page-spy-base';
import { t } from '../assets/locale';

export type UploadArgs = {
  url: string;
  body?: FormData;
};

export const startUpload = async ({ url, body }: UploadArgs) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body,
    });
    if (!response.ok) {
      psLog.warn('Upload failed');
      return null;
    }

    const result: H.UploadResult = await response.json();
    if (!result.success) {
      psLog.warn(result.message);
      return null;
    }

    return result;
  } catch (e: any) {
    psLog.error(e.message);
    return null;
  }
};

export const buttonBindWithUpload = (fn: () => Promise<string | null>) => {
  const uploadBtn = document.createElement('div');
  uploadBtn.id = 'data-harbor-plugin-upload';
  uploadBtn.className = 'page-spy-content__btn';
  uploadBtn.textContent = t.uploadAll;
  let idleWithUpload = true;

  uploadBtn.addEventListener('click', async () => {
    if (!idleWithUpload) return;
    idleWithUpload = false;

    try {
      uploadBtn.textContent = t.readying;
      const debugUrl = await fn();
      if (!debugUrl) return;

      // Ready to copy
      const root = document.body || document.documentElement;
      const input = document.createElement('input');
      root.insertAdjacentElement('beforeend', input);
      input.value = debugUrl;
      input.select();
      const isOk = document.execCommand('copy');
      root.removeChild(input);
      if (isOk) {
        document.querySelector('#uploaded-log-url')?.remove();
        uploadBtn.textContent = t.copied;
      } else {
        //  If copy failed
        let logUrlElement: HTMLDivElement | null =
          document.querySelector('#uploaded-log-url');
        if (!logUrlElement) {
          logUrlElement = document.createElement('div');
          logUrlElement.id = 'uploaded-log-url';
          logUrlElement.style.wordBreak = 'break-word';
          logUrlElement.style.padding = '12px';
          logUrlElement.style.borderTop = '1px solid #eee';
          uploadBtn.insertAdjacentElement('afterend', logUrlElement);
        }
        // TODO
        // const tipPrefix = UPLOAD_TIPS.copyTip;
        // logUrlElement.textContent = tipPrefix + debugUrl;
        uploadBtn.textContent = t.success;
      }
    } catch (e: any) {
      uploadBtn.textContent = t.fail;
      psLog.error(e.message);
    } finally {
      setTimeout(() => {
        uploadBtn.textContent = t.uploadAll;
        idleWithUpload = true;
      }, 1500);
    }
  });

  return uploadBtn;
};
