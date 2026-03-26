"use client";

import { AttendanceApi } from "@/api/admin/attendance.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Loader2, Clock, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AttendanceRecord } from "@/types/attendance";

export default function AttendancePage() {
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

    async function fetchHistory() {
        try {
            setIsLoading(true);
            const res = await AttendanceApi.getHistory({ page: 1, size: 30, sort: "date:desc" });
            setHistory(res.data.data || []);

            // Find today's record
            const today = new Date().toISOString().split("T")[0];
            const todayRec = res.data.data.find((rec: AttendanceRecord) => rec.date === today);
            setTodayRecord(todayRec || null);
        } catch (error) {
            console.error("Failed to fetch attendance history", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchHistory();
    }, []);

    async function handleRecord() {
        try {
            setIsRecording(true);
            const res = await AttendanceApi.record();

            const isCheckOut = res.data.check_out !== undefined && res.data.check_out !== null;

            if (isCheckOut) {
                toast.success("Check-out thành công! 👋", {
                    description: `Thời gian: ${res.data.check_out}`,
                });
            } else {
                toast.success("Check-in thành công! 👍", {
                    description: `Thời gian: ${res.data.check_in}`,
                });
            }

            await fetchHistory();
        } catch (error) {
            toast.error("Không thể điểm danh", {
                description: error instanceof Error ? error.message : "Vui lòng thử lại",
            });
        } finally {
            setIsRecording(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PRESENT":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "LATE":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "ABSENT":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PRESENT":
                return "Đúng giờ";
            case "LATE":
                return "Muộn";
            case "ABSENT":
                return "Vắng";
            default:
                return status;
        }
    };

    const hasCheckedIn = todayRecord && todayRecord.check_in;
    const hasCheckedOut = todayRecord && todayRecord.check_out;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chấm công</h1>
                    <p className="text-muted-foreground">Điểm danh check-in/check-out và xem lịch sử chuyên cần</p>
                </div>
            </div>

            {/* Check-in/Check-out Card */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Điểm danh hôm nay
                    </CardTitle>
                    <CardDescription>{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border p-4">
                            <div className="text-sm text-muted-foreground mb-1">Check-in</div>
                            <div className="text-2xl font-bold">{hasCheckedIn ? todayRecord.check_in : "--:--:--"}</div>
                        </div>
                        <div className="rounded-lg border p-4">
                            <div className="text-sm text-muted-foreground mb-1">Check-out</div>
                            <div className="text-2xl font-bold">{hasCheckedOut ? todayRecord.check_out : "--:--:--"}</div>
                        </div>
                    </div>

                    {todayRecord && (
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <div className="text-sm text-muted-foreground">Trạng thái</div>
                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todayRecord.status)}`}>{getStatusLabel(todayRecord.status)}</span>
                            </div>
                            {todayRecord.total_hours !== undefined && (
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Tổng giờ làm</div>
                                    <div className="text-lg font-semibold">{todayRecord.total_hours.toFixed(2)}h</div>
                                </div>
                            )}
                        </div>
                    )}

                    <Button size="lg" className="w-full" onClick={handleRecord} disabled={isRecording || (hasCheckedIn && hasCheckedOut)}>
                        {isRecording ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : hasCheckedOut ? (
                            <>Đã hoàn thành điểm danh hôm nay</>
                        ) : hasCheckedIn ? (
                            <>
                                <LogOut className="mr-2 h-5 w-5" />
                                Check-out
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-5 w-5" />
                                Check-in
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* History Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Lịch sử chấm công
                    </CardTitle>
                    <CardDescription>30 ngày gần nhất</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải lịch sử...
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted">
                                    <tr>
                                        <th className="px-6 py-3">Ngày</th>
                                        <th className="px-6 py-3">Ca làm việc</th>
                                        <th className="px-6 py-3">Check-in</th>
                                        <th className="px-6 py-3">Check-out</th>
                                        <th className="px-6 py-3">Tổng giờ</th>
                                        <th className="px-6 py-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? (
                                        history.map((record) => (
                                            <tr key={record.id} className="border-b hover:bg-muted/50">
                                                <td className="px-6 py-4 font-medium">{new Date(record.date).toLocaleDateString("vi-VN")}</td>
                                                <td className="px-6 py-4">{record.shift_name || "N/A"}</td>
                                                <td className="px-6 py-4">{record.check_in}</td>
                                                <td className="px-6 py-4">{record.check_out || "--:--:--"}</td>
                                                <td className="px-6 py-4">{record.total_hours !== undefined ? `${record.total_hours.toFixed(2)}h` : "-"}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>{getStatusLabel(record.status)}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-6 py-8 text-center text-muted-foreground" colSpan={6}>
                                                Chưa có dữ liệu chấm công
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
