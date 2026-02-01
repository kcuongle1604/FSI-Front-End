
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Certificate } from "../page";
import { FC } from "react";

interface StatusChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  certificate: Certificate | null;
}

const StatusChangeDialog: FC<StatusChangeDialogProps> = ({ open, onClose, onConfirm, certificate }) => {
  if (!certificate) return null;
  const isActive = certificate.status === "Đang áp dụng";
  const newStatus = isActive ? "Ngừng áp dụng" : "Đang áp dụng";
  const action = isActive ? "Ngưng hoạt động" : "Kích hoạt";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{action} chứng chỉ?</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-gray-700">
            Bạn có chắc chắn muốn <span className="font-semibold">{action} chứng chỉ {certificate.name}</span> không?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            >
              Hủy
            </Button>
            <Button
              onClick={onConfirm}
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
};

export default StatusChangeDialog;
