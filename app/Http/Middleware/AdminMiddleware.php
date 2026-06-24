<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check()) {
            return redirect('/');
        }

        $role = auth()->user()->role;

        // Management area is restricted to administrators.
        if (! in_array($role, ['admin', 'super-admin'], true)) {
            // Staff still have a back office, just a narrower one.
            if ($role === 'staff') {
                return redirect('/admin/dashboard');
            }

            return redirect('/');
        }

        return $next($request);
    }
}
