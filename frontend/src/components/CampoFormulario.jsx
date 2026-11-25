function CampoFormulario({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder = "",
    min,
    step
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
                {label}
            </span>

            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                min={min}
                step={step}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </label>
    );
}

export default CampoFormulario;