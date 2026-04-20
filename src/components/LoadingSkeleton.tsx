'use client';

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-toss-border via-toss-bg to-toss-border bg-[length:200%_100%] animate-shimmer dark:from-toss-dark-border dark:via-toss-dark-elevated dark:to-toss-dark-border ${className ?? ''}`}
    />
  );
}

export function TournamentSkeleton() {
  return (
    <div className="space-y-4">
      {/* 프로그레스 바 */}
      <SkeletonPulse className="h-1 w-full rounded-full" />

      {/* 라운드 정보 */}
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-6 w-24" />
        <SkeletonPulse className="h-6 w-16" />
      </div>

      {/* 카드 1 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
        <div className="flex items-center gap-4">
          <SkeletonPulse className="h-14 w-14 shrink-0 !rounded-2xl" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-5 w-32" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-3 w-20" />
          </div>
        </div>
      </div>

      {/* VS */}
      <div className="flex justify-center">
        <SkeletonPulse className="h-10 w-10 !rounded-full" />
      </div>

      {/* 카드 2 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-toss-dark-card">
        <div className="flex items-center gap-4">
          <SkeletonPulse className="h-14 w-14 shrink-0 !rounded-2xl" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-5 w-28" />
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModePickerSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <SkeletonPulse className="h-5 w-28" />
        <SkeletonPulse className="h-4 w-44" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm dark:bg-toss-dark-card"
          >
            <SkeletonPulse className="mb-4 h-10 w-10 !rounded-full" />
            <SkeletonPulse className="mb-2 h-5 w-16" />
            <SkeletonPulse className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
