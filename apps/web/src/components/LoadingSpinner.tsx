export default function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-cyber-bg">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-cyber-border" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyber-primary" />
      </div>
    </div>
  );
}
