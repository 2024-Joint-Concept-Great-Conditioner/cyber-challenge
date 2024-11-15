import React, { useState, createContext, useContext, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { BackendUrl } from "./config";

async function getEvents() {
  const resp = await axios.get(`${BackendUrl}/events`);
  return resp.data;
}

function formatTimestamp(timestamp) {
  const date = new Date();
  date.setTime(timestamp * 1000);
  return date.toUTCString();
}

export default function Events() {
  const [events, setEvents] = useState([]);
  (async function () {
    setEvents(await getEvents());
  })();

  let data = (
    <TableContainer component={Paper} sx={{ maxHeight: "50em" }}>
      <Table stickyHeader sx={{ minWidth: 650, tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell align="center">Time</TableCell>
            <TableCell align="center">Summary</TableCell>
            <TableCell align="center">Fix</TableCell>
            <TableCell align="center">Event Type</TableCell>
            <TableCell align="center">Severity</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow>
              <TableCell align="center">
                {formatTimestamp(event.timestamp)}
              </TableCell>
              <TableCell align="center">{event.summary}</TableCell>
              <TableCell align="center">{event.fix}</TableCell>
              <TableCell align="center">{event.event_type}</TableCell>
              <TableCell align="center">{event.severity}</TableCell>
              <TableCell align="center">{event.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  return data;
}
