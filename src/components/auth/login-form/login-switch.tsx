import Link from "next/link";

export function LoginSwitch() {
  return (
    <div className="mt-8 text-center text-sm text-slate-600">
      <span>New to SafiHub? </span>
      <Link
        href="/register"
        className="font-medium text-primary hover:underline underline-offset-4"
      >
        Create an account
      </Link>
    </div>
  );
}
