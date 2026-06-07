<?php

namespace App\Http\Controllers;

use App\Services\CustomerService;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    protected CustomerService $service;

    public function __construct(CustomerService $service)
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
            'address' => ['nullable', 'string', 'max:500'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        try {
            $this->service->store($data);

            return redirect()
                ->route('customers')
                ->with('success', 'Customer added successfully.');
        } catch (\Throwable $th) {
            \Log::error(
                'Customer Store Error: '.
                $th->getMessage().
                "\n".
                $th->getTraceAsString()
            );

            return back()->withErrors([
                'customer' => 'Failed to add customer.',
            ]);
        }
    }
}
