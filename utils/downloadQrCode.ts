function forceDownload(blobUrl: string, filename: string) {
  let a: any = document.createElement('a');
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function downloadQrCode(url: string, filename: string) {
  fetch(url, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: 'cors',
  })
    .then((response) => response.blob())
    .then((blob) => {
      const pngBlob = blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });
      let blobUrl = window.URL.createObjectURL(pngBlob);
      const finalFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
      forceDownload(blobUrl, finalFilename);
    })
    .catch((e) => console.error(e));
}
