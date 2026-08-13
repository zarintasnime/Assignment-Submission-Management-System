export default function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone?: string;
}) {
  const normalizedTone = (tone ?? label).toLowerCase().replace(/\s+/g, '-');
  return <span className={`status-chip status-${normalizedTone}`}>{label}</span>;
}
