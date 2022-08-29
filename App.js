import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { Fontisto, Ionicons } from '@expo/vector-icons';

const { width:SCREEN_WIDTH } = Dimensions.get("window");

const API_KEY = "4671665e12b6d039ee3846304261453c";

const icons = {
  "Clouds": "cloudy",
  "Clear": "day-sunny",
  "Snow": "snow",
  "Rain": "rains",
  "Drizzle": "rain",
  "Thunderstorm": "lightning",
  "Atmosphere": "cloudy-gusts"
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const [weather, setWeather] = useState([]);
  const getWeather = async() => {
    const {granted} = await Location.requestForegroundPermissionsAsync();
    if(!granted){
      setOk(false);
    }
    const {coords:{latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy:5});
    const location = await Location.reverseGeocodeAsync(
      {latitude, longitude},
      {useGoogleMaps:false}
    );
    setCity(location[0].city ? location[0].city : location[0].region);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    const json = await response.json();
    const weatherList = json.list;
    setWeather(weatherList);

    let cnt = 0;
    let tempTotal = 0;
    let desc = [];
    let date = "";
    let allDays = [];
    for(let i = 0; i < weatherList.length; i++) {
      let thisDate = weatherList[i].dt_txt.substring(0, 10);
      if((date !== thisDate && i !== 0) || i === weatherList.length - 1){
        const thisTemp = parseFloat((tempTotal / cnt)).toFixed(1);
        const descCntList = desc.reduce((ac, v) => ({ ...ac, [v]: (ac[v] || 0) + 1 }), {});
        let maxDesc = 0;
        let lotDesc = "";
        Object.entries(descCntList).map(([key, value]) => {
          lotDesc = value > maxDesc ? key : lotDesc;
        });
        allDays.push({
          date: date,
          temp: thisTemp,
          description: lotDesc
        });
        tempTotal = 0;
        desc = [];
        cnt = 0;
      }
      date = thisDate;
      tempTotal += weatherList[i].main.temp;
      desc.push(weatherList[i].weather[0].main);
      cnt++;      
    }
    setDays(allDays);
  };
  
  useEffect(() => {
    getWeather();
  }, []);
  
  return (
    <View style={ styles.container }>
      <View style={ styles.city }>
        <Text style={ styles.cityName }>{city}</Text>
      </View>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={ false } contentContainerStyle={ styles.weather }>
        {days.length === 0
          ? (
            <View style={styles.day}>
              <ActivityIndicator style={{marginTop: 10}} color="white" size="large" />
            </View>
          )
          : (
            days.map((day, index) => (
              <View key={index} style={ styles.day }>
                <View style={ styles.dayInfoContainer }>
                  <Text style={ styles.temp }>{ day.temp }</Text>
                  <Fontisto name={ icons[day.description] } size={68} color="white" style={{marginLeft: 15}} />
                </View>
                <Text style={ styles.description }>{ day.description }</Text>
              </View>
            ))
          )
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange"
  },
  city:{
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center"    
  },
  cityName: {
    color: "black",
    fontSize: 68,
    fontWeight: "500"
  },
  weather: {
  },
  day: {
    width:SCREEN_WIDTH,
    alignItems: "center"
  },
  dayInfoContainer: {
    flexDirection: "row",
    alignItems:"center",
    justifyContent:"center",
    width: "100%"
  },
  temp:{
    marginTop: 50,
    fontSize: 150
  },
  description: {
    marginTop: -30,
    fontSize: 60
  }
});