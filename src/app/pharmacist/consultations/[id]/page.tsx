import ConsultationDetail from "./consultation-detail";

export function generateStaticParams() {
  return [
    { id: "c-001" },
    { id: "c-002" },
    { id: "c-003" },
    { id: "c-004" },
    { id: "c-005" },
  ];
}

export default function ConsultationDetailPage() {
  return <ConsultationDetail />;
}
