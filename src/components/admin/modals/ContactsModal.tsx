import React, { useState } from 'react';
import { X, Handshake, ChevronDown, Plus, Phone, Mail } from 'lucide-react';
import Modal from '../../Modal';
import { addContact, WholesaleData } from '../../../lib/db';
import { toast } from 'react-hot-toast';

interface ContactsModalProps {
  handleClose: () => void;
  storeId: string;
  contacts: WholesaleData[];
  onContactAdded: () => void;
}

interface Contact {
  id?: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  specialization: string;
  region?: string;
}

interface ContactPickerResult {
  name: string[];
  tel: string[];
  email: string[];
}

interface ContactsManager {
  select(properties: Array<'name' | 'tel' | 'email'>, options?: { multiple: boolean }): Promise<ContactPickerResult[]>;
}

const ContactsModal: React.FC<ContactsModalProps> = ({ handleClose, storeId, contacts, onContactAdded }) => {
  const [openContactId, setOpenContactId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>({ name: '', role: '', phone: '', email: '', specialization: '' });

  const toggleContact = (contactId: string) => {
    setOpenContactId(prev => (prev === contactId ? null : contactId));
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Name and phone number are required.');
      return;
    }
    try {
      await addContact(storeId, newContact);
      toast.success('Contact added successfully!');
      onContactAdded();
      setShowAddForm(false);
      setNewContact({ name: '', role: '', phone: '', email: '', specialization: '' });
    } catch (error) {
      toast.error('Failed to add contact.');
      console.error('Error adding contact:', error);
    }
  };

  const handleSelectContact = async () => {
    const nav = navigator as Navigator & { contacts: ContactsManager };
    if (nav.contacts) {
      try {
        const selectedContacts = await nav.contacts.select(['name', 'tel', 'email']);
        if (selectedContacts && selectedContacts.length > 0) {
          const { name, tel, email } = selectedContacts[0];
          setNewContact(prev => ({ ...prev, name: name?.[0] || '', phone: tel?.[0] || '', email: email?.[0] || '' }));
        }
      } catch (error) {
        console.error('Error selecting contact from phone directory:', error);
        toast.error('Could not import contact.');
      }
    }
  };

  const sortedContacts = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
  const totalContacts = contacts.length;

  return (
    <Modal open={true} onClose={handleClose}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20">
            <Handshake className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Contacts ({totalContacts})</h2>
            <p className="text-sm text-text-secondary">Manage your contacts.</p>
          </div>
        </div>
        <button onClick={handleClose} className="text-text-secondary hover:text-text-primary"><X size={24} /></button>
      </div>

      <div className="overflow-y-auto max-h-[70vh] space-y-4">
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center justify-center w-full p-2 mb-4 text-white bg-purple-600 rounded-md hover:bg-purple-700">
          <Plus className="mr-2" /> {showAddForm ? 'Cancel' : 'Add New Contact'}
        </button>

        {showAddForm && (
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-semibold mb-2">New Contact</h3>
            <div className="space-y-2">
               <input type="text" placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className="w-full p-2 border rounded-md" />
               <input type="text" placeholder="Role" value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} className="w-full p-2 border rounded-md" />
               <input type="text" placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className="w-full p-2 border rounded-md" />
               <input type="text" placeholder="Email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} className="w-full p-2 border rounded-md" />
               <input type="text" placeholder="Specialization" value={newContact.specialization} onChange={(e) => setNewContact({ ...newContact, specialization: e.target.value })} className="w-full p-2 border rounded-md" />
               <button onClick={handleSelectContact} className="w-full p-2 mt-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Import from Phone</button>
               <button onClick={handleAddContact} className="w-full p-2 mt-2 text-white bg-green-500 rounded-md hover:bg-green-600">Save Contact</button>
            </div>
          </div>
        )}

        {sortedContacts.map((contact, index) => {
            const contactId = contact.id || `${index}`;
            const isContactOpen = openContactId === contactId;
            return (
              <div key={contactId} className="border border-border-color rounded-md bg-card-background">
                <button onClick={() => toggleContact(contactId)} className="flex justify-between items-center w-full p-4 text-left font-semibold text-text-primary focus:outline-none">
                  <p className="font-semibold text-text-primary text-lg">{contact.name}</p>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isContactOpen ? 'rotate-180' : ''}`} />
                </button>
                {isContactOpen && (
                  <div className="p-4 border-t border-border-color space-y-2">
                    {contact.role && <p className="text-sm text-text-secondary">{contact.role} {contact.specialization && `(${contact.specialization})`}</p>}
                    {contact.phone && <a href={`tel:${contact.phone}`} className="flex items-center text-text-primary hover:text-button-primary transition-colors text-sm"><Phone size={14} className="mr-2" /> {contact.phone}</a>}
                    {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center text-text-primary hover:text-button-primary transition-colors text-sm"><Mail size={14} className="mr-2" /> {contact.email}</a>}
                  </div>
                )}
              </div>
            );
        })}
      </div>
    </Modal>
  );
};

export default ContactsModal;
