import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_PROFILES = {
  officer: {
    id: 'officer-01',
    name: 'Officer R. K. Sharma',
    email: 'officer.sharma@cpcl.gov.in',
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
    statusTag: 'MoPNG Debarred / High Risk (0/100)'
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

  const login = ({ email, role, bidder_id, company_name }) => {
    // If role is officer
    if (role === 'OFFICER') {
      const officerUser = {
        ...DEMO_PROFILES.officer,
        email: email || DEMO_PROFILES.officer.email
      };
      setUser(officerUser);
      return { success: true, user: officerUser };
    }

    // If role is vendor
    const vendorUser = {
      id: bidder_id || '9ea6bad0-51b7-4e11-9491-e66fa52d2cc2',
      bidder_id: bidder_id || '9ea6bad0-51b7-4e11-9491-e66fa52d2cc2',
      name: company_name || 'Apex Petrochem Engineering Pvt Ltd',
      company_name: company_name || 'Apex Petrochem Engineering Pvt Ltd',
      email: email || 'tenders@apexpetrochem.in',
      role: 'VENDOR'
    };
    setUser(vendorUser);
    return { success: true, user: vendorUser };
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
