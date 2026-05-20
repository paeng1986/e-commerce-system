<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use App\Models\User;
use App\Models\UserProfile;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            [
                'email' => 'e-commerce@admin',
            ],
            [
                'password' => Hash::make('password123!!@@'),
                'role' => 'super-admin',
            ]
        );

        UserProfile::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'first_name' => 'System',
                'last_name' => 'Admininstrator',
                'avatar' => null,
            ]
        );
    }
}