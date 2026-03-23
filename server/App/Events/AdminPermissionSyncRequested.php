<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminPermissionSyncRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ?int $roleId = null,
        public ?int $userId = null,
        public string $reason = 'permissions_updated',
    ) {
    }

    /**
     * Public channel to avoid auth guard mismatch between JWT API and broadcasting auth route.
     */
    public function broadcastOn(): array
    {
        return [new Channel('admin.permission-sync')];
    }

    public function broadcastAs(): string
    {
        return 'admin.permission.sync';
    }

    public function broadcastWith(): array
    {
        return [
            'role_id' => $this->roleId,
            'user_id' => $this->userId,
            'reason' => $this->reason,
            'sent_at' => now()->toIso8601String(),
        ];
    }
}
