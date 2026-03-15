import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Users, UserCheck, UserX } from "lucide-react";

type UsersToolbarProps = {
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
    showRegisterForm: boolean;
    onToggleRegisterForm: () => void;
};

export function UsersToolbar({ totalCount, activeCount, inactiveCount, showRegisterForm, onToggleRegisterForm }: UsersToolbarProps) {
    return (
        <div className="mb-4 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Trung tâm quản lý khách hàng</h2>
                    <p className="text-sm text-muted-foreground">Theo dõi hồ sơ, xác thực, địa chỉ và trạng thái tài khoản khách hàng.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant={showRegisterForm ? "outline" : "default"} onClick={onToggleRegisterForm}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Đăng ký user
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Tổng khách hàng</p>
                            <p className="text-xl font-semibold">{totalCount}</p>
                        </div>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
                            <p className="text-xl font-semibold text-green-700">{activeCount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">ACTIVE</Badge>
                            <UserCheck className="h-5 w-5 text-green-700" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Đang khóa</p>
                            <p className="text-xl font-semibold text-red-700">{inactiveCount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">INACTIVE</Badge>
                            <UserX className="h-5 w-5 text-red-700" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
