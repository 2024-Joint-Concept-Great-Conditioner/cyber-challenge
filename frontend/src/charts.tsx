import React, { useState } from "react";
import { getEvents } from "./events";
import { PieChart } from '@mui/x-charts/PieChart';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

async function getChartData() {
	let events = await getEvents();
	let severities = events.map(event => event.severity);
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

export default function Charts() {
  const [data, setData] = useState([]);
  
  (async function() {
	  setData(await getChartData());
  })();

  return (
    <Stack direction="row" spacing={2} style={{ marginTop: "5em" }}>
      <Box>
    <PieChart
      series={[{ data: data }]}
      width={400}
      height={200}
    />
    </Box>
    </Stack>
  );
}
