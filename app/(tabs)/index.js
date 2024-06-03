import React, { useState, useEffect } from "react";
import {
  Button,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  TouchableHighlight,
} from "react-native";
import * as Location from "expo-location";
import LottieView from "lottie-react-native";
import NetInfo, { refresh } from "@react-native-community/netinfo";
import { isDayTime } from "@/utils/GeneralUtils";

const WEATHER_CONDITIONS = {
  200: "thunderstorm",
  300: "drizzle",
  500: "rain",
  600: "snow",
  700: "atmosphere",
  800: "clouds",
};

import Day from "@/assets/images/daylight_clouds_background_0.jpeg";
import Night from "@/assets/images/night_clouds_background_0.jpeg";
import DayClouds from "@/assets/lottie/clouds.json";
import NightClouds from "@/assets/lottie/night_clouds.json";

export default function HomeScreen() {
  const [generalWeather, setGeneralWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [text, onChangeText] = React.useState("");

  useEffect(() => {
    try {
      NetInfo.fetch().then((state) => {
        if (
          state.isWifiEnabled &&
          state.isInternetReachable &&
          state.isConnected
        ) {
          fetchLocation();
        } else {
          setErrorMsg("Opsss, parece que no tienes internet en estos momentos");
        }
      });
    } catch (error) {
      setErrorMsg(error)
      setIsLoading(false);
    }
  }, []);

  const fetchLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Se ha negado el permiso a usar tu ubicación");
      setIsLoading(false)
      return;
    }
    let locationA = await Location.getCurrentPositionAsync({});
    //let address = await Location.reverseGeocodeAsync(locationA.coords);
    const fetchAPI = await fetch(
      `${process.env.EXPO_PUBLIC_WEATHER_API_BASE_URL}?lat=${locationA.coords.latitude}&lon=${locationA.coords.longitude}&appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&units=metric&lang=es`
    );
    const resAPI = await fetchAPI.json();
    setGeneralWeather(resAPI);
    setIsLoading(false);
  };

  const fetchWeatherByCityName = async () => {
    try {
      const fetchAPI = await fetch(
        `${process.env.EXPO_PUBLIC_WEATHER_API_BASE_URL}?q=${text}&appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&units=metric&lang=es`
      );
      const resAPI = await fetchAPI.json();
      console.log(resAPI);
      if (resAPI && resAPI.cod && resAPI.cod === "404") {
        setIsLoading(false);
        setErrorMsg("Ciudad no encontrada, intenta otro nombre u otro idioma");
        return;
      }
      setGeneralWeather(resAPI);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isLoading}
          onRequestClose={() => {}}
        >
          <View style={styles.centeredView}>
            <ActivityIndicator
              size={Platform.OS === "android" ? 150 : "large"}
            />
          </View>
        </Modal>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centeredView}>
        <Text
          style={{
            marginBottom: 20,
          }}
        >
          {errorMsg}
        </Text>
        <Button
          title={"Buscar nueva ciudad"}
          onPress={() => {
            setErrorMsg(null);
            setIsSearchOpen(true);
          }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={isDayTime( generalWeather?.timezone ) ? Day : Night}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <TouchableOpacity
          onPress={() => {
            fetchLocation();
          }}
          style={styles.refreshButton}
        >
          <Image
            style={styles.refreshIcon}
            source={require("@/assets/images/refresh_icon.png")}
          />
        </TouchableOpacity>
        <View style={styles.mainContainer}>
          <View>
            <TouchableOpacity
              style={{
                width: "60%",
              }}
              onPress={() => setIsSearchOpen(true)}
            >
              <Text
                style={{
                  fontSize: 38,
                  color: "white",
                }}
              >
                {generalWeather && generalWeather.name}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 20,
                color: "white",
              }}
            >
              {new Date().toLocaleDateString()}
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "50%",
            }}
          >
            <LottieView
              autoPlay
              loop
              style={styles.animationSquare}
              source={
                isDayTime( generalWeather?.timezone) ? DayClouds : NightClouds
              }
            />

            <View style={styles.detailsView}>
              <Text
                style={{
                  fontSize: 55,
                  color: "white",
                }}
              >
                {generalWeather && generalWeather?.main.temp + String.fromCharCode(176) }
              </Text>

              <Text
                style={{
                  fontSize: 30,
                  color: "white",
                }}
              >
                {generalWeather && generalWeather?.weather[0].description}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <Modal
        animationType="slide"
        visible={isSearchOpen}
        style={{ backgroundColor: "blue" }}
      >
        <View style={styles.searchView}>
          <Text
            style={{
              width: 300,
              textAlign: "center",
            }}
          >
            Escribe alguna ciudad famosa que desees conocer su clima actual
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => onChangeText(text.trim())}
            value={text}
            placeholder="Ingresa ciudad a buscar"
            onEndEditing={() => {
              setIsSearchOpen(false);
              setIsLoading(true);
              fetchWeatherByCityName();
            }}
          />
          <TouchableHighlight
            style={styles.searchButton}
            onPress={() => {
              setIsSearchOpen(false);
              setIsLoading(true);
              fetchWeatherByCityName();
            }}
          >
            <Text style={styles.buttonText}>Buscar</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.cancelButton}
            onPress={() => {
              setErrorMsg(null);
              setIsSearchOpen(false);
            }}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableHighlight>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "transparent",
    padding: 20,
    marginTop: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ECF0F1",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  searchView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    alignContent: "center",
    gap: 15,
  },
  input: {
    width: 300,
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  cancelButton: {
    width: 300,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink",
  },
  searchButton: {
    width: 300,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightblue",
  },
  buttonText: {
    fontSize: 25,
  },
  imageBackground: {
    flex: 1,
  },
  refreshButton: {
    left: Dimensions.get("screen").width - 40,
    top: 10,
    width: 30,
    height: 30,
  },
  animationSquare: {
    width: "50%",
    height: "100%",
  },
  detailsView: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
  },
  refreshIcon: {
    width: 30,
    height: 30,
  },
});
