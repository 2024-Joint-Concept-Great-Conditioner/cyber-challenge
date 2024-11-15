import React, { useState } from "react";
import { getEvents } from "./events";
import { PieChart } from "@mui/x-charts/PieChart";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Gauge } from "@mui/x-charts/Gauge";
import { BarChart } from "@mui/x-charts/BarChart";

async function getChartData() {
  let events = await getEvents();
  let severities = events.map((event) => event.severity);
  let criticals = severities.filter((severity) => severity == "critical");
  let highs = severities.filter((severity) => severity == "high");
  let mediums = severities.filter((severity) => severity == "medium");
  let lows = severities.filter((severity) => severity == "low");

  return [
    { value: criticals.length, label: "Critical", color: "red" },
    { value: highs.length, label: "High", color: "#FAC898" },
    { value: mediums.length, label: "Medium", color: "#FFFAA0" },
    { value: lows.length, label: "Low", color: "green" },
  ];
}

async function incidentsPerDay() {
  let events = await getEvents();
  let days = {};

  events.forEach((event) => {
    const date = new Date(event.timestamp * 1000);
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Month is 0-indexed
    const day = ("0" + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const dateString = `${month}/${day}/${year}`;

    if (days.hasOwnProperty(dateString)) {
      days[dateString] += 1;
    } else {
      days[dateString] = 1;
    }
  });

  const dates = Object.keys(days).sort();
  const incidents = [];
  dates.forEach((date) => {
    incidents.push(days[date]);
  });

  return [dates, incidents];
}

async function reviewEvents() {
  let events = await getEvents();
  let reviewedEvents = events.filter((event) => event.status != "Open");
  return [reviewedEvents.length, events.length];
}

export default function Charts() {
  const [severity, setSeverity] = useState([]);
  const [datesInfo, setDatesInfo] = useState([[], []]);
  const [reviewedEvents, setReviewedEvents] = useState([0, 0]);

  (async function () {
    setSeverity(await getChartData());
    setDatesInfo(await incidentsPerDay());
    setReviewedEvents(await reviewEvents());
  })();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        marginTop: "15em",
      }}
    >
      <div
        style={{
          flex: "1 1 33%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography style={{ paddingRight: "6em" }}>
          Severity Reports
        </Typography>
        <PieChart series={[{ data: severity }]} width={400} height={200} />
      </div>
      <div
        style={{
          flex: "1 1 33%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography>Reviewed Events</Typography>
        <Gauge
          width={100}
          height={100}
          value={reviewedEvents[0]}
          valueMin={0}
          valueMax={reviewedEvents[1]}
        />
      </div>
      <div
        style={{
          flex: "1 1 33%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography>Incident Trends</Typography>
        <BarChart
          xAxis={[{ scaleType: "band", data: datesInfo[0] }]}
          series={[{ data: datesInfo[1] }]}
          width={500}
          height={300}
        />
      </div>
    </div>
  );
}
