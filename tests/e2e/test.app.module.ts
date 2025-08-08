import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDataSource } from './test-data-source';
import { UrlModule } from 'src/infrastructure/inversion-of-control/UrlModule';
import { ShortenedUrlEntity } from 'src/infrastructure/database/mapper/ShortenedUrl.entity';
import { UrlEntity } from 'src/infrastructure/database/mapper/Url.entity';

@Module({
  imports: [
    UrlModule,
    TypeOrmModule.forRoot(testDataSource.options),
    TypeOrmModule.forFeature([UrlEntity, ShortenedUrlEntity])
  ],
})
export class TestAppModule {}
