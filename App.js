import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import styles from './styles';


const URL = `https://nominatim.openstreetmap.org/reverse`;

function formatAddress(address) {
  const { shop, house_number, road, neighbourhood, suburd, country, city, state, iso, postcode, countryCode} = address;

  return [ shop, house_number, road, neighbourhood, suburd, country, city, state,  postcode, country].filter(Boolean).join(', ');
}


export default function WhereAmI() {
  const [address, setAddress] = useState('loading...');
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();

  useEffect(() => {
    async function setPosition() {
      try {
        let location = await Location.getForegroundPermissionsAsync({});
        const { latitude, longitude} = location.coords;
        setLongitude(40.08);
        setLatitude(85.92);
        const response = await axios.get(URL, {
          params: {
            lat: latitude,
            lon: longitude,
            format: 'json'
          }
        });
        console.log('Full response data', response.data);
        const data = response.data;
        if (data && data.address) {
          const formattedAddress = formatAddress(data.address);
          setAddress(formattedAddress);
        } else {
          console.warn('Address information not found in response data.');
        }
      } catch (error) {
        console.error('Error fetching location data with axios:', error);
        setAddress('Error retrieving address', error);
      }
      
    }

    let watcher;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setPosition(location);

      watcher = await Location.watchPositionAsync(
        { accuracy: Location.LocationAccuracy.Highest },
        setPosition
      );
    })();

    return () => {
      watcher?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Address: {address}</Text>
      <Text style={styles.label}>Latitude: {latitude}</Text>
      <Text style={styles.label}>Longitude: {longitude}</Text>
    </View>
  );
}
