import Link from "next/link";

export function RegisterSwitch() {
  return (
    <div className="mt-6 text-center text-sm text-slate-600">
      <span>Already have an account? </span>
      <Link
        href="/login"
        className="font-medium text-primary hover:underline underline-offset-4"
      >
        Log in
      </Link>
    </div>
  );
}
