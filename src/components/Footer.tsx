import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';

const Footer = () => {
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;
  const socialLinks = settings?.social_links || {};

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {settings?.footer_logo ? (
                <img src={settings.footer_logo} alt={settings.title} className="h-8 w-auto" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark" />
              )}
              <span className="text-xl font-bold">{settings?.title || 'ShopHub'}</span>
            </div>
            <div 
              className="text-sm text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: settings?.description || 'Your one-stop destination for quality products at the best prices.' 
              }}
            />
            <div className="flex gap-2">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Facebook className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Youtube className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/deals" className="text-muted-foreground hover:text-primary transition-colors">Deals</Link></li>
              <li><Link to="/new-arrivals" className="text-muted-foreground hover:text-primary transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/return-policy" className="text-muted-foreground hover:text-primary transition-colors">Return Policy</Link></li>
              <li><Link to="/shipping-policy" className="text-muted-foreground hover:text-primary transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers and updates.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Your email" type="email" className="bg-background" />
              <Button size="icon" className="shrink-0">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {settings?.business_name || settings?.title || 'ShopHub'}. All rights reserved.
              </p>
              {(settings?.email || settings?.contact_number) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {settings.email && <span>Email: {settings.email}</span>}
                  {settings.email && settings.contact_number && <span className="mx-2">|</span>}
                  {settings.contact_number && <span>Phone: {settings.contact_number}</span>}
                </p>
              )}
              {settings?.address && (
                <p className="text-sm text-muted-foreground mt-1">{settings.address}</p>
              )}
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/return-policy" className="hover:text-primary transition-colors">Return Policy</Link>
              <Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
