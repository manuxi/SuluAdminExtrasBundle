<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PublicHolidayService
{
    private const BASE_URL = 'https://date.nager.at/api/v3';
    private const CACHE_TTL = 86400;

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly CacheInterface $cache,
        private readonly ?LoggerInterface $logger = null,
    ) {
    }

    public function getAvailableCountries(): array
    {
        return $this->cache->get('public_holidays_countries', function (ItemInterface $item): array {
            $item->expiresAfter(self::CACHE_TTL * 7);

            try {
                $response = $this->httpClient->request('GET', self::BASE_URL . '/AvailableCountries');

                return $response->toArray();
            } catch (\Throwable $e) {
                $this->logger?->error('Failed to fetch countries from Nager.Date API', ['error' => $e->getMessage()]);

                return [['countryCode' => 'DE', 'name' => 'Germany']];
            }
        });
    }

    public function getSubdivisions(string $countryCode): array
    {
        $cacheKey = 'public_holidays_subdivisions_' . strtoupper($countryCode);

        return $this->cache->get($cacheKey, function (ItemInterface $item) use ($countryCode): array {
            $item->expiresAfter(self::CACHE_TTL * 30);

            try {
                $response = $this->httpClient->request('GET', self::BASE_URL . '/CountryInfo/' . strtoupper($countryCode));
                $data = $response->toArray();
                $subdivisions = [];

                if (isset($data['subdivisions']) && \is_array($data['subdivisions'])) {
                    foreach ($data['subdivisions'] as $sub) {
                        $subdivisions[] = [
                            'code' => $sub['code'] ?? '',
                            'shortName' => $sub['shortName'] ?? $sub['code'] ?? '',
                        ];
                    }
                }

                return $subdivisions;
            } catch (\Throwable $e) {
                $this->logger?->error('Failed to fetch subdivisions', ['country' => $countryCode, 'error' => $e->getMessage()]);

                return [];
            }
        });
    }

    public function getPublicHolidays(string $countryCode, int $year, ?string $subdivision = null): array
    {
        $cacheKey = sprintf('public_holidays_%s_%d_%s', strtoupper($countryCode), $year, $subdivision ?? 'all');

        return $this->cache->get($cacheKey, function (ItemInterface $item) use ($countryCode, $year, $subdivision): array {
            $item->expiresAfter(self::CACHE_TTL);

            try {
                $response = $this->httpClient->request('GET', self::BASE_URL . '/PublicHolidays/' . $year . '/' . strtoupper($countryCode));
                $holidays = $response->toArray();

                if ($subdivision) {
                    $holidays = array_values(array_filter($holidays, function (array $holiday) use ($subdivision): bool {
                        if ($holiday['global'] ?? false) {
                            return true;
                        }
                        $counties = $holiday['counties'] ?? null;

                        return null === $counties || \in_array($subdivision, $counties, true);
                    }));
                }

                return array_map(fn(array $h) => [
                    'date' => $h['date'] ?? '',
                    'localName' => $h['localName'] ?? $h['name'] ?? '',
                    'name' => $h['name'] ?? '',
                ], $holidays);
            } catch (\Throwable $e) {
                $this->logger?->error('Failed to fetch holidays', ['country' => $countryCode, 'year' => $year, 'error' => $e->getMessage()]);

                return [];
            }
        });
    }

    public function clearCache(?string $countryCode = null, ?int $year = null): void
    {
        if ($countryCode && $year) {
            $this->cache->delete(sprintf('public_holidays_%s_%d_all', strtoupper($countryCode), $year));
        }
        if ($countryCode) {
            $this->cache->delete('public_holidays_subdivisions_' . strtoupper($countryCode));
        }
        $this->cache->delete('public_holidays_countries');
    }
}