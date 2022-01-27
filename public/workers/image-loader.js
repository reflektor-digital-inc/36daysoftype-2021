self.addEventListener('message', (event) => {
  try {
    const { data : { source } } = event;
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => {
      self.postMessage({
        source : source,
        blob : xhr.response
      });
    };
    xhr.onerror = (event) => {
      self.postMessage(new Error(`Image Web Worker ${event.type}. Loaded ${source} ${event.loaded} bytes.`));
    };
    xhr.open('GET', source, true);
    xhr.send();
  }
  catch (err) {
    self.postMessage(new Error('Image Web Worker error:', err));
  }
});