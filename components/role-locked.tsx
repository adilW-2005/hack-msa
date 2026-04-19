import { ShieldAlert } from "lucide-react";

type RoleLockedProps = {
  title: string;
  body: string;
};

export function RoleLocked({ title, body }: RoleLockedProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="panel panel-elevated p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-clay-100 text-clay-700">
          <ShieldAlert className="size-6" />
        </div>
        <h2 className="mt-5 text-[24px] font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        <p className="mt-3 text-[14px] leading-6 text-ink-muted">{body}</p>
      </div>
    </div>
  );
}
