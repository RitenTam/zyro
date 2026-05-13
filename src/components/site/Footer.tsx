export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-background/40 py-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-12">
        <div className="space-y-4">
          <div className="font-light text-lg tracking-tight text-[#2B7FFF]">Zyro</div>
          <p className="text-sm text-foreground/40 max-w-xs font-light leading-relaxed">
            Premium phone cases. Light, strong, refined.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground/80 tracking-wider">Shop</h3>
          <ul className="space-y-3 text-sm text-foreground/50">
            <li>
              <a href="#" className="hover:text-[#2B7FFF] transition-colors duration-200 font-light">
                All Cases
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#2B7FFF] transition-colors duration-200 font-light">
                By Material
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#2B7FFF] transition-colors duration-200 font-light">
                Sale
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground/80 tracking-wider">Support</h3>
          <ul className="space-y-3 text-sm text-foreground/50">
            <li>
              <a href="#" className="hover:text-[#2B7FFF] transition-colors duration-200 font-light">
                Shipping
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#2B7FFF] transition-colors duration-200 font-light">
                Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#2B7FFF] transition-colors duration-200 font-light">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground/80 tracking-wider">Connect</h3>
          <ul className="space-y-3 text-sm text-foreground/50">
            <li>
              <a href="#" className="hover:text-[#2B7FFF] transition-colors duration-200 font-light">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#2B7FFF] transition-colors duration-200 font-light">
                Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-foreground/30 gap-4">
        <div>© {currentYear} Zyro</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground/50 transition-colors duration-200">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground/50 transition-colors duration-200">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}