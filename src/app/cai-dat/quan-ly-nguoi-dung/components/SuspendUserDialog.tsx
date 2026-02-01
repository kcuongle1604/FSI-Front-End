"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Account = {
  id: number
  name: string
  email: string
  role: string
  status: string
  isBan: boolean
}


type SuspendUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
  onConfirm?: (newStatus: string) => void;
  currentStatus?: string;
};


export function SuspendUserDialog({ open, onOpenChange, account, onConfirm, currentStatus }: SuspendUserDialogProps) {
  if (!account) return null;
  // Use currentStatus from props if provided, otherwise fallback to account.status
  const status = currentStatus ?? account.status;
  const isActive = status === "Hoạt động";
  const action = isActive ? "Ngưng hoạt động" : "Kích hoạt";
  const newStatus = isActive ? "Ngưng hoạt động" : "Hoạt động";

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(newStatus);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{action} người dùng?</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-gray-700">
            Bạn có chắc chắn muốn <span className="font-semibold">{action}</span> người dùng <span className="font-semibold">{account.name}</span> này không?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirm}
              className={`px-6 text-white ${
                isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Có
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
