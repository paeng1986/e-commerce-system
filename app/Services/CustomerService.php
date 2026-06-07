<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CustomerService
{
    /** Total spend at or above this marks a customer as VIP. */
    public const VIP_THRESHOLD = 100000;

    /**
     * Aggregate customer metrics across all customers.
     */
    public function stats(): array
    {
        $base = User::query()->where('role', 'customer');

        $totalRevenue = (float) DB::table('orders')
            ->join('users', 'users.id', '=', 'orders.customer_id')
            ->where('users.role', 'customer')
            ->where('orders.status', '!=', 'cancelled')
            ->sum('orders.total');

        return [
            'total_customers' => (int) (clone $base)->count(),
            'new_this_month' => (int) (clone $base)
                ->where('created_at', '>=', Carbon::now()->startOfMonth())
                ->count(),
            'with_orders' => (int) (clone $base)
                ->whereHas('orders')
                ->count(),
            'total_revenue' => $totalRevenue,
        ];
    }

    /**
     * Paginated customers with order counts, lifetime spend and last-order date.
     */
    public function paginate(int $perPage = 25, ?string $search = null)
    {
        return User::query()
            ->where('role', 'customer')
            ->with('profile')
            ->withCount('orders')
            ->withSum(
                ['orders as total_spent' => fn ($query) => $query->where('status', '!=', 'cancelled')],
                'total'
            )
            ->withMax('orders as last_order_at', 'created_at')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('email', 'like', "%{$search}%")
                        ->orWhereHas('profile', function ($profile) use ($search) {
                            $profile
                                ->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('contact_no', 'like', "%{$search}%")
                                ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                        });
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn ($user) => $this->transform($user));
    }

    /**
     * Create a customer account (user + profile).
     */
    public function store(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'] ?? str()->password(12),
                'role' => 'customer',
            ]);

            UserProfile::create([
                'user_id' => $user->id,
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'address' => $data['address'] ?? null,
                'contact_no' => $data['contact_no'] ?? null,
            ]);

            return $user;
        });
    }

    private function transform(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => trim($user->name) ?: 'Unnamed customer',
            'email' => $user->email,
            'contact_no' => $user->profile?->contact_no,
            'address' => $user->profile?->address,
            'avatar' => $user->profile?->avatar,
            'orders_count' => (int) $user->orders_count,
            'total_spent' => (float) ($user->total_spent ?? 0),
            'last_order_at' => $user->last_order_at
                ? Carbon::parse($user->last_order_at)->format('M d, Y')
                : null,
            'joined_at' => $user->created_at?->format('M d, Y'),
        ];
    }
}
