import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';

const SearchBar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.8 });

      tl.fromTo(
        containerRef.current,
        { scaleX: 0, transformOrigin: 'center' },
        { scaleX: 1, duration: 0.7, ease: 'power3.out' }
      )
        .fromTo(
          inputRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo(
          buttonRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' },
          '-=0.2'
        );
    });

    return () => ctx.revert();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchMessage('Please enter something to search.');
      return;
    }

    setSearching(true);
    setSearchMessage('');
    const normalizedQuery = query.toLowerCase();
    const pageRoutes = [
      { terms: ['furniture', 'classroom desk', 'office furniture', 'hostel furniture'], route: '/furniture' },
      { terms: ['sports', 'sports infra', 'basketball', 'football', 'athletics'], route: '/sports-infra' },
      { terms: ['lab', 'laboratory', 'stem'], route: '/labs' },
      { terms: ['library', 'libraries', 'bookshelf'], route: '/libraries' },
      { terms: ['technology', 'tech infra', 'interactive board', 'school management'], route: '/tech-infra' },
      { terms: ['ai', 'machine learning', 'ai station'], route: '/ai-ml' },
      { terms: ['campus design', 'architecture', 'master planning'], route: '/campus-design' },
      { terms: ['career', 'job', 'vacancy', 'openings', 'resume', 'hiring'], route: '/job-openings' },
      { terms: ['partnership', 'partner', 'vendor', 'collab'], route: '/partnership' },
      { terms: ['resource', 'guide', 'handbook', 'guideline'], route: '/resources' },
      { terms: ['catalog', 'catalogue', 'brochure', 'pdf download'], route: '/catalogues' },
    ];
    const matchingPage = pageRoutes.find(({ terms }) => terms.some((term) => normalizedQuery.includes(term)));

    if (matchingPage) {
      navigate(matchingPage.route);
      setSearching(false);
      return;
    }

    try {
      const { data } = await api.get('/products', { params: { search: query, limit: '50' } });
      if (data.products?.length > 0) {
        navigate(`/shop?search=${encodeURIComponent(query)}`);
      } else {
        setSearchMessage(`I couldn't find information for "${query}". Try furniture, sports, labs, libraries, or a product name.`);
      }
    } catch {
      setSearchMessage('Search is temporarily unavailable. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-cm-yellow py-3 px-4 shadow-inner">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search: I need a design for an AI STATION"
            className="search-input pr-16 h-10 text-base border-2 border-black/5 focus:border-cm-blue/30 shadow-lg group-hover:shadow-xl transition-shadow"
          />
          <button
            ref={buttonRef}
            type="submit"
            disabled={searching}
            className="search-button w-10 h-10 right-0"
            aria-label="Search"
          >
            <Search className={`w-5 h-5 ${searching ? 'animate-pulse' : ''}`} />
          </button>
        </form>
        {searchMessage && (
          <p role="status" className="mt-2 rounded-lg bg-white/90 px-3 py-2 text-center text-sm text-cm-blue-dark shadow-sm">
            {searchMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
