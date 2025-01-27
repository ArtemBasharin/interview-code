import React, { useState } from "react";
import store from "./store/store";
import { observer } from "mobx-react-lite";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { grey } from "@mui/material/colors";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  Slider,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  InfoOutlined,
  LocalFireDepartmentOutlined,
} from "@mui/icons-material";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import RouteIcon from "@mui/icons-material/Route";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LandscapeTwoToneIcon from "@mui/icons-material/LandscapeTwoTone";

import {
  calculateCalories,
  cutLongName,
  formatTime,
  getSpeed,
} from "./config/functions";

import ElevationChart from "./ElevationChart";

export const Filters: React.FC = observer(() => {
  const props = {
    marginRight: "3px",
    marginBottom: "3px",
    fontSize: "13px",
  };
  const getTrack_kindIcon = (track_id: string) => {
    const track_kind: string | undefined = store.tracks.find(
      (track) => track.track_id === track_id
    ).track_kind;

    switch (track_kind) {
      case "cycle":
        return <DirectionsBikeIcon sx={props} />;
      case "auto":
        return <DriveEtaIcon sx={props} />;
      case "hiking":
        return <DirectionsWalkIcon sx={props} />;
      default:
        return <RouteIcon sx={props} />;
    }
  };

  const toggleDrawer = () => {
    store.toggleFiltersDrawer();
  };

  const handleChangeKind = (
    kind: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    store.updateCategory(kind, event.target.checked);
  };

  const handleChangeAllKinds = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    [...store.filters.category.keys()].forEach((key) => {
      store.updateCategory(key, isChecked);
    });
  };

  ///////////////for smooth sliders motion///////////
  const initialLength: number[] = [
    store.filters.lengthRange.from ?? 0,
    store.filters.lengthRange.to ?? 100,
  ];
  const [length, setLength] = useState<number[]>(initialLength);

  const initialElevation: number[] = [
    store.filters.elevationRange.from ?? 0,
    store.filters.elevationRange.to ?? 10000,
  ];
  const [elevation, setElevation] = useState<number[]>(initialElevation);

  const initialDuration: number[] = [
    store.filters.durationRange.from ?? 0,
    store.filters.durationRange.to ?? 60,
  ];
  const [duration, setDuration] = useState<number[]>(initialDuration);
  ////////////////////////////////////////////////////

  const [minDistance, maxDistance] = initialLength;
  const [minElevation, maxElevation] = initialElevation;
  const [minDuration, maxDuration] = initialDuration;

  function valuetext(value: number) {
    return `${value} км`;
  }

  const handleChangeSliderDistance = (
    _: Event | React.SyntheticEvent<Element>,
    newValue: number | number[],
    activeThumb?: number
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], maxDistance - minDistance);
        store.updateLength("to", clamped + minDistance);
        store.updateLength("from", clamped);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        store.updateLength("from", clamped - minDistance);
        store.updateLength("to", clamped);
      }
    } else {
      store.updateLength("from", newValue[0]);
      store.updateLength("to", newValue[1]);
    }
  };

  const handleChangeSliderDistanceLive = (
    _: Event | React.SyntheticEvent<Element>,
    newValue: number | number[]
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    setLength(newValue);
  };

  const handleChangeSliderElevationLive = (
    _: Event | React.SyntheticEvent<Element>,
    newValue: number | number[]
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    setElevation(newValue);
  };

  const handleChangeSliderElevation = (
    _: Event | React.SyntheticEvent<Element>,
    newValue: number | number[],
    activeThumb?: number
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], maxElevation - minElevation);
        store.updateElevation("to", clamped + minElevation);
        store.updateElevation("from", clamped);
      } else {
        const clamped = Math.max(newValue[1], minElevation);
        store.updateElevation("from", clamped - minElevation);
        store.updateElevation("to", clamped);
      }
    } else {
      store.updateElevation("from", newValue[0]);
      store.updateElevation("to", newValue[1]);
    }
  };

  const handleChangeSliderDurationLive = (
    _: Event | React.SyntheticEvent<Element>,
    newValue: number | number[]
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    setDuration(newValue);
  };

  const handleChangeSliderDuration = (
    _: Event | React.SyntheticEvent<Element>,
    newValue: number | number[],
    activeThumb?: number
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    if (newValue[1] - newValue[0] < minDuration) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], maxDuration - minDuration);
        store.updateDuration("to", clamped + minDuration);
        store.updateDuration("from", clamped);
      } else {
        const clamped = Math.max(newValue[1], minDuration);
        store.updateDuration("from", clamped - minDuration);
        store.updateDuration("to", clamped);
      }
    } else {
      store.updateDuration("from", newValue[0]);
      store.updateDuration("to", newValue[1]);
    }
  };

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const trackList = Array.from(store.displayedTracks).map((track, index) => {
    const onClickHandler = () => {
      store.showTrackDialog(track);
      // @ts-expect-error CustomGPX interface extends L.GPX not correctly //todo
      store.fitMapScale([track.getBounds()]);
      if (store.isMobile) toggleDrawer();
    };

    const iconProps = { fontSize: "14px", ml: "4px", mb: "3px" };

    return (
      <ListItem disablePadding disableGutters key={`tracklistKey${index}`}>
        <Accordion
          disableGutters
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{
            width: "100%",
            backgroundColor: `${index % 2 && index ? "#FFF" : "#EAEAEA"}`,
          }}
        >
          <AccordionSummary expandIcon={<ArrowDownwardIcon />}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "flex-start",
                m: 0,
              }}
            >
              <InfoOutlined onClick={() => onClickHandler()} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "start",
                  flexDirection: "column",
                  justifyContent: "center",

                  m: 0,
                  ml: 1,
                }}
              >
                <Typography
                  variant='caption'
                  component='div'
                  sx={{
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  {getTrack_kindIcon(track.track_id)}
                  {`${cutLongName(track.track_name, 35)}`}
                </Typography>

                <Typography
                  variant='subtitle2'
                  component='div'
                  sx={{
                    fontSize: "11px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <RouteIcon sx={{ ...iconProps, ml: 0 }} />
                  {`${Math.round(track._info.length / 1000)} км, `}
                  <LandscapeTwoToneIcon sx={iconProps} />
                  {
                    // @ts-expect-error CustomGPX interface extends L.GPX not correctly //todo
                    ` ${Math.round(track.get_elevation_gain())} м,`
                  }
                  <HourglassTopIcon sx={iconProps} />
                  {formatTime(
                    track._info.duration.total === 0
                      ? track._info.length / getSpeed(track.track_kind)
                      : track._info.duration.total / 1000
                  )}

                  {track.track_kind != "auto" && (
                    <LocalFireDepartmentOutlined sx={iconProps} />
                  )}
                  {track.track_kind != "auto" &&
                    `>${calculateCalories(track, 70)} ккал`}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: `${index % 2 && index ? "#FFF" : "#EAEAEA"}`,
            }}
          >
            <ElevationChart
              points={track._info.elevation._points as number[][]}
            />
          </AccordionDetails>
        </Accordion>
      </ListItem>
    );
  });

  return (
    <Drawer
      open={store.isFiltersVisible}
      onClose={toggleDrawer}
      sx={{ marginTop: 15 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Accordion
          disableGutters
          sx={{
            width: store.isMobile ? "100%" : 400,
            maxWidth: window.innerWidth,
          }}
        >
          <AccordionSummary
            expandIcon={
              <Box
                sx={{
                  width: store.isMobile ? "100%" : 400,
                  height: "16px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <ArrowDownwardIcon />
              </Box>
            }
            aria-controls='panel1-content'
            id='panel1-header'
            sx={{ height: "16px" }}
          >
            <Box
              sx={{
                display: "flex",
                height: "40px",
                justifyContent: "center",
                alignItems: "center",
                justifySelf: "center",
                width: "100%",
              }}
            >
              <IconButton
                aria-label='close'
                onClick={toggleDrawer}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: "5px",
                }}
              >
                <ArrowBack
                  sx={{ height: "30px", color: grey[600], zIndex: 20 }}
                />
              </IconButton>
              <Typography component='span' sx={{ ml: "25px" }}>
                Фильтры
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Box sx={{ flex: "0 0 auto", overflow: "hidden" }}>
              <Box
                sx={{ width: 400, maxWidth: window.innerWidth }}
                role='application'
              >
                <Box sx={{ m: 2, mt: 0, mb: 0 }}>
                  <FormControlLabel
                    label='Типы маршрутов'
                    control={
                      <Checkbox
                        checked={Array.from(
                          store.filters.category.values()
                        ).some((value) => value === true)}
                        indeterminate={
                          Array.from(store.filters.category.values()).some(
                            (value) => value === true
                          ) &&
                          Array.from(store.filters.category.values()).some(
                            (value) => value === false
                          )
                        }
                        onChange={handleChangeAllKinds}
                      />
                    }
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      ml: 3,
                      mt: 0,
                      mb: 0,
                    }}
                  >
                    <FormControlLabel
                      label='Автомобильные'
                      control={
                        <Checkbox
                          checked={store.filters.category.get("auto")}
                          onChange={(e) => handleChangeKind("auto", e)}
                        />
                      }
                    />
                    <FormControlLabel
                      label='Велосипедные'
                      control={
                        <Checkbox
                          checked={store.filters.category.get("cycle")}
                          onChange={(e) => handleChangeKind("cycle", e)}
                        />
                      }
                    />
                    <FormControlLabel
                      label='Пешие'
                      control={
                        <Checkbox
                          checked={store.filters.category.get("hiking")}
                          onChange={(e) => handleChangeKind("hiking", e)}
                        />
                      }
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    ml: 4,
                    mr: 6,
                    mt: 1,
                    mb: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <Typography variant='body1' gutterBottom sx={{ mb: 4 }}>
                    Протяженность, км
                  </Typography>
                  <Slider
                    getAriaLabel={() => "Minimum distance shift"}
                    value={length}
                    onChange={handleChangeSliderDistanceLive}
                    onChangeCommitted={handleChangeSliderDistance}
                    valueLabelDisplay='on'
                    getAriaValueText={valuetext}
                    disableSwap
                    min={initialLength[0]}
                    max={initialLength[1]}
                  />
                </Box>

                <Divider sx={{ color: grey[500] }} />

                <Box
                  sx={{
                    ml: 4,
                    mr: 6,
                    mt: 1,
                    mb: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <Typography variant='body1' gutterBottom sx={{ mb: 4 }}>
                    Набор высоты, м
                  </Typography>
                  <Slider
                    getAriaLabel={() => "Minimum distance shift"}
                    value={elevation}
                    onChange={handleChangeSliderElevationLive}
                    onChangeCommitted={handleChangeSliderElevation}
                    valueLabelDisplay='on'
                    getAriaValueText={valuetext}
                    disableSwap
                    min={initialElevation[0]}
                    max={initialElevation[1]}
                  />
                </Box>

                <Divider sx={{ color: grey[500] }} />

                <Box
                  sx={{
                    ml: 4,
                    mr: 6,
                    mt: 1,
                    mb: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                  }}
                >
                  <Typography variant='body1' gutterBottom sx={{ mb: 4 }}>
                    Время прохождения, ч
                  </Typography>
                  <Slider
                    getAriaLabel={() => "Minimum distance shift"}
                    value={duration}
                    onChange={handleChangeSliderDurationLive}
                    onChangeCommitted={handleChangeSliderDuration}
                    valueLabelDisplay='on'
                    getAriaValueText={valuetext}
                    disableSwap
                    min={initialDuration[0]}
                    max={initialDuration[1]}
                  />
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ color: grey[500] }} />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            width: "100%",
            maxWidth: 450,
            bgcolor: "background.paper",
          }}
        >
          <List disablePadding>{trackList}</List>
        </Box>
      </Box>
    </Drawer>
  );
});
