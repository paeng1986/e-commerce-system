<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    protected UserService $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'contact_no' => ['nullable', 'string', 'max:50'],
            'role' => ['required', Rule::in(['admin', 'staff'])],
            'password' => ['required', 'string', 'min:8'],
        ]);

        try {
            $this->service->store($data);

            return redirect()
                ->route('users')
                ->with('success', 'User account created successfully.');
        } catch (\Throwable $th) {
            \Log::error(
                'User Store Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors([
                'user' => 'Failed to create user account.',
            ]);
        }
    }

    public function toggleActive(Request $request, User $user)
    {
        // A user cannot deactivate their own account.
        if ($user->id === $request->user()->id) {
            return back()->withErrors([
                'user' => 'You cannot change the status of your own account.',
            ]);
        }

        $this->service->setActive($user, ! $user->is_active);

        return back()->with('success', $user->is_active
            ? 'Account activated.'
            : 'Account deactivated.');
    }
}
