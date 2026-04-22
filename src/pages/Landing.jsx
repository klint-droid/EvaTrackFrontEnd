import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-12">
      
      <div className="max-w-5xl w-full grid gap-10 lg:grid-cols-[1.3fr_1fr] items-center">

        {/* LEFT CONTENT */}
        <div className="space-y-8">

          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-4 py-2 text-sky-300 text-sm font-medium">
            🚨 Emergency-ready evacuation system
          </div>

          <div className="space-y-5">

            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl text-white leading-tight">
  EvaTrack keeps communities <span className="text-sky-400">safe</span> and{" "}
  <span className="text-orange-400">prepared</span>.
</h1>

            <p className="max-w-xl text-slate-300 text-lg leading-8">
              Monitor evacuation centers in real time, track capacity, and coordinate emergency response with a modern and reliable system built for disaster readiness.
            </p>

          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 shadow-md shadow-sky-500/20"
            >
              Sign in
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-orange-400/40 bg-orange-500/10 px-6 py-3 text-sm font-semibold text-orange-300 transition hover:border-orange-300"
            >
              View demo dashboard
            </Link>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="rounded-3xl border border-sky-500/20 bg-slate-900/70 p-8 shadow-[0_18px_80px_rgba(56,189,248,.15)]">

          <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-950/90 p-5 border border-slate-800">

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-400">
                Evacuation center
              </p>

              <p className="mt-2 text-xl font-semibold text-white">
                Maple Ridge Community Hub
              </p>
            </div>

            <div className="inline-flex items-center rounded-full bg-orange-500/15 px-3 py-1 text-sm font-medium text-orange-300">
              ⚠ Open
            </div>

          </div>

          <div className="grid gap-4">

            <div className="rounded-2xl bg-slate-950/90 p-5 border border-slate-800">
              <p className="text-sm text-slate-400">Capacity</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                142 / 200
              </p>

              <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-sky-500 rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

              <div className="rounded-2xl bg-slate-950/90 p-4 text-center border border-slate-800">
                <p className="text-xs uppercase tracking-[0.24em] text-sky-400">
                  Rooms
                </p>
                <p className="mt-2 text-xl font-semibold text-white">8</p>
              </div>

              <div className="rounded-2xl bg-slate-950/90 p-4 text-center border border-slate-800">
                <p className="text-xs uppercase tracking-[0.24em] text-orange-400">
                  Households
                </p>
                <p className="mt-2 text-xl font-semibold text-white">56</p>
              </div>

              <div className="rounded-2xl bg-slate-950/90 p-4 text-center border border-slate-800">
                <p className="text-xs uppercase tracking-[0.24em] text-rose-400">
                  Alerts
                </p>
                <p className="mt-2 text-xl font-semibold text-white">2</p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Landing;