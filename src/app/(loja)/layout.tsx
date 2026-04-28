export default function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0a1f12" }}
    >
      {children}
    </div>
  );
}
