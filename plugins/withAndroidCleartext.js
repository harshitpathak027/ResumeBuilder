const {
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins');

function setApplicationAttr(manifest, attrName, attrValue) {
  const app = manifest?.manifest?.application?.[0];
  if (!app) return;
  app.$ = app.$ || {};
  app.$[attrName] = attrValue;
}

const NETWORK_SECURITY_CONFIG_REL = 'app/src/main/res/xml/network_security_config.xml';

module.exports = function withAndroidCleartext(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Always permit cleartext HTTP.
    setApplicationAttr(manifest, 'android:usesCleartextTraffic', 'true');
    // Ensure a global network security config exists.
    setApplicationAttr(manifest, 'android:networkSecurityConfig', '@xml/network_security_config');

    config.modResults = manifest;
    return config;
  });

  // Create the xml resource in the generated native project during prebuild.
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const fs = require('fs');
      const path = require('path');

      const projectRoot = config.modRequest.projectRoot;
      const androidRoot = path.join(projectRoot, 'android');
      const targetPath = path.join(androidRoot, NETWORK_SECURITY_CONFIG_REL);

      await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

      const xml =
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<network-security-config>\n' +
        '  <base-config cleartextTrafficPermitted="true" />\n' +
        '</network-security-config>\n';

      await fs.promises.writeFile(targetPath, xml, 'utf8');
      return config;
    },
  ]);

  return config;
};
