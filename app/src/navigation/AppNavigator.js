/**
 * Wedring Matrimony — App Navigator
 * Premium 5-tab navigation with elegant styling
 */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { layout } from '../theme/spacing';
import shadows from '../theme/shadows';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Registration Screens
import BasicInfoScreen from '../screens/registration/BasicInfoScreen';
import ReligionCasteScreen from '../screens/registration/ReligionCasteScreen';
import EducationScreen from '../screens/registration/EducationScreen';
import FamilyScreen from '../screens/registration/FamilyScreen';
import HoroscopeScreen from '../screens/registration/HoroscopeScreen';
import LifestyleScreen from '../screens/registration/LifestyleScreen';
import PhotoUploadScreen from '../screens/registration/PhotoUploadScreen';
import PartnerPreferenceScreen from '../screens/registration/PartnerPreferenceScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import MatchesScreen from '../screens/main/MatchesScreen';
import InterestsScreen from '../screens/main/InterestsScreen';

// Detail Screens
import UserProfileScreen from '../screens/detail/UserProfileScreen';
import PhotoViewerScreen from '../screens/detail/PhotoViewerScreen';
import HoroscopeDetailScreen from '../screens/detail/HoroscopeDetailScreen';

// Settings Screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import EditPreferencesScreen from '../screens/settings/EditPreferencesScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManagement from '../screens/admin/UserManagement';
import ReportManagement from '../screens/admin/ReportManagement';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';

// Premium
import PremiumScreen from '../screens/premium/PremiumScreen';

// Stores
import useAuthStore from '../store/useAuthStore';
import useProfileStore from '../store/useProfileStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const RegStack = createStackNavigator();

/**
 * Tab Icon Component
 * Modern, clean icons using vector-icons that feel professional and premium.
 */
const TabIcon = ({ label, focused }) => {
  const iconMap = {
    Home: focused ? 'home' : 'home-outline',
    Search: focused ? 'search' : 'search-outline',
    Matches: focused ? 'heart' : 'heart-outline',
    Interest: focused ? 'mail' : 'mail-outline',
    Premium: focused ? 'star' : 'star-outline',
  };

  return (
    <View style={tabIconStyles.container}>
      <Ionicons
        name={iconMap[label] || 'ellipse-outline'}
        size={24}
        color={focused ? colors.tabActive : colors.tabInactive}
        style={tabIconStyles.icon}
      />
      {focused && <View style={tabIconStyles.activeDot} />}
    </View>
  );
};

const tabIconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  icon: {
    marginBottom: -2,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.tabActive,
    marginTop: 2,
  },
});

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="OTP" component={OTPVerifyScreen} />
    <AuthStack.Screen name="CreateAccount" component={CreateAccountScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </AuthStack.Navigator>
);

// Registration Navigator
const RegistrationNavigator = () => (
  <RegStack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: false,
    }}
  >
    <RegStack.Screen name="BasicInfo" component={BasicInfoScreen} />
    <RegStack.Screen name="ReligionCaste" component={ReligionCasteScreen} />
    <RegStack.Screen name="Education" component={EducationScreen} />
    <RegStack.Screen name="Family" component={FamilyScreen} />
    <RegStack.Screen name="Horoscope" component={HoroscopeScreen} />
    <RegStack.Screen name="Lifestyle" component={LifestyleScreen} />
    <RegStack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
    <RegStack.Screen name="PartnerPreference" component={PartnerPreferenceScreen} />
  </RegStack.Navigator>
);

// Main Tab Navigator — Premium 5-tab layout
const MainTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="MatchesTab"
    screenOptions={{
      headerShown: false,
      tabBarStyle: tabBarStyles.tabBar,
      tabBarShowLabel: true,
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: colors.tabActive,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarLabelStyle: tabBarStyles.tabLabel,
      tabBarIconStyle: tabBarStyles.tabIcon,
    }}
  >
        <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="MatchesTab"
      component={MatchesScreen}
      options={{
        tabBarLabel: 'Matches',
        tabBarIcon: ({ focused }) => <TabIcon label="Matches" focused={focused} />,
      }}
    />

    <Tab.Screen
      name="InterestTab"
      component={InterestsScreen}
      options={{
        tabBarLabel: 'Interest',
        tabBarIcon: ({ focused }) => <TabIcon label="Interest" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="PremiumTab"
      component={PremiumScreen}
      options={{
        tabBarLabel: 'Premium',
        tabBarIcon: ({ focused }) => <TabIcon label="Premium" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

// Root App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isInitializing, user, initialize } = useAuthStore();
  const { isProfileComplete, isProfileLoaded, loadProfile } = useProfileStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadProfile(user.id);
    }
  }, [isAuthenticated, user?.id]);

  if (isInitializing || (isAuthenticated && !isProfileLoaded)) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !isProfileComplete ? (
          <Stack.Screen name="Registration" component={RegistrationNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
            <Stack.Screen name="UpgradesTab" component={PremiumScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="PhotoViewer" component={PhotoViewerScreen} />
            <Stack.Screen name="HoroscopeDetail" component={HoroscopeDetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="EditPreferences" component={EditPreferencesScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="UserManagement" component={UserManagement} />
            <Stack.Screen name="ReportManagement" component={ReportManagement} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="Matches" component={MatchesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const tabBarStyles = StyleSheet.create({
  tabBar: {
    height: layout.tabBarHeight,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    ...shadows.bottomTab,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
  },
  tabIcon: {
    marginTop: 2,
  },
});

export default AppNavigator;
