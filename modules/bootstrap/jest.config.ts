import baseConfig from '../../jest.config.base';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  displayName: 'bootstrap',
};

export default config;
