import React, { useState } from "react";
import StatusChangeDialog from "./components/StatusChangeDialog";
import CertificateManagementTable from "./components/CertificateManagementTable";
import { Certificate } from "./page";

export default function CertificateManagementTableWithStatusDialog(props: any) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>(props.certificates || []);

  // Sync certificates if props.certificates changes (e.g. search)
  React.useEffect(() => {
    setCertificates(props.certificates || []);
  }, [props.certificates]);

  const handleStatusClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = () => {
    if (selectedCertificate) {
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === selectedCertificate.id
            ? {
                ...c,
                status: c.status === 'Đang áp dụng' ? 'Ngừng áp dụng' : 'Đang áp dụng',
              }
            : c
        )
      );
    }
    setStatusDialogOpen(false);
    setSelectedCertificate(null);
  };

  const handleStatusClose = () => {
    setStatusDialogOpen(false);
    setSelectedCertificate(null);
  };

  return (
    <>
      <CertificateManagementTable
        {...props}
        certificates={certificates}
        onStatusClick={handleStatusClick}
      />
      <StatusChangeDialog
        open={statusDialogOpen}
        onClose={handleStatusClose}
        onConfirm={handleStatusConfirm}
        certificate={selectedCertificate}
      />
    </>
  );
}
