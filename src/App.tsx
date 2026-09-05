import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { SiteContentProvider } from '@/contexts/SiteContentContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import api from '@/api/client';

// Layout
import TopBar from '@/components/layout/topbar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ScrollToTop from '@/components/layout/scroll-to-top';
import CategoryBar from '@/components/sections/category-bar';

// Core Pages (Always present)
const Home = lazy(() => import('@/pages/home'));
const Login = lazy(() => import('@/pages/login'));
const Registration = lazy(() => import('@/pages/registration'));
const NotFound = lazy(() => import('@/pages/not-found'));
const AdminRoutes = lazy(() => import('@/admin/AdminRoutes'));
const PaymentPolicy = lazy(() => import('@/pages/payment-policy'));
const OrderRejection = lazy(() => import('@/pages/order-rejection'));
const ReplacementReturn = lazy(() => import('@/pages/replacement-return'));
const BlogPost = lazy(() => import('@/pages/blog-post'));
const CaseStudyDetail = lazy(() => import('@/pages/case-study-detail'));
const CampusDesignService = lazy(() => import('@/pages/campus-design-service'));
const HomeFeatureDetail = lazy(() => import('@/pages/home-feature-detail'));
const SmartClassrooms = lazy(() => import('@/pages/smart-classrooms'));

// Existing page templates map
const PageTemplates: Record<string, any> = {
  'ai-digital-design-supply': lazy(() => import('@/pages/ai-digital-design-supply')),
  'ai-guide': lazy(() => import('@/pages/ai-guide')),
  'ai-ml': lazy(() => import('@/pages/ai-ml')),
  'ai-ml/products': lazy(() => import('@/pages/ai-ml-products')),
  'ai-stations': lazy(() => import('@/pages/ai-stations')),
  'assessment-system': lazy(() => import('@/pages/assessment-system')),
  'blog': lazy(() => import('@/pages/blog')),
  'ar-vr-experiences': lazy(() => import('@/pages/ar-vr-experiences')),
  'campus-automation': lazy(() => import('@/pages/campus-automation')),
  'campus-design-execution': lazy(() => import('@/pages/campus-design-execution')),
  'campus-master-planning': lazy(() => import('@/pages/campus-master-planning')),
  'campus-furniture-design': lazy(() => import('@/pages/campus-furniture-design')),
  'campus-design': lazy(() => import('@/pages/campus-design')),
  'catalogues': lazy(() => import('@/pages/catalogues')),
  'classifieds': lazy(() => import('@/pages/classifieds')),
  'colleges-universities-for-sale': lazy(() => import('@/pages/colleges-universities-for-sale')),
  'collaboration': lazy(() => import('@/pages/collaboration')),
  'contact-us': lazy(() => import('@/pages/contact-us')),
  'about-us': lazy(() => import('@/pages/corporate')),
  'corporate': lazy(() => import('@/pages/corporate')),
  'digital-transformation': lazy(() => import('@/pages/digital-transformation')),
  'furniture-design-supply': lazy(() => import('@/pages/furniture-design-supply')),
  'furniture': lazy(() => import('@/pages/furniture')),
  'innovation-centres': lazy(() => import('@/pages/innovation-centres')),
  'innovation-centers': lazy(() => import('@/pages/innovation-centers')),
  'innovation': lazy(() => import('@/pages/innovation')),
  'science-tech-labs': lazy(() => import('@/pages/science-tech-labs')),
  'job-openings': lazy(() => import('@/pages/job-openings')),
  'labs': lazy(() => import('@/pages/labs')),
  'labs/products': lazy(() => import('@/pages/lab-products')),
  'libraries': lazy(() => import('@/pages/libraries')),
  'libraries/products': lazy(() => import('@/pages/library-products')),
  'library-management': lazy(() => import('@/pages/library-management')),
  'lms': lazy(() => import('@/pages/lms')),
  'lookbook': lazy(() => import('@/pages/lookbook')),
  'my-account': lazy(() => import('@/pages/my-account')),
  'new-environments': lazy(() => import('@/pages/new-environments')),
  'partnership': lazy(() => import('@/pages/partnership')),
  'partner-with-colleges': lazy(() => import('@/pages/partner-with-colleges')),
  'payment-policy': PaymentPolicy,
  'order-rejection': OrderRejection,
  'replacement-return': ReplacementReturn,
  'privacy-policy': lazy(() => import('@/pages/privacy-policy')),
  'product-catalog': lazy(() => import('@/pages/product-catalog')),
  'request-quote': lazy(() => import('@/pages/request-quote')),
  'setup-college': lazy(() => import('@/pages/setup-college')),
  'shop': lazy(() => import('@/pages/shop')),
  'sports-design-execution': lazy(() => import('@/pages/sports-design-execution')),
  'sports-infra': lazy(() => import('@/pages/sports-infra')),
  'sports-infrastructure': lazy(() => import('@/pages/sports-infrastructure')),
  'sports-infra/products': lazy(() => import('@/pages/sports-products')),
  'tech-infra': lazy(() => import('@/pages/tech-infra')),
  'tech-infra/products': lazy(() => import('@/pages/tech-infra-products')),
  'terms-of-use': lazy(() => import('@/pages/terms-of-use')),
  'ugc-guidelines': lazy(() => import('@/pages/ugc-guidelines')),
  'services': lazy(() => import('@/pages/services')),
  'solutions': lazy(() => import('@/pages/solutions')),
};

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/registration'].includes(location.pathname);

  return (
    <div className={`min-h-screen flex flex-col ${isAuthPage ? 'auth-page-shell' : ''}`}>
      <TopBar />
      <Header />
      <CategoryBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const DynamicPageRoute = () => {
  const { slug } = useParams();
  const [pageStatus, setPageStatus] = useState<number>(0);
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPage = async () => {
      try {
        const { data } = await api.get(`/pages/${slug}`);
        if (!data.published) {
          setPageStatus(404);
        } else {
          setTemplateId(data.template);
          setPageStatus(200);
        }
      } catch (err: any) {
        setPageStatus(err.response?.status === 404 ? 404 : 500);
      }
    };
    verifyPage();
  }, [slug]);

  if (pageStatus === 0) return <PageLoader />;
  if (pageStatus === 404) return <NotFound />;

  // Resolve existing template component if specified
  if (templateId && PageTemplates[templateId]) {
    const Component = PageTemplates[templateId];
    return <Component />;
  }

  // Default: Return basic HTML fallback if no template
  return (
    <div className="p-8 text-center text-gray-500">
      <h1>Dynamic CMS Page</h1>
      <p className="max-w-xl mx-auto mt-4">This page exists in the published database, but the HTML body renderer has not yet been implemented for pages without `.tsx` templates.</p>
    </div>
  );
};

const ProductDetail = lazy(() => import('@/pages/product-detail'));
const PartnershipModelDetail = lazy(() => import('@/pages/partnership-model-detail'));
const CampusDesignExecutionDetail = lazy(() => import('@/pages/campus-design-execution-detail'));
const CollaborationDetail = lazy(() => import('@/pages/collaboration-detail'));
const InnovationDetail = lazy(() => import('@/pages/innovation-detail'));
const AiMlDetail = lazy(() => import('@/pages/ai-ml-detail'));
const LibraryManagementDetail = lazy(() => import('@/pages/library-management-detail'));
const InnovationCentersDetail = lazy(() => import('@/pages/innovation-centers-detail'));
const ScienceTechLabsDetail = lazy(() => import('@/pages/science-tech-labs-detail'));
const CampusMasterPlanningDetail = lazy(() => import('@/pages/campus-master-planning-detail'));
const ArVrExperiencesDetail = lazy(() => import('@/pages/ar-vr-experiences-detail'));
const CampusFurnitureDesignDetail = lazy(() => import('@/pages/campus-furniture-design-detail'));
const SportsInfrastructureDetail = lazy(() => import('@/pages/sports-infrastructure-detail'));
const AiStationsDetail = lazy(() => import('@/pages/ai-stations-detail'));

function App() {
  return (
    <SiteContentProvider>
      <WishlistProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Core Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/register" element={<Layout><Registration /></Layout>} />
              <Route path="/registration" element={<Layout><Registration /></Layout>} />
              <Route path="/product/:slug" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
              <Route path="/case-studies/:slug" element={<Layout><CaseStudyDetail /></Layout>} />
              <Route path="/partner-with-colleges/:modelSlug" element={<Layout><PartnershipModelDetail /></Layout>} />
              <Route path="/campus-design-execution/:stepSlug" element={<Layout><CampusDesignExecutionDetail /></Layout>} />
              <Route path="/collaboration/:itemSlug" element={<Layout><CollaborationDetail /></Layout>} />
              <Route path="/innovation/:trackSlug" element={<Layout><InnovationDetail /></Layout>} />
              <Route path="/ai-ml/:moduleSlug" element={<Layout><AiMlDetail /></Layout>} />
              <Route path="/library-management/:moduleSlug" element={<Layout><LibraryManagementDetail /></Layout>} />
              <Route path="/innovation-centers/:spaceSlug" element={<Layout><InnovationCentersDetail /></Layout>} />
              <Route path="/science-tech-labs/:labSlug" element={<Layout><ScienceTechLabsDetail /></Layout>} />
              <Route path="/campus-master-planning/:serviceSlug" element={<Layout><CampusMasterPlanningDetail /></Layout>} />
              <Route path="/ar-vr-experiences/:experienceSlug" element={<Layout><ArVrExperiencesDetail /></Layout>} />
              <Route path="/campus-furniture-design/:rangeSlug" element={<Layout><CampusFurnitureDesignDetail /></Layout>} />
              <Route path="/sports-infrastructure/:facilitySlug" element={<Layout><SportsInfrastructureDetail /></Layout>} />
              <Route path="/ai-stations/:stationSlug" element={<Layout><AiStationsDetail /></Layout>} />
              <Route path="/campus-design/:serviceSlug" element={<Layout><CampusDesignService /></Layout>} />
              <Route path="/smart-classrooms" element={<Layout><SmartClassrooms /></Layout>} />
              <Route path="/ar-vr-learning" element={<Layout><HomeFeatureDetail /></Layout>} />
              <Route path="/admin/*" element={<AdminRoutes />} />

              {/* Static pages explicitly mapped so they always work */}
              {Object.keys(PageTemplates).map((path) => {
                const Component = PageTemplates[path];
                return <Route key={path} path={`/${path}`} element={<Layout><Component /></Layout>} />
              })}

              {/* Dynamic Catch-All Route matching DB Pages (fallback) */}
              <Route path="/:slug" element={<Layout><DynamicPageRoute /></Layout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </WishlistProvider>
    </SiteContentProvider>
  );
}

export default App;
