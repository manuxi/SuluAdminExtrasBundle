<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Controller;

use Manuxi\SuluAdminExtrasBundle\Service\PublicHolidayService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/admin/api/public-holidays')]
class PublicHolidayProxyController
{
    public function __construct(
        private readonly PublicHolidayService $publicHolidayService,
    ) {
    }

    #[Route('/countries', name: 'sulu_admin_extras.public_holidays.countries', methods: ['GET'])]
    public function countriesAction(): JsonResponse
    {
        return new JsonResponse($this->publicHolidayService->getAvailableCountries());
    }

    #[Route('/subdivisions/{countryCode}', name: 'sulu_admin_extras.public_holidays.subdivisions', methods: ['GET'])]
    public function subdivisionsAction(string $countryCode): JsonResponse
    {
        return new JsonResponse($this->publicHolidayService->getSubdivisions($countryCode));
    }

    #[Route('/fetch', name: 'sulu_admin_extras.public_holidays.fetch', methods: ['GET'])]
    public function fetchAction(Request $request): JsonResponse
    {
        $country = $request->query->get('country', 'DE');
        $year = $request->query->getInt('year', (int) date('Y'));
        $subdivision = $request->query->get('subdivision');

        if ($year < 2000 || $year > 2100) {
            return new JsonResponse(['error' => 'Invalid year'], 400);
        }

        $holidays = $this->publicHolidayService->getPublicHolidays($country, $year, $subdivision ?: null);

        return new JsonResponse($holidays);
    }
}