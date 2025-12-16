/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CatalogueScreen from './src/screens/CatalogueScreen';
import CostumeDetail from './src/screens/CostumeDetail';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import AdminHome from './src/screens/AdminHome';
import AdminCostumes from './src/screens/AdminCostumes';
import AdminCostumeForm from './src/screens/AdminCostumeForm';
import AdminUserForm from './src/screens/AdminUserForm';
import SellerHome from './src/screens/SellerHome';
import SellerCostumes from './src/screens/SellerCostumes';
import SellerCostumeForm from './src/screens/SellerCostumeForm';
import MyReservationsScreen from './src/screens/MyReservationsScreen';
import ReservationFormScreen from './src/screens/ReservationFormScreen';
import SellerReservationsScreen from './src/screens/SellerReservationsScreen';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Catalogue" component={CatalogueScreen} options={{ title: 'Catalogue' }} />
            <Stack.Screen name="CostumeDetail" component={CostumeDetail} options={{ title: 'Détails' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Se connecter' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Créer un compte' }} />
            <Stack.Screen name="Admin" component={AdminHome} options={{ title: 'Admin' }} />
            <Stack.Screen name="AdminUsers" component={AdminDashboard} options={{ title: 'Users' }} />
            <Stack.Screen name="AdminCostumes" component={AdminCostumes} options={{ title: 'Costumes' }} />
            <Stack.Screen name="AdminCostumeForm" component={AdminCostumeForm} options={{ title: 'Create Costume' }} />
            <Stack.Screen name="AdminCreateUser" component={AdminUserForm} options={{ title: 'Create User' }} />
            <Stack.Screen name="AdminEditUser" component={AdminUserForm} options={{ title: 'Edit User' }} />
            <Stack.Screen name="Seller" component={SellerHome} options={{ title: 'Seller' }} />
            <Stack.Screen name="SellerCostumes" component={SellerCostumes} options={{ title: 'My Costumes' }} />
            <Stack.Screen name="SellerCostumeForm" component={SellerCostumeForm} options={{ title: 'Costume Form' }} />
            <Stack.Screen name="SellerReservations" component={SellerReservationsScreen} options={{ title: 'Reservations' }} />
            <Stack.Screen name="MyReservations" component={MyReservationsScreen} options={{ title: 'My Reservations' }} />
            <Stack.Screen name="ReservationForm" component={ReservationFormScreen} options={{ title: 'Reserve Costume' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// No global styles needed here; screens handle their own layout.

export default App;
