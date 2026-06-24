<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    /**
     * Allow back-office roles (admin, super-admin, staff) into shared
     * operational pages. Customers and guests are bounced to the storefront.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check() || ! in_array(auth()->user()->role, ['admin', 'super-admin', 'staff'], true)) {
            return redirect('/');
        }

        return $next($request);
    }
}
