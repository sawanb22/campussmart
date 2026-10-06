import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
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
import BreadcrumbBar from '@/components/layout/breadcrumb-bar';

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
const AIGuideArticle = lazy(() => import('@/pages/ai-guide-article'));
const SetupCollegeArticle = lazy(() => import('@/pages/setup-college-article'));
const UGCGuidelineArticle = lazy(() => import('@/pages/ugc-guideline-article'));
const GenericPageRenderer = lazy(() => import('@/components/cms/GenericPageRenderer'));

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
  'collaboration-spaces': lazy(() => import('@/pages/collaboration-spaces')),
  'contact-us': lazy(() => import('@/pages/contact-us')),
  'about-us': lazy(() => import('@/pages/corporate')),
  'digital-transformation': lazy(() => import('@/pages/digital-transformation')),
  'furniture-design-supply': lazy(() => import('@/pages/furniture-design-supply')),
  'furniture': lazy(() => import('@/pages/furniture')),
  'innovation-centres': lazy(() => import('@/pages/innovation-centres')),
  'innovation-centers': lazy(() => import('@/pages/innovation-centers')),
  'innovation': lazy(() => import('@/pages/innovation')),
  'science-tech-labs': lazy(() => import('@/pages/science-tech-labs')),
  'job-openings': lazy(() => import('@/pages/job-openings')),
  'labs': lazy(() => import('@/pages/labs')),
  'lab-products': lazy(() => import('@/pages/lab-products')),
  'labs/products': lazy(() => import('@/pages/lab-products')),
  'libraries': lazy(() => import('@/pages/libraries')),
  'library-products': lazy(() => import('@/pages/library-products')),
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
  'resources': lazy(() => import('@/pages/resources')),
  'setup-college': lazy(() => import('@/pages/setup-college')),
  'shop': lazy(() => import('@/pages/shop')),
  'sports-design-execution': lazy(() => import('@/pages/sports-design-execution')),
  'sports-infra': lazy(() => import('@/pages/sports-infra')),
  'sports-infrastructure': lazy(() => import('@/pages/sports-infrastructure')),
  'sports-products': lazy(() => import('@/pages/sports-products')),
  'sports-infra/products': lazy(() => import('@/pages/sports-products')),
  'tech-infra': lazy(() => import('@/pages/tech-infra')),
  'terms-of-use': lazy(() => import('@/pages/terms-of-use')),
  'ugc-guidelines': lazy(() => import('@/pages/ugc-guidelines')),
  'services': lazy(() => import('@/pages/services')),
  'solutions': lazy(() => import('@/pages/solutions')),
  'smart-classrooms': SmartClassrooms,
  'home': Home,
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
      <BreadcrumbBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const DynamicPageRoute = () => {
  const { slug } = useParams();
  const [pageStatus, setPageStatus] = useState<number>(0);
  const [pageRecord, setPageRecord] = useState<any>(null);

  useEffect(() => {
    const verifyPage = async () => {
      try {
        const { data } = await api.get(`/pages/${slug}`);
        if (!data.published) {
          setPageStatus(404);
        } else {
          setPageRecord(data);
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

  const templateId = pageRecord?.template;

  // Resolve existing template component if specified (with alias normalization)
  const resolvedTemplate = templateId
    ? (PageTemplates[templateId]
       || (templateId === 'lab-products' ? PageTemplates['labs/products'] : null)
       || (templateId === 'library-products' ? PageTemplates['libraries/products'] : null)
       || (templateId === 'sports-products' ? PageTemplates['sports-infra/products'] : null)
       || (templateId === 'tech-infra-products' ? PageTemplates['tech-infra'] : null)
       || (templateId === 'home' || slug === 'home' ? Home : null))
    : null;

  if (resolvedTemplate) {
    const Component = resolvedTemplate;
    return <Component />;
  }

  // Gracefully render dynamic CMS page content using GenericPageRenderer (SOLID SRP fallback)
  let parsedPageData = {};
  try {
    parsedPageData = pageRecord?.pageData ? JSON.parse(pageRecord.pageData) : {};
  } catch {
    parsedPageData = {};
  }

  return <GenericPageRenderer page={pageRecord} pageData={parsedPageData} />;
};

const ProductDetail = lazy(() => import('@/pages/product-detail'));
const PartnershipModelDetail = lazy(() => import('@/pages/partnership-model-detail'));
const CollaborationDetail = lazy(() => import('@/pages/collaboration-detail'));
const InnovationDetail = lazy(() => import('@/pages/innovation-detail'));
const AiMlDetail = lazy(() => import('@/pages/ai-ml-detail'));
const LibraryManagementDetail = lazy(() => import('@/pages/library-management-detail'));
const InnovationCentersDetail = lazy(() => import('@/pages/innovation-centers-detail'));
const InnovationCentresDetail = lazy(() => import('@/pages/innovation-centres-detail'));
const ScienceTechLabsDetail = lazy(() => import('@/pages/science-tech-labs-detail'));
const CampusMasterPlanningDetail = lazy(() => import('@/pages/campus-master-planning-detail'));
const ArVrExperiencesDetail = lazy(() => import('@/pages/ar-vr-experiences-detail'));
const CampusFurnitureDesignDetail = lazy(() => import('@/pages/campus-furniture-design-detail'));
const FurnitureDesignSupplyDetail = lazy(() => import('@/pages/furniture-design-supply-detail'));
const CampusDesignExecutionDetail = lazy(() => import('@/pages/campus-design-execution-detail'));
const AiDigitalDesignSupplyDetail = lazy(() => import('@/pages/ai-digital-design-supply-detail'));
const CollaborationSpacesDetail = lazy(() => import('@/pages/collaboration-spaces-detail'));
const SportsInfrastructureDetail = lazy(() => import('@/pages/sports-infrastructure-detail'));
const AiStationsDetail = lazy(() => import('@/pages/ai-stations-detail'));
const DigitalTransformationDetail = lazy(() => import('@/pages/digital-transformation-detail'));
const NewEnvironmentsDetail = lazy(() => import('@/pages/new-environments-detail'));
const SportsInfraDetail = lazy(() => import('@/pages/sports-infra-detail'));
const TechInfraDetail = lazy(() => import('@/pages/tech-infra-detail'));
const LabsDetail = lazy(() => import('@/pages/labs-detail'));
const LibrariesDetail = lazy(() => import('@/pages/libraries-detail'));
const CampusAutomationDetail = lazy(() => import('@/pages/campus-automation-detail'));

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
              <Route path="/innovation-centres/:spaceSlug" element={<Layout><InnovationCentresDetail /></Layout>} />
              <Route path="/science-tech-labs/:labSlug" element={<Layout><ScienceTechLabsDetail /></Layout>} />
              <Route path="/campus-master-planning/:serviceSlug" element={<Layout><CampusMasterPlanningDetail /></Layout>} />
              <Route path="/ar-vr-experiences/:experienceSlug" element={<Layout><ArVrExperiencesDetail /></Layout>} />
              <Route path="/campus-furniture-design/:rangeSlug" element={<Layout><CampusFurnitureDesignDetail /></Layout>} />
              <Route path="/furniture-design-supply/:solutionSlug" element={<Layout><FurnitureDesignSupplyDetail /></Layout>} />
              <Route path="/ai-digital-design-supply/:solutionSlug" element={<Layout><AiDigitalDesignSupplyDetail /></Layout>} />
              <Route path="/collaboration-spaces/:spaceSlug" element={<Layout><CollaborationSpacesDetail /></Layout>} />
              <Route path="/sports-infrastructure/:facilitySlug" element={<Layout><SportsInfrastructureDetail /></Layout>} />
              <Route path="/ai-stations/:stationSlug" element={<Layout><AiStationsDetail /></Layout>} />
              <Route path="/digital-transformation/:cardSlug" element={<Layout><DigitalTransformationDetail /></Layout>} />
              <Route path="/new-environments/:spaceSlug" element={<Layout><NewEnvironmentsDetail /></Layout>} />
              <Route path="/sports-infra/:facilitySlug" element={<Layout><SportsInfraDetail /></Layout>} />
              <Route path="/tech-infra/:solutionSlug" element={<Layout><TechInfraDetail /></Layout>} />
              <Route path="/labs/:labSlug" element={<Layout><LabsDetail /></Layout>} />
              <Route path="/libraries/:featureSlug" element={<Layout><LibrariesDetail /></Layout>} />
              <Route path="/campus-automation/:moduleSlug" element={<Layout><CampusAutomationDetail /></Layout>} />
              <Route path="/campus-design/:serviceSlug" element={<Layout><CampusDesignService /></Layout>} />
              <Route path="/smart-classrooms" element={<Layout><SmartClassrooms /></Layout>} />
              <Route path="/ai-guide/:articleSlug" element={<Layout><AIGuideArticle /></Layout>} />
              <Route path="/setup-college/:articleSlug" element={<Layout><SetupCollegeArticle /></Layout>} />
              <Route path="/ugc-guidelines/:articleSlug" element={<Layout><UGCGuidelineArticle /></Layout>} />
              <Route path="/ar-vr-learning" element={<Layout><HomeFeatureDetail /></Layout>} />
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/wishlist" element={<Navigate to="/my-account?tab=wishlist" replace />} />
              <Route path="/cart" element={<Navigate to="/my-account?tab=wishlist" replace />} />
              <Route path="/corporate" element={<Navigate to="/about-us" replace />} />
              <Route path="/tech-infra/products" element={<Navigate to="/tech-infra" replace />} />

              {/* Static pages explicitly mapped so they always work */}
              {Object.keys(PageTemplates).map((path) => {
                const Component = PageTemplates[path];
                return <Route key={path} path={`/${path}`} element={<Layout><Component /></Layout>} />
              })}

              {/* Dynamic Catch-All Route matching DB Pages (fallback) */}
              <Route path="/:slug" element={<Layout><DynamicPageRoute /></Layout>} />

              {/* Global Wildcard Catch-All for Multi-Segment Unmatched Routes */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </WishlistProvider>
    </SiteContentProvider>
  );
}

export default App;
