<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    public const TYPES = [
        'order_confirmation',
        'delivery_update',
        'announcement',
        'admin_order',
    ];

    public const AUDIENCES = [
        'customers',
        'staff',
        'all',
    ];

    public function feedFor(User $user, int $limit = 12): array
    {
        return Notification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Notification $notification) => $this->format($notification))
            ->all();
    }

    public function unreadCount(User $user): int
    {
        return (int) Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }

    public function adminFeed(int $limit = 50): array
    {
        return Notification::query()
            ->with('user.profile')
            ->whereIn('type', ['announcement', 'admin_order'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Notification $notification) => [
                ...$this->format($notification),
                'recipient' => $notification->user?->name ?: $notification->user?->email,
                'recipient_role' => $notification->user?->role,
            ])
            ->all();
    }

    public function markAllRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function notifyOrderConfirmed(Order $order): void
    {
        if (! $order->customer_id) {
            return;
        }

        $this->createForUser((int) $order->customer_id, [
            'order_id' => $order->id,
            'type' => 'order_confirmation',
            'title' => 'Order confirmed',
            'message' => sprintf('Your order NV-%05d has been confirmed. We will start preparing it shortly.', $order->id),
            'data' => [
                'order_code' => sprintf('NV-%05d', $order->id),
                'status' => ucwords($order->status),
            ],
        ]);

        $this->notifyStaffOrderCreated($order);
    }

    public function notifyOrderStatusChanged(Order $order, string $oldStatus, string $newStatus): void
    {
        if (! $order->customer_id) {
            return;
        }

        $this->createForUser((int) $order->customer_id, [
            'order_id' => $order->id,
            'type' => 'delivery_update',
            'title' => 'Order status updated',
            'message' => sprintf(
                'Your order NV-%05d moved from %s to %s.',
                $order->id,
                ucwords($oldStatus),
                ucwords($newStatus)
            ),
            'data' => [
                'order_code' => sprintf('NV-%05d', $order->id),
                'old_status' => ucwords($oldStatus),
                'new_status' => ucwords($newStatus),
            ],
        ]);
    }

    public function announce(string $audience, string $title, string $message): int
    {
        $users = $this->usersForAudience($audience);

        foreach ($users as $user) {
            $this->createForUser($user->id, [
                'type' => 'announcement',
                'title' => $title,
                'message' => $message,
                'data' => [
                    'audience' => $audience,
                ],
            ]);
        }

        return $users->count();
    }

    private function notifyStaffOrderCreated(Order $order): void
    {
        $users = User::whereIn('role', ['super-admin', 'admin', 'staff'])->get();

        foreach ($users as $user) {
            $this->createForUser($user->id, [
                'order_id' => $order->id,
                'type' => 'admin_order',
                'title' => 'New order received',
                'message' => sprintf('Order NV-%05d was placed and is ready for processing.', $order->id),
                'data' => [
                    'order_code' => sprintf('NV-%05d', $order->id),
                    'total' => (float) $order->total,
                ],
            ]);
        }
    }

    private function usersForAudience(string $audience): Collection
    {
        return User::query()
            ->when($audience === 'customers', fn ($query) => $query->where('role', 'customer'))
            ->when($audience === 'staff', fn ($query) => $query->whereIn('role', ['super-admin', 'admin', 'staff']))
            ->get();
    }

    private function createForUser(int $userId, array $data): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'order_id' => $data['order_id'] ?? null,
            'type' => $data['type'],
            'title' => $data['title'],
            'message' => $data['message'],
            'data' => $data['data'] ?? null,
        ]);
    }

    private function format(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'order_id' => $notification->order_id,
            'data' => $notification->data ?? [],
            'read_at' => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at?->toISOString(),
            'created_label' => $notification->created_at?->diffForHumans(),
        ];
    }
}
