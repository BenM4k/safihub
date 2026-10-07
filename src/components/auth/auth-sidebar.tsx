import Image from "next/image";

/**
 * Right-side testimonial showcase panel matching reference design (login.png/sign-up.png).
 */
export function AuthSidebar() {
  return (
    <aside
      aria-label="SafiHub Présentation"
      className="hidden lg:flex flex-col items-center justify-center p-8 xl:p-12 2xl:p-16 h-full"
    >
      <div className="w-full max-w-2xl bg-[#DDF1FD] rounded-[2.25rem] p-8 xl:p-12 flex flex-col items-center justify-center shadow-xs">
        {/* Rounded showcase photograph */}
        <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden shadow-sm bg-white/50">
          <Image
            src="/images/auth-showcase.jpg"
            alt="Client satisfait tenant du linge propre et fraîchement repassé SafiHub"
            fill
            sizes="(max-width: 1280px) 50vw, 640px"
            priority
            className="object-cover"
          />
        </div>

        {/* Testimonial / Value prop caption */}
        <p className="mt-8 text-center text-sm xl:text-base font-medium text-slate-700 leading-relaxed max-w-lg">
          Join thousands of customers using SafiHub to schedule laundry &amp;
          dry cleaning seamlessly. Anytime, anywhere.
        </p>
      </div>
    </aside>
  );
}
