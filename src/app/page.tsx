"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import InputComponent, {
  CityDataType,
} from "./components/InputComponent/InputComponent";
import { Poppins } from "next/font/google";
import DashboardComponent from "./components/DashboardComponent/dashboard";
import { NearMeOutlined } from "@mui/icons-material";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [latitude, setLatitude] = useState<null | number>(null);
  const [longitude, setLongitude] = useState<null | number>(null);
  const [error, setError] = useState<null | string>(null);
  const [value, setValue] = useState<string>("");

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => {
        setError("Not able to get current location");
      }
    );
  };

  return (
    <main className={`${styles.main} ${poppins.className}`}>
      <div className={styles.headerComponent}>
        <div className={styles.headerSection}>
          <InputComponent value={value} setValue={setValue} />
          <button className={`${styles.button} ${poppins.className}`} onClick={getCurrentLocation}>
            <NearMeOutlined sx={{
              fontSize: "16px",
            }}/> <h4 className={styles.buttonText}>Current location</h4>
          </button>
        </div>
        <h4 className={styles.buttonText2}>Weather App</h4>
      </div>
      <div className={styles.sectionComponent}>
        <DashboardComponent
          coordinates={
            value.length > 0
              ? value
              : latitude && longitude
              ? `${latitude} ${longitude}`
              : ""
          }
        />
      </div>
    </main>
  );
}
