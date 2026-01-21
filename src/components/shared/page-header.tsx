//tiêu đề trang
export const PageHeader = ({ title }: { title: string }) => (
  <div className="mb-4">
    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
  </div>
);