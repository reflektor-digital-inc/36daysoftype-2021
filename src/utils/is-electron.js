/**
 * @export
 * @function IsElectron.
 * @description Detects if code is being executed in the browser or Electron.
 * @return {Boolean} - true if Electron, otherwise false
 */
const isElectron = () => {
  // Renderer process
  if (
    typeof window !== 'undefined' &&
    typeof window.process === 'object' &&
    window.process.type === 'renderer'
  ) {
    return true;
  }

  // Main process
  if (typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    !!process.versions.electron
  ) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  return (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.includes('Electron')
  );
};

export default isElectron;
