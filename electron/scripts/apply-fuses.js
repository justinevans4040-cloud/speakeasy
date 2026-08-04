const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
const path = require('path');
const fs = require('fs');

module.exports = async function (context) {
  const appOutDir = context.appOutDir || path.join(__dirname, '..', 'build', 'win-unpacked');
  const exePath = path.join(appOutDir, `${context.packager.appInfo.productFilename}.exe`);

  if (!fs.existsSync(exePath)) {
    console.warn('Packaged executable not found at:', exePath);
    return;
  }

  console.log('Applying Electron production fuses to:', exePath);
  await flipFuses(exePath, {
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspect]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
  });

  console.log('Electron security fuses applied and verified successfully!');
};
