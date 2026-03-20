import { config } from 'dotenv';
import { resolve } from 'path';
import { getEnvPath } from '../../common/helper/env.helper';
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const envFilePath: string = getEnvPath(resolve(process.cwd(), 'src/common/envs'));
config({ path: envFilePath });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migration/history/*.js'],
  logger: 'simple-console',
  synchronize: false,
  logging: false,
};
