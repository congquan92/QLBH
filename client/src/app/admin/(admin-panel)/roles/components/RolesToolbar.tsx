import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type RolesToolbarProps = {
    rolesCount: number;
    pagesCount: number;
    onCreate: () => void;
};

export function RolesToolbar({ rolesCount, pagesCount, onCreate }: RolesToolbarProps) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
                {rolesCount} vai trò &middot; {pagesCount} trang
            </p>
            <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo vai trò mới
            </Button>
        </div>
    );
}
