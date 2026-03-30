export default function WarningConfirmModal({
  open,
  title = "Please confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Please wait...",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1f1a44]/45"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative z-10 w-[min(520px,95vw)] rounded-2xl border border-amber-300 bg-white p-5 shadow-[0_30px_80px_rgba(37,28,97,0.35)]">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-amber-700">
          Warning
        </p>
        <h3 className="text-xl font-bold text-[#231f52]">{title}</h3>
        <p className="mt-2 text-sm text-[#4d4a75]">{message}</p>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl bg-[#ddd7f3] px-4 py-2 text-sm font-semibold text-[#312e5a] transition hover:bg-[#d1caee] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
