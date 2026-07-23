const ROLES = [
  { value: "company", label: "Company" },
  { value: "driver", label: "Driver" },
  { value: "customer", label: "Customer" },
];

export default function RoleTabs({ value, onChange }) {
  return (
    <div className="role-tabs">
      {ROLES.map((r) => (
        <button
          key={r.value}
          type="button"
          className={"role-tab" + (value === r.value ? " active" : "")}
          onClick={() => onChange(r.value)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
