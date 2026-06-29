<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(NotificationService $notifications)
    {
        return Inertia::render('admin/notifications', [
            'notifications' => $notifications->adminFeed(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications)
    {
        $data = $request->validate([
            'audience' => ['required', 'string', 'in:'.implode(',', NotificationService::AUDIENCES)],
            'title' => ['required', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $count = $notifications->announce(
            $data['audience'],
            $data['title'],
            $data['message'],
        );

        return back()->with('success', "Announcement sent to {$count} recipient(s).");
    }

    public function markAllRead(Request $request, NotificationService $notifications)
    {
        $notifications->markAllRead($request->user());

        return back()->with('success', 'Notifications marked as read.');
    }
}
