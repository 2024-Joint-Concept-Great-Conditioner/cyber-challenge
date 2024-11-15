import React, { useState, createContext, useContext, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import NativeSelect from "@mui/material/NativeSelect";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { BackendUrl } from "./config";

export async function getEvents() {
  const resp = await axios.get(`${BackendUrl}/events`);
  return resp.data;
}

function formatTimestamp(timestamp) {
  const date = new Date();
  date.setTime(timestamp * 1000);
  return date.toUTCString();
}

function sortEvents(events, sorter) {
  return events.sort((event1, event2) => {
    let key1;
    let key2;

    switch (sorter) {
      case "time":
        key1 = formatTimestamp(event1.timestamp);
        key2 = formatTimestamp(event2.timestamp);
        break;
      case "summary":
        key1 = event1.summary;
        key2 = event2.summary;
        break;
      case "fix":
        key1 = event1.fix;
        key2 = event2.fix;
        break;
      case "event":
        key1 = event1.event_type;
        key2 = event2.event_type;
        break;
      case "severity":
        key1 = event1.severity;
        key2 = event2.severity;
        break;
      case "status":
        key1 = event1.status;
        key2 = event2.status;
        break;
      default:
        throw Error(`Invalid sorter: ${sorter}`);
    }

    const lowerKey1 = key1.toLowerCase();
    const lowerKey2 = key2.toLowerCase();

    if (lowerKey1 < lowerKey2) {
      return -1;
    } else if (lowerKey1 > lowerKey2) {
      return 1;
    } else {
      return 1;
    }
  });
}

async function handleStatus(id, status) {
  await axios.post(`${BackendUrl}/status/${id}/${status}`);
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [sorter, setSorter] = useState("time");
  (async function () {
    setEvents(await getEvents());
  })();

  let data = (
    <TableContainer component={Paper} sx={{ maxHeight: "50em" }}>
      <Table
        stickyHeader
        sx={{ minWidth: 650, tableLayout: "fixed", overflowWrap: "anywhere" }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              onClick={() => setSorter("time")}
              style={{ opacity: sorter == "time" ? "100%" : "50%" }}
            >
              Time
            </TableCell>
            <TableCell
              align="center"
              onClick={() => setSorter("summary")}
              style={{ opacity: sorter == "summary" ? "100%" : "50%" }}
            >
              Summary
            </TableCell>
            <TableCell
              align="center"
              onClick={() => setSorter("fix")}
              style={{ opacity: sorter == "fix" ? "100%" : "50%" }}
            >
              Fix
            </TableCell>
            <TableCell
              align="center"
              onClick={() => setSorter("event")}
              style={{ opacity: sorter == "event" ? "100%" : "50%" }}
            >
              Event Type
            </TableCell>
            <TableCell
              align="center"
              onClick={() => setSorter("severity")}
              style={{ opacity: sorter == "severity" ? "100%" : "50%" }}
            >
              Severity
            </TableCell>
            <TableCell
              align="center"
              onClick={() => setSorter("status")}
              style={{ opacity: sorter == "status" ? "100%" : "50%" }}
            >
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortEvents(events, sorter).map((event) => (
            <TableRow>
              <TableCell align="center">
                {formatTimestamp(event.timestamp)}
              </TableCell>
              <TableCell key={event.summary} align="center">
                {event.summary}
              </TableCell>
              <TableCell key={event.fix} align="center">
                {event.fix}
              </TableCell>
              <TableCell key={event.event_type} align="center">
                {event.event_type}
              </TableCell>
              <TableCell key={event.severity} align="center">
                {event.severity}
              </TableCell>
              <TableCell key={event.status} align="center">
                <FormControl>
                  <NativeSelect
                    defaultValue={event.status}
                    onChange={(select) =>
                      handleStatus(event.id, select.target.value)
                    }
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Ignored">Ignored</option>
                    <option value="Escalated">Escalated</option>
                  </NativeSelect>
                </FormControl>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  return data;
}
