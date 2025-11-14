import baseConfig from '../../../jest.config.base';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
  displayName: 'query-interface-adaptor',
};

export default config;
