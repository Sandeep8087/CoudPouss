import React, {createContext, useEffect, useState} from 'react';
import {API} from '../api';

interface AuthProviderProps {
  children: any;
}

export const AuthContext = createContext<any>(null);

export function AuthProvider(props: Readonly<AuthProviderProps>): any {
  // const [userType, setUserType] = useState<any>('Elder')

  useEffect(() => {
    fetchProfile();
  }, []);

  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<any>('service_provider');
  //elderly_user , service_provider
  const [myPlan, setMyPlan] = useState<any>(null);
  //professional, non_professional
  const [profile, setProfile] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<any>([]);

  async function fetchProfile() {
    try {
      const result = await API.Instance.get(API.API_ROUTES.getUserDetails + `?platform=app`);
      if (result.status) {
        const userDetail = result?.data?.data;
        console.log('PRO',JSON.stringify(userDetail))
        setProfile(userDetail);
        return userDetail;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        userType,
        setUserType,
        myPlan,
        setMyPlan,
        profile,
        setProfile,
        fetchProfile,
        selectedServices,
        setSelectedServices,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
