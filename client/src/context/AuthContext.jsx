import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_PROFILES = {
  officer: {
    id: 'officer-01',
    name: 'Chief Procurement Officer',
    email: 'admin@admin.com',
    role: 'OFFICER',
    department: 'Chennai Petroleum Corporation Limited (CPCL)',
    designation: 'Admin & Tender Committee Convener'
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
  // Purge any stale localStorage login data so fresh sessions cannot bypass /login
  useEffect(() => {
    try {
      localStorage.removeItem('bidshield_auth_user');
      localStorage.removeItem('bidshield_active_vendor_id');
    } catch {
      // ignore
    }
  }, []);

  const [user, setUser] = useState(() => {
    try {
      // Session-scoped authentication: closing tab or opening new window enforces login
      const stored = sessionStorage.getItem('bidshield_session_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('bidshield_session_user', JSON.stringify(user));
      if (user.bidder_id) {
        sessionStorage.setItem('bidshield_active_vendor_id', user.bidder_id);
      }
    } else {
      sessionStorage.removeItem('bidshield_session_user');
      sessionStorage.removeItem('bidshield_active_vendor_id');
    }
  }, [user]);

  const login = ({ identifier, password, role }) => {
    const trimmedId = (identifier || '').trim().toLowerCase();
    const trimmedPw = (password || '').trim();

    // STRICT OFFICER LOGIN: ONLY admin@admin.com and password. NO FALLBACKS!
    if (role === 'OFFICER') {
      const isEmailValid = trimmedId === 'admin@admin.com';
      const isPasswordValid = trimmedPw === 'password';

      if (!isEmailValid || !isPasswordValid) {
        return {
          success: false,
          error: 'Invalid Officer Credentials. Strict Login: admin@admin.com and password required.'
        };
      }

      const officerUser = {
        ...DEMO_PROFILES.officer,
        email: 'admin@admin.com',
        name: 'Chief Procurement Officer / Administrator'
      };
      setUser(officerUser);
      return { success: true, user: officerUser };
    }

    // STRICT VENDOR LOGIN: Registered email or GSTIN with password. NO FALLBACK PASSWORDS!
    if (role === 'VENDOR') {
      const vendorProfiles = Object.values(DEMO_PROFILES).filter(p => p.role === 'VENDOR');
      const matchedVendor = vendorProfiles.find(v => 
        v.email.toLowerCase() === trimmedId || 
        v.gstin.toLowerCase() === trimmedId
      );

      if (!matchedVendor) {
        return {
          success: false,
          error: 'Invalid Vendor Credentials. No registered company found with this Email or GSTIN.'
        };
      }

      // Check if custom password was set by this vendor, else strictly 'password'
      const customPwd = localStorage.getItem('bidshield_vendor_custom_pwd_' + matchedVendor.id);
      const isPasswordValid = customPwd ? trimmedPw === customPwd : trimmedPw === 'password';

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid password. Enter "password" or your updated enterprise password.'
        };
      }

      // Check if company has already permanently changed their password
      const hasChangedPassword = localStorage.getItem('bidshield_pwd_changed_' + matchedVendor.id) === 'true';

      const vendorUser = {
        ...matchedVendor,
        must_change_password: !hasChangedPassword
      };

      setUser(vendorUser);
      return { success: true, user: vendorUser };
    }

    return { success: false, error: 'Unrecognized user role' };
  };

  const quickLogin = (profileKey) => {
    const profile = DEMO_PROFILES[profileKey];
    if (profile) {
      const hasChangedPassword = profile.role === 'VENDOR'
        ? localStorage.getItem('bidshield_pwd_changed_' + profile.id) === 'true'
        : true;

      const enriched = {
        ...profile,
        must_change_password: profile.role === 'VENDOR' ? !hasChangedPassword : false
      };
      setUser(enriched);
      return { success: true, user: enriched };
    }
    return { success: false, message: 'Profile not found' };
  };

  const updatePassword = (newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const id = user.id || user.bidder_id;
    localStorage.setItem('bidshield_vendor_custom_pwd_' + id, newPassword);
    localStorage.setItem('bidshield_pwd_changed_' + id, 'true');
    const updated = { ...user, must_change_password: false };
    setUser(updated);
    localStorage.setItem('bidshield_auth_user', JSON.stringify(updated));
    return { success: true };
  };

  const deferPasswordChange = () => {
    if (!user) return;
    // Dismisses for current session, so NEXT time they log in they will be prompted again!
    const updated = { ...user, must_change_password: false };
    setUser(updated);
    sessionStorage.setItem('bidshield_session_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.clear();
      localStorage.removeItem('bidshield_auth_user');
      localStorage.removeItem('bidshield_active_vendor_id');
      localStorage.removeItem('bidshield_session_user');
    } catch {
      // ignore
    }
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
        updatePassword,
        deferPasswordChange,
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
