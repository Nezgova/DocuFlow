import { Component } from 'react'

/** Prevents a rendering error from becoming an unexplained empty browser page. */
export default class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('DocuFlow render error', error, info) }
  render() {
    if (!this.state.error) return this.props.children
    return <main className="grid min-h-screen place-items-center bg-sand p-6"><section className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-7 text-center shadow-sm"><p className="font-mono text-xs uppercase tracking-[.14em] text-moss">DocuFlow recovery</p><h1 className="mt-3 text-2xl font-extrabold">This screen could not load.</h1><p className="mt-3 text-sm leading-6 text-ink/60">The error below identifies what needs fixing.</p><pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-3 text-left text-xs leading-5 text-mint">{this.state.error?.message || 'Unknown rendering error'}</pre><button onClick={() => { localStorage.removeItem('docuflow_token'); window.location.assign('/login') }} className="mt-6 rounded-xl bg-moss px-4 py-3 text-sm font-bold text-white">Reset session and sign in</button></section></main>
  }
}
