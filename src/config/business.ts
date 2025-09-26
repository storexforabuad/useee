export interface BusinessConfig {
    name: string;
    shortName: string;
    description: string;
    contact: {
      whatsapp: string;
      support: string;
      payment: {
        accountName: string;
        accountNumber: string;
        bankName: string;
      }
    };
    theme: {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
    };
  }
  
  export const businessConfig: BusinessConfig = {
    name: "Alaniq INT.",
    shortName: "Alaniq INT. App",
    description: "Your one-stop shop for all your fashion needs",
    contact: {
      whatsapp: "+2348119772223",
      support: "+2348119772223",
      payment: {
        accountName: "Aisha Ibrahim Lame",
        accountNumber: "0057360918",
        bankName: "Access Bank"
      }
    },
    theme: {
      primaryColor: "blue-800",
      secondaryColor: "green-500",
      backgroundColor: "gray-50"
    }
  };