import { ToWords } from 'to-words';

// Initialize the ToWords instance with custom currency options for Birr
const toWords = new ToWords({
  localeCode: 'en-US', // Change to 'en-US' for International Numbering System
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      name: 'Birr',
      plural: 'Birr',
      symbol: 'Br',
      fractionalUnit: {
        name: 'Cent',
        plural: 'Cents',
        symbol: '',
      },
    },
  },
});

// Function to convert a number to words with currency
export function convertToWordsWithCurrency(amount) {
  return toWords.convert(amount, { currency: true });
}
