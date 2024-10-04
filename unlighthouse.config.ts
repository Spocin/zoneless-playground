import { defineConfig } from 'unlighthouse';

export default defineConfig({
  site: 'http://localhost:4200/',
  scanner: {
	samples: 3,
	device: 'desktop',
	crawler: true,
	skipJavascript: false,
  },
});