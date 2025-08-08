import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { ShortenedUrlEntity } from 'src/infrastructure/database/mapper/ShortenedUrl.entity';
import { UrlEntity } from 'src/infrastructure/database/mapper/Url.entity';
import { TestAppModule } from './test.app.module';

describe('UrlController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [TestAppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.runMigrations();
  });

  afterEach(async () => {
    if (dataSource.isInitialized) {
      const shortenedUrlRepository = dataSource.getRepository(ShortenedUrlEntity);
      await shortenedUrlRepository.clear();
      const urlRepository = dataSource.getRepository(UrlEntity);
      await urlRepository.clear();
    }
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('/urls/shorten (POST)', () => {
    it('should shorten a valid URL and return the shortened URL', async () => {
      const originalUrl = 'http://example.com';
      return request(app.getHttpServer())
        .post('/urls/shorten')
        .send({ url: originalUrl })
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('shortenedUrl');
          expect(res.body.shortenedUrl).not.toBeNull();
        });
    });
  });

  describe('/:shortenedValue (GET)', () => {
    it('should redirect to the original URL for a valid shortened value', async () => {
      const originalUrl = 'http://google.com';
      
      const postResponse = await request(app.getHttpServer())
        .post('/urls/shorten')
        .send({ url: originalUrl });

      const shortenedValue = postResponse.body.shortenedUrl.split('/').pop();

      return request(app.getHttpServer())
        .get(`/${shortenedValue}`)
        .expect(302)
        .expect('Location', originalUrl);
    });

    it('should return 404 for a non-existent shortened value', () => {
        return request(app.getHttpServer())
            .get('/nonexistentslug')
            .expect(302)
            .expect('Location', 'http://localhost:4000/404');
    });
  });
});
