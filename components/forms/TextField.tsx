"use client";

import SkeletonBlock from "@/components/ui/SkeletonBlock";

type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  loading?: boolean;
};

export default function TextField({
  id,
  name,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  loading = false
}: TextFieldProps) {
  return (
    <div>
      {loading ? (
        <div className="space-y-2">
          {/* Label skeleton */}
          <SkeletonBlock className="h-4 w-24" />

          {/* Input skeleton */}
          <SkeletonBlock className="h-11 w-full rounded-2xl" />

          {/* Error placeholder (optional spacing consistency) */}
          <SkeletonBlock className="h-3 w-20" />
        </div>
      ) : (
        <>
          <label htmlFor={id} className="label">
            {label}
          </label>

          <input
            id={id}
            name={name}
            type={type}
            className="input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={autoComplete}
          />

          {error ? (
            <p className="mt-2 text-xs text-rose-300">{error}</p>
          ) : null}
        </>
      )}
    </div>
  );
}