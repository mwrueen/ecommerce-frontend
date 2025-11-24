import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';

const Footer = () => {
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;
  const socialLinks = settings?.social_links || {};
  const primaryColor = settings?.primary_color || '#4f46e5';
  const secondaryColor = settings?.secondary_color || '#0ea5e9';
  const accentGradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;

  return (
    <footer className="relative border-t bg-white text-slate-900">
      <div className="absolute top-0 left-0 h-1 w-full" style={{ background: accentGradient }} />
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <div className="absolute -top-16 left-8 h-48 w-48 rounded-full bg-slate-200 blur-3xl" />
        <div className="absolute bottom-0 right-12 h-40 w-40 rounded-full bg-slate-100 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.15),_transparent_60%)]" />
      </div>
      <div className="relative container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {settings?.footer_logo ? (
                <img src={settings.footer_logo} alt={settings.title} className="h-10 w-auto drop-shadow" />
              ) : (
                <div
                  className="h-10 w-10 rounded-lg shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }}
                />
              )}
              <span className="text-xl font-bold">{settings?.title || 'eCommerce'}</span>
            </div>
            <div 
              className="text-sm text-slate-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: settings?.description || 'Your one-stop destination for quality products at the best prices.' 
              }}
            />
            <div className="flex gap-2">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                    <Facebook className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                    <Youtube className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-slate-900 tracking-wide uppercase text-xs">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-slate-600 hover:text-slate-900 transition-colors">All Products</Link></li>
              <li><Link to="/categories" className="text-slate-600 hover:text-slate-900 transition-colors">Categories</Link></li>
              <li><Link to="/deals" className="text-slate-600 hover:text-slate-900 transition-colors">Deals</Link></li>
              <li><Link to="/new-arrivals" className="text-slate-600 hover:text-slate-900 transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-slate-900 tracking-wide uppercase text-xs">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="text-slate-600 hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-slate-600 hover:text-slate-900 transition-colors">Terms of Service</Link></li>
              <li><Link to="/return-policy" className="text-slate-600 hover:text-slate-900 transition-colors">Return Policy</Link></li>
              <li><Link to="/shipping-policy" className="text-slate-600 hover:text-slate-900 transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-slate-900 tracking-wide uppercase text-xs">Newsletter</h3>
            <p className="text-sm text-slate-600 mb-4">
              Subscribe to get special offers and updates.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Your email"
                type="email"
                className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300"
              />
              <Button
                size="icon"
                className="shrink-0 rounded-full text-white shadow-lg"
                style={{ background: accentGradient }}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} {settings?.business_name || settings?.title || 'eCommerce'}. All rights reserved.
              </p>
              {(settings?.email || settings?.contact_number) && (
                <p className="text-sm text-slate-500 mt-1">
                  {settings.email && <span>Email: {settings.email}</span>}
                  {settings.email && settings.contact_number && <span className="mx-2">|</span>}
                  {settings.contact_number && <span>Phone: {settings.contact_number}</span>}
                </p>
              )}
              {settings?.address && (
                <p className="text-sm text-slate-500 mt-1">{settings.address}</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
              <Link to="/privacy-policy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <Link to="/return-policy" className="hover:text-slate-900 transition-colors">Return Policy</Link>
              <Link to="/shipping-policy" className="hover:text-slate-900 transition-colors">Shipping Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
