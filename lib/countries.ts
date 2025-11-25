export interface Country {
  code: string
  name: string
  flag: string
  callingCode: string
}

export const countries: Country[] = [
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', callingCode: '+233' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', callingCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', callingCode: '+254' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', callingCode: '+27' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', callingCode: '+20' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', callingCode: '+251' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', callingCode: '+255' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', callingCode: '+256' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', callingCode: '+244' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', callingCode: '+249' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', callingCode: '+212' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', callingCode: '+213' },
  { code: 'US', name: 'United States', flag: '🇺🇸', callingCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', callingCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', callingCode: '+61' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', callingCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', callingCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', callingCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', callingCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', callingCode: '+31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', callingCode: '+32' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', callingCode: '+41' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', callingCode: '+43' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', callingCode: '+46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', callingCode: '+47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', callingCode: '+45' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', callingCode: '+358' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', callingCode: '+48' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', callingCode: '+351' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', callingCode: '+30' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', callingCode: '+353' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', callingCode: '+64' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', callingCode: '+81' },
  { code: 'CN', name: 'China', flag: '🇨🇳', callingCode: '+86' },
  { code: 'IN', name: 'India', flag: '🇮🇳', callingCode: '+91' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', callingCode: '+55' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', callingCode: '+52' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', callingCode: '+54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', callingCode: '+56' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', callingCode: '+57' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', callingCode: '+51' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', callingCode: '+58' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', callingCode: '+593' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', callingCode: '+591' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', callingCode: '+595' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', callingCode: '+598' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', callingCode: '+506' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', callingCode: '+507' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', callingCode: '+502' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', callingCode: '+504' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', callingCode: '+503' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', callingCode: '+505' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', callingCode: '+1' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', callingCode: '+53' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', callingCode: '+1' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', callingCode: '+509' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', callingCode: '+1' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', callingCode: '+1' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', callingCode: '+1' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', callingCode: '+501' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', callingCode: '+592' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', callingCode: '+597' },
  { code: 'GF', name: 'French Guiana', flag: '🇬🇫', callingCode: '+594' },
]

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(c => c.code === code)
}

export const getCountryByName = (name: string): Country | undefined => {
  return countries.find(c => c.name.toLowerCase() === name.toLowerCase())
}

export const getCountryByCallingCode = (callingCode: string): Country | undefined => {
  // Normalize the calling code (remove spaces, ensure it starts with +)
  const normalized = callingCode.trim().startsWith('+') ? callingCode.trim() : `+${callingCode.trim()}`
  return countries.find(c => c.callingCode === normalized)
}

export const detectCountryFromPhone = (phoneNumber: string): Country | undefined => {
  if (!phoneNumber || !phoneNumber.startsWith('+')) {
    return undefined
  }
  
  // Extract the country code from the phone number
  // Try to match the longest possible country code first (some codes are longer)
  const sortedCountries = [...countries].sort((a, b) => b.callingCode.length - a.callingCode.length)
  
  for (const country of sortedCountries) {
    if (phoneNumber.startsWith(country.callingCode)) {
      return country
    }
  }
  
  return undefined
}

