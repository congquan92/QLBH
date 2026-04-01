<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminPermissionSyncRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public static function dispatchSilently(?int $roleId = null, ?int $userId = null, string $reason = 'permissions_updated'): void
    {
        try {
            static::dispatch($roleId, $userId, $reason);
        } catch (Throwable $exception) {
            Log::warning('Admin permission sync broadcast failed', [
                'role_id' => $roleId,
                'user_id' => $userId,
                'reason' => $reason,
                'message' => $exception->getMessage(),
            ]);
        }
    }

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
