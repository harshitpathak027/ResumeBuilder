const path = require('path');

// EAS/Gradle builds often execute Metro with CWD=android/.
// NativeWind/Tailwind config discovery uses process.cwd(), so force it to the project root.
process.chdir(__dirname);

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('riv');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];
module.exports = withNativeWind(config, {
	input: path.join(__dirname, 'global.css'),
});