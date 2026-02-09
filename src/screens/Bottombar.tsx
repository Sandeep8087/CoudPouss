import React, { useContext, useEffect, useRef } from 'react';

//COMPONENTS
import { Tabbar } from '../components';

//PACKAGES
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//PACKAGES
import { TABS } from '.';
import { AuthContext } from '../context';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();

function BottomBar(props: any) {
  const { userType } = useContext<any>(AuthContext);

  const isProfile = props?.route?.params?.isProfile ?? false;
  const isValidationService = props?.route?.params?.isValidationService ?? false;
  const isTask = props?.route?.params?.isTask ?? false;

  function getInitialRouteName() {
    if (isProfile) {
      return TABS.Profile.identifier;
    } else if (isValidationService) {
      return TABS.Request.identifier;
    } else {
      return TABS.Home.identifier;
    }
  }

  function getProfessionalRouteName() {
    console.log('isTask==>', isTask)
    if (isTask) {
      return TABS.Task.identifier;
    } else {
      return TABS.ProfessionalHome.identifier
    }
  }

  if (userType === 'service_provider') {
    return (
      <>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={getProfessionalRouteName()}
          tabBar={props => {
            return <Tabbar {...props} />;
          }}>
          <Tab.Screen
            name={TABS.ProfessionalHome.identifier}
            component={TABS.ProfessionalHome.component}
          />
          <Tab.Screen
            name={TABS.Task.identifier}
            component={TABS.Task.component}
          />
          <Tab.Screen
            name={TABS.Chat.identifier}
            component={TABS.Chat.component}
          />
          <Tab.Screen
            name={TABS.Profile.identifier}
            component={TABS.Profile.component}
          />
        </Tab.Navigator>
      </>
    );
  } else {
    return (
      <>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={getInitialRouteName()}
          tabBar={props => {
            return <Tabbar {...props} />;
          }}>
          <Tab.Screen
            name={TABS.Home.identifier}
            component={TABS.Home.component}
          />
          <Tab.Screen
            name={TABS.Request.identifier}
            component={TABS.Request.component}
          />
          <Tab.Screen
            name={'plus'}
            component={() => <View />}
          />
          <Tab.Screen
            name={TABS.Chat.identifier}
            component={TABS.Chat.component}
          />
          <Tab.Screen
            name={TABS.Profile.identifier}
            component={TABS.Profile.component}
          />
        </Tab.Navigator>
      </>
    );
  }
}

export default BottomBar;
