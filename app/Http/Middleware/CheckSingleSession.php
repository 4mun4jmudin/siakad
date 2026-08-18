<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSingleSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $sessionId = session()->getId();

            // Jika sesi ini memiliki tanda baru saja login
            if (session()->pull('just_logged_in')) {
                // Perbarui ID Sesi di database ke sesi baru ini
                $user->update(['current_session_id' => $sessionId]);
            } else {
                // Untuk request normal, periksa apakah ID Sesi cocok
                if ($user->current_session_id && $user->current_session_id !== $sessionId) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect('/')->with('error', 'Sesi login Anda telah berakhir karena akun digunakan di perangkat lain.');
                }
            }
        }

        return $next($request);
    }
}
