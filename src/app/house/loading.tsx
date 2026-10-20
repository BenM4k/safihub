export default function HouseRedirectLoading() {
  return (
    <div
      role="status"
      aria-label="Redirection vers l'espace partenaire"
      className="min-h-screen flex items-center justify-center bg-slate-50"
    >
      <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
