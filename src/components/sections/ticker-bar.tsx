

import { useSiteContent } from '../../contexts/SiteContentContext';

const TickerBar = () => {
    const { content, loading } = useSiteContent();

    if (loading) {
        return (
            <div className="w-full relative overflow-hidden flex flex-col animate-pulse" style={{ backgroundColor: '#222b5c' }}>
                <div className="w-full h-[5px]" style={{ backgroundColor: '#dca842' }} />
                <div className="relative w-full h-[40px] flex items-center px-4">
                    <div className="h-4 w-32 rounded bg-white/20" />
                    <div className="ml-8 h-4 w-64 rounded bg-white/10 hidden sm:block" />
                </div>
            </div>
        );
    }

    const rawAnnouncements: any[] = Array.isArray(content.ticker_announcements) ? content.ticker_announcements : [];
    const announcements: string[] = rawAnnouncements
        .filter((item: any) => (typeof item === 'string' ? Boolean(item.trim()) : item?.active !== false && item?.text))
        .map((item: any) => (typeof item === 'string' ? item : item.text));

    if (announcements.length === 0) {
        return null;
    }

    return (
        <div className="w-full relative overflow-hidden flex flex-col" style={{ backgroundColor: '#222b5c' }}>
            {/* Top Gold Bar */}
            <div className="w-full h-[5px]" style={{ backgroundColor: '#dca842' }} />

            {/* Container */}
            <div className="relative w-full h-[40px] flex items-stretch">

                {/* Left 'Tab' area with angled right edge */}
                <div
                    className="relative z-10 flex items-center pl-4 md:pl-6 pr-8 h-full flex-shrink-0"
                    style={{
                        backgroundColor: '#f1f2f2',
                        clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)'
                    }}
                >
                    {/* Target/Bullseye Icon similar to KT */}
                    <div className="w-4 h-4 rounded-full border-[3px] flex items-center justify-center mr-2 lg:mr-3" style={{ borderColor: '#12395b' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#12395b' }} />
                    </div>
                    <span
                        className="font-extrabold text-[12px] md:text-[14px] tracking-wide"
                        style={{ color: '#12395b', fontFamily: 'Georgia, serif' }}
                    >
                        {content.ticker_title || 'LATEST UPDATES'}
                    </span>
                </div>

                {/* Scrolling Ticker Area */}
                <div className="flex-1 overflow-hidden flex items-center relative">
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-[13px] md:text-sm font-medium" style={{ color: '#f8f9fa' }}>
                        {announcements.map((item: string, i: number) => (
                            <span key={i} className="hover:text-[#dca842] transition-colors cursor-pointer">{item}</span>
                        ))}
                        {/* Duplicate for seamless looping */}
                        {announcements.map((item: string, i: number) => (
                            <span key={`dup-${i}`} aria-hidden="true" className="hover:text-[#dca842] transition-colors cursor-pointer">{item}</span>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TickerBar;
