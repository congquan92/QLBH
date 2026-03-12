import { redirect } from "next/navigation";

export default function LeavePage() {
    return redirect("/admin/leave-requests");
}
