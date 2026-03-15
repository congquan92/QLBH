import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";

type UsersToolbarProps = {
    totalCount: number;
    showCreateForm: boolean;
    showRegisterForm: boolean;
    onToggleCreateForm: () => void;
    onToggleRegisterForm: () => void;
};

export function UsersToolbar({ totalCount, showCreateForm, showRegisterForm, onToggleCreateForm, onToggleRegisterForm }: UsersToolbarProps) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-md font-semibold">Danh sách tài khoản ({totalCount})</h2>
            <div className="flex flex-wrap gap-2">
                <Button variant={showCreateForm ? "outline" : "default"} onClick={onToggleCreateForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm user
                </Button>
                <Button variant={showRegisterForm ? "outline" : "default"} onClick={onToggleRegisterForm}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Đăng ký user
                </Button>
            </div>
        </div>
    );
}
