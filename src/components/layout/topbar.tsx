import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Mail, Phone, Facebook, Twitter, Youtube, Instagram, Linkedin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { useSiteContent } from '@/contexts/SiteContentContext';

const DEFAULT_SOCIAL_URLS: Record<string, string> = {
  social_facebook: 'https://www.facebook.com/schoolmart.in/',
  social_twitter: 'https://x.com/schoolmartindia',
  social_youtube: 'https://www.youtube.com/@schoolinnovationindia',
  social_instagram: 'https://www.instagram.com/schoolmart.in/',
  social_linkedin: 'https://www.linkedin.com/school/13397648/admin/inbox/thread/2-YTIyNjJhZTMtZDRhOS00OWJmLWE2YTEtMzU2MWQ4OTc0ZTg2XzEwMA==/',
  social_pinterest: 'https://in.pinterest.com/schoolmartindia/',
};

const TopBar = () => {
  const { content } = useSiteContent();
  const resolveSocialUrl = (key: string) => (key in content ? content[key] : DEFAULT_SOCIAL_URLS[key]);
  const topBarRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const socialIconsRef = useRef<HTMLDivElement>(null);
  const authLinksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        topBarRef.current,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
        .fromTo(
          leftContentRef.current?.children || [],
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo(
          socialIconsRef.current?.children || [],
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(1.7)' },
          '-=0.2'
        )
        .fromTo(
          authLinksRef.current,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
          '-=0.3'
        );
    });

    return () => ctx.revert();
  }, []);

  const navigate = useNavigate();
  const storedUser = localStorage.getItem('cm_user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isLoggedIn = !!localStorage.getItem('cm_token') && !!currentUser;
  const userName = currentUser?.name || currentUser?.email || '';
  const { count: wishlistCount, refresh: refreshWishlist } = useWishlist();

  useEffect(() => {
    refreshWishlist();
  }, [isLoggedIn, refreshWishlist]);

  const handleLogout = () => {
    localStorage.removeItem('cm_token');
    localStorage.removeItem('cm_user');
    navigate('/');
  };

  const socialIcons = [
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
    <div ref={topBarRef} className="top-bar">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 py-1">
          {/* Left - Contact Info */}
          <div ref={leftContentRef} className="flex min-w-0 items-center gap-2 text-[10px] sm:gap-4 sm:text-sm">
            <a
              href="mailto:info@campusmart.in"
              className="flex items-center gap-1.5 text-white/90 hover:text-cm-yellow transition-colors duration-200 sm:gap-2"
            >
              <Mail className="w-3.5 h-3.5 shrink-0 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">info@campusmart.in</span>
            </a>
            <span className="hidden md:inline text-blue-300">|</span>
            <a
              href="tel:+919966109191"
              className="flex items-center gap-1.5 text-white/90 hover:text-cm-yellow transition-colors duration-200 sm:gap-2"
            >
              <Phone className="w-3.5 h-3.5 shrink-0 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">+91 9966109191</span>
            </a>
          </div>

          {/* Right - Social Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div ref={socialIconsRef} className="hidden md:flex items-center gap-2">
              {socialIcons.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-cm-yellow hover:text-cm-blue-dark hover:rotate-12 transition-all duration-200 sm:w-8 sm:h-8"
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              ))}
            </div>

            <div ref={authLinksRef} className="flex items-center gap-2 text-[10px] font-semibold sm:gap-4 sm:text-sm">
              {isLoggedIn ? (
                <>
                  <span className="hidden text-slate-100 sm:inline">Hi, {userName}</span>
                  <Link
                    to="/my-account"
                    className="hover:text-cm-yellow transition-colors duration-200 relative group"
                  >
                    MY ACCOUNT
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cm-yellow transition-all duration-300 group-hover:w-full" />
                  </Link>
                  <Link
                    to="/my-account?tab=wishlist"
                    className="hover:text-cm-yellow transition-colors duration-200 relative group inline-flex items-center gap-1.5"
                  >
                    WISHLIST
                    {wishlistCount > 0 && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cm-yellow px-1 text-[9px] font-bold text-cm-blue-dark">
                        {wishlistCount}
                      </span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cm-yellow transition-all duration-300 group-hover:w-full" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-slate-100 hover:text-cm-yellow transition-colors duration-200"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/registration"
                    className="hover:text-cm-yellow transition-colors duration-200 relative group"
                  >
                    REGISTRATION
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cm-yellow transition-all duration-300 group-hover:w-full" />
                  </Link>
                  <span className="hidden text-blue-300 sm:inline">|</span>
                  <Link
                    to="/login"
                    className="hover:text-cm-yellow transition-colors duration-200 relative group"
                  >
                    LOGIN
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cm-yellow transition-all duration-300 group-hover:w-full" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
