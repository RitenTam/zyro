export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-card py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <div className="font-bold text-base">Zyro</div>
          <p className="text-sm text-foreground/60 max-w-xs">
            Premium phone cases built to last.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Shop</h3>
          <ul className="space-y-2 text-sm text-foreground/60">
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                All Cases
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                By Material
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                Sale
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Support</h3>
          <ul className="space-y-2 text-sm text-foreground/60">
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                Shipping
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Connect</h3>
          <ul className="space-y-2 text-sm text-foreground/60">
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-foreground/40 gap-4">
        <div>© {currentYear} Zyro</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground/60 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground/60 transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}