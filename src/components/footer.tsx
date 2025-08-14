
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-primary/90 text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-bold mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">New Arrivals</Link></li>
              <li><Link href="/shop/category/Apparel" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Apparel</Link></li>
              <li><Link href="/shop/category/Accessories" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Accessories</Link></li>
              <li><Link href="/shop" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 uppercase tracking-wider">About</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Our Story</Link></li>
              <li><Link href="#" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Careers</Link></li>
              <li><Link href="#" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Contact Us</Link></li>
              <li><Link href="/help" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">FAQ</Link></li>
              <li><Link href="#" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Shipping</Link></li>
              <li><Link href="#" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Terms of Service</Link></li>
              <li><Link href="#" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-primary-foreground/20 text-xs opacity-60">
          <p>&copy; {new Date().getFullYear()} NoirCart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
