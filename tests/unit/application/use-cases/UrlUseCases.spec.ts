import { Test, TestingModule } from '@nestjs/testing';
import { UrlUseCases } from 'src/application/use-cases/UrlUseCases';
import { Url } from 'src/domain/models/Url';
import { ShortenedUrl } from 'src/domain/models/ShortenedUrl';
import { UrlNotFoundException } from 'src/domain/exceptions/NotFoundUrlException';
import { ShortUrlService } from 'src/domain/services/short.url.service';
import { UrlService } from 'src/domain/services/url.service';
import { ConfigService } from '@nestjs/config';

describe('UrlUseCases', () => {
  let useCases: UrlUseCases;
  let urlService: UrlService;
  let shortUrlService: ShortUrlService;

  const mockUrlService = {
    validateUrl: jest.fn(),
    getUrlByValue: jest.fn(),
    getUrlBySlug: jest.fn(),
  };

  const mockShortUrlService = {
    saveShortenedUrl: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UrlUseCases,
          useFactory: (shortUrlService, urlService, configService) => {
            return new UrlUseCases(shortUrlService, urlService, configService.get('BASE_URL'));
          },
          inject: [ShortUrlService, UrlService, ConfigService],
        },
        { provide: ShortUrlService, useValue: mockShortUrlService },
        { provide: UrlService, useValue: mockUrlService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCases = module.get<UrlUseCases>(UrlUseCases);
    urlService = module.get<UrlService>(UrlService);
    shortUrlService = module.get<ShortUrlService>(ShortUrlService);
  });

  it('should be defined', () => {
    expect(useCases).toBeDefined();
  });

  describe('shortenUrl', () => {
    it('should shorten a url', async () => {
      const originalUrl = 'http://example.com';
      const url = new Url(originalUrl);
      const shortenedUrl = new ShortenedUrl('abcdef', url);
      const baseUrl = 'http://localhost:3000';

      mockUrlService.getUrlByValue.mockResolvedValue(url);
      mockShortUrlService.saveShortenedUrl.mockResolvedValue(shortenedUrl);

      const result = await useCases.shortenUrl(originalUrl);

      expect(mockUrlService.validateUrl).toHaveBeenCalledWith(originalUrl);
      expect(mockUrlService.getUrlByValue).toHaveBeenCalledWith(originalUrl);
      expect(mockShortUrlService.saveShortenedUrl).toHaveBeenCalledWith(url);
      expect(result.shortenedUrl).toContain(baseUrl);
      expect(result.shortenedUrl).toContain('abcdef');
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original url', async () => {
      const slug = 'abcdef';
      const url = new Url('http://example.com');

      mockUrlService.getUrlBySlug.mockResolvedValue(url);

      const result = await useCases.getOriginalUrl(slug);

      expect(mockUrlService.getUrlBySlug).toHaveBeenCalledWith(slug);
      expect(result).toEqual(url);
    });

    it('should throw UrlNotFoundException if url is not found', async () => {
      const slug = 'abcdef';
      mockUrlService.getUrlBySlug.mockResolvedValue(undefined);

      await expect(useCases.getOriginalUrl(slug)).rejects.toThrow(UrlNotFoundException);
    });
  });
});
