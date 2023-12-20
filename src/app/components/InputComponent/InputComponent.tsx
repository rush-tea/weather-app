import TextField from "@mui/material/TextField";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { useState, Fragment, MouseEvent } from "react";
import { fetchCities } from "@/app/utils/requests";
import styles from "./InputComponent.module.css";
import Box from "@mui/material/Box";
import styled from "@emotion/styled";
import { ClickAwayListener, InputBase } from "@mui/material";
import { AsyncPaginate } from "react-select-async-paginate";

export interface CityDataType {
  city: string;
  country: string;
  countryCode: string;
  distance: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  placeType: string;
  population: number;
  region: string;
  regionCode: string;
  regionWdId: string;
  type: string;
  wikiDataId: string;
}

interface InputComponentProps {
  value: string;
  setValue: (value: string) => void;
}

export const InputComponent = ({ value, setValue }: InputComponentProps) => {
  const [searchValue, setSearchValue] = useState<
    string | { label: string; value: string }
  >("");

  const loadOptions = async (inputValue: string) => {
    const citiesList = await fetchCities(inputValue);

    return {
      options: citiesList.data.map(
        (city: {
          latitude: number;
          longitude: number;
          name: string;
          countryCode: string;
        }) => {
          return {
            value: `${city.latitude} ${city.longitude}`,
            label: `${city.name}, ${city.countryCode}`,
          };
        }
      ),
    };
  };

  const onChangeHandler = (
    enteredData: { label: string; value: string } | string | null
  ) => {
    if (enteredData) {
      if (typeof enteredData === "string") {
        setSearchValue(enteredData);
      } else {
        console.log(enteredData);
        setSearchValue(enteredData);
        setValue(enteredData.value);
      }
    }
  };

  return (
    <div className={styles.inputComponentContainer}>
      <AsyncPaginate
        placeholder="Search for cities"
        debounceTimeout={600}
        value={searchValue}
        onChange={onChangeHandler}
        loadOptions={loadOptions}
        className={styles.inputComponent}
      />
    </div>
  );
};

export default InputComponent;
