export default function ProtectedTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-in-fade">{children}</div>;
}
