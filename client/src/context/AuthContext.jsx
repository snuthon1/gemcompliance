import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_PROFILES = {
  officer: {
    id: 'officer-01',
    name: 'Demo Procurement Officer',
    email: 'officer@cpcl.gov.in',
    role: 'OFFICER',
    department: 'Chennai Petroleum Corporation Limited (CPCL)',
    designation: 'Tender Committee Convener & Head of Contracts'
  },
  apex: {
    id: '9ea6bad0-51b7-4e11-9491-e66fa52d2cc2',
    bidder_id: '9ea6bad0-51b7-4e11-9491-e66fa52d2cc2',
    name: 'Apex Petrochem Engineering Pvt Ltd',
    company_name: 'Apex Petrochem Engineering Pvt Ltd',
    email: 'tenders@apexpetrochem.in',
    role: 'VENDOR',
    gstin: '33AAACA1234A1Z5',
    pan: 'AAACA1234A',
    udyam: 'UDYAM-TN-02-0012345',
    statusTag: 'Compliant Tier (100/100)'
  },
  coromandel: {
    id: 'e1bef071-4241-4e19-821c-17f8962f9387',
    bidder_id: 'e1bef071-4241-4e19-821c-17f8962f9387',
    name: 'Coromandel Heavy Valves & Alloy Works Ltd',
    company_name: 'Coromandel Heavy Valves & Alloy Works Ltd',
    email: 'sales@coromandelvalves.com',
    role: 'VENDOR',
    gstin: '33BBBCB5678B1Z2',
    pan: 'BBBCB5678B',
    udyam: 'UDYAM-TN-03-0054321',
    statusTag: 'MoPNG Debarred / High Risk (0/100)'
  },
  bharat: {
    id: '6ca8e169-dc32-472e-b6d0-c3d3ceba3c78',
    bidder_id: '6ca8e169-dc32-472e-b6d0-c3d3ceba3c78',
    name: 'Bharat High-Pressure Seamless Pipes Pvt Ltd',
    company_name: 'Bharat High-Pressure Seamless Pipes Pvt Ltd',
    email: 'tenders@bharatpipes.in',
    role: 'VENDOR',
    gstin: '33EEECE9876E1Z3',
    pan: 'EEECE9876E',
    udyam: 'UDYAM-TN-05-0077889',
    statusTag: 'Name Mismatch Advisory (85/100)'
  },
  kaveri: {
    id: 'cadfa421-a29d-4426-bb56-93f2548af57c',
    bidder_id: 'cadfa421-a29d-4426-bb56-93f2548af57c',
    name: 'Kaveri Refining Spares & Services Ltd',
    company_name: 'Kaveri Refining Spares & Services Ltd',
    email: 'admin@kaverispares.com',
    role: 'VENDOR',
    gstin: '33DDDCD4321D1Z4',
    pan: 'DDDCD4321D',
    udyam: 'UDYAM-TN-04-0099887',
    statusTag: 'Statutory Non-Compliant (45/100)'
  },
  deccan: {
    id: '6b88b3eb-460b-4e08-96ef-9f37fe25774a',
    bidder_id: '6b88b3eb-460b-4e08-96ef-9f37fe25774a',
    name: 'Deccan Petro Instrumentation & Flow Systems',
    company_name: 'Deccan Petro Instrumentation & Flow Systems',
    email: 'contact@deccanpetro.com',
    role: 'VENDOR',
    gstin: '36FFFDF4321F1Z1',
    pan: 'FFFDF4321F',
    udyam: 'UDYAM-TS-01-0022334',
    statusTag: 'Compliant Tier (90/100)'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bidshield_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bidshield_auth_user', JSON.stringify(user));
      if (user.bidder_id) {
        localStorage.setItem('bidshield_active_vendor_id', user.bidder_id);
      }
    } else {
      localStorage.removeItem('bidshield_auth_user');
    }
  }, [user]);

  const login = ({ identifier, password, role }) => {
    const trimmedId = (identifier || '').trim().toLowerCase();
    const trimmedPw = (password || '').trim();

    if (role === 'OFFICER') {
      const validOfficerEmails = [
        'officer@cpcl.gov.in',
        'officer.demo@cpcl.gov.in',
        'officer@gem.gov.in'
      ];
      const isEmailValid = validOfficerEmails.includes(trimmedId);
      const isPasswordValid = trimmedPw === 'Officer@2026' || trimmedPw === 'admin123';

      if (!isEmailValid || !isPasswordValid) {
        return {
          success: false,
          error: 'Invalid Officer Credentials. Official designated email and authorized password required.'
        };
      }

      const officerUser = {
        ...DEMO_PROFILES.officer,
        email: trimmedId
      };
      setUser(officerUser);
      return { success: true, user: officerUser };
    }

    if (role === 'VENDOR') {
      const vendorProfiles = Object.values(DEMO_PROFILES).filter(p => p.role === 'VENDOR');
      const matchedVendor = vendorProfiles.find(v => 
        v.email.toLowerCase() === trimmedId || 
        v.gstin.toLowerCase() === trimmedId
      );

      const isPasswordValid = trimmedPw === 'Vendor@2026' || trimmedPw === 'vendor123';

      if (!matchedVendor || !isPasswordValid) {
        return {
          success: false,
          error: 'Invalid Vendor Credentials. Enter registered GSTIN or official email with authorized enterprise password.'
        };
      }

      setUser(matchedVendor);
      return { success: true, user: matchedVendor };
    }

    return { success: false, error: 'Unrecognized user role' };
  };

  const quickLogin = (profileKey) => {
    const profile = DEMO_PROFILES[profileKey];
    if (profile) {
      setUser(profile);
      return { success: true, user: profile };
    }
    return { success: false, message: 'Profile not found' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bidshield_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOfficer: user?.role === 'OFFICER',
        isVendor: user?.role === 'VENDOR',
        login,
        quickLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
