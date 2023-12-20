"use client";
import React from "react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Poppins } from "next/font/google";
import { NearMeOutlined } from "@mui/icons-material";
import InputComponent from "./components/InputComponent/InputComponent";
import DashboardComponent from "./components/DashboardComponent/DashboardComponent";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localStorageValue = localStorage.getItem("weatherValue");
      if (localStorageValue) {
        setValue(localStorageValue);
      }
    }
  }, []);

  const getCurrentLocation = () => {
    if (typeof window !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue(`${position.coords.latitude} ${position.coords.longitude}`);
          localStorage.setItem(
            "weatherValue",
            `${position.coords.latitude} ${position.coords.longitude}`
          );
        },
        () => {
        }
      );
    }
  };

  const handleInputChange = (newValue: string) => {
    if (typeof window !== "undefined") {
      setValue(newValue);
      localStorage.setItem("weatherValue", newValue);
    }
  };

  return (
    <main className={`${styles.main} ${poppins.className}`}>
      <div className={styles.headerComponent}>
        <div className={styles.headerSection}>
          <InputComponent value={value} setValue={handleInputChange} />
          <button
            className={`${styles.button} ${poppins.className}`}
            onClick={getCurrentLocation}
          >
            <NearMeOutlined
              sx={{
                fontSize: "16px",
              }}
            />{" "}
            <h4 className={styles.buttonText}>Current location</h4>
          </button>
        </div>
        <h4 className={styles.buttonText2}>Weather App</h4>
      </div>
      <div className={styles.sectionComponent}>
        <DashboardComponent coordinates={value} />
      </div>
    </main>
  );
}

