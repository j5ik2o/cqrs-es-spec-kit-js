import baseConfig from '../../../jest.config.base';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  displayName: 'command-domain',
};

export default config;
