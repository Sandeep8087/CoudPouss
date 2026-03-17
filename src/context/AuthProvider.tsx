import React, {createContext, useContext, useEffect, useState} from 'react';
import {API} from '../api';

//CONSTANT
import { Storage } from '../constant';
import { LaungageContext } from './LanguageProvider';

interface AuthProviderProps {
  children: any;
}

export const AuthContext = createContext<any>(null);

export function AuthProvider(props: Readonly<AuthProviderProps>): any {
  // const [userType, setUserType] = useState<any>('Elder')

  useEffect(() => {
    fetchProfile();
  }, []);
  const {setLanguage} = useContext<any>(LaungageContext);

  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<any>('service_provider');
  //elderly_user , service_provider
  const [myPlan, setMyPlan] = useState<any>(null);
  //professional, non_professional
  const [profile, setProfile] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<any>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  async function fetchProfile() {
    try {
      const result = await API.Instance.get(API.API_ROUTES.getUserDetails + `?platform=app`);
      if (result.status) {
        const userDetail = result?.data?.data;
        setLanguage(userDetail?.user?.lang);
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
        selectedAddress,
        setSelectedAddress,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
