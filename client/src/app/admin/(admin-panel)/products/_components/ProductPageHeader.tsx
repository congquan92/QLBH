import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package2, Plus, Store, Tag } from "lucide-react";

type ProductPageHeaderProps = {
    totalProducts: number;
    activeProducts: number;
    hiddenProducts: number;
    categoriesCount: number;
    onCreate: () => void;
};

export function ProductPageHeader({ totalProducts, activeProducts, hiddenProducts, categoriesCount, onCreate }: ProductPageHeaderProps) {
    return (
        <div className="space-y-4 flex flex-col">
            <div className="flex justify-end">
                <Button onClick={onCreate} className="h-11 px-5">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm sản phẩm
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
                            <p className="text-2xl font-semibold">{totalProducts}</p>
                        </div>
                        <Package2 className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Đang hiển thị</p>
                            <p className="text-2xl font-semibold">{activeProducts}</p>
                        </div>
                        <Store className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Đang ẩn</p>
                            <p className="text-2xl font-semibold">{hiddenProducts}</p>
                        </div>
                        <Package2 className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Phân loại khả dụng</p>
                            <p className="text-2xl font-semibold">{categoriesCount}</p>
                        </div>
                        <Tag className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
