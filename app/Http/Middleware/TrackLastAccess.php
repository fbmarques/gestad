<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TrackLastAccess
{
    private const CACHE_TTL_MINUTES = 5;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $cacheKey = $this->getCacheKey($user->id);

            if (! Cache::has($cacheKey)) {
                $user->forceFill([
                    'last_access_at' => now(),
                ])->save();

                Cache::put($cacheKey, true, now()->addMinutes(self::CACHE_TTL_MINUTES));
            }
        }

        return $next($request);
    }

    public static function getCacheKey(int $userId): string
    {
        return "user-last-access-touched:{$userId}";
    }
}
