<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class SuluAdminExtrasBundle extends Bundle
{
    public function getPath(): string
    {
        return \dirname(__DIR__);
    }
}
