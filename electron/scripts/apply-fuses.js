const { flipFuses, getCurrentFuseWire, FuseVersion, FuseV1Options } = require('@electron/fuses');
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
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
  });

  console.log('Verifying fuse wire state on built executable...');
  const fusesState = await getCurrentFuseWire(exePath);
  console.log('Packaged Executable Fuse Readback State:\n', JSON.stringify({
    RunAsNode: fusesState['0'] === 48 ? 'Disabled (0)' : 'Enabled (1)',
    EnableNodeOptionsEnvironmentVariable: fusesState['2'] === 48 ? 'Disabled (0)' : 'Enabled (1)',
    EnableNodeCliInspectArguments: fusesState['3'] === 48 ? 'Disabled (0)' : 'Enabled (1)',
    EnableEmbeddedAsarIntegrityValidation: fusesState['4'] === 49 ? 'Enabled (1)' : 'Disabled (0)',
    OnlyLoadAppFromAsar: fusesState['5'] === 49 ? 'Enabled (1)' : 'Disabled (0)',
    rawFuseWire: fusesState
  }, null, 2));
};
