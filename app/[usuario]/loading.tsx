export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {/* Spinner con estilo Hearth & Habit */}
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#f0e6d5]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-terracota border-t-transparent animate-spin"></div>
      </div>
      <p className="text-[#9a8c7c] font-medium text-sm animate-pulse">
        Cargando...
      </p>
    </div>
  );
}
