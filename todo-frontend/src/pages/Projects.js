export default function Projects() {
  return (
    <div className="grid gap-6">
      <section
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm
                   dark:bg-slate-900 dark:border-slate-800"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Projects
          </h2>

          <button
            className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50
                       dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-200"
          >
            + Create project
          </button>
        </div>

        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Project list will come here.
        </p>

        <div className="mt-5 grid gap-3">
          <div
            className="border border-slate-200 rounded-xl p-4 bg-slate-50
                       dark:bg-slate-950 dark:border-slate-800"
          >
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Test project
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              3 tasks due soon
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
