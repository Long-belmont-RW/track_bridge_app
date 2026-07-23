import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import RoleTabs from "../../components/RoleTabs";
import { useAuth } from "../../context/AuthContext";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  password: "",

  deliveryAddress: "",

  companyName: "",
  industry: "E-commerce",
  businessAddress: "",

  licenseNumber: "",
  plateNumber: "",
};


const STEP1_REQUIRED = {
  customer: ["fullName", "email", "deliveryAddress", "phone", "password"],
  company: ["companyName", "email", "industry", "phone", "businessAddress", "password"],
  driver: ["fullName", "email", "phone", "password"],
};

const MISSING_MESSAGE = "This field must be filled";

function isFilled(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export default function Register() {
  const [role, setRole] = useState("company");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Fields the user has already tried to submit with missing — only these
  // show an error, so nothing looks broken before someone actually clicks.
  const [step1Errors, setStep1Errors] = useState({});
  const [step2Errors, setStep2Errors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    if (step1Errors[field] && isFilled(val)) {
      setStep1Errors((errs) => {
        const next = { ...errs };
        delete next[field];
        return next;
      });
    }
  }

  function handleRoleChange(next) {
    setRole(next);
    setStep(1);
    setStep1Errors({});
    setStep2Errors({});
  }

  function handleContinue(e) {
    e.preventDefault();
    const missing = STEP1_REQUIRED[role].filter((field) => !isFilled(form[field]));
    if (missing.length > 0) {
      setStep1Errors(Object.fromEntries(missing.map((f) => [f, MISSING_MESSAGE])));
      return;
    }
    setStep1Errors({});
    setStep(2);
  }

  function step2RequiredFields() {
    if (role === "driver") return { emailCode, phoneCode, licenseNumber: form.licenseNumber, plateNumber: form.plateNumber };
    return { emailCode };
  }

  async function handleVerify(e) {
    e.preventDefault();
    const fields = step2RequiredFields();
    const missing = Object.entries(fields).filter(([, v]) => !isFilled(v));
    if (missing.length > 0) {
      setStep2Errors(Object.fromEntries(missing.map(([k]) => [k, MISSING_MESSAGE])));
      return;
    }
    setStep2Errors({});
    setSubmitting(true);
    const displayName =
      role === "company" ? form.companyName : role === "driver" ? form.fullName : form.fullName;
    await register({
      role,
      name: displayName,
      email: role === "company" ? form.email : form.email,
      extra: {
        phone: form.phone,
        deliveryAddress: form.deliveryAddress,
        businessAddress: form.businessAddress,
        licenseNumber: form.licenseNumber,
        plateNumber: form.plateNumber,
      },
    });
    setSubmitting(false);
    navigate(`/${role}`, { replace: true });
  }

  function setCode(setter, field, errorState, setErrorState) {
    return (val) => {
      setter(val);
      if (errorState[field] && isFilled(val)) {
        setErrorState((errs) => {
          const next = { ...errs };
          delete next[field];
          return next;
        });
      }
    };
  }

  return (
    <div className="auth-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark-box"><ShieldCheck size={19} strokeWidth={2.4} /></span> TrackBridge
        </div>
        <h1>Create your account</h1>
        <p className="subtitle center">
          {step === 1 ? "Choose your account type to get started." : "Verify your details so we can activate your account."}
        </p>

        <RoleTabs value={role} onChange={handleRoleChange} />

        <div className="step-track">
          <span className={"step-bar" + (step >= 1 ? " done" : "")} />
          <span className={"step-bar" + (step >= 2 ? " done" : "")} />
        </div>
        <div className="step-label">
          {step === 1 ? "Step 1 of 2 — Account details" : "Step 2 of 2 — Verify your details"}
        </div>

        {step === 1 && (
          <form className="auth-form" onSubmit={handleContinue} noValidate>
            {role === "customer" && (
              <>
                <button type="button" className="btn btn-outline btn-block">
                  <span aria-hidden="true">G</span> Sign up with Google
                </button>
                <div className="divider">or sign up with email</div>
              </>
            )}

            {role === "company" && (
              <>
                <TextField
                  label="Company name"
                  value={form.companyName}
                  onChange={(v) => set("companyName", v)}
                  error={step1Errors.companyName}
                />
                <TextField
                  label="Business email"
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  error={step1Errors.email}
                />
                <div className="field-row">
                  <SelectField
                    label="Industry"
                    value={form.industry}
                    onChange={(v) => set("industry", v)}
                    options={["E-commerce", "Retail", "Food & Beverage", "Manufacturing", "Other"]}
                    error={step1Errors.industry}
                  />
                  <TextField
                    label="Phone"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    error={step1Errors.phone}
                  />
                </div>
                <TextField
                  label="Business address"
                  value={form.businessAddress}
                  onChange={(v) => set("businessAddress", v)}
                  error={step1Errors.businessAddress}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(v) => set("password", v)}
                  error={step1Errors.password}
                />
              </>
            )}

            {role === "driver" && (
              <>
                <TextField label="Full name" placeholder="Jane Cooper" value={form.fullName} onChange={(v) => set("fullName", v)} error={step1Errors.fullName} />
                <TextField label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} error={step1Errors.email} />
                <TextField label="Phone" placeholder="+234 800 000 0000" value={form.phone} onChange={(v) => set("phone", v)} error={step1Errors.phone} />
                <TextField label="Password" type="password" value={form.password} onChange={(v) => set("password", v)} error={step1Errors.password} />
              </>
            )}

            {role === "customer" && (
              <>
                <TextField label="Full name" placeholder="Jane Cooper" value={form.fullName} onChange={(v) => set("fullName", v)} error={step1Errors.fullName} />
                <TextField label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} error={step1Errors.email} />
                <TextField
                  label="Delivery address"
                  placeholder="Street, City, State"
                  value={form.deliveryAddress}
                  onChange={(v) => set("deliveryAddress", v)}
                  error={step1Errors.deliveryAddress}
                />
                <TextField label="Phone" placeholder="+234 803 000 0000" value={form.phone} onChange={(v) => set("phone", v)} error={step1Errors.phone} />
                <TextField label="Password" type="password" value={form.password} onChange={(v) => set("password", v)} error={step1Errors.password} />
              </>
            )}

            <button className="btn btn-dark btn-block" type="submit">
              {role === "customer" ? "Create account" : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerify} noValidate>
            {role === "company" && (
              <>
                <div className="notice">
                  We've sent a 6-digit code to <strong>{form.email || "company@gmail.com"}</strong>.
                  Enter it below to verify your account — that's all we need from a business to
                  get started.
                </div>
                <TextField
                  label="Verification code"
                  placeholder="6-digit code"
                  value={emailCode}
                  onChange={setCode(setEmailCode, "emailCode", step2Errors, setStep2Errors)}
                  error={step2Errors.emailCode}
                />
              </>
            )}

            {role === "customer" && (
              <>
                <div className="notice">
                  We've sent a 6-digit code to <strong>{form.email || "your email"}</strong>. Enter
                  it below to verify your account.
                </div>
                <TextField
                  label="Verification code"
                  placeholder="000000"
                  value={emailCode}
                  onChange={setCode(setEmailCode, "emailCode", step2Errors, setStep2Errors)}
                  error={step2Errors.emailCode}
                />
                <button type="button" className="link-btn">
                  Resend code
                </button>
              </>
            )}

            {role === "driver" && (
              <>
                <TextField
                  label="Email verification code"
                  placeholder="000000"
                  hint="Enter the code sent to your email."
                  value={emailCode}
                  onChange={setCode(setEmailCode, "emailCode", step2Errors, setStep2Errors)}
                  error={step2Errors.emailCode}
                />
                <TextField
                  label="Phone verification code"
                  placeholder="000000"
                  hint="Enter the code sent via SMS to your phone."
                  value={phoneCode}
                  onChange={setCode(setPhoneCode, "phoneCode", step2Errors, setStep2Errors)}
                  error={step2Errors.phoneCode}
                />
                <div className="field-row">
                  <TextField
                    label="Driver's license number"
                    placeholder="DL-0000000"
                    value={form.licenseNumber}
                    onChange={(v) => set("licenseNumber", v)}
                    error={step2Errors.licenseNumber}
                  />
                  <TextField
                    label="Plate number"
                    placeholder="LND-123-XY"
                    value={form.plateNumber}
                    onChange={(v) => set("plateNumber", v)}
                    error={step2Errors.plateNumber}
                  />
                </div>
              </>
            )}

            <div className="step-actions">
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn btn-dark" type="submit" disabled={submitting}>
                {submitting
                  ? "Creating…"
                  : role === "driver"
                  ? "Verify and create account"
                  : "Create account"}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function TextField({ label, hint, error, ...inputProps }) {
  return (
    <label className={"field" + (error ? " field-invalid" : "")}>
      <span>{label}</span>
      <input {...inputProps} onChange={(e) => inputProps.onChange(e.target.value)} />
      {error ? <small className="field-error">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}
    </label>
  );
}

function SelectField({ label, value, onChange, options, error }) {
  return (
    <label className={"field" + (error ? " field-invalid" : "")}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
