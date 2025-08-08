import { Test, TestingModule } from '@nestjs/testing';
import { ShortUrlService } from 'src/domain/services/short.url.service';
import { IShortUrlRepository } from 'src/application/ports/IShortUrlRepository';
import { TOKENS } from 'src/application/tokens';
import { Url } from 'src/domain/models/Url';
import { ShortenedUrl } from 'src/domain/models/ShortenedUrl';
import { nanoid } from 'nanoid';

jest.mock('nanoid');

describe('ShortUrlService', () => {
  let service: ShortUrlService;
  let shortUrlRepository: IShortUrlRepository;

  const mockShortUrlRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortUrlService,
        {
          provide: TOKENS.ShortUrlRepository,
          useValue: mockShortUrlRepository,
        },
      ],
    }).compile();

    service = module.get<ShortUrlService>(ShortUrlService);
    shortUrlRepository = module.get<IShortUrlRepository>(TOKENS.ShortUrlRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveShortenedUrl', () => {
    it('should save a new shortened url', async () => {
      const url = new Url('http://example.com');
      const slug = 'abcdef';
      const shortenedUrl = new ShortenedUrl(slug, url);
      
      (nanoid as jest.Mock).mockReturnValue(slug);
      mockShortUrlRepository.save.mockResolvedValue(shortenedUrl);

      const result = await service.saveShortenedUrl(url);

      expect(result).toEqual(shortenedUrl);
      expect(nanoid).toHaveBeenCalledWith(6);
      expect(shortUrlRepository.save).toHaveBeenCalledWith(expect.any(ShortenedUrl));
      expect(mockShortUrlRepository.save.mock.calls[0][0].value).toBe(slug);
    });

    it('should retry with a new slug if a collision occurs', async () => {
      const url = new Url('http://example.com');
      const slug1 = 'abcdef';
      const slug2 = 'ghijkl';
      const shortenedUrl = new ShortenedUrl(slug2, url);

      (nanoid as jest.Mock).mockReturnValueOnce(slug1).mockReturnValueOnce(slug2);
      
      mockShortUrlRepository.save.mockRejectedValueOnce(new Error('duplicate key'));
      mockShortUrlRepository.save.mockResolvedValueOnce(shortenedUrl);

      const result = await service.saveShortenedUrl(url);

      expect(result).toEqual(shortenedUrl);
      expect(nanoid).toHaveBeenCalledTimes(2);
      expect(shortUrlRepository.save).toHaveBeenCalledTimes(2);
      expect(mockShortUrlRepository.save.mock.calls[0][0].value).toBe(slug1);
      expect(mockShortUrlRepository.save.mock.calls[1][0].value).toBe(slug2);
    });
  });
});
