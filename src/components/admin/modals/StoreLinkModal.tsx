import { useState } from 'react';
import Image from 'next/image';
import Modal from '../../Modal';
import { Link2, Copy, ExternalLink, Share2, Download, QrCode, X } from 'lucide-react';

interface StoreLinkModalProps {
  storeLink: string;
  handleClose: () => void;
}

// Social Icons
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path d="M16.75 13.96c.25.13.43.2.5.28.07.08.1.18.1.28.02.1-.04.28-.08.38-.04.1-.1.18-.23.28-.13.1-.28.18-.45.25-.17.08-.38.13-.6.13-.23 0-.48-.04-.75-.13s-.5-.2-.7-.35-.38-.3-.5-.48c-.13-.18-.2-.33-.25-.45s-.08-.23-.08-.3c0-.1.03-.2.08-.28.05-.08.13-.15.23-.2s.2-.1.3-.1c.1 0 .18.03.25.08.07.05.13.1.18.15.05.05.1.1.15.18s.08.13.08.2c0 .07-.02.13-.05.18-.03.05-.08.1-.13.15-.05.05-.1.08-.18.1-.07.03-.15.04-.23.04-.08 0-.17-.02-.25-.05-.08-.03-.17-.08-.25-.13s-.15-.1-.2-.15c-.05-.05-.1-.1-.13-.15-.03-.05-.05-.1-.05-.15 0-.05.02-.1.05-.15.03-.05.08-.1.13-.15s.1-.08.17-.1c.07-.03.15-.04.23-.04.1 0 .2.02.3.05.1.03.2.08.3.15.1.07.2.15.28.25.08.1.15.2.2.3.04.1.08.2.1.3.02.1.03.2.03.28 0 .1-.02.2-.05.3-.03.1-.08.18-.13.25-.05.07-.12.13-.2.18-.08.05-.17.1-.28.13-.1.03-.2.05-.3.05-.13 0-.25-.02-.38-.07-.12-.05-.24-.1-.35-.18-.1-.08-.2-.17-.28-.25-.08-.08-.15-.18-.2-.28-.05-.1-.1-.2-.1-.3s.03-.2.08-.28c.05-.08.13-.15.2-.2.08-.05.17-.1.25-.13.08-.03.17-.04.25-.04.13 0 .25.02.38.07.12.05.24.1.35.18.1.08.2.17.28.25.08.08.15.18.2.28z" fill="#fff"/>
  </svg>
);
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.196h3.312z"/></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.562.152-1.158.22-1.778.085.617 1.954 2.408 3.377 4.533 3.419-1.625 1.278-3.673 2.03-5.894 2.03-.382 0-.76-.022-1.13-.066 2.099 1.354 4.602 2.149 7.29 2.149 8.749 0 13.529-7.252 13.529-13.529 0-.206-.005-.412-.013-.617.928-.67 1.734-1.503 2.37-2.45z"/></svg>;

const StoreLinkModal: React.FC<StoreLinkModalProps> = ({ storeLink, handleClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'screen' | 'message'>('link');
  
  const storeLinkValue = storeLink?.trim() ? storeLink : 'Store link not available';
  const qrCodeUrl = '/store-qr-code.png';
  const screenshotUrl = '/arewamodescreen.png';
  const shareMessage =
    '🌟 Discover authentic products at the new Alaniq INT. Online Store! 🛒 Enjoy exclusive discounts 🎉 A beautiful selection of RTW, Perfumes, Incense & More ✨ Nationwide delivery 🚚 🇳🇬. Shop now: https://tinyurl.com/alaniqint';
  const [copyMsgSuccess, setCopyMsgSuccess] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeLinkValue).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }, () => {
      setCopySuccess(false);
    });
  };
  
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'store-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadScreenshot = () => {
    const link = document.createElement('a');
    link.href = screenshotUrl;
    link.download = 'arewamodescreen.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(shareMessage).then(() => {
      setCopyMsgSuccess(true);
      setTimeout(() => setCopyMsgSuccess(false), 2000);
    }, () => {
      setCopyMsgSuccess(false);
    });
  };

  const socialPlatforms = [
    { name: 'WhatsApp', icon: WhatsAppIcon, url: `https://wa.me/?text=${encodeURIComponent('🌟 Discover authentic products at the new Alaniq INT. Online Store! 🛒 Enjoy exclusive discounts 🎉 A beautiful selection of RTW, Perfumes, Incense & More ✨ Nationwide delivery 🚚 🇳🇬. Shop now: https://tinyurl.com/alaniqint')}`, color: 'hover:text-[#25D366]' },
    { name: 'Facebook', icon: FacebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeLinkValue)}`, color: 'hover:text-[#1877F2]' },
    { name: 'Instagram', icon: InstagramIcon, url: `https://www.instagram.com`, color: 'hover:text-[#E4405F]' },
    { name: 'Twitter', icon: TwitterIcon, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(storeLinkValue)}`, color: 'hover:text-[#1DA1F2]' },
  ];

  return (
    <Modal open={true} onClose={handleClose}>
      {/* X/close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 z-10 text-text-secondary hover:text-text-primary bg-white/80 dark:bg-slate-700/80 rounded-full p-1.5 shadow"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="w-full flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
          <Link2 className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Your Store Front</h2>
        <p className="text-sm text-text-secondary mb-6 text-center">Share your link or QR code with customers.</p>
        
        {/* Tab Controls */}
        <div className="w-full flex p-1 bg-background-alt rounded-lg border border-border-color mb-6">
          <button onClick={() => setActiveTab('link')} className={`flex-1 text-sm font-semibold p-2 rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'link' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text-secondary'}`}>
              <Link2 className="w-4 h-4"/>
              Link
          </button>
          <button onClick={() => setActiveTab('qr')} className={`flex-1 text-sm font-semibold p-2 rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'qr' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text-secondary'}`}>
              <QrCode className="w-4 h-4"/>
              Code
          </button>
          <button onClick={() => setActiveTab('screen')} className={`flex-1 text-sm font-semibold p-2 rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'screen' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text-secondary'}`}>
              <Download className="w-4 h-4"/>
              Screen
          </button>
          <button onClick={() => setActiveTab('message')} className={`flex-1 text-sm font-semibold p-2 rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'message' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text-secondary'}`}>
              <Share2 className="w-4 h-4"/>
              Caption
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === 'link' && (
            <div className="animate-fadeIn space-y-4">
              <div className="w-full px-3 py-2.5 rounded-lg bg-background-alt text-text-primary font-mono text-sm break-all border border-border-color">
                {storeLinkValue}
              </div>
              <div className="flex gap-3 w-full">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition-all shadow-sm active:scale-95" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
                <a href={storeLinkValue.startsWith('http') ? storeLinkValue : `https://${storeLinkValue}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                  <ExternalLink className="w-4 h-4" />
                  Visit
                </a>
              </div>
            </div>
          )}
          
          {activeTab === 'qr' && (
            <div className="animate-fadeIn space-y-4 flex flex-col items-center">
              <div className="p-2 border-4 border-border-color rounded-lg bg-white">
                  <Image src={qrCodeUrl} alt="Store QR Code" width={200} height={200} className="rounded-sm" />
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-success text-success-foreground font-semibold hover:bg-success/90 transition-all shadow-sm active:scale-95" onClick={handleDownloadQR}>
                <Download className="w-4 h-4" />
                Download QR
              </button>
            </div>
          )}
          {activeTab === 'screen' && (
            <div className="animate-fadeIn space-y-4 flex flex-col items-center">
              <div className="p-2 border-4 border-border-color rounded-lg bg-white">
                <Image 
                  src={screenshotUrl} 
                  alt="Storefront Screenshot" 
                  width={220} 
                  height={140} 
                  className="rounded-md object-cover max-h-40 sm:max-h-60 w-auto h-auto"
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '160px' }}
                />
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95" onClick={handleDownloadScreenshot}>
                <Download className="w-4 h-4" />
                Download Screenshot
              </button>
            </div>
          )}
          {activeTab === 'message' && (
            <div className="animate-fadeIn space-y-4 flex flex-col items-center">
              <div className="w-full px-3 py-2.5 rounded-lg bg-background-alt text-text-primary font-mono text-sm break-words border border-border-color select-text">
                {shareMessage}
              </div>
              <button
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition-all shadow-sm active:scale-95"
                onClick={handleCopyMessage}
              >
                <Copy className="w-4 h-4" />
                {copyMsgSuccess ? 'Copied!' : 'Copy Caption'}
              </button>
              <p className="text-xs text-text-secondary text-center">Copy and share this caption on WhatsApp or anywhere else.</p>
            </div>
          )}
        </div>

        <div className="w-full border-t border-border-color my-6"></div>

        <div className="flex flex-col items-center gap-3 w-full">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Boost Sales via Social Media
          </h3>
          {/* WhatsApp Share Button */}
          <a
            href={socialPlatforms[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs mb-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white font-semibold shadow hover:bg-[#1DA851] transition-all active:scale-95"
            title="Share on WhatsApp"
          >
            <WhatsAppIcon />
            Share via WhatsApp
          </a>
          <div className="flex gap-3 justify-center pt-2">
            {socialPlatforms.slice(1).map((platform) => (
              <a href={platform.url} target="_blank" rel="noopener noreferrer" key={platform.name} className={`p-3 rounded-full bg-background-alt text-text-secondary ${platform.color} transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none`} title={`Share on ${platform.name}`}>
                <platform.icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StoreLinkModal;
