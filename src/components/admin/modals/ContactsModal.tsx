import React, { useState } from 'react';
import { X, Handshake, ChevronDown } from 'lucide-react';
import Modal from '../../Modal';

interface ContactsModalProps { // Renamed interface
  handleClose: () => void;
}

interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
  specialization: string;
}

interface RegionData {
  id: string;
  name: string;
  contacts: Contact[];
}

const mockWholesaleData: RegionData[] = [
  {
    id: 'vendor-state',
    name: 'Your Vendor State',
    contacts: [
      {
        name: 'Local Supply Co.',
        role: 'Sales Manager',
        phone: '+2348012345678',
        email: 'sales@localsupply.com',
        specialization: 'General Goods',
      },
      {
        name: 'Agro Distributors',
        role: 'Account Manager',
        phone: '+2348023456789',
        email: 'info@agrodist.com',
        specialization: 'Agricultural Products',
      },
    ],
  },
  {
    id: 'your-region',
    name: 'Your Region',
    contacts: [
      {
        name: 'Regional Wholesalers Ltd.',
        role: 'Operations Head',
        phone: '+2347011223344',
        email: 'ops@regionalwholesale.com',
        specialization: 'Electronics, Home Goods',
      },
      {
        name: 'Textile Hub',
        role: 'Manager',
        phone: '+2347022334455',
        email: 'contact@textilehub.com',
        specialization: 'Fabrics, Clothing',
      },
    ],
  },
  {
    id: 'kano-nigeria',
    name: 'Kano, Nigeria',
    contacts: [
      {
        name: 'Kano Commodities',
        role: 'Logistics',
        phone: '+2349033445566',
        email: 'logistics@kanocommodities.com',
        specialization: 'Foodstuffs, Grains',
      },
      {
        name: 'Central Market Suppliers',
        role: 'Wholesale Rep',
        phone: '+2349044556677',
        email: 'sales@centralmarket.com',
        specialization: 'Consumer Goods',
      },
    ],
  },
  {
    id: 'lagos-nigeria',
    name: 'Lagos, Nigeria',
    contacts: [
      {
        name: 'Lagos Import/Export',
        role: 'Director',
        phone: '+2348155667788',
        email: 'ceo@lagosimport.com',
        specialization: 'Variety of Imported Goods',
      },
      {
        name: 'Balogun Market Wholesalers',
        role: 'Sales',
        phone: '+2348166778899',
        email: 'info@balogunwholesale.com',
        specialization: 'Fashion, Beauty Products',
      },
    ],
  },
  {
    id: 'china',
    name: 'China',
    contacts: [
      {
        name: 'Shenzhen Tech Solutions',
        role: 'International Sales',
        phone: '+8613912345678',
        email: 'intlsales@shenzhentech.cn',
        specialization: 'Electronics, Gadgets',
      },
      {
        name: 'Guangzhou General Trading',
        role: 'Export Manager',
        phone: '+8613898765432',
        email: 'export@guangzhoutrade.cn',
        specialization: 'Clothing, Accessories, Small Wares',
      },
    ],
  },
];

const ContactsModal: React.FC<ContactsModalProps> = ({ handleClose }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const totalContacts = mockWholesaleData.reduce((sum, region) => sum + region.contacts.length, 0);
  const toggleSection = (sectionId: string) => {
    setOpenSection(prev => (prev === sectionId ? null : sectionId));
  };

  return (
    <Modal open={true} onClose={handleClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20">
            <Handshake className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Contacts ({totalContacts})</h2>
            <p className="text-sm text-text-secondary">Key suppliers by region.</p>
          </div>
        </div>
        <button onClick={handleClose} className="text-text-secondary hover:text-text-primary">
          <X size={24} />
        </button>
      </div>
      {/* Content - Accordions */}
      <div className="overflow-y-auto max-h-[70vh] space-y-4">
        {mockWholesaleData.map(region => (
          <div key={region.id} className="border border-border-color rounded-md bg-card-background">
            <button
              onClick={() => toggleSection(region.id)}
              className="flex justify-between items-center w-full p-4 text-left font-semibold text-text-primary focus:outline-none"
            >
              {region.name}
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${openSection === region.id ? 'rotate-180' : ''}`}
              />
            </button>
            {openSection === region.id && (
              <div className="p-4 border-t border-border-color space-y-4">
                {region.contacts.map((contact, index) => (
                  <div key={index} className="space-y-1">
                    <p className="font-semibold text-text-primary text-lg">{contact.name}</p>
                    <p className="text-sm text-text-secondary">
                      {contact.role} {contact.specialization && `(${contact.specialization})`}
                    </p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center text-text-primary hover:text-button-primary transition-colors text-sm"
                    >
                      <span className="mr-2">📞</span> {contact.phone}
                    </a>
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center text-text-primary hover:text-button-primary transition-colors text-sm"
                    >
                      <span className="mr-2">✉️</span> {contact.email}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default ContactsModal;
