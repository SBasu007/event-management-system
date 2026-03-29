export default function Button({ type = "button", children, onClick, disabled = false }) {
  return (
    <button type={type} onClick={onClick} className="btn btn-primary" disabled={disabled}>
      {children}
    </button>
  );
}
