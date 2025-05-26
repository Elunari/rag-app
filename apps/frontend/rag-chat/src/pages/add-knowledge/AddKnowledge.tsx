import { useState, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import { uploadKnowledge } from "../../services/api";

export const AddKnowledge = () => {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      await uploadKnowledge(file);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: theme.palette.background.paper,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
        }}
      >
        <DescriptionIcon
          sx={{
            fontSize: 48,
            color: theme.palette.primary.main,
            mb: 3,
          }}
        />

        <Typography variant="h5" component="h1" gutterBottom>
          Add Knowledge
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: "center" }}
        >
          Upload a PDF file to add to your knowledge base
        </Typography>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: "text.primary",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  background: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              Choose PDF File
            </Button>
          </label>

          {file && (
            <Typography variant="body2" color="text.secondary">
              Selected file: {file.name}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || isUploading}
            sx={{
              mt: 2,
              minWidth: 200,
              background: theme.palette.primary.main,
              "&:hover": {
                background: theme.palette.primary.dark,
              },
              "&.Mui-disabled": {
                background: "rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            {isUploading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Upload"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
