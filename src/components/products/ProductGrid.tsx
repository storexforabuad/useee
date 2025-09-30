import { memo, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Grid2X2, LayoutList, Info, Phone, MessageCircle, Star, Clock, X, MapPin, User } from 'lucide-react';
import { Product } from '../../types/product';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getStoreMeta } from '../../lib/db';
import { StoreMeta } from '../../types/store';
import { useUser } from '../../hooks/useUser';

const ProductCard = dynamic(() => import('./ProductCard'), {
  loading: () => (
    <div className="animate-pulse bg-card-background rounded-2xl h-[280px]">
      <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  ),
  ssr: false
});

const DUMMY_BUSINESS = {
  ceo: {
  name: 'Haj. Fatimah I. Goni',
  image: '/images/ceo-profile-northern-nigeria.jpg',
},
  businessName: 'Alaniq INT.',
  phone: '+2349021067212',
  whatsapp: '+2349021067212',
  address: 'No. 2, Garki Plaza, Ahmadu Bello Way, Abuja',
  hasPhysicalStore: true,
  rating: 4.8,
  reviews: 476,
  certified: true,
  years: 4,
  delivery: 'Nationwide Delivery',
  country: 'Nigeria',
  countryFlag: '🇳🇬',
  businessHours: 'Open 24/7',
  responseTime: 'Usually responds within 1 hour',
  instagram: '@al_aniq_int',
  facebook: 'Alaniq INT. ',
  specialization: 'Premium Turanrenwuta, Khumras, Oil Perfumes & RTW'
};

function GlassButton({ onClick, children, 'aria-label': ariaLabel, text }: { onClick: () => void; children?: ReactNode; 'aria-label': string; text?: string }) {
  const paddingClass = text ? 'px-4 py-3' : 'p-3';
  return (
    <motion.button
      className={`rounded-full flex items-center justify-center gap-2 glassmorphic shadow-lg border border-white/30 dark:border-slate-700/40 backdrop-blur-md bg-white/20 dark:bg-slate-900/30 hover:bg-white/30 dark:hover:bg-slate-800/40 ${paddingClass}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel}
    >
      {children}
      {text && <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{text}</span>}
    </motion.button>
  );
}

function BusinessCardModal({ open, onClose, storeMeta }: { open: boolean; onClose: () => void; storeMeta?: StoreMeta }) {
  const b = { ...DUMMY_BUSINESS, ...storeMeta };
  
  useEffect(() => {
    if (!open) return;
    
    const handlePopState = () => {
      onClose();
    };
    
    window.history.pushState({ modalOpen: true }, '');
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [open, onClose]);
  
  const fullAddress = [b.shopNumber, b.plazaBuildingName, b.streetAddress, b.state, b.country].filter(Boolean).join(', ');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex flex-col max-h-[90vh]"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-2 right-2 z-10">
              <motion.button
                className="bg-gray-500/50 hover:bg-gray-600/60 rounded-full p-2"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            <div className="flex-grow overflow-y-auto">
              <div className="p-6 pt-8 text-center">
                
                {b.ceoImage && (
                  <Image
                    src={b.ceoImage}
                    alt={b.ceoName || 'CEO'}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-slate-700 mx-auto mb-4"
                  />
                )}

                {b.businessDescription && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{b.businessDescription}</p>
                )}

                {b.ceoName && (
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{b.ceoName}</h2>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">CEO, {b.name}</p>

                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(4.8 stars from 476 reviews)</span>
                </div>
              </div>

              <div className="px-4 pb-6 space-y-3">
                {b.hasPhysicalShop && fullAddress && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{fullAddress}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                  <Clock className="w-5 h-5 text-slate-600 dark:text-slate-300 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">Open 24/7</span>
                </div>

                {b.businessInstagram && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-lg">
                     <div className="w-5 h-5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">IG</span>
                      </div>
                    <span className="text-sm text-slate-700 dark:text-slate-200">{b.businessInstagram}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="grid grid-cols-2 gap-3">
                <motion.a
                  href={`tel:${b.whatsapp?.replace(/\s/g, '')}`}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-xl shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call</span>
                </motion.a>

                <motion.a
                  href={`https://wa.me/${b.whatsapp?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">WhatsApp</span>
                </motion.a>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


const EmptyCategory = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] py-12 px-4 text-center select-none">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 180 }}
      className="mb-4"
    >
      <span className="block text-6xl sm:text-7xl mb-2 drop-shadow-lg">
        🛒
      </span>
    </motion.div>
    <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-100 mb-2">
      All items sold out!
    </h2>
    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
      Please check back soon or explore other collections for amazing products!
    </p>
  </div>
);

interface ProductGridProps {
  products: Product[];
  containerRef?: React.Ref<HTMLDivElement>;
  storeId: string;
}

const ProductGrid = memo(function ProductGrid({ products, containerRef, storeId }: ProductGridProps) {
  const router = useRouter();
  const { userId } = useUser();
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [storeMeta, setStoreMeta] = useState<StoreMeta | null>(null);

  useEffect(() => {
    async function fetchStoreMeta() {
      if (!storeId) return;
      const meta = await getStoreMeta(storeId);
      setStoreMeta(meta);
    }
    fetchStoreMeta();
  }, [storeId]);

  const validProducts = products.filter(p => p && p.id && Array.isArray(p.images));

  const sortedProducts = [...validProducts].sort((a, b) => {
    const timestampA = a.createdAt?.toMillis?.() || 0;
    const timestampB = b.createdAt?.toMillis?.() || 0;
    return timestampB - timestampA;
  });

  const transition = {
    type: "spring",
    stiffness: 280,
    damping: 25,
    mass: 0.5,
    duration: 0.3
  };

  return (
    <LayoutGroup>
      <div className="sm:hidden fixed bottom-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <GlassButton
            onClick={() => setIsSingleColumn(!isSingleColumn)}
            aria-label="Toggle grid layout"
            text={isSingleColumn ? 'Double' : 'Single'}
          />
          <GlassButton
            onClick={() => router.push(`/dashboard/${storeId}/${userId}`)}
            aria-label="Customer activity"
          >
            <User className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </GlassButton>
          <GlassButton
            onClick={() => setAboutOpen(true)}
            aria-label="About this business"
          >
            <Info className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </GlassButton>
        </div>
      </div>
      
      <BusinessCardModal open={aboutOpen} onClose={() => setAboutOpen(false)} storeMeta={storeMeta || undefined} />
      
      <motion.div
        ref={containerRef}
        className={`mt-4 grid gap-3
          ${isSingleColumn ? 'grid-cols-1' : 'grid-cols-2'} 
          sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 
          px-3 sm:px-6 lg:px-8 bg-background`}
        layout
        transition={transition}
      >
        {sortedProducts.length === 0 ? (
          <div className="col-span-full w-full">
            <EmptyCategory />
          </div>
        ) : (
          sortedProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              transition={transition}
              className="group block relative touch-manipulation"
            >
              <ProductCard product={product} storeId={storeId} />
            </motion.div>
          ))
        )}
      </motion.div>
    </LayoutGroup>
  );
});

export default ProductGrid;
