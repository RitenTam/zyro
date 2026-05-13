export function Footer() {
  return (
    <footer className="py-20 px-6 sm:px-8 border-t border-white/5 bg-onyx">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6 col-span-1 md:col-span-2">
          <div className="text-2xl font-bold tracking-tighter uppercase">Aether</div>
          <p className="text-foreground/40 text-xs max-w-xs leading-relaxed">
            Architectural protection for the modern lifestyle. Engineering excellence for your most essential tools.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="pt-4 max-w-xs"
          >
            <div className="flex border-b border-white/10 pb-2">
              <input
                type="email"
                placeholder="JOIN THE LIST"
                className="bg-transparent text-[10px] uppercase tracking-widest outline-none w-full placeholder:text-foreground/20"
              />
              <button className="text-[10px] uppercase tracking-widest font-bold px-4 hover:text-foreground/60 transition-colors">
                Subscribe
              </button>
            </div>
          </form>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Support</h4>
          <ul className="text-xs space-y-3 text-foreground/60">
            <li><a href="#" className="hover:text-foreground transition-colors">Shipping</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Returns</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Warranty</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Connect</h4>
          <ul className="text-xs space-y-3 text-foreground/60">
            <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Journal</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-20 flex flex-col sm:flex-row gap-4 justify-between items-center text-[9px] uppercase tracking-widest text-foreground/20">
        <div>© {new Date().getFullYear()} Aether Studio</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-foreground/60 transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground/60 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}