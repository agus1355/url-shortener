import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from 'src/domain/services/url.service';
import { IUrlRepository } from 'src/application/ports/IUrlRepository';
import { TOKENS } from 'src/application/tokens';
import { Url } from 'src/domain/models/Url';
import { InvalidUrlException } from 'src/domain/exceptions/InvalidUrlException';

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: IUrlRepository;

  const mockUrlRepository = {
    findUrlByValue: jest.fn(),
    save: jest.fn(),
    findUrlBySlug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: TOKENS.UrlRepository,
          useValue: mockUrlRepository,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlRepository = module.get<IUrlRepository>(TOKENS.UrlRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUrlByValue', () => {
    it('should return existing url if found', async () => {
      const originalUrl = 'http://example.com';
      const url = new Url(originalUrl);
      mockUrlRepository.findUrlByValue.mockResolvedValue(url);

      const result = await service.getUrlByValue(originalUrl);

      expect(result).toEqual(url);
      expect(urlRepository.findUrlByValue).toHaveBeenCalledWith(originalUrl);
      expect(urlRepository.save).not.toHaveBeenCalled();
    });

    it('should create and return a new url if not found', async () => {
      const originalUrl = 'http://example.com';
      const newUrl = new Url(originalUrl);
      mockUrlRepository.findUrlByValue.mockResolvedValue(undefined);
      mockUrlRepository.save.mockResolvedValue(newUrl);

      const result = await service.getUrlByValue(originalUrl);

      expect(result).toEqual(newUrl);
      expect(urlRepository.findUrlByValue).toHaveBeenCalledWith(originalUrl);
      expect(urlRepository.save).toHaveBeenCalledWith(expect.any(Url));
    });
  });

  describe('getUrlBySlug', () => {
    it('should return url if found', async () => {
      const slug = 'abcdef';
      const url = new Url('http://example.com');
      mockUrlRepository.findUrlBySlug.mockResolvedValue(url);

      const result = await service.getUrlBySlug(slug);

      expect(result).toEqual(url);
      expect(urlRepository.findUrlBySlug).toHaveBeenCalledWith(slug);
    });

    it('should return undefined if not found', async () => {
      const slug = 'abcdef';
      mockUrlRepository.findUrlBySlug.mockResolvedValue(undefined);

      const result = await service.getUrlBySlug(slug);

      expect(result).toBeUndefined();
      expect(urlRepository.findUrlBySlug).toHaveBeenCalledWith(slug);
    });
  });

  describe('validateUrl', () => {
    it('should not throw for a valid http url', () => {
      const validUrl = 'http://example.com';
      expect(() => service.validateUrl(validUrl)).not.toThrow();
    });

    it('should not throw for a valid https url', () => {
      const validUrl = 'https://example.com';
      expect(() => service.validateUrl(validUrl)).not.toThrow();
    });

    it('should not throw for a valid url with subdomain, path and query', () => {
        const validUrl = 'https://sub.example.co.uk/path?query=123';
        expect(() => service.validateUrl(validUrl)).not.toThrow();
    });

    it('should throw InvalidUrlException for an invalid url', () => {
      const invalidUrl = 'not a url';
      expect(() => service.validateUrl(invalidUrl)).toThrow(InvalidUrlException);
    });

    it('should throw InvalidUrlException for a url without TLD', () => {
        const invalidUrl = 'http://localhost';
        expect(() => service.validateUrl(invalidUrl)).toThrow(InvalidUrlException);
    });
  });
});
