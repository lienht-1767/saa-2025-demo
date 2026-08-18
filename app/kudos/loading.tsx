export default function KudosLoading() {
  return (
    <div className="min-h-screen bg-canvas px-6 py-20 text-white md:px-16">
      <p className="sr-only" role="status">Loading Kudos board</p>
      <div className="mx-auto flex max-w-[1157px] animate-pulse flex-col gap-20">
        <div className="h-80 rounded-3xl bg-white/5" />
        <div className="space-y-8"><div className="h-12 w-80 rounded bg-white/10" /><div className="h-[520px] rounded-2xl bg-white/5" /></div>
        <div className="space-y-8"><div className="h-12 w-80 rounded bg-white/10" /><div className="h-[420px] rounded-[47px] bg-white/5" /></div>
        <div className="grid gap-10 lg:grid-cols-[680px_1fr]"><div className="h-[680px] rounded-2xl bg-white/5" /><div className="h-96 rounded-2xl bg-white/5" /></div>
      </div>
    </div>
  );
}
