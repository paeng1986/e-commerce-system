<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;

class UserService
{
    /** Roles managed from the back-office User Management screen. */
    public const BACK_OFFICE_ROLES = ['super-admin', 'admin', 'staff'];

    public function stats(): array
    {
        $base = User::query()->whereIn('role', self::BACK_OFFICE_ROLES);

        return [
            'total' => (int) (clone $base)->count(),
            'admins' => (int) (clone $base)->whereIn('role', ['admin', 'super-admin'])->count(),
            'staff' => (int) (clone $base)->where('role', 'staff')->count(),
            'inactive' => (int) (clone $base)->where('is_active', false)->count(),
        ];
    }

    /**
     * Paginated back-office users (admins + staff), searchable and role-filterable.
     */
    public function paginate(int $perPage = 25, ?string $search = null, ?string $role = null)
    {
        return User::query()
            ->with('profile')
            ->whereIn('role', self::BACK_OFFICE_ROLES)
            ->when($role && $role !== 'all', fn ($query) => $query->where('role', $role))
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('email', 'like', "%{$search}%")
                        ->orWhereHas('profile', function ($profile) use ($search) {
                            $profile
                                ->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                        });
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn ($user) => $this->transform($user));
    }

    public function store(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
                'is_active' => true,
            ]);

            UserProfile::create([
                'user_id' => $user->id,
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'contact_no' => $data['contact_no'] ?? null,
            ]);

            return $user;
        });
    }

    public function setActive(User $user, bool $active): User
    {
        $user->update(['is_active' => $active]);

        return $user;
    }

    private function transform(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => trim($user->name) ?: 'Unnamed',
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => (bool) $user->is_active,
            'contact_no' => $user->profile?->contact_no,
            'created_at' => $user->created_at?->format('M d, Y'),
        ];
    }
}
