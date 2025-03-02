import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const businessConfig = {
  name: "",
  shortName: "",
  description: "",
  contact: {
    whatsapp: "",
    support: "",
    payment: {
      accountName: "",
      accountNumber: "",
      bankName: ""
    }
  },
  theme: {
    primaryColor: "blue-800",
    secondaryColor: "green-500",
    backgroundColor: "gray-50"
  }
};

async function setupBusiness() {
  const response = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'What is the business name?'
    },
    {
      type: 'text',
      name: 'whatsapp',
      message: 'Main WhatsApp number? (with country code)'
    },
    {
      type: 'text',
      name: 'support',
      message: 'Support WhatsApp number?'
    },
    {
      type: 'text',
      name: 'accountName',
      message: 'Bank account name?'
    },
    {
      type: 'text',
      name: 'accountNumber',
      message: 'Bank account number?'
    },
    {
      type: 'text',
      name: 'bankName',
      message: 'Bank name?'
    }
  ]);

  const config = {
    ...businessConfig,
    name: response.name,
    shortName: `${response.name} App`,
    description: "Your one-stop shop for all your needs",
    contact: {
      whatsapp: response.whatsapp,
      support: response.support,
      payment: {
        accountName: response.accountName,
        accountNumber: response.accountNumber,
        bankName: response.bankName
      }
    }
  };

  const configContent = `export const businessConfig = ${JSON.stringify(config, null, 2)};`;
  
  fs.writeFileSync(
    path.join(process.cwd(), 'src', 'config', 'business.ts'),
    configContent
  );

  console.log('✅ Business configuration complete!');
}

setupBusiness();