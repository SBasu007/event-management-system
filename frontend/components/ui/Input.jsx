export default function Input({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <label htmlFor={id} className="field">
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}
