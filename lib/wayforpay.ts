import crypto from 'crypto';

export interface WayForPayConfig {
  merchantAccount: string;
  merchantSecretKey: string;
  merchantDomainName: string;
  serviceUrl: string;
}

export interface PaymentData {
  merchantAccount: string;
  merchantDomainName: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: string;
  productName: string[];
  productPrice: number[];
  productCount: number[];
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  language: string;
  returnUrl: string;
  serviceUrl: string;
}

export class WayForPayService {
  private config: WayForPayConfig;

  constructor(config: WayForPayConfig) {
    this.config = config;
  }

  generateSignature(data: Record<string, any>, fields: string[]): string {
    const values = fields.map(field => data[field] || '').join(';');
    const signString = values + ';' + this.config.merchantSecretKey;
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  createPaymentForm(paymentData: PaymentData): string {
    const signatureFields = [
      'merchantAccount',
      'merchantDomainName', 
      'orderReference',
      'orderDate',
      'amount',
      'currency',
      'productName',
      'productCount',
      'productPrice'
    ];

    const signature = this.generateSignature(paymentData, signatureFields);

    const formData = {
      ...paymentData,
      merchantSignature: signature
    };

    // Generate HTML form
    let form = '<form id="wayforpay-form" action="https://secure.wayforpay.com/pay" method="post">';
    
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          form += `<input type="hidden" name="${key}[]" value="${item}">`;
        });
      } else {
        form += `<input type="hidden" name="${key}" value="${value}">`;
      }
    });
    
    form += '</form>';
    form += '<script>document.getElementById("wayforpay-form").submit();</script>';
    
    return form;
  }

  verifySignature(data: Record<string, any>, signature: string, fields: string[]): boolean {
    const expectedSignature = this.generateSignature(data, fields);
    return expectedSignature === signature;
  }

  createPaymentData(
    orderReference: string,
    amount: number,
    productName: string,
    clientData: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    },
    returnUrl: string
  ): PaymentData {
    return {
      merchantAccount: this.config.merchantAccount,
      merchantDomainName: this.config.merchantDomainName,
      orderReference,
      orderDate: Math.floor(Date.now() / 1000),
      amount,
      currency: 'UAH',
      productName: [productName],
      productPrice: [amount],
      productCount: [1],
      clientFirstName: clientData.firstName,
      clientLastName: clientData.lastName,
      clientEmail: clientData.email,
      clientPhone: clientData.phone || '',
      language: 'UA',
      returnUrl,
      serviceUrl: this.config.serviceUrl
    };
  }
}

export const wayforpay = new WayForPayService({
  merchantAccount: process.env.WAYFORPAY_MERCHANT_ACCOUNT || '',
  merchantSecretKey: process.env.WAYFORPAY_SECRET_KEY || '',
  merchantDomainName: process.env.WAYFORPAY_DOMAIN || 'copyflow.com',
  serviceUrl: process.env.NEXTAUTH_URL + '/api/wayforpay/webhook'
});