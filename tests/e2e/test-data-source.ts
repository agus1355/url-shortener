import { DataSource } from 'typeorm';
import { UrlEntity } from 'src/infrastructure/database/mapper/Url.entity';
import { ShortenedUrlEntity } from 'src/infrastructure/database/mapper/ShortenedUrl.entity';

export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  entities: [UrlEntity, ShortenedUrlEntity],
  synchronize: true,
  logging: false,
});