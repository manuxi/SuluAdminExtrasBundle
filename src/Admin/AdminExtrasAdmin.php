<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Admin;

use Sulu\Bundle\AdminBundle\Admin\Admin;

class AdminExtrasAdmin extends Admin
{
    public const CONFIG_KEY = 'sulu_admin_extras';

    public function __construct(
        private array $config,
    ) {
    }

    public function getConfigKey(): ?string
    {
        return self::CONFIG_KEY;
    }

    public function getConfig(): ?array
    {
        return $this->config;
    }
}
