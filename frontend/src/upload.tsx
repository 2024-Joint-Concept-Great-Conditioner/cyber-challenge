import React, { createContext, useState, useContext } from "react";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { BackendUrl } from "./config";
import axios from "axios";

const FileInput = styled("input")({
  display: "none",
});
const uploadedContext = createContext(false);
const uploadMsgContext = createContext("Upload logs");

export default function Upload() {
  const [uploaded, setUploaded] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("Upload logs");

  function handleFileUpload(event) {
    setUploaded(true);
    setUploadMsg("Uploading logs...");

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async function () {
      const resp = await axios.post(`${BackendUrl}/aws-logs`, reader.result);
      const jobId = resp.data.id;

      while (true) {
        const resp = await axios.get(`${BackendUrl}/aws-logs/${jobId}`);
        const currentStatus = resp.data.current_status;
        setUploadMsg(`Processing logs (${currentStatus}%)...`);

        if (currentStatus == 100) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setUploaded(false);
          setUploadMsg("Upload logs");
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <Button
      component="label"
      variant="contained"
      style={{ width: "100%", padding: "2em" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {!uploaded && <FileInput type="file" onChange={handleFileUpload} />}
        {!uploaded && <CloudUploadIcon sx={{ fontSize: "2em" }} />}
        {uploaded && <CircularProgress color="secondary" size="2em" />}
        <p>{uploadMsg}</p>
      </div>
    </Button>
  );
}
