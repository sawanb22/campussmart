import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Youtube, Instagram, Linkedin } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';

const DEFAULT_SOCIAL_URLS: Record<string, string> = {
  social_facebook: 'https://www.facebook.com/campusmart.in/',
  social_twitter: 'https://x.com/campusmartindia',
  social_youtube: 'https://www.youtube.com/@campusmartindia',
  social_instagram: 'https://www.instagram.com/campusmart.in/',
  social_linkedin: 'https://www.linkedin.com/company/campusmart/',
  social_pinterest: 'https://in.pinterest.com/campusmartindia/',
};

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const { content } = useSiteContent();

  const resolveSocialUrl = (key: string) => (key in content ? content[key] : DEFAULT_SOCIAL_URLS[key]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Footer wipe up (plays on mount rather than being scroll-gated, so a short
      // page never leaves the footer permanently clipped if the scroll trigger's
      // start position ends up past the page's actual max scroll)
      gsap.fromTo(
        footerRef.current,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.8,
          ease: 'power3.out',
        }
      );

      // Columns fade up
      const columns = columnsRef.current?.children;
      if (columns) {
        gsap.fromTo(
          columns,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.2,
            ease: 'power3.out',
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const aboutLinks = [
    { label: 'How it works', href: '/corporate' },
    { label: 'Brand Help', href: '/corporate' },
    { label: 'Sell on campusmart', href: '/partnership' },
  ];

  const businessLinks = [
    { label: 'About Us', href: '/about-us' },
    { label: 'Careers & Job Openings', href: '/job-openings' },
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'Report Issue', href: '/contact-us' },
    { label: 'Blog', href: '/blog' },
    { label: 'Delivery Locations', href: '/contact-us' },
  ];

  const categories = [
    { title: 'Furniture', items: [
      { label: 'Primary & High School', href: '/furniture' },
      { label: 'Kindergarten', href: '/furniture' },
      { label: 'Office Furniture', href: '/furniture' },
      { label: 'Hostel Furniture', href: '/furniture' },
      { label: 'Premium Furniture', href: '/furniture' },
    ]},
    { title: 'Labs & Libraries', items: [
      { label: 'Chemistry Labs', href: '/labs' },
      { label: 'Biology Lab', href: '/labs' },
      { label: 'STEM Labs', href: '/labs' },
      { label: 'Computer Labs', href: '/labs' },
      { label: 'Library', href: '/libraries' },
    ]},
    { title: 'Sports', items: [
      { label: 'Sports Surfaces', href: '/sports-infra' },
      { label: 'Water Surfaces', href: '/sports-infra' },
    ]},
    { title: 'Technology', items: [
      { label: 'Interactive Boards', href: '/tech-infra' },
      { label: 'School Management', href: '/campus-automation' },
      { label: 'Tablets', href: '/tech-infra' },
      { label: 'COVID Ready Products', href: '/tech-infra' },
    ]},
  ];

  const brands = [
    { label: 'European Educational Group', href: '/shop' },
    { label: 'MAXHUB', href: '/shop' },
    { label: 'Nike', href: '/shop' },
    { label: 'ViewSonic', href: '/shop' },
    { label: 'Kidken', href: '/shop' },
    { label: 'Little Tikes', href: '/shop' },
    { label: 'ButterflyFields', href: '/shop' },
    { label: 'ALTOP', href: '/shop' },
  ];

  const trending = [
    { label: 'NEP Ready Ultra Modern Labs', href: '/labs' },
    { label: 'STEM Lab Design', href: '/labs' },
    { label: 'Futuristic School Architecture', href: '/campus-design' },
    { label: 'Digitisation of Entire Campus', href: '/digital-transformation' },
    { label: 'Smart STEM Labs Design', href: '/labs' },
    { label: 'Interactive Math Walls', href: '/tech-infra' },
    { label: 'AR/VR Content', href: '/digital-transformation' },
    { label: 'Digital Math Simulations', href: '/digital-transformation' },
  ];

  const socialLinks = [
    { icon: Facebook, key: 'social_facebook', label: 'Facebook' },
    { icon: Twitter, key: 'social_twitter', label: 'X' },
    { icon: Youtube, key: 'social_youtube', label: 'YouTube' },
    { icon: Instagram, key: 'social_instagram', label: 'Instagram' },
    { icon: Linkedin, key: 'social_linkedin', label: 'LinkedIn' },
    {
      icon: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.135-2.607 7.462-6.225 7.462-1.214 0-2.354-.63-2.744-1.37l-.749 2.848c-.27 1.031-1.002 2.324-1.492 3.125 1.063.329 2.186.505 3.355.505 6.619 0 11.988-5.37 11.988-11.987C23.991 5.385 18.636 0 12.017 0z"/>
        </svg>
      ),
      key: 'social_pinterest',
      label: 'Pinterest',
    },
  ]
    .map((social) => ({ ...social, href: resolveSocialUrl(social.key) }))
    .filter((social) => social.href);

  return (
    <footer ref={footerRef} className="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          ref={columnsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8"
        >
          {/* About Us */}
          <div className="lg:col-span-1">
            <h3 className="footer-title">About Us</h3>
            <p className="text-gray-300 text-sm mb-4">
              <Link to="/" className="text-cm-yellow hover:underline">campusmart.in</Link> is a consortium of architects, designers, and campus innovators who strive to bring learning outcomes through the latest infrastructure and edtech.
            </p>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="footer-link text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div className="lg:col-span-1">
            <h3 className="footer-title">Business</h3>
            <ul className="space-y-2">
              {businessLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="footer-link text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h3 className="footer-title">Categories</h3>
            <div className="grid grid-cols-2 gap-4">
              {categories.map(({ title, items }) => (
                <div key={title}>
                  <h4 className="text-cm-yellow font-semibold text-sm mb-2">{title}</h4>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item.label}>
                        <Link to={item.href} className="footer-link text-xs">{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="lg:col-span-1">
            <h3 className="footer-title">Brands</h3>
            <ul className="space-y-1">
              {brands.map((brand) => (
                <li key={brand.label}>
                  <Link to={brand.href} className="footer-link text-xs">{brand.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* What's Trending */}
          <div className="lg:col-span-1">
            <h3 className="footer-title">What's Trending</h3>
            <ul className="space-y-1">
              {trending.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="footer-link text-xs">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © 2016-2025, Third Eye Retail Pvt. Ltd.
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2">
              <Link to="/replacement-return" className="text-gray-400 hover:text-cm-yellow text-sm transition-colors">
                Replacement & Return
              </Link>
              <Link to="/order-rejection" className="text-gray-400 hover:text-cm-yellow text-sm transition-colors">
                Order Rejection
              </Link>
              <Link to="/payment-policy" className="text-gray-400 hover:text-cm-yellow text-sm transition-colors">
                Payment Policy
              </Link>
              <Link to="/privacy-policy" className="text-gray-400 hover:text-cm-yellow text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-use" className="text-gray-400 hover:text-cm-yellow text-sm transition-colors">
                Terms of Use
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Keep in Touch</span>
              <div className="flex items-center gap-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-cm-yellow hover:text-cm-blue-dark hover:scale-110 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
