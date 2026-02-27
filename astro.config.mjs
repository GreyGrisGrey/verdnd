// @ts-check
import { defineConfig } from 'astro/config';
import awsAmplify from 'astro-aws-amplify';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: awsAmplify(),
});